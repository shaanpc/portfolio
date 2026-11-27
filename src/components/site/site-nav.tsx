import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DESIGNER_PROFILE } from "@/data/profile";
import { cn } from "@/lib/utils";

export interface NavItem {
  id: "overview" | "about" | "work" | "skills" | "contact";
  label: string;
  href: string;
}

export const SITE_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Home", href: "/#overview" },
  { id: "about", label: "About", href: "/#about" },
  { id: "work", label: "Works", href: "/#work" },
  { id: "skills", label: "Services", href: "/#skills" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

const DOT_SIZE = 5;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const isHome = pathname === "/";
  const isWorkRoute = pathname.startsWith("/work");

  const [activeId, setActiveId] = useState<NavItem["id"]>(() =>
    isWorkRoute ? "work" : "overview",
  );
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dotX, setDotX] = useState<number | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const clickLockUntilRef = useRef<number>(0);

  // Sync default active section on route change
  useEffect(() => {
    if (isWorkRoute) {
      setActiveId("work");
    } else if (isHome) {
      const hash = window.location.hash.replace("#", "");
      if (hash === "about") {
        setActiveId("about");
      } else if (hash === "work" || hash === "works") {
        setActiveId("work");
      } else if (hash === "skills" || hash === "services" || hash === "service") {
        setActiveId("skills");
      } else if (hash === "contact") {
        setActiveId("contact");
      } else if (window.scrollY < 48) {
        setActiveId("overview");
      }
    }
  }, [isHome, isWorkRoute, pathname]);

  // Measure active item center X horizontally inside desktop <nav>
  const updateDotPosition = useCallback(() => {
    const navEl = navRef.current;
    const activeEl = itemRefs.current[activeId];
    if (!navEl || !activeEl || activeEl.offsetWidth === 0) return;

    const nextX = activeEl.offsetLeft + activeEl.offsetWidth / 2 - DOT_SIZE / 2;
    setDotX((prev) => (prev !== null && Math.abs(prev - nextX) < 0.25 ? prev : nextX));
  }, [activeId]);

  useLayoutEffect(() => {
    updateDotPosition();
  }, [updateDotPosition]);

  useEffect(() => {
    const onResize = () => updateDotPosition();
    window.addEventListener("resize", onResize);
    if (document.fonts?.ready) {
      void document.fonts.ready.then(onResize);
    }
    return () => window.removeEventListener("resize", onResize);
  }, [updateDotPosition]);

  // Subtle header separation once page scrolls & scroll-based active section detection
  useEffect(() => {
    const onScrollHeader = () => {
      setScrolled(window.scrollY > 12);
    };
    onScrollHeader();
    window.addEventListener("scroll", onScrollHeader, { passive: true });
    return () => window.removeEventListener("scroll", onScrollHeader);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const watchedIds: NavItem["id"][] = ["overview", "work", "about", "skills", "contact"];
    const sectionEls = watchedIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sectionEls.length === 0) return;

    const visibleSet = new Set<string>();

    const pickActiveSection = () => {
      if (performance.now() < clickLockUntilRef.current) return;

      const scrollY = window.scrollY;
      const viewportH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;

      if (scrollY < 48) {
        setActiveId("overview");
        return;
      }

      if (scrollY + viewportH >= docH - 32) {
        setActiveId("contact");
        return;
      }

      const anchor = Math.min(240, viewportH * 0.34);
      let current: NavItem["id"] = "overview";

      for (const el of sectionEls) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchor) {
          current = el.id as NavItem["id"];
        }
      }

      if (visibleSet.size > 0 && current === "overview" && scrollY > 120) {
        const firstVisible = watchedIds.find((id) => visibleSet.has(id));
        if (firstVisible) current = firstVisible;
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
        rootMargin: "-18% 0px -55% 0px",
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

  function handleSectionLink(e: React.MouseEvent<HTMLAnchorElement>, id: NavItem["id"]) {
    e.preventDefault();
    setMobileOpen(false);
    setActiveId(id);

    if (isHome) {
      clickLockUntilRef.current = performance.now() + 900;
      if (id === "overview") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.replaceState(null, "", "/");
        return;
      }
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${id}`);
      }
      return;
    }

    void navigate({ to: "/", hash: id === "overview" ? undefined : id }).then(() => {
      window.requestAnimationFrame(() => {
        clickLockUntilRef.current = performance.now() + 900;
        if (id === "overview") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-200",
        scrolled ? "bg-background/95 backdrop-blur-sm" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between px-6 md:px-12 lg:px-16">
        {/* Top-left Location Signature */}
        <Link
          to="/"
          onClick={(e) => handleSectionLink(e as unknown as React.MouseEvent<HTMLAnchorElement>, "overview")}
          className="animate-soft-enter text-sm font-normal tracking-[-0.01em] text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-foreground"
        >
          {DESIGNER_PROFILE.location}
        </Link>

        {/* Top-right Minimal Desktop Navbar with Smooth Sliding Active Dot */}
        <nav
          ref={navRef}
          aria-label="Primary"
          className="animate-soft-enter relative hidden items-center gap-7 pb-2 pt-1 md:flex lg:gap-9"
          style={{ animationDelay: "60ms" }}
        >
          {SITE_NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                href={item.href}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => handleSectionLink(e, item.id)}
                className={cn(
                  "text-sm tracking-[-0.01em] transition-[color,opacity] duration-250 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground",
                  isActive
                    ? "font-medium text-foreground opacity-100"
                    : "font-normal text-foreground/60 hover:text-foreground hover:opacity-100",
                )}
              >
                {item.label}
              </a>
            );
          })}

          {/* Single continuous horizontally sliding indicator dot */}
          <span
            aria-hidden="true"
            className={cn(
              "nav-active-dot pointer-events-none absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-foreground",
              dotX !== null ? "opacity-100" : "opacity-0",
            )}
            style={dotX !== null ? { transform: `translate3d(${dotX}px, 0, 0)` } : undefined}
          />
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center text-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-rule bg-background px-6 py-5 md:hidden"
        >
          <div className="flex flex-col gap-3">
            {SITE_NAV_ITEMS.map((item) => {
              const isActive = activeId === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(e) => handleSectionLink(e, item.id)}
                  className={cn(
                    "inline-flex items-center justify-between py-1.5 text-base transition-opacity",
                    isActive
                      ? "font-medium text-foreground"
                      : "text-foreground/65 hover:text-foreground",
                  )}
                >
                  <span>{item.label}</span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-[5px] w-[5px] rounded-full bg-foreground transition-opacity duration-200",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                </a>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
