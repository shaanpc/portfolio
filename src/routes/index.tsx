import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AboutSection } from "@/components/site/about-section";
import { Reveal } from "@/components/site/scroll-reveal";
import { SelectedWork } from "@/components/site/selected-work";
import { DESIGNER_PROFILE } from "@/data/profile";
import { ensureWorksData, worksQueryOptions } from "@/lib/works";

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
  loader: ({ context }) => ensureWorksData(context.queryClient),
  component: Index,
});

function Index() {
  const { data: works } = useSuspenseQuery(worksQueryOptions());

  return (
    <main>
      {/* Hero — Minimalist Monochrome Studio Composition matching Reference */}
      <section
        id="overview"
        className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1360px] flex-col justify-end overflow-x-clip px-6 pb-0 pt-4 md:px-12 md:pt-6 lg:justify-between lg:px-16"
      >
        <div className="grid flex-1 items-stretch gap-8 lg:min-h-[calc(100vh-5.5rem)] lg:grid-cols-12 lg:gap-8">
          {/* Left Typographic Identity (Vertically Balanced) + Bottom-Left Description */}
          <div className="flex flex-col justify-between gap-12 pb-2 pt-6 sm:pt-10 lg:col-span-6 lg:gap-8 lg:pb-[180px] lg:pt-[200px] xl:pb-[196px] xl:pt-[215px]">
            <h1 className="font-hero text-[clamp(2.1rem,5vw,4.45rem)] font-medium uppercase leading-[1.06] tracking-[-0.015em] text-foreground">
              <span className="block overflow-hidden">
                <span className="animate-hero-line block">SHAN</span>
              </span>
              <span className="mt-2 block overflow-hidden text-[#767676] sm:mt-3.5">
                <span
                  className="animate-hero-line block"
                  style={{ animationDelay: "90ms" }}
                >
                  MOHAMMED PC
                </span>
              </span>
            </h1>

            <div className="animate-soft-enter" style={{ animationDelay: "200ms" }}>
              <p className="max-w-[260px] text-[15px] font-normal leading-[1.6] text-foreground/85">
                Graphic design, visual
                <br />
                identities and creative
                <br />
                concepts
              </p>
            </div>
          </div>

          {/* Right Portrait Cutout (object-contain) with Smooth Bottom White Gradient Fade */}
          <div
            className="flex min-w-0 w-full items-end justify-end self-end lg:col-span-6 lg:pb-0 lg:pr-0 animate-soft-enter"
            style={{ animationDelay: "140ms" }}
          >
            <div className="relative flex h-[340px] w-full min-w-0 items-end justify-end sm:h-[460px] lg:h-[clamp(600px,90vh,860px)] lg:-translate-y-[80px] lg:translate-x-[112px] xl:-translate-y-[85px] xl:translate-x-[150px]">
              <img
                src="/shan-portrait.png"
                alt="Shan Mohammed pc — Graphic Designer"
                width={905}
                height={1076}
                loading="eager"
                decoding="sync"
                fetchPriority="high"
                className="hero-portrait-mask pointer-events-none relative z-[1] block h-full w-auto max-w-none object-contain object-bottom"
              />
              {/* Bottom mist — dissolves lower waist into page background */}
              <div
                aria-hidden="true"
                className="hero-portrait-mist pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[14%]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Editorial About Card Section */}
      <AboutSection />

      {/* Selected Work Gallery */}
      <SelectedWork works={works} />

      {/* Skills & Expertise Section */}
      <section id="skills" className="scroll-mt-20 border-t border-rule">
        <div className="mx-auto max-w-[1360px] px-6 py-20 md:px-12 md:py-28 lg:px-16">
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-4">
              <Reveal>
                <p className="font-label text-primary">03 / Skills &amp; Expertise</p>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="mt-3 font-heading text-3xl font-medium text-foreground sm:text-4xl">
                  Disciplines &amp; visual craft
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  Capabilities grounded in published identity systems, packaging concepts,
                  illustrated storytelling, and campaign direction.
                </p>
              </Reveal>
            </div>

            <div className="md:col-span-8">
              <ul className="divide-y divide-rule border-y border-rule">
                {DESIGNER_PROFILE.capabilities.map((cap, idx) => (
                  <li key={cap.title}>
                    <Reveal delay={Math.min(idx * 50, 250)}>
                      <div className="grid gap-3 py-6 sm:grid-cols-12 sm:items-baseline sm:gap-6">
                        <span className="font-label text-[11px] text-muted-foreground sm:col-span-1">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="sm:col-span-5">
                          <h3 className="font-heading text-xl font-medium text-foreground">
                            {cap.title}
                          </h3>
                          <p className="mt-1 font-label text-[10px] text-primary">
                            {cap.examples}
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground sm:col-span-6">
                          {cap.detail}
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
