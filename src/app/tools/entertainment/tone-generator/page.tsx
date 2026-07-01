"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { entertainmentRecommendations } from "@/lib/tool-recommendations";

export default function ToneGeneratorPage() {
  const [freq, setFreq] = useState(440);
  const [playing, setPlaying] = useState(false);
  const [sweep, setSweep] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const stop = useCallback(() => {
    oscRef.current?.stop();
    oscRef.current = null;
    setPlaying(false);
    setSweep(false);
  }, []);

  useEffect(() => () => { stop(); ctxRef.current?.close(); }, [stop]);

  function playTone(f: number) {
    stop();
    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f;
    osc.connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    setPlaying(true);
  }

  function runSweep() {
    stop();
    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(40, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 5);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 5);
    oscRef.current = osc;
    setSweep(true);
    setPlaying(true);
    setTimeout(() => { setPlaying(false); setSweep(false); }, 5000);
  }

  return (
    <ToolLayout
      title="Tone Generator"
      description="Generate test tones for speaker polarity checks, rattle finding, and crossover tuning."
      recommendations={entertainmentRecommendations()}
      toolContext="tone-generator"
    >
      <div className="rounded-xl border p-6 space-y-4">
        <label className="block text-sm">Frequency (Hz)
          <input type="range" min={20} max={2000} value={freq} onChange={(e) => setFreq(+e.target.value)} className="w-full" />
          <span className="font-mono">{freq} Hz</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {[40, 80, 100, 250, 440, 1000].map((f) => (
            <button key={f} type="button" onClick={() => { setFreq(f); playTone(f); }} className="rounded border px-3 py-1 text-sm hover:bg-stone-100">{f} Hz</button>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => playTone(freq)} className="rounded-lg bg-green-700 px-4 py-2 text-white text-sm">Play</button>
          <button type="button" onClick={runSweep} className="rounded-lg border px-4 py-2 text-sm">Sweep 40–200 Hz</button>
          <button type="button" onClick={stop} disabled={!playing} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">Stop</button>
        </div>
        {sweep && <p className="text-sm text-stone-500">Sweeping… listen for rattles.</p>}
        <p className="text-xs text-stone-500">Keep volume low initially to protect hearing and speakers.</p>
      </div>
    </ToolLayout>
  );
}
