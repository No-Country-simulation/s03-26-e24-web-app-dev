import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testimonialService, type GetTestimonialsParams } from '../services/testimonials.service';
import type { TestimonyFormInput } from '../types';

// Query keys factory
export const testimonialKeys = {
  all: ['testimonials'] as const,
  lists: () => [...testimonialKeys.all, 'list'] as const,
  list: (params: GetTestimonialsParams) => [...testimonialKeys.lists(), params] as const,
  details: () => [...testimonialKeys.all, 'detail'] as const,
  detail: (id: string) => [...testimonialKeys.details(), id] as const,
};

// Get all testimonials
export function useTestimonials(params: GetTestimonialsParams = {}) {
  return useQuery({
    queryKey: testimonialKeys.list(params),
    queryFn: () => testimonialService.getAll(params),
  });
}

// Get single testimonial
export function useTestimonial(id: string) {
  return useQuery({
    queryKey: testimonialKeys.detail(id),
    queryFn: () => testimonialService.getById(id),
    enabled: !!id,
  });
}

// Create testimonial mutation
export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestimonyFormInput) => testimonialService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
    },
  });
}

// Update testimonial mutation
export function useUpdateTestimonial(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TestimonyFormInput>) => testimonialService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      queryClient.setQueryData(testimonialKeys.detail(id), data);
    },
  });
}

// Delete testimonial mutation
export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testimonialService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
    },
  });
}

// Submit for review mutation
export function useSubmitForReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testimonialService.submitForReview(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.lists() });
      queryClient.setQueryData(testimonialKeys.detail(id), data);
    },
  });
}
