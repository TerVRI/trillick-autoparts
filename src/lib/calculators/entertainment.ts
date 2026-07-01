/** Car audio / 12V entertainment calculators */

export function subImpedance(
  count: number,
  coilType: "SVC" | "DVC",
  coilOhms: number,
  wiring: "parallel" | "series" | "parallel-coils"
): { finalOhms: number; description: string } {
  if (coilType === "SVC") {
    if (wiring === "parallel") {
      return { finalOhms: coilOhms / count, description: `${count} SVC ${coilOhms}Ω subs wired in parallel` };
    }
    return { finalOhms: coilOhms * count, description: `${count} SVC ${coilOhms}Ω subs wired in series` };
  }
  // DVC
  if (wiring === "parallel-coils") {
    const perSub = coilOhms / 2;
    const final = perSub / count;
    return { finalOhms: final, description: `${count} DVC ${coilOhms}Ω (coils par.) then subs in parallel → ${final.toFixed(2)}Ω` };
  }
  if (wiring === "parallel") {
    return { finalOhms: (coilOhms * 2) / count, description: `${count} DVC ${coilOhms}Ω subs in parallel` };
  }
  return { finalOhms: coilOhms * 2 * count, description: `${count} DVC ${coilOhms}Ω subs in series` };
}

export function ampWireGauge(
  ampWatts: number,
  voltage: number,
  lengthMetres: number,
  efficiency: "class-d" | "class-ab"
): { awg: number; fuseAmps: number; currentDraw: number } {
  const eff = efficiency === "class-d" ? 0.85 : 0.6;
  const currentDraw = ampWatts / (voltage * eff);
  const fuseAmps = Math.ceil(currentDraw * 1.25);
  // Simplified AWG lookup for 12V, 3% drop
  const table: [number, number][] = [
    [4, 120], [6, 80], [8, 55], [10, 35], [12, 25], [14, 18], [16, 12],
  ];
  const required = (currentDraw * lengthMetres * 0.017) / (voltage * 0.03);
  let awg = 16;
  for (const [gauge, maxCurrent] of table) {
    if (currentDraw <= maxCurrent && lengthMetres <= 5) {
      awg = gauge;
      break;
    }
  }
  if (lengthMetres > 5 && awg > 8) awg = 8;
  if (required > 10) awg = Math.min(awg, 4);
  return { awg, fuseAmps, currentDraw: Math.round(currentDraw * 10) / 10 };
}

export interface AudioBuildOption {
  component: string;
  recommendation: string;
  searchTerms: string[];
}

export function audioBuildPlan(
  vehicle: string,
  budget: "basic" | "mid" | "premium",
  wantsSub: boolean
): AudioBuildOption[] {
  const plan: AudioBuildOption[] = [
    { component: "Head Unit", recommendation: budget === "premium" ? "Apple CarPlay / Android Auto unit with DSP" : "Double-DIN Bluetooth head unit", searchTerms: ["radio", "enhancement"] },
    { component: "Front Speakers", recommendation: vehicle.includes("Defender") ? "6.5\" or 5.25\" dash/door — check depth" : "6.5\" component or coaxial", searchTerms: ["speaker", "trim"] },
  ];
  if (wantsSub) {
    plan.push({ component: "Subwoofer", recommendation: budget === "basic" ? "10\" powered sub" : "12\" DVC sub + monoblock amp", searchTerms: ["subwoofer", "enhancement"] });
    plan.push({ component: "Amplifier", recommendation: "Monoblock 500W+ @ 2Ω stable", searchTerms: ["amp", "enhancement"] });
  }
  plan.push({ component: "Wiring Kit", recommendation: "4 AWG OFC kit with ANL fuse holder", searchTerms: ["wiring", "tool", "consumable"] });
  plan.push({ component: "Sound Deadening", recommendation: "Butyl mat for doors and floor", searchTerms: ["interior protection", "dynamat"] });
  return plan;
}
