/**
 * ProjectsIndexPage — /projects
 * Phase 6: Full implementation.
 * - Header + subtitle.
 * - 3-card grid with ProjectStatusCard (title, goal, status, lineage).
 */

import { PageContainer } from "@/components/layout/PageContainer";
import { ProjectStatusCard } from "@/components/progress/ProjectStatusCard";
import { getProjects } from "@/lib/manifest";

export function ProjectsIndexPage() {
  const projects = getProjects();

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground mb-1">
          Projects
        </h1>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          The hands-on layer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectStatusCard key={project.slug} project={project} />
        ))}
      </div>
    </PageContainer>
  );
}
