import { useEffect, useMemo, useRef, type RefObject } from "react";
import { cn } from "@/lib/utils";

interface SpringState {
  x: number;
  v: number;
  t: number;
  k: number;
  c: number;
}

function createSpring(initial: number, k: number, c: number): SpringState {
  return { x: initial, v: 0, t: initial, k, c };
}

function stepSpring(s: SpringState, dt: number) {
  const accel = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += accel * dt;
  s.x += s.v * dt;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export interface WeightWaveProps {
  text: string;
  as?: "h2" | "h3" | "p" | "span";
  className?: string;
  /** Optional outer element (e.g. card wrapper) that captures pointer movement across a wider area. */
  activeContainerRef?: RefObject<HTMLElement | null>;
  lightWeight?: number;
  boldWeight?: number;
  spread?: number;
}

const DEFAULT_LIGHT = 300;
const DEFAULT_BOLD = 820;
const DEFAULT_SPREAD = 0.13;

export function WeightWave({
  text,
  as: Tag = "h2",
  className,
  activeContainerRef,
  lightWeight = DEFAULT_LIGHT,
  boldWeight = DEFAULT_BOLD,
  spread = DEFAULT_SPREAD,
}: WeightWaveProps) {
  const waveRef = useRef<HTMLElement | null>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    const waveEl = waveRef.current;
    if (!waveEl) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const letterElements = charRefs.current.slice(0, chars.length);

    const applyStaticWeight = () => {
      for (const el of letterElements) {
        if (!el) continue;
        el.style.fontWeight = "500";
        el.style.fontVariationSettings = '"wght" 500';
        el.style.opacity = "1";
      }
    };

    if (motionQuery.matches) {
      applyStaticWeight();
      return;
    }

    const focus = createSpring(-0.2, 150, 22);
    const letterSprings = chars.map(() => createSpring(lightWeight, 260, 22));
    const centres = new Float64Array(chars.length);

    let hover = false;
    let idleTime = 0;
    let isInView = true;
    let rafId = 0;
    let lastTime = performance.now();

    const interactiveEl = activeContainerRef?.current ?? waveEl;

    const updateFocusFromClientX = (clientX: number) => {
      const rect = waveEl.getBoundingClientRect();
      if (rect.width <= 0) return;
      hover = true;
      focus.t = clamp((clientX - rect.left) / rect.width, -0.15, 1.15);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      updateFocusFromClientX(e.clientX);
    };

    const onPointerDown = (e: PointerEvent) => {
      updateFocusFromClientX(e.clientX);
    };

    const onPointerTouchMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      updateFocusFromClientX(e.clientX);
    };

    const resetToIdle = () => {
      hover = false;
      idleTime = 0;
    };

    interactiveEl.addEventListener("pointermove", onPointerMove, { passive: true });
    interactiveEl.addEventListener("pointermove", onPointerTouchMove, { passive: true });
    interactiveEl.addEventListener("pointerdown", onPointerDown, { passive: true });
    interactiveEl.addEventListener("pointerup", resetToIdle, { passive: true });
    interactiveEl.addEventListener("pointerleave", resetToIdle, { passive: true });
    interactiveEl.addEventListener("pointercancel", resetToIdle, { passive: true });

    const tick = (now: number) => {
      if (!isInView) {
        rafId = 0;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      const substeps = 4;
      const subDt = dt / substeps;
      for (let step = 0; step < substeps; step += 1) {
        if (!hover) {
          idleTime += subDt;
          focus.t = -0.06 + 1.12 * (0.5 - 0.5 * Math.cos((idleTime * Math.PI * 2) / 4.6));
        }
        stepSpring(focus, subDt);
        for (let i = 0; i < letterSprings.length; i += 1) {
          stepSpring(letterSprings[i], subDt);
        }
      }

      // Batch DOM reads before style writes to keep single layout pass per frame
      const totalWidth = waveEl.offsetWidth || 1;
      for (let i = 0; i < letterElements.length; i += 1) {
        const el = letterElements[i];
        centres[i] = el ? (el.offsetLeft + el.offsetWidth / 2) / totalWidth : i / Math.max(chars.length, 1);
      }

      const range = Math.max(boldWeight - lightWeight, 1);
      for (let i = 0; i < letterElements.length; i += 1) {
        const el = letterElements[i];
        if (!el) continue;

        const d = (centres[i] - focus.x) / spread;
        const influence = Math.exp(-d * d);
        const spring = letterSprings[i];
        spring.t = lightWeight + range * influence;

        const w = clamp(spring.x, 100, 900);
        const opacity = 0.48 + 0.52 * clamp((spring.x - lightWeight) / range, 0, 1);

        el.style.fontWeight = w.toFixed(1);
        el.style.fontVariationSettings = `"wght" ${w.toFixed(1)}`;
        el.style.opacity = opacity.toFixed(3);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId || motionQuery.matches) return;
      lastTime = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (!rafId) return;
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isInView = entry.isIntersecting;
        if (isInView) {
          startLoop();
        } else {
          stopLoop();
        }
      },
      { rootMargin: "120px 0px" },
    );

    observer.observe(waveEl);
    startLoop();

    const onMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        stopLoop();
        applyStaticWeight();
      } else if (isInView) {
        startLoop();
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      stopLoop();
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      interactiveEl.removeEventListener("pointermove", onPointerMove);
      interactiveEl.removeEventListener("pointermove", onPointerTouchMove);
      interactiveEl.removeEventListener("pointerdown", onPointerDown);
      interactiveEl.removeEventListener("pointerup", resetToIdle);
      interactiveEl.removeEventListener("pointerleave", resetToIdle);
      interactiveEl.removeEventListener("pointercancel", resetToIdle);
    };
  }, [activeContainerRef, boldWeight, chars, lightWeight, spread]);

  return (
    <Tag
      ref={(node) => {
        waveRef.current = node;
      }}
      aria-label={text}
      className={cn(
        "font-weight-wave select-none whitespace-nowrap",
        className,
      )}
    >
      {chars.map((char, idx) => (
        <span
          key={`${idx}-${char}`}
          ref={(el) => {
            charRefs.current[idx] = el;
          }}
          aria-hidden="true"
          className="inline-block whitespace-pre will-change-[opacity,font-weight]"
          style={{ fontWeight: lightWeight }}
        >
          {char}
        </span>
      ))}
    </Tag>
  );
}
