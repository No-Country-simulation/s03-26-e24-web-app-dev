import type {
  TestimonyFormInput,
  TestimonyResponse,
} from "./schemas/testimonial.schema";

export type { TestimonyFormInput, TestimonyResponse };

export type CreateTestimonySubmitInput = TestimonyFormInput & {
  imageUrl?: string | null;
};

export type CreateTestimonyFormInput = {
  type: "Testimonial" | "SuccessCase";
  title: string;
  authorName: string;
  authorRole?: string;
  categoryId: string;
  tags: string[];
  body: string;
  extendedBody: string | null;
  imageUrl?: string | null;
};

// Re-export types from global types that are specific to testimonials
export type {
  Testimony,
  TestimonyType,
  TestimonyStatus,
  MediaFile,
} from "@/types";
