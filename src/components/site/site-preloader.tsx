import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DESIGNER_PROFILE } from "@/data/profile";
import { cn } from "@/lib/utils";

const IntroReadyContext = createContext<boolean>(true);

export function useIntroReady(): boolean {
  return useContext(IntroReadyContext);
}

interface SitePreloaderProps {
  children: ReactNode;
}

/**
 * Minimal initial-load preloader that coordinates font & hero-portrait readiness
 * before triggering the staggered hero, navigation, and floating-dock reveals.
 * Plays once per initial page load; skips immediately on prefers-reduced-motion.
 */
export function SitePreloader({ children }: SitePreloaderProps) {
  const [introReady, setIntroReady] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (introReady) {
      setDismissed(true);
      return;
    }

    let cancelled = false;

    const preloadHeroImage = new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = "/shan-portrait.png";
      if (img.complete) resolve();
    });

    const fontsReady =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready.then(() => undefined).catch(() => undefined)
        : Promise.resolve();

    const minimumSweep = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 850);
    });

    const readinessTimeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1150);
    });

    const finishIntro = () => {
      if (cancelled) return;
      setExiting(true);
      window.setTimeout(() => {
        if (!cancelled) setIntroReady(true);
      }, 160);
      window.setTimeout(() => {
        if (!cancelled) setDismissed(true);
      }, 560);
    };

    // Wait for minimum subtle sweep AND (fonts + portrait OR max 1.15s readiness cap)
    void Promise.all([
      minimumSweep,
      Promise.race([Promise.all([fontsReady, preloadHeroImage]), readinessTimeout]),
    ]).then(finishIntro);

    // Absolute safety fail-safe so the site can never stay blocked
    const hardFailSafe = window.setTimeout(() => {
      finishIntro();
    }, 1700);

    return () => {
      cancelled = true;
      window.clearTimeout(hardFailSafe);
    };
  }, [introReady]);

  return (
    <IntroReadyContext.Provider value={introReady}>
      {children}

      {!dismissed && (
        <div
          aria-hidden="true"
          className={cn(
            "site-preloader fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background text-foreground",
            exiting && "site-preloader-exit",
          )}
        >
          <div className="flex flex-col items-center">
            <span className="preloader-wordmark font-editorial text-[28px] italic font-normal tracking-[-0.01em] text-foreground sm:text-[32px]">
              {DESIGNER_PROFILE.name}
            </span>
            <div className="mt-4 h-px w-36 overflow-hidden bg-rule sm:w-44">
              <div className="preloader-line h-full w-full bg-foreground" />
            </div>
          </div>
        </div>
      )}
    </IntroReadyContext.Provider>
  );
}
