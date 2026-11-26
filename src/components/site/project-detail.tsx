import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Work } from "@/lib/works";
import { ProjectNavigation } from "./project-navigation";
import { ParallaxImage, Reveal } from "./scroll-reveal";

interface ProjectDetailProps {
  works: Work[];
  projectSlug: string;
}

export function ProjectDetail({ works, projectSlug }: ProjectDetailProps) {
  const router = useRouter();
  const idx = works.findIndex((w) => w.id === projectSlug);
  const work = idx >= 0 ? works[idx] : undefined;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const allImages = work ? [work.imageSrc, ...(work.gallery ?? [])] : [];

  useEffect(() => {
    setLightboxIndex(null);
    window.scrollTo({ top: 0 });
  }, [projectSlug]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % allImages.length,
        );
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev - 1 + allImages.length) % allImages.length,
        );
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, allImages.length]);

  function handleCloseToGallery() {
    if (window.history.length > 1) {
      router.history.back();
      return;
    }
    void router.navigate({ to: "/", hash: "things-i-do" });
  }

  if (!work) {
    return (
      <main className="mx-auto flex w-full max-w-[1380px] flex-1 flex-col justify-center px-6 py-28 md:px-14 lg:px-16">
        <p className="font-mono-meta text-primary">Project Not Found</p>
        <h1 className="mt-4 font-display text-4xl font-normal md:text-6xl">
          Piece not in archive.
        </h1>
        <div className="mt-8 flex flex-wrap gap-6">
          <Link
            to="/work"
            className="editorial-link editorial-link-accent pb-1 font-editorial text-xl italic text-foreground transition-colors hover:text-primary"
          >
            Back to All Projects
          </Link>
        </div>
      </main>
    );
  }

  const prevWork =
    works.length > 1 ? works[(idx - 1 + works.length) % works.length] : undefined;
  const nextWork = works.length > 1 ? works[(idx + 1) % works.length] : undefined;
  const gallerySlides = work.gallery ?? [];

  return (
    <div key={work.id} className="animate-editorial-rise">
      <main className="mx-auto max-w-[1380px] px-6 pb-20 pt-10 md:px-14 md:pb-28 md:pt-14 lg:px-16">
        {/* Top utility & close bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5">
          <Link
            to="/work"
            className="editorial-link editorial-link-accent inline-flex items-center gap-2 pb-0.5 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to All Projects</span>
          </Link>

          <div className="flex flex-wrap items-center gap-5 text-sm">
            {work.behanceUrl && (
              <a
                href={work.behanceUrl}
                target="_blank"
                rel="noreferrer"
                className="editorial-link editorial-link-accent inline-flex items-center gap-1 pb-0.5 font-medium text-foreground transition-colors hover:text-primary"
              >
                <span>Behance</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            {work.contraUrl && (
              <a
                href={work.contraUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <span>Contra</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}

            <button
              type="button"
              onClick={handleCloseToGallery}
              aria-label="Close project details and return to gallery"
              className="inline-flex cursor-pointer items-center gap-1.5 border border-rule px-3 py-1.5 font-mono-meta text-[10px] text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span>Close</span>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Project Introduction */}
        <header className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <Reveal immediate variant="fade" delay={30}>
              <div className="flex items-center gap-3 font-mono-meta text-muted-foreground">
                <span className="text-primary">{String(idx + 1).padStart(2, "0")}</span>
                <span>/</span>
                <span>{work.category}</span>
                {work.year && (
                  <>
                    <span>·</span>
                    <span>{work.year}</span>
                  </>
                )}
              </div>
            </Reveal>

            <h1 className="mt-4 font-display text-[clamp(2.65rem,5.5vw,4.65rem)] font-normal leading-[1.03] tracking-[-0.02em] text-foreground">
              <Reveal immediate variant="line" delay={80}>
                {work.title}
              </Reveal>
            </h1>
            {work.subtitle && (
              <Reveal immediate variant="fade" delay={140}>
                <p className="mt-2 font-editorial text-2xl italic text-muted-foreground sm:text-3xl">
                  {work.subtitle}
                </p>
              </Reveal>
            )}
          </div>

          <div className="flex flex-col justify-end md:col-span-5">
            {work.description && (
              <Reveal immediate variant="fade" delay={160}>
                <p className="text-base leading-[1.72] text-muted-foreground md:text-[17px]">
                  {work.description}
                </p>
              </Reveal>
            )}
          </div>
        </header>

        {/* Project Details Strip */}
        <Reveal immediate variant="fade" delay={200}>
          <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-rule py-6 sm:grid-cols-4">
            <div>
              <dt className="font-mono-meta text-[10px] text-muted-foreground">Category</dt>
              <dd className="mt-1.5 text-sm font-medium text-foreground">{work.category}</dd>
            </div>
            {work.client && (
              <div>
                <dt className="font-mono-meta text-[10px] text-muted-foreground">Context</dt>
                <dd className="mt-1.5 text-sm font-medium text-foreground">{work.client}</dd>
              </div>
            )}
            {work.year && (
              <div>
                <dt className="font-mono-meta text-[10px] text-muted-foreground">Year</dt>
                <dd className="mt-1.5 text-sm font-medium text-foreground">{work.year}</dd>
              </div>
            )}
            {work.medium && (
              <div>
                <dt className="font-mono-meta text-[10px] text-muted-foreground">
                  Tools &amp; Techniques
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-foreground">{work.medium}</dd>
              </div>
            )}
          </dl>
        </Reveal>

        {/* Prominent Hero Visual */}
        <ParallaxImage
          immediate
          delay={220}
          strength={10}
          overscan={1}
          className="mt-12 border border-rule bg-surface md:mt-16"
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="group block w-full cursor-zoom-in overflow-hidden text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-primary"
            aria-label={`Inspect ${work.title} artwork full screen`}
          >
            <img
              src={work.imageSrc}
              alt={`${work.title}${work.subtitle ? ` — ${work.subtitle}` : ""}`}
              className="mx-auto block max-h-[82vh] w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
          </button>
        </ParallaxImage>

        {/* Project Information (Overview & Concept) */}
        {(work.story || work.description) && (
          <section className="mt-14 grid gap-8 border-t border-rule pt-12 md:mt-20 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <Reveal variant="fade" delay={0}>
                <p className="font-mono-meta text-primary">Project Information</p>
              </Reveal>
              <h2 className="mt-2 font-display text-3xl font-normal text-foreground">
                <Reveal variant="line" delay={80}>
                  Concept &amp; approach
                </Reveal>
              </h2>
            </div>
            <div className="space-y-6 md:col-span-8">
              {work.description && (
                <Reveal variant="fade" delay={120}>
                  <div>
                    <p className="font-mono-meta text-[10px] text-muted-foreground">Overview</p>
                    <p className="mt-2 max-w-2xl text-base leading-[1.75] text-foreground/90">
                      {work.description}
                    </p>
                  </div>
                </Reveal>
              )}
              {work.story && (
                <Reveal variant="fade" delay={200}>
                  <div>
                    <p className="font-mono-meta text-[10px] text-muted-foreground">
                      Creative Concept &amp; Execution
                    </p>
                    <p className="mt-2 max-w-2xl text-base leading-[1.75] text-muted-foreground">
                      {work.story}
                    </p>
                  </div>
                </Reveal>
              )}
            </div>
          </section>
        )}

        {/* Complete Project Gallery Plates */}
        {gallerySlides.length > 0 && (
          <section className="mt-16 border-t border-rule pt-12 md:mt-20">
            <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <Reveal variant="fade" delay={0}>
                  <p className="font-mono-meta text-primary">Project Gallery</p>
                </Reveal>
                <h2 className="mt-1 font-display text-3xl font-normal text-foreground">
                  <Reveal variant="line" delay={80}>
                    Visual plates
                  </Reveal>
                </h2>
              </div>
              <span className="font-mono-meta text-[10px] text-muted-foreground">
                {String(gallerySlides.length).padStart(2, "0")} plates · Click any image to expand
              </span>
            </div>

            <div className="space-y-10 md:space-y-14">
              {gallerySlides.map((slideUrl, i) => (
                <figure key={slideUrl} className="space-y-3">
                  <ParallaxImage
                    delay={60}
                    strength={10}
                    overscan={1}
                    className="border border-rule bg-surface transition-colors duration-300 hover:border-primary/40"
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(i + 1)}
                      className="group block w-full cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label={`Open ${work.title} plate ${i + 1} full screen`}
                    >
                      <img
                        src={slideUrl}
                        alt={`${work.title} — visual plate ${i + 1}`}
                        loading="lazy"
                        className="mx-auto block w-full max-w-[1180px] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.008]"
                      />
                    </button>
                  </ParallaxImage>
                  <Reveal variant="fade" delay={140}>
                    <figcaption className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono-meta text-[10px]">
                        Plate {String(i + 1).padStart(2, "0")} /{" "}
                        {String(gallerySlides.length).padStart(2, "0")}
                      </span>
                      <span>{work.title}</span>
                    </figcaption>
                  </Reveal>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* Previous & Next Project Navigation */}
        <ProjectNavigation prevWork={prevWork} nextWork={nextWork} />
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${work.title} image viewer`}
          className="fixed inset-0 z-50 flex flex-col bg-foreground/95 p-4 text-background md:p-8"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono-meta text-[11px] text-background/70">
              {work.title} — {String(lightboxIndex + 1).padStart(2, "0")} /{" "}
              {String(allImages.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close image viewer"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center text-background/80 transition-colors hover:text-background"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
            {allImages.length > 1 && (
              <button
                type="button"
                aria-label="Previous image"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev === null ? null : (prev - 1 + allImages.length) % allImages.length,
                  )
                }
                className="absolute left-2 z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <img
              src={allImages[lightboxIndex]}
              alt={`${work.title} — fullscreen view ${lightboxIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {allImages.length > 1 && (
              <button
                type="button"
                aria-label="Next image"
                onClick={() =>
                  setLightboxIndex((prev) =>
                    prev === null ? null : (prev + 1) % allImages.length,
                  )
                }
                className="absolute right-2 z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
