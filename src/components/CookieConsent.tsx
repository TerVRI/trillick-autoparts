"use client";

import { useEffect, useState } from "react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-stone-900 p-4 text-stone-100 md:bottom-20 md:left-4 md:right-auto md:max-w-md md:rounded-lg md:border">
      <p className="text-sm">
        We use essential cookies for cart and site functionality. By continuing you agree to our{" "}
        <a href="/terms" className="underline text-amber-400">terms</a>.
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem("cookie-consent", "1");
          setShow(false);
        }}
        className="mt-3 rounded bg-amber-600 px-4 py-1.5 text-sm font-medium hover:bg-amber-500"
      >
        Accept
      </button>
    </div>
  );
}
