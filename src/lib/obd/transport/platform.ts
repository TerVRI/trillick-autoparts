import type { PlatformSupport, TransportKind } from "../types";

function detectMobile(): { isAndroid: boolean; isIOS: boolean; isDesktop: boolean } {
  if (typeof navigator === "undefined") {
    return { isAndroid: false, isIOS: false, isDesktop: true };
  }
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return { isAndroid, isIOS, isDesktop: !isAndroid && !isIOS };
}

export function detectPlatformSupport(): PlatformSupport {
  const { isAndroid, isIOS, isDesktop } = detectMobile();
  const webSerial = typeof navigator !== "undefined" && "serial" in navigator;
  const webBluetooth = typeof navigator !== "undefined" && "bluetooth" in navigator;
  const webUsb = typeof navigator !== "undefined" && "usb" in navigator;

  const warnings: string[] = [];
  let recommendedTransport: TransportKind | null = "simulator";

  if (isIOS) {
    warnings.push(
      "Safari on iPhone/iPad does not support Web Serial or WebUSB. Use Simulator mode, replay saved sessions, or a future native companion app for live USB.",
    );
    recommendedTransport = null;
  } else if (isDesktop && webSerial) {
    recommendedTransport = "web-serial";
  } else if (isAndroid) {
    if (webSerial) {
      recommendedTransport = "web-serial";
      warnings.push(
        "Android USB-C: use an OTG adapter, Chrome 148+, and an ELM327 USB adapter. Wired serial support varies by phone model.",
      );
    } else if (webUsb) {
      recommendedTransport = "webusb";
      warnings.push(
        "Web Serial unavailable — trying WebUSB fallback. CDC/ACM adapters work best; chipset compatibility varies.",
      );
    } else {
      warnings.push("Use Chrome on Android with USB OTG for USB-C adapter support.");
      recommendedTransport = null;
    }
  } else if (isDesktop && !webSerial) {
    warnings.push("Use Chrome or Edge for direct USB ELM327 connection.");
    recommendedTransport = null;
  }

  return {
    webSerial,
    webBluetooth,
    webUsb,
    isAndroid,
    isIOS,
    isDesktop,
    recommendedTransport,
    warnings,
  };
}

export function platformSupportSummary(support: PlatformSupport): string {
  if (support.isIOS) return "iOS — live USB not supported in browser";
  if (support.isAndroid && support.webSerial) return "Android — USB-C via Web Serial (Chrome 148+)";
  if (support.isDesktop && support.webSerial) return "Desktop — USB via Web Serial";
  if (support.isAndroid && support.webUsb) return "Android — WebUSB fallback";
  return "Simulator recommended";
}
