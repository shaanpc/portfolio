import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectArchive } from "@/components/site/project-archive";
import { ensureWorksData, worksQueryOptions } from "@/lib/works";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "All Projects — Shan pc" },
      {
        name: "description",
        content:
          "Complete project archive by Shan pc — illustration, branding & identity, packaging design, social media campaigns, and photo manipulation.",
      },
    ],
  }),
  loader: ({ context }) => ensureWorksData(context.queryClient),
  component: AllProjectsPage,
});

function AllProjectsPage() {
  const { data: works } = useSuspenseQuery(worksQueryOptions());
  return <ProjectArchive works={works} />;
}
