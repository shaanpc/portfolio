import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Work } from "@/lib/works";

interface ProjectNavigationProps {
  prevWork?: Work;
  nextWork?: Work;
}

export function ProjectNavigation({ prevWork, nextWork }: ProjectNavigationProps) {
  if (!prevWork && !nextWork) return null;

  return (
    <nav aria-label="Adjacent projects" className="mt-20 border-t border-rule pt-12">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          {prevWork && (
            <Link
              to="/work/$projectSlug"
              params={{ projectSlug: prevWork.id }}
              className="group flex items-center gap-5 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <img
                src={prevWork.imageSrc}
                alt={prevWork.title}
                className="hidden h-16 w-20 shrink-0 bg-surface object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:block"
              />
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 font-label text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  <span>Previous Project</span>
                </span>
                <span className="mt-1 block truncate font-heading text-xl font-medium text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                  {prevWork.title}
                </span>
                <span className="text-xs text-muted-foreground">{prevWork.category}</span>
              </div>
            </Link>
          )}
        </div>

        <div className="sm:flex sm:justify-end sm:text-right">
          {nextWork && (
            <Link
              to="/work/$projectSlug"
              params={{ projectSlug: nextWork.id }}
              className="group flex items-center gap-5 sm:flex-row-reverse focus-visible:outline-2 focus-visible:outline-primary"
            >
              <img
                src={nextWork.imageSrc}
                alt={nextWork.title}
                className="hidden h-16 w-20 shrink-0 bg-surface object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:block"
              />
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 font-label text-[10px] text-muted-foreground transition-colors group-hover:text-primary">
                  <span>Next Project</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
                <span className="mt-1 block truncate font-heading text-xl font-medium text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                  {nextWork.title}
                </span>
                <span className="text-xs text-muted-foreground">{nextWork.category}</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
