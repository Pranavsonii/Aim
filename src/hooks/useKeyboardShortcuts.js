"use client";
import { useEffect } from "react";

function isTypingInInput() {
  if (typeof document === "undefined") return false;
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  const role = el.getAttribute?.("role");
  const isContentEditable = el.isContentEditable;
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    role === "textbox" ||
    isContentEditable
  );
}

export function useKeyboardShortcuts({ onNewGoal, onShowHelp }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isTypingInInput()) return;
      // N - New goal
      if ((e.key === "n" || e.key === "N") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onNewGoal?.();
      }
      // ? - Show shortcuts help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onShowHelp?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewGoal, onShowHelp]);
}
