import { updateLocalDemoDb, readLocalDemoDb } from "./db";
import type {
  LocalDemoDb,
  ModerationQueueItem,
  ModerationReviewContext,
  ModerationReviewType,
  ModerationSnapshot,
  RejectionFeedbackItem,
} from "./types";
import type {
  Category,
  Testimony,
  TestimonyShadowCopy,
  TestimonyStatus,
  User,
} from "@/types";
import type { CreateTestimonySubmitInput } from "@/features/testimonials/types";
import { normalizeCmsImageUrl } from "@/lib/media-url";

interface LocalListParams {
  status?: Testimony["status"];
  type?: Testimony["type"];
  q?: string;
  createdBy?: string;
  publishedOnly?: boolean;
}

function attachCategory(
  testimony: Testimony,
  categories: Category[],
): Testimony {
  const category = categories.find((item) => item.id === testimony.categoryId);
  return {
    ...testimony,
    category,
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createShadowFromTestimony(
  testimony: Testimony,
  status: TestimonyShadowCopy["status"] = "Pending",
): TestimonyShadowCopy {
  return {
    id: generateId("shadow"),
    testimonyId: testimony.id,
    type: testimony.type,
    title: testimony.title,
    body: testimony.body,
    extendedBody:
      testimony.type === "SuccessCase" ? testimony.extendedBody : null,
    authorName: testimony.authorName,
    authorRole: testimony.authorRole,
    categoryId: testimony.categoryId,
    tagSnapshots: testimony.tags,
    mediaSnapshots: testimony.mediaFiles,
    status,
    createdAt: nowIso(),
    reviewedAt: null,
    reviewedBy: null,
    reviewComment: null,
  };
}

function cloneStatus(status: TestimonyStatus): TestimonyStatus {
  return status;
}

function queueStatusFromTestimony(testimony: Testimony | undefined):
  | "PendingReview"
  | "Published" {
  if (testimony?.status === "Published") {
    return "Published";
  }

  return "PendingReview";
}

function toTime(value?: string | null): number {
  if (!value) {
    return 0;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toSnapshotFromTestimony(testimony: Testimony): ModerationSnapshot {
  return {
    type: testimony.type,
    title: testimony.title,
    body: testimony.body,
    extendedBody: testimony.type === "SuccessCase" ? testimony.extendedBody : null,
    authorName: testimony.authorName,
    authorRole: testimony.authorRole,
    categoryId: testimony.categoryId,
    tags: testimony.tags.map((tag) => tag.name),
    mediaUrls: testimony.mediaFiles.map((media) => media.url),
  };
}

function toSnapshotFromShadow(shadow: TestimonyShadowCopy): ModerationSnapshot {
  return {
    type: shadow.type,
    title: shadow.title,
    body: shadow.body,
    extendedBody: shadow.type === "SuccessCase" ? shadow.extendedBody : null,
    authorName: shadow.authorName,
    authorRole: shadow.authorRole,
    categoryId: shadow.categoryId,
    tags: shadow.tagSnapshots.map((tag) => tag.name),
    mediaUrls: shadow.mediaSnapshots.map((media) => media.url),
  };
}

function getPendingShadow(
  db: LocalDemoDb,
  testimonyId: string,
): TestimonyShadowCopy | null {
  return (
    db.shadowCopies.find(
      (shadow) => shadow.testimonyId === testimonyId && shadow.status === "Pending",
    ) ?? null
  );
}

function getLatestRejectedShadow(
  db: LocalDemoDb,
  testimonyId: string,
  maxCreatedAt?: string,
): TestimonyShadowCopy | null {
  const maxTime = maxCreatedAt ? toTime(maxCreatedAt) : Number.POSITIVE_INFINITY;

  const rejected = db.shadowCopies
    .filter(
      (shadow) =>
        shadow.testimonyId === testimonyId &&
        shadow.status === "Rejected" &&
        toTime(shadow.createdAt) <= maxTime,
    )
    .sort((a, b) => {
      const timeA = Math.max(toTime(a.reviewedAt), toTime(a.createdAt));
      const timeB = Math.max(toTime(b.reviewedAt), toTime(b.createdAt));
      return timeB - timeA;
    });

  return rejected[0] ?? null;
}

function getLatestRejectedShadowBefore(
  db: LocalDemoDb,
  testimonyId: string,
  beforeCreatedAt: string,
): TestimonyShadowCopy | null {
  const beforeTime = toTime(beforeCreatedAt);

  const rejected = db.shadowCopies
    .filter(
      (shadow) =>
        shadow.testimonyId === testimonyId &&
        shadow.status === "Rejected" &&
        toTime(shadow.createdAt) < beforeTime,
    )
    .sort((a, b) => {
      const timeA = Math.max(toTime(a.reviewedAt), toTime(a.createdAt));
      const timeB = Math.max(toTime(b.reviewedAt), toTime(b.createdAt));
      return timeB - timeA;
    });

  return rejected[0] ?? null;
}

function resolveReviewType(
  db: LocalDemoDb,
  testimony: Testimony,
  pendingShadow: TestimonyShadowCopy,
): ModerationReviewType {
  const hasApprovedBeforePending = db.moderationLogs.some(
    (log) =>
      log.testimonyId === testimony.id &&
      log.action === "Approved" &&
      toTime(log.createdAt) < toTime(pendingShadow.createdAt),
  );

  if (testimony.status === "Published" || testimony.publishedAt || hasApprovedBeforePending) {
    return "PublishedSuggestion";
  }

  const lastRejected = getLatestRejectedShadowBefore(
    db,
    testimony.id,
    pendingShadow.createdAt,
  );
  if (lastRejected) {
    return "ReworkSubmission";
  }

  return "InitialSubmission";
}

function resolveReviewTypeForRejectedShadow(
  db: LocalDemoDb,
  testimony: Testimony,
  rejectedShadow: TestimonyShadowCopy,
): ModerationReviewType {
  const hasApprovedBeforeRejected = db.moderationLogs.some(
    (log) =>
      log.testimonyId === testimony.id &&
      log.action === "Approved" &&
      toTime(log.createdAt) < toTime(rejectedShadow.createdAt),
  );

  if (
    testimony.status === "Published" ||
    testimony.publishedAt ||
    hasApprovedBeforeRejected
  ) {
    return "PublishedSuggestion";
  }

  const priorRejected = getLatestRejectedShadowBefore(
    db,
    testimony.id,
    rejectedShadow.createdAt,
  );

  if (priorRejected) {
    return "ReworkSubmission";
  }

  return "InitialSubmission";
}

export function listCategories(): Category[] {
  return readLocalDemoDb().categories;
}

export function listTestimonies(params: LocalListParams = {}): Testimony[] {
  const db = readLocalDemoDb();
  let records = db.testimonies.map((item) =>
    attachCategory(item, db.categories),
  );

  if (params.publishedOnly) {
    records = records.filter((item) => item.status === "Published");
  }

  if (params.status) {
    records = records.filter((item) => item.status === params.status);
  }

  if (params.type) {
    records = records.filter((item) => item.type === params.type);
  }

  if (params.createdBy) {
    records = records.filter((item) => item.createdBy === params.createdBy);
  }

  if (params.q) {
    const needle = params.q.toLowerCase().trim();
    records = records.filter((item) => {
      const categoryName = item.category?.name ?? "";
      return [item.title, item.body, item.authorName, categoryName]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }

  return records.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getTestimonyById(id: string): Testimony | null {
  const db = readLocalDemoDb();
  const found = db.testimonies.find((item) => item.id === id);

  if (!found) {
    return null;
  }

  return attachCategory(found, db.categories);
}

interface CreateInput {
  type: Testimony["type"];
  title: string;
  body: string;
  extendedBody?: string | null;
  authorName: string;
  authorRole?: string;
  categoryId: string;
  tags?: string[];
  imageUrl?: string | null;
}

function slugifyTag(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function toTagRecords(tags: string[]) {
  return tags
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({
      id: generateId("tag"),
      name,
      slug: slugifyTag(name),
    }));
}

function toImageMedia(
  testimonyId: string,
  imageUrl?: string | null,
): Testimony["mediaFiles"] {
  const safeUrl = normalizeCmsImageUrl(imageUrl);

  if (!safeUrl) {
    return [];
  }

  return [
    {
      id: generateId("media"),
      testimonyId,
      type: "Image",
      url: safeUrl,
      provider: "Cloudinary",
      publicId: generateId("img"),
    },
  ];
}

export function sanitizeLocalDemoMediaUrls(): void {
  updateLocalDemoDb((db) => {
    const testimonies = db.testimonies.map((testimony) => ({
      ...testimony,
      mediaFiles: testimony.mediaFiles.filter((media) => {
        if (media.type !== "Image") {
          return true;
        }

        return normalizeCmsImageUrl(media.url) !== null;
      }),
    }));

    const shadowCopies = db.shadowCopies.map((shadow) => ({
      ...shadow,
      mediaSnapshots: shadow.mediaSnapshots.filter((media) => {
        if (media.type !== "Image") {
          return true;
        }

        return normalizeCmsImageUrl(media.url) !== null;
      }),
    }));

    return {
      ...db,
      testimonies,
      shadowCopies,
    };
  });
}

export function createDraftTestimony(
  input: CreateInput,
  actor: User,
): Testimony {
  const createdAt = nowIso();
  const testimonyId = generateId("testimony");

  const tags = toTagRecords(input.tags ?? []);
  const mediaFiles = toImageMedia(testimonyId, input.imageUrl);

  const testimony: Testimony = {
    id: testimonyId,
    type: input.type,
    title: input.title,
    body: input.body,
    extendedBody:
      input.type === "SuccessCase" ? (input.extendedBody ?? "") : null,
    authorName: input.authorName,
    authorRole: input.authorRole,
    status: "Draft",
    categoryId: input.categoryId,
    tags,
    mediaFiles,
    createdAt,
    publishedAt: null,
    createdBy: actor.id,
  };

  const updated = updateLocalDemoDb((db) => {
    return {
      ...db,
      testimonies: [testimony, ...db.testimonies],
    };
  });

  return attachCategory(testimony, updated.categories);
}

interface UpdateInput {
  type: Testimony["type"];
  title: string;
  body: string;
  extendedBody?: string | null;
  authorName: string;
  authorRole?: string;
  categoryId: string;
  tags?: string[];
  imageUrl?: string | null;
}

export function updateDraftTestimony(
  testimonyId: string,
  input: UpdateInput,
): Testimony {
  const updatedDb = updateLocalDemoDb((db) => {
    const testimonies = db.testimonies.map((item) => {
      if (item.id !== testimonyId) {
        return item;
      }

      if (item.status !== "Draft" && item.status !== "Rejected") {
        throw new Error(
          "Solo se pueden editar directamente testimonios en borrador o rechazados",
        );
      }

      return {
        ...item,
        type: input.type,
        title: input.title,
        body: input.body,
        extendedBody:
          input.type === "SuccessCase" ? (input.extendedBody ?? "") : null,
        authorName: input.authorName,
        authorRole: input.authorRole,
        categoryId: input.categoryId,
        tags: toTagRecords(input.tags ?? []),
        mediaFiles: toImageMedia(item.id, input.imageUrl),
      };
    });

    return {
      ...db,
      testimonies,
    };
  });

  const updated = updatedDb.testimonies.find((item) => item.id === testimonyId);

  if (!updated) {
    throw new Error("No se encontro el testimonio para actualizar");
  }

  return attachCategory(updated, updatedDb.categories);
}

export function updateTestimonyWithShadow(
  testimonyId: string,
  input: UpdateInput,
): Testimony {
  const db = readLocalDemoDb();
  const original = db.testimonies.find((item) => item.id === testimonyId);

  if (!original) {
    throw new Error("No se encontro el testimonio solicitado");
  }

  const nextCore: Testimony = {
    ...original,
    type: input.type,
    title: input.title,
    body: input.body,
    extendedBody:
      input.type === "SuccessCase" ? (input.extendedBody ?? "") : null,
    authorName: input.authorName,
    authorRole: input.authorRole,
    categoryId: input.categoryId,
    tags: toTagRecords(input.tags ?? []),
    mediaFiles: toImageMedia(original.id, input.imageUrl),
  };

  const pendingShadow = createShadowFromTestimony(nextCore);

  const updatedDb = updateLocalDemoDb((current) => {
    const testimonies = current.testimonies.map((item) => {
      if (item.id !== testimonyId) {
        return item;
      }

      return {
        ...item,
        status: cloneStatus(item.publishedAt ? "Published" : "PendingReview"),
      };
    });

    const existingShadowIndex = current.shadowCopies.findIndex(
      (shadow) =>
        shadow.testimonyId === testimonyId && shadow.status === "Pending",
    );

    const shadowCopies = [...current.shadowCopies];

    if (existingShadowIndex >= 0) {
      shadowCopies[existingShadowIndex] = {
        ...pendingShadow,
        id: shadowCopies[existingShadowIndex].id,
        createdAt: nowIso(),
      };
    } else {
      shadowCopies.unshift(pendingShadow);
    }

    return {
      ...current,
      testimonies,
      shadowCopies,
    };
  });

  const final = updatedDb.testimonies.find((item) => item.id === testimonyId);

  if (!final) {
    throw new Error("Error inesperado al guardar cambios");
  }

  return attachCategory(final, updatedDb.categories);
}

export function deleteTestimony(testimonyId: string): void {
  updateLocalDemoDb((db) => {
    return {
      ...db,
      testimonies: db.testimonies.filter((item) => item.id !== testimonyId),
      shadowCopies: db.shadowCopies.filter(
        (shadow) => shadow.testimonyId !== testimonyId,
      ),
    };
  });
}

export function submitForReview(testimonyId: string): Testimony {
  const db = readLocalDemoDb();
  const record = db.testimonies.find((item) => item.id === testimonyId);

  if (!record) {
    throw new Error("No se encontro el testimonio para enviar a revision");
  }

  if (record.status === "PendingReview") {
    return attachCategory(record, db.categories);
  }

  const pendingShadow = createShadowFromTestimony(record);

  const updatedDb = updateLocalDemoDb((current) => {
    const testimonies = current.testimonies.map((item) => {
      if (item.id !== testimonyId) {
        return item;
      }

      return {
        ...item,
        status: cloneStatus("PendingReview"),
      };
    });

    const hasPendingShadow = current.shadowCopies.some(
      (shadow) =>
        shadow.testimonyId === testimonyId && shadow.status === "Pending",
    );

    return {
      ...current,
      testimonies,
      shadowCopies: hasPendingShadow
        ? current.shadowCopies
        : [pendingShadow, ...current.shadowCopies],
    };
  });

  const updated = updatedDb.testimonies.find((item) => item.id === testimonyId);

  if (!updated) {
    throw new Error("No se pudo actualizar el estado de revision");
  }

  return attachCategory(updated, updatedDb.categories);
}

export function listPendingShadowsCount(): number {
  const db = readLocalDemoDb();
  return db.shadowCopies.filter((shadow) => shadow.status === "Pending").length;
}

export function listModerationStats(): {
  approvedToday: number;
  rejectedToday: number;
} {
  const db = readLocalDemoDb();
  const today = new Date();

  const isSameDay = (value: string) => {
    const date = new Date(value);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todayLogs = db.moderationLogs.filter((log) => isSameDay(log.createdAt));

  return {
    approvedToday: todayLogs.filter((item) => item.action === "Approved")
      .length,
    rejectedToday: todayLogs.filter((item) => item.action === "Rejected")
      .length,
  };
}

export function listModerationQueue(): ModerationQueueItem[] {
  const db = readLocalDemoDb();
  const queueItems: ModerationQueueItem[] = [];

  db.shadowCopies
    .filter((shadow) => shadow.status === "Pending")
    .forEach((shadow) => {
      const testimony = db.testimonies.find(
        (item) => item.id === shadow.testimonyId,
      );

      if (!testimony) {
        return;
      }

      const reviewType = resolveReviewType(db, testimony, shadow);

      queueItems.push({
        testimonyId: shadow.testimonyId,
        shadowCopyId: shadow.id,
        title: shadow.title,
        body: shadow.body,
        status: queueStatusFromTestimony(testimony),
        type: shadow.type,
        authorName: shadow.authorName,
        authorRole: shadow.authorRole,
        submittedAt: shadow.createdAt,
        reviewType,
        isEdit: testimony.publishedAt != null,
      });
    });

  return queueItems.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export function getModerationReviewContext(
  testimonyId: string,
): ModerationReviewContext | null {
  const db = readLocalDemoDb();
  const testimony = db.testimonies.find((item) => item.id === testimonyId);
  const shadow = getPendingShadow(db, testimonyId);

  if (!testimony || !shadow) {
    return null;
  }

  const reviewType = resolveReviewType(db, testimony, shadow);

  if (reviewType === "InitialSubmission") {
    return {
      testimonyId,
      reviewType,
      baselineSource: "None",
      testimonyStatus: testimony.status,
      pendingShadowCopy: shadow,
      baseline: null,
      proposed: toSnapshotFromShadow(shadow),
    };
  }

  if (reviewType === "PublishedSuggestion") {
    return {
      testimonyId,
      reviewType,
      baselineSource: "PublishedLive",
      testimonyStatus: testimony.status,
      pendingShadowCopy: shadow,
      baseline: toSnapshotFromTestimony(testimony),
      proposed: toSnapshotFromShadow(shadow),
    };
  }

  const lastRejected = getLatestRejectedShadow(db, testimonyId, shadow.createdAt);

  return {
    testimonyId,
    reviewType,
    baselineSource: lastRejected ? "LastRejected" : "None",
    testimonyStatus: testimony.status,
    pendingShadowCopy: shadow,
    baseline: lastRejected ? toSnapshotFromShadow(lastRejected) : null,
    proposed: toSnapshotFromShadow(shadow),
  };
}

export function getLatestRejectionFeedback(
  testimonyId: string,
): RejectionFeedbackItem | null {
  const db = readLocalDemoDb();
  const latestRejected = getLatestRejectedShadow(db, testimonyId);

  if (!latestRejected) {
    return null;
  }

  const testimony = db.testimonies.find((item) => item.id === testimonyId);
  const reviewType = testimony
    ? resolveReviewTypeForRejectedShadow(db, testimony, latestRejected)
    : "InitialSubmission";

  const moderatorName = latestRejected.reviewedBy
    ? db.users.find((user) => user.id === latestRejected.reviewedBy)?.fullName ?? null
    : null;

  return {
    testimonyId,
    shadowCopyId: latestRejected.id,
    reviewType,
    comment: latestRejected.reviewComment ?? null,
    reviewedAt: latestRejected.reviewedAt ?? null,
    moderatorId: latestRejected.reviewedBy ?? null,
    moderatorName,
  };
}

export function listLatestRejectionFeedback(): RejectionFeedbackItem[] {
  const db = readLocalDemoDb();

  return db.testimonies
    .map((testimony) => {
      const latestRejected = getLatestRejectedShadow(db, testimony.id);

      if (!latestRejected) {
        return null;
      }

      const reviewType = resolveReviewTypeForRejectedShadow(
        db,
        testimony,
        latestRejected,
      );

      const moderatorName = latestRejected.reviewedBy
        ? db.users.find((user) => user.id === latestRejected.reviewedBy)?.fullName ?? null
        : null;

      return {
        testimonyId: testimony.id,
        shadowCopyId: latestRejected.id,
        reviewType,
        comment: latestRejected.reviewComment ?? null,
        reviewedAt: latestRejected.reviewedAt ?? null,
        moderatorId: latestRejected.reviewedBy ?? null,
        moderatorName,
      };
    })
    .filter((item): item is RejectionFeedbackItem => item != null)
    .sort((a, b) => toTime(b.reviewedAt) - toTime(a.reviewedAt));
}

export function approveShadowCopy(
  testimonyId: string,
  moderatorId: string,
  comment?: string,
): void {
  updateLocalDemoDb((db) => {
    const shadow = db.shadowCopies.find(
      (item) => item.testimonyId === testimonyId && item.status === "Pending",
    );

    if (!shadow) {
      throw new Error("No hay cambios pendientes para aprobar");
    }

    const testimonies = db.testimonies.map((item) => {
      if (item.id !== testimonyId) {
        return item;
      }

      return {
        ...item,
        type: shadow.type,
        title: shadow.title,
        body: shadow.body,
        extendedBody:
          shadow.type === "SuccessCase" ? shadow.extendedBody : null,
        authorName: shadow.authorName,
        authorRole: shadow.authorRole,
        categoryId: shadow.categoryId,
        tags: shadow.tagSnapshots,
        mediaFiles: shadow.mediaSnapshots,
        status: "Published" as const,
        publishedAt: nowIso(),
      };
    });

    const shadowCopies = db.shadowCopies.map((item) => {
      if (item.id !== shadow.id) {
        return item;
      }

      return {
        ...item,
        status: "Approved" as const,
        reviewedAt: nowIso(),
        reviewedBy: moderatorId,
        reviewComment: comment ?? null,
      };
    });

    return {
      ...db,
      testimonies,
      shadowCopies,
      moderationLogs: [
        {
          id: generateId("mod-log"),
          testimonyId,
          shadowCopyId: shadow.id,
          moderatorId,
          action: "Approved",
          comment,
          createdAt: nowIso(),
        },
        ...db.moderationLogs,
      ],
    };
  });
}

export function rejectShadowCopy(
  testimonyId: string,
  moderatorId: string,
  comment?: string,
): void {
  const safeComment = comment?.trim();

  if (!safeComment) {
    throw new Error(
      "Debes ingresar un comentario para explicar el motivo del rechazo",
    );
  }

  updateLocalDemoDb((db) => {
    const shadow = db.shadowCopies.find(
      (item) => item.testimonyId === testimonyId && item.status === "Pending",
    );

    if (!shadow) {
      throw new Error("No hay cambios pendientes para rechazar");
    }

  const testimonies = db.testimonies.map((item) => {
      if (item.id !== testimonyId) {
        return item;
      }

      const hadPublishedVersion = db.moderationLogs.some(
        (log) => log.testimonyId === testimonyId && log.action === "Approved",
      );

      return {
        ...item,
        status: cloneStatus(
          item.publishedAt || hadPublishedVersion ? "Published" : "Rejected",
        ),
      };
    });

    const shadowCopies = db.shadowCopies.map((item) => {
      if (item.id !== shadow.id) {
        return item;
      }

      return {
        ...item,
        status: "Rejected" as const,
        reviewedAt: nowIso(),
        reviewedBy: moderatorId,
        reviewComment: safeComment,
      };
    });

    return {
      ...db,
      testimonies,
      shadowCopies,
      moderationLogs: [
        {
          id: generateId("mod-log"),
          testimonyId,
          shadowCopyId: shadow.id,
          moderatorId,
          action: "Rejected",
          comment: safeComment,
          createdAt: nowIso(),
        },
        ...db.moderationLogs,
      ],
    };
  });
}
