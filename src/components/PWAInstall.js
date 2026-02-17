"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button.jsx";

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => setSwRegistered(true))
        .catch(() => {});
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowInstall(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowInstall(false);
    setDeferredPrompt(null);
  };

  if (!showInstall || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-card border border-border rounded-lg shadow-lg p-3 flex items-center justify-between gap-2 z-40">
      <p className="text-sm text-foreground">Install Goal Tracker for quick access.</p>
      <div className="flex gap-1 shrink-0">
        <Button size="sm" variant="outline" onClick={dismiss}>
          Not now
        </Button>
        <Button size="sm" onClick={handleInstall}>
          Install
        </Button>
      </div>
    </div>
  );
}
