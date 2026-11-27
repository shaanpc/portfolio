import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectDetail } from "@/components/site/project-detail";
import { ensureWorksData, worksQueryOptions } from "@/lib/works";

export const Route = createFileRoute("/work/$projectSlug")({
  loader: ({ context }) => ensureWorksData(context.queryClient),
  component: ProjectSlugPage,
});

function ProjectSlugPage() {
  const { projectSlug } = Route.useParams();
  const { data: works } = useSuspenseQuery(worksQueryOptions());
  return <ProjectDetail works={works} projectSlug={projectSlug} />;
}
