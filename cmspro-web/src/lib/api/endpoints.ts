// API Endpoints - mirrors .NET backend routes

export const endpoints = {
  // Auth
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me',
  },

  // Testimonials (Private - requires JWT)
  testimonials: {
    list: '/api/testimonials',
    byId: (id: string) => `/api/testimonials/${id}`,
    create: '/api/testimonials',
    update: (id: string) => `/api/testimonials/${id}`,
    delete: (id: string) => `/api/testimonials/${id}`,
    submit: (id: string) => `/api/testimonials/${id}/submit`,
  },

  // Moderation (Admin only)
  moderation: {
    queue: '/api/moderation/queue',
    diff: (id: string) => `/api/moderation/${id}/diff`,
    approve: (id: string) => `/api/moderation/${id}/approve`,
    reject: (id: string) => `/api/moderation/${id}/reject`,
  },

  // Media
  media: {
    uploadImage: '/api/media/upload-image',
    linkVideo: '/api/media/link-video',
  },

  // Analytics (Admin only)
  analytics: {
    dashboard: '/api/analytics/dashboard',
    byTestimony: (id: string) => `/api/analytics/testimonials/${id}`,
  },

  // Categories & Tags
  categories: {
    list: '/api/categories',
    byId: (id: string) => `/api/categories/${id}`,
    create: '/api/categories',
    update: (id: string) => `/api/categories/${id}`,
    delete: (id: string) => `/api/categories/${id}`,
  },

  tags: {
    list: '/api/tags',
    byId: (id: string) => `/api/tags/${id}`,
    create: '/api/tags',
    update: (id: string) => `/api/tags/${id}`,
    delete: (id: string) => `/api/tags/${id}`,
  },

  // Users (Admin only)
  users: {
    list: '/api/users',
    byId: (id: string) => `/api/users/${id}`,
  },

  // Public API (requires API Key)
  public: {
    testimonials: '/api/public/testimonials',
    testimonialById: (id: string) => `/api/public/testimonials/${id}`,
    categories: '/api/public/categories',
    tags: '/api/public/tags',
  },
} as const;
