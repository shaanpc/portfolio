import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { Work } from "@/lib/works";
import { AnimatedProjectGallery } from "./animated-project-gallery";

interface ThingsIDoProps {
  works: Work[];
}

export function ThingsIDo({ works }: ThingsIDoProps) {
  return (
    <section
      id="things-i-do"
      className="scroll-mt-14 border-t border-rule md:scroll-mt-0"
    >
      <span id="work" className="sr-only" aria-hidden="true" />
      <div className="mx-auto max-w-[1380px] px-6 py-20 md:px-14 md:py-28 lg:px-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono-meta text-primary">Things I Do</p>
            <h2 className="mt-2 font-display text-4xl font-normal tracking-[-0.02em] text-foreground md:text-5xl">
              Selected Projects
            </h2>
          </div>

          <Link
            to="/work"
            className="editorial-link editorial-link-accent group inline-flex w-fit items-center gap-2 pb-1 text-foreground transition-colors duration-200 hover:text-primary"
          >
            <span className="font-editorial text-[19px] italic tracking-[0.01em]">
              See All
            </span>
            <ArrowUpRight
              className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
        </div>

        <AnimatedProjectGallery works={works} />
      </div>
    </section>
  );
}
