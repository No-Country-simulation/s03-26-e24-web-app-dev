"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import {
  FileText,
  Clock,
  CheckCircle,
  Eye,
  TrendingUp,
  ArrowUpRight,
  Plus,
  AlertTriangle,
  PencilLine,
  ShieldCheck,
} from "lucide-react";
import {
  LOCAL_DEMO_DB_UPDATED_EVENT,
  listPendingShadowsCount,
  listTestimonies,
} from "@/lib/local-demo";
import { useAuth } from "@/providers/auth-provider";
import type { Testimony } from "@/types";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [pendingQueue, setPendingQueue] = useState(0);

  useEffect(() => {
    const load = () => {
      setTestimonies(listTestimonies());
      setPendingQueue(listPendingShadowsCount());
    };

    load();
    window.addEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);

    return () => {
      window.removeEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);
    };
  }, []);

  const stats = useMemo(() => {
    const total = testimonies.length;
    const published = testimonies.filter(
      (item) => item.status === "Published",
    ).length;
    const drafts = testimonies.filter((item) => item.status === "Draft").length;

    return {
      total,
      published,
      drafts,
      pending: pendingQueue,
    };
  }, [testimonies, pendingQueue]);

  const publishRate = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;

  const recentActivity = useMemo(() => {
    return testimonies
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        action:
          item.status === "PendingReview"
            ? "Enviado a moderacion"
            : item.status === "Published"
              ? "Publicado"
              : item.status === "Rejected"
                ? "Rechazado"
                : "Guardado como borrador",
        author: item.authorName,
        time: new Date(item.createdAt).toLocaleString("es-PE", {
          dateStyle: "short",
          timeStyle: "short",
        }),
      }));
  }, [testimonies]);

  const dashboardCards = [
    {
      title: "Total Testimonios",
      value: String(stats.total),
      helper: "Registros locales",
      icon: FileText,
      href: "/dashboard/testimonials",
    },
    {
      title: "Pendientes",
      value: String(stats.pending),
      helper: "Esperando decision",
      icon: Clock,
      href: "/dashboard/moderation",
    },
    {
      title: "Publicados",
      value: String(stats.published),
      helper: "Ya visibles en publico",
      icon: CheckCircle,
      href: "/dashboard/testimonials",
    },
    {
      title: "Borradores",
      value: String(stats.drafts),
      helper: "Listos para editar",
      icon: Eye,
      href: "/dashboard/testimonials",
    },
  ];

  const reviewFlow = [
    {
      label: "Borradores",
      value: stats.drafts,
      note: "edicion interna",
      icon: PencilLine,
    },
    {
      label: "En revision",
      value: stats.pending,
      note: "cola de moderacion",
      icon: ShieldCheck,
    },
    {
      label: "Publicados",
      value: stats.published,
      note: "sitio publico activo",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          user?.role === "Admin"
            ? "Panel de moderacion y control de testimonios"
            : "Panel de edicion y envio a revision"
        }
        actions={
          <Button asChild>
            <Link href="/dashboard/testimonials?new=1">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Testimonio
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="border-border/70 bg-card/75 lg:col-span-8">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Pulso editorial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {reviewFlow.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.label}
                    className="rounded-xl border border-border/70 bg-background/75 p-3"
                  >
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <Icon className="h-4 w-4" />
                      <p className="text-xs uppercase tracking-[0.12em]">{step.label}</p>
                    </div>
                    <p className="font-display text-3xl leading-none">{step.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{step.note}</p>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 rounded-xl border border-border/70 bg-background/70 p-4">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium">Tasa de publicacion</p>
                <p className="font-semibold">{publishRate}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/75 via-primary to-accent/80"
                  style={{ width: `${publishRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Proporcion de contenido ya aprobado sobre el total del workspace.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/75 lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Foco del dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.pending > 0 ? (
              <div className="rounded-xl border border-accent/45 bg-accent/15 p-4">
                <div className="mb-2 flex items-center gap-2 text-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-semibold">Hay {stats.pending} pendientes</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Prioriza la revision para mantener flujo continuo entre editor y moderacion.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/35 bg-primary/10 p-4">
                <div className="mb-2 flex items-center gap-2 text-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <p className="text-sm font-semibold">Cola al dia</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  No hay pendientes de moderacion en este momento.
                </p>
              </div>
            )}

            <Button variant="outline" className="w-full justify-between" asChild>
              <Link href="/dashboard/moderation">
                Abrir cola de moderacion
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="relative overflow-hidden border-border/70 bg-card/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-accent/60 to-primary/20" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl leading-none">
                  {card.value}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span>{card.helper}</span>
                </div>
              </CardContent>
              <Link
                href={card.href}
                className="absolute inset-0"
                aria-label={`Ver ${card.title}`}
              />
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="border-border/70 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-display text-2xl">
              Actividad Reciente
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/testimonials">
                Ver todo
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="grid gap-2 rounded-xl border border-border/60 bg-background/70 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      por {activity.author}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Acciones Rapidas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/testimonials?new=1">
                <Plus className="mr-2 h-4 w-4" />
                Crear nuevo testimonio
              </Link>
            </Button>

            {isAdmin && (
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/dashboard/moderation">
                  <Clock className="mr-2 h-4 w-4" />
                  Revisar pendientes ({stats.pending})
                </Link>
              </Button>
            )}

            <Button variant="outline" className="justify-start" asChild>
              <Link href="/testimonials" target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Ver pagina publica
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
