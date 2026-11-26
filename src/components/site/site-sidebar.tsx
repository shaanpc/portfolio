import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DESIGNER_PROFILE } from "@/data/profile";
import { cn } from "@/lib/utils";
import { useIntroReady } from "./site-preloader";

export interface NavSectionItem {
  id: string;
  label: string;
}

export const NAV_SECTIONS: NavSectionItem[] = [
  { id: "overview", label: "Overview" },
  { id: "things-i-do", label: "Things I Do" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

const DOT_SIZE = 5;

export function SiteSidebar() {
  const introReady = useIntroReady();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const isHome = pathname === "/";
  const isWorkRoute = pathname.startsWith("/work");

  const [activeId, setActiveId] = useState<string>(isWorkRoute ? "things-i-do" : "overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dotPos, setDotPos] = useState<{ x: number; y: number } | null>(null);
  const [mobileDotPos, setMobileDotPos] = useState<{ x: number; y: number } | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const labelRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const mobileNavRef = useRef<HTMLElement>(null);
  const mobileLabelRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const mobileItemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const clickLockUntilRef = useRef<number>(0);

  // Sync default active section when switching routes
  useEffect(() => {
    if (isWorkRoute) {
      setActiveId("things-i-do");
    } else if (isHome) {
      const hash = window.location.hash.replace("#", "");
      if (hash === "work") {
        setActiveId("things-i-do");
      } else if (hash === "about" || hash === "capabilities") {
        setActiveId("experience");
      } else if (hash && NAV_SECTIONS.some((s) => s.id === hash)) {
        setActiveId(hash);
      } else if (window.scrollY < 48) {
        setActiveId("overview");
      }
    }
  }, [isHome, isWorkRoute, pathname]);

  // Measure and position the circular indicator beside the active label
  const updateDotPosition = useCallback(() => {
    const navEl = navRef.current;
    const itemEl = itemRefs.current[activeId];
    const labelEl = labelRefs.current[activeId];
    if (!navEl || !itemEl || !labelEl) return;

    const navRect = navEl.getBoundingClientRect();
    const labelRect = labelEl.getBoundingClientRect();
    if (navRect.width === 0 || labelRect.width === 0) return;

    const x = labelRect.right - navRect.left + 12;
    const y = itemEl.offsetTop + (itemEl.offsetHeight - DOT_SIZE) / 2;

    setDotPos((prev) => {
      if (prev && Math.abs(prev.x - x) < 0.25 && Math.abs(prev.y - y) < 0.25) {
        return prev;
      }
      return { x, y };
    });
  }, [activeId]);

  const updateMobileDotPosition = useCallback(() => {
    if (!mobileOpen) return;
    const navEl = mobileNavRef.current;
    const itemEl = mobileItemRefs.current[activeId];
    const labelEl = mobileLabelRefs.current[activeId];
    if (!navEl || !itemEl || !labelEl) return;

    const navRect = navEl.getBoundingClientRect();
    const labelRect = labelEl.getBoundingClientRect();
    if (navRect.width === 0 || labelRect.width === 0) return;

    const x = labelRect.right - navRect.left + 12;
    const y = itemEl.offsetTop + (itemEl.offsetHeight - DOT_SIZE) / 2;

    setMobileDotPos({ x, y });
  }, [activeId, mobileOpen]);

  useLayoutEffect(() => {
    updateDotPosition();
  }, [updateDotPosition]);

  useLayoutEffect(() => {
    updateMobileDotPosition();
  }, [updateMobileDotPosition]);

  useEffect(() => {
    const onResize = () => {
      updateDotPosition();
      updateMobileDotPosition();
    };
    window.addEventListener("resize", onResize);
    if (document.fonts?.ready) {
      void document.fonts.ready.then(onResize);
    }
    return () => window.removeEventListener("resize", onResize);
  }, [updateDotPosition, updateMobileDotPosition]);

  // Scroll-aware section detection on the homepage
  useEffect(() => {
    if (!isHome) return;

    const sectionEls = NAV_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (sectionEls.length === 0) return;

    const visibleSet = new Set<string>();

    const pickActiveSection = () => {
      if (performance.now() < clickLockUntilRef.current) return;

      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;

      if (scrollY < 40) {
        setActiveId("overview");
        return;
      }

      if (scrollY + viewportH >= docH - 24) {
        setActiveId("contact");
        return;
      }

      // Prefer the section closest to the upper-third reading line among intersecting sections
      const anchor = Math.min(240, viewportH * 0.34);
      let current = sectionEls[0].id;

      for (const el of sectionEls) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchor) {
          current = el.id;
        }
      }

      // If an observer-tracked lower section is clearly dominant inside the reading band, honor order
      if (visibleSet.size > 0) {
        const firstVisible = NAV_SECTIONS.find((s) => visibleSet.has(s.id));
        if (firstVisible && current === "overview" && scrollY > 120) {
          current = firstVisible.id;
        }
      }

      setActiveId(current);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleSet.add(entry.target.id);
          } else {
            visibleSet.delete(entry.target.id);
          }
        }
        pickActiveSection();
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.15, 0.4],
      },
    );

    for (const el of sectionEls) {
      observer.observe(el);
    }

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        pickActiveSection();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    pickActiveSection();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [isHome]);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    setMobileOpen(false);
    setActiveId(id);

    if (isHome) {
      if (id === "overview") {
        clickLockUntilRef.current = performance.now() + 900;
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", "/");
        return;
      }
      const target = document.getElementById(id);
      if (target) {
        clickLockUntilRef.current = performance.now() + 900;
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${id}`);
      }
      return;
    }

    void navigate({ to: "/", hash: id === "overview" ? undefined : id }).then(() => {
      window.requestAnimationFrame(() => {
        const target = document.getElementById(id);
        if (target) {
          clickLockUntilRef.current = performance.now() + 900;
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  const activeLabel = NAV_SECTIONS.find((s) => s.id === activeId)?.label ?? "Overview";

  return (
    <>
      {/* Desktop & Tablet Fixed Left Sidebar */}
      <aside
        aria-label="Primary navigation"
        className="fixed inset-y-0 left-0 z-40 hidden border-r border-rule bg-background text-foreground md:flex md:w-[208px] md:flex-col md:justify-between md:px-8 md:py-11 lg:w-[clamp(220px,19vw,260px)] lg:px-10 lg:py-12"
      >
        {/* Top identity */}
        <div className={introReady ? "sidebar-enter" : "opacity-0"}>
          <Link
            to="/"
            onClick={(e) => handleNavClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, "overview")}
            className="inline-block font-editorial text-[22px] italic font-normal leading-tight tracking-[-0.01em] text-foreground transition-colors duration-200 hover:text-primary"
          >
            {DESIGNER_PROFILE.name}
          </Link>
          <p className="mt-1 text-[11px] tracking-[0.02em] text-muted-foreground">
            {DESIGNER_PROFILE.location}
          </p>
        </div>

        {/* Vertically centered navigation links with sliding dot indicator */}
        <nav ref={navRef} aria-label="Sections" className="relative my-auto flex flex-col gap-2 py-8">
          <span
            aria-hidden="true"
            className={cn(
              "nav-dot pointer-events-none absolute left-0 top-0 h-[5px] w-[5px] rounded-full bg-foreground",
              introReady && dotPos ? "opacity-100" : "opacity-0",
            )}
            style={
              dotPos
                ? { transform: `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)` }
                : undefined
            }
          />

          {NAV_SECTIONS.map((item, idx) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                href={`/#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => handleNavClick(e, item.id)}
                style={{ animationDelay: `${60 + idx * 50}ms` }}
                className={cn(
                  "group relative flex items-center py-2 text-[13.5px] leading-snug tracking-[-0.005em] transition-colors duration-200",
                  introReady ? "sidebar-enter" : "opacity-0",
                  isActive
                    ? "font-medium text-foreground"
                    : "font-normal text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  ref={(el) => {
                    labelRefs.current[item.id] = el;
                  }}
                >
                  {item.label}
                </span>
              </a>
            );
          })}
        </nav>

        {/* Minimal external footer links inside sidebar */}
        <div
          className={cn(
            "flex flex-col gap-2.5 text-xs text-muted-foreground",
            introReady ? "sidebar-enter" : "opacity-0",
          )}
          style={{ animationDelay: "260ms" }}
        >
          <a
            href={DESIGNER_PROFILE.links.behance}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1 transition-colors duration-200 hover:text-foreground"
          >
            <span>Behance</span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
          <a
            href={DESIGNER_PROFILE.links.contra}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1 transition-colors duration-200 hover:text-foreground"
          >
            <span>Contra</span>
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </aside>

      {/* Mobile Compact Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-rule bg-background/95 text-foreground backdrop-blur-sm md:hidden">
        <div className="flex h-14 items-center justify-between px-5">
          <Link
            to="/"
            onClick={(e) => handleNavClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, "overview")}
            className="font-editorial text-xl italic font-normal tracking-[-0.01em] text-foreground"
          >
            {DESIGNER_PROFILE.name}
          </Link>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
              <span>{activeLabel}</span>
              <span className="h-[5px] w-[5px] rounded-full bg-foreground" aria-hidden="true" />
            </span>

            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-rule bg-background px-5 pb-6 pt-3">
            <nav ref={mobileNavRef} aria-label="Mobile sections" className="relative flex flex-col gap-1">
              <span
                aria-hidden="true"
                className={cn(
                  "nav-dot pointer-events-none absolute left-0 top-0 h-[5px] w-[5px] rounded-full bg-foreground",
                  mobileDotPos ? "opacity-100" : "opacity-0",
                )}
                style={
                  mobileDotPos
                    ? { transform: `translate3d(${mobileDotPos.x}px, ${mobileDotPos.y}px, 0)` }
                    : undefined
                }
              />

              {NAV_SECTIONS.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <a
                    key={item.id}
                    ref={(el) => {
                      mobileItemRefs.current[item.id] = el;
                    }}
                    href={`/#${item.id}`}
                    aria-current={isActive ? "location" : undefined}
                    onClick={(e) => handleNavClick(e, item.id)}
                    className={cn(
                      "py-2.5 text-[15px] transition-colors duration-200",
                      isActive
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      ref={(el) => {
                        mobileLabelRefs.current[item.id] = el;
                      }}
                    >
                      {item.label}
                    </span>
                  </a>
                );
              })}
            </nav>

            <div className="mt-4 flex items-center gap-6 border-t border-rule pt-4 text-xs text-muted-foreground">
              <a
                href={DESIGNER_PROFILE.links.behance}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <span>Behance</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                href={DESIGNER_PROFILE.links.contra}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <span>Contra</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
