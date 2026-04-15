const UPLOAD_ENDPOINT =
  "https://cmspro.yoshua-cloud.duckdns.org/api/images/upload";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export interface UploadResult {
  url: string;
  publicId: string;
}

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "FILE_TOO_LARGE"
      | "INVALID_TYPE"
      | "NETWORK_ERROR"
      | "SERVER_ERROR",
  ) {
    super(message);
    this.name = "ImageUploadError";
  }
}

export function validateImageFile(file: File): void {
  if (!ACCEPTED_MIME_TYPES.has(file.type)) {
    throw new ImageUploadError(
      "Formato no soportado. Usa JPG, PNG, WebP o GIF.",
      "INVALID_TYPE",
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    throw new ImageUploadError(
      `El archivo excede el limite de ${maxMb} MB.`,
      "FILE_TOO_LARGE",
    );
  }
}

export async function uploadImage(file: File): Promise<UploadResult> {
  validateImageFile(file);

  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ImageUploadError(
      "Error de red al subir la imagen. Verifica tu conexion.",
      "NETWORK_ERROR",
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new ImageUploadError(
      `Error del servidor (${response.status}): ${text || "Intenta de nuevo."}`,
      "SERVER_ERROR",
    );
  }

  const data: unknown = await response.json();

  if (typeof data !== "object" || data === null) {
    throw new ImageUploadError(
      "Respuesta inesperada del servidor al subir la imagen.",
      "SERVER_ERROR",
    );
  }

  const result = data as Record<string, unknown>;

  // The API returns { secureUrl, width, height, bytes }
  const url =
    typeof result.secureUrl === "string"
      ? result.secureUrl
      : typeof result.secure_url === "string"
        ? result.secure_url
        : typeof result.url === "string"
          ? result.url
          : null;

  if (!url) {
    throw new ImageUploadError(
      "Respuesta inesperada del servidor al subir la imagen.",
      "SERVER_ERROR",
    );
  }

  // Extract publicId from the Cloudinary URL path when not provided explicitly
  const publicId =
    typeof result.publicId === "string"
      ? result.publicId
      : typeof result.public_id === "string"
        ? result.public_id
        : extractPublicIdFromUrl(url);

  return { url, publicId };
}

export function createObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Extracts the public ID from a Cloudinary URL.
 * e.g. "https://res.cloudinary.com/dzm6es3kl/image/upload/v1776266169/lmimspkswcfuvye6h0vx.png"
 *  -> "lmimspkswcfuvye6h0vx"
 */
function extractPublicIdFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const filename = pathname.split("/").pop() ?? "";
    return filename.replace(/\.[^.]+$/, "");
  } catch {
    return "";
  }
}

export { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE_BYTES };
