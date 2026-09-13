"use client";

import { useEffect, useRef } from "react";

interface ShortcutHandlers {
  onFocusSearch?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onOpen?: () => void;
  onWhatsapp?: () => void;
  onNuevoPedido?: () => void;
  onParear?: () => void;
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function isOverlayOpen(): boolean {
  return (
    document.querySelector(
      '[data-slot="dialog-content"][data-state="open"], [data-slot="sheet-content"][data-state="open"]',
    ) !== null
  );
}

/**
 * Global keyboard shortcuts for the "Toda la Red" screen (⌘K search, J/K
 * card navigation, Enter to open, W for WhatsApp, N/P to open the create/
 * match dialogs). Disabled while typing in a field or while any Dialog/
 * Sheet is open, so it never hijacks normal form input.
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const h = handlersRef.current;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        h.onFocusSearch?.();
        return;
      }

      if (isTypingTarget(e.target) || isOverlayOpen()) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "j":
        case "arrowdown":
          e.preventDefault();
          h.onNext?.();
          break;
        case "k":
        case "arrowup":
          e.preventDefault();
          h.onPrev?.();
          break;
        case "enter":
          h.onOpen?.();
          break;
        case "w":
          h.onWhatsapp?.();
          break;
        case "n":
          h.onNuevoPedido?.();
          break;
        case "p":
          h.onParear?.();
          break;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
