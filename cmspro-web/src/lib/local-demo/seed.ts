import type {
  Category,
  EngagementStat,
  Tag,
  Testimony,
  TestimonyShadowCopy,
  User,
} from "@/types";
import type { DemoCredential, LocalDemoDb } from "./types";

const nowIso = () => new Date().toISOString();

export const LOCAL_DEMO_DB_KEY = "cmspro-local-db";
export const LOCAL_DEMO_SESSION_KEY = "cmspro-local-session";

export const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    email: "moderador@cmspro.demo",
    password: "Demo123!",
    userId: "user-admin-1",
  },
  {
    email: "editor@cmspro.demo",
    password: "Demo123!",
    userId: "user-editor-1",
  },
];

const users: User[] = [
  {
    id: "user-admin-1",
    email: "moderador@cmspro.demo",
    fullName: "Lucia Moderadora",
    role: "Admin",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
  {
    id: "user-editor-1",
    email: "editor@cmspro.demo",
    fullName: "Diego Editor",
    role: "Editor",
    createdAt: "2026-03-01T09:00:00.000Z",
  },
];

const categories: Category[] = [
  {
    id: "bf826e49-2dd4-4e85-b4a9-76effce488a9",
    name: "Cursos",
    slug: "cursos",
    description: "Historias de aprendizaje en programas y cursos",
  },
  {
    id: "2945b649-0842-4ca0-8f24-ec8a3a2afd8d",
    name: "Exito profesional",
    slug: "exito-profesional",
    description: "Impacto laboral y crecimiento profesional",
  },
  {
    id: "f9d57c0c-3a9d-4f34-959c-f3ec9aee8df5",
    name: "Transformacion personal",
    slug: "transformacion-personal",
    description: "Cambios personales sostenidos",
  },
];

const tags: Tag[] = [
  { id: "tag-1", name: "empleabilidad", slug: "empleabilidad" },
  { id: "tag-2", name: "bootcamp", slug: "bootcamp" },
  { id: "tag-3", name: "liderazgo", slug: "liderazgo" },
];

const testimonies: Testimony[] = [
  {
    id: "testimony-1",
    type: "Testimonial",
    title: "El contenido fue directo y aplicable",
    body: "Pude aplicar lo aprendido desde la primera semana. La estructura del curso me ayudó a mejorar mis entregables en el trabajo.",
    extendedBody: null,
    authorName: "Mariana Quiroz",
    authorRole: "UX Researcher",
    status: "Published",
    categoryId: "bf826e49-2dd4-4e85-b4a9-76effce488a9",
    tags: [tags[1]],
    mediaFiles: [
      {
        id: "media-1",
        testimonyId: "testimony-1",
        type: "Image",
        url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&auto=format&fit=crop",
        provider: "Cloudinary",
        publicId: "local-demo-media-1",
      },
    ],
    createdAt: "2026-03-20T14:32:00.000Z",
    publishedAt: "2026-03-22T10:12:00.000Z",
    createdBy: "user-editor-1",
    category: categories[0],
  },
  {
    id: "testimony-2",
    type: "SuccessCase",
    title: "De soporte tecnico a desarrollador frontend",
    body: "En nueve meses pase de soporte tecnico a mi primer puesto frontend. El programa me dio orden, practica y confianza.",
    extendedBody:
      "Comence el programa con base tecnica limitada. Organice una rutina diaria de dos horas y cada modulo lo converti en un proyecto real. En la segunda mitad del proceso ya estaba resolviendo tareas freelance. Con el portafolio final consegui entrevistas y finalmente una oferta en un equipo de producto.",
    authorName: "Luis Figueroa",
    authorRole: "Frontend Developer",
    status: "Published",
    categoryId: "2945b649-0842-4ca0-8f24-ec8a3a2afd8d",
    tags: [tags[0], tags[1]],
    mediaFiles: [
      {
        id: "media-2",
        testimonyId: "testimony-2",
        type: "Image",
        url: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=1200&auto=format&fit=crop",
        provider: "Cloudinary",
        publicId: "local-demo-media-2",
      },
    ],
    createdAt: "2026-03-21T11:05:00.000Z",
    publishedAt: "2026-03-25T16:42:00.000Z",
    createdBy: "user-editor-1",
    category: categories[1],
  },
  {
    id: "testimony-3",
    type: "Testimonial",
    title: "Borrador de historia para revision",
    body: "Estoy preparando una version final para enviarla esta tarde.",
    extendedBody: null,
    authorName: "Sofia Vega",
    authorRole: "Content Specialist",
    status: "Draft",
    categoryId: "f9d57c0c-3a9d-4f34-959c-f3ec9aee8df5",
    tags: [tags[2]],
    mediaFiles: [],
    createdAt: "2026-04-12T10:10:00.000Z",
    publishedAt: null,
    createdBy: "user-editor-1",
    category: categories[2],
  },
  {
    id: "testimony-4",
    type: "SuccessCase",
    title: "Ascenso tras certificar liderazgo",
    body: "Pase a liderar un squad de cuatro personas luego de certificarme.",
    extendedBody:
      "Durante el programa practique feedback, planificacion y gestion de bloqueos semanales. El cambio mas importante fue aprender a estructurar decisiones con datos y objetivos claros. Eso impacto directamente en los resultados del equipo.",
    authorName: "Carla Mendez",
    authorRole: "Team Lead",
    status: "PendingReview",
    categoryId: "2945b649-0842-4ca0-8f24-ec8a3a2afd8d",
    tags: [tags[2]],
    mediaFiles: [
      {
        id: "media-4",
        testimonyId: "testimony-4",
        type: "Image",
        url: "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?w=1200&auto=format&fit=crop",
        provider: "Cloudinary",
        publicId: "local-demo-media-4",
      },
    ],
    createdAt: "2026-04-10T17:00:00.000Z",
    publishedAt: null,
    createdBy: "user-editor-1",
    category: categories[1],
  },
];

const shadowCopies: TestimonyShadowCopy[] = [
  {
    id: "shadow-1",
    testimonyId: "testimony-4",
    type: "SuccessCase",
    title: "Ascenso tras certificar liderazgo y coaching",
    body: "Pase a liderar un squad de cuatro personas y mejore la coordinacion del equipo en solo dos meses.",
    extendedBody:
      "Durante el programa practique feedback, planificacion y gestion de bloqueos semanales. En paralelo aplique rituales de coaching con el equipo. El resultado fue una reduccion clara de retrabajo, mejor comunicacion y cumplimiento de sprint goals.",
    authorName: "Carla Mendez",
    authorRole: "Team Lead",
    categoryId: "2945b649-0842-4ca0-8f24-ec8a3a2afd8d",
    tagSnapshots: [tags[2], tags[0]],
    mediaSnapshots: [
      {
        id: "shadow-media-1",
        testimonyId: "testimony-4",
        type: "Image",
        url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&auto=format&fit=crop",
        provider: "Cloudinary",
        publicId: "local-demo-shadow-media-1",
      },
    ],
    status: "Pending",
    createdAt: "2026-04-13T09:55:00.000Z",
    reviewedAt: null,
    reviewedBy: null,
    reviewComment: null,
  },
];

const engagement: EngagementStat[] = [
  {
    id: "engagement-1",
    testimonyId: "testimony-1",
    views: 214,
    readMoreClicks: 0,
    videoPlays: 0,
    embedClicks: 21,
    lastUpdated: nowIso(),
  },
  {
    id: "engagement-2",
    testimonyId: "testimony-2",
    views: 518,
    readMoreClicks: 129,
    videoPlays: 0,
    embedClicks: 41,
    lastUpdated: nowIso(),
  },
];

export function createSeedDb(): LocalDemoDb {
  return {
    version: 1,
    users,
    categories,
    tags,
    testimonies,
    shadowCopies,
    moderationLogs: [],
    engagement,
  };
}
