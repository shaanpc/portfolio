import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, PenSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Work } from "@/lib/works";
import { ProjectNavigation } from "./project-navigation";
import { Reveal } from "./scroll-reveal";

interface ProjectDetailProps {
  works: Work[];
  projectSlug: string;
}

export function ProjectDetail({ works, projectSlug }: ProjectDetailProps) {
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

  if (!work) {
    return (
      <main className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-center px-6 py-28 md:px-12 lg:px-16">
        <p className="font-label text-primary">Project Not Found</p>
        <h1 className="mt-4 font-heading text-4xl font-medium md:text-6xl">
          Piece not in archive.
        </h1>
        <div className="mt-8">
          <Link
            to="/work"
            className="border-b border-foreground pb-1 text-base font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
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
    <main className="mx-auto max-w-[1360px] px-6 pb-20 pt-10 md:px-12 md:pb-28 md:pt-14 lg:px-16">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5">
        <Link
          to="/work"
          className="inline-flex items-center gap-2 font-label text-[11px] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>All Projects</span>
        </Link>

        <div className="flex flex-wrap items-center gap-5 text-sm">
          {work.behanceUrl && (
            <a
              href={work.behanceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
            >
              <span>View on Behance</span>
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
          <Link
            to="/studio"
            search={{ edit: work.id }}
            className="inline-flex items-center gap-1.5 border border-rule px-3 py-1 font-label text-[10px] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            <PenSquare className="h-3 w-3" aria-hidden="true" />
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <p className="font-label text-muted-foreground">
            <span className="text-primary">{String(idx + 1).padStart(2, "0")}</span> /{" "}
            {work.category}
            {work.year ? ` · ${work.year}` : ""}
          </p>
          <h1 className="mt-3 font-heading text-[clamp(2.5rem,5.2vw,4.5rem)] font-medium leading-[1.03] text-foreground">
            {work.title}
          </h1>
          {work.subtitle && (
            <p className="mt-2 text-xl text-muted-foreground sm:text-2xl">{work.subtitle}</p>
          )}
        </div>

        <div className="flex flex-col justify-end md:col-span-5">
          {work.description && (
            <p className="text-base leading-[1.72] text-muted-foreground md:text-[17px]">
              {work.description}
            </p>
          )}
        </div>
      </header>

      {/* Metadata Strip */}
      <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-rule py-6 sm:grid-cols-4">
        <div>
          <dt className="font-label text-[10px] text-muted-foreground">Category</dt>
          <dd className="mt-1.5 text-sm font-medium text-foreground">{work.category}</dd>
        </div>
        {work.client && (
          <div>
            <dt className="font-label text-[10px] text-muted-foreground">Context</dt>
            <dd className="mt-1.5 text-sm font-medium text-foreground">{work.client}</dd>
          </div>
        )}
        {work.year && (
          <div>
            <dt className="font-label text-[10px] text-muted-foreground">Year</dt>
            <dd className="mt-1.5 text-sm font-medium text-foreground">{work.year}</dd>
          </div>
        )}
        {work.medium && (
          <div>
            <dt className="font-label text-[10px] text-muted-foreground">Tools</dt>
            <dd className="mt-1.5 text-sm font-medium text-foreground">{work.medium}</dd>
          </div>
        )}
      </dl>

      {/* Hero Artwork */}
      <div className="mt-12 bg-surface md:mt-16">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="group block w-full cursor-zoom-in overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-primary"
          aria-label={`Inspect ${work.title} artwork full screen`}
        >
          <img
            src={work.imageSrc}
            alt={`${work.title}${work.subtitle ? ` — ${work.subtitle}` : ""}`}
            className="mx-auto block max-h-[82vh] w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.01]"
          />
        </button>
      </div>

      {/* Authentic Process & Story */}
      {work.story && (
        <section className="mt-14 grid gap-8 border-t border-rule pt-12 md:mt-20 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <Reveal>
              <p className="font-label text-primary">Creative Process</p>
              <h2 className="mt-2 font-heading text-2xl font-medium text-foreground sm:text-3xl">
                Concept &amp; execution
              </h2>
            </Reveal>
          </div>
          <div className="md:col-span-8">
            <Reveal delay={80}>
              <p className="max-w-2xl text-base leading-[1.78] text-muted-foreground">
                {work.story}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* Multi-plate Gallery */}
      {gallerySlides.length > 0 && (
        <section className="mt-16 border-t border-rule pt-12 md:mt-20">
          <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <p className="font-label text-primary">Project Plates</p>
              <h2 className="mt-1 font-heading text-2xl font-medium text-foreground sm:text-3xl">
                Full presentation
              </h2>
            </div>
            <span className="font-label text-[10px] text-muted-foreground">
              {String(gallerySlides.length).padStart(2, "0")} plates · Click to expand
            </span>
          </div>

          <div className="space-y-10 md:space-y-14">
            {gallerySlides.map((slideUrl, i) => (
              <Reveal key={slideUrl} delay={(i % 2) * 60}>
                <figure className="space-y-3">
                  <div className="bg-surface">
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(i + 1)}
                      className="group block w-full cursor-zoom-in overflow-hidden focus-visible:outline-2 focus-visible:outline-primary"
                      aria-label={`Open ${work.title} plate ${i + 1} full screen`}
                    >
                      <img
                        src={slideUrl}
                        alt={`${work.title} — plate ${i + 1}`}
                        loading="lazy"
                        className="mx-auto block w-full max-w-[1180px] object-contain transition-transform duration-500 ease-out group-hover:scale-[1.008]"
                      />
                    </button>
                  </div>
                  <figcaption className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-label text-[10px]">
                      Plate {String(i + 1).padStart(2, "0")} /{" "}
                      {String(gallerySlides.length).padStart(2, "0")}
                    </span>
                    <span>{work.title}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <ProjectNavigation prevWork={prevWork} nextWork={nextWork} />

      {/* Lightbox */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${work.title} image viewer`}
          className="fixed inset-0 z-50 flex flex-col bg-foreground/95 p-4 text-background md:p-8"
        >
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-background/75">
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
                className="absolute left-2 z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center bg-background/10 text-background transition-colors hover:bg-background/20"
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
                className="absolute right-2 z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center bg-background/10 text-background transition-colors hover:bg-background/20"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
