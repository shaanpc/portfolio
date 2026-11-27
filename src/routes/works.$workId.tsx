import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectDetail } from "@/components/site/project-detail";
import { ensureWorksData, worksQueryOptions } from "@/lib/works";

export const Route = createFileRoute("/works/$workId")({
  loader: ({ context }) => ensureWorksData(context.queryClient),
  component: WorkDetailPage,
});

function WorkDetailPage() {
  const { workId } = Route.useParams();
  const { data: works } = useSuspenseQuery(worksQueryOptions());
  return <ProjectDetail works={works} projectSlug={workId} />;
}
