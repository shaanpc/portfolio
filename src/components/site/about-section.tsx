import { useRef } from "react";
import { Reveal } from "@/components/site/scroll-reveal";
import { WeightWave } from "@/components/site/weight-wave";

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
            className="rounded-[24px] border border-[var(--color-section-card-border)] bg-[var(--color-section-card)] px-7 py-10 shadow-[0_24px_64px_-24px_rgba(21,21,19,0.08),0_4px_18px_-6px_rgba(21,21,19,0.03)] sm:rounded-[28px] sm:px-12 sm:py-14 md:px-16 md:py-16 lg:px-20 lg:py-20"
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
                  text="Beyond how things look."
                  activeContainerRef={cardRef}
                  className="text-[clamp(1.4rem,3.6vw,3rem)] leading-[1.15] tracking-[-0.03em] text-foreground"
                />
              </div>
            </Reveal>

            {/* Primary Editorial About Statement */}
            <Reveal variant="fade" delay={160}>
              <p className="mt-6 max-w-[38ch] font-heading text-[clamp(1.18rem,2.1vw,1.68rem)] font-normal leading-[1.48] tracking-[-0.018em] text-foreground/90">
                Good design is more than how things look. It&apos;s about creating visual
                experiences that communicate clearly, connect with people and leave a
                lasting impression.
              </p>
            </Reveal>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
