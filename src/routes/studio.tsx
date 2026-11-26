import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  ExternalLink,
  ImagePlus,
  Plus,
  RotateCcw,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import {
  DEFAULT_CATEGORIES,
  createWorkSlug,
  getSeedWorks,
  saveWorks,
  uploadArtworkFile,
  worksQueryOptions,
  type Work,
} from "@/lib/works";
import { cn } from "@/lib/utils";

interface StudioSearch {
  edit?: string;
}

export const Route = createFileRoute("/studio")({
  validateSearch: (search: Record<string, unknown>): StudioSearch => ({
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(worksQueryOptions()),
  component: StudioPage,
});

interface FormState {
  id: string | null;
  title: string;
  subtitle: string;
  category: string;
  customCategory: string;
  year: string;
  medium: string;
  client: string;
  behanceUrl: string;
  description: string;
  story: string;
  imageSrc: string;
  gallery: string[];
  featured: boolean;
}

function createEmptyForm(): FormState {
  return {
    id: null,
    title: "",
    subtitle: "",
    category: DEFAULT_CATEGORIES[0],
    customCategory: "",
    year: String(new Date().getFullYear()),
    medium: "",
    client: "",
    behanceUrl: "",
    description: "",
    story: "",
    imageSrc: "",
    gallery: [],
    featured: false,
  };
}

function workToForm(work: Work): FormState {
  const isDefault = (DEFAULT_CATEGORIES as readonly string[]).includes(work.category);
  return {
    id: work.id,
    title: work.title,
    subtitle: work.subtitle ?? "",
    category: isDefault ? work.category : "__custom__",
    customCategory: isDefault ? "" : work.category,
    year: work.year ?? "",
    medium: work.medium ?? "",
    client: work.client ?? "",
    behanceUrl: work.behanceUrl ?? "",
    description: work.description ?? "",
    story: work.story ?? "",
    imageSrc: work.imageSrc,
    gallery: work.gallery ?? [],
    featured: Boolean(work.featured),
  };
}

function StudioPage() {
  const { edit } = Route.useSearch();
  const queryClient = useQueryClient();
  const { data: works } = useSuspenseQuery(worksQueryOptions());

  const [form, setForm] = useState<FormState>(() => createEmptyForm());
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!edit) return;
    const match = works.find((w) => w.id === edit);
    if (match) {
      setForm(workToForm(match));
    }
  }, [edit, works]);

  const persistMutation = useMutation({
    mutationFn: saveWorks,
    onSuccess: ({ works: updated, mode }) => {
      queryClient.setQueryData(["works"], updated);
      setStatusMessage(
        mode === "disk"
          ? "Saved directly to src/data/works.json — live on your portfolio."
          : "Saved in browser storage. Export JSON anytime to commit into your repo.",
      );
      setErrorMessage(null);
    },
    onError: (err) => {
      setErrorMessage(err instanceof Error ? err.message : "Could not save changes.");
    },
  });

  async function handleFileSelect(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please pick an image file (PNG, JPG, WebP, GIF, or SVG).");
      return;
    }
    setUploading(true);
    setErrorMessage(null);
    try {
      const { url, storedOnDisk } = await uploadArtworkFile(file);
      setForm((prev) => ({ ...prev, imageSrc: url }));
      setStatusMessage(
        storedOnDisk ? `Uploaded image to ${url}` : "Image loaded for preview & browser storage.",
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const title = form.title.trim();
    const resolvedCategory =
      form.category === "__custom__" ? form.customCategory.trim() : form.category.trim();
    const imageSrc = form.imageSrc.trim();

    if (!title) {
      setErrorMessage("Please enter a title for the work.");
      return;
    }
    if (!resolvedCategory) {
      setErrorMessage("Please choose or enter a category.");
      return;
    }
    if (!imageSrc) {
      setErrorMessage("Please upload an artwork image or paste an image URL.");
      return;
    }

    const existingIds = new Set(works.map((w) => w.id));
    const isEditing = Boolean(form.id);
    const id = form.id ?? createWorkSlug(title, existingIds);

    const existingWork = isEditing ? works.find((w) => w.id === id) : undefined;
    const nextWork: Work = {
      id,
      title,
      subtitle: form.subtitle.trim() || undefined,
      category: resolvedCategory,
      year: form.year.trim() || undefined,
      medium: form.medium.trim() || undefined,
      client: form.client.trim() || undefined,
      behanceUrl: form.behanceUrl.trim() || undefined,
      contraUrl: existingWork?.contraUrl,
      description: form.description.trim() || undefined,
      story: form.story.trim() || undefined,
      imageSrc,
      gallery: form.gallery.length > 0 ? form.gallery : undefined,
      featured: form.featured,
    };

    let nextWorks: Work[];
    if (isEditing) {
      nextWorks = works.map((w) => {
        if (w.id === id) return nextWork;
        return form.featured ? { ...w, featured: false } : w;
      });
    } else {
      const cleared = form.featured ? works.map((w) => ({ ...w, featured: false })) : works;
      nextWorks = [nextWork, ...cleared];
    }

    persistMutation.mutate(nextWorks);
    if (!isEditing) {
      setForm(createEmptyForm());
    }
  }

  function handleSetFeatured(id: string) {
    const nextWorks = works.map((w) => ({ ...w, featured: w.id === id }));
    persistMutation.mutate(nextWorks);
    if (form.id === id) {
      setForm((prev) => ({ ...prev, featured: true }));
    }
  }

  function handleMove(id: string, direction: -1 | 1) {
    const index = works.findIndex((w) => w.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= works.length) return;
    const nextWorks = [...works];
    const [moved] = nextWorks.splice(index, 1);
    nextWorks.splice(target, 0, moved);
    persistMutation.mutate(nextWorks);
  }

  function handleDelete(id: string) {
    const nextWorks = works.filter((w) => w.id !== id);
    persistMutation.mutate(nextWorks);
    if (form.id === id) {
      setForm(createEmptyForm());
    }
    setConfirmDeleteId(null);
  }

  function handleExportJson() {
    const blob = new Blob([JSON.stringify(works, null, 2) + "\n"], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "works.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportJson(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON file must contain an array of works.");
      }
      persistMutation.mutate(parsed as Work[]);
      setForm(createEmptyForm());
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Invalid works.json file.");
    }
  }

  function handleResetDemo() {
    const seeded = getSeedWorks();
    persistMutation.mutate(seeded);
    setForm(createEmptyForm());
  }

  const allCategories = ["All", ...Array.from(new Set(works.map((w) => w.category)))];
  const listedWorks =
    filterCategory === "All" ? works : works.filter((w) => w.category === filterCategory);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1380px] px-6 py-12 md:px-12 md:py-16">
        <div className="flex flex-col gap-6 border-b border-rule pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono-meta text-primary">Archive Studio</p>
            <h1 className="mt-2 font-display text-4xl font-medium tracking-tight md:text-5xl">
              Manage Portfolio Works
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Add new works, edit case study details, upload artwork, or choose the lead project.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setForm(createEmptyForm());
                setStatusMessage(null);
                setErrorMessage(null);
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 border border-foreground bg-foreground px-3.5 py-2 text-xs font-medium text-background transition-colors hover:border-primary hover:bg-primary"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Work</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex cursor-pointer items-center gap-1.5 border border-rule px-3.5 py-2 text-xs font-medium transition-colors hover:border-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1.5 border border-rule px-3.5 py-2 text-xs font-medium transition-colors hover:border-foreground"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import JSON</span>
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                void handleImportJson(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={handleResetDemo}
              className="inline-flex cursor-pointer items-center gap-1.5 border border-rule px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {(statusMessage || errorMessage) && (
          <div
            className={cn(
              "mt-6 flex items-center justify-between border px-4 py-3 text-sm",
              errorMessage
                ? "border-primary bg-primary/10 text-primary"
                : "border-rule-strong bg-surface text-foreground",
            )}
          >
            <span className="flex items-center gap-2">
              {!errorMessage && <Check className="h-4 w-4 text-primary" />}
              {errorMessage ?? statusMessage}
            </span>
            <Link to="/" className="text-xs font-medium underline underline-offset-4">
              View Portfolio →
            </Link>
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <section className="lg:col-span-5">
            <form onSubmit={handleSubmit} className="border border-rule bg-card p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-rule pb-4">
                <div>
                  <p className="font-mono-meta text-[10px] text-primary">
                    {form.id ? "Editing Work" : "Add New Work"}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-medium">
                    {form.id ? form.title || "Untitled" : "New Entry"}
                  </h2>
                </div>
                {form.id && (
                  <button
                    type="button"
                    onClick={() => setForm(createEmptyForm())}
                    className="cursor-pointer text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="work-title"
                      className="block font-mono-meta text-[10px] text-muted-foreground"
                    >
                      Title *
                    </label>
                    <input
                      id="work-title"
                      type="text"
                      required
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Traces"
                      className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="work-subtitle"
                      className="block font-mono-meta text-[10px] text-muted-foreground"
                    >
                      Subtitle
                    </label>
                    <input
                      id="work-subtitle"
                      type="text"
                      value={form.subtitle}
                      onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                      placeholder="e.g. Illustration Story"
                      className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="work-category"
                      className="block font-mono-meta text-[10px] text-muted-foreground"
                    >
                      Category *
                    </label>
                    <select
                      id="work-category"
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                    >
                      {DEFAULT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__custom__">+ Custom category…</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="work-year"
                      className="block font-mono-meta text-[10px] text-muted-foreground"
                    >
                      Year
                    </label>
                    <input
                      id="work-year"
                      type="text"
                      value={form.year}
                      onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                      placeholder="2026"
                      className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                    />
                  </div>
                </div>

                {form.category === "__custom__" && (
                  <div>
                    <label
                      htmlFor="work-custom-cat"
                      className="block font-mono-meta text-[10px] text-muted-foreground"
                    >
                      Custom Category Name *
                    </label>
                    <input
                      id="work-custom-cat"
                      type="text"
                      value={form.customCategory}
                      onChange={(e) => setForm((p) => ({ ...p, customCategory: e.target.value }))}
                      placeholder="e.g. Editorial Design"
                      className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                    />
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="work-medium"
                      className="block font-mono-meta text-[10px] text-muted-foreground"
                    >
                      Tools / Medium
                    </label>
                    <input
                      id="work-medium"
                      type="text"
                      value={form.medium}
                      onChange={(e) => setForm((p) => ({ ...p, medium: e.target.value }))}
                      placeholder="Adobe Photoshop · Illustrator"
                      className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="work-client"
                      className="block font-mono-meta text-[10px] text-muted-foreground"
                    >
                      Client / Type
                    </label>
                    <input
                      id="work-client"
                      type="text"
                      value={form.client}
                      onChange={(e) => setForm((p) => ({ ...p, client: e.target.value }))}
                      placeholder="Client or Concept Campaign"
                      className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="work-behance"
                    className="block font-mono-meta text-[10px] text-muted-foreground"
                  >
                    Behance URL
                  </label>
                  <input
                    id="work-behance"
                    type="url"
                    value={form.behanceUrl}
                    onChange={(e) => setForm((p) => ({ ...p, behanceUrl: e.target.value }))}
                    placeholder="https://www.behance.net/gallery/..."
                    className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                  />
                </div>

                <div>
                  <span className="block font-mono-meta text-[10px] text-muted-foreground">
                    Cover Artwork *
                  </span>

                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      void handleFileSelect(e.dataTransfer.files?.[0]);
                    }}
                    className="mt-2 border border-dashed border-rule-strong bg-background p-4 text-center"
                  >
                    {form.imageSrc ? (
                      <div className="space-y-3">
                        <img
                          src={form.imageSrc}
                          alt="Artwork preview"
                          className="mx-auto max-h-52 w-auto border border-rule object-contain"
                        />
                        <div className="flex flex-wrap justify-center gap-4 text-xs">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="cursor-pointer font-medium text-primary underline underline-offset-4"
                          >
                            Replace file
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, imageSrc: "" }))}
                            className="cursor-pointer text-muted-foreground underline underline-offset-4"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full cursor-pointer flex-col items-center gap-2 py-4 text-muted-foreground hover:text-foreground"
                      >
                        <ImagePlus className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">
                          {uploading ? "Uploading…" : "Click to upload or drop an artwork image"}
                        </span>
                        <span className="font-mono-meta text-[10px]">
                          PNG, JPG, WebP, GIF, SVG
                        </span>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        void handleFileSelect(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    value={form.imageSrc}
                    onChange={(e) => setForm((p) => ({ ...p, imageSrc: e.target.value }))}
                    placeholder="Or paste image path / URL"
                    className="mt-2 w-full border border-rule bg-background px-3.5 py-2 text-xs outline-none transition-colors focus:border-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="work-description"
                    className="block font-mono-meta text-[10px] text-muted-foreground"
                  >
                    Summary
                  </label>
                  <textarea
                    id="work-description"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Short editorial summary for the project."
                    className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                  />
                </div>

                <div>
                  <label
                    htmlFor="work-story"
                    className="block font-mono-meta text-[10px] text-muted-foreground"
                  >
                    Process &amp; Story
                  </label>
                  <textarea
                    id="work-story"
                    rows={3}
                    value={form.story}
                    onChange={(e) => setForm((p) => ({ ...p, story: e.target.value }))}
                    placeholder="Creative process or concept notes shown on the case study page."
                    className="mt-2 w-full border border-rule bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-foreground"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 border border-rule bg-background px-3.5 py-3">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">Set as lead project on the homepage</span>
                </label>

                <button
                  type="submit"
                  disabled={persistMutation.isPending || uploading}
                  className="w-full cursor-pointer border border-foreground bg-foreground py-3.5 text-sm font-medium text-background transition-colors hover:border-primary hover:bg-primary disabled:opacity-50"
                >
                  {persistMutation.isPending
                    ? "Saving…"
                    : form.id
                      ? "Save Changes"
                      : "Publish Work"}
                </button>
              </div>
            </form>
          </section>

          <section className="lg:col-span-7">
            <div className="flex flex-col gap-4 border-b border-rule pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono-meta text-[11px] text-muted-foreground">
                Archive ({listedWorks.length} of {works.length} works)
              </p>

              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={cn(
                      "cursor-pointer border border-rule px-2.5 py-1 text-xs transition-colors",
                      filterCategory === cat
                        ? "border-foreground bg-foreground text-background"
                        : "hover:border-foreground",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {listedWorks.length === 0 ? (
              <div className="mt-8 border border-dashed border-rule p-12 text-center">
                <p className="font-editorial text-3xl italic text-muted-foreground">
                  No works in this filter.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {listedWorks.map((work) => {
                  const globalIdx = works.findIndex((w) => w.id === work.id);
                  const isEditingThis = form.id === work.id;
                  return (
                    <div
                      key={work.id}
                      className={cn(
                        "flex flex-col gap-4 border bg-card p-4 transition-colors sm:flex-row sm:items-center",
                        isEditingThis ? "border-primary" : "border-rule",
                      )}
                    >
                      <img
                        src={work.imageSrc}
                        alt={work.title}
                        className="h-20 w-24 shrink-0 border border-rule bg-surface object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 font-mono-meta text-[10px] text-muted-foreground">
                          <span>{String(globalIdx + 1).padStart(2, "0")}</span>
                          <span>·</span>
                          <span>{work.category}</span>
                          {work.year && (
                            <>
                              <span>·</span>
                              <span>{work.year}</span>
                            </>
                          )}
                          {work.featured && (
                            <span className="bg-primary px-1.5 py-0.5 text-primary-foreground">
                              Lead
                            </span>
                          )}
                        </div>

                        <h3 className="mt-1 truncate font-display text-lg font-medium">
                          {work.title}
                          {work.subtitle && (
                            <span className="ml-2 font-editorial text-base italic text-muted-foreground">
                              — {work.subtitle}
                            </span>
                          )}
                        </h3>

                        {work.description && (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {work.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          title="Move up"
                          disabled={globalIdx === 0}
                          onClick={() => handleMove(work.id, -1)}
                          className="cursor-pointer border border-rule p-2 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Move down"
                          disabled={globalIdx === works.length - 1}
                          onClick={() => handleMove(work.id, 1)}
                          className="cursor-pointer border border-rule p-2 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title={work.featured ? "Lead project" : "Set as lead project"}
                          onClick={() => handleSetFeatured(work.id)}
                          className={cn(
                            "cursor-pointer border p-2 transition-colors",
                            work.featured
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-rule text-muted-foreground hover:border-primary hover:text-primary",
                          )}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          to="/works/$workId"
                          params={{ workId: work.id }}
                          title="Open case study"
                          className="border border-rule p-2 text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setForm(workToForm(work));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="cursor-pointer border border-rule px-3 py-2 text-xs font-medium transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                        >
                          Edit
                        </button>

                        {confirmDeleteId === work.id ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(work.id)}
                            className="cursor-pointer border border-primary bg-primary px-2.5 py-2 text-xs font-medium text-primary-foreground"
                          >
                            Confirm
                          </button>
                        ) : (
                          <button
                            type="button"
                            title="Delete work"
                            onClick={() => setConfirmDeleteId(work.id)}
                            className="cursor-pointer border border-rule p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
