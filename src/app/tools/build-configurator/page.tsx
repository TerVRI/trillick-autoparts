"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Share2, Check } from "lucide-react";
import { BUILD_TYPES, encodeBuildConfig, decodeBuildConfig, type BuildConfig } from "@/lib/build-configurator";
import { recommendationsFromCategories, recommendationsFromSearchTerms } from "@/lib/tool-recommendations";
import { ToolQuoteForm } from "@/components/tools/ToolQuoteForm";

const VEHICLES = ["Defender 90/110", "Defender L663", "Discovery 3/4", "Range Rover Sport", "Freelander 2", "Other Land Rover"];
const BUDGETS = ["Budget-conscious", "Mid-range", "No compromise"];

export default function BuildConfiguratorPage() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<BuildConfig>({
    buildType: "",
    vehicle: VEHICLES[0],
    budget: BUDGETS[1],
    notes: "",
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("c");
    if (c) {
      const decoded = decodeBuildConfig(c);
      if (decoded) {
        setConfig(decoded);
        setStep(3);
      }
    }
  }, []);

  const build = useMemo(() => BUILD_TYPES.find((b) => b.id === config.buildType), [config.buildType]);

  const recommendations = useMemo(() => {
    if (!build) return [];
    return [
      ...recommendationsFromCategories(build.categories),
      ...recommendationsFromSearchTerms(build.searchTerms),
    ];
  }, [build]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !config.buildType) return "";
    const encoded = encodeBuildConfig(config);
    return `${window.location.origin}/tools/build-configurator?c=${encoded}`;
  }, [config]);

  const summary = build
    ? `Build: ${build.label} for ${config.vehicle}. Budget: ${config.budget}. Items: ${build.items.join(", ")}. ${config.notes}`
    : "";

  function copyShare() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/tools" className="mb-6 inline-flex items-center gap-1 text-sm text-stone-600 hover:text-amber-700">
        <ArrowLeft className="h-4 w-4" /> Back to Tools
      </Link>

      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase">Build Configurator</h1>
        <p className="mt-2 text-stone-600">Guided wizard for common Land Rover builds — get a parts list and send it for a quote.</p>
      </header>

      <div className="mb-8 flex gap-2">
        {["Build type", "Vehicle", "Details", "Results"].map((label, i) => (
          <div key={label} className={`flex-1 rounded-full h-2 ${i <= step ? "bg-amber-600" : "bg-stone-200"}`} title={label} />
        ))}
      </div>

      {step === 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-lg">What are you building?</h2>
          {BUILD_TYPES.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => { setConfig({ ...config, buildType: b.id }); setStep(1); }}
              className={`w-full rounded-xl border p-4 text-left transition hover:border-amber-400 hover:bg-amber-50 ${config.buildType === b.id ? "border-amber-500 bg-amber-50" : ""}`}
            >
              <p className="font-semibold">{b.label}</p>
              <p className="text-sm text-stone-500">{b.description}</p>
            </button>
          ))}
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-lg">Which vehicle?</h2>
          <select value={config.vehicle} onChange={(e) => setConfig({ ...config, vehicle: e.target.value })} className="w-full rounded-lg border px-3 py-2">
            {VEHICLES.map((v) => <option key={v}>{v}</option>)}
          </select>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(0)} className="rounded-lg border px-4 py-2 text-sm">Back</button>
            <button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-4 py-2 text-sm text-white">
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <h2 className="font-semibold text-lg">Budget & notes</h2>
          <select value={config.budget} onChange={(e) => setConfig({ ...config, budget: e.target.value })} className="w-full rounded-lg border px-3 py-2">
            {BUDGETS.map((b) => <option key={b}>{b}</option>)}
          </select>
          <textarea
            rows={4}
            placeholder="Any specific goals? e.g. winch-ready Defender 110, family camping setup..."
            value={config.notes}
            onChange={(e) => setConfig({ ...config, notes: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="rounded-lg border px-4 py-2 text-sm">Back</button>
            <button type="button" onClick={() => setStep(3)} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-4 py-2 text-sm text-white">
              See build list <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 3 && build && (
        <section className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-display text-xl font-bold uppercase">{build.label}</h2>
            <p className="text-sm text-stone-600 mt-1">{config.vehicle} · {config.budget}</p>
            <ul className="mt-4 space-y-2">
              {build.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Browse related categories</h3>
            <div className="flex flex-wrap gap-2">
              {recommendations.map((r) => (
                <Link key={r.href} href={r.href} className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm text-green-800 hover:bg-green-50">
                  {r.label}
                </Link>
              ))}
            </div>
          </div>

          {shareUrl && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={copyShare} className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm hover:bg-stone-50">
                <Share2 className="h-4 w-4" />
                {copied ? "Copied!" : "Copy share link"}
              </button>
            </div>
          )}

          <ToolQuoteForm toolContext={`build-configurator:${build.id}`} summary={summary} />

          <button type="button" onClick={() => setStep(0)} className="text-sm text-stone-500 hover:text-amber-700">
            Start over
          </button>
        </section>
      )}
    </div>
  );
}
