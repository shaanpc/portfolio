import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useIntroReady } from "./site-preloader";

export type RevealVariant = "up" | "fade" | "image" | "clip" | "line";

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  variant?: RevealVariant;
  /** Render immediately on mount (for hero / above-the-fold elements) instead of waiting for scroll */
  immediate?: boolean;
}

function useInViewOnce(immediate: boolean) {
  const introReady = useIntroReady();
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    if (!("IntersectionObserver" in window)) return true;
    return false;
  });

  useEffect(() => {
    if (visible || !introReady) return;
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    if (immediate) {
      let frame2 = 0;
      const frame1 = window.requestAnimationFrame(() => {
        frame2 = window.requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      return () => {
        window.cancelAnimationFrame(frame1);
        if (frame2) window.cancelAnimationFrame(frame2);
      };
    }

    const checkInOrPastViewport = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.96) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (checkInOrPastViewport()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight * 0.96) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        threshold: 0.01,
        rootMargin: "0px 0px -36px 0px",
      },
    );

    observer.observe(el);

    const onScrollOrResize = () => {
      if (checkInOrPastViewport()) {
        observer.disconnect();
      }
    };

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    const safetyTimer = window.setTimeout(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 1.15) {
        setVisible(true);
        observer.disconnect();
      }
    }, 1400);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.clearTimeout(safetyTimer);
    };
  }, [immediate, introReady, visible]);

  return { ref, visible };
}

/**
 * Editorial scroll-reveal wrapper powered by IntersectionObserver.
 * Falls back safely to visible if reduced motion is enabled, IntersectionObserver
 * is unavailable, or the element enters/passes the viewport during scrolling.
 */
export function Reveal({
  children,
  className,
  style,
  delay = 0,
  variant = "up",
  immediate = false,
}: RevealProps) {
  const { ref, visible } = useInViewOnce(immediate);

  if (variant === "line") {
    return (
      <span
        ref={(node) => {
          ref.current = node;
        }}
        data-reveal="line"
        data-visible={visible ? "true" : "false"}
        style={{ transitionDelay: `${delay}ms`, ...style }}
        className={cn("scroll-reveal-line", className)}
      >
        <span className="scroll-reveal-line-inner" style={{ transitionDelay: `${delay}ms` }}>
          {children}
        </span>
      </span>
    );
  }

  return (
    <div
      ref={(node) => {
        ref.current = node;
      }}
      data-reveal={variant}
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      className={cn("scroll-reveal", className)}
    >
      {children}
    </div>
  );
}

interface ParallaxImageProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  delay?: number;
  immediate?: boolean;
  /** Maximum vertical parallax shift in px on desktop (0 disables) */
  strength?: number;
  /** Resting scale on desktop so cover images have bleed headroom during parallax */
  overscan?: number;
}

/**
 * Combines a vertical curtain clip-path + reduced-scale reveal inside an overflow-hidden
 * container with subtle desktop-only scroll parallax. Disabled automatically on mobile/touch
 * and when prefers-reduced-motion is enabled.
 */
export function ParallaxImage({
  children,
  className,
  innerClassName,
  delay = 0,
  immediate = false,
  strength = 12,
  overscan = 1.045,
}: ParallaxImageProps) {
  const { ref: revealRef, visible } = useInViewOnce(immediate);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const container = revealRef.current;
    if (!track || !container || typeof window === "undefined" || strength <= 0) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopPointer = window.matchMedia("(min-width: 768px) and (hover: hover)");

    let rafId = 0;

    const update = () => {
      rafId = 0;
      if (reducedMotion.matches || !desktopPointer.matches) {
        track.style.transform = "";
        return;
      }

      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      if (rect.bottom < -60 || rect.top > vh + 60) return;

      const centerOffset = (rect.top + rect.height / 2 - vh / 2) / (vh * 0.65);
      const clamped = Math.max(-1, Math.min(1, centerOffset));
      const shiftY = clamped * strength;
      track.style.transform = `translate3d(0, ${shiftY.toFixed(2)}px, 0) scale(${overscan})`;
    };

    const schedule = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reducedMotion.addEventListener("change", schedule);
    desktopPointer.addEventListener("change", schedule);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
      desktopPointer.removeEventListener("change", schedule);
      track.style.transform = "";
    };
  }, [overscan, revealRef, strength]);

  return (
    <div
      ref={(node) => {
        revealRef.current = node;
      }}
      data-reveal="clip"
      data-visible={visible ? "true" : "false"}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("scroll-reveal overflow-hidden", className)}
    >
      <div
        ref={trackRef}
        className={cn("will-change-transform", innerClassName)}
      >
        {children}
      </div>
    </div>
  );
}
