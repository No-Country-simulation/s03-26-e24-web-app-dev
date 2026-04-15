import { z } from 'zod';

// Base schema (shared fields)
const testimonyBaseSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200, 'Máximo 200 caracteres'),
  authorName: z.string().min(1, 'El nombre del autor es requerido').max(150, 'Máximo 150 caracteres'),
  authorRole: z.string().max(100, 'Máximo 100 caracteres').optional(),
  categoryId: z.string().uuid('Selecciona una categoría'),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url('Debes subir una imagen').min(1, 'La imagen es obligatoria'),
});

// Testimonial schema (short text, no extended body)
export const testimonialSchema = testimonyBaseSchema.extend({
  type: z.literal('Testimonial'),
  body: z
    .string()
    .min(1, 'El contenido es requerido')
    .max(300, 'Máximo 300 caracteres para testimonios'),
  extendedBody: z.null().optional(),
});

// Success Case schema (requires extended body)
export const successCaseSchema = testimonyBaseSchema.extend({
  type: z.literal('SuccessCase'),
  body: z
    .string()
    .min(1, 'El preview es requerido')
    .max(500, 'Máximo 500 caracteres para el preview'),
  extendedBody: z
    .string()
    .min(1, 'El contenido extendido es requerido para casos de éxito'),
});

// Discriminated union - validates based on 'type' field
export const testimonySchema = z.discriminatedUnion('type', [
  testimonialSchema,
  successCaseSchema,
]);

// Form input type
export type TestimonyFormInput = z.infer<typeof testimonySchema>;

// Create testimony request schema
export const createTestimonySchema = testimonySchema;

// Update testimony request schema (all fields optional except type)
export const updateTestimonySchema = z.discriminatedUnion('type', [
  testimonialSchema.partial().extend({ type: z.literal('Testimonial') }),
  successCaseSchema.partial().extend({ type: z.literal('SuccessCase') }),
]);

// API response schema
export const testimonyResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['Testimonial', 'SuccessCase']),
  title: z.string(),
  body: z.string(),
  extendedBody: z.string().nullable(),
  authorName: z.string(),
  authorRole: z.string().nullable(),
  status: z.enum(['Draft', 'PendingReview', 'Published', 'Rejected']),
  categoryId: z.string().uuid(),
  category: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string(),
    })
    .optional(),
  tags: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string(),
    })
  ),
  mediaFiles: z.array(
    z.object({
      id: z.string().uuid(),
      type: z.enum(['Image', 'Video']),
      url: z.string().url(),
      provider: z.enum(['Cloudinary', 'YouTube']),
      publicId: z.string(),
    })
  ),
  createdAt: z.string(),
  publishedAt: z.string().nullable(),
  createdBy: z.string().uuid(),
});

export type TestimonyResponse = z.infer<typeof testimonyResponseSchema>;
