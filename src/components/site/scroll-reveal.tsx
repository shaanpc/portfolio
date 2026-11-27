import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RevealVariant = "up" | "fade" | "line" | "scale";

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  immediate?: boolean;
  variant?: RevealVariant;
}

export function Reveal({
  children,
  className,
  style,
  delay = 0,
  immediate = false,
  variant = "up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    if (!("IntersectionObserver" in window)) return true;
    return false;
  });

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    if (immediate) {
      const id = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(id);
    }

    const checkPosition = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.96) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (checkPosition()) return;

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
      { threshold: 0.01, rootMargin: "0px 0px -30px 0px" },
    );

    observer.observe(el);

    const onScroll = () => {
      if (checkPosition()) observer.disconnect();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const fallback = window.setTimeout(() => {
      if (checkPosition()) observer.disconnect();
    }, 1200);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(fallback);
    };
  }, [immediate, visible]);

  return (
    <div
      ref={ref}
      data-visible={visible ? "true" : "false"}
      data-variant={variant}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      className={cn("reveal-item", className)}
    >
      {children}
    </div>
  );
}
