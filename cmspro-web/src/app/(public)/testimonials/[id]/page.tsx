"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  PlayCircle,
  Quote,
  Tag,
} from "lucide-react";
import type { Testimony } from "@/types";
import {
  LOCAL_DEMO_DB_UPDATED_EVENT,
  getTestimonyById,
} from "@/lib/local-demo";

function getMedia(testimony: Testimony, type: "Image" | "Video") {
  return testimony.mediaFiles.find((item) => item.type === type);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(value?: string | null): string {
  if (!value) return "fecha pendiente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "fecha pendiente";
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function TestimonialDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [testimony, setTestimony] = useState<Testimony | null>(null);

  // ?preview=1 from dashboard allows viewing non-published testimonials
  const isPreviewMode = searchParams.get("preview") === "1";

  useEffect(() => {
    const load = () => {
      const item = getTestimonyById(params.id);

      if (!item) {
        setTestimony(null);
        return;
      }

      // Public visitors only see Published; dashboard preview sees any status
      if (!isPreviewMode && item.status !== "Published") {
        setTestimony(null);
        return;
      }

      setTestimony(item);
    };

    load();
    window.addEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);

    return () => {
      window.removeEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);
    };
  }, [params.id, isPreviewMode]);

  if (!testimony) {
    return (
      <div className="container mx-auto px-4 py-10">
        <EmptyState
          title="No encontramos este testimonio"
          description="Puede no estar publicado o no existir en el modo demo local."
          action={{ label: "Volver a testimonios", href: "/testimonials" }}
        />
      </div>
    );
  }

  const image = getMedia(testimony, "Image");
  const video = getMedia(testimony, "Video");
  const initials = getInitials(testimony.authorName);
  const isSuccessCase = testimony.type === "SuccessCase";
  const typeLabel = isSuccessCase ? "Caso de exito" : "Testimonio";
  const publishedDate = formatDate(
    testimony.publishedAt ?? testimony.createdAt,
  );

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <Button variant="ghost" asChild className="mb-4">
        <Link href={isPreviewMode ? "/dashboard/testimonials" : "/testimonials"}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isPreviewMode ? "Volver al dashboard" : "Volver a testimonios"}
        </Link>
      </Button>

      {/* Preview mode banner */}
      {isPreviewMode && testimony.status !== "Published" && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent/45 bg-accent/10 px-4 py-2.5 text-sm">
          <StatusBadge status={testimony.status} />
          <span className="text-muted-foreground">
            Vista previa — este testimonio no es visible al publico.
          </span>
        </div>
      )}

      <article className="overflow-hidden rounded-3xl border border-border/70 bg-card/60 shadow-xl">
        {/* Hero image section */}
        <div className="relative min-h-[280px] border-b border-border/70">
          {image ? (
            <Image
              src={image.url}
              alt={testimony.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 900px"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <Badge className="mb-3 border-none bg-white/90 text-black">
              {typeLabel}
            </Badge>
            <h1 className="font-display text-3xl leading-tight sm:text-4xl break-words">
              {testimony.title}
            </h1>
            <p className="mt-2 truncate text-sm text-white/85">
              {testimony.authorName}
              {testimony.authorRole ? ` — ${testimony.authorRole}` : ""}
            </p>
          </div>
        </div>

        {/* Content section */}
        <div className="space-y-6 p-6 sm:p-8">
          {/* Quote / body */}
          <blockquote className="relative rounded-2xl border border-border/70 bg-background/70 px-6 py-5">
            <Quote className="absolute -top-3 left-5 h-6 w-6 rounded-full bg-primary p-1 text-primary-foreground" />
            <p className="text-base leading-relaxed sm:text-lg break-words whitespace-pre-wrap">
              &ldquo;{testimony.body}&rdquo;
            </p>
          </blockquote>

          {/* Extended body (SuccessCase only) */}
          {isSuccessCase && testimony.extendedBody && (
            <div className="space-y-4">
              {testimony.extendedBody
                .split("\n")
                .map((p) => p.trim())
                .filter(Boolean)
                .map((paragraph, idx) => (
                  <p
                    key={`p-${idx}`}
                    className="text-[15px] leading-7 text-foreground/90 break-words"
                  >
                    {paragraph}
                  </p>
                ))}
            </div>
          )}

          {/* Author & meta card */}
          <div className="grid gap-4 rounded-2xl border border-border/70 bg-background/60 p-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border border-border/70 shrink-0">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {testimony.authorName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {testimony.authorRole ?? "Comunidad CMS"}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{publishedDate}</span>
              </div>
              {testimony.category && (
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{testimony.category.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {testimony.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {testimony.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs"
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Video link */}
          {video && (
            <Button asChild variant="outline" className="rounded-full">
              <a href={video.url} target="_blank" rel="noreferrer">
                <PlayCircle className="mr-2 h-4 w-4" />
                Ver video relacionado
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </article>
    </div>
  );
}
