'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Code, Sparkles, RotateCcw, Volume2, VolumeX } from 'lucide-react';

export default function ChaoticRubberDuck() {
  // input for roast (code) and separate input for advice queries
  const [code, setCode] = useState('// Paste your code here...\n\nfunction example() {\n  var x = 1;\n  var y = 2;\n  return x + y;\n}');
  const [adviceInput, setAdviceInput] = useState(''); // blank by default for advice mode

  // messages stored per-persona so each persona/advisor has its own chat log
  const [messagesByPersona, setMessagesByPersona] = useState({
    genz: [],
    aggressive: [],
    brainrot: [],
    yogibaba: [],
  });

  const [loading, setLoading] = useState(false);

  // mode: 'roast' (default) or 'advice'
  const [mode, setMode] = useState('roast');

  // persona for roast flavors; advice mode forces yogibaba
  const [persona, setPersona] = useState('genz');
  const currentPersona = mode === 'advice' ? 'yogibaba' : persona;
  const currentMessages = messagesByPersona[currentPersona] || [];

  const [showVibeFix, setShowVibeFix] = useState({});
  const [showFullRoast, setShowFullRoast] = useState({});
  const [soundEnabled, setSoundEnabled] = useState(true);
  const duckControls = useAnimation();
  const chatEndRef = useRef(null);

  // Theme (dark/light)
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('crd_theme');
      if (saved === 'light' || saved === 'dark') setTheme(saved);
    } catch (e) {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('crd_theme', theme);
    } catch (e) {}
  }, [theme]);
  const isDark = theme === 'dark';

  const personas = {
    genz: {
      name: 'Gen-Z Duck',
      icon: '🦆',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      glowColor: 'shadow-blue-500/20',
      systemPrompt:
        "You are a Gen-Z coding mentor rubber duck. Roast code using Gen-Z slang like 'mid', 'bussin', 'no cap', 'fr fr', 'it's giving...', 'slay', 'ate', 'sigma', 'rizz'. Be playfully brutal but helpful. After roasting, provide a 'Vibe-Fix' with corrected code wrapped in ```language blocks."
    },
    aggressive: {
      name: 'Aggressive Motivator',
      icon: '💪',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      glowColor: 'shadow-orange-500/20',
      systemPrompt:
        "You are an aggressive motivational coding mentor rubber duck. Roast code like a drill sergeant mixed with a gym bro. Use phrases like 'WEAK CODE', 'DO YOU EVEN CODE BRO?', 'NO EXCUSES', 'PUSH HARDER'. Be intense but motivating. After roasting, provide a 'Vibe-Fix' with corrected code wrapped in ```language blocks."
    },
    brainrot: {
      name: 'Brain Rot Specialist',
      icon: '🧠',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      glowColor: 'shadow-purple-500/20',
      systemPrompt:
        "You are a terminally online rubber duck mentor drowning in brain rot. Reference memes, Skibidi toilet, Sigma grindset, Ohio jokes, 'only in Ohio', 'bros cooked', gigachad energy, and internet culture. Be chaotically funny. After roasting, provide a 'Vibe-Fix' with corrected code wrapped in ```language blocks."
    },
    yogibaba: {
      name: 'YogiBaba',
      icon: '🧘‍♂️',
      color: 'from-amber-400 to-rose-400',
      bgColor: 'bg-amber-100/60',
      borderColor: 'border-amber-200/30',
      glowColor: 'shadow-amber-200/20',
      systemPrompt:
        "You are YogiBaba — an ancient, wise Indian jogi baba who speaks gently and poetically. Give clear, practical coding advice and explanations like a teacher of dharma: calm, metaphor-rich, and full of practical steps. Use occasional Hindi phrases (e.g., 'beta', 'suno', 'dhyaan', 'atma') and simple parables, but always end with concrete, actionable steps, code snippets if helpful, and recommended next actions. Be respectful, patient, and focus on helping the user learn and improve."
    }
  };

  // scroll when current persona messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByPersona, persona, mode]);

  const playSound = (type) => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'roast') {
      oscillator.frequency.setValueAtTime(400, now);
      oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } else if (type === 'click') {
      oscillator.frequency.setValueAtTime(800, now);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      oscillator.start(now);
      oscillator.stop(now + 0.05);
    } else if (type === 'success') {
      oscillator.frequency.setValueAtTime(523, now);
      oscillator.frequency.setValueAtTime(659, now + 0.1);
      oscillator.frequency.setValueAtTime(784, now + 0.2);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } else if (type === 'quack') {
      const o1 = audioContext.createOscillator();
      const g1 = audioContext.createGain();
      o1.type = 'square';
      o1.frequency.setValueAtTime(700, now);
      o1.frequency.exponentialRampToValueAtTime(320, now + 0.18);
      g1.gain.setValueAtTime(0.0001, now);
      g1.gain.exponentialRampToValueAtTime(0.28, now + 0.01);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      o1.connect(g1);
      g1.connect(audioContext.destination);
      o1.start(now);
      o1.stop(now + 0.25);

      const o2 = audioContext.createOscillator();
      const g2 = audioContext.createGain();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(1200, now);
      o2.frequency.exponentialRampToValueAtTime(900, now + 0.18);
      g2.gain.setValueAtTime(0.0001, now);
      g2.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      g2.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      o2.connect(g2);
      g2.connect(audioContext.destination);
      o2.start(now);
      o2.stop(now + 0.25);
    } else if (type === 'grunt') {
      const o = audioContext.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(120, now);
      o.frequency.exponentialRampToValueAtTime(60, now + 0.35);
      const g = audioContext.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.42, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + 0.25);
      o.connect(filter);
      filter.connect(g);
      g.connect(audioContext.destination);
      o.start(now);
      o.stop(now + 0.8);
    } else if (type === 'scifi') {
      const carrier = audioContext.createOscillator();
      carrier.type = 'sawtooth';
      carrier.frequency.setValueAtTime(300, now);
      const lfo = audioContext.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(6, now);
      const lfoGain = audioContext.createGain();
      lfoGain.gain.setValueAtTime(45, now);
      lfo.connect(lfoGain);
      lfoGain.connect(carrier.frequency);
      const g = audioContext.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.22, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
      const hp = audioContext.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(200, now);
      carrier.connect(hp);
      hp.connect(g);
      g.connect(audioContext.destination);
      lfo.start(now);
      carrier.start(now);
      carrier.stop(now + 1.6);
      lfo.stop(now + 1.6);
    } else {
      oscillator.frequency.setValueAtTime(600, now);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      oscillator.start(now);
      oscillator.stop(now + 0.06);
    }
  };

  const shakeDuck = async () => {
    await duckControls.start({
      rotate: [0, -15, 15, -15, 15, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 0.5 }
    });
  };

  const facepalm = async () => {
    playSound('roast');
    await duckControls.start({
      scale: [1, 0.9, 1.05, 1],
      rotate: [0, -10, 10, -5, 0],
      y: [0, -10, 0],
      transition: { duration: 0.6 }
    });
  };

  const parseResponse = (text) => {
    const vibefixRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = vibefixRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'code', language: match[1] || 'javascript', content: match[2].trim() });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  };

  const toggleFullRoast = (key) => {
    setShowFullRoast(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Vibe-Fix toggle is persona-aware in keys
  const toggleVibeFix = (key) => {
    setShowVibeFix(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // AnimatedText: subtle per-letter staggered fade-in
  const AnimatedText = ({ text }) => {
    const chars = text.split('');
    return (
      <div className={`roast-animated leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
        {chars.map((ch, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transformOrigin: 'center',
              animation: 'roastFadeIn 420ms ease forwards',
              animationDelay: `${Math.min(i * 7, 900)}ms`,
              opacity: 0,
            }}
          >
            {ch}
          </span>
        ))}
        <style jsx>{`
          @keyframes roastFadeIn {
            from { opacity: 0; transform: translateY(6px) scale(0.995); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    );
  };

  // send either roast or advice depending on mode; the server uses persona to pick system prompt
  const roastCode = async () => {
    const inputText = mode === 'advice' ? adviceInput.trim() : code.trim();
    if (!inputText || loading) return;

    playSound("click");
    setLoading(true);

    const targetPersona = mode === 'advice' ? 'yogibaba' : persona;

    // append user message to target persona's messages
    setMessagesByPersona(prev => ({
      ...prev,
      [targetPersona]: [...(prev[targetPersona] || []), { role: "user", content: inputText }]
    }));

    // Start the network request immediately and let animations run in parallel
    const fetchPromise = fetch("/api/roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: inputText, persona: targetPersona }),
    });

    // run the shake animation but don't await it (so request happens in parallel)
    shakeDuck().catch(() => {});

    try {
      const response = await fetchPromise;

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || err?.error || err?.details || "Server failed");
      }

      const { aiText } = await response.json();
      const aiMessage = { role: "assistant", content: aiText || "No text returned" };

      // Add the assistant message to the target persona's chat log
      setMessagesByPersona(prev => ({
        ...prev,
        [targetPersona]: [...(prev[targetPersona] || []), aiMessage]
      }));

      // play a different sound for advice vs roast for feedback
      if (mode === 'advice') {
        playSound('scifi'); // gentle positive feedback for advice
      } else {
        facepalm().catch(() => {});
      }
    } catch (error) {
      setMessagesByPersona(prev => ({
        ...prev,
        [targetPersona]: [...(prev[targetPersona] || []), { role: "assistant", content: `API error 💀\n\nError: ${error.message}` }]
      }));
    } finally {
      setLoading(false);
      // keep the user's input in the editor so they can edit it; do not clear automatically
    }
  };

  const clearChat = () => {
    playSound('click');
    // clear only the current persona's chat log
    setMessagesByPersona(prev => ({ ...prev, [currentPersona]: [] }));
    setShowVibeFix({});
  };

  // Theme-based classes
  const rootBg = isDark ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100' : 'bg-gradient-to-br from-white via-slate-50 to-white text-slate-900';
  const panelBase = isDark ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl p-6 flex flex-col' : 'bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col';
  const textareaClass = isDark
    ? 'flex-1 bg-slate-950/80 text-emerald-400 font-mono text-sm p-5 rounded-xl border border-slate-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all shadow-inner'
    : 'flex-1 bg-white text-slate-800 font-mono text-sm p-5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-200 resize-none transition-all';
  const userBubble = isDark ? 'bg-gradient-to-br from-slate-800/60 to-slate-800/40 border border-slate-700/40 ml-8' : 'bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 ml-8';
  const assistantBubble = isDark ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/20 mr-8' : 'bg-gradient-to-br from-sky-50 to-violet-50 border border-sky-100 mr-8';
  const roastBoxClass = isDark ? 'p-4 bg-gradient-to-r from-purple-900/70 to-blue-900/60 border border-blue-700/20 rounded-xl shadow-xl' : 'p-4 bg-gradient-to-r from-indigo-50 to-rose-50 border border-slate-200 rounded-xl shadow-sm';
  const vibeFixPreClass = isDark ? 'bg-slate-950/90 p-5 rounded-lg border border-emerald-500/30 overflow-x-auto text-emerald-400 font-mono text-sm shadow-xl' : 'bg-slate-50 p-5 rounded-lg border border-slate-200 overflow-x-auto text-slate-800 font-mono text-sm shadow-sm';

  // persona lists: roast personas (exclude yogibaba), full list for advice view (only yogibaba active)
  const roastPersonaEntries = Object.entries(personas).filter(([k]) => k !== 'yogibaba');
  const advicePersonaEntry = [['yogibaba', personas.yogibaba]];

  return (
    <div className={`min-h-screen ${rootBg} p-6`}>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-4">
          <h1 className={`text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent drop-shadow-lg`}>
            The Chaotic Rubber Duck
          </h1>
          <p className={isDark ? 'text-slate-400 text-sm' : 'text-slate-600 text-sm'}>Your code mentor with personality. Choose your chaos.</p>
        </header>

        {/* Mode toggle: Roast vs Advice */}
        <div className="max-w-7xl mx-auto mb-4 flex items-center justify-center gap-3">
          <button
            onClick={() => { setMode('roast'); if (persona === 'yogibaba') setPersona('genz'); }}
            className={`px-4 py-2 rounded-xl font-semibold ${mode === 'roast' ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/80'}`}
          >
            Roast
          </button>
          <button
            onClick={() => { setMode('advice'); setPersona('yogibaba'); }}
            className={`px-4 py-2 rounded-xl font-semibold ${mode === 'advice' ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/80'}`}
          >
            Advice (YogiBaba)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-240px)]">
          {/* Code / Input Panel */}
          <div className={panelBase}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <div className={isDark ? 'bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-2' : 'bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg p-2'}>
                    <Code className={isDark ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-800'} />
                  </div>
                </div>
                <h2 className={isDark ? 'text-2xl font-bold text-slate-100' : 'text-2xl font-bold text-slate-900'}>
                  {mode === 'advice' ? 'Ask YogiBaba' : 'Code Editor'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound('click');
                    setSoundEnabled(!soundEnabled);
                  }}
                  className="p-2.5 hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                  title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
                >
                  {soundEnabled ? <Volume2 className={isDark ? "w-5 h-5 text-slate-300" : "w-5 h-5 text-slate-600"} /> : <VolumeX className={isDark ? "w-5 h-5 text-slate-500" : "w-5 h-5 text-slate-500"} />}
                </button>

                {/* Theme toggle */}
                <button
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className="p-2.5 rounded-xl hover:bg-slate-200/20 transition-all"
                  title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
              </div>
            </div>

            <textarea
              // show roast input or advice input depending on mode
              value={mode === 'advice' ? adviceInput : code}
              onChange={(e) => {
                if (mode === 'advice') setAdviceInput(e.target.value);
                else setCode(e.target.value);
              }}
              className={textareaClass}
              placeholder={mode === 'advice' ? "Ask YogiBaba for coding advice (e.g., 'How to learn React with limited time?')" : "Paste your code here..."}
            />

            <button
              onClick={roastCode}
              disabled={loading}
              className="mt-5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-700 disabled:to-slate-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/30 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>{mode === 'advice' ? 'Thinking...' : 'Analyzing Your Code...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>{mode === 'advice' ? 'Ask YogiBaba' : 'Roast My Code'}</span>
                </>
              )}
            </button>
          </div>

          {/* Chat Panel */}
          <div className={panelBase}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={duckControls}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="text-5xl cursor-pointer"
                  onClick={() => {
                    // quack on clicking big duck icon — if in advice mode play gentle sound
                    if (mode === 'advice') {
                      playSound('scifi');
                    } else {
                      playSound('quack');
                    }
                    duckControls.start({ scale: [1, 1.08, 1], transition: { duration: 0.25 } }).catch(() => {});
                  }}
                >
                  {personas[currentPersona].icon}
                </motion.div>
                <h2 className={isDark ? 'text-2xl font-bold text-slate-100' : 'text-2xl font-bold text-slate-900'}>
                  {mode === 'advice' ? personas.yogibaba.name : 'AI Mentor'}
                </h2>
              </div>
            </div>

            {/* Persona Selector */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {mode === 'roast'
                ? roastPersonaEntries.map(([key, p]) => (
                    <motion.button
                      key={key}
                      onClick={() => {
                        // play persona-specific sound on selection
                        if (key === 'genz') {
                          playSound('quack');
                        } else if (key === 'aggressive') {
                          playSound('grunt');
                        } else if (key === 'brainrot') {
                          playSound('scifi');
                        }
                        playSound('click'); // keep small click feedback
                        setPersona(key);
                      }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${persona === key ? `bg-gradient-to-br ${p.color} text-white border-transparent shadow-xl ${p.glowColor}` : `${p.bgColor} ${p.borderColor} text-slate-300 hover:${p.bgColor.replace('/10', '/20')} hover:border-opacity-50`} flex flex-col items-center gap-2`}
                    >
                      <motion.span
                        className="text-3xl"
                        animate={persona === key ? { rotate: [0, -8, 8, -8, 8, 0], scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.6, repeat: persona === key ? Infinity : 0, repeatDelay: 3 }}
                      >
                        {p.icon}
                      </motion.span>
                      <span className="text-xs font-bold text-center leading-tight">{p.name}</span>
                    </motion.button>
                  ))
                : // advice mode: show only YogiBaba (highlighted)
                  advicePersonaEntry.map(([key, p]) => (
                    <motion.button
                      key={key}
                      onClick={() => {
                        playSound('scifi');
                        setPersona('yogibaba');
                      }}
                      whileHover={{ scale: 1.0 }}
                      whileTap={{ scale: 0.97 }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 bg-gradient-to-br ${p.color} text-white border-transparent shadow-xl ${p.glowColor} flex flex-col items-center gap-2`}
                    >
                      <motion.span
                        className="text-3xl"
                        animate={{ rotate: [0, -6, 6, -6, 6, 0], scale: [1, 1.04, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
                      >
                        {p.icon}
                      </motion.span>
                      <span className="text-xs font-bold text-center leading-tight">{p.name}</span>
                    </motion.button>
                  ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              {currentMessages.length === 0 ? (
                <div className={isDark ? 'text-center text-slate-400 mt-20' : 'text-center text-slate-500 mt-20'}>
                  <motion.p
                    className="text-7xl mb-6"
                    animate={{ rotate: [0, -5, 5, -5, 5, 0], y: [0, -15, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    {personas[currentPersona].icon}
                  </motion.p>
                  <p className={isDark ? 'text-lg font-medium' : 'text-lg font-medium'}>
                    {mode === 'advice' ? 'Ask YogiBaba for wisdom and practical guidance' : 'Ready to roast your code'}
                  </p>
                  <p className={isDark ? 'text-sm text-slate-500 mt-2' : 'text-sm text-slate-600 mt-2'}>
                    {mode === 'advice' ? "Type your question (learning path, debugging tips, career advice) and YogiBaba will reply with calm wisdom and steps." : "Paste your code and let's see what you got"}
                  </p>
                </div>
              ) : (
                currentMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`p-5 rounded-xl ${msg.role === 'user' ? userBubble : assistantBubble}`}
                  >
                    {msg.role === 'user' ? (
                      <pre className={isDark ? "text-sm overflow-x-auto text-emerald-400 font-mono whitespace-pre-wrap" : "text-sm overflow-x-auto text-slate-800 font-mono whitespace-pre-wrap"}>{msg.content}</pre>
                    ) : (
                      <div className="space-y-4">
                        {parseResponse(msg.content).map((part, partIdx) => (
                          <div key={partIdx}>
                            {part.type === 'text' ? (
                              <div className={roastBoxClass}>
                                <div className="flex items-start gap-4">
                                  <div className="text-2xl select-none mr-2" aria-hidden>{personas[currentPersona].icon}</div>
                                  <div className="flex-1">
                                    {part.content.length > 420 && !showFullRoast[`${currentPersona}-${idx}-${partIdx}`] ? (
                                      <>
                                        <AnimatedText text={part.content.slice(0, 420) + '…'} />
                                        <div className="mt-3 flex gap-2 items-center">
                                          <button
                                            onClick={() => toggleFullRoast(`${currentPersona}-${idx}-${partIdx}`)}
                                            className={isDark ? "text-sm font-semibold text-sky-400 hover:underline" : "text-sm font-semibold text-sky-600 hover:underline"}
                                          >
                                            Read more
                                          </button>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <AnimatedText text={part.content} />
                                        <div className="mt-3 flex gap-2 items-center">
                                          {part.content.length > 420 && (
                                            <button
                                              onClick={() => toggleFullRoast(`${currentPersona}-${idx}-${partIdx}`)}
                                              className={isDark ? "text-sm font-semibold text-sky-400 hover:underline" : "text-sm font-semibold text-sky-600 hover:underline"}
                                            >
                                              Show less
                                            </button>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-3">
                                <button
                                  onClick={() => toggleVibeFix(`${currentPersona}-${idx}-${partIdx}`)}
                                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-sm font-bold py-2.5 px-5 rounded-lg mb-3 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-emerald-500/30"
                                >
                                  <Sparkles className="w-4 h-4" />
                                  {showVibeFix[`${currentPersona}-${idx}-${partIdx}`] ? 'Hide' : 'Show'} Vibe-Fix
                                </button>
                                {showVibeFix[`${currentPersona}-${idx}-${partIdx}`] && (
                                  <motion.pre initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={vibeFixPreClass}>
                                    {part.content}
                                  </motion.pre>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Clear Chat Button */}
            {currentMessages.length > 0 && (
              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={clearChat} className={isDark ? "w-full bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600/50 text-slate-300 hover:text-slate-100 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all" : "w-full bg-white/80 hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"}>
                <RotateCcw className="w-4 h-4" />
                Clear Conversation
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}