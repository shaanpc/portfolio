import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectDetail } from "@/components/site/project-detail";
import { SiteFooter } from "@/components/site/site-footer";
import { worksQueryOptions } from "@/lib/works";

export const Route = createFileRoute("/work/$projectSlug")({
  loader: ({ context }) => context.queryClient.ensureQueryData(worksQueryOptions()),
  component: ProjectSlugPage,
});

function ProjectSlugPage() {
  const { projectSlug } = Route.useParams();
  const { data: works } = useSuspenseQuery(worksQueryOptions());

  return (
    <div className="min-h-screen">
      <ProjectDetail works={works} projectSlug={projectSlug} />
      <SiteFooter />
    </div>
  );
}
