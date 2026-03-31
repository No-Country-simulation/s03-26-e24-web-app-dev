export const APP_NAME = 'Testimonial CMS';

export const TESTIMONY_TYPES = {
  Testimonial: {
    label: 'Testimonio',
    description: 'Texto corto, opinión directa del usuario',
    maxBodyLength: 300,
    requiresExtendedBody: false,
  },
  SuccessCase: {
    label: 'Caso de Éxito',
    description: 'Contenido extendido con "Leer más"',
    maxBodyLength: 500,
    requiresExtendedBody: true,
  },
} as const;

export const TESTIMONY_STATUS = {
  Draft: { label: 'Borrador', color: 'gray' },
  PendingReview: { label: 'Pendiente', color: 'yellow' },
  Published: { label: 'Publicado', color: 'green' },
  Rejected: { label: 'Rechazado', color: 'red' },
} as const;

export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

export const MEDIA = {
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  youtubeUrlPattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
} as const;
