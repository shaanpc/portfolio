import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { DESIGNER_PROFILE } from "@/data/profile";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/", isRoute: true },
    { label: "Work", href: "/#work", isRoute: false },
    { label: "About", href: "/#about", isRoute: false },
    { label: "Contact", href: "/#contact", isRoute: false },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="font-display text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
          >
            {DESIGNER_PROFILE.name}
          </Link>
          <span className="hidden h-3.5 w-px bg-rule-strong sm:inline-block" aria-hidden="true" />
          <span className="hidden font-mono-meta text-[10px] text-muted-foreground sm:inline">
            {DESIGNER_PROFILE.location}
          </span>
        </div>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) =>
            item.isRoute ? (
              <Link
                key={item.label}
                to="/"
                className={cn(
                  "editorial-link text-sm transition-colors",
                  pathname === "/"
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="editorial-link text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ),
          )}

          <span className="h-3.5 w-px bg-rule" aria-hidden="true" />

          <a
            href={DESIGNER_PROFILE.links.behance}
            target="_blank"
            rel="noreferrer"
            className="editorial-link inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            <span>Behance</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </nav>

        {/* Mobile menu button */}
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

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-rule bg-background px-6 py-6 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium text-foreground"
            >
              Home
            </Link>
            <a
              href="/#work"
              onClick={() => setMobileOpen(false)}
              className="text-base text-muted-foreground hover:text-foreground"
            >
              Work
            </a>
            <a
              href="/#about"
              onClick={() => setMobileOpen(false)}
              className="text-base text-muted-foreground hover:text-foreground"
            >
              About
            </a>
            <a
              href="/#contact"
              onClick={() => setMobileOpen(false)}
              className="text-base text-muted-foreground hover:text-foreground"
            >
              Contact
            </a>
            <div className="mt-2 border-t border-rule pt-4">
              <a
                href={DESIGNER_PROFILE.links.behance}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-1.5 text-base font-medium text-primary"
              >
                <span>Behance</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
