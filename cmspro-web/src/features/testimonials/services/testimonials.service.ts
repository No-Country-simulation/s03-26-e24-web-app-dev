import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  MediaFile,
  MediaProvider,
  MediaType,
  PaginatedResponse,
  Testimony,
} from "@/types";
import type { TestimonyFormInput } from "../types";
import { normalizeCmsImageUrl } from "@/lib/media-url";

export interface GetTestimonialsParams {
  page?: number;
  pageSize?: number;
  type?: "Testimonial" | "SuccessCase";
  status?: string;
  categoryId?: string;
  search?: string;
}

interface LegacyTestimonialResponse {
  content?: string;
  multimediaUrl?: string | null;
  authorName?: string;
  createdAt?: string;
  Content?: string;
  MultimediaUrl?: string | null;
  AuthorName?: string;
  CreatedAt?: string;
}

function isTestimony(value: unknown): value is Testimony {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.body === "string" &&
    typeof candidate.authorName === "string" &&
    Array.isArray(candidate.mediaFiles) &&
    Array.isArray(candidate.tags)
  );
}

function isLegacyTestimonialResponse(
  value: unknown,
): value is LegacyTestimonialResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.content === "string" ||
    typeof candidate.Content === "string" ||
    typeof candidate.authorName === "string" ||
    typeof candidate.AuthorName === "string"
  );
}

function getSafeTitle(content: string): string {
  const normalized = content.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "Historia sin titulo";
  }

  const preview = normalized.slice(0, 72);
  return normalized.length > 72 ? `${preview}...` : preview;
}

function toMediaFile(url: string, testimonyId: string): MediaFile {
  const normalizedUrl = normalizeCmsImageUrl(url);

  if (!normalizedUrl) {
    throw new Error("Unsupported media URL host for image rendering");
  }

  const isVideo = /youtube\.com|youtu\.be/i.test(normalizedUrl);
  const type: MediaType = isVideo ? "Video" : "Image";
  const provider: MediaProvider = isVideo ? "YouTube" : "Cloudinary";
  const pathWithoutQuery = normalizedUrl.split("?")[0];
  const publicId =
    pathWithoutQuery.split("/").filter(Boolean).pop() ??
    `legacy-${testimonyId}`;

  return {
    id: `legacy-media-${testimonyId}`,
    testimonyId,
    type,
    url: normalizedUrl,
    provider,
    publicId,
  };
}

function normalizeLegacyTestimonial(
  payload: LegacyTestimonialResponse,
  testimonyId: string,
): Testimony {
  const body = payload.content ?? payload.Content ?? "";
  const authorName =
    payload.authorName ?? payload.AuthorName ?? "Autor anonimo";
  const createdAt =
    payload.createdAt ?? payload.CreatedAt ?? new Date().toISOString();
  const multimediaUrl = payload.multimediaUrl ?? payload.MultimediaUrl;
  const safeMediaUrl = normalizeCmsImageUrl(multimediaUrl);

  return {
    id: testimonyId,
    type: "Testimonial",
    title: getSafeTitle(body),
    body,
    extendedBody: null,
    authorName,
    authorRole: "Comunidad CMS Pro",
    status: "Published",
    categoryId: "legacy-category",
    tags: [],
    mediaFiles: safeMediaUrl ? [toMediaFile(safeMediaUrl, testimonyId)] : [],
    createdAt,
    publishedAt: createdAt,
    createdBy: "legacy-backend",
  };
}

function normalizeTestimonyPayload(
  payload: unknown,
  testimonyId: string,
): Testimony {
  if (isTestimony(payload)) {
    return payload;
  }

  if (isLegacyTestimonialResponse(payload)) {
    return normalizeLegacyTestimonial(payload, testimonyId);
  }

  throw new Error("Unsupported testimony payload received from backend");
}

export const testimonialService = {
  async getAll(
    params: GetTestimonialsParams = {},
  ): Promise<PaginatedResponse<Testimony>> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", params.page.toString());
    if (params.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());
    if (params.type) searchParams.set("type", params.type);
    if (params.status) searchParams.set("status", params.status);
    if (params.categoryId) searchParams.set("categoryId", params.categoryId);
    if (params.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    const url = query
      ? `${endpoints.testimonials.list}?${query}`
      : endpoints.testimonials.list;

    return apiClient.get<PaginatedResponse<Testimony>>(url);
  },

  async getById(id: string): Promise<Testimony> {
    try {
      const response = await apiClient.get<unknown>(
        endpoints.testimonials.byId(id),
      );
      return normalizeTestimonyPayload(response, id);
    } catch {
      const legacyResponse = await apiClient.get<unknown>(
        `/testimonials/${id}`,
      );
      return normalizeTestimonyPayload(legacyResponse, id);
    }
  },

  async create(data: TestimonyFormInput): Promise<Testimony> {
    return apiClient.post<Testimony>(endpoints.testimonials.create, data);
  },

  async update(
    id: string,
    data: Partial<TestimonyFormInput>,
  ): Promise<Testimony> {
    return apiClient.put<Testimony>(endpoints.testimonials.update(id), data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(endpoints.testimonials.delete(id));
  },

  async submitForReview(id: string): Promise<Testimony> {
    return apiClient.patch<Testimony>(endpoints.testimonials.submit(id));
  },
};
