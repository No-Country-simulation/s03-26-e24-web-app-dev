# 📄 PLAN.md — Testimonial CMS (v3)
## s03-26-e24-web-app-dev | Equipo 24 | Edtech

---

```markdown
# 📌 PLAN.md — Testimonial CMS
> Proyecto: S03-26 | Equipo 24 | Web App Development
> Sector: Edtech
> Arquitectura: Clean Architecture (.NET 10 + Next.js)
> Equipo: 5 personas | Duración: 3 semanas

---

## 1. 🧭 Visión General del Sistema

Sistema CMS especializado en la gestión, moderación y publicación
de testimonios en formato texto, imagen y video.

Dirigido a instituciones Edtech que necesitan:
- Recopilar historias reales de sus comunidades
- Curarlas y moderarlas antes de publicarlas
- Distribuirlas via embeds o API pública en sitios externos

### 🔑 Concepto clave: Tipo de Testimonio

Un testimonio puede ser de dos naturalezas distintas,
pero comparten la MISMA entidad en base de datos.
La diferencia está controlada por el campo `Type`:

| Type            | Descripción                                                      |
|-----------------|------------------------------------------------------------------|
| `Testimonial`   | Texto corto. Opinión directa del usuario. Sin "Leer más".        |
| `SuccessCase`   | Contenido extendido. Incluye cuerpo largo y botón "Leer más".    |

#### ¿Por qué una sola entidad?

- Evita duplicación de lógica (moderación, shadow copy, media, tags)
- El campo `Type` es suficiente para diferenciar comportamiento
- El campo `ExtendedBody` se usa exclusivamente para `SuccessCase`
- En la vista pública, los `SuccessCase` se destacan visualmente
  por sobre los `Testimonial` (cards más grandes, con "Leer más")

#### Referencia visual (inspirada en screenshot)

```
┌────────────────────────────────────────────────────────────────┐
│  🔵 Testimonials  │ Logos │ Case studies │ Customer videos...  │  ← filtro lateral
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐  ┌──────────────────────┐  ┌─────────────┐  │
│  │ Testimonial  │  │   SUCCESS CASE 🌟     │  │ Testimonial │  │
│  │ (card small) │  │  (card destacada,     │  │ (card small)│  │
│  │              │  │   más alta, con       │  │             │  │
│  │ "Texto corto │  │   "Leer más →")       │  │ "Texto...   │  │
│  │  de opinión" │  │                       │  │  de opinión"│  │
│  │              │  │  Rodney Macnamars     │  │             │  │
│  │ Kevin M.     │  │  General Manager      │  │ Scott G.    │  │
│  │ VP Sales     │  │  Abcoe Distributors   │  │ VP Sales    │  │
│  └──────────────┘  └──────────────────────┘  └─────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Reglas de presentación:**
- `Testimonial` → card compacta, texto completo visible, sin "Leer más"
- `SuccessCase` → card destacada (mayor tamaño o highlighted),
   muestra preview del texto + botón "Leer más" que abre detalle completo
- Ambos tipos conviven en la misma grilla pero con jerarquía visual distinta
- El filtro lateral/superior permite ver "Todos | Testimonials | Cases"

### 🔑 Concepto clave: Shadow Copy

Cuando un testimonio es editado (esté publicado o no), el sistema
NO sobreescribe el contenido original. En su lugar, genera una
"copia sombra" (Shadow Copy) con los cambios propuestos.

El administrador accede a una vista de revisión tipo `git diff`:
- Lado izquierdo  → versión actual (original o publicada)
- Lado derecho    → versión propuesta (con cambios del editor)
- Diferencias resaltadas en texto, imagen y video

Solo al aprobar la moderación, el Shadow Copy reemplaza al original.

---

## 2. 🎭 Actores del Sistema

| Actor     | Descripción                                                          |
|-----------|----------------------------------------------------------------------|
| Admin     | Control total: usuarios, moderación, configuración, analítica        |
| Editor    | Crea, edita y envía testimonios a revisión                           |
| Visitante | Consulta testimonios públicos (via web o API externa)                |
| Sistema   | Procesa integraciones con YouTube y Cloudinary automáticamente       |

---

## 3. 📦 Módulos Funcionales

### 3.1 Gestión de Testimonios
- Crear, editar y eliminar testimonios
- Al crear, el editor elige el tipo:
  - `Testimonial` → solo requiere Body corto
  - `SuccessCase` → requiere Body corto (preview) + ExtendedBody (detalle completo)
- Soporte para multimedia:
  - Imagen (subida vía Cloudinary)
  - Video (enlace vía YouTube)
- Estados del testimonio:

```
DRAFT ──► PENDING_REVIEW ──► PUBLISHED
                │                │
                ▼                ▼ (si es editado)
            REJECTED      PENDING_REVIEW
                              (con Shadow Copy activo)
```

### 3.2 Lógica según Type

#### Testimonial
```
- Body          : texto corto (máx ~300 chars recomendado)
- ExtendedBody  : NULL / vacío (no aplica)
- "Leer más"    : NO
- Card UI       : compacta
- Media         : opcional
```

#### SuccessCase
```
- Body          : texto de preview visible en la grilla
- ExtendedBody  : contenido completo (texto enriquecido, puede ser largo)
- "Leer más"    : SÍ → abre página de detalle o modal expandido
- Card UI       : destacada (más grande o con color diferente)
- Media         : recomendada (imagen o video principal)
```

### 3.3 🌑 Shadow Copy (Moderación con Diff)

#### ¿Cuándo se activa?
| Escenario                                      | Shadow Copy |
|------------------------------------------------|-------------|
| Testimonio nuevo enviado a revisión            | ✅ Sí        |
| Testimonio PUBLISHED editado y re-enviado      | ✅ Sí        |
| Testimonio REJECTED corregido y re-enviado     | ✅ Sí        |
| Cambio de Type (Testimonial ↔ SuccessCase)     | ✅ Sí        |

#### ¿Cómo funciona?

**Al editar un testimonio:**
1. El editor modifica el contenido (incluyendo Type, Body, ExtendedBody, media...)
2. El sistema crea un registro `TestimonyShadowCopy` con los nuevos valores
3. El testimonio original permanece intacto y visible públicamente
4. El estado cambia a `PENDING_REVIEW`

**En la vista de moderación (Admin):**
```
┌──────────────────────────────┬──────────────────────────────┐
│   VERSIÓN ACTUAL             │   VERSIÓN PROPUESTA          │
│   (Original/Publicada)       │   (Shadow Copy)              │
├──────────────────────────────┼──────────────────────────────┤
│ Type: Testimonial            │ Type: SuccessCase 🆕         │
│                              │                              │
│ Body: "Fue increíble..."     │ Body: "Fue una experiencia   │
│                              │        única..."             │
│ ExtendedBody: (vacío)        │ ExtendedBody: "En detalle,   │
│                              │  el proceso fue..." 🆕       │
│                              │                              │
│ [imagen_original.jpg]        │ [imagen_nueva.png] 🆕        │
│                              │                              │
│ [video: youtube/abc]         │ [video: youtube/xyz] 🆕      │
│                              │                              │
│ Tags: #producto              │ Tags: #producto #evento 🟢   │
└──────────────────────────────┴──────────────────────────────┘

        [ ✅ Aprobar ]    [ ❌ Rechazar ]
```

**Al aprobar:**
- El Shadow Copy reemplaza los valores del testimonio original
  (incluido el Type si fue cambiado)
- El registro Shadow Copy se archiva como historial
- El testimonio vuelve a `PUBLISHED`

**Al rechazar:**
- El Shadow Copy se descarta (marcado como REJECTED)
- El testimonio original permanece sin cambios
- Si ya estaba publicado, sigue publicado con sus datos originales

#### Campos comparados en el Diff
| Campo         | Comparación                                      |
|---------------|--------------------------------------------------|
| Type          | Testimonial → SuccessCase (o viceversa)          |
| Title         | Texto resaltado char-by-char                     |
| Body          | Texto con marcas de cambio (preview)             |
| ExtendedBody  | Texto enriquecido completo (solo SuccessCase)    |
| AuthorName    | Texto                                            |
| AuthorRole    | Texto                                            |
| Category      | Nombre anterior vs nombre nuevo                  |
| Tags          | Tags removidos 🔴 | Tags añadidos 🟢             |
| Imagen        | Thumbnail anterior vs thumbnail nuevo            |
| Video         | URL/thumbnail anterior vs nuevo                  |

### 3.4 Clasificación y Búsqueda
- Categorías predefinidas: Producto | Evento | Cliente | Industria
- Tags personalizados por testimonio
- Filtros en API pública: por tipo (`testimonial` / `success_case`),
  categoría, tag, autor
- Búsqueda por texto libre (aplica a Body y ExtendedBody)

### 3.5 Embeds y API Pública
- Widget embebible (iframe o script JS)
- La API pública expone el campo `type` para que el sitio externo
  pueda diferenciar y renderizar cada tipo apropiadamente
- El endpoint de detalle retorna `ExtendedBody` solo si `Type = SuccessCase`
- Autenticación por API Key

### 3.6 Roles y Autenticación
- Autenticación JWT
- Tres roles: Admin | Editor | Visitante

### 3.7 Analítica de Engagement
- Visualizaciones por testimonio
- Clicks en "Leer más" (solo SuccessCase)
- Interacciones (clics, reproducciones de video)
- Dashboard con métricas agregadas (Admin)

---

## 4. 🏗️ Arquitectura del Sistema

### Stack Tecnológico

| Capa             | Tecnología                              |
|------------------|-----------------------------------------|
| Backend          | .NET 10 — ASP.NET Web API               |
| Frontend/CMS     | Next.js 15 (App Router)                 |
| Base de Datos    | PostgreSQL (Supabase)                   |
| ORM              | Entity Framework Core                   |
| Imágenes         | Cloudinary API                          |
| Videos           | YouTube Data API v3                     |
| Autenticación    | JWT + Roles                             |
| Documentación    | Swagger / OpenAPI                       |
| Hosting Backend  | Railway / Render                        |
| Hosting Frontend | Vercel                                  |

### Arquitectura Backend: Clean Architecture

```
Solution/
├── Domain/          → Entidades, Value Objects, Enums, Reglas de negocio
├── Application/     → Casos de uso, DTOs, Interfaces, Validaciones
├── Infrastructure/  → EF Core, Cloudinary, YouTube, Repositorios
└── API/             → Controllers, Middleware, DI, Swagger
```

### Relación entre Entidades

```
Testimony (versión viva/aprobada)
  ├── Type                  → Enum: Testimonial | SuccessCase
  ├── Category              (N:1)
  ├── Tags                  (N:M)
  ├── MediaFiles            (1:N)
  ├── ModerationLog         (1:N)
  ├── TestimonyShadowCopy   (1:N)
  └── EngagementStat        (1:1)

TestimonyShadowCopy
  ├── Type                  → puede cambiar respecto al original
  ├── MediaFileSnapshots    (1:N)
  └── TagSnapshots          (N:M)

User
  └── Role                  (N:1)
```

---

## 5. 🗺️ Flujos Clave del Sistema

### Flujo A — Creación y Primera Publicación

```
Editor elige tipo (Testimonial o SuccessCase)
    → Completa campos según tipo
       - Testimonial: Body corto + media opcional
       - SuccessCase: Body preview + ExtendedBody + media recomendada
    → Envía a revisión (PENDING_REVIEW) → se genera Shadow Copy
        → Admin revisa en vista Diff
            → APRUEBA → Shadow Copy aplicado → PUBLISHED
            → RECHAZA → Shadow Copy descartado → REJECTED
```

### Flujo B — Edición de Testimonio Publicado

```
Editor edita testimonio PUBLISHED
    → Puede cambiar Type, Body, ExtendedBody, media, tags
    → Se genera nuevo Shadow Copy
    → Testimonio original SIGUE PUBLICADO sin cambios
        → Admin ve vista Diff
            → APRUEBA → Shadow Copy reemplaza original → PUBLISHED
            → RECHAZA → Shadow Copy descartado → PUBLISHED (sin cambios)
```

### Flujo C — Consumo Externo

```
Sitio externo
    → GET /api/public/testimonials?type=success_case&category=...
    → Recibe testimonios PUBLISHED con campo `type`
    → Renderiza:
       - type=testimonial  → card compacta sin "Leer más"
       - type=success_case → card destacada con "Leer más"
            → GET /api/public/testimonials/{id} → retorna ExtendedBody
```

---

## 6. 📡 Endpoints REST Principales

### Públicos (requieren API Key)
| Método | Endpoint                              | Descripción                               |
|--------|---------------------------------------|-------------------------------------------|
| GET    | /api/public/testimonials              | Listar (soporta ?type=testimonial/success_case) |
| GET    | /api/public/testimonials/{id}         | Detalle completo (incluye ExtendedBody)   |
| GET    | /api/public/categories                | Listar categorías                         |
| GET    | /api/public/tags                      | Listar tags                               |

### Privados (requieren JWT + Rol)
| Método | Endpoint                                | Rol     | Descripción                      |
|--------|-----------------------------------------|---------|----------------------------------|
| POST   | /api/testimonials                       | Editor  | Crear (Testimonial o SuccessCase)|
| PUT    | /api/testimonials/{id}                  | Editor  | Editar (genera Shadow Copy)      |
| DELETE | /api/testimonials/{id}                  | Admin   | Eliminar                         |
| PATCH  | /api/testimonials/{id}/submit           | Editor  | Enviar a revisión                |
| GET    | /api/moderation/queue                   | Admin   | Cola de moderación               |
| GET    | /api/moderation/{id}/diff               | Admin   | Vista diff (original vs shadow)  |
| PATCH  | /api/moderation/{id}/approve            | Admin   | Aprobar Shadow Copy              |
| PATCH  | /api/moderation/{id}/reject             | Admin   | Rechazar Shadow Copy             |
| POST   | /api/media/upload-image                 | Editor  | Subir imagen a Cloudinary        |
| POST   | /api/media/link-video                   | Editor  | Vincular video de YouTube        |
| GET    | /api/analytics/dashboard                | Admin   | Métricas de engagement           |
| GET    | /api/users                              | Admin   | Gestión de usuarios              |

---

## 7. 🗄️ Modelo de Datos (Entidades Core)

### Testimony
```
- Id              : Guid
- Type            : Enum (Testimonial, SuccessCase)  ⭐
- Title           : string
- Body            : string          → preview / texto completo si es Testimonial
- ExtendedBody    : string?         → solo para SuccessCase (nullable)
- AuthorName      : string
- AuthorRole      : string
- Status          : Enum (Draft, PendingReview, Published, Rejected)
- CategoryId      : Guid (FK)
- Tags            : List<Tag>
- MediaFiles      : List<MediaFile>
- ShadowCopies    : List<TestimonyShadowCopy>
- ModerationLogs  : List<ModerationLog>
- CreatedAt       : DateTime
- PublishedAt     : DateTime?
- CreatedBy       : Guid (FK → User)
```

> 🔒 Regla de dominio: Si `Type = Testimonial`, `ExtendedBody` debe ser null.
> Si `Type = SuccessCase`, `ExtendedBody` es requerido.

### TestimonyShadowCopy
```
- Id              : Guid
- TestimonyId     : Guid (FK)
- Type            : Enum (Testimonial, SuccessCase)  ⭐ puede diferir del original
- Title           : string
- Body            : string
- ExtendedBody    : string?
- AuthorName      : string
- AuthorRole      : string
- CategoryId      : Guid (FK)
- TagSnapshots    : List<Tag>
- MediaSnapshots  : List<MediaFileSnapshot>
- Status          : Enum (Pending, Approved, Rejected)
- CreatedAt       : DateTime
- ReviewedAt      : DateTime?
- ReviewedBy      : Guid? (FK → User)
- ReviewComment   : string?
```

### MediaFile
```
- Id              : Guid
- TestimonyId     : Guid (FK)
- Type            : Enum (Image, Video)
- Url             : string
- Provider        : Enum (Cloudinary, YouTube)
- PublicId        : string
```

### MediaFileSnapshot
```
- Id              : Guid
- ShadowCopyId    : Guid (FK)
- Type            : Enum (Image, Video)
- Url             : string
- Provider        : Enum (Cloudinary, YouTube)
- PublicId        : string
```

### Category
```
- Id              : Guid
- Name            : string
- Slug            : string
- Description     : string
```

### Tag
```
- Id              : Guid
- Name            : string
- Slug            : string
```

### ModerationLog
```
- Id              : Guid
- TestimonyId     : Guid (FK)
- ShadowCopyId    : Guid? (FK)
- ModeratorId     : Guid (FK → User)
- Action          : Enum (Approved, Rejected, ChangesRequested)
- Comment         : string
- CreatedAt       : DateTime
```

### User
```
- Id              : Guid
- Email           : string
- PasswordHash    : string
- FullName        : string
- Role            : Enum (Admin, Editor, Visitor)
- CreatedAt       : DateTime
```

### EngagementStat
```
- Id              : Guid
- TestimonyId     : Guid (FK)
- Views           : int
- ReadMoreClicks  : int   ⭐ solo relevante para SuccessCase
- VideoPlays      : int
- EmbedClicks     : int
- LastUpdated     : DateTime
```

---

## 8. 👥 Equipo y Responsabilidades (5 personas)

| # | Rol                        | Responsabilidades principales                              |
|---|----------------------------|------------------------------------------------------------|
| 1 | Tech Lead / Backend Senior | Arquitectura, Domain, Application, revisión de PRs         |
| 2 | Backend Developer          | Infrastructure (EF Core, repos), integraciones externas    |
| 3 | Backend Developer          | API Controllers, Auth JWT, Shadow Copy endpoints           |
| 4 | Frontend Developer         | Dashboard CMS, formulario por tipo, vista Diff             |
| 5 | Frontend Developer         | Grilla pública (cards Testimonial/SuccessCase), embed, analítica |

---

## 9. 🗓️ Plan de 3 Semanas

### 📅 SEMANA 1 — Fundamentos y Core del Sistema
**Objetivo:** Base sólida del backend y estructura del proyecto

| Día   | Tareas                                                                  |
|-------|-------------------------------------------------------------------------|
| 1–2   | Setup solución Clean Architecture, configuración Supabase + EF Core     |
| 2–3   | Entidades Domain: Testimony (con Type), ShadowCopy, User, Category, Tag |
| 3–4   | Autenticación JWT + Roles (Admin, Editor, Visitante)                    |
| 4–5   | CRUD básico de testimonios diferenciando Testimonial vs SuccessCase     |
| 5     | Setup Next.js, layout dashboard, formulario con selector de tipo        |

**Entregable S1:** API con Auth + CRUD básico respetando los dos tipos

---

### 📅 SEMANA 2 — Shadow Copy, Moderación e Integraciones
**Objetivo:** Lógica de negocio central y conexiones externas

| Día   | Tareas                                                                  |
|-------|-------------------------------------------------------------------------|
| 1–2   | Implementación completa de Shadow Copy (incluye campo Type en diff)     |
| 2–3   | Endpoints de moderación + lógica diff                                   |
| 3     | Integración Cloudinary                                                  |
| 4     | Integración YouTube Data API v3                                         |
| 4–5   | Vista Diff en frontend (incluye comparación de Type, ExtendedBody)      |
| 5     | Cola de moderación en dashboard (Admin)                                 |

**Entregable S2:** Flujo completo de moderación con Shadow Copy funcional

---

### 📅 SEMANA 3 — API Pública, Grilla Visual, Embed y Cierre
**Objetivo:** Producto completo, documentado y demostrable

| Día   | Tareas                                                                  |
|-------|-------------------------------------------------------------------------|
| 1     | API pública con filtro por type, paginación y API Key                   |
| 1–2   | Grilla pública con cards diferenciadas (Testimonial / SuccessCase)      |
| 2     | Página/modal de detalle para SuccessCase ("Leer más")                   |
| 2     | Widget embebible con soporte para ambos tipos                           |
| 3     | Analítica: tracking de vistas + ReadMoreClicks para SuccessCase         |
| 3     | Dashboard de analítica en frontend                                      |
| 4     | Documentación Swagger + guía de integración externa                     |
| 4     | Sitio demo externo consumiendo la API pública                           |
| 5     | QA general, corrección de bugs, deploy final                            |

**Entregable S3:** Producto completo, desplegado y documentado

---

## 10. 🔐 Seguridad

- Autenticación via JWT (access token + refresh token)
- API Key para endpoints públicos externos
- Roles con `[Authorize(Roles = "...")]`
- Validación en capa Application (FluentValidation)
  - Si `Type = SuccessCase` → `ExtendedBody` es requerido
  - Si `Type = Testimonial` → `ExtendedBody` debe ser null
- Sanitización de texto enriquecido (Body y ExtendedBody)
- Variables sensibles SOLO en variables de entorno

---

## 11. 🧩 Integraciones Externas

### Cloudinary
- Subida y optimización de imágenes
- Eliminación al rechazar Shadow Copy con nueva imagen
- Eliminación al borrar testimonio

### YouTube Data API v3
- Validación de URLs de video
- Extracción de metadata (título, thumbnail, duración)
- Embedding en frontend (aplica especialmente a SuccessCase)

### Supabase (PostgreSQL)
- Base de datos gestionada en la nube
- Conexión vía connection string en variables de entorno
- Migraciones gestionadas por EF Core

---

## 12. 📊 Entregables del Proyecto

| Entregable                     | Descripción                                               |
|--------------------------------|-----------------------------------------------------------|
| Backend API (.NET 10)          | API REST documentada con Swagger                          |
| Frontend CMS (Next.js)         | Dashboard con roles, formulario por tipo y vista Diff     |
| Shadow Copy System             | Moderación con diff visual incluyendo cambio de Type      |
| Grilla Pública                 | Cards diferenciadas para Testimonial y SuccessCase        |
| Página de Detalle              | Vista expandida para SuccessCase con "Leer más"           |
| API Pública                    | Endpoints con filtro por type consumibles externamente    |
| Widget Embed                   | Componente JS/iframe con soporte para ambos tipos         |
| Documentación de API           | Swagger + Guía de integración externa                     |
| Demo de integración externa    | Sitio de ejemplo consumiendo la API pública               |

---

## 13. ✅ Criterios de Éxito

- [ ] Editor puede elegir entre Testimonial y SuccessCase al crear
- [ ] SuccessCase requiere y muestra ExtendedBody con "Leer más"
- [ ] Testimonial no expone ExtendedBody
- [ ] Grilla pública diferencia visualmente ambos tipos
- [ ] Shadow Copy captura cambios de Type (Testimonial ↔ SuccessCase)
- [ ] Vista Diff muestra comparación de ExtendedBody cuando aplica
- [ ] Testimonio publicado NO se altera durante revisión de Shadow Copy
- [ ] Al aprobar, el Shadow Copy reemplaza el original correctamente
- [ ] Al rechazar, el original permanece intacto
- [ ] API pública acepta filtro ?type=testimonial / ?type=success_case
- [ ] Roles correctamente aplicados (Admin / Editor / Visitante)
- [ ] Documentación de API disponible en Swagger
- [ ] Demo de integración externa operativa
- [ ] Integraciones con Cloudinary y YouTube funcionales
- [ ] Conexión a Supabase configurada por variables de entorno

---

## 14. ⚠️ Riesgos y Mitigaciones

| Riesgo                                          | Mitigación                                           |
|-------------------------------------------------|------------------------------------------------------|
| ExtendedBody nullable puede generar errores     | Validación estricta en Domain y Application          |
| Cambio de Type en Shadow Copy rompe UI del diff | Resaltar el cambio de Type como campo prioritario    |
| Shadow Copy añade complejidad al modelo         | Definir entidades y flujos antes de codificar        |
| 3 semanas ajustadas para 5 devs                 | Priorizar backend funcional sobre polish visual      |
| Integraciones externas pueden fallar            | Mocks primero, integrar al final de semana 2         |
| Supabase límites en plan gratuito               | Optimizar queries y monitorear uso desde el inicio   |
| Coordinación del equipo                         | Daily standups cortos + PRs pequeños y frecuentes    |
```

---

> ⚠️ **Reglas de oro del equipo:**
>
> 1. El campo `Type` determina el comportamiento completo del testimonio.
>    Toda validación, UI y respuesta de API debe respetar esta diferencia.
>
> 2. El Shadow Copy nunca modifica el testimonio original hasta que
>    un Admin apruebe explícitamente. La fuente de verdad pública
>    siempre es la versión aprobada del testimonio.

**hecho PM**