"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { SegmentedTabs } from "@/components/shared/segmented-tabs";
import { CreateTestimonyModal } from "@/features/testimonials/components/create-testimony-modal";
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  FileText,
  CheckCircle2,
  Clock3,
  PencilRuler,
  XCircle,
} from "lucide-react";
import type { Category, Testimony } from "@/types";
import type {
  CreateTestimonyFormInput,
  CreateTestimonySubmitInput,
} from "@/features/testimonials/types";
import {
  LOCAL_DEMO_DB_UPDATED_EVENT,
  createDraftTestimony,
  deleteTestimony,
  getLatestRejectionFeedback,
  listCategories,
  listTestimonies,
  submitForReview,
  updateDraftTestimony,
  updateTestimonyWithShadow,
} from "@/lib/local-demo";
import type {
  ModerationReviewType,
  RejectionFeedbackItem,
} from "@/lib/local-demo";
import { useAuth } from "@/providers/auth-provider";
import { testimonySchema } from "@/features/testimonials/schemas/testimonial.schema";

interface TestimonyRowProps {
  testimony: Testimony;
  rejectionFeedback: RejectionFeedbackItem | null;
  canEdit: boolean;
  onDelete: (testimonyId: string) => void;
  onSubmit: (testimonyId: string) => void;
  onQuickEdit: (testimony: Testimony) => void;
}

function reviewTypeBadgeLabel(reviewType: ModerationReviewType): string {
  if (reviewType === "InitialSubmission") {
    return "Primera revision";
  }

  if (reviewType === "ReworkSubmission") {
    return "Correccion";
  }

  return "Sugerencia sobre publicado";
}

function toneClassByStatus(status: Testimony["status"]): string {
  if (status === "Rejected") {
    return "border-destructive/35 bg-destructive/10 text-foreground";
  }

  if (status === "PendingReview") {
    return "border-accent/45 bg-accent/15 text-foreground";
  }

  if (status === "Published") {
    return "border-primary/35 bg-primary/10 text-foreground";
  }

  return "border-border/70 bg-muted/45 text-foreground";
}

function TestimonialRow({
  testimony,
  rejectionFeedback,
  canEdit,
  onDelete,
  onSubmit,
  onQuickEdit,
}: TestimonyRowProps) {
  return (
    <TableRow className="hover:bg-muted/35">
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/70">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium tracking-tight">{testimony.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {testimony.body}
            </p>
            {testimony.status === "Rejected" && rejectionFeedback && (
              <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-2">
                <p className="text-xs font-semibold text-destructive">
                  Motivo del rechazo
                </p>
                <p className="mt-0.5 text-xs text-foreground/90">
                  {rejectionFeedback.comment ||
                    "Sin comentario del moderador. Solicita detalle al equipo de moderacion."}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{reviewTypeBadgeLabel(rejectionFeedback.reviewType)}</span>
                  {rejectionFeedback.moderatorName && (
                    <span>por {rejectionFeedback.moderatorName}</span>
                  )}
                  {rejectionFeedback.reviewedAt && (
                    <span>{new Date(rejectionFeedback.reviewedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>
            )}

            {testimony.status === "Published" &&
              rejectionFeedback?.reviewType === "PublishedSuggestion" && (
                <div className="mt-2 rounded-md border border-accent/45 bg-accent/15 px-2.5 py-2">
                  <p className="text-xs font-semibold text-foreground">
                    Ultima sugerencia rechazada
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {rejectionFeedback.comment ||
                      "Sin comentario del moderador en la sugerencia rechazada."}
                  </p>
                </div>
              )}
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <Badge
          variant={testimony.type === "SuccessCase" ? "default" : "secondary"}
        >
          {testimony.type === "SuccessCase" ? "Caso de Éxito" : "Testimonio"}
        </Badge>
      </TableCell>
      <TableCell className="py-4">
        <div>
          <p className="text-sm font-medium">{testimony.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {testimony.authorRole}
          </p>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <StatusBadge status={testimony.status} />
      </TableCell>
      <TableCell className="py-4 text-sm text-muted-foreground">
        {testimony.createdAt}
      </TableCell>
      <TableCell className="py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/testimonials/${testimony.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </Link>
            </DropdownMenuItem>
            {canEdit &&
              (testimony.status === "Draft" ||
                testimony.status === "Rejected") && (
                <DropdownMenuItem onClick={() => onQuickEdit(testimony)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar borrador
                </DropdownMenuItem>
              )}
            {canEdit && testimony.status === "Published" && (
              <DropdownMenuItem onClick={() => onQuickEdit(testimony)}>
                <Edit className="mr-2 h-4 w-4" />
                Proponer cambios (Shadow)
              </DropdownMenuItem>
            )}
            {canEdit &&
              (testimony.status === "Draft" || testimony.status === "Rejected") && (
              <DropdownMenuItem onClick={() => onSubmit(testimony.id)}>
                <Send className="mr-2 h-4 w-4" />
                {testimony.status === "Rejected"
                  ? "Reenviar a revision"
                  : "Enviar a revision"}
              </DropdownMenuItem>
            )}
            {canEdit && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(testimony.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export default function TestimonialsAdminPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [testimonials, setTestimonials] = useState<Testimony[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rejectionFeedbackMap, setRejectionFeedbackMap] = useState<
    Record<string, RejectionFeedbackItem>
  >({});
  const [isDataReady, setIsDataReady] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTestimony, setEditingTestimony] = useState<Testimony | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openedFromQueryParam, setOpenedFromQueryParam] = useState(false);

  const canMutate = user?.role === "Editor" || user?.role === "Admin";

  const reloadData = () => {
    setCategories(listCategories());
    const nextTestimonials = listTestimonies();
    setTestimonials(nextTestimonials);

    const nextFeedbackMap = nextTestimonials.reduce<
      Record<string, RejectionFeedbackItem>
    >((acc, testimony) => {
      const feedback = getLatestRejectionFeedback(testimony.id);
      if (feedback) {
        acc[testimony.id] = feedback;
      }
      return acc;
    }, {});

    setRejectionFeedbackMap(nextFeedbackMap);
    setIsDataReady(true);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login?next=/dashboard/testimonials");
      return;
    }

    reloadData();

    const params = new URLSearchParams(window.location.search);

    if (params.get("new") === "1") {
      setIsCreateModalOpen(true);
      setOpenedFromQueryParam(true);
    }

    const handleDataUpdated = () => reloadData();
    window.addEventListener(LOCAL_DEMO_DB_UPDATED_EVENT, handleDataUpdated);

    return () => {
      window.removeEventListener(
        LOCAL_DEMO_DB_UPDATED_EVENT,
        handleDataUpdated,
      );
    };
  }, [isAuthenticated, router]);

  const handleCreateModalOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open);

    if (!open && openedFromQueryParam) {
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      setOpenedFromQueryParam(false);
    }
  };

  const handleCreateFromModal = async (input: CreateTestimonySubmitInput) => {
    if (!user) {
      throw new Error("Necesitas iniciar sesion para crear testimonios");
    }

    const validationInput = {
      ...input,
      tags: input.tags ?? [],
    };

    const parsed = testimonySchema.safeParse(validationInput);

    if (!parsed.success) {
      throw new Error("Hay datos invalidos en el formulario");
    }

    const payload: CreateTestimonySubmitInput = {
      ...input,
      authorName: user.fullName,
    };

    createDraftTestimony(payload, user);
    reloadData();
    toast.success("Borrador creado correctamente");
  };

  const handleDelete = (testimonyId: string) => {
    if (!canMutate) {
      toast.error("No tienes permisos para eliminar testimonios");
      return;
    }

    deleteTestimony(testimonyId);
    toast.success("Testimonio eliminado");
    reloadData();
  };

  const handleSubmitForReview = (testimonyId: string) => {
    if (!canMutate) {
      toast.error("No tienes permisos para enviar testimonios");
      return;
    }

    try {
      submitForReview(testimonyId);
      toast.success("Testimonio enviado a revision");
      reloadData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar a revision";
      toast.error(message);
    }
  };

  const handleQuickEdit = (testimony: Testimony) => {
    if (!canMutate) {
      toast.error("No tienes permisos para editar testimonios");
      return;
    }

    setEditingTestimony(testimony);
    setIsEditModalOpen(true);
  };

  const handleEditModalOpenChange = (open: boolean) => {
    setIsEditModalOpen(open);
    if (!open) {
      setEditingTestimony(null);
    }
  };

  const handleUpdateFromModal = async (input: CreateTestimonySubmitInput) => {
    if (!editingTestimony) {
      return;
    }

    if (!user) {
      throw new Error("Necesitas iniciar sesion para actualizar testimonios");
    }

    const parsed = testimonySchema.safeParse(input);

    if (!parsed.success) {
      throw new Error("Hay datos invalidos en el formulario");
    }

    const payload: CreateTestimonySubmitInput = {
      ...input,
      authorName: user.fullName,
    };

    if (
      editingTestimony.status === "Draft" ||
      editingTestimony.status === "Rejected"
    ) {
      updateDraftTestimony(editingTestimony.id, payload);
      toast.success("Borrador actualizado");
    } else {
      updateTestimonyWithShadow(editingTestimony.id, payload);
      toast.success("Cambios enviados a moderacion (Shadow Copy)");
    }

    setIsEditModalOpen(false);
    setEditingTestimony(null);
    reloadData();
  };

  const publishedTestimonials = testimonials.filter(
    (item) => item.status === "Published",
  );
  const pendingTestimonials = testimonials.filter(
    (item) => item.status === "PendingReview",
  );
  const draftTestimonials = testimonials.filter(
    (item) => item.status === "Draft",
  );
  const rejectedTestimonials = testimonials.filter(
    (item) => item.status === "Rejected",
  );
  const isEmpty = testimonials.length === 0;

  const statusSummary = [
    {
      key: "draft",
      label: "Borradores",
      count: draftTestimonials.length,
      hint: "Listos para trabajar",
      icon: PencilRuler,
      tone: toneClassByStatus("Draft"),
    },
    {
      key: "pending",
      label: "Pendientes",
      count: pendingTestimonials.length,
      hint: "Esperando revision",
      icon: Clock3,
      tone: toneClassByStatus("PendingReview"),
    },
    {
      key: "published",
      label: "Publicados",
      count: publishedTestimonials.length,
      hint: "Activos en publico",
      icon: CheckCircle2,
      tone: toneClassByStatus("Published"),
    },
    {
      key: "rejected",
      label: "Rechazados",
      count: rejectedTestimonials.length,
      hint: "Requieren correccion",
      icon: XCircle,
      tone: toneClassByStatus("Rejected"),
    },
  ];

  const editingInitialValues: CreateTestimonyFormInput | null = editingTestimony
    ? editingTestimony.type === "SuccessCase"
      ? {
          type: "SuccessCase",
          title: editingTestimony.title,
          authorName: editingTestimony.authorName,
          authorRole: editingTestimony.authorRole,
          categoryId: editingTestimony.categoryId,
          tags: editingTestimony.tags.map((tag) => tag.name),
          body: editingTestimony.body,
          extendedBody: editingTestimony.extendedBody ?? "",
          imageUrl:
            editingTestimony.mediaFiles.find((media) => media.type === "Image")
              ?.url ?? null,
        }
      : {
          type: "Testimonial",
          title: editingTestimony.title,
          authorName: editingTestimony.authorName,
          authorRole: editingTestimony.authorRole,
          categoryId: editingTestimony.categoryId,
          tags: editingTestimony.tags.map((tag) => tag.name),
          body: editingTestimony.body,
          extendedBody: null,
          imageUrl:
            editingTestimony.mediaFiles.find((media) => media.type === "Image")
              ?.url ?? null,
        }
    : null;

  if (!isDataReady) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Testimonios"
          description="Cargando workspace local de testimonios..."
        />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Preparando datos demo...
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderTable = (rows: Testimony[]) => {
    if (rows.length === 0) {
      return (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No hay elementos en este filtro.
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-border/70 bg-card/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Testimonio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((testimony) => (
                <TestimonialRow
                  key={testimony.id}
                  testimony={testimony}
                  rejectionFeedback={rejectionFeedbackMap[testimony.id] ?? null}
                  canEdit={canMutate}
                  onDelete={handleDelete}
                  onSubmit={handleSubmitForReview}
                  onQuickEdit={handleQuickEdit}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonios"
        description="Organiza borradores, revisiones y publicaciones con feedback visible"
        actions={
          canMutate ? (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Testimonio
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statusSummary.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className={`rounded-xl border px-4 py-3 ${item.tone}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                  {item.label}
                </p>
                <Icon className="h-4 w-4" />
              </div>
              <p className="font-display text-3xl leading-none">{item.count}</p>
              <p className="mt-1 text-xs opacity-85">{item.hint}</p>
            </div>
          );
        })}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <SegmentedTabs
          size="sm"
          className="pb-1"
          listClassName="max-w-full"
          items={[
            { value: "all", label: "Todos", count: testimonials.length },
            {
              value: "published",
              label: "Publicados",
              count: publishedTestimonials.length,
            },
            {
              value: "pending",
              label: "Pendientes",
              count: pendingTestimonials.length,
            },
            {
              value: "draft",
              label: "Borradores",
              count: draftTestimonials.length,
            },
            {
              value: "rejected",
              label: "Rechazados",
              count: rejectedTestimonials.length,
            },
          ]}
        />

        <TabsContent value="all" className="mt-0 space-y-4">
          {isEmpty ? (
            <EmptyState
              icon={<FileText className="h-6 w-6 text-muted-foreground" />}
              title="No hay testimonios"
              description="Comienza creando tu primer testimonio o caso de éxito."
              action={
                canMutate
                  ? {
                      label: "Crear testimonio",
                      onClick: () => setIsCreateModalOpen(true),
                    }
                  : undefined
              }
            />
          ) : (
            renderTable(testimonials)
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-0">
          {renderTable(publishedTestimonials)}
        </TabsContent>

        <TabsContent value="pending" className="mt-0">
          {renderTable(pendingTestimonials)}
        </TabsContent>

        <TabsContent value="draft" className="mt-0">
          {renderTable(draftTestimonials)}
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          {renderTable(rejectedTestimonials)}
        </TabsContent>
      </Tabs>

      <CreateTestimonyModal
        open={isCreateModalOpen}
        onOpenChange={handleCreateModalOpenChange}
        categories={categories}
        onCreated={handleCreateFromModal}
        fixedAuthorName={user?.fullName}
      />

      {editingTestimony && (
        <CreateTestimonyModal
          open={isEditModalOpen}
          onOpenChange={handleEditModalOpenChange}
          categories={categories}
          onCreated={handleUpdateFromModal}
          mode="edit"
          initialValues={editingInitialValues}
          fixedAuthorName={user?.fullName}
        />
      )}
    </div>
  );
}
