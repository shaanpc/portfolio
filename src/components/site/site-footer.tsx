import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { DESIGNER_PROFILE } from "@/data/profile";
import { Reveal } from "./scroll-reveal";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="scroll-mt-16 border-t border-rule bg-background md:scroll-mt-4"
    >
      <div className="mx-auto max-w-[1380px] px-6 pb-28 pt-20 md:px-14 md:pb-32 md:pt-28 lg:px-16">
        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <Reveal delay={0}>
              <p className="font-label text-primary">Contact</p>
            </Reveal>
            <h2 className="mt-4 font-heading text-4xl font-medium leading-[1.06] text-foreground sm:text-5xl md:text-6xl">
              <Reveal delay={80}>
                What shall we{" "}
                <span className="italic font-normal text-muted-foreground">create</span>{" "}
                next?
              </Reveal>
            </h2>
            <Reveal delay={160}>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                {DESIGNER_PROFILE.availability} for brand identity, packaging concepts, illustrated
                storytelling, and creative campaign direction.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col items-start gap-4 md:col-span-5 md:items-end">
            <Reveal delay={160} className="w-full md:max-w-xs">
              <a
                href={DESIGNER_PROFILE.links.behance}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex w-full items-center justify-between border-b border-rule-strong pb-3 text-lg font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <span>Behance Portfolio</span>
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
            <Reveal delay={240} className="w-full md:max-w-xs">
              <a
                href={DESIGNER_PROFILE.links.contra}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex w-full items-center justify-between border-b border-rule-strong pb-3 text-lg font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <span>Hire / Message on Contra</span>
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          </div>
        </div>

        <Reveal delay={200}>
          <div className="mt-16 flex flex-col gap-4 border-t border-rule pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                © {year} {DESIGNER_PROFILE.name}
              </span>
              <span aria-hidden="true">·</span>
              <span>{DESIGNER_PROFILE.location}</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <a href="/#work" className="transition-colors hover:text-foreground">
                Things I Do
              </a>
              <Link to="/work" className="transition-colors hover:text-foreground">
                All Projects
              </Link>
              <a href="/#skills" className="transition-colors hover:text-foreground">
                Service
              </a>
              <Link to="/studio" className="transition-colors hover:text-foreground">
                Archive Studio
              </Link>
              <a
                href="#top"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="transition-colors hover:text-foreground"
              >
                Back to top ↑
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
