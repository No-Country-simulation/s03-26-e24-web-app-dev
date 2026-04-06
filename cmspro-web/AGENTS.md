# AGENTS.md — Testimonial CMS

> Instructions for AI coding agents operating in this repository.

## Project Overview

**Testimonial CMS** — A content management system for managing, moderating, and publishing testimonials and success cases. Built with Clean Architecture (.NET 10) backend and Feature Driven Architecture (Next.js 15) frontend.

### Repository Structure

```
s03-26-e24-web-app-dev/
├── cmspro/                 # Backend (.NET 10 - Clean Architecture)
│   ├── CmsPro.Domain/      # Entities, Enums, Business rules (NO dependencies)
│   ├── CmsPro.Application/ # Use cases, DTOs, Interfaces
│   ├── CmsPro.Infrastructure/ # EF Core, Repositories, External APIs
│   └── CmsPro.API/         # Controllers, Middleware, DI
│
└── cmspro-web/             # Frontend (Next.js 15 - FDA)
    ├── src/
    │   ├── app/            # Routes (App Router)
    │   │   ├── (public)/   # Public routes: /testimonials, /testimonials/[id]
    │   │   ├── (dashboard)/# Private routes: /dashboard/*
    │   │   └── (auth)/     # Auth routes: /login, /register
    │   ├── features/       # Business logic modules (FDA)
    │   ├── components/     # Shared UI components
    │   ├── lib/            # Utilities, API client
    │   ├── providers/      # React context providers
    │   ├── stores/         # Zustand stores
    │   └── config/         # Environment, constants
    └── packages/embed/     # Standalone embed widget
```

### Frontend Route Structure (App Router)

```
/                           # Landing page
/testimonials               # Public grid (all testimonials)
/testimonials/[id]          # Public detail (SuccessCase "Read more")

/login                      # Authentication
/register                   # Registration

/dashboard                  # Admin panel home
/dashboard/testimonials     # CRUD testimonials
/dashboard/testimonials/new # Create new
/dashboard/testimonials/[id]# Edit existing
/dashboard/moderation       # Moderation queue (Admin)
/dashboard/moderation/[id]  # Diff view (Admin)
/dashboard/categories       # Manage categories (Admin)
/dashboard/analytics        # Analytics dashboard (Admin)
/dashboard/settings         # Settings
```

> **Note:** Route groups `(public)`, `(dashboard)`, `(auth)` are for organization only — they don't affect URLs. All dashboard routes must be nested under `/dashboard/` folder to avoid conflicts.

---

## Build & Run Commands

### Backend (.NET 10)

```bash
# Build solution
dotnet build cmspro/cmspro.slnx

# Run API (from repo root)
dotnet run --project cmspro/CmsPro.API

# Run with watch mode
dotnet watch run --project cmspro/CmsPro.API

# EF Core Migrations
dotnet ef migrations add <MigrationName> \
  --project cmspro/CmsPro.Infrastructure \
  --startup-project cmspro/CmsPro.API

dotnet ef database update \
  --project cmspro/CmsPro.Infrastructure \
  --startup-project cmspro/CmsPro.API

# Run tests (when test project exists)
dotnet test cmspro/cmspro.slnx
dotnet test cmspro/CmsPro.Tests --filter "FullyQualifiedName~TestClassName"
```

### Frontend (Next.js 15)

```bash
# Install dependencies
cd cmspro-web && npm install

# Development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
npm run test -- --testPathPattern="testimonials"  # Single test file

# Linting & formatting
npm run lint
npm run lint:fix
npm run format
```

---

## Code Style Guidelines

### C# (.NET Backend)

| Aspect | Convention |
|--------|------------|
| Framework | .NET 10, C# 14 |
| Naming | PascalCase for classes, methods, properties |
| Namespaces | File-scoped (`namespace CmsPro.Domain.Entities;`) |
| Nullability | `<Nullable>enable</Nullable>` — use `?` for nullable types |
| Entities | Private setters, constructor validation, domain methods |
| Async | Use `async/await` for all I/O operations |
| LINQ | Prefer method syntax over query syntax |

```csharp
// Good: Domain entity pattern
public class Testimonial
{
    public Guid Id { get; private set; }
    public string AuthorName { get; private set; }
    
    public Testimonial(string authorName)
    {
        if (string.IsNullOrWhiteSpace(authorName))
            throw new ArgumentException("Author name is required.");
        
        Id = Guid.NewGuid();
        AuthorName = authorName;
    }
    
    public void Publish() { /* domain logic */ }
}
```

### TypeScript (Frontend)

| Aspect | Convention |
|--------|------------|
| Framework | Next.js 15 (App Router), React 19 |
| Types | Strict mode, explicit return types for functions |
| Components | Functional components with TypeScript interfaces |
| Naming | PascalCase components, camelCase functions/variables |
| Files | kebab-case (`testimonial-card.tsx`) |
| Imports | Absolute paths (`@/features/...`) |

```typescript
// Good: Component pattern
interface TestimonialCardProps {
  testimonial: Testimonial;
  onEdit?: (id: string) => void;
}

export function TestimonialCard({ testimonial, onEdit }: TestimonialCardProps) {
  return (/* JSX */);
}
```

---

## Architecture Rules

### Backend: Clean Architecture

```
Domain → (no dependencies)
Application → depends on Domain
Infrastructure → depends on Application
API → depends on Application + Infrastructure
```

**Key rules:**
- Domain layer MUST NOT have external package references
- Use interfaces in Application, implement in Infrastructure
- Controllers should be thin — delegate to Application layer
- Use Dependency Injection for all services

### Frontend: Feature Driven Architecture (FDA)

```
features/
├── testimonials/           # Feature module
│   ├── components/         # Feature-specific UI
│   ├── hooks/              # TanStack Query hooks
│   ├── services/           # API calls
│   ├── schemas/            # Zod validation
│   └── types.ts            # Feature types
```

**Key rules:**
- Features are self-contained modules
- Shared components go in `components/ui/` or `components/shared/`
- Use TanStack Query for server state, Zustand for UI state only
- Validate API responses with Zod schemas

---

## Key Domain Concepts

### Testimony Types

| Type | Body | ExtendedBody | "Read More" |
|------|------|--------------|-------------|
| `Testimonial` | Required (short) | NULL | No |
| `SuccessCase` | Required (preview) | Required | Yes |

### Shadow Copy System

When a testimony is edited, the system creates a shadow copy instead of modifying the original. Admin reviews changes in a diff view before approving.

```
DRAFT → PENDING_REVIEW → PUBLISHED
              ↓              ↓ (if edited)
          REJECTED    PENDING_REVIEW (shadow copy)
```

---

## Database & Migrations

- **Database:** PostgreSQL (Supabase)
- **ORM:** Entity Framework Core
- **Connection:** Via environment variables (never commit credentials)

```bash
# Create migration after entity changes
dotnet ef migrations add Feature_EntityName_Description \
  --project cmspro/CmsPro.Infrastructure \
  --startup-project cmspro/CmsPro.API
```

---

## Environment Variables

### Backend (`cmspro/CmsPro.API/appsettings.json` or `.env`)
```
ConnectionStrings__Default=Host=...;Database=...;Username=...;Password=...
Cloudinary__CloudName=...
Cloudinary__ApiKey=...
YouTube__ApiKey=...
Jwt__Secret=...
```

### Frontend (`cmspro-web/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
```

---

## Testing Conventions

### Backend (xUnit)
```bash
dotnet test --filter "ClassName=TestimonialTests"
dotnet test --filter "MethodName=Should_Create_Testimonial"
```

### Frontend (Vitest/Jest)
```bash
npm run test -- testimonials.test.ts
npm run test -- --watch
```

---

## Important Files

| File | Purpose |
|------|---------|
| `cmspro/PLAN.md` | Backend architecture & roadmap |
| `cmspro/agent.md` | Legacy agent instructions (Spanish) |
| `cmspro-web/PLAN-FRONTEND.md` | Frontend architecture & roadmap |
| `cmspro/cmspro.slnx` | .NET solution file |
| `cmspro-web/package.json` | Frontend dependencies |

---

## Common Tasks

### Adding a new API endpoint
1. Create DTO in `CmsPro.Application/DTOs/`
2. Create interface in `CmsPro.Application/Interfaces/`
3. Implement in `CmsPro.Infrastructure/Services/`
4. Add controller in `CmsPro.API/Controllers/`
5. Register DI in `Program.cs`

### Adding a new frontend feature
1. Create folder in `src/features/<feature-name>/`
2. Add types, schemas, services, hooks, components
3. Create route in `src/app/`
4. Add navigation item in `src/config/navigation.ts`
