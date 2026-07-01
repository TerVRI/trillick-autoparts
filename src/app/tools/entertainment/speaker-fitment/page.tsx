import { ToolLayout } from "@/components/tools/ToolLayout";
import { entertainmentRecommendations } from "@/lib/tool-recommendations";

const FITMENT = [
  { model: "Defender (classic)", front: "5.25\" dash pods or 6.5\" door (depth limited)", rear: "6x9 under seats or side panels", notes: "Minimal depth behind dash. Consider marine speakers for wet boots." },
  { model: "Defender (L663)", front: "Factory locations — check A-pillar tweeter add-on", rear: "D-pillar or sub floor", notes: "Retain factory amp integration if OEM amplifier present." },
  { model: "Discovery 3/4", front: "6.5\" door midbass + dash tweeter", rear: "6.5\" doors", notes: "Good depth in front doors. Sound deadening highly recommended." },
  { model: "Range Rover Sport (L320)", front: "6.5\" door + dash", rear: "6.5\" doors", notes: "Sub often fits spare wheel well. Check MOST fibre if replacing head unit." },
  { model: "Freelander 2", front: "6.5\" door", rear: "6.5\" door", notes: "Straightforward coaxial swap. Limited sub space without box." },
];

export default function SpeakerFitmentPage() {
  return (
    <ToolLayout
      title="Speaker Fitment Guide"
      description="Common speaker locations and caveats for popular Land Rover models."
      recommendations={entertainmentRecommendations()}
      toolContext="speaker-fitment-guide"
    >
      <div className="space-y-4">
        {FITMENT.map((f) => (
          <article key={f.model} className="rounded-xl border p-5">
            <h3 className="font-semibold text-lg">{f.model}</h3>
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              <div><dt className="font-medium text-stone-500">Front</dt><dd>{f.front}</dd></div>
              <div><dt className="font-medium text-stone-500">Rear</dt><dd>{f.rear}</dd></div>
            </dl>
            <p className="mt-2 text-sm text-amber-800 bg-amber-50 rounded p-2">{f.notes}</p>
          </article>
        ))}
      </div>
    </ToolLayout>
  );
}
