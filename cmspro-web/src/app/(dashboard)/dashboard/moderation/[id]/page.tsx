"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
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
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  Layers3,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";

type ComparisonField = {
  key: string;
  label: string;
  baseline: string;
  proposed: string;
  changed: boolean;
};

type ReviewVisualMeta = {
  label: string;
  summary: string;
  baselineLabel: string | null;
  icon: LucideIcon;
  badgeClassName: string;
  stripeClassName: string;
};

const REVIEW_VISUALS: Record<ModerationReviewType, ReviewVisualMeta> = {
  InitialSubmission: {
    label: "Primera revision",
    summary: "Validas calidad base antes de la primera publicacion.",
    baselineLabel: null,
    icon: FileText,
    badgeClassName: "border-primary/35 bg-primary/10 text-primary",
    stripeClassName: "from-primary/35 via-primary/10 to-transparent",
  },
  ReworkSubmission: {
    label: "Correccion",
    summary:
      "Comparas contra la ultima version rechazada para confirmar mejoras.",
    baselineLabel: "Ultima version rechazada",
    icon: RefreshCcw,
    badgeClassName: "border-accent/45 bg-accent/12 text-accent-foreground",
    stripeClassName: "from-accent/35 via-accent/10 to-transparent",
  },
  PublishedSuggestion: {
    label: "Sugerencia sobre publicado",
    summary:
      "La version publicada sigue activa hasta que apruebes esta propuesta.",
    baselineLabel: "Version publicada",
    icon: Layers3,
    badgeClassName: "border-secondary bg-secondary text-secondary-foreground",
    stripeClassName: "from-secondary/70 via-secondary/25 to-transparent",
  },
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

type SnapshotFieldDefinition = {
  key: string;
  label: string;
  resolve: (
    snapshot: ModerationSnapshot,
    categoriesById: Map<string, string>,
  ) => string;
};

const SNAPSHOT_FIELDS: SnapshotFieldDefinition[] = [
  {
    key: "type",
    label: "Tipo",
    resolve: (snapshot) => stringify(snapshot.type),
  },
  {
    key: "title",
    label: "Titulo",
    resolve: (snapshot) => stringify(snapshot.title),
  },
  {
    key: "body",
    label: "Body",
    resolve: (snapshot) => stringify(snapshot.body),
  },
  {
    key: "extendedBody",
    label: "ExtendedBody",
    resolve: (snapshot) => stringify(snapshot.extendedBody),
  },
  {
    key: "authorName",
    label: "Autor",
    resolve: (snapshot) => stringify(snapshot.authorName),
  },
  {
    key: "authorRole",
    label: "Rol",
    resolve: (snapshot) => stringify(snapshot.authorRole),
  },
  {
    key: "category",
    label: "Categoria",
    resolve: (snapshot, categoriesById) =>
      stringify(categoriesById.get(snapshot.categoryId) ?? snapshot.categoryId),
  },
  {
    key: "tags",
    label: "Tags",
    resolve: (snapshot) => stringify(snapshot.tags.map((tag) => `#${tag}`)),
  },
  {
    key: "media",
    label: "Media",
    resolve: (snapshot) => stringify(snapshot.mediaUrls),
  },
];

function buildComparisonFields(
  baseline: ModerationSnapshot,
  proposed: ModerationSnapshot,
  categoriesById: Map<string, string>,
): ComparisonField[] {
  return SNAPSHOT_FIELDS.map((field) => {
    const baselineValue = field.resolve(baseline, categoriesById);
    const proposedValue = field.resolve(proposed, categoriesById);

    return {
      key: field.key,
      label: field.label,
      baseline: baselineValue,
      proposed: proposedValue,
      changed: baselineValue !== proposedValue,
    };
  });
}

function buildProposedOnlyFields(
  proposed: ModerationSnapshot,
  categoriesById: Map<string, string>,
): ComparisonField[] {
  return SNAPSHOT_FIELDS.map((field) => {
    const proposedValue = field.resolve(proposed, categoriesById);

    return {
      key: field.key,
      label: field.label,
      baseline: "-",
      proposed: proposedValue,
      changed: false,
    };
  });
}

type DiffMode = "changed" | "all";
type ViewMode = "split" | "focus";
type FocusSide = "baseline" | "proposed";

interface TopKpiCardProps {
  label: string;
  value: number;
  note: string;
  icon: LucideIcon;
  toneClassName?: string;
}

function TopKpiCard({
  label,
  value,
  note,
  icon: Icon,
  toneClassName,
}: TopKpiCardProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/70 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <span className={cn("rounded-md p-1", toneClassName)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="font-display text-2xl leading-none">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

interface FocusColumnProps {
  title: string;
  side: FocusSide;
  fields: ComparisonField[];
  baselineLabel: string;
}

function FocusColumn({ title, side, fields, baselineLabel }: FocusColumnProps) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="space-y-1.5">
        <CardTitle className="font-display text-2xl">{title}</CardTitle>
        <CardDescription>
          {side === "baseline"
            ? `Referencia usada para evaluar (${baselineLabel})`
            : "Version propuesta para esta revision"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {fields.map((field) => {
          const value = side === "baseline" ? field.baseline : field.proposed;

          return (
            <div
              key={`${side}-${field.key}`}
              className={cn(
                "rounded-lg border p-3",
                side === "proposed" && field.changed
                  ? "border-accent/45 bg-accent/10"
                  : "border-border/70 bg-background/70",
              )}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {field.label}
                </p>
                {side === "proposed" && field.changed && (
                  <Badge
                    variant="outline"
                    className="h-5 border-accent/45 bg-accent/15 px-1.5 text-[10px] text-accent-foreground"
                  >
                    Cambio
                  </Badge>
                )}
              </div>
              <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface SplitDiffTableProps {
  fields: ComparisonField[];
  baselineLabel: string;
}

function SplitDiffTable({ fields, baselineLabel }: SplitDiffTableProps) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="space-y-1.5">
        <CardTitle className="font-display text-2xl">Comparativa en una vista</CardTitle>
        <CardDescription>
          Menos scroll: cada fila muestra baseline y propuesta en paralelo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {fields.length === 0 ? (
          <div className="rounded-lg border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
            No hay campos para comparar.
          </div>
        ) : (
          fields.map((field) => (
            <div
              key={`split-${field.key}`}
              className={cn(
                "rounded-lg border p-3",
                field.changed
                  ? "border-accent/45 bg-accent/8"
                  : "border-border/70 bg-background/70",
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {field.label}
                </p>
                {field.changed && (
                  <Badge
                    variant="outline"
                    className="h-5 border-accent/45 bg-accent/15 px-1.5 text-[10px] text-accent-foreground"
                  >
                    Cambio detectado
                  </Badge>
                )}
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="rounded-md border border-border/70 bg-background/80 p-2.5">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {baselineLabel}
                  </p>
                  <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
                    {field.baseline}
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-md border p-2.5",
                    field.changed
                      ? "border-accent/45 bg-accent/12"
                      : "border-border/70 bg-background/80",
                  )}
                >
                  <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Propuesta
                  </p>
                  <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
                    {field.proposed}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface InitialSubmissionBoardProps {
  fields: ComparisonField[];
}

function InitialSubmissionBoard({ fields }: InitialSubmissionBoardProps) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="space-y-1.5">
        <CardTitle className="font-display text-2xl">Contenido propuesto</CardTitle>
        <CardDescription>
          Primera publicacion: validas la historia completa sin diff previo.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2.5 md:grid-cols-2">
        {fields.map((field) => (
          <div
            key={`initial-${field.key}`}
            className="rounded-lg border border-border/70 bg-background/70 p-3"
          >
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {field.label}
            </p>
            <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
              {field.proposed}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface FieldQuickPeekDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: ComparisonField | null;
  baselineLabel: string;
}

function FieldQuickPeekDialog({
  open,
  onOpenChange,
  field,
  baselineLabel,
}: FieldQuickPeekDialogProps) {
  if (!field) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalle de campo: {field.label}</DialogTitle>
          <DialogDescription>
            Comparativa puntual para revisar con contexto completo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-background/70 p-3">
            <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {baselineLabel}
            </p>
            <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
              {field.baseline}
            </p>
          </div>
          <div
            className={cn(
              "rounded-lg border p-3",
              field.changed
                ? "border-accent/45 bg-accent/12"
                : "border-border/70 bg-background/70",
            )}
          >
            <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Propuesta
            </p>
            <p className="break-words text-sm leading-relaxed whitespace-pre-wrap">
              {field.proposed}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ModerationDiffPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const testimonyId = params?.id ?? "";

  const [reviewComment, setReviewComment] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [state, setState] = useState<ModerationReviewContext | null>(null);
  const [categoriesById, setCategoriesById] = useState<Map<string, string>>(
    new Map(),
  );

  const [diffMode, setDiffMode] = useState<DiffMode>("changed");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [focusSide, setFocusSide] = useState<FocusSide>("proposed");

  const [quickPeekOpen, setQuickPeekOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<ComparisonField | null>(null);

  useEffect(() => {
    const load = () => {
      const categoryMap = new Map(
        listCategories().map((category) => [category.id, category.name]),
      );

      setCategoriesById(categoryMap);
      setState(getModerationReviewContext(testimonyId));
      setIsReady(true);
    };

    load();
    window.addEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);

    return () => {
      window.removeEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, load);
    };
  }, [testimonyId]);

  const reviewMeta = state ? REVIEW_VISUALS[state.reviewType] : null;

  const comparisonFields = useMemo(() => {
    if (!state?.baseline) {
      return [];
    }

    return buildComparisonFields(state.baseline, state.proposed, categoriesById);
  }, [state, categoriesById]);

  const proposedOnlyFields = useMemo(() => {
    if (!state || state.baseline) {
      return [];
    }

    return buildProposedOnlyFields(state.proposed, categoriesById);
  }, [state, categoriesById]);

  const changedFields = comparisonFields.filter((field) => field.changed);
  const unchangedFields = comparisonFields.filter((field) => !field.changed);

  const visibleComparisonFields =
    diffMode === "changed" ? changedFields : comparisonFields;

  const changedCount = changedFields.length;
  const unchangedCount = unchangedFields.length;
  const totalCount = comparisonFields.length;

  const baselineLabel = reviewMeta?.baselineLabel ?? "Baseline";
  const isInitialSubmission = state?.reviewType === "InitialSubmission";

  const handleApprove = async () => {
    if (!user) {
      toast.error("No hay usuario activo para moderar");
      return;
    }

    setIsWorking(true);

    try {
      const note = reviewComment.trim();
      approveShadowCopy(testimonyId, user.id, note || undefined);
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

    const note = reviewComment.trim();

    if (!note) {
      toast.error("Debes escribir un comentario para rechazar");
      return;
    }

    setIsWorking(true);

    try {
      rejectShadowCopy(testimonyId, user.id, note);
      toast.success("Revision rechazada");
      router.push("/dashboard/moderation");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo rechazar";
      toast.error(message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleOpenFieldQuickPeek = (field: ComparisonField) => {
    setSelectedField(field);
    setQuickPeekOpen(true);
  };

  if (!isReady) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Revision de moderacion"
          description="Preparando comparativa y contexto de revision"
          backHref="/dashboard/moderation"
        />
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Cargando revision...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!state || !reviewMeta) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Revision de moderacion"
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

  const ReviewIcon = reviewMeta.icon;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Revision de moderacion"
        description="Vista compacta para decidir rapido sin perder contexto"
        backHref="/dashboard/moderation"
      />

      <Card className="relative overflow-hidden border-border/70 bg-card/85">
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r",
            reviewMeta.stripeClassName,
          )}
        />
        <CardContent className="relative grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr),auto] lg:items-center">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn("border", reviewMeta.badgeClassName)}
              >
                <ReviewIcon className="mr-1.5 h-3.5 w-3.5" />
                {reviewMeta.label}
              </Badge>

              <StatusBadge status={state.testimonyStatus} />

              {reviewMeta.baselineLabel && (
                <Badge variant="outline" className="border-border/70 bg-muted/60">
                  Baseline: {reviewMeta.baselineLabel}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">{reviewMeta.summary}</p>
          </div>

          {!isInitialSubmission && (
            <div className="grid gap-2 sm:grid-cols-3">
              <TopKpiCard
                label="Cambios"
                value={changedCount}
                note="a revisar"
                icon={Sparkles}
                toneClassName="bg-accent/20 text-accent-foreground"
              />
              <TopKpiCard
                label="Sin cambios"
                value={unchangedCount}
                note="estables"
                icon={CheckCircle2}
                toneClassName="bg-secondary text-secondary-foreground"
              />
              <TopKpiCard
                label="Total"
                value={totalCount}
                note="campos"
                icon={ArrowLeftRight}
                toneClassName="bg-muted text-foreground"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr),360px]">
        <section className="space-y-4">
          {isInitialSubmission ? (
            <InitialSubmissionBoard fields={proposedOnlyFields} />
          ) : (
            <>
              <Card className="border-border/70 bg-card/80">
                <CardContent className="flex flex-wrap items-center gap-2 p-3">
                  <div className="rounded-md bg-muted/70 p-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={diffMode === "changed" ? "default" : "ghost"}
                      onClick={() => setDiffMode("changed")}
                      className="h-8"
                    >
                      Solo cambios ({changedCount})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={diffMode === "all" ? "default" : "ghost"}
                      onClick={() => setDiffMode("all")}
                      className="h-8"
                    >
                      Todo ({totalCount})
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

                  <div className="rounded-md bg-muted/70 p-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === "split" ? "default" : "ghost"}
                      onClick={() => setViewMode("split")}
                      className="h-8"
                    >
                      Split view
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === "focus" ? "default" : "ghost"}
                      onClick={() => setViewMode("focus")}
                      className="h-8"
                    >
                      Focus mode
                    </Button>
                  </div>

                  {viewMode === "focus" && (
                    <div className="rounded-md bg-muted/70 p-1">
                      <Button
                        type="button"
                        size="sm"
                        variant={focusSide === "baseline" ? "default" : "ghost"}
                        onClick={() => setFocusSide("baseline")}
                        className="h-8"
                      >
                        Ver baseline
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={focusSide === "proposed" ? "default" : "ghost"}
                        onClick={() => setFocusSide("proposed")}
                        className="h-8"
                      >
                        Ver propuesta
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {viewMode === "split" ? (
                <SplitDiffTable
                  fields={visibleComparisonFields}
                  baselineLabel={baselineLabel}
                />
              ) : (
                <FocusColumn
                  title={
                    focusSide === "baseline"
                      ? baselineLabel
                      : "Version propuesta"
                  }
                  side={focusSide}
                  fields={visibleComparisonFields}
                  baselineLabel={baselineLabel}
                />
              )}

              <Card className="border-border/70 bg-card/80">
                <CardHeader className="space-y-1.5">
                  <CardTitle className="font-display text-2xl">Mapa rapido</CardTitle>
                  <CardDescription>
                    Lista compacta para abrir detalle puntual de cada campo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleComparisonFields.length === 0 ? (
                    <div className="sm:col-span-2 lg:col-span-3 rounded-lg border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                      No hay campos visibles con el filtro actual.
                    </div>
                  ) : (
                    visibleComparisonFields.map((field) => (
                      <button
                        key={`peek-${field.key}`}
                        type="button"
                        onClick={() => handleOpenFieldQuickPeek(field)}
                        className={cn(
                          "group rounded-lg border p-3 text-left transition-colors",
                          field.changed
                            ? "border-accent/45 bg-accent/10 hover:bg-accent/15"
                            : "border-border/70 bg-background/70 hover:bg-muted/40",
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{field.label}</p>
                          <Eye className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                        </div>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {field.proposed}
                        </p>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="border-border/70 bg-card/90">
            <CardHeader className="space-y-1.5">
              <CardTitle className="font-display text-2xl">Decision</CardTitle>
              <CardDescription>
                Acciones claras y comentario de trazabilidad en un solo panel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-background/70 p-3 text-sm">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <ClipboardCheck className="h-4 w-4 text-primary" />
                  Contexto
                </div>
                <p className="text-muted-foreground">{reviewMeta.summary}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-comment">Comentario para moderacion</Label>
                <Textarea
                  id="review-comment"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Ej: Falta evidencia concreta del resultado. Ajustar y reenviar."
                  className="min-h-28 resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  Al rechazar, el comentario es obligatorio.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11 w-full"
                  onClick={handleReject}
                  disabled={isWorking}
                >
                  {isWorking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Rechazar
                </Button>
                <Button
                  type="button"
                  className="h-11 w-full"
                  onClick={handleApprove}
                  disabled={isWorking}
                >
                  {isWorking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Aprobar y publicar
                </Button>
              </div>

              <div className="rounded-lg border border-border/70 bg-muted/45 p-3 text-xs text-muted-foreground">
                <div className="mb-1 flex items-center gap-1.5 text-foreground/90">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Checklist
                </div>
                <p>
                  Confirma coherencia entre tipo, body, extendedBody, categoria y
                  evidencia media antes de aprobar.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <FieldQuickPeekDialog
        open={quickPeekOpen}
        onOpenChange={setQuickPeekOpen}
        field={selectedField}
        baselineLabel={baselineLabel}
      />
    </div>
  );
}
