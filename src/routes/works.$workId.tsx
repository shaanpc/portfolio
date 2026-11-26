import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectDetail } from "@/components/site/project-detail";
import { SiteFooter } from "@/components/site/site-footer";
import { worksQueryOptions } from "@/lib/works";

export const Route = createFileRoute("/works/$workId")({
  loader: ({ context }) => context.queryClient.ensureQueryData(worksQueryOptions()),
  component: WorkDetailPage,
});

function WorkDetailPage() {
  const { workId } = Route.useParams();
  const { data: works } = useSuspenseQuery(worksQueryOptions());

  return (
    <div className="min-h-screen">
      <ProjectDetail works={works} projectSlug={workId} />
      <SiteFooter />
    </div>
  );
}
