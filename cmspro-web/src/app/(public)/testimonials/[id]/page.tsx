"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ArrowLeft, ArrowUpRight, PlayCircle, Quote } from "lucide-react";
import type { Testimony } from "@/types";
import {
  LOCAL_DEMO_DB_UPDATED_EVENT,
  getTestimonyById,
} from "@/lib/local-demo";

function getMedia(testimony: Testimony, type: "Image" | "Video") {
  return testimony.mediaFiles.find((item) => item.type === type);
}

export default function TestimonialDetailPage() {
  const params = useParams<{ id: string }>();
  const [testimony, setTestimony] = useState<Testimony | null>(null);

  useEffect(() => {
    const load = () => {
      const item = getTestimonyById(params.id);

      if (!item || item.status !== "Published") {
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
  }, [params.id]);

  if (!testimony || testimony.type !== "SuccessCase") {
    return (
      <div className="container mx-auto px-4 py-10">
        <EmptyState
          title="No encontramos este caso de exito"
          description="Puede no estar publicado o no existir en el modo demo local."
          action={{ label: "Volver a testimonios", href: "/testimonials" }}
        />
      </div>
    );
  }

  const image = getMedia(testimony, "Image");
  const video = getMedia(testimony, "Video");

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/testimonials">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a testimonios
        </Link>
      </Button>

      <article className="overflow-hidden rounded-3xl border border-border/70 bg-card/60 shadow-xl">
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
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <Badge className="mb-3 border-none bg-white/90 text-black">
              Caso de Exito
            </Badge>
            <h1 className="font-display text-4xl leading-tight">
              {testimony.title}
            </h1>
            <p className="mt-2 text-sm text-white/85">
              {testimony.authorName} - {testimony.authorRole ?? "Comunidad CMS"}
            </p>
          </div>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <blockquote className="relative rounded-2xl border border-border/70 bg-background/70 px-6 py-5">
            <Quote className="absolute -top-3 left-5 h-6 w-6 rounded-full bg-primary p-1 text-primary-foreground" />
            <p className="text-lg leading-relaxed">{testimony.body}</p>
          </blockquote>

          <div className="prose prose-neutral max-w-none dark:prose-invert">
            <p className="text-base leading-8 text-foreground/90">
              {testimony.extendedBody ?? ""}
            </p>
          </div>

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
