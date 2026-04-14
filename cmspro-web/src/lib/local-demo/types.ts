import type {
  Category,
  EngagementStat,
  Tag,
  Testimony,
  TestimonyShadowCopy,
  User,
} from "@/types";

export type ModerationReviewType =
  | "InitialSubmission"
  | "ReworkSubmission"
  | "PublishedSuggestion";

export type ModerationBaselineSource =
  | "None"
  | "LastRejected"
  | "PublishedLive";

export interface ModerationSnapshot {
  type: Testimony["type"];
  title: string;
  body: string;
  extendedBody?: string | null;
  authorName: string;
  authorRole?: string;
  categoryId: string;
  tags: string[];
  mediaUrls: string[];
}

export interface ModerationLogEntry {
  id: string;
  testimonyId: string;
  shadowCopyId?: string | null;
  moderatorId: string;
  action: "Approved" | "Rejected" | "ChangesRequested";
  comment?: string;
  createdAt: string;
}

export interface LocalDemoDb {
  version: 1;
  users: User[];
  categories: Category[];
  tags: Tag[];
  testimonies: Testimony[];
  shadowCopies: TestimonyShadowCopy[];
  moderationLogs: ModerationLogEntry[];
  engagement: EngagementStat[];
}

export interface DemoCredential {
  email: string;
  password: string;
  userId: string;
}

export interface DemoSession {
  userId: string;
  loggedAt: string;
}

export interface ModerationQueueItem {
  testimonyId: string;
  shadowCopyId: string;
  title: string;
  body: string;
  status: "PendingReview" | "Published";
  type: TestimonyShadowCopy["type"];
  authorName: string;
  authorRole?: string;
  submittedAt: string;
  reviewType: ModerationReviewType;
  isEdit: boolean;
}

export interface ModerationReviewContext {
  testimonyId: string;
  reviewType: ModerationReviewType;
  baselineSource: ModerationBaselineSource;
  testimonyStatus: Testimony["status"];
  pendingShadowCopy: TestimonyShadowCopy;
  baseline: ModerationSnapshot | null;
  proposed: ModerationSnapshot;
}

export interface RejectionFeedbackItem {
  testimonyId: string;
  shadowCopyId: string;
  reviewType: ModerationReviewType;
  comment: string | null;
  reviewedAt: string | null;
  moderatorId: string | null;
  moderatorName: string | null;
}
