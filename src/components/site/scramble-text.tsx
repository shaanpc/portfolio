import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?";

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** Average milliseconds between consecutive character resolutions. */
  stepMs?: number;
  /** Minimum scramble duration before the first character resolves. */
  initialDelayMs?: number;
}

/**
 * Renders text that scrambles through random characters when entering the
 * viewport and decodes left-to-right with subtle per-character timing variation.
 */
export function ScrambleText({
  text,
  className,
  stepMs = 11,
  initialDelayMs = 120,
}: ScrambleTextProps) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setDisplayText(text);
      return;
    }

    let rafId = 0;
    let hasPlayedInView = false;

    const stopAnimation = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const startScramble = () => {
      stopAnimation();
      const chars = Array.from(text);
      const resolveTimes = chars.map((ch, i) => {
        if (ch === " " || ch === "\n") return 0;
        const jitter = Math.random() * 140;
        return initialDelayMs + i * stepMs + jitter;
      });
      const totalDuration = Math.max(...resolveTimes, initialDelayMs);
      const glyphIntervalMs = 38;
      let startTime = 0;
      let lastGlyphSwap = -glyphIntervalMs;
      let cachedGlyphs = chars.map((ch) =>
        ch === " " || ch === "\n"
          ? ch
          : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
      );

      const tick = (now: number) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;

        if (elapsed >= totalDuration) {
          setDisplayText(text);
          rafId = 0;
          return;
        }

        const shouldSwapGlyphs = elapsed - lastGlyphSwap >= glyphIntervalMs;
        if (shouldSwapGlyphs) {
          lastGlyphSwap = elapsed;
        }

        const next = chars
          .map((ch, i) => {
            if (ch === " " || ch === "\n" || elapsed >= resolveTimes[i]) {
              return ch;
            }
            if (shouldSwapGlyphs) {
              cachedGlyphs[i] =
                SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
            return cachedGlyphs[i];
          })
          .join("");

        setDisplayText(next);
        rafId = window.requestAnimationFrame(tick);
      };

      rafId = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!hasPlayedInView) {
              hasPlayedInView = true;
              startScramble();
            }
          } else {
            hasPlayedInView = false;
            stopAnimation();
            setDisplayText(text);
          }
        }
      },
      { threshold: 0.25 },
    );

    const onMotionChange = () => {
      if (motionQuery.matches) {
        stopAnimation();
        setDisplayText(text);
      }
    };

    observer.observe(el);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      stopAnimation();
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, [text, stepMs, initialDelayMs]);

  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{displayText}</span>
    </p>
  );
}
