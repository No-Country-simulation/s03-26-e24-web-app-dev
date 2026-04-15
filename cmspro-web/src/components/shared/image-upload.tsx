"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  uploadImage,
  validateImageFile,
  createObjectUrl,
  revokeObjectUrl,
  ImageUploadError,
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/image-upload";
import {
  ImagePlus,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type UploadStatus = "idle" | "validating" | "uploading" | "success" | "error";

interface ImageUploadProps {
  /** Current image URL (from previous upload or edit mode) */
  value?: string | null;
  /** Called with the Cloudinary URL on success, or null on removal */
  onChange: (url: string | null) => void;
  /** Error message from parent form validation */
  error?: string;
  /** Disable interactions */
  disabled?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  error: externalError,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [status, setStatus] = useState<UploadStatus>(value ? "success" : "idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const localPreviewRef = useRef<string | null>(null);

  // Sync preview when value changes externally (e.g. edit mode)
  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
      setStatus("success");
    } else if (!value && status === "success") {
      setPreviewUrl(null);
      setStatus("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Cleanup local object URLs on unmount
  useEffect(() => {
    return () => {
      if (localPreviewRef.current) {
        revokeObjectUrl(localPreviewRef.current);
      }
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      // Clear previous state
      setErrorMessage(null);

      if (localPreviewRef.current) {
        revokeObjectUrl(localPreviewRef.current);
        localPreviewRef.current = null;
      }

      // Validate
      setStatus("validating");
      try {
        validateImageFile(file);
      } catch (err) {
        const message =
          err instanceof ImageUploadError
            ? err.message
            : "Archivo no valido.";
        setStatus("error");
        setErrorMessage(message);
        return;
      }

      // Create local preview
      const localUrl = createObjectUrl(file);
      localPreviewRef.current = localUrl;
      setPreviewUrl(localUrl);

      // Upload
      setStatus("uploading");
      try {
        const result = await uploadImage(file);
        // Replace local preview with remote URL
        revokeObjectUrl(localUrl);
        localPreviewRef.current = null;
        setPreviewUrl(result.url);
        setStatus("success");
        onChange(result.url);
      } catch (err) {
        const message =
          err instanceof ImageUploadError
            ? err.message
            : "Error inesperado al subir la imagen.";
        setStatus("error");
        setErrorMessage(message);
        // Keep local preview so user can see what they tried to upload
      }
    },
    [onChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    if (localPreviewRef.current) {
      revokeObjectUrl(localPreviewRef.current);
      localPreviewRef.current = null;
    }
    setPreviewUrl(null);
    setStatus("idle");
    setErrorMessage(null);
    onChange(null);
  };

  const handleClick = () => {
    if (!disabled && status !== "uploading") {
      inputRef.current?.click();
    }
  };

  const acceptStr = Array.from(ACCEPTED_MIME_TYPES).join(",");
  const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
  const displayError = externalError || errorMessage;
  const hasPreview = previewUrl !== null;
  const isUploading = status === "uploading" || status === "validating";

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={acceptStr}
        onChange={handleInputChange}
        className="sr-only"
        disabled={disabled}
        aria-hidden
        tabIndex={-1}
      />

      {/* Drop zone / Preview area */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "group relative flex min-h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          // States
          isDragOver && "border-primary bg-primary/5 scale-[1.01]",
          !isDragOver && !displayError && "border-border/70 hover:border-primary/50 hover:bg-card/80",
          displayError && "border-destructive/50 bg-destructive/5",
          disabled && "pointer-events-none opacity-50",
          hasPreview && "border-solid border-border/40",
        )}
      >
        {/* Preview image */}
        {hasPreview && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className={cn(
                "h-full w-full object-cover transition-opacity duration-300",
                isUploading && "opacity-50",
              )}
            />
            {/* Overlay gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>
        )}

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
          {isUploading && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className={cn("text-sm font-medium", hasPreview ? "text-white" : "text-foreground")}>
                Subiendo imagen...
              </p>
            </>
          )}

          {status === "idle" && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <ImagePlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  JPG, PNG, WebP o GIF. Max {maxMb} MB.
                </p>
              </div>
            </>
          )}

          {status === "success" && hasPreview && (
            <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-white backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium">Imagen cargada</span>
            </div>
          )}

          {status === "error" && !hasPreview && (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Haz clic para intentar de nuevo
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  JPG, PNG, WebP o GIF. Max {maxMb} MB.
                </p>
              </div>
            </>
          )}

          {status === "error" && hasPreview && (
            <div className="flex items-center gap-1.5 rounded-full bg-destructive/80 px-3 py-1.5 text-white backdrop-blur-sm">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Error al subir</span>
            </div>
          )}
        </div>

        {/* Remove button (only when there's an image and not uploading) */}
        {hasPreview && !isUploading && !disabled && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-2 top-2 z-20 h-8 w-8 rounded-full border-white/30 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            aria-label="Eliminar imagen"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {displayError}
        </p>
      )}
    </div>
  );
}
