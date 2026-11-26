import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Work } from "@/lib/works";
import { cn } from "@/lib/utils";
import { ParallaxImage, Reveal } from "./scroll-reveal";

export type ShowcaseCardSize = "wide" | "landscape" | "square" | "portrait";
export type ArchiveCardVariant = "wide" | "standard" | "tall" | "offset";

interface ProjectCardProps {
  work: Work;
  index: number;
  mode?: "showcase" | "archive";
  showcaseSize?: ShowcaseCardSize;
  archiveVariant?: ArchiveCardVariant;
  className?: string;
  isDuplicate?: boolean;
  cardDelay?: number;
}

const SHOWCASE_FRAME_CLASSES: Record<ShowcaseCardSize, string> = {
  wide: "w-[270px] sm:w-[340px] lg:w-[410px] aspect-[16/10]",
  landscape: "w-[240px] sm:w-[300px] lg:w-[350px] aspect-[4/3]",
  square: "w-[215px] sm:w-[255px] lg:w-[295px] aspect-square",
  portrait: "w-[200px] sm:w-[235px] lg:w-[270px] aspect-[4/5]",
};

const ARCHIVE_ASPECT_CLASSES: Record<ArchiveCardVariant, string> = {
  wide: "aspect-[16/10]",
  standard: "aspect-[4/3]",
  tall: "aspect-[4/5]",
  offset: "aspect-[5/4]",
};

export function ProjectCard({
  work,
  index,
  mode = "archive",
  showcaseSize = "landscape",
  archiveVariant = "standard",
  className,
  isDuplicate = false,
  cardDelay = 0,
}: ProjectCardProps) {
  const num = String((index >= 0 ? index : 0) + 1).padStart(2, "0");

  if (mode === "showcase") {
    return (
      <Link
        to="/work/$projectSlug"
        params={{ projectSlug: work.id }}
        tabIndex={isDuplicate ? -1 : undefined}
        aria-hidden={isDuplicate || undefined}
        className={cn(
          "group relative block shrink-0 overflow-hidden border border-rule bg-surface transition-[transform,border-color] duration-500 ease-out hover:scale-[1.012] hover:border-primary/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          SHOWCASE_FRAME_CLASSES[showcaseSize],
          className,
        )}
      >
        <img
          src={work.imageSrc}
          alt={isDuplicate ? "" : `${work.title}${work.subtitle ? ` — ${work.subtitle}` : ""}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        />

        {/* Soft warm-ivory hover overlay with staggered category label and title reveal */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 border-t border-rule bg-background/92 px-4 py-3 backdrop-blur-md transition-all duration-300 ease-out",
            "opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100",
          )}
        >
          <div className="min-w-0">
            <p className="truncate font-mono-meta text-[10px] text-primary transition-all duration-300 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
              {num} · {work.category}
            </p>
            <h3 className="mt-0.5 truncate font-display text-lg leading-tight text-foreground transition-all delay-75 duration-300 sm:text-xl md:translate-y-1.5 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
              {work.title}
              {work.subtitle ? (
                <span className="ml-1.5 font-editorial text-sm italic text-muted-foreground">
                  {work.subtitle}
                </span>
              ) : null}
            </h3>
          </div>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden="true"
          />
        </div>
      </Link>
    );
  }

  return (
    <article
      className={cn(
        "editorial-work group flex flex-col border border-rule bg-surface/45 p-3.5 transition-colors duration-300 hover:border-primary/40 hover:bg-surface/80 sm:p-4",
        archiveVariant === "offset" && "md:mt-8",
        className,
      )}
    >
      <Link
        to="/work/$projectSlug"
        params={{ projectSlug: work.id }}
        className="editorial-work-media relative block overflow-hidden bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ParallaxImage delay={cardDelay} strength={12} overscan={1.045}>
          <img
            src={work.imageSrc}
            alt={`${work.title}${work.subtitle ? ` — ${work.subtitle}` : ""}`}
            loading="lazy"
            className={cn("block w-full object-cover", ARCHIVE_ASPECT_CLASSES[archiveVariant])}
          />
        </ParallaxImage>
      </Link>

      <Reveal
        variant="up"
        delay={cardDelay + 110}
        className="mt-4 flex flex-1 flex-col justify-between px-0.5 pb-0.5"
      >
        <div>
          <div className="flex items-center justify-between gap-2 font-mono-meta text-[10px] text-muted-foreground">
            <span className="truncate">
              <span className="text-primary">{num}</span> · {work.category}
            </span>
            {work.year && <span className="shrink-0">{work.year}</span>}
          </div>

          <Link
            to="/work/$projectSlug"
            params={{ projectSlug: work.id }}
            className="mt-2.5 flex items-baseline justify-between gap-3"
          >
            <h3 className="font-display text-2xl leading-tight font-normal text-foreground transition-colors duration-200 group-hover:text-primary sm:text-[1.65rem]">
              {work.title}
              {work.subtitle && (
                <span className="ml-2 font-editorial text-lg italic text-muted-foreground">
                  {work.subtitle}
                </span>
              )}
            </h3>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>

          {work.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {work.description}
            </p>
          )}
        </div>
      </Reveal>
    </article>
  );
}
