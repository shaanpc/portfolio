import { Pause, Play } from "lucide-react";
import { useState } from "react";
import type { Work } from "@/lib/works";
import { ProjectCard, type ShowcaseCardSize } from "./project-card";
import { Reveal } from "./scroll-reveal";

interface AnimatedProjectGalleryProps {
  works: Work[];
}

const TOP_ROW_SIZES: ShowcaseCardSize[] = [
  "wide",
  "portrait",
  "landscape",
  "square",
  "wide",
  "landscape",
];

const BOTTOM_ROW_SIZES: ShowcaseCardSize[] = [
  "landscape",
  "square",
  "wide",
  "portrait",
  "landscape",
  "square",
];

export function AnimatedProjectGallery({ works }: AnimatedProjectGalleryProps) {
  const [isPaused, setIsPaused] = useState(false);

  if (works.length === 0) return null;

  const indexById = new Map(works.map((w, i) => [w.id, i]));
  const midpoint = Math.ceil(works.length / 2);
  const topRow = works.slice(0, midpoint);
  const bottomRow = works.slice(midpoint);

  return (
    <div className="mt-10 md:mt-14">
      <div
        data-paused={isPaused ? "true" : "false"}
        className="gallery-marquee-viewport relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]"
      >
        {/* Top row: progressive staggered card reveals + slow continuous drift */}
        <div className="overflow-x-auto no-scrollbar md:overflow-visible">
          <div className="gallery-marquee-track items-end gap-5 pr-5 md:gap-7 md:pr-7">
            {topRow.map((work, i) => (
              <Reveal
                key={`top-a-${work.id}`}
                variant="up"
                delay={180 + Math.min(i * 75, 360)}
                className="shrink-0"
              >
                <ProjectCard
                  work={work}
                  index={indexById.get(work.id) ?? i}
                  mode="showcase"
                  showcaseSize={TOP_ROW_SIZES[i % TOP_ROW_SIZES.length]}
                />
              </Reveal>
            ))}
            {topRow.map((work, i) => (
              <ProjectCard
                key={`top-b-${work.id}`}
                work={work}
                index={indexById.get(work.id) ?? i}
                mode="showcase"
                showcaseSize={TOP_ROW_SIZES[i % TOP_ROW_SIZES.length]}
                isDuplicate
              />
            ))}
          </div>
        </div>

        {/* Bottom row: staggered card reveals + slow counter-drift */}
        {bottomRow.length > 0 && (
          <div className="mt-5 overflow-x-auto no-scrollbar md:mt-7 md:overflow-visible">
            <div className="gallery-marquee-track-reverse items-start gap-5 pr-5 md:gap-7 md:pr-7">
              {bottomRow.map((work, i) => (
                <Reveal
                  key={`bot-a-${work.id}`}
                  variant="up"
                  delay={280 + Math.min(i * 75, 360)}
                  className="shrink-0"
                >
                  <ProjectCard
                    work={work}
                    index={indexById.get(work.id) ?? midpoint + i}
                    mode="showcase"
                    showcaseSize={BOTTOM_ROW_SIZES[i % BOTTOM_ROW_SIZES.length]}
                  />
                </Reveal>
              ))}
              {bottomRow.map((work, i) => (
                <ProjectCard
                  key={`bot-b-${work.id}`}
                  work={work}
                  index={indexById.get(work.id) ?? midpoint + i}
                  mode="showcase"
                  showcaseSize={BOTTOM_ROW_SIZES[i % BOTTOM_ROW_SIZES.length]}
                  isDuplicate
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtle ambient motion status & manual pause control */}
      <Reveal variant="fade" delay={240}>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4">
          <p className="font-mono-meta text-[10px] text-muted-foreground">
            {String(works.length).padStart(2, "0")} selected works · Hover to pause · Click any
            piece to inspect
          </p>

          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-pressed={isPaused}
            className="inline-flex cursor-pointer items-center gap-2 font-mono-meta text-[10px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            {isPaused ? (
              <>
                <Play className="h-3 w-3 text-primary" aria-hidden="true" />
                <span>Resume stream</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3" aria-hidden="true" />
                <span>Pause stream</span>
              </>
            )}
          </button>
        </div>
      </Reveal>
    </div>
  );
}
