import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { DESIGNER_PROFILE } from "@/data/profile";
import { ARCHIVE_CATEGORIES, filterWorks, type Work } from "@/lib/works";
import { CategoryFilter } from "./category-filter";
import { ProjectCard, type ArchiveCardVariant } from "./project-card";
import { Reveal } from "./scroll-reveal";

interface ProjectArchiveProps {
  works: Work[];
  initialCategory?: string;
}

interface ArchiveSlot {
  spanClass: string;
  variant: ArchiveCardVariant;
}

function getArchiveSlot(pos: number): ArchiveSlot {
  const pattern: ArchiveSlot[] = [
    { spanClass: "md:col-span-7", variant: "wide" },
    { spanClass: "md:col-span-5", variant: "offset" },
    { spanClass: "md:col-span-5", variant: "tall" },
    { spanClass: "md:col-span-7", variant: "wide" },
    { spanClass: "md:col-span-4", variant: "standard" },
    { spanClass: "md:col-span-4", variant: "offset" },
    { spanClass: "md:col-span-4", variant: "standard" },
    { spanClass: "md:col-span-6", variant: "wide" },
    { spanClass: "md:col-span-6", variant: "standard" },
  ];
  return pattern[pos % pattern.length];
}

export function ProjectArchive({ works, initialCategory = "All" }: ProjectArchiveProps) {
  const [activeCategory, setActiveCategory] = useState(
    ARCHIVE_CATEGORIES.includes(initialCategory as (typeof ARCHIVE_CATEGORIES)[number])
      ? initialCategory
      : "All",
  );

  // Include default archive categories plus any custom categories added in Studio
  const categories = useMemo(() => {
    const base = new Set<string>(ARCHIVE_CATEGORIES);
    for (const w of works) {
      if (w.category) base.add(w.category);
    }
    return Array.from(base);
  }, [works]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: works.length };
    for (const cat of categories) {
      if (cat !== "All") {
        map[cat] = works.filter((w) => w.category === cat).length;
      }
    }
    return map;
  }, [categories, works]);

  const visibleWorks = useMemo(
    () => filterWorks(works, activeCategory),
    [works, activeCategory],
  );

  const indexById = useMemo(
    () => new Map(works.map((w, i) => [w.id, i])),
    [works],
  );

  return (
    <main className="mx-auto max-w-[1380px] px-6 pb-24 pt-12 md:px-14 md:pb-32 md:pt-14 lg:px-16">
      {/* Top breadcrumb bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5 font-mono-meta text-muted-foreground animate-editorial-rise">
        <Link
          to="/"
          className="inline-flex items-center gap-2 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Overview</span>
        </Link>
        <span>
          {String(visibleWorks.length).padStart(2, "0")} /{" "}
          {String(works.length).padStart(2, "0")} Projects
        </span>
      </div>

      {/* Editorial Archive Header */}
      <header className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12 md:items-end md:gap-12">
        <div className="md:col-span-7">
          <Reveal immediate variant="fade" delay={40}>
            <p className="font-mono-meta text-primary">Project Archive</p>
          </Reveal>
          <h1 className="mt-3 font-display text-[clamp(2.75rem,5.5vw,4.75rem)] font-normal leading-[1.02] tracking-[-0.02em] text-foreground">
            <Reveal immediate variant="line" delay={100}>
              All{" "}
              <span className="font-editorial italic font-normal text-primary">Projects</span>{" "}
              <span className="font-editorial text-[clamp(1.6rem,2.5vw,2.25rem)] font-normal italic text-muted-foreground">
                ({String(works.length).padStart(2, "0")})
              </span>
            </Reveal>
          </h1>
        </div>

        <div className="md:col-span-5">
          <Reveal immediate variant="fade" delay={180}>
            <p className="text-[15px] leading-[1.72] text-muted-foreground">
              <span className="font-editorial text-[17px] italic text-foreground">
                {DESIGNER_PROFILE.name}
              </span>{" "}
              — Complete archive of brand identity systems, luxury structural packaging,
              illustrated storytelling, social campaigns, and cinematic photo manipulations.
            </p>
          </Reveal>
        </div>
      </header>

      {/* Horizontal Category Filter */}
      <Reveal immediate variant="up" delay={220} className="mt-10 md:mt-14">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          counts={counts}
        />
      </Reveal>

      {/* Filtered Editorial Grid */}
      {visibleWorks.length === 0 ? (
        <div className="py-24 text-center animate-editorial-rise">
          <p className="font-editorial text-3xl italic text-muted-foreground">
            No projects published in {activeCategory} yet.
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory("All")}
            className="mt-6 cursor-pointer border-b border-primary pb-1 font-mono-meta text-[11px] text-primary transition-opacity hover:opacity-80"
          >
            View all {works.length} projects
          </button>
        </div>
      ) : (
        <div
          key={activeCategory}
          className="editorial-gallery mt-12 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-12 md:gap-x-10 md:gap-y-14"
        >
          {visibleWorks.map((work, pos) => {
            const slot = getArchiveSlot(pos);
            return (
              <div key={work.id} className={slot.spanClass}>
                <ProjectCard
                  work={work}
                  index={indexById.get(work.id) ?? pos}
                  mode="archive"
                  archiveVariant={slot.variant}
                  cardDelay={Math.min((pos % 3) * 85, 220)}
                />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
