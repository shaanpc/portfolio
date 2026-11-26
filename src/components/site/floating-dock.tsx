import { ArrowUp, Mail, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { DESIGNER_PROFILE } from "@/data/profile";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "shan_pc_theme";

function readInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    const attr = document.documentElement.dataset.theme;
    if (attr === "dark" || attr === "light") return attr;
  }
  if (typeof window !== "undefined") {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch {
      // Ignore storage errors
    }
  }
  return "light";
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.94 8.5H3.56V19.5H6.94V8.5ZM5.25 3.5C4.14 3.5 3.25 4.39 3.25 5.5C3.25 6.6 4.14 7.5 5.25 7.5C6.35 7.5 7.25 6.6 7.25 5.5C7.25 4.39 6.35 3.5 5.25 3.5ZM20.44 13.02C20.44 9.88 18.76 8.22 16.16 8.22C14.37 8.22 13.48 9.2 13.02 9.93V8.5H9.65C9.7 9.48 9.65 19.5 9.65 19.5H13.02V13.36C13.02 13.02 13.05 12.69 13.15 12.45C13.42 11.78 14.03 11.09 15.07 11.09C16.41 11.09 17.06 12.11 17.06 13.6V19.5H20.44V13.02Z" />
    </svg>
  );
}

export function FloatingDock() {
  const [theme, setTheme] = useState<Theme>(() => readInitialTheme());
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    let rafId = 0;

    const updateProgress = () => {
      rafId = 0;
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setScrollProgress(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100));
      setScrollProgress(pct);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const canScrollTop = scrollProgress > 8;
  const atBottom = scrollProgress > 90;

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function handleBackToTop() {
    if (!canScrollTop) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const iconButtonClass =
    "inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:-translate-y-px hover:bg-[var(--dock-hover)] hover:text-foreground active:scale-95 focus-visible:outline-2 focus-visible:outline-foreground";

  return (
    <div
      className="dock-enter fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-40 max-w-[calc(100vw-1.5rem)]"
      role="region"
      aria-label="Quick links and appearance"
    >
      <div
        className="flex items-center gap-0.5 rounded-full border p-1 sm:gap-1 sm:p-1.5"
        style={{
          backgroundColor: "var(--dock-bg)",
          borderColor: "var(--dock-border)",
          boxShadow: "var(--dock-shadow)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
        }}
      >
        {/* 1. Resume pill button */}
        <a
          href={DESIGNER_PROFILE.links.resume}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Resume PDF in a new tab"
          className="group mr-0.5 inline-flex shrink-0 rounded-full p-[1px] transition-transform duration-200 hover:-translate-y-px active:scale-95 focus-visible:outline-2 focus-visible:outline-foreground sm:mr-1"
          style={{ background: "var(--dock-resume-rim)" }}
        >
          <span
            className="inline-flex h-8 items-center justify-center rounded-full px-3.5 text-xs font-medium tracking-[-0.01em] text-foreground transition-colors duration-200 group-hover:bg-surface sm:h-9 sm:px-4 sm:text-[13px]"
            style={{ backgroundColor: "var(--dock-resume-bg)" }}
          >
            Resume
          </span>
        </a>

        {/* 2. Email icon */}
        <a
          href={`mailto:${DESIGNER_PROFILE.links.email}`}
          aria-label={`Email ${DESIGNER_PROFILE.name} at ${DESIGNER_PROFILE.links.email}`}
          title={DESIGNER_PROFILE.links.email}
          className={iconButtonClass}
        >
          <Mail className="h-4 w-4 stroke-[1.6]" aria-hidden="true" />
        </a>

        {/* 3. X (Twitter) icon */}
        <a
          href={DESIGNER_PROFILE.links.x}
          target="_blank"
          rel="noreferrer"
          aria-label={`${DESIGNER_PROFILE.name} on X`}
          title="X"
          className={iconButtonClass}
        >
          <XIcon className="h-3.5 w-3.5" />
        </a>

        {/* 4. LinkedIn icon */}
        <a
          href={DESIGNER_PROFILE.links.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label={`${DESIGNER_PROFILE.name} on LinkedIn`}
          title="LinkedIn"
          className={iconButtonClass}
        >
          <LinkedInIcon className="h-4 w-4" />
        </a>

        {/* 5. Thin vertical separator */}
        <span
          aria-hidden="true"
          className="mx-1 h-4 w-px shrink-0 bg-rule-strong sm:mx-1.5"
        />

        {/* 6. Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          title={theme === "light" ? "Dark mode" : "Light mode"}
          className={cn(iconButtonClass, "cursor-pointer")}
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4 stroke-[1.6] transition-transform duration-300" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4 stroke-[1.6] transition-transform duration-300" aria-hidden="true" />
          )}
        </button>

        {/* 7. Circular scroll progress & back-to-top control */}
        <button
          type="button"
          onClick={handleBackToTop}
          disabled={!canScrollTop}
          aria-label="Scroll back to top"
          title={canScrollTop ? "Back to top" : "Scroll progress"}
          className={cn(
            "group relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200 sm:h-9 sm:w-9",
            canScrollTop
              ? "cursor-pointer text-foreground hover:bg-[var(--dock-hover)] active:scale-95"
              : "cursor-default text-muted-foreground",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn(
              "h-[20px] w-[20px] -rotate-90 transition-opacity duration-200",
              atBottom ? "opacity-0 group-hover:opacity-0" : "group-hover:opacity-25",
            )}
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="opacity-20"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              strokeDashoffset={100 - scrollProgress}
            />
          </svg>
          <ArrowUp
            aria-hidden="true"
            className={cn(
              "absolute h-3.5 w-3.5 transition-all duration-200",
              atBottom
                ? "translate-y-0 opacity-100"
                : canScrollTop
                  ? "translate-y-0.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                  : "opacity-0",
            )}
          />
        </button>
      </div>
    </div>
  );
}
