import { describe, expect, it, vi, afterEach } from "vitest";
import { detectPlatformSupport, platformSupportSummary } from "./platform";
import type { PlatformSupport } from "../types";

describe("platform detection", () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    vi.stubGlobal("navigator", originalNavigator);
  });

  it("recommends web-serial on desktop with serial API", () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
      platform: "MacIntel",
      maxTouchPoints: 0,
      serial: {},
      bluetooth: {},
      usb: {},
    });
    const support = detectPlatformSupport();
    expect(support.isDesktop).toBe(true);
    expect(support.webSerial).toBe(true);
    expect(support.recommendedTransport).toBe("web-serial");
  });

  it("warns on iOS and disables live USB", () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      platform: "iPhone",
      maxTouchPoints: 5,
    });
    const support = detectPlatformSupport();
    expect(support.isIOS).toBe(true);
    expect(support.recommendedTransport).toBeNull();
    expect(support.warnings.length).toBeGreaterThan(0);
    expect(platformSupportSummary(support)).toMatch(/iOS/i);
  });

  it("falls back to webusb on Android without serial", () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Linux; Android 14)",
      platform: "Linux armv8l",
      maxTouchPoints: 5,
      usb: {},
    });
    const support = detectPlatformSupport();
    expect(support.isAndroid).toBe(true);
    expect(support.recommendedTransport).toBe("webusb");
  });

  it("summarizes platform support strings", () => {
    const desktop: PlatformSupport = {
      webSerial: true,
      webBluetooth: false,
      webUsb: true,
      isAndroid: false,
      isIOS: false,
      isDesktop: true,
      recommendedTransport: "web-serial",
      warnings: [],
    };
    expect(platformSupportSummary(desktop)).toMatch(/Desktop/i);
  });
});
