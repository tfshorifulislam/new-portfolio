"use client";

import Image from "next/image";
import { Star, GitFork, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MergedProject } from "@/lib/projects";
import { pluralize } from "@/utils/plural";

export function FeaturedProject({ project }: { project: MergedProject }) {
  return (
    <article className="border-border bg-surface group relative grid overflow-hidden rounded-2xl border backdrop-blur-sm transition-colors hover:border-(--brand-deep)/40 md:grid-cols-2">
      <div className="relative aspect-16/10 overflow-hidden md:aspect-auto md:min-h-full">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          <div className="size-full bg-(image:--gradient-brand) opacity-80" />
        )}
      </div>

      <div className="flex min-w-0 flex-col p-6 sm:p-8">
        <div className="text-muted mb-3 flex items-center gap-3 text-xs font-semibold tracking-wider uppercase">
          <span className="text-(--accent-on-chip)">Featured</span>

          <span aria-hidden>·</span>

          <span
            className="flex items-center gap-1"
            aria-label={pluralize(project.stars ?? 0, "star")}
          >
            <Star className="size-3.5" aria-hidden />
            {project.stars ?? "—"}
          </span>

          <span
            className="flex items-center gap-1"
            aria-label={pluralize(project.forks ?? 0, "fork")}
          >
            <GitFork className="size-3.5" aria-hidden />
            {project.forks ?? "—"}
          </span>
        </div>

        <h3 className="text-2xl leading-tight font-bold text-balance">{project.title}</h3>

        {project.description && (
          <p className="text-muted mt-3 line-clamp-4 text-sm text-pretty">{project.description}</p>
        )}

        {project.language || project.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.language && (
              <span className="rounded-full border border-(--brand-deep)/40 bg-(--chip-surface) px-2 py-0.5 text-xs font-semibold text-(--accent-on-chip)">
                {project.language}
              </span>
            )}

            {project.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="border-border text-muted rounded-full border bg-(--chip-surface) px-2 py-0.5 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          {project.liveUrl && (
            <Button
              href={project.liveUrl}
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
              leftIcon={<ExternalLink className="size-3.5" aria-hidden />}
            >
              Live
            </Button>
          )}

          {project.githubUrl && (
            <Button
              href={project.githubUrl}
              variant="secondary"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
              leftIcon={<Github className="size-3.5" aria-hidden />}
            >
              Code
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
