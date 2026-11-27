import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { type Work } from "@/lib/works";
import { Reveal } from "./scroll-reveal";

interface SelectedWorkProps {
  works: Work[];
}

function getWorkTags(work: Work): string[] {
  const tags: string[] = [work.category];
  if (work.medium) {
    for (const part of work.medium.split("·")) {
      const cleaned = part.trim();
      if (cleaned && !tags.includes(cleaned)) {
        tags.push(cleaned);
      }
    }
  }
  return tags.slice(0, 4);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function SelectedWork({ works }: SelectedWorkProps) {
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  const visibleWorks = works;

  const indexById = useMemo(() => new Map(works.map((w, i) => [w.id, i])), [works]);

  // Sticky stacking card depth animation driven by scroll position
  useEffect(() => {
    const count = visibleWorks.length;
    const slots = slotRefs.current.slice(0, count);
    const cards = cardRefs.current.slice(0, count);

    const resetStyles = () => {
      for (const card of cards) {
        if (!card) continue;
        card.style.transform = "";
        card.style.filter = "";
        card.style.opacity = "";
      }
    };

    if (typeof window === "undefined" || count === 0) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 768px)");

    let rafId = 0;

    const updateStack = () => {
      rafId = 0;
      if (motionQuery.matches || !desktopQuery.matches) {
        resetStyles();
        return;
      }

      const stickyTop = 96; // matches md:top-24 (6rem)
      const tops = slots.map((el) => (el ? el.getBoundingClientRect().top : Infinity));
      const heights = cards.map((el) => (el ? el.offsetHeight : 440));

      for (let i = 0; i < count; i += 1) {
        const card = cards[i];
        if (!card) continue;

        const nextTop = i + 1 < count ? tops[i + 1] : Infinity;
        const cardH = Math.max(heights[i], 280);
        const primaryCover = clamp((stickyTop + cardH - nextTop) / cardH, 0, 1);

        const nextTwoTop = i + 2 < count ? tops[i + 2] : Infinity;
        const secondaryCover = clamp((stickyTop + cardH - nextTwoTop) / cardH, 0, 1);

        const depth = primaryCover + secondaryCover * 0.45;

        if (depth <= 0.001) {
          card.style.transform = "translate3d(0, 0, 0) scale(1)";
          card.style.filter = "brightness(1)";
          card.style.opacity = "1";
          continue;
        }

        const scale = 1 - Math.min(depth * 0.048, 0.09);
        const translateY = -Math.min(depth * 18, 28);
        const brightness = 1 - Math.min(depth * 0.14, 0.22);

        card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        card.style.filter = `brightness(${brightness.toFixed(3)})`;
        card.style.opacity = "1";
      }
    };

    const scheduleUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateStack);
    };

    updateStack();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    motionQuery.addEventListener("change", scheduleUpdate);
    desktopQuery.addEventListener("change", scheduleUpdate);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      motionQuery.removeEventListener("change", scheduleUpdate);
      desktopQuery.removeEventListener("change", scheduleUpdate);
      resetStyles();
    };
  }, [visibleWorks]);

  return (
    <section
      id="work"
      aria-labelledby="selected-works-heading"
      className="scroll-mt-20 border-t border-rule bg-[var(--color-section-alt)]"
    >
      <div className="mx-auto max-w-[1360px] px-6 py-20 md:px-12 md:py-28 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Reveal variant="fade">
              <p className="font-label text-primary">SELECTED WORKS</p>
            </Reveal>
            <Reveal variant="up" delay={70}>
              <h2
                id="selected-works-heading"
                className="mt-3 font-heading text-3xl font-medium tracking-[-0.025em] text-foreground sm:text-4xl md:text-5xl"
              >
                Things I&apos;ve Created.
              </h2>
            </Reveal>
            <Reveal variant="fade" delay={130}>
              <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-muted-foreground">
                Selected identity systems, packaging concepts, editorial illustrations, and visual
                campaigns crafted across independent commissions and studio explorations.
              </p>
            </Reveal>
          </div>

          <Reveal variant="fade" delay={160}>
            <Link
              to="/work"
              className="group inline-flex items-center gap-2 border-b border-rule-strong pb-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <span>Complete archive ({String(works.length).padStart(2, "0")})</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        </div>

        {visibleWorks.length === 0 ? (
          <p className="py-20 text-center text-lg text-[#66645e]">
            No projects published yet.
          </p>
        ) : (
          <div className="mt-12 space-y-8 md:mt-16 md:space-y-24 lg:space-y-28">
            {visibleWorks.map((work, pos) => {
              const displayIndex = (indexById.get(work.id) ?? pos) + 1;
              const num = String(displayIndex).padStart(2, "0");
              const tags = getWorkTags(work);
              const isLast = pos === visibleWorks.length - 1;

              const cardNode = (
                <div
                  key={work.id}
                  ref={(el) => {
                    slotRefs.current[pos] = el;
                  }}
                  style={isLast ? undefined : { zIndex: pos + 1 }}
                  className={
                    isLast
                      ? "md:sticky md:top-[max(6rem,calc(50vh-250px))] motion-reduce:md:static"
                      : "md:sticky md:top-24 motion-reduce:md:static"
                  }
                >
                  <article
                    ref={(el) => {
                      cardRefs.current[pos] = el;
                    }}
                    className="group grid origin-top overflow-hidden rounded-[22px] bg-[#191917] shadow-[0_28px_70px_-24px_rgba(21,21,19,0.26),0_8px_24px_-6px_rgba(21,21,19,0.12)] will-change-[transform,filter] transition-shadow duration-300 hover:shadow-[0_36px_80px_-24px_rgba(21,21,19,0.34)] sm:rounded-[28px] md:grid-cols-12"
                  >
                    {/* Left Large Project Preview Image */}
                    <div className="md:col-span-7">
                      <Link
                        to="/work/$projectSlug"
                        params={{ projectSlug: work.id }}
                        aria-label={`Open project: ${work.title}`}
                        className="relative block h-full min-h-[250px] overflow-hidden bg-[#242421] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c4492b] sm:min-h-[340px] md:min-h-[420px] lg:min-h-[470px]"
                      >
                        <img
                          src={work.imageSrc}
                          alt={`${work.title}${work.subtitle ? ` — ${work.subtitle}` : ""}`}
                          loading={pos < 2 ? "eager" : "lazy"}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                        />
                      </Link>
                    </div>

                    {/* Right Dark Charcoal Information Panel */}
                    <div className="flex flex-col justify-between bg-[#191917] p-7 sm:p-9 md:col-span-5 md:p-10 lg:p-12">
                      <div>
                        {/* Number + Category */}
                        <div className="flex flex-wrap items-center gap-2.5 font-label text-[11px] tracking-[0.09em]">
                          <span className="text-[#d96243]">{num}</span>
                          <span aria-hidden="true" className="text-white/25">
                            /
                          </span>
                          <span className="text-[#a4a29a]">{work.category}</span>
                          {work.year && (
                            <>
                              <span aria-hidden="true" className="text-white/25">
                                ·
                              </span>
                              <span className="text-[#7f7d76]">{work.year}</span>
                            </>
                          )}
                        </div>

                        {/* Title + Subtitle */}
                        <Link
                          to="/work/$projectSlug"
                          params={{ projectSlug: work.id }}
                          className="mt-4 block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4492b]"
                        >
                          <h3 className="font-heading text-2xl font-medium leading-[1.16] tracking-[-0.02em] text-[#f7f5f0] transition-colors duration-200 hover:text-white sm:text-3xl lg:text-[2.1rem]">
                            {work.title}
                          </h3>
                          {work.subtitle && (
                            <p className="mt-1.5 text-sm text-[#a4a29a]">{work.subtitle}</p>
                          )}
                        </Link>

                        {/* Short Description */}
                        {work.description && (
                          <p className="mt-5 text-[14.5px] leading-[1.7] text-[#c7c5be]">
                            {work.description}
                          </p>
                        )}

                        {/* Relevant Service / Discipline Tags */}
                        {tags.length > 0 && (
                          <ul
                            aria-label="Project services and disciplines"
                            className="mt-6 flex flex-wrap gap-2"
                          >
                            {tags.map((tag) => (
                              <li
                                key={tag}
                                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-label text-[10px] tracking-[0.06em] text-[#b5b3ac]"
                              >
                                {tag}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Card Footer Links */}
                      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                        <Link
                          to="/work/$projectSlug"
                          params={{ projectSlug: work.id }}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#e06a4b] transition-colors duration-200 hover:text-[#f1886b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c4492b]"
                        >
                          <span>View Project</span>
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </Link>

                        {work.behanceUrl && (
                          <a
                            href={work.behanceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#9b9991] transition-colors hover:text-[#f7f5f0]"
                          >
                            <span>Behance</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              );

              if (!isLast) return cardNode;

              return (
                <div
                  key={work.id}
                  style={{ zIndex: pos + 1 }}
                  className="relative"
                >
                  {cardNode}
                  <div
                    aria-hidden="true"
                    className="hidden md:block md:h-[100vh] motion-reduce:md:hidden"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
