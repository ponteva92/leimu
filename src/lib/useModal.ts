import { useEffect, useRef, type RefObject } from "react";
import { useScrollLock } from "@/lib/scroll";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Layer = { trigger: HTMLElement | null };

/* Open dialogs, bottom to top. Only the top layer answers Escape and keeps
   Tab inside its panel, so a dialog opened from inside another (a privacy
   link in a form, say) closes on its own and hands the keyboard back to the
   one beneath. Scroll lock is already ref-counted in lib/scroll. */
const layers: Layer[] = [];

/**
 * Shared dialog behaviour: locks page scroll, closes on Escape, keeps Tab
 * inside the panel, and moves focus into the dialog on open and back to
 * whatever opened it on close. The panel needs tabIndex={-1}.
 */
export function useModal({
  active,
  onClose,
  panelRef,
}: {
  active: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLElement>;
}) {
  useScrollLock(active);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!active) return;
    const layer: Layer = {
      trigger: document.activeElement instanceof HTMLElement ? document.activeElement : null,
    };
    layers.push(layer);
    // The panel element lives as long as the dialog; the ref may already be
    // cleared by the time an unmount runs the cleanup below.
    const ownPanel = panelRef.current;
    ownPanel?.focus({ preventScroll: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (layers[layers.length - 1] !== layer) return;
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      const panel = panelRef.current;
      if (e.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      const outside = current === panel || !panel.contains(current);

      if (e.shiftKey && (outside || current === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      } else if (!e.shiftKey && !panel.contains(current)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      const index = layers.indexOf(layer);
      layers.splice(index, 1);
      const above = layers[index];
      if (!above) {
        layer.trigger?.focus({ preventScroll: true });
      } else if (above.trigger && ownPanel?.contains(above.trigger)) {
        // Closed from underneath while a dialog it opened is still up: don't
        // pull focus out of that dialog, and when it closes, send focus where
        // this one would have, not to a control that no longer exists.
        above.trigger = layer.trigger;
      }
    };
  }, [active, panelRef]);
}
