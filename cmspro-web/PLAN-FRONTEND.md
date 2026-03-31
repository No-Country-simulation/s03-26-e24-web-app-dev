# PLAN-FRONTEND.md — Testimonial CMS

> Proyecto: S03-26 | Equipo 24 | Web App Development  
> Sector: Edtech  
> Arquitectura Frontend: Feature Driven Architecture (FDA)  
> Stack: Next.js 15 (App Router) + React 19 + TypeScript

---

## 1. Visión General del Frontend

El frontend del Testimonial CMS tiene dos responsabilidades principales:

1. **Dashboard CMS** — Interfaz privada para Admins y Editores
2. **Grilla Pública** — Visualización de testimonios para visitantes
3. **Widget Embed** — Componente independiente para sitios externos

### Alineación con el Backend

Este documento complementa el `cmspro/PLAN.md` del backend. El frontend consume la API REST documentada en Swagger y respeta:

- Los dos tipos de testimonio: `Testimonial` y `SuccessCase`
- El sistema de Shadow Copy para moderación
- Los tres roles: Admin, Editor, Visitante
- Las integraciones con Cloudinary (imágenes) y YouTube (videos)

---

## 2. Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 15.x | Framework React con App Router |
| React | 19.x | Librería UI |
| TypeScript | 5.x | Tipado estático |
| TanStack Query | 5.x | Estado del servidor, caché, mutaciones |
| Zustand | 5.x | Estado UI local (modals, sidebar, theme) |
| Zod | 3.x | Validación de schemas |
| React Hook Form | 7.x | Manejo de formularios |
| Tailwind CSS | 4.x | Estilos utilitarios |
| shadcn/ui | latest | Componentes base accesibles |
| Lucide React | latest | Iconografía |
| date-fns | 4.x | Formateo de fechas |

---

## 3. Arquitectura: Feature Driven Architecture (FDA)

### Estructura de Carpetas

```
cmspro-web/
├── src/
│   ├── app/                      # Rutas (App Router)
│   │   ├── (public)/             # Route group: rutas públicas
│   │   │   ├── layout.tsx        # Layout público (header, footer)
│   │   │   ├── testimonials/     # /testimonials - Grilla pública
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/         # /testimonials/:id - Detalle SuccessCase
│   │   │   │       └── page.tsx
│   │   ├── (dashboard)/          # Route group: rutas privadas
│   │   │   ├── layout.tsx        # Layout dashboard (sidebar, navbar)
│   │   │   └── dashboard/        # /dashboard - Todas las rutas admin
│   │   │       ├── page.tsx      # /dashboard - Panel principal
│   │   │       ├── testimonials/ # /dashboard/testimonials - CRUD
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/      # /dashboard/testimonials/new
│   │   │       │   └── [id]/     # /dashboard/testimonials/:id
│   │   │       ├── moderation/   # /dashboard/moderation - Cola
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/     # /dashboard/moderation/:id - Diff
│   │   │       ├── categories/   # /dashboard/categories
│   │   │       ├── analytics/    # /dashboard/analytics
│   │   │       └── settings/     # /dashboard/settings
│   │   ├── (auth)/               # Route group: autenticación
│   │   │   ├── login/            # /login
│   │   │   └── register/         # /register
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # / - Landing page
│   │   └── globals.css           # Estilos globales
│   │
│   ├── features/                 # Módulos de negocio (FDA)
│   │   ├── testimonials/
│   │   │   ├── components/       # TestimonialCard, SuccessCaseCard, Form
│   │   │   ├── hooks/            # useTestimonials, useTestimony
│   │   │   ├── services/         # API calls
│   │   │   ├── schemas/          # Zod validation
│   │   │   └── types.ts          # Tipos del feature
│   │   ├── moderation/
│   │   │   ├── components/       # DiffView, ModerationQueue
│   │   │   ├── hooks/            # useModerationQueue, useDiff
│   │   │   └── ...
│   │   ├── analytics/
│   │   ├── categories/
│   │   ├── media/
│   │   └── auth/
│   │
│   ├── components/               # Componentes compartidos
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── shared/               # Header, Sidebar, DataTable
│   │   └── layout/               # PublicLayout, DashboardLayout
│   │
│   ├── lib/                      # Utilidades
│   │   ├── api/                  # Cliente HTTP, endpoints
│   │   └── utils.ts              # Helpers (cn, formatDate, etc.)
│   │
│   ├── config/                   # Configuración
│   │   ├── env.ts                # Variables de entorno tipadas
│   │   ├── constants.ts          # Constantes globales
│   │   └── navigation.ts         # Items de navegación
│   │
│   ├── providers/                # Context providers
│   │   ├── query-provider.tsx    # TanStack Query
│   │   ├── auth-provider.tsx     # Autenticación
│   │   └── theme-provider.tsx    # Dark/Light mode
│   │
│   ├── stores/                   # Zustand stores
│   │   └── ui.store.ts           # Estado UI (modals, sidebar)
│   │
│   └── types/                    # Tipos globales
│       └── index.ts              # Entidades compartidas
│
└── packages/
    └── embed/                    # Widget embebible standalone
        ├── src/
        │   ├── widget.tsx        # Componente principal
        │   └── styles.css        # Estilos encapsulados
        └── package.json
```

### Principios FDA

1. **Cada feature es autónomo** — contiene todo lo necesario para funcionar
2. **Features no se importan entre sí** — usan tipos globales si necesitan compartir
3. **Componentes compartidos en `/components`** — solo UI genérica
4. **Servicios aislados** — cada feature maneja sus propias llamadas API
5. **Hooks encapsulan lógica** — TanStack Query hooks por feature

---

## 4. Módulos Funcionales

### 4.1 Feature: Testimonials

#### Componentes Principales

| Componente | Descripción |
|------------|-------------|
| `TestimonialCard` | Card compacta para tipo `Testimonial` |
| `SuccessCaseCard` | Card destacada con "Leer más" para tipo `SuccessCase` |
| `TestimonyForm` | Formulario de creación/edición con selector de tipo |
| `TestimonyGrid` | Grilla con filtros por tipo, categoría, tags |
| `TestimonyDetail` | Vista expandida para SuccessCase |

#### Hooks (TanStack Query)

```typescript
// hooks/use-testimonials.ts
useTestimonials(filters)     // Lista con paginación
useTestimony(id)             // Detalle individual
useCreateTestimony()         // Mutación crear
useUpdateTestimony()         // Mutación editar (genera Shadow Copy)
useDeleteTestimony()         // Mutación eliminar
useSubmitForReview(id)       // Enviar a moderación
```

#### Schemas (Zod)

```typescript
// schemas/testimonial.schema.ts
testimonialSchema            // Validación para tipo Testimonial
successCaseSchema            // Validación para tipo SuccessCase (requiere ExtendedBody)
createTestimonySchema        // Schema unificado con discriminador por Type
```

### 4.2 Feature: Moderation

#### Componentes Principales

| Componente | Descripción |
|------------|-------------|
| `ModerationQueue` | Lista de testimonios pendientes de revisión |
| `DiffView` | Vista lado a lado: Original vs Shadow Copy |
| `DiffField` | Comparación individual de campo con highlighting |
| `MediaDiff` | Comparación de imágenes/videos |
| `ApproveRejectActions` | Botones de acción con confirmación |

#### Vista Diff (Concepto Clave)

```
┌─────────────────────────────┬─────────────────────────────┐
│   VERSIÓN ACTUAL            │   VERSIÓN PROPUESTA         │
│   (Original/Publicada)      │   (Shadow Copy)             │
├─────────────────────────────┼─────────────────────────────┤
│ Type: Testimonial           │ Type: SuccessCase           │
│                             │       ──────────────        │
│ Body: "Texto original..."   │ Body: "Texto modificado..." │
│       ────────────────      │       ─────────────────     │
│ ExtendedBody: (vacío)       │ ExtendedBody: "Contenido    │
│                             │  extendido nuevo..."        │
│                             │  ──────────────────         │
│ [imagen_original.jpg]       │ [imagen_nueva.png]          │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘
        [ Aprobar ]    [ Rechazar ]
```

#### Hooks

```typescript
// hooks/use-moderation.ts
useModerationQueue()         // Lista pendientes
useDiff(testimonyId)         // Obtener diff original vs shadow
useApprove()                 // Mutación aprobar
useReject()                  // Mutación rechazar
```

### 4.3 Feature: Analytics

#### Componentes

| Componente | Descripción |
|------------|-------------|
| `AnalyticsDashboard` | Panel con métricas agregadas |
| `ViewsChart` | Gráfico de visualizaciones por período |
| `EngagementTable` | Tabla de testimonios con métricas |
| `TopPerformers` | Testimonios con más engagement |

#### Métricas Rastreadas

- **Views** — Visualizaciones totales
- **ReadMoreClicks** — Clicks en "Leer más" (solo SuccessCase)
- **VideoPlays** — Reproducciones de video
- **EmbedClicks** — Clicks desde embeds externos

### 4.4 Feature: Media

#### Componentes

| Componente | Descripción |
|------------|-------------|
| `ImageUploader` | Upload a Cloudinary con preview |
| `VideoLinker` | Input de URL YouTube con validación |
| `MediaGallery` | Galería de archivos del testimonio |
| `MediaPreview` | Preview de imagen/video |

#### Integraciones

- **Cloudinary** — Upload directo desde frontend (signed uploads)
- **YouTube** — Validación de URL + extracción de metadata via backend

### 4.5 Feature: Auth

#### Componentes

| Componente | Descripción |
|------------|-------------|
| `LoginForm` | Formulario de login |
| `RegisterForm` | Formulario de registro (si aplica) |
| `UserMenu` | Dropdown con opciones de usuario |
| `RoleGuard` | HOC para proteger rutas por rol |

#### Auth Provider

```typescript
// providers/auth-provider.tsx
interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  login: (credentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

---

## 5. Flujos de UI Principales

### 5.1 Creación de Testimonio

```
Editor abre formulario
    → Selecciona Type (Testimonial o SuccessCase)
    → Formulario se adapta dinámicamente:
        - Testimonial: Body (corto) + Media opcional
        - SuccessCase: Body (preview) + ExtendedBody (requerido) + Media
    → Completa campos + sube media
    → Guarda como DRAFT
    → Click "Enviar a revisión"
        → POST /api/testimonials/{id}/submit
        → Se genera Shadow Copy en backend
        → Redirige a lista con toast de confirmación
```

### 5.2 Edición de Testimonio Publicado

```
Editor abre testimonio PUBLISHED
    → Puede modificar cualquier campo (incluso Type)
    → Al guardar:
        → PUT /api/testimonials/{id}
        → Backend genera Shadow Copy
        → Original SIGUE PUBLICADO sin cambios
        → Toast: "Cambios enviados a moderación"
    → Admin revisa en vista Diff
```

### 5.3 Moderación (Admin)

```
Admin abre cola de moderación
    → Ve lista de testimonios PENDING_REVIEW
    → Click en testimonio
        → GET /api/moderation/{id}/diff
        → Muestra DiffView con todos los campos
    → Revisa cambios
        → Click "Aprobar"
            → PATCH /api/moderation/{id}/approve
            → Shadow Copy reemplaza original
            → Testimonio vuelve a PUBLISHED
        → Click "Rechazar"
            → Modal pide comentario
            → PATCH /api/moderation/{id}/reject
            → Shadow Copy descartado
            → Original permanece intacto
```

### 5.4 Vista Pública

```
Visitante accede a /testimonials
    → Carga grilla con filtros
        - Tipo: Todos | Testimonials | Success Cases
        - Categoría
        - Tags
    → Renderiza cards diferenciadas:
        - Testimonial → card compacta, texto completo
        - SuccessCase → card destacada, preview + "Leer más"
    → Click "Leer más" (SuccessCase)
        → Navega a /testimonials/[id]
        → Muestra ExtendedBody completo + media
```

---

## 6. Componentes UI Base (shadcn/ui)

### Componentes a Instalar

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add form
npx shadcn@latest add label
npx shadcn@latest add switch
npx shadcn@latest add alert
```

### Componentes Compartidos Personalizados

| Componente | Descripción |
|------------|-------------|
| `DataTable` | Tabla con sorting, filtering, pagination |
| `ConfirmDialog` | Modal de confirmación reutilizable |
| `EmptyState` | Estado vacío con ilustración |
| `LoadingSpinner` | Spinner de carga |
| `ErrorBoundary` | Manejo de errores React |
| `PageHeader` | Header de página con título y acciones |
| `StatusBadge` | Badge con colores según estado |

---

## 7. Estado y Data Fetching

### TanStack Query (Estado del Servidor)

```typescript
// Configuración base
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutos
      gcTime: 1000 * 60 * 30,        // 30 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

#### Query Keys Convention

```typescript
export const queryKeys = {
  testimonials: {
    all: ['testimonials'] as const,
    lists: () => [...queryKeys.testimonials.all, 'list'] as const,
    list: (filters: Filters) => [...queryKeys.testimonials.lists(), filters] as const,
    details: () => [...queryKeys.testimonials.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.testimonials.details(), id] as const,
  },
  moderation: {
    queue: ['moderation', 'queue'] as const,
    diff: (id: string) => ['moderation', 'diff', id] as const,
  },
  // ... más keys
};
```

### Zustand (Estado UI Local)

```typescript
// stores/ui.store.ts
interface UIStore {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Modals
  activeModal: string | null;
  modalData: unknown;
  openModal: (name: string, data?: unknown) => void;
  closeModal: () => void;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: Theme) => void;
  
  // Filters (persistentes en URL idealmente)
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
}
```

---

## 8. Rutas y Navegación

### Estructura de Rutas

```
/                           # Landing o redirect a /testimonials
/testimonials               # Grilla pública
/testimonials/[id]          # Detalle SuccessCase

/login                      # Autenticación
/register                   # Registro (si aplica)

/dashboard                  # Panel principal (privado)
/dashboard/testimonials     # CRUD testimonios
/dashboard/testimonials/new # Crear testimonio
/dashboard/testimonials/[id]# Editar testimonio
/dashboard/moderation       # Cola de moderación (Admin)
/dashboard/moderation/[id]  # Vista Diff (Admin)
/dashboard/categories       # Gestión categorías (Admin)
/dashboard/analytics        # Dashboard analítica (Admin)
/dashboard/settings         # Configuración
```

### Protección de Rutas

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const pathname = request.nextUrl.pathname;
  
  // Rutas que requieren autenticación
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}
```

---

## 9. Widget Embed (packages/embed)

### Arquitectura

El widget es un paquete standalone que se compila a un bundle JS independiente para ser embebido en sitios externos.

```
packages/embed/
├── src/
│   ├── widget.tsx          # Componente React principal
│   ├── api.ts              # Fetch a API pública
│   ├── styles.css          # Estilos encapsulados (CSS-in-JS o scoped)
│   └── index.ts            # Entry point
├── dist/                   # Bundle compilado
│   ├── testimonial-widget.js
│   └── testimonial-widget.css
├── package.json
├── tsconfig.json
└── vite.config.ts          # o rollup.config.js
```

### Uso en Sitio Externo

```html
<!-- Opción 1: Script tag -->
<div id="testimonial-widget" data-api-key="xxx" data-category="producto"></div>
<script src="https://cdn.cmspro.com/embed/testimonial-widget.js"></script>

<!-- Opción 2: iframe -->
<iframe 
  src="https://app.cmspro.com/embed?apiKey=xxx&category=producto" 
  width="100%" 
  height="500"
  frameborder="0"
></iframe>
```

### Configuración del Widget

```typescript
interface WidgetConfig {
  apiKey: string;           // Requerido
  containerId?: string;     // Default: 'testimonial-widget'
  category?: string;        // Filtro por categoría
  type?: 'all' | 'testimonial' | 'success_case';
  limit?: number;           // Cantidad a mostrar
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'grid' | 'carousel' | 'list';
  showReadMore?: boolean;   // Para SuccessCase
}
```

---

## 10. Plan de Implementación (3 Semanas)

### Semana 1 — Fundamentos y CRUD

| Día | Tareas Frontend |
|-----|-----------------|
| 1-2 | Setup proyecto Next.js 15, configuración inicial, providers |
| 2-3 | Instalar shadcn/ui, crear componentes base |
| 3-4 | Feature testimonials: tipos, schemas, servicios, hooks |
| 4-5 | Formulario de creación con selector de tipo |
| 5 | Grilla de testimonios en dashboard + filtros básicos |

**Entregable S1:** Dashboard con CRUD básico de testimonios

### Semana 2 — Moderación y Vista Diff

| Día | Tareas Frontend |
|-----|-----------------|
| 1-2 | Componente DiffView con comparación de campos |
| 2-3 | Cola de moderación con estados |
| 3 | Integración upload Cloudinary |
| 4 | Integración linker YouTube |
| 4-5 | Acciones aprobar/rechazar con confirmación |
| 5 | Testing de flujo completo de moderación |

**Entregable S2:** Sistema de moderación funcional con vista Diff

### Semana 3 — Público, Embed y Cierre

| Día | Tareas Frontend |
|-----|-----------------|
| 1 | Grilla pública con cards diferenciadas |
| 1-2 | Página detalle SuccessCase ("Leer más") |
| 2 | Widget embed básico funcional |
| 2-3 | Dashboard de analítica |
| 3 | Responsive y ajustes de UI |
| 4 | Testing E2E, corrección bugs |
| 5 | Deploy Vercel, documentación |

**Entregable S3:** Producto frontend completo y desplegado

---

## 11. Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset
```

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.cmspro.com
NEXT_PUBLIC_APP_URL=https://app.cmspro.com
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=production-cloud
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=production-preset
```

---

## 12. Testing

### Estrategia de Testing

| Tipo | Herramienta | Cobertura |
|------|-------------|-----------|
| Unit | Vitest | Hooks, utils, schemas |
| Component | Testing Library | Componentes aislados |
| Integration | Testing Library | Features completos |
| E2E | Playwright | Flujos críticos |

### Tests Críticos

```typescript
// Flujos que DEBEN tener tests E2E
- [ ] Crear testimonio tipo Testimonial
- [ ] Crear testimonio tipo SuccessCase
- [ ] Editar testimonio publicado (genera Shadow Copy)
- [ ] Aprobar Shadow Copy
- [ ] Rechazar Shadow Copy
- [ ] Filtrar grilla pública por tipo
- [ ] Ver detalle de SuccessCase
```

---

## 13. Performance

### Optimizaciones

- **Server Components** — Usar RSC para páginas estáticas
- **Suspense** — Loading states granulares
- **Image Optimization** — next/image con Cloudinary loader
- **Code Splitting** — Dynamic imports para features pesados
- **Prefetching** — Links con prefetch en navegación

### Métricas Objetivo

| Métrica | Objetivo |
|---------|----------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTI | < 3.5s |

---

## 14. Accesibilidad (a11y)

### Requisitos

- Navegación por teclado completa
- Labels en todos los inputs
- Roles ARIA correctos
- Contraste mínimo WCAG AA
- Focus visible en todos los elementos interactivos
- Anuncios de screen reader para acciones async

### Componentes shadcn/ui

Los componentes de shadcn/ui ya incluyen accesibilidad base. Mantener y extender.

---

## 15. Criterios de Éxito (Frontend)

- [ ] Editor puede elegir tipo al crear testimonio
- [ ] Formulario valida ExtendedBody requerido para SuccessCase
- [ ] Vista Diff muestra todos los campos comparados
- [ ] Admin puede aprobar/rechazar desde la UI
- [ ] Grilla pública diferencia visualmente los tipos
- [ ] "Leer más" funciona correctamente para SuccessCase
- [ ] Widget embed carga en sitio externo
- [ ] Responsive en mobile, tablet, desktop
- [ ] Dark mode funcional
- [ ] Métricas Core Web Vitals en verde

---

> **Nota:** Este documento debe mantenerse actualizado conforme avanza el desarrollo.
> Última actualización: Marzo 2026
