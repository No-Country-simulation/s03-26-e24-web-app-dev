export type { TestimonyFormInput, TestimonyResponse } from './schemas/testimonial.schema';

// Re-export types from global types that are specific to testimonials
export type {
  Testimony,
  TestimonyType,
  TestimonyStatus,
  MediaFile,
} from '@/types';
