import type {
  TestimonyFormInput,
  TestimonyResponse,
} from "./schemas/testimonial.schema";

export type { TestimonyFormInput, TestimonyResponse };

// imageUrl is already required in TestimonyFormInput via the schema.
// This alias keeps call sites readable.
export type CreateTestimonySubmitInput = TestimonyFormInput;

export type CreateTestimonyFormInput = {
  type: "Testimonial" | "SuccessCase";
  title: string;
  authorName: string;
  authorRole?: string;
  categoryId: string;
  tags: string[];
  body: string;
  extendedBody: string | null;
  imageUrl: string;
};

// Re-export types from global types that are specific to testimonials
export type {
  Testimony,
  TestimonyType,
  TestimonyStatus,
  MediaFile,
} from "@/types";
