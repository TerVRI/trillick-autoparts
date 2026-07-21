import type { LucideIcon } from "lucide-react";
import {
  Wrench, Mountain, Tent, Music, Stethoscope, Settings2,
  Search, BookOpen, Car, Gauge, Anchor, Ruler, Battery,
  Droplets, Package, ListChecks, Map, Radio, Zap, Volume2,
  AlertTriangle, Calendar, ClipboardList, Hammer, Activity,
} from "lucide-react";

export interface ToolDef {
  slug: string;
  href: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: LucideIcon;
  featured?: boolean;
}

export type ToolCategory =
  | "find-diagnose"
  | "off-road"
  | "camping"
  | "entertainment"
  | "build";

export const TOOL_CATEGORIES: { id: ToolCategory; label: string; description: string }[] = [
  { id: "find-diagnose", label: "Find & Diagnose", description: "Search parts, read fault codes, plan maintenance" },
  { id: "off-road", label: "Off-Road Setup", description: "Tyres, recovery, geometry, gearing" },
  { id: "camping", label: "Camping & Overlanding", description: "Power, payload, water, trip prep" },
  { id: "entertainment", label: "Build & Systems", description: "Audio, wiring, electrical sizing" },
  { id: "build", label: "Build Configurator", description: "Guided setup wizards" },
];

export const TOOLS: ToolDef[] = [
  { slug: "search", href: "/search", title: "Part Number Search", description: "Search 6,000+ Britpart parts by code or description", category: "find-diagnose", icon: Search, featured: true },
  { slug: "catalogue", href: "/catalogue", title: "Interactive Catalogue", description: "Browse the full Britpart catalogue online", category: "find-diagnose", icon: BookOpen, featured: true },
  { slug: "obd", href: "/tools/diagnostics/obd-code-lookup", title: "OBD Code Lookup", description: "Look up fault codes in plain English", category: "find-diagnose", icon: AlertTriangle, featured: true },
  { slug: "obd-dashboard", href: "/tools/diagnostics/obd-dashboard", title: "OBD Dashboard", description: "Live gauges, diagnostics & car profile via USB ELM327", category: "find-diagnose", icon: Activity, featured: true },
  { slug: "bmw-inpa", href: "/tools/diagnostics/bmw-inpa", title: "BMW Diagnostics (INPA-style)", description: "Read BMW E-series modules & fault codes via K+DCAN cable", category: "find-diagnose", icon: Car },
  { slug: "symptoms", href: "/tools/diagnostics/symptom-helper", title: "Symptom Helper", description: "Match symptoms to likely causes and parts", category: "find-diagnose", icon: Stethoscope },
  { slug: "maintenance", href: "/tools/diagnostics/maintenance-planner", title: "Maintenance Planner", description: "Service reminders by mileage and model", category: "find-diagnose", icon: Calendar },
  { slug: "service-kits", href: "/tools/diagnostics/service-kit-finder", title: "Service Kit Finder", description: "Find service kits for your Land Rover", category: "find-diagnose", icon: ClipboardList },
  { slug: "tyre-pressure", href: "/tools/off-road/tyre-pressure", title: "Tyre Pressure Calculator", description: "Starting PSI for road, gravel, sand, mud, rocks", category: "off-road", icon: Gauge, featured: true },
  { slug: "tyre-gear", href: "/tools/off-road/tyre-gear-calculator", title: "Tyre & Gear Calculator", description: "Speedometer error and regear suggestions", category: "off-road", icon: Settings2, featured: true },
  { slug: "winch", href: "/tools/off-road/winch-pull", title: "Winch Pull Calculator", description: "Minimum winch rating for your recovery", category: "off-road", icon: Anchor },
  { slug: "kinetic-rope", href: "/tools/off-road/kinetic-rope", title: "Kinetic Rope Sizer", description: "Right recovery rope for your vehicle weight", category: "off-road", icon: Ruler },
  { slug: "geometry", href: "/tools/off-road/approach-angles", title: "Approach Angles", description: "Approach, departure, and breakover angles", category: "off-road", icon: Mountain },
  { slug: "trip", href: "/tools/camping/trip-planner", title: "Trip Planner", description: "Prep checklist for your overland trip", category: "camping", icon: Map },
  { slug: "gear-list", href: "/tools/camping/gear-list", title: "Gear List Builder", description: "Custom packing list for recovery and camping", category: "camping", icon: ListChecks, featured: true },
  { slug: "payload", href: "/tools/camping/payload", title: "Payload Calculator", description: "Check remaining payload with gear and mods", category: "camping", icon: Package },
  { slug: "water", href: "/tools/camping/water-planner", title: "Water Planner", description: "Estimate drinking and camp water needs", category: "camping", icon: Droplets },
  { slug: "power", href: "/tools/camping/power-calculator", title: "12V Power Calculator", description: "Battery, solar, and DC-DC sizing", category: "camping", icon: Battery, featured: true },
  { slug: "audio-build", href: "/tools/entertainment/audio-build", title: "Audio Build Planner", description: "Plan your Land Rover audio upgrade", category: "entertainment", icon: Music, featured: true },
  { slug: "impedance", href: "/tools/entertainment/audio-wiring-calculator", title: "Sub Wiring Calculator", description: "Subwoofer impedance and wiring config", category: "entertainment", icon: Zap },
  { slug: "wire-fuse", href: "/tools/entertainment/wire-fuse", title: "Wire & Fuse Calculator", description: "Correct cable gauge and fuse size", category: "entertainment", icon: Radio },
  { slug: "speakers", href: "/tools/entertainment/speaker-fitment", title: "Speaker Fitment Guide", description: "Speaker locations for common Land Rovers", category: "entertainment", icon: Volume2 },
  { slug: "tone", href: "/tools/entertainment/tone-generator", title: "Tone Generator", description: "Test tones for install tuning", category: "entertainment", icon: Volume2 },
  { slug: "configurator", href: "/tools/build-configurator", title: "Build Configurator", description: "Guided wizard for common Land Rover builds", category: "build", icon: Hammer, featured: true },
];

export function toolsByCategory(cat: ToolCategory) {
  return TOOLS.filter((t) => t.category === cat);
}

export function featuredTools() {
  return TOOLS.filter((t) => t.featured);
}
