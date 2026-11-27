import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { DESIGNER_PROFILE } from "@/data/profile";
import { categoriesInUse, filterWorks, type Work } from "@/lib/works";
import { CategoryFilter } from "./category-filter";
import { ProjectCard, type EditorialSlotVariant } from "./project-card";
import { Reveal } from "./scroll-reveal";

interface ProjectArchiveProps {
  works: Work[];
  initialCategory?: string;
}

interface ArchiveSlot {
  spanClass: string;
  variant: EditorialSlotVariant;
}

function getArchiveSlot(pos: number): ArchiveSlot {
  const pattern: ArchiveSlot[] = [
    { spanClass: "md:col-span-7", variant: "wide" },
    { spanClass: "md:col-span-5", variant: "tall" },
    { spanClass: "md:col-span-5", variant: "landscape" },
    { spanClass: "md:col-span-7", variant: "offset" },
    { spanClass: "md:col-span-4", variant: "tall" },
    { spanClass: "md:col-span-4", variant: "square" },
    { spanClass: "md:col-span-4", variant: "landscape" },
  ];
  return pattern[pos % pattern.length];
}

export function ProjectArchive({ works, initialCategory = "All" }: ProjectArchiveProps) {
  const categories = useMemo(() => categoriesInUse(works), [works]);
  const [activeCategory, setActiveCategory] = useState(
    categories.includes(initialCategory) ? initialCategory : "All",
  );

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
    <main className="mx-auto max-w-[1360px] px-6 pb-24 pt-10 md:px-12 md:pb-32 md:pt-14 lg:px-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5 font-label text-[11px] text-muted-foreground">
        <Link to="/" className="inline-flex items-center gap-2 transition-colors hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Home</span>
        </Link>
        <span>
          {String(visibleWorks.length).padStart(2, "0")} /{" "}
          {String(works.length).padStart(2, "0")} Projects
        </span>
      </div>

      <header className="mt-12 grid gap-8 md:mt-16 md:grid-cols-12 md:items-end md:gap-12">
        <div className="md:col-span-7">
          <p className="font-label text-primary">Archive</p>
          <h1 className="mt-3 font-heading text-4xl font-medium text-foreground sm:text-5xl md:text-6xl">
            All Projects ({String(works.length).padStart(2, "0")})
          </h1>
        </div>

        <div className="md:col-span-5">
          <p className="text-[15px] leading-[1.7] text-muted-foreground">
            {DESIGNER_PROFILE.name} — Published brand identities, packaging concepts,
            illustrated storytelling, social campaigns, and photo manipulations.
          </p>
        </div>
      </header>

      <Reveal immediate className="mt-10 md:mt-12">
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
          counts={counts}
        />
      </Reveal>

      {visibleWorks.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-xl text-muted-foreground">
            No projects published in {activeCategory} yet.
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory("All")}
            className="mt-6 cursor-pointer border-b border-primary pb-1 font-label text-[11px] text-primary"
          >
            View all {works.length} projects
          </button>
        </div>
      ) : (
        <div
          key={activeCategory}
          className="work-grid mt-12 grid grid-cols-1 gap-x-10 gap-y-14 md:mt-16 md:grid-cols-12 md:gap-y-20"
        >
          {visibleWorks.map((work, pos) => {
            const slot = getArchiveSlot(pos);
            return (
              <ProjectCard
                key={work.id}
                work={work}
                index={indexById.get(work.id) ?? pos}
                variant={slot.variant}
                delay={(pos % 3) * 70}
                className={slot.spanClass}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
