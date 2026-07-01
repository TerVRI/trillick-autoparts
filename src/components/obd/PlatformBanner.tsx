"use client";

import { AlertTriangle, Info, Smartphone, Monitor } from "lucide-react";
import { platformSupportSummary } from "@/lib/obd/transport";
import type { PlatformSupport } from "@/lib/obd/types";

interface PlatformBannerProps {
  platform: PlatformSupport | null;
}

export function PlatformBanner({ platform }: PlatformBannerProps) {
  if (!platform) return null;

  const summary = platformSupportSummary(platform);
  const Icon = platform.isIOS ? Smartphone : platform.isAndroid ? Smartphone : Monitor;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="font-medium text-stone-900">Connection: {summary}</p>
          <ul className="mt-2 space-y-1 text-sm text-stone-600">
            <li>Web Serial: {platform.webSerial ? "Supported" : "Not available"}</li>
            <li>WebUSB fallback: {platform.webUsb ? "Available" : "Not available"}</li>
            {platform.isAndroid && (
              <li>Android USB-C: use OTG adapter + Chrome 148+; wired serial varies by phone.</li>
            )}
          </ul>
        </div>
      </div>

      {platform.warnings.map((w) => (
        <div key={w} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{w}</span>
        </div>
      ))}

      {platform.isIOS && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            On iPhone/iPad you can use Simulator mode, manage vehicle profiles, and replay exported sessions.
            Live USB requires a future native companion app.
          </span>
        </div>
      )}
    </div>
  );
}
