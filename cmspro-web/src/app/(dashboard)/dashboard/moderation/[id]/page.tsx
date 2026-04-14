"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import {
  LOCAL_DEMO_DB_UPDATED_EVENT,
  approveShadowCopy,
  getModerationReviewContext,
  listCategories,
  rejectShadowCopy,
} from "@/lib/local-demo";
import type {
  ModerationReviewContext,
  ModerationReviewType,
  ModerationSnapshot,
} from "@/lib/local-demo";
import { useAuth } from "@/providers/auth-provider";
import {
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";

type FieldDiff = {
  label: string;
  original: string;
  proposed: string;
  changed: boolean;
};

function stringify(value: unknown): string {
  if (value == null) {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "-";
  }

  return String(value);
}

function reviewTypeLabel(reviewType: ModerationReviewType): string {
  if (reviewType === "InitialSubmission") {
    return "Primera revision";
  }

  if (reviewType === "ReworkSubmission") {
    return "Correccion tras rechazo";
  }

  return "Sugerencia sobre publicado";
}

function baselineLabel(reviewType: ModerationReviewType): string {
  if (reviewType === "ReworkSubmission") {
    return "Ultima version rechazada";
  }

  return "Version publicada";
}

function reviewToneClass(reviewType: ModerationReviewType): string {
  if (reviewType === "InitialSubmission") {
    return "border-blue-200/70 bg-blue-100/35 text-blue-800";
  }

  if (reviewType === "ReworkSubmission") {
    return "border-amber-200/70 bg-amber-100/45 text-amber-800";
  }

  return "border-emerald-200/70 bg-emerald-100/35 text-emerald-800";
}

function buildFieldDiffs(
  baseline: ModerationSnapshot,
  proposed: ModerationSnapshot,
  categoriesById: Map<string, string>,
): FieldDiff[] {
  const resolveCategoryName = (categoryId: string): string => {
    return categoriesById.get(categoryId) ?? categoryId;
  };

  const rows: Omit<FieldDiff, "changed">[] = [
    {
      label: "Tipo",
      original: stringify(baseline.type),
      proposed: stringify(proposed.type),
    },
    {
      label: "Titulo",
      original: stringify(baseline.title),
      proposed: stringify(proposed.title),
    },
    {
      label: "Body",
      original: stringify(baseline.body),
      proposed: stringify(proposed.body),
    },
    {
      label: "ExtendedBody",
      original: stringify(baseline.extendedBody),
      proposed: stringify(proposed.extendedBody),
    },
    {
      label: "Autor",
      original: stringify(baseline.authorName),
      proposed: stringify(proposed.authorName),
    },
    {
      label: "Rol",
      original: stringify(baseline.authorRole),
      proposed: stringify(proposed.authorRole),
    },
    {
      label: "Categoria",
      original: stringify(resolveCategoryName(baseline.categoryId)),
      proposed: stringify(resolveCategoryName(proposed.categoryId)),
    },
    {
      label: "Tags",
      original: stringify(baseline.tags.map((tag: string) => `#${tag}`)),
      proposed: stringify(proposed.tags.map((tag: string) => `#${tag}`)),
    },
    {
      label: "Media",
      original: stringify(baseline.mediaUrls),
      proposed: stringify(proposed.mediaUrls),
    },
  ];

  return rows.map((row) => ({
    ...row,
    changed: row.original !== row.proposed,
  }));
}

function ProposedSummary({
  proposed,
  categoriesById,
}: {
  proposed: ModerationSnapshot;
  categoriesById: Map<string, string>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl">Contenido propuesto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-xl border border-border/70 bg-card/50 p-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Tipo
            </p>
            <p className="text-sm">{proposed.type}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Categoria
            </p>
            <p className="text-sm">
              {categoriesById.get(proposed.categoryId) ?? proposed.categoryId}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Autor
            </p>
            <p className="text-sm">{proposed.authorName}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Rol
            </p>
            <p className="text-sm">{proposed.authorRole || "-"}</p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-border/70 bg-card/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Titulo
          </p>
          <p className="text-sm leading-relaxed">{proposed.title}</p>
        </div>

        <div className="space-y-2 rounded-xl border border-border/70 bg-card/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Body
          </p>
          <p className="text-sm leading-relaxed">{proposed.body}</p>
        </div>

        {proposed.type === "SuccessCase" && (
          <div className="space-y-2 rounded-xl border border-border/70 bg-card/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              ExtendedBody
            </p>
            <p className="text-sm leading-relaxed">{proposed.extendedBody || "-"}</p>
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-border/70 bg-card/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Tags
          </p>
          <p className="text-sm">
            {proposed.tags.length > 0
              ? proposed.tags.map((tag: string) => `#${tag}`).join(", ")
              : "-"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ModerationDiffPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const testimonyId = params?.id ?? "";

  const [reviewComment, setReviewComment] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [state, setState] = useState<ModerationReviewContext | null>(null);
  const [categoriesById, setCategoriesById] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    const load = () => {
      const categoryMap = new Map(
        listCategories().map((category) => [category.id, category.name]),
      );
      setCategoriesById(categoryMap);
      setState(getModerationReviewContext(testimonyId));
    };

    load();
    window.addEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);

    return () => {
      window.removeEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);
    };
  }, [testimonyId]);

  const fieldDiffs = useMemo(() => {
    if (!state?.baseline) {
      return [];
    }

    return buildFieldDiffs(state.baseline, state.proposed, categoriesById);
  }, [state, categoriesById]);

  const changedCount = fieldDiffs.filter((item) => item.changed).length;

  const handleApprove = async () => {
    if (!user) {
      toast.error("No hay usuario activo para moderar");
      return;
    }

    setIsWorking(true);

    try {
      approveShadowCopy(testimonyId, user.id, reviewComment || undefined);
      toast.success("Revision aprobada y publicada");
      router.push("/dashboard/moderation");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo aprobar";
      toast.error(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleReject = async () => {
    if (!user) {
      toast.error("No hay usuario activo para moderar");
      return;
    }

    setIsWorking(true);

    try {
      rejectShadowCopy(testimonyId, user.id, reviewComment || undefined);
      toast.success("Revision rechazada");
      router.push("/dashboard/moderation");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo rechazar";
      toast.error(message);
    } finally {
      setIsWorking(false);
    }
  };

  if (!state) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Revision de cambios"
          description="No hay una revision pendiente para este testimonio"
          backHref="/dashboard/moderation"
        />
        <EmptyState
          icon={<ShieldAlert className="h-6 w-6 text-muted-foreground" />}
          title="No se encontro una revision pendiente"
          description="El registro ya fue revisado o no existe un shadow copy activo."
          action={{
            label: "Volver a moderacion",
            href: "/dashboard/moderation",
          }}
        />
      </div>
    );
  }

  const isInitialSubmission = state.reviewType === "InitialSubmission";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revision de moderacion"
        description="Analiza la propuesta y decide si se publica o se rechaza"
        backHref="/dashboard/moderation"
      />

      <Card className="border-border/70 bg-card/70">
        <CardContent className="grid gap-4 p-4 md:grid-cols-[1.4fr,auto] md:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{reviewTypeLabel(state.reviewType)}</Badge>
              <Badge variant="secondary">
                {state.proposed.type === "SuccessCase"
                  ? "Caso de Exito"
                  : "Testimonio"}
              </Badge>
              {state.baselineSource !== "None" && (
                <Badge variant="outline">
                  Baseline: {baselineLabel(state.reviewType)}
                </Badge>
              )}
            </div>

            <p
              className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-medium ${reviewToneClass(
                state.reviewType,
              )}`}
            >
              {state.reviewType === "InitialSubmission"
                ? "Revision inicial: valida calidad base antes de publicar."
                : state.reviewType === "ReworkSubmission"
                  ? "Revision de correccion: confirma que el feedback previo quedo resuelto."
                  : "Sugerencia sobre publicado: preserva la version activa hasta aprobar cambios."}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full"
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
          >
            <ChevronDown className="mr-2 h-4 w-4" />
            Ir a decision
          </Button>
        </CardContent>
      </Card>

      {isInitialSubmission ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Tipo de revision</p>
                <p className="text-lg font-semibold">Primera revision (sin diff)</p>
              </div>
            </CardContent>
          </Card>
          <ProposedSummary proposed={state.proposed} categoriesById={categoriesById} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Campos sin cambios</p>
                  <p className="text-xl font-semibold">{fieldDiffs.length - changedCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Campos modificados</p>
                  <p className="text-xl font-semibold">{changedCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Comparando contra</p>
                  <p className="text-sm font-semibold">{baselineLabel(state.reviewType)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">Diff de contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fieldDiffs.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-3 rounded-xl border border-border/70 bg-card/50 p-4 md:grid-cols-2"
                >
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {baselineLabel(state.reviewType)} - {item.label}
                    </p>
                    <p className="rounded-lg border border-border/70 bg-background/80 p-3 text-sm leading-relaxed">
                      {item.original}
                    </p>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Version propuesta - {item.label}
                      </p>
                      {item.changed && (
                        <Badge className="h-5 border-none bg-amber-500/90 text-[10px] text-white">
                          CAMBIO
                        </Badge>
                      )}
                    </div>
                    <p
                      className={
                        item.changed
                          ? "rounded-lg border border-amber-400/50 bg-amber-100/30 p-3 text-sm leading-relaxed"
                          : "rounded-lg border border-border/70 bg-background/80 p-3 text-sm leading-relaxed"
                      }
                    >
                      {item.proposed}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="sticky bottom-4 z-20 border-border/80 bg-background/95 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle>Decision de moderacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="review-comment">Comentario de revision</Label>
            <Input
              id="review-comment"
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Ej: Falta evidencia concreta del resultado. Ajustar y reenviar."
            />
            <p className="text-xs text-muted-foreground">
              El comentario es obligatorio cuando rechazas para que el editor vea el motivo.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-red-300 text-red-700 hover:bg-red-50"
              onClick={handleReject}
              disabled={isWorking}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
            <Button
              type="button"
              className="h-11 rounded-full"
              onClick={handleApprove}
              disabled={isWorking}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Aprobar y publicar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
