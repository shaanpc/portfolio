import { useRef } from "react";
import { Reveal } from "@/components/site/scroll-reveal";
import { ScrambleText } from "@/components/site/scramble-text";
import { WeightWave } from "@/components/site/weight-wave";

const ABOUT_BIO =
  "I'm Shan, a graphic designer from Kozhikode, India. I design logos, brand identities, packaging and posters for startups and creators. I give brands a strong visual identity that sets them apart.";

export function AboutSection() {
  const cardRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-20 border-t border-rule bg-[var(--color-section-alt)] py-20 sm:py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1360px] px-6 md:px-12 lg:px-16">
        <Reveal variant="up" className="mx-auto max-w-[1040px]">
          <div
            ref={cardRef}
            className="rounded-[24px] border border-[var(--color-section-card-border)] bg-[var(--color-section-card)] px-7 py-10 shadow-[0_14px_38px_-6px_rgba(0,0,0,0.09),0_4px_14px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_18px_44px_-8px_rgba(0,0,0,0.55)] sm:rounded-[28px] sm:px-12 sm:py-14 md:px-16 md:py-16 lg:px-20 lg:py-20"
          >
            {/* Subtle section label */}
            <Reveal variant="fade" delay={40}>
              <p className="font-label text-primary">02 / About</p>
            </Reveal>

            {/* Interactive Weight Wave Prominent Line */}
            <Reveal variant="up" delay={90} className="mt-4 overflow-x-clip">
              <div id="about-heading">
                <WeightWave
                  as="h2"
                  text="Design with purpose."
                  activeContainerRef={cardRef}
                  className="font-['Funnel_Display','Manrope',sans-serif] text-[clamp(1.6rem,3.8vw,3.15rem)] font-medium leading-[1.14] tracking-[-0.025em] text-foreground"
                />
              </div>
            </Reveal>

            {/* Primary Editorial About Statement */}
            <Reveal variant="fade" delay={160}>
              <ScrambleText
                text={ABOUT_BIO}
                className="mt-6 max-w-[44ch] font-heading text-[clamp(1.12rem,1.95vw,1.5rem)] font-normal leading-[1.6] tracking-[-0.015em] text-[#4a4a48] dark:text-foreground/80"
              />
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
