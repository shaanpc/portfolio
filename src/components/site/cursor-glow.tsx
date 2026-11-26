import { useEffect, useRef } from "react";

/**
 * Ambient radial glow that smoothly trails the pointer across the viewport.
 * Disabled automatically on touch-only devices and when prefers-reduced-motion is enabled.
 */
export function CursorGlow() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb || typeof window === "undefined") return;

    const touchOnlyQuery = window.matchMedia("(hover: none) and (pointer: coarse)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (touchOnlyQuery.matches || reducedMotionQuery.matches) {
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let hasMoved = false;
    let rafId: number | null = null;
    let disabled = false;

    const applyPosition = (x: number, y: number) => {
      orb.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    const tick = () => {
      if (disabled) {
        rafId = null;
        return;
      }

      const dx = targetX - currentX;
      const dy = targetY - currentY;

      if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
        currentX = targetX;
        currentY = targetY;
        applyPosition(currentX, currentY);
        rafId = null;
        return;
      }

      currentX += dx * 0.14;
      currentY += dy * 0.14;
      applyPosition(currentX, currentY);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId === null && !disabled) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (disabled || e.pointerType === "touch") return;

      targetX = e.clientX;
      targetY = e.clientY;

      if (!hasMoved) {
        hasMoved = true;
        currentX = targetX;
        currentY = targetY;
        applyPosition(currentX, currentY);
      }

      orb.dataset.active = "true";
      startLoop();
    };

    const handlePointerLeave = () => {
      orb.dataset.active = "false";
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        orb.dataset.active = "false";
      }
    };

    const handlePreferenceChange = () => {
      disabled = touchOnlyQuery.matches || reducedMotionQuery.matches;
      if (disabled) {
        orb.dataset.active = "false";
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("mouseout", handleMouseOut);
    window.addEventListener("blur", handlePointerLeave);
    touchOnlyQuery.addEventListener("change", handlePreferenceChange);
    reducedMotionQuery.addEventListener("change", handlePreferenceChange);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("mouseout", handleMouseOut);
      window.removeEventListener("blur", handlePointerLeave);
      touchOnlyQuery.removeEventListener("change", handlePreferenceChange);
      reducedMotionQuery.removeEventListener("change", handlePreferenceChange);
    };
  }, []);

  return (
    <div aria-hidden="true" className="cursor-glow-layer">
      <div ref={orbRef} className="cursor-glow-orb" data-active="false" />
    </div>
  );
}
