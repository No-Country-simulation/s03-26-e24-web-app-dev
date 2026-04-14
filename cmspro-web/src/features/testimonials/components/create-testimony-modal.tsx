"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { TESTIMONY_TYPES } from "@/config/constants";
import { testimonySchema } from "../schemas/testimonial.schema";
import type { Category, TestimonyType } from "@/types";
import type {
  CreateTestimonyFormInput,
  CreateTestimonySubmitInput,
} from "../types";
import { Loader2, Sparkles, WandSparkles, X } from "lucide-react";

interface CreateTestimonyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onCreated: (input: CreateTestimonySubmitInput) => Promise<void> | void;
  mode?: "create" | "edit";
  initialValues?: CreateTestimonyFormInput | null;
  fixedAuthorName?: string;
}

type FormState = {
  type: TestimonyType;
  title: string;
  authorName: string;
  authorRole: string;
  categoryId: string;
  body: string;
  extendedBody: string;
  tagsText: string;
  imageUrl: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function normalizeTagToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function parseTagsInput(raw: string): string[] {
  const tokens = raw
    .split(",")
    .map(normalizeTagToken)
    .filter(Boolean);

  return Array.from(new Set(tokens));
}

function joinTags(tags: string[]): string {
  return tags.join(", ");
}

function toCreatePayload(state: FormState): CreateTestimonySubmitInput {
  const tags = parseTagsInput(state.tagsText);
  const imageUrl = state.imageUrl.trim() || null;

  if (state.type === "SuccessCase") {
    return {
      type: "SuccessCase",
      title: state.title,
      authorName: state.authorName,
      authorRole: state.authorRole || undefined,
      categoryId: state.categoryId,
      tags,
      body: state.body,
      extendedBody: state.extendedBody,
      imageUrl,
    };
  }

  return {
    type: "Testimonial",
    title: state.title,
    authorName: state.authorName,
    authorRole: state.authorRole || undefined,
    categoryId: state.categoryId,
    tags,
    body: state.body,
    extendedBody: null,
    imageUrl,
  };
}

function createDefaultFormState(
  categories: Category[],
  fixedAuthorName?: string,
): FormState {
  return {
    type: "Testimonial",
    title: "",
    authorName: fixedAuthorName ?? "",
    authorRole: "",
    categoryId: categories[0]?.id ?? "",
    body: "",
    extendedBody: "",
    tagsText: "",
    imageUrl: "",
  };
}

function createFormStateFromInput(input: CreateTestimonyFormInput): FormState {
  if (input.type === "SuccessCase") {
    return {
      type: "SuccessCase",
      title: input.title,
      authorName: input.authorName,
      authorRole: input.authorRole ?? "",
      categoryId: input.categoryId,
      body: input.body,
      extendedBody: input.extendedBody ?? "",
      tagsText: joinTags(input.tags),
      imageUrl: input.imageUrl ?? "",
    };
  }

  return {
    type: "Testimonial",
    title: input.title,
    authorName: input.authorName,
    authorRole: input.authorRole ?? "",
    categoryId: input.categoryId,
    body: input.body,
    extendedBody: "",
    tagsText: joinTags(input.tags),
    imageUrl: input.imageUrl ?? "",
  };
}

export function CreateTestimonyModal({
  open,
  onOpenChange,
  categories,
  onCreated,
  mode = "create",
  initialValues,
  fixedAuthorName,
}: CreateTestimonyModalProps) {
  const [formState, setFormState] = useState<FormState>(
    createDefaultFormState(categories, fixedAuthorName),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = mode === "edit";

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialValues) {
      setFormState(createFormStateFromInput(initialValues));
      setFieldErrors({});
      return;
    }

    setFormState(createDefaultFormState(categories, fixedAuthorName));
    setFieldErrors({});
  }, [open, initialValues, categories, fixedAuthorName]);

  useEffect(() => {
    if (!fixedAuthorName) {
      return;
    }

    setFormState((prev) => ({ ...prev, authorName: fixedAuthorName }));
  }, [fixedAuthorName]);

  const bodyCounter = useMemo(() => {
    const max = TESTIMONY_TYPES[formState.type].maxBodyLength;
    return `${formState.body.length}/${max}`;
  }, [formState.body, formState.type]);

  const extendedCounter = `${formState.extendedBody.length}`;
  const tagsPreview = parseTagsInput(formState.tagsText);

  const handleFieldChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setFormState(createDefaultFormState(categories, fixedAuthorName));
      setFieldErrors({});
    }
  };

  const removeTag = (tag: string) => {
    const nextTags = tagsPreview.filter((item) => item !== tag);
    handleFieldChange("tagsText", joinTags(nextTags));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = toCreatePayload(formState);
    const parsed = testimonySchema.safeParse(payload);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};

      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormState | undefined;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreated(payload);
      handleClose(false);
    } catch {
      // parent handles toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "w-[min(920px,96vw)] max-h-[92vh] overflow-hidden border-none bg-transparent p-0 shadow-none",
          "data-[state=open]:duration-300 data-[state=closed]:duration-200",
          "[&>button]:right-5 [&>button]:top-5 [&>button]:z-30 [&>button]:rounded-full [&>button]:border [&>button]:border-white/40 [&>button]:bg-black/55 [&>button]:p-1 [&>button]:text-white [&>button]:opacity-100",
        )}
      >
        <div className="relative max-h-[92vh] overflow-hidden rounded-[28px] border border-border/70 bg-background/95 shadow-2xl motion-safe:animate-fade-in-up">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary),transparent_72%),transparent_55%),radial-gradient(circle_at_85%_10%,color-mix(in_oklch,var(--accent),transparent_68%),transparent_58%)]" />

          <form onSubmit={handleSubmit} className="relative z-10 flex max-h-[92vh] flex-col">
            <div className="shrink-0 px-6 pb-4 pt-6 sm:px-8 sm:pb-5 sm:pt-8">
              <DialogHeader className="space-y-3 text-left motion-safe:animate-slide-in-left">
                <div className="flex items-center gap-2">
                  <Badge className="border-none bg-primary/90 text-primary-foreground">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    {isEditMode ? "Editar testimonio" : "Nuevo testimonio"}
                  </Badge>

                  <Badge variant="outline" className="border-border/70 bg-card/60">
                    Demo local
                  </Badge>
                </div>

                <DialogTitle className="font-display text-4xl leading-[1.02] sm:text-5xl">
                  {isEditMode ? "Actualizar historia" : "Crear historia destacada"}
                </DialogTitle>
                <DialogDescription className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {isEditMode
                    ? "Si el testimonio esta publicado, los cambios pasaran por moderacion via Shadow Copy."
                    : "Este formulario crea un borrador local y simula el flujo completo de moderacion."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-4 sm:px-8 sm:pb-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={formState.type}
                    onChange={(event) =>
                      handleFieldChange("type", event.target.value as TestimonyType)
                    }
                    className="h-11 w-full rounded-xl border border-input bg-card/60 px-3 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <option value="Testimonial">Testimonio</option>
                    <option value="SuccessCase">Caso de exito</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="categoryId">Categoria</Label>
                  <select
                    id="categoryId"
                    value={formState.categoryId}
                    onChange={(event) =>
                      handleFieldChange("categoryId", event.target.value)
                    }
                    className={cn(
                      "h-11 w-full rounded-xl border border-input bg-card/60 px-3 text-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
                      fieldErrors.categoryId &&
                        "border-destructive/60 ring-2 ring-destructive/25",
                    )}
                  >
                    {categories.length === 0 && (
                      <option value="">Sin categorias disponibles</option>
                    )}
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.categoryId && (
                    <p className="text-xs text-destructive">{fieldErrors.categoryId}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">Titulo</Label>
                  <Input
                    id="title"
                    value={formState.title}
                    onChange={(event) => handleFieldChange("title", event.target.value)}
                    className={cn(
                      "h-11 rounded-xl bg-card/60",
                      fieldErrors.title &&
                        "border-destructive/60 ring-2 ring-destructive/25",
                    )}
                    placeholder="Ej: De estudiante a lider de equipo en 8 meses"
                  />
                  {fieldErrors.title && (
                    <p className="text-xs text-destructive">{fieldErrors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorName">Autor</Label>
                  <Input
                    id="authorName"
                    value={formState.authorName}
                    readOnly
                    disabled
                    className="h-11 rounded-xl bg-muted/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authorRole">Rol del autor (opcional)</Label>
                  <Input
                    id="authorRole"
                    value={formState.authorRole}
                    onChange={(event) => handleFieldChange("authorRole", event.target.value)}
                    className="h-11 rounded-xl bg-card/60"
                    placeholder="Ej: Desarrollador Full Stack"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="tags">Tags (separados por coma)</Label>
                  <Input
                    id="tags"
                    value={formState.tagsText}
                    onChange={(event) => handleFieldChange("tagsText", event.target.value)}
                    className="h-11 rounded-xl bg-card/60"
                    placeholder="empleabilidad, bootcamp, liderazgo"
                  />
                  {tagsPreview.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tagsPreview.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full">
                          #{tag}
                          <button
                            type="button"
                            className="ml-1"
                            onClick={() => removeTag(tag)}
                            aria-label={`Eliminar tag ${tag}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="imageUrl">Imagen (URL)</Label>
                  <Input
                    id="imageUrl"
                    value={formState.imageUrl}
                    onChange={(event) => handleFieldChange("imageUrl", event.target.value)}
                    className={cn(
                      "h-11 rounded-xl bg-card/60",
                      fieldErrors.imageUrl &&
                        "border-destructive/60 ring-2 ring-destructive/25",
                    )}
                    placeholder="https://images.unsplash.com/..."
                  />
                  {fieldErrors.imageUrl && (
                    <p className="text-xs text-destructive">{fieldErrors.imageUrl}</p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="body">
                      {formState.type === "SuccessCase"
                        ? "Preview corto"
                        : "Contenido del testimonio"}
                    </Label>
                    <span className="text-xs text-muted-foreground">{bodyCounter}</span>
                  </div>

                  <Textarea
                    id="body"
                    value={formState.body}
                    onChange={(event) => handleFieldChange("body", event.target.value)}
                    className={cn(
                      "min-h-28 rounded-xl bg-card/60",
                      fieldErrors.body &&
                        "border-destructive/60 ring-2 ring-destructive/25",
                    )}
                    placeholder={
                      formState.type === "SuccessCase"
                        ? "Resumen que enganche para leer la historia completa"
                        : "Opinion breve, concreta y autentica"
                    }
                  />
                  {fieldErrors.body && (
                    <p className="text-xs text-destructive">{fieldErrors.body}</p>
                  )}
                </div>

                {formState.type === "SuccessCase" && (
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="extendedBody">Historia completa</Label>
                      <span className="text-xs text-muted-foreground">
                        {extendedCounter} caracteres
                      </span>
                    </div>
                    <Textarea
                      id="extendedBody"
                      value={formState.extendedBody}
                      onChange={(event) =>
                        handleFieldChange("extendedBody", event.target.value)
                      }
                      className={cn(
                        "min-h-36 rounded-xl bg-card/60",
                        fieldErrors.extendedBody &&
                          "border-destructive/60 ring-2 ring-destructive/25",
                      )}
                      placeholder="Cuenta el antes, el proceso y el resultado medible de esta historia"
                    />
                    {fieldErrors.extendedBody && (
                      <p className="text-xs text-destructive">
                        {fieldErrors.extendedBody}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 border-t border-border/60 bg-background/88 px-6 py-4 backdrop-blur-sm sm:px-8 sm:py-5">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-full px-5"
                  onClick={() => handleClose(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  className="h-11 rounded-full px-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <WandSparkles className="mr-2 h-4 w-4" />
                      {isEditMode ? "Guardar cambios" : "Crear borrador"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
