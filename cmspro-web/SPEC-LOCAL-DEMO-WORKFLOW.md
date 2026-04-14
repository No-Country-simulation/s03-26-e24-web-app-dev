# SPEC - Local Demo Workflow (Frontend Only)

> Project: Testimonial CMS (Equipo 24)
> Scope: Frontend fallback mode while backend is unavailable
> Repository: `cmspro-web`

---

## 1) Purpose

Provide a fully navigable frontend demo using local persistence so the team can present end-to-end workflows for:

- Editor (create, edit, submit for review)
- Admin/Moderation (review queue, diff, approve/reject)
- Visitor (public published content)

This spec defines a temporary local-first architecture that stays compatible with future backend integration.

---

## 2) Goals

1. Run the app without backend dependencies.
2. Use pre-created demo accounts for role-based access.
3. Simulate key PLAN.md workflow states:
   - `Draft -> PendingReview -> Published`
   - `Rejected`
   - Shadow copy creation on edits
4. Keep code structure ready to swap local data source to backend APIs.

## 3) Non-Goals

- No production-grade auth security (demo mode only).
- No real Cloudinary/YouTube integration.
- No real external API/public embed distribution in this phase.

---

## 4) Demo Accounts

Use seeded users at first load:

| Role  | Email                 | Password |
|-------|-----------------------|----------|
| Admin | moderador@cmspro.demo | Demo123! |
| Editor| editor@cmspro.demo    | Demo123! |

Behavior:

- Login persists active session in localStorage.
- Logout clears active session.
- Role controls visible navigation and restricted routes.

---

## 5) Data Strategy (Recommended)

Implement a local data-source layer instead of direct localStorage usage in pages/components.

### 5.1 Storage Envelope

Single key with versioned payload:

- Key: `cmspro-local-db`
- Shape:

```ts
type LocalDb = {
  version: 1;
  users: User[];
  categories: Category[];
  tags: Tag[];
  testimonies: Testimony[];
  shadowCopies: TestimonyShadowCopy[];
  moderationLogs: {
    id: string;
    testimonyId: string;
    shadowCopyId?: string | null;
    moderatorId: string;
    action: "Approved" | "Rejected" | "ChangesRequested";
    comment?: string;
    createdAt: string;
  }[];
  engagement: EngagementStat[];
};
```

### 5.2 Seed Rules

- Seed only if storage is empty or version mismatch.
- Include mixed records:
  - `Draft`
  - `PendingReview`
  - `Published`
  - `Rejected`
- Include both `Testimonial` and `SuccessCase`.
- Include at least one pending shadow copy for moderation demo.

---

## 6) Domain Rules in Demo Mode

1. If `type = Testimonial`, then `extendedBody = null`.
2. If `type = SuccessCase`, then `extendedBody` is required.
3. Submitting for review creates a shadow copy and sets testimony to `PendingReview`.
4. Editing a published testimony must not overwrite live content directly:
   - Create/replace pending shadow copy.
   - Keep published original visible in public pages until approval.
5. Approve:
   - Apply shadow copy fields to testimony.
   - Set status to `Published`.
   - Archive/remove pending shadow copy.
6. Reject:
   - Discard shadow copy.
   - Keep original unchanged.
   - Status handling:
     - If new item pending first publication -> `Rejected`
     - If previously published edit -> keep `Published`

---

## 7) Roles and Access Matrix

| Section / Action                     | Admin | Editor |
|--------------------------------------|:-----:|:------:|
| Dashboard home                       |  Yes  |  Yes   |
| Testimonies page                     |  Yes  |  Yes   |
| Create testimony                     |  Yes  |  Yes   |
| Submit for review                    |  Yes  |  Yes   |
| Moderation queue                     |  Yes  |   No   |
| Moderation detail diff               |  Yes  |   No   |
| Approve / Reject                     |  Yes  |   No   |
| Analytics / settings (demo read)     |  Yes  |   No   |

Unauthorized access behavior:

- Redirect to `/dashboard` with toast message.

---

## 8) UI/Route Scope

### 8.1 Auth

- Add `/login` page with:
  - email/password form
  - quick-login buttons for seeded users

### 8.2 Dashboard Testimonies

- Use local datasource for list/create/update/submit.
- Keep modal-based create flow and spotlight behavior.

### 8.3 Moderation

- `/dashboard/moderation` pulls pending items from local datasource.
- Add `/dashboard/moderation/[id]`:
  - side-by-side original vs shadow fields
  - highlight changed fields
  - approve/reject actions

### 8.4 Public

- `/testimonials` and `/testimonials/[id]` read only published content.
- `SuccessCase` supports full detail via modal/detail page.

---

## 9) Local Service Contracts

Suggested interface layer:

```ts
authService.login(email, password)
authService.logout()
authService.getSession()

testimonyService.list(filters)
testimonyService.getById(id)
testimonyService.create(input, actor)
testimonyService.update(id, input, actor)
testimonyService.submitForReview(id, actor)

moderationService.getQueue()
moderationService.getDiff(testimonyId)
moderationService.approve(testimonyId, moderatorId, comment?)
moderationService.reject(testimonyId, moderatorId, comment?)
```

Note: Keep signatures close to future backend API methods.

---

## 10) Migration Path to Backend

When backend is restored:

1. Keep hooks/components unchanged where possible.
2. Swap local services with API services behind same interface.
3. Keep local mode as fallback using env flag:

```env
NEXT_PUBLIC_DATA_MODE=local  # local | api
```

4. Preserve normalized model mapping in service layer.

---

## 11) Acceptance Criteria

- [ ] Can login as Editor using seeded account.
- [ ] Can login as Admin using seeded account.
- [ ] Session persists after page refresh.
- [ ] Editor can create `Testimonial` and `SuccessCase`.
- [ ] Validation enforces `extendedBody` only for `SuccessCase`.
- [ ] Submit for review moves record to moderation queue.
- [ ] Admin sees pending queue.
- [ ] Admin can open diff and approve.
- [ ] Admin can open diff and reject.
- [ ] Published content visible on public pages.
- [ ] Published content remains unchanged while edit is pending review.

---

## 12) Demo Script (for presentation)

1. Login as `editor@cmspro.demo`.
2. Create a new `SuccessCase` and submit for review.
3. Show it appears as pending.
4. Logout and login as `moderador@cmspro.demo`.
5. Open moderation queue and diff.
6. Approve one case and reject another.
7. Open public testimonials page and show published-only results.

---

## 13) Notes

- This is a controlled simulation mode for team demo and workflow validation.
- Do not treat local credentials/auth as production implementation.

---

## 14) Moderation Clarifications (Apr 2026)

This section documents the agreed moderation behavior updates.

### 14.1 Rejection feedback visibility for editors

- Every rejection must include a moderation comment.
- Editors must see rejection feedback directly in dashboard testimonies.
- Add/maintain a `Rejected` section for editor follow-up.
- Feedback includes:
  - reason/comment,
  - moderation timestamp,
  - moderator identity (when available),
  - review context type.

### 14.2 Three moderation review types

The moderation queue/detail flow supports 3 review contexts:

1. `InitialSubmission`
   - first submission from a new testimony/success case,
   - no diff view,
   - moderator reviews proposed content and decides approve/reject + comment.

2. `ReworkSubmission`
   - editor corrected and resubmitted after a prior rejection,
   - moderator sees diff between last rejected snapshot and current pending snapshot.

3. `PublishedSuggestion`
   - testimony is already published and editor proposes updates,
   - moderator sees diff between live published baseline and pending suggestion,
   - if rejected, published version remains active and editor sees suggestion feedback.

### 14.3 Moderator decision rules

- Approve:
  - apply pending shadow to live testimony,
  - mark moderation action as approved,
  - keep history in moderation logs.
- Reject:
  - comment is mandatory,
  - mark shadow as rejected,
  - keep live testimony unchanged when it already had published history,
  - otherwise keep testimony as rejected for editor correction.
