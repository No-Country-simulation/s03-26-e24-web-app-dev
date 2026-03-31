import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { Testimony, PaginatedResponse } from '@/types';
import type { TestimonyFormInput } from '../types';

export interface GetTestimonialsParams {
  page?: number;
  pageSize?: number;
  type?: 'Testimonial' | 'SuccessCase';
  status?: string;
  categoryId?: string;
  search?: string;
}

export const testimonialService = {
  async getAll(params: GetTestimonialsParams = {}): Promise<PaginatedResponse<Testimony>> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params.type) searchParams.set('type', params.type);
    if (params.status) searchParams.set('status', params.status);
    if (params.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    const url = query ? `${endpoints.testimonials.list}?${query}` : endpoints.testimonials.list;

    return apiClient.get<PaginatedResponse<Testimony>>(url);
  },

  async getById(id: string): Promise<Testimony> {
    return apiClient.get<Testimony>(endpoints.testimonials.byId(id));
  },

  async create(data: TestimonyFormInput): Promise<Testimony> {
    return apiClient.post<Testimony>(endpoints.testimonials.create, data);
  },

  async update(id: string, data: Partial<TestimonyFormInput>): Promise<Testimony> {
    return apiClient.put<Testimony>(endpoints.testimonials.update(id), data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(endpoints.testimonials.delete(id));
  },

  async submitForReview(id: string): Promise<Testimony> {
    return apiClient.patch<Testimony>(endpoints.testimonials.submit(id));
  },
};
