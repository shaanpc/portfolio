import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Work } from "@/lib/works";
import { cn } from "@/lib/utils";
import { Reveal } from "./scroll-reveal";

export type EditorialSlotVariant = "wide" | "tall" | "landscape" | "square" | "offset";

interface ProjectCardProps {
  work: Work;
  index: number;
  variant?: EditorialSlotVariant;
  className?: string;
  delay?: number;
}

const ASPECT_CLASSES: Record<EditorialSlotVariant, string> = {
  wide: "aspect-[16/10]",
  tall: "aspect-[4/5]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
  offset: "aspect-[5/4]",
};

export function ProjectCard({
  work,
  index,
  variant = "landscape",
  className,
  delay = 0,
}: ProjectCardProps) {
  const num = String((index >= 0 ? index : 0) + 1).padStart(2, "0");

  return (
    <Reveal delay={delay} className={className}>
      <article
        className={cn(
          "work-figure group flex flex-col",
          variant === "offset" && "md:mt-12",
          variant === "tall" && "md:mt-6",
        )}
      >
        <Link
          to="/work/$projectSlug"
          params={{ projectSlug: work.id }}
          className="work-figure-media block overflow-hidden bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <img
            src={work.imageSrc}
            alt={`${work.title}${work.subtitle ? ` — ${work.subtitle}` : ""}`}
            loading="lazy"
            className={cn("block w-full object-cover", ASPECT_CLASSES[variant])}
          />
        </Link>

        <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-rule pt-3">
          <Link
            to="/work/$projectSlug"
            params={{ projectSlug: work.id }}
            className="min-w-0 flex-1 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <p className="font-label text-[11px] text-muted-foreground">
              <span className="text-primary">{num}</span> · {work.category}
            </p>
            <h3 className="mt-1 font-heading text-xl font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary sm:text-2xl">
              {work.title}
              {work.subtitle ? (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  — {work.subtitle}
                </span>
              ) : null}
            </h3>
          </Link>

          {work.behanceUrl ? (
            <a
              href={work.behanceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${work.title} on Behance`}
              className="inline-flex shrink-0 items-center gap-1 font-label text-[11px] text-muted-foreground transition-colors hover:text-primary"
            >
              <span>Behance</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : (
            <Link
              to="/work/$projectSlug"
              params={{ projectSlug: work.id }}
              aria-label={`Open ${work.title}`}
              className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </article>
    </Reveal>
  );
}
