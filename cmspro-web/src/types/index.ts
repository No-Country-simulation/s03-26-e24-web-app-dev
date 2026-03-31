// Global shared types for the application

export type UserRole = 'Admin' | 'Editor' | 'Visitor';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export type TestimonyType = 'Testimonial' | 'SuccessCase';

export type TestimonyStatus = 'Draft' | 'PendingReview' | 'Published' | 'Rejected';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export type MediaType = 'Image' | 'Video';
export type MediaProvider = 'Cloudinary' | 'YouTube';

export interface MediaFile {
  id: string;
  testimonyId: string;
  type: MediaType;
  url: string;
  provider: MediaProvider;
  publicId: string;
}

export interface Testimony {
  id: string;
  type: TestimonyType;
  title: string;
  body: string;
  extendedBody?: string | null;
  authorName: string;
  authorRole?: string;
  status: TestimonyStatus;
  categoryId: string;
  category?: Category;
  tags: Tag[];
  mediaFiles: MediaFile[];
  createdAt: string;
  publishedAt?: string | null;
  createdBy: string;
}

export interface TestimonyShadowCopy {
  id: string;
  testimonyId: string;
  type: TestimonyType;
  title: string;
  body: string;
  extendedBody?: string | null;
  authorName: string;
  authorRole?: string;
  categoryId: string;
  tagSnapshots: Tag[];
  mediaSnapshots: MediaFile[];
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewComment?: string | null;
}

export interface ModerationDiff {
  original: Testimony;
  shadowCopy: TestimonyShadowCopy;
}

export interface EngagementStat {
  id: string;
  testimonyId: string;
  views: number;
  readMoreClicks: number;
  videoPlays: number;
  embedClicks: number;
  lastUpdated: string;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
