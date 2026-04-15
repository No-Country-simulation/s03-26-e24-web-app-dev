"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import { useTestimonial } from "../hooks/use-testimonials";
import type { MediaFile, Testimony } from "@/types";
import {
  ArrowUpRight,
  CalendarDays,
  PlayCircle,
  Quote,
  Sparkles,
  Tag,
} from "lucide-react";

interface TestimonySpotlightModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimony: Testimony | null;
  enableBackendSync?: boolean;
}

function getMediaByType(mediaFiles: MediaFile[], type: "Image" | "Video") {
  return mediaFiles.find((media) => media.type === type);
}

function formatDateLabel(value?: string | null): string {
  if (!value) {
    return "fecha pendiente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "fecha pendiente";
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
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

export function TestimonySpotlightModal({
  open,
  onOpenChange,
  testimony,
  enableBackendSync = false,
}: TestimonySpotlightModalProps) {
  const shouldSyncFromBackend = Boolean(
    open && testimony?.id && enableBackendSync,
  );

  const {
    data: backendTestimony,
    isFetching,
    isError,
  } = useTestimonial(testimony?.id ?? "", {
    enabled: shouldSyncFromBackend,
  });

  const activeTestimony = backendTestimony ?? testimony;

  const extendedParagraphs = useMemo(() => {
    if (!activeTestimony?.extendedBody) {
      return [];
    }

    return activeTestimony.extendedBody
      .split("\n")
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [activeTestimony?.extendedBody]);

  if (!activeTestimony) {
    return null;
  }

  const image = getMediaByType(activeTestimony.mediaFiles, "Image");
  const video = getMediaByType(activeTestimony.mediaFiles, "Video");
  const initials = getInitials(activeTestimony.authorName);
  const publishedDate = formatDateLabel(
    activeTestimony.publishedAt ?? activeTestimony.createdAt,
  );
  const typeLabel =
    activeTestimony.type === "SuccessCase" ? "Caso de exito" : "Testimonio";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[92vh] w-[min(1040px,96vw)] overflow-hidden border-none bg-transparent p-0 shadow-none",
          "[&>button]:right-5 [&>button]:top-5 [&>button]:z-30 [&>button]:rounded-full [&>button]:border [&>button]:border-white/40 [&>button]:bg-black/55 [&>button]:p-1 [&>button]:text-white [&>button]:opacity-100",
        )}
      >
        <article className="grain-overlay relative overflow-hidden rounded-[28px] border border-border/80 bg-background/95 shadow-2xl">
          <div className="pointer-events-none absolute -left-12 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-4 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />

          <div className="grid max-h-[92vh] grid-cols-1 lg:grid-cols-[320px,1fr]">
            <aside className="relative min-h-[280px] overflow-hidden border-b border-border/70 lg:min-h-full lg:border-b-0 lg:border-r">
              {image ? (
                <Image
                  src={image.url}
                  alt={activeTestimony.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 320px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-background" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <Badge className="border-none bg-white/90 text-black shadow-sm">
                  {typeLabel}
                </Badge>
                {activeTestimony.category && (
                  <Badge className="border-none bg-black/55 text-white">
                    {activeTestimony.category.name}
                  </Badge>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-white/70">
                  historia real
                </p>
                <h3 className="break-words font-display text-3xl leading-[1.02]">
                  {activeTestimony.authorName}
                </h3>
                <p className="mt-1 truncate text-sm text-white/80">
                  {activeTestimony.authorRole ?? "Comunidad Testimonial CMS"}
                </p>
              </div>
            </aside>

            <section className="relative overflow-y-auto p-6 sm:p-8">
              <DialogHeader className="space-y-4 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={activeTestimony.status} />
                  <Badge
                    variant="outline"
                    className="border-primary/25 bg-primary/8 text-primary"
                  >
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Spotlight
                  </Badge>
                  {enableBackendSync && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-border/70 bg-card/70 text-muted-foreground",
                        isError && "border-destructive/40 text-destructive",
                      )}
                    >
                      {isFetching
                        ? "Sincronizando backend..."
                        : isError
                          ? "Vista previa local activa"
                          : "Datos sincronizados"}
                    </Badge>
                  )}
                </div>

                <DialogTitle className="break-words font-display text-3xl leading-tight sm:text-4xl">
                  {activeTestimony.title}
                </DialogTitle>

                <DialogDescription className="text-base leading-relaxed text-muted-foreground">
                  {activeTestimony.type === "SuccessCase"
                    ? "Caso de exito en formato largo: un preview rapido y la historia completa en una sola experiencia."
                    : "Testimonio breve en formato editorial para captar el punto clave en segundos."}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                <blockquote className="relative rounded-2xl border border-border/70 bg-card/70 px-6 py-5">
                  <Quote className="absolute -top-3 left-5 h-6 w-6 rounded-full bg-primary p-1 text-primary-foreground" />
                  <p className="break-words text-base leading-relaxed text-foreground/95 sm:text-lg">
                    &ldquo;{activeTestimony.body}&rdquo;
                  </p>
                </blockquote>

                {activeTestimony.type === "SuccessCase" &&
                extendedParagraphs.length > 0 ? (
                  <div className="space-y-4">
                    {extendedParagraphs.map((paragraph, index) => (
                      <p
                        key={`${activeTestimony.id}-paragraph-${index}`}
                        className="text-[15px] leading-7 text-foreground/90"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm leading-7 text-muted-foreground">
                    Este formato esta pensado para comunicacion rapida:
                    contenido compacto, contexto claro y lectura inmediata.
                  </p>
                )}

                <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/60 p-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11 border border-border/70">
                      <AvatarImage src="" alt={activeTestimony.authorName} />
                      <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {activeTestimony.authorName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {activeTestimony.authorRole ?? "Comunidad educacional"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Publicado {publishedDate}
                    </div>
                    {activeTestimony.category && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" />
                        {activeTestimony.category.name}
                      </div>
                    )}
                  </div>
                </div>

                {activeTestimony.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {activeTestimony.tags.map((tag) => (
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

                {video && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-primary/35 bg-primary/5 px-5 text-primary hover:bg-primary/10"
                  >
                    <a href={video.url} target="_blank" rel="noreferrer">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Ver testimonio en video
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </section>
          </div>
        </article>
      </DialogContent>
    </Dialog>
  );
}
