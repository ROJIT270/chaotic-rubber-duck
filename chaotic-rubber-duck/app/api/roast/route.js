import { NextResponse } from "next/server";

/**
 * Module-level cache for selected model id to avoid listing models on every request.
 * This reduces one network call per request when OPENROUTER_MODEL is not set.
 */
let cachedModelId = process.env.OPENROUTER_MODEL || null;
let lastModelPick = 0;

async function pickFreeModel(apiKey) {
  // fallback if you didn't set OPENROUTER_MODEL — but we prefer explicit env var.
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Failed to list models:", json);
    throw new Error("Could not list OpenRouter models");
  }
  const candidates = (json.data || []).filter(Boolean);
  let m = candidates.find((c) => typeof c.id === "string" && c.id.includes(":free"));
  if (!m) m = candidates.find((c) => c.pricing && (String(c.pricing.request) === "0" || String(c.pricing.completion) === "0"));
  if (!m) m = candidates[0];
  if (!m || !m.id) throw new Error("No usable model found from OpenRouter");
  console.log("PickFreeModel selected:", m.id);
  return m.id;
}

async function getModelId(apiKey) {
  // If env var is set or we have a cached choice, reuse it.
  if (cachedModelId) return cachedModelId;
  const now = Date.now();
  // Avoid re-picking too frequently (cache for 60s)
  if (cachedModelId && now - lastModelPick < 60_000) return cachedModelId;
  cachedModelId = await pickFreeModel(apiKey);
  lastModelPick = Date.now();
  return cachedModelId;
}

export async function POST(req) {
  try {
    const { code, persona } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server: OPENROUTER_API_KEY missing" }, { status: 500 });
    }

    const prompts = {
      genz:
        "You are a Gen-Z coding mentor rubber duck. Roast code using Gen-Z slang like 'mid', 'bussin', 'no cap', 'fr fr', 'it's giving...', 'slay', 'ate', 'sigma', 'rizz'. Be playfully brutal but helpful. After roasting, provide a 'Vibe-Fix' with corrected code wrapped in ```language blocks.",
      aggressive:
        "You are an aggressive motivational coding mentor rubber duck. Roast code like a drill sergeant mixed with a gym bro. Use phrases like 'WEAK CODE', 'DO YOU EVEN CODE BRO?', 'NO EXCUSES', 'PUSH HARDER'. Be intense but motivating. After roasting, provide a 'Vibe-Fix' with corrected code wrapped in ```language blocks.",
      brainrot:
        "You are a terminally online rubber duck mentor drowning in brain rot. Reference memes, Skibidi toilet, Sigma grindset, Ohio jokes, 'only in Ohio', 'bros cooked', gigachad energy, and internet culture. Be chaotically funny. After roasting, provide a 'Vibe-Fix' with corrected code wrapped in ```language blocks.",
      // New: YogiBaba advice persona — calm, poetic, uses occasional Hindi phrases, ends with actionable steps.
      yogibaba:
        "You are YogiBaba — an ancient, wise Indian jogi baba who speaks gently and poetically. When given a question about programming, learning, debugging, or career advice, reply like a patient teacher: use calm, metaphor-rich language and occasional Hindi words (e.g., 'beta', 'suno', 'dhyaan', 'atma'), but always include clear, actionable guidance. Offer step-by-step instructions, short code snippets when helpful, and concrete next actions the user can take. Be respectful, concise, and prioritize teaching and clarity over jokes. Do not roast — give wisdom and practical advice.",
    };

    const systemPrompt = prompts[persona] || prompts.genz;

    // Get model id (use env var or cached selection)
    const modelId = await getModelId(apiKey);
    console.log("Using model:", modelId);

    const payload = {
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${code}` },
      ],
      // you can add max_tokens here if you want
      // max_tokens: 1000
    };

    // Add a 20s timeout to prevent hanging on slow external requests
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).catch((err) => {
      if (err.name === "AbortError") {
        return null;
      }
      throw err;
    });

    clearTimeout(timeout);

    if (!res) {
      return NextResponse.json({ error: "OpenRouter request timed out" }, { status: 504 });
    }

    const data = await res.json();
    if (!res.ok) {
      console.error("OpenRouter returned error:", res.status, data);
      return NextResponse.json({ error: "OpenRouter API error", details: data }, { status: res.status });
    }

    const aiText = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text ?? JSON.stringify(data);
    return NextResponse.json({ aiText });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json({ error: "Server error", message: err.message }, { status: 500 });
  }
}