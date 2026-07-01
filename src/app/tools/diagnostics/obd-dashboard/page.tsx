import type { Metadata } from "next";
import { ObdDashboard } from "@/components/obd/ObdDashboard";

export const metadata: Metadata = {
  title: "OBD Dashboard",
  description:
    "Live OBD-II dashboard for Land Rovers. Connect ELM327 USB via Web Serial, read gauges and fault codes, configure your vehicle profile — open source in-browser diagnostics.",
};

export default function ObdDashboardPage() {
  return <ObdDashboard />;
}
