"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCreateTestimonial } from "../hooks/use-testimonials";
import { testimonySchema } from "../schemas/testimonial.schema";
import type { Testimony, TestimonyType } from "@/types";
import type { TestimonyFormInput } from "../types";
import { Loader2, Sparkles, WandSparkles } from "lucide-react";

interface CreateTestimonyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (testimony: Testimony) => void;
  enableBackendSubmit?: boolean;
}

interface CategoryOption {
  id: string;
  label: string;
}

type FormState = {
  type: TestimonyType;
  title: string;
  authorName: string;
  authorRole: string;
  categoryId: string;
  body: string;
  extendedBody: string;
};

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: "bf826e49-2dd4-4e85-b4a9-76effce488a9", label: "Cursos" },
  { id: "2945b649-0842-4ca0-8f24-ec8a3a2afd8d", label: "Exito profesional" },
  {
    id: "f9d57c0c-3a9d-4f34-959c-f3ec9aee8df5",
    label: "Transformacion personal",
  },
];

const DEFAULT_FORM_STATE: FormState = {
  type: "Testimonial",
  title: "",
  authorName: "",
  authorRole: "",
  categoryId: CATEGORY_OPTIONS[0].id,
  body: "",
  extendedBody: "",
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function toCreatePayload(state: FormState): TestimonyFormInput {
  if (state.type === "SuccessCase") {
    return {
      type: "SuccessCase",
      title: state.title,
      authorName: state.authorName,
      authorRole: state.authorRole || undefined,
      categoryId: state.categoryId,
      tags: [],
      body: state.body,
      extendedBody: state.extendedBody,
    };
  }

  return {
    type: "Testimonial",
    title: state.title,
    authorName: state.authorName,
    authorRole: state.authorRole || undefined,
    categoryId: state.categoryId,
    tags: [],
    body: state.body,
    extendedBody: null,
  };
}

function buildPreviewTestimony(input: TestimonyFormInput): Testimony {
  return {
    id: crypto.randomUUID(),
    type: input.type,
    title: input.title,
    body: input.body,
    extendedBody: input.type === "SuccessCase" ? input.extendedBody : null,
    authorName: input.authorName,
    authorRole: input.authorRole,
    status: "Draft",
    categoryId: input.categoryId,
    tags: [],
    mediaFiles: [],
    createdAt: new Date().toISOString(),
    publishedAt: null,
    createdBy: "local-preview",
  };
}

export function CreateTestimonyModal({
  open,
  onOpenChange,
  onCreated,
  enableBackendSubmit = false,
}: CreateTestimonyModalProps) {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const createMutation = useCreateTestimonial();
  const isSubmitting = isSubmittingLocal || createMutation.isPending;

  const bodyCounter = useMemo(() => {
    return formState.type === "SuccessCase"
      ? `${formState.body.length}/500`
      : `${formState.body.length}/300`;
  }, [formState.body.length, formState.type]);

  const extendedCounter = `${formState.extendedBody.length}`;

  const handleFieldChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const resetForm = () => {
    setFormState(DEFAULT_FORM_STATE);
    setFieldErrors({});
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
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
      toast.error("Revisa los campos obligatorios antes de continuar");
      return;
    }

    if (!enableBackendSubmit) {
      setIsSubmittingLocal(true);
      await new Promise((resolve) => setTimeout(resolve, 650));
      const previewRecord = buildPreviewTestimony(parsed.data);
      setIsSubmittingLocal(false);

      toast.success("Guardado en modo local. Listo para conectar backend.");
      onCreated?.(previewRecord);
      handleClose(false);
      return;
    }

    try {
      const created = await createMutation.mutateAsync(parsed.data);
      toast.success("Testimonio creado exitosamente");
      onCreated?.(created);
      handleClose(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear el testimonio";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "w-[min(900px,96vw)] overflow-hidden border-none bg-transparent p-0 shadow-none",
          "[&>button]:right-5 [&>button]:top-5 [&>button]:z-30 [&>button]:rounded-full [&>button]:border [&>button]:border-white/40 [&>button]:bg-black/55 [&>button]:p-1 [&>button]:text-white [&>button]:opacity-100",
        )}
      >
        <div className="relative rounded-[28px] border border-border/70 bg-background/95 shadow-2xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--primary),transparent_72%),transparent_55%),radial-gradient(circle_at_85%_10%,color-mix(in_oklch,var(--accent),transparent_68%),transparent_58%)]" />

          <form onSubmit={handleSubmit} className="relative z-10 p-6 sm:p-8">
            <DialogHeader className="mb-6 space-y-3 text-left">
              <div className="flex items-center gap-2">
                <Badge className="border-none bg-primary/90 text-primary-foreground">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Nuevo testimonio
                </Badge>

                <Badge
                  variant="outline"
                  className="border-border/70 bg-card/60"
                >
                  {enableBackendSubmit ? "Modo backend" : "Modo preview local"}
                </Badge>
              </div>

              <DialogTitle className="font-display text-4xl leading-[1.02] sm:text-5xl">
                Crear historia destacada
              </DialogTitle>
              <DialogDescription className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Crea un testimonio breve o un caso de exito extendido. El
                formulario esta listo para backend, pero por ahora puede
                funcionar en preview local.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value) =>
                    handleFieldChange(
                      "type",
                      (value ?? "Testimonial") as TestimonyType,
                    )
                  }
                >
                  <SelectTrigger
                    id="type"
                    className="h-11 w-full rounded-xl bg-card/60"
                  >
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Testimonial">Testimonio</SelectItem>
                    <SelectItem value="SuccessCase">Caso de exito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="categoryId">Categoria</Label>
                <Select
                  value={formState.categoryId}
                  onValueChange={(value) =>
                    handleFieldChange("categoryId", value ?? "")
                  }
                >
                  <SelectTrigger
                    id="categoryId"
                    className={cn(
                      "h-11 w-full rounded-xl bg-card/60",
                      fieldErrors.categoryId &&
                        "border-destructive/60 ring-2 ring-destructive/25",
                    )}
                  >
                    <SelectValue placeholder="Selecciona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.categoryId && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.categoryId}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Titulo</Label>
                <Input
                  id="title"
                  value={formState.title}
                  onChange={(event) =>
                    handleFieldChange("title", event.target.value)
                  }
                  className={cn(
                    "h-11 rounded-xl bg-card/60",
                    fieldErrors.title &&
                      "border-destructive/60 ring-2 ring-destructive/25",
                  )}
                  placeholder="Ej: De estudiante a lider de equipo en 8 meses"
                />
                {fieldErrors.title && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorName">Autor</Label>
                <Input
                  id="authorName"
                  value={formState.authorName}
                  onChange={(event) =>
                    handleFieldChange("authorName", event.target.value)
                  }
                  className={cn(
                    "h-11 rounded-xl bg-card/60",
                    fieldErrors.authorName &&
                      "border-destructive/60 ring-2 ring-destructive/25",
                  )}
                  placeholder="Nombre y apellido"
                />
                {fieldErrors.authorName && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.authorName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorRole">Rol del autor (opcional)</Label>
                <Input
                  id="authorRole"
                  value={formState.authorRole}
                  onChange={(event) =>
                    handleFieldChange("authorRole", event.target.value)
                  }
                  className={cn(
                    "h-11 rounded-xl bg-card/60",
                    fieldErrors.authorRole &&
                      "border-destructive/60 ring-2 ring-destructive/25",
                  )}
                  placeholder="Ej: Desarrollador Full Stack"
                />
                {fieldErrors.authorRole && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.authorRole}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="body">
                    {formState.type === "SuccessCase"
                      ? "Preview corto"
                      : "Contenido del testimonio"}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {bodyCounter}
                  </span>
                </div>

                <Textarea
                  id="body"
                  value={formState.body}
                  onChange={(event) =>
                    handleFieldChange("body", event.target.value)
                  }
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

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border/60 pt-5 sm:flex-row sm:justify-end">
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
                    Crear testimonio
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
