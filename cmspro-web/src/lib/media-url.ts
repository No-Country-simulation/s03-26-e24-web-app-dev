const NEXT_IMAGE_ALLOWED_HOSTS = new Set([
  "images.unsplash.com",
  "res.cloudinary.com",
  "img.youtube.com",
  "i.ytimg.com",
]);

function toHttpUrl(value: string): URL | null {
  try {
    const parsed = new URL(value);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function isAllowedCmsImageUrl(value: string): boolean {
  const parsed = toHttpUrl(value);

  if (!parsed) {
    return false;
  }

  return NEXT_IMAGE_ALLOWED_HOSTS.has(parsed.hostname);
}

export function normalizeCmsImageUrl(value?: string | null): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return isAllowedCmsImageUrl(trimmed) ? trimmed : null;
}
