/**
 * NotFoundPage — * (catch-all 404)
 * Shown for any unknown route.
 */

import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";

export function NotFoundPage() {
  return (
    <PageContainer>
      <div className="py-16 text-center">
        <p className="font-sans text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
          404
        </p>
        <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-4">
          Page not found
        </h1>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-8">
          The route you requested doesn&apos;t exist. Check the URL or navigate
          back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className={[
              "inline-flex items-center px-4 py-2 rounded-lg",
              "font-sans text-sm font-medium",
              "border border-border",
              "text-foreground hover:text-primary hover:bg-accent",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
            ].join(" ")}
          >
            Go to Dashboard
          </Link>
          <Link
            to="/notes"
            className={[
              "inline-flex items-center px-4 py-2 rounded-lg",
              "font-sans text-sm font-medium",
              "text-muted-foreground hover:text-primary hover:bg-accent",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
            ].join(" ")}
          >
            Browse Notes
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
