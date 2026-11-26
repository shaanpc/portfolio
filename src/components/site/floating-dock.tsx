import { ArrowUp, Instagram, Mail, Moon, Sun } from "lucide-react";
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
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      setAtTop(window.scrollY < 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  function handleBackToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const iconButtonClass =
    "floating-dock-icon relative z-10 inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--dock-hover)] active:scale-95 focus-visible:outline-2 focus-visible:outline-foreground";

  return (
    <div
      className="dock-enter fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-50 max-w-[calc(100vw-1.5rem)]"
      role="region"
      aria-label="Quick links and appearance"
    >
      <div
        className="floating-dock-pill flex items-center gap-0.5 rounded-full border p-1.5 sm:gap-1.5 sm:p-2"
        style={{
          backgroundColor: "var(--dock-bg)",
          borderColor: "var(--dock-border)",
          boxShadow: "var(--dock-shadow)",
        }}
      >
        {/* Dark-mode travelling white glow layers (hidden in light mode) */}
        <span aria-hidden="true" className="dock-halo-glow" />
        <span aria-hidden="true" className="dock-dark-surface" />
        <span aria-hidden="true" className="dock-border-glow" />

        {/* Resume pill button */}
        <a
          href={DESIGNER_PROFILE.links.resume}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Resume PDF in a new tab"
          className="floating-dock-resume relative z-10 mr-1 inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-foreground px-4 text-xs font-medium tracking-[-0.01em] text-background transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:mr-1.5 sm:h-10 sm:px-6 sm:text-[13px]"
        >
          Resume
        </a>

        {/* 1. Email icon */}
        <a
          href={`mailto:${DESIGNER_PROFILE.links.email}`}
          aria-label={`Email ${DESIGNER_PROFILE.name} at ${DESIGNER_PROFILE.links.email}`}
          title={DESIGNER_PROFILE.links.email}
          className={iconButtonClass}
        >
          <Mail className="h-[18px] w-[18px] stroke-[1.75]" aria-hidden="true" />
        </a>

        {/* 2. X (Twitter) icon */}
        <a
          href={DESIGNER_PROFILE.links.x}
          target="_blank"
          rel="noreferrer"
          aria-label={`${DESIGNER_PROFILE.name} on X`}
          title="X"
          className={iconButtonClass}
        >
          <XIcon className="h-[17px] w-[17px]" />
        </a>

        {/* 3. LinkedIn icon */}
        <a
          href={DESIGNER_PROFILE.links.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label={`${DESIGNER_PROFILE.name} on LinkedIn`}
          title="LinkedIn"
          className={iconButtonClass}
        >
          <LinkedInIcon className="h-[18px] w-[18px]" />
        </a>

        {/* 4. Instagram icon */}
        <a
          href="https://www.instagram.com/shaan.pc"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          title="Instagram"
          className={iconButtonClass}
        >
          <Instagram className="h-[18px] w-[18px] stroke-[1.75]" aria-hidden="true" />
        </a>

        {/* 5. Thin vertical separator */}
        <span
          aria-hidden="true"
          className="relative z-10 mx-1 h-4 w-px shrink-0 bg-foreground/20 sm:mx-1.5"
        />

        {/* 5. Theme toggle (Sun/Moon) */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          title={theme === "light" ? "Dark mode" : "Light mode"}
          className={cn(iconButtonClass, "cursor-pointer")}
        >
          <span className="inline-flex transition-transform duration-300 ease-out">
            {theme === "light" ? (
              <Moon className="h-[18px] w-[18px] stroke-[1.75]" aria-hidden="true" />
            ) : (
              <Sun className="h-[18px] w-[18px] stroke-[1.75]" aria-hidden="true" />
            )}
          </span>
        </button>

        {/* 6. Back-to-top arrow */}
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Scroll back to top"
          title="Back to top"
          className={cn(
            iconButtonClass,
            "cursor-pointer",
            atTop && "opacity-65 hover:opacity-100",
          )}
        >
          <ArrowUp className="h-[18px] w-[18px] stroke-[1.85]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
