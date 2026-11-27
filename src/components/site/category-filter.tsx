import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: readonly string[];
  activeCategory: string;
  onSelect: (category: string) => void;
  counts?: Record<string, number>;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
  counts,
}: CategoryFilterProps) {
  return (
    <div className="border-y border-rule">
      <div
        role="tablist"
        aria-label="Filter projects by discipline"
        className="flex flex-nowrap items-center gap-x-6 overflow-x-auto no-scrollbar py-3.5 sm:gap-x-8"
      >
        {categories.map((cat) => {
          const active = activeCategory === cat;
          const count = counts?.[cat];
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(cat)}
              className={cn(
                "relative shrink-0 cursor-pointer whitespace-nowrap pb-1.5 pt-1 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary",
                active
                  ? "font-medium text-foreground"
                  : "font-normal text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="inline-flex items-baseline gap-1.5">
                <span>{cat}</span>
                {typeof count === "number" && (
                  <span
                    className={cn(
                      "font-label text-[10px]",
                      active ? "text-primary" : "text-muted-foreground/75",
                    )}
                  >
                    {String(count).padStart(2, "0")}
                  </span>
                )}
              </span>

              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 bottom-0 h-[1.5px] origin-left bg-primary transition-transform duration-300 ease-out",
                  active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
