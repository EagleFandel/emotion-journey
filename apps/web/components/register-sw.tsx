"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    void navigator.serviceWorker.register("/sw.js").then((registration) => {
      void registration.update();
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
