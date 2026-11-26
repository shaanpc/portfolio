import { HeadContent, Link, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { SiteSidebar } from "@/components/site/site-sidebar";
import { SiteFooter } from "@/components/site/site-footer";
import { FloatingDock } from "@/components/site/floating-dock";
import { CursorGlow } from "@/components/site/cursor-glow";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

function RootLayout() {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <HeadContent />
      <SiteSidebar />
      <div className="md:pl-[208px] lg:pl-[clamp(220px,19vw,260px)]">
        <Outlet />
      </div>
      <CursorGlow />
      <FloatingDock />
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-[1380px] flex-1 flex-col justify-center px-6 py-24 md:px-12">
        <p className="font-mono-meta text-primary">404 — Page not found</p>
        <h1 className="mt-4 font-display text-5xl font-medium tracking-tight md:text-7xl">
          Nothing on this page.
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          The project or page you requested isn&apos;t in the archive. Return to the main gallery.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to="/"
            className="border border-foreground bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:border-primary hover:bg-primary"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
