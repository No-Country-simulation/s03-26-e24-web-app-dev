"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SegmentedTabs } from "@/components/shared/segmented-tabs";
import { TestimonyGrid } from "@/features/testimonials/components/testimony-grid";
import type { Category, Testimony } from "@/types";
import {
  LOCAL_DEMO_DB_UPDATED_EVENT,
  listCategories,
  listTestimonies,
} from "@/lib/local-demo";
import { Search, Star, FileText, Sparkles } from "lucide-react";

function countByCategory(
  testimonials: Testimony[],
  category: Category,
): number {
  return testimonials.filter((item) => item.categoryId === category.id).length;
}

export default function TestimonialsPage() {
  const [allPublished, setAllPublished] = useState<Testimony[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");

  useEffect(() => {
    const load = () => {
      setAllPublished(listTestimonies({ publishedOnly: true }));
      setCategories(listCategories());
    };

    load();
    window.addEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);

    return () => {
      window.removeEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return allPublished.filter((item) => {
      const categoryMatch =
        activeCategoryId === "all" || item.categoryId === activeCategoryId;

      if (!categoryMatch) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [item.title, item.body, item.authorName, item.category?.name]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [allPublished, searchTerm, activeCategoryId]);

  const successCases = filtered.filter((t) => t.type === "SuccessCase");
  const regularTestimonials = filtered.filter((t) => t.type === "Testimonial");

  const categoryFilters = [
    { id: "all", name: "Todos", count: allPublished.length },
    ...categories.map((category) => ({
      id: category.id,
      name: category.name,
      count: countByCategory(allPublished, category),
    })),
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 rounded-2xl border border-border/70 bg-card/75 p-6 sm:p-8">
        <Badge className="mb-4" variant="secondary">
          <Sparkles className="mr-1 h-3 w-3" />
          Historias reales publicadas
        </Badge>
        <h1 className="mb-3 text-4xl font-display font-normal tracking-tight sm:text-5xl md:text-6xl">
          Lo que dice nuestra comunidad
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          Solo veras testimonios ya aprobados. Todo cambio pasa por moderacion
          antes de aparecer en esta vista.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Publicados
            </p>
            <p className="font-display text-3xl leading-none">{allPublished.length}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Casos de exito
            </p>
            <p className="font-display text-3xl leading-none">{successCases.length}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Testimonios
            </p>
            <p className="font-display text-3xl leading-none">{regularTestimonials.length}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border/70 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar testimonios..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-11 rounded-xl border-border/70 bg-background/70 pl-10 shadow-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map((cat) => (
            <Badge
              key={cat.id}
              variant={cat.id === activeCategoryId ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => setActiveCategoryId(cat.id)}
            >
              {cat.name} ({cat.count})
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-8">
        <SegmentedTabs
          size="sm"
          className="pb-1"
          listClassName="max-w-full"
          items={[
            {
              value: "all",
              label: "Todos",
              icon: <Sparkles className="h-4 w-4" />,
              count: filtered.length,
            },
            {
              value: "testimonials",
              label: "Testimonios",
              icon: <FileText className="h-4 w-4" />,
              count: regularTestimonials.length,
            },
            {
              value: "success",
              label: "Casos de Exito",
              icon: <Star className="h-4 w-4" />,
              count: successCases.length,
            },
          ]}
        />

        <TabsContent value="all" className="mt-0">
          <TestimonyGrid testimonials={filtered} enableBackendSync={false} />
        </TabsContent>

        <TabsContent value="testimonials" className="mt-0">
          <TestimonyGrid
            testimonials={regularTestimonials}
            emptyMessage="No hay testimonios disponibles"
            enableBackendSync={false}
          />
        </TabsContent>

        <TabsContent value="success" className="mt-0">
          <TestimonyGrid
            testimonials={successCases}
            emptyMessage="No hay casos de exito disponibles"
            enableBackendSync={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
