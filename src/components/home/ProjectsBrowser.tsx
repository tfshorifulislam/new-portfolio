"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "./ProjectCard";
import { FeaturedProject } from "./FeaturedProject";
import { ProjectQuickView } from "./ProjectQuickView";
import type { MergedProject } from "@/lib/projects";

const ALL = "All";
const MAX_SHOWCASE = 4;

export function ProjectsBrowser({ projects }: { projects: MergedProject[] }) {
  const [language, setLanguage] = useState(ALL);
  const [quickView, setQuickView] = useState<MergedProject | null>(null);

  const { showcase, rest, languages } = useMemo(() => {
    const showcase = projects.filter((project) => project.featured).slice(0, MAX_SHOWCASE);

    const showcaseIds = new Set(showcase.map((project) => project.id));

    const rest = projects.filter((project) => !showcaseIds.has(project.id));

    const counts = new Map<string, number>();

    rest.forEach((project) => {
      if (project.language) {
        counts.set(project.language, (counts.get(project.language) ?? 0) + 1);
      }
    });

    const languages = [...counts.entries()].sort(
      ([nameA, countA], [nameB, countB]) => countB - countA || nameA.localeCompare(nameB),
    );

    return {
      showcase,
      rest,
      languages,
    };
  }, [projects]);

  const filteredProjects =
    language === ALL ? rest : rest.filter((project) => project.language === language);

  return (
    <>
      {showcase.length > 0 && (
        <div className="mb-14 grid gap-6">
          {showcase.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.05}>
              <FeaturedProject project={project} />
            </Reveal>
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <>
          {languages.length > 1 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {[[ALL, rest.length] as const, ...languages].map(([name, count]) => {
                const active = language === name;

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setLanguage(name)}
                    aria-pressed={active}
                    className={
                      active
                        ? "rounded-full border border-(--brand-deep)/50 bg-(--chip-surface) px-3 py-1.5 text-xs font-semibold text-(--accent-on-chip) transition-colors"
                        : "border-border text-muted hover:border-foreground/30 hover:text-foreground rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                    }
                  >
                    {name}
                    <span className="ml-1.5 opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, index) => (
              <Reveal key={project.id} delay={(index % 3) * 0.05} className="h-full">
                <ProjectCard project={project} onQuickView={() => setQuickView(project)} />
              </Reveal>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <p className="text-muted py-8 text-center text-sm">No projects in {language} yet.</p>
          )}
        </>
      )}

      <ProjectQuickView project={quickView} onClose={() => setQuickView(null)} />
    </>
  );
}
