import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WorkCard, type EditorialVariant } from "@/components/site/work-card";
import { DESIGNER_PROFILE } from "@/data/profile";
import { categoriesInUse, filterWorks, worksQueryOptions, type Work } from "@/lib/works";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shan pc — Graphic Designer & Visual Storyteller" },
      {
        name: "description",
        content:
          "Portfolio of Shan pc — independent graphic designer in Kozhikode, India working across brand identity, packaging, illustration, ad campaigns, and photo manipulation.",
      },
      { property: "og:title", content: "Shan pc — Graphic Designer & Visual Storyteller" },
      {
        property: "og:description",
        content:
          "Brand identity, packaging design, illustrated storytelling, social media campaigns, and photo manipulation by Shan pc.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(worksQueryOptions()),
  component: Index,
});

interface LayoutSlot {
  spanClass: string;
  variant: EditorialVariant;
}

/**
 * Assigns an asymmetric editorial rhythm so projects are visually distinct
 * rather than rendered as identical, repetitive cards.
 */
function getEditorialSlot(position: number): LayoutSlot {
  const pattern: LayoutSlot[] = [
    { spanClass: "md:col-span-7", variant: "wide" },
    { spanClass: "md:col-span-5", variant: "offset" },
    { spanClass: "md:col-span-5", variant: "standard" },
    { spanClass: "md:col-span-7", variant: "wide" },
    { spanClass: "md:col-span-4", variant: "standard" },
    { spanClass: "md:col-span-4", variant: "offset" },
    { spanClass: "md:col-span-4", variant: "standard" },
    { spanClass: "md:col-span-6", variant: "wide" },
    { spanClass: "md:col-span-6", variant: "standard" },
    { spanClass: "md:col-span-5", variant: "offset" },
    { spanClass: "md:col-span-7", variant: "wide" },
  ];
  return pattern[position % pattern.length];
}

function Index() {
  const { data: works } = useSuspenseQuery(worksQueryOptions());
  const [category, setCategory] = useState("All");

  const filters = categoriesInUse(works);
  const visible = filterWorks(works, category);

  // When showing "All", spotlight the featured piece as the opening editorial spread
  const leadWork: Work | undefined =
    category === "All" ? (visible.find((w) => w.featured) ?? visible[0]) : undefined;
  const gridWorks = leadWork ? visible.filter((w) => w.id !== leadWork.id) : visible;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="mx-auto max-w-[1380px] px-6 pb-16 pt-14 md:px-12 md:pb-24 md:pt-24">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5 font-mono-meta text-muted-foreground animate-editorial-rise">
          <span>{DESIGNER_PROFILE.role}</span>
          <span>
            {DESIGNER_PROFILE.availability} · {DESIGNER_PROFILE.location}
          </span>
        </div>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:items-end md:gap-12">
          <div className="md:col-span-8 animate-editorial-rise" style={{ animationDelay: "80ms" }}>
            <h1 className="font-display text-[clamp(2.4rem,5.4vw,4.75rem)] font-medium leading-[1.03] tracking-[-0.035em] text-foreground">
              Visual stories,{" "}
              <span className="font-editorial italic font-normal text-primary">
                brand identities
              </span>{" "}
              &amp; campaigns crafted to stay in mind.
            </h1>
          </div>

          <div
            className="flex flex-col justify-end gap-6 md:col-span-4 animate-editorial-rise"
            style={{ animationDelay: "160ms" }}
          >
            <p className="text-base leading-relaxed text-muted-foreground">
              <strong className="font-medium text-foreground">{DESIGNER_PROFILE.name}</strong> —{" "}
              {DESIGNER_PROFILE.intro}
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <a
                href="#work"
                className="editorial-link inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                <span>Explore selected work</span>
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </a>

              <a
                href={DESIGNER_PROFILE.links.behance}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>Behance</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Work */}
      <section id="work" className="scroll-mt-16 border-t border-rule">
        <div className="mx-auto max-w-[1380px] px-6 py-16 md:px-12 md:py-24">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono-meta text-primary">Selected Work</p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">
                Archive{" "}
                <span className="font-editorial text-2xl font-normal italic text-muted-foreground md:text-3xl">
                  ({String(visible.length).padStart(2, "0")})
                </span>
              </h2>
            </div>

            <div
              className="flex flex-wrap items-center gap-x-5 gap-y-2.5"
              role="tablist"
              aria-label="Filter projects by discipline"
            >
              {filters.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "cursor-pointer border-b pb-1 text-sm transition-colors",
                      active
                        ? "border-primary font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-16 font-editorial text-3xl italic text-muted-foreground">
              No projects published in {category.toLowerCase()} yet.
            </p>
          ) : (
            <div className="editorial-gallery mt-12 md:mt-16">
              {leadWork && (
                <WorkCard
                  work={leadWork}
                  index={works.indexOf(leadWork)}
                  variant="lead"
                  className="mb-14 md:mb-20"
                />
              )}

              {gridWorks.length > 0 && (
                <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-12 md:gap-x-10 md:gap-y-20">
                  {gridWorks.map((work, pos) => {
                    const slot = getEditorialSlot(pos);
                    return (
                      <WorkCard
                        key={work.id}
                        work={work}
                        index={works.indexOf(work)}
                        variant={slot.variant}
                        className={slot.spanClass}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-16 border-t border-rule">
        <div className="mx-auto max-w-[1380px] px-6 py-20 md:px-12 md:py-28">
          <div className="grid gap-12 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <p className="font-mono-meta text-primary">About</p>
              <dl className="mt-8 space-y-5 border-t border-rule pt-6 text-sm">
                <div>
                  <dt className="font-mono-meta text-[10px] text-muted-foreground">Designer</dt>
                  <dd className="mt-1 font-medium text-foreground">{DESIGNER_PROFILE.name}</dd>
                </div>
                <div>
                  <dt className="font-mono-meta text-[10px] text-muted-foreground">Based in</dt>
                  <dd className="mt-1 text-foreground">{DESIGNER_PROFILE.location}</dd>
                </div>
                <div>
                  <dt className="font-mono-meta text-[10px] text-muted-foreground">
                    Primary Tools
                  </dt>
                  <dd className="mt-1 text-foreground">{DESIGNER_PROFILE.tools.join(" · ")}</dd>
                </div>
              </dl>
            </div>

            <div className="md:col-span-8">
              <h2 className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {DESIGNER_PROFILE.aboutLead}
              </h2>

              <div className="mt-10 grid gap-8 text-base leading-relaxed text-muted-foreground md:grid-cols-2">
                {DESIGNER_PROFILE.aboutParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Capabilities */}
      <section id="capabilities" className="scroll-mt-16 border-t border-rule bg-surface/65">
        <div className="mx-auto max-w-[1380px] px-6 py-20 md:px-12 md:py-24">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <p className="font-mono-meta text-primary">Disciplines</p>
              <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-foreground md:text-3xl">
                Capabilities &amp; craft
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Built across sketchbook studies, vector systems, packaging mockups, and composite
                retouching.
              </p>
            </div>

            <div className="md:col-span-8">
              <ul className="divide-y divide-rule border-y border-rule">
                {DESIGNER_PROFILE.capabilities.map((cap, idx) => (
                  <li
                    key={cap.title}
                    className="grid gap-2 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6"
                  >
                    <span className="font-mono-meta text-[10px] text-muted-foreground sm:col-span-1">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display text-lg font-medium text-foreground sm:col-span-5">
                      {cap.title}
                    </h3>
                    <p className="text-sm text-muted-foreground sm:col-span-6">{cap.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
