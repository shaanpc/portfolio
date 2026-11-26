import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/scroll-reveal";
import { SiteFooter } from "@/components/site/site-footer";
import { ThingsIDo } from "@/components/site/things-i-do";
import { DESIGNER_PROFILE } from "@/data/profile";
import { worksQueryOptions } from "@/lib/works";

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

function Index() {
  const { data: works } = useSuspenseQuery(worksQueryOptions());

  return (
    <div className="min-h-screen">
      {/* Overview / Hero */}
      <section
        id="overview"
        className="mx-auto max-w-[1380px] overflow-x-clip scroll-mt-16 px-6 pb-16 pt-12 md:scroll-mt-4 md:px-14 md:pb-24 md:pt-14 lg:px-16"
      >
        <Reveal immediate variant="fade" delay={30}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-5 font-mono-meta text-muted-foreground">
            <span>{DESIGNER_PROFILE.role}</span>
            <span className="inline-flex items-center gap-2.5">
              <span>{DESIGNER_PROFILE.availability}</span>
              <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            </span>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 items-center gap-10 md:mt-16 md:grid-cols-12 md:gap-8 lg:mt-20 lg:gap-8 xl:gap-10">
          {/* Centre-left hero headline with staggered line-by-line reveal (0.9s) */}
          <div className="md:col-span-12 lg:col-span-5">
            <h1 className="font-display text-[clamp(2.45rem,4.1vw,4.25rem)] font-normal leading-[1.03] tracking-[-0.02em] text-foreground">
              <Reveal immediate variant="line" delay={60} className="hero-headline-line">
                Visual stories,
              </Reveal>
              <Reveal immediate variant="line" delay={140} className="hero-headline-line">
                <span className="font-editorial italic font-normal text-primary">
                  brand identities
                </span>{" "}
                &amp;
              </Reveal>
              <Reveal immediate variant="line" delay={220} className="hero-headline-line">
                campaigns crafted
              </Reveal>
              <Reveal immediate variant="line" delay={300} className="hero-headline-line">
                to stay in mind.
              </Reveal>
            </h1>
          </div>

          {/* Middle introduction (0.7s) & Explore Work */}
          <div className="flex flex-col justify-center gap-6 md:col-span-6 lg:col-span-3">
            <Reveal
              immediate
              variant="fade"
              delay={340}
              className="hero-description-reveal"
            >
              <p className="text-[14.5px] leading-[1.72] text-muted-foreground">
                <span className="font-editorial text-[17px] italic text-foreground">
                  {DESIGNER_PROFILE.name}
                </span>{" "}
                — {DESIGNER_PROFILE.intro}
              </p>
            </Reveal>

            <Reveal immediate variant="up" delay={420}>
              <div className="flex flex-wrap items-center gap-6">
                <a
                  href="#things-i-do"
                  className="editorial-link editorial-link-accent group inline-flex items-center gap-2 pb-1 text-foreground transition-colors duration-200 hover:text-primary"
                >
                  <span className="font-editorial text-[18px] italic tracking-[0.01em]">
                    Explore Work
                  </span>
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right-side centered editorial portrait (1.1s subtle fade + scale) */}
          <Reveal
            immediate
            variant="image"
            delay={260}
            className="hero-portrait-reveal relative flex items-center justify-center md:col-span-6 lg:col-span-4"
          >
            <div
              aria-hidden="true"
              className="hero-portrait-glow pointer-events-none absolute -inset-6 -z-10"
            />
            <img
              src="/shan-portrait.png"
              alt="Shan pc — Graphic Designer & Visual Storyteller"
              width={713}
              height={714}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="block aspect-[713/714] max-h-[340px] w-full max-w-[300px] object-contain sm:max-h-[370px] sm:max-w-[330px] md:max-h-[340px] md:max-w-[300px] lg:max-h-[410px] lg:max-w-[370px] xl:max-h-[440px] xl:max-w-[400px] [mask-image:linear-gradient(to_bottom,#000_82%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_82%,transparent_100%)]"
            />
          </Reveal>
        </div>
      </section>

      {/* Things I Do — Animated Selected Projects Showcase */}
      <ThingsIDo works={works} />

      {/* Experience — Background, Disciplines & Craft */}
      <section id="experience" className="scroll-mt-16 border-t border-rule md:scroll-mt-4">
        <div id="about" className="mx-auto max-w-[1380px] px-6 py-20 md:px-14 md:py-28 lg:px-16">
          <div className="grid gap-12 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <Reveal variant="fade" delay={0}>
                <p className="font-mono-meta text-primary">Experience</p>
              </Reveal>
              <dl className="mt-8 space-y-5 border-t border-rule pt-6 text-sm">
                <Reveal variant="up" delay={70}>
                  <div>
                    <dt className="font-mono-meta text-[10px] text-muted-foreground">Designer</dt>
                    <dd className="mt-1 font-medium text-foreground">{DESIGNER_PROFILE.name}</dd>
                  </div>
                </Reveal>
                <Reveal variant="up" delay={130}>
                  <div>
                    <dt className="font-mono-meta text-[10px] text-muted-foreground">Based in</dt>
                    <dd className="mt-1 text-foreground">{DESIGNER_PROFILE.location}</dd>
                  </div>
                </Reveal>
                <Reveal variant="up" delay={190}>
                  <div>
                    <dt className="font-mono-meta text-[10px] text-muted-foreground">
                      Primary Tools
                    </dt>
                    <dd className="mt-1 text-foreground">{DESIGNER_PROFILE.tools.join(" · ")}</dd>
                  </div>
                </Reveal>
              </dl>
            </div>

            <div className="md:col-span-8">
              <h2 className="font-display text-4xl font-normal leading-[1.12] tracking-[-0.02em] text-foreground sm:text-5xl">
                <Reveal variant="line" delay={90}>
                  {DESIGNER_PROFILE.aboutLead}
                </Reveal>
              </h2>

              <div className="mt-10 grid gap-8 text-[15px] leading-[1.75] text-muted-foreground md:grid-cols-2">
                {DESIGNER_PROFILE.aboutParagraphs.map((paragraph, i) => (
                  <Reveal key={i} variant="fade" delay={180 + i * 90}>
                    <p>{paragraph}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          <div id="capabilities" className="mt-20 border-t border-rule pt-20 md:mt-24 md:pt-24">
            <div className="grid gap-12 md:grid-cols-12">
              <div className="md:col-span-4">
                <Reveal variant="fade" delay={0}>
                  <p className="font-mono-meta text-primary">Disciplines</p>
                </Reveal>
                <h2 className="mt-3 font-display text-3xl font-normal tracking-[-0.02em] text-foreground md:text-4xl">
                  <Reveal variant="line" delay={80}>
                    Capabilities &amp; craft
                  </Reveal>
                </h2>
                <Reveal variant="fade" delay={160}>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    Built across sketchbook studies, vector systems, packaging mockups, and
                    composite retouching.
                  </p>
                </Reveal>
              </div>

              <div className="md:col-span-8">
                <ul className="divide-y divide-rule border-y border-rule">
                  {DESIGNER_PROFILE.capabilities.map((cap, idx) => (
                    <li key={cap.title}>
                      <Reveal
                        variant="up"
                        delay={Math.min(idx * 65, 320)}
                        className="grid gap-2 py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6"
                      >
                        <span className="font-mono-meta text-[10px] text-muted-foreground sm:col-span-1">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-display text-xl font-normal text-foreground sm:col-span-5">
                          {cap.title}
                        </h3>
                        <p className="text-sm text-muted-foreground sm:col-span-6">{cap.detail}</p>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
