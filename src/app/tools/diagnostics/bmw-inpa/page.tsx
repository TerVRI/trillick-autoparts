import type { Metadata } from "next";
import { BmwInpaDashboard } from "@/components/bmw/BmwInpaDashboard";

export const metadata: Metadata = {
  title: "BMW Diagnostics (INPA-style)",
  description:
    "Read-only BMW E-series diagnostics over a K+DCAN cable via Web Serial. Module scan, identification, and fault codes using public KWP2000/UDS protocols.",
};

export default function BmwInpaPage() {
  return <BmwInpaDashboard />;
}
