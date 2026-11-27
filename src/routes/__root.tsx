import { HeadContent, Link, Outlet, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { FloatingDock } from "@/components/site/floating-dock";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div id="top" className="flex min-h-screen flex-col bg-background text-foreground">
      <HeadContent />
      <SiteNav />
      <div key={pathname} className="page-enter flex-1">
        <Outlet />
      </div>
      <SiteFooter />
      <FloatingDock />
    </div>
  );
}

function NotFoundPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col justify-center px-6 py-28 md:px-12">
      <p className="font-label text-primary">404 — Page not found</p>
      <h1 className="mt-4 font-heading text-4xl font-medium md:text-6xl">
        Nothing on this page.
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The project or page you requested isn&apos;t in the archive. Return to the main gallery.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-block border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:border-primary hover:bg-primary"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
