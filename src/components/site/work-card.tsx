import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Work } from "@/lib/works";
import { cn } from "@/lib/utils";

export type EditorialVariant = "lead" | "wide" | "tall" | "standard" | "offset";

interface WorkCardProps {
  work: Work;
  index: number;
  variant?: EditorialVariant;
  className?: string;
}

export function WorkCard({ work, index, variant = "standard", className }: WorkCardProps) {
  const num = String((index >= 0 ? index : 0) + 1).padStart(2, "0");
  const slideCount = work.gallery?.length ?? 0;

  if (variant === "lead") {
    return (
      <article className={cn("editorial-work group border-b border-rule pb-14 md:pb-20", className)}>
        <div className="grid gap-8 md:grid-cols-12 md:items-end md:gap-12">
          <div className="md:col-span-7 lg:col-span-8">
            <Link
              to="/works/$workId"
              params={{ workId: work.id }}
              className="editorial-work-media relative block overflow-hidden bg-surface"
            >
              <img
                src={work.imageSrc}
                alt={`${work.title}${work.subtitle ? ` — ${work.subtitle}` : ""}`}
                loading="eager"
                fetchPriority="high"
                className="block aspect-[808/632] w-full object-cover"
              />
              {slideCount > 0 && (
                <span className="absolute bottom-4 right-4 bg-foreground/80 px-2.5 py-1 font-mono-meta text-[10px] text-background backdrop-blur-xs">
                  Case study · {slideCount} plates
                </span>
              )}
            </Link>
          </div>

          <div className="flex flex-col justify-between md:col-span-5 lg:col-span-4">
            <div>
              <div className="flex items-center gap-3 font-mono-meta text-muted-foreground">
                <span className="text-primary">{num}</span>
                <span>/</span>
                <span>{work.category}</span>
                {work.year && (
                  <>
                    <span>·</span>
                    <span>{work.year}</span>
                  </>
                )}
              </div>

              <Link to="/works/$workId" params={{ workId: work.id }} className="mt-4 block">
                <h3 className="font-display text-3xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-4xl">
                  {work.title}
                  {work.subtitle && (
                    <span className="mt-1 block font-editorial text-2xl font-normal italic text-muted-foreground sm:text-3xl">
                      {work.subtitle}
                    </span>
                  )}
                </h3>
              </Link>

              {work.description && (
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {work.description}
                </p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-rule pt-5">
              <Link
                to="/works/$workId"
                params={{ workId: work.id }}
                className="editorial-link text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                Explore case study →
              </Link>
              {work.behanceUrl && (
                <a
                  href={work.behanceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span>Behance</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "editorial-work group flex flex-col",
        variant === "offset" && "md:mt-14",
        className,
      )}
    >
      <Link
        to="/works/$workId"
        params={{ workId: work.id }}
        className="editorial-work-media relative block overflow-hidden bg-surface"
      >
        <img
          src={work.imageSrc}
          alt={`${work.title}${work.subtitle ? ` — ${work.subtitle}` : ""}`}
          loading="lazy"
          className={cn(
            "block w-full object-cover",
            variant === "wide" ? "aspect-[16/11]" : "aspect-[808/632]",
          )}
        />
        {slideCount > 0 && (
          <span className="absolute bottom-3 right-3 bg-foreground/75 px-2 py-0.5 font-mono-meta text-[10px] text-background opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {slideCount} plates
          </span>
        )}
      </Link>

      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-rule pt-3.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-mono-meta text-[10px] text-muted-foreground">
            <span>{num}</span>
            <span>·</span>
            <span>{work.category}</span>
          </div>

          <Link to="/works/$workId" params={{ workId: work.id }} className="mt-1.5 block">
            <h3 className="font-display text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary md:text-2xl">
              {work.title}
              {work.subtitle && (
                <span className="ml-2 font-editorial text-lg font-normal italic text-muted-foreground md:text-xl">
                  — {work.subtitle}
                </span>
              )}
            </h3>
          </Link>

          {variant === "wide" && work.description && (
            <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {work.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 pt-1">
          {work.behanceUrl && (
            <a
              href={work.behanceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`View ${work.title} on Behance`}
              title="View on Behance"
              className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
