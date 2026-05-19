# Project Overview

> **Purpose of this file:** Product and engineering context for AI assistants (Cursor, Claude, etc.) and contributors. Read this before implementing features, reviewing UX copy, or making architectural decisions.

## What We Are Building

A **B2B SaaS web application** purpose-built for **small and medium construction contractors (MSMEs) in Indonesia**. The platform helps contractors run building projects in a more organized, efficient, and professional way—from planning and field operations to basic finance, procurement, compliance, and team collaboration.

**Positioning:** Mobile-first, easy to use, fully Indonesian language, affordable pricing, and strong WhatsApp integration.

**Working name:** Contractor Management Platform (replace with product brand when finalized).

---

## Problem Statement

Small contractors in Indonesia still rely heavily on:

- Spreadsheets (Excel)
- Manual notes and paper records
- Unstructured WhatsApp communication

This leads to recurring pain:

| Pain area  | Typical issues                                                           |
| ---------- | ------------------------------------------------------------------------ |
| Delivery   | Project delays, missed milestones                                        |
| Finance    | Cost overruns, poor cash flow visibility                                 |
| Compliance | Difficulty managing permits and regulatory documents                     |
| Market fit | Existing solutions are often too expensive or too complex for MSME scale |

---

## Solution

A single platform that replaces fragmented tools with structured workflows tuned for Indonesian small-to-mid contractors:

- **Simple** — Low learning curve; usable on mobile at the job site
- **Local** — Indonesian UI, local material/labor cost estimates by region
- **Affordable** — Freemium model with pricing appropriate for MSMEs
- **Connected** — WhatsApp for notifications and field reporting
- **Compliant** — Built-in awareness of Indonesian regulations (SBU, OSS, BPJS, tax)

---

## Target Users

| Segment                           | Description                          |
| --------------------------------- | ------------------------------------ |
| Home renovation contractors       | Small teams, residential focus       |
| Small–medium building contractors | General construction, local projects |
| Main contractors (pemborong)      | Coordinate subs and suppliers        |
| Subcontractors                    | Execute scoped work packages         |

---

## Key Differentiators

1. **Freemium pricing** — Accessible entry tier for micro/small contractors
2. **Regional cost estimation** — Material and labor pricing based on local rates per area
3. **Indonesia regulatory integration** — SBU, OSS, BPJS, tax reminders and guidance
4. **MSME-first design** — Features and complexity matched to small contractor workflows, not enterprise ERP

---

## MVP Scope (Minimum Viable Product)

Implement and prioritize features in this order unless product direction changes.

### 1. Main Dashboard

- Summary of all active projects
- Key metrics: project count, average progress, cash flow, estimated profit
- Important notifications (deadlines, payments, compliance)

### 2. Company & membership (foundation)

- Create / join companies (contractor businesses)
- Switch active company in app shell
- Invite or add members with a simple role (`owner`, `admin`, `member`, `viewer`)

### 3. Project Management

- Create and manage projects **under the active company** (name, location, contract value, dates)
- Simple Work Breakdown Structure (WBS)
- Simple Gantt chart
- Activity schedule
- Project progress tracking

### 4. Field Operations

- Daily field reports (photos + notes)
- Basic K3 (occupational health & safety) checklists
- On-site material notes

### 5. Basic Finance

- Invoice creation
- Expense recording
- Per-project cash flow dashboard
- Payment term (termin) tracking

### 6. Basic Material Procurement

- Material requirement lists
- Simple purchase requests
- Supplier directory

### 7. Compliance & Documents

- Reminders for SBU, SIUP, OSS, and related renewals
- Standard document templates
- Per-project document archive

### 8. Collaboration

- WhatsApp integration for notifications and reports
- Team visibility on project updates (scope to be defined per role)

---

## Multi-tenancy & data model

### Hierarchy

```
User ──(many-to-many)──► Company ──(one-to-many)──► Project
```

- A **user** (global account via better-auth) can belong to **multiple companies**.
- A **company** represents a contractor business entity (PT, CV, or informal team).
- A **project** always belongs to exactly **one company** (construction job site / contract).
- Users see and work in the context of a **selected company**; projects listed are scoped to that company.

### Core entities (MVP foundation)

| Entity | Purpose |
|--------|---------|
| `user` | Global identity (auth) — already exists |
| `company` | Business / organization (name, logo, address, tax id optional) |
| `company_member` | Links `user` ↔ `company`; stores **membership role** for now |
| `project` | Belongs to `company_id`; name, location, contract value, dates, status |

**Membership roles (MVP — simple enum, not full RBAC):**

| Role | Typical access |
|------|----------------|
| `owner` | Full company + billing + invite members |
| `admin` | Manage projects and members (no billing delete) |
| `member` | Work on assigned projects |
| `viewer` | Read-only (client / supervisor) |

Use a single `role` column on `company_member` until the RBAC phase below.

### Active company context

Every authenticated app request that touches company/project data must be scoped:

1. **Frontend:** store `activeCompanyId` (e.g. `useState('active-company-id')`); company switcher in app shell.
2. **Backend:** require `X-Company-Id` header or `/companies/:companyId/...` path prefix; verify `company_member` before returning data.
3. **Never** return projects from another company, even if the user is a member elsewhere.

### What to build when

| Phase | Scope |
|-------|--------|
| **Now (MVP data layer)** | `company`, `company_member`, `project` tables; CRUD; company switcher; scope all project features by `company_id` |
| **Later (RBAC)** | Custom roles per company, permission matrix, assign role ↔ permissions, enforce per endpoint |

### RBAC (planned — not MVP)

Do **not** implement a full permission engine until explicitly requested. Design tables and APIs so RBAC can be added without breaking migrations:

**Future tables (sketch):**

- `role` — per company (`company_id`, `name`, `is_system`)
- `permission` — global catalog (`resource.action`, e.g. `project.create`, `invoice.approve`)
- `role_permission` — many-to-many
- Replace or extend `company_member.role` with `company_member.role_id` → `role`

**Future behavior:**

- Company admins create roles and tick permissions.
- Assign roles to members.
- Middleware checks permission before handler runs.

Until then, use the **MVP enum role** on `company_member` and hard-code checks (e.g. only `owner`/`admin` can invite).

### Implementation rules for AI

- New domain tables that hold business data must include `company_id` (directly or via `project_id` → project).
- Queries: always filter by `company_id` from verified membership, not from client input alone.
- Invites: add users to `company_member`, not duplicate `user` rows.
- UI copy: “Company” / “Perusahaan” (not “Organization” unless user-facing English).

---

## Out of Scope for MVP (Unless Explicitly Requested)

- Full ERP / accounting system replacement
- Advanced BIM or CAD integration
- Multi-country localization (focus: Indonesia first)
- **Custom RBAC** (roles builder, permission matrix) — use enum `company_member.role` for now
- SSO, enterprise audit trails at scale

---

## Product Principles (for AI and developers)

When suggesting or writing code, align with:

1. **Mobile-first** — Field users are primary; desktop is secondary
2. **Bahasa Indonesia** — User-facing copy defaults to Indonesian; keep i18n keys structured for `@nuxtjs/i18n`
3. **Simplicity over completeness** — Prefer fewer, clearer screens over feature density
4. **WhatsApp-native habits** — Notifications and share flows should feel natural for Indonesian contractors
5. **Trust and clarity** — Money, dates, and compliance data must be unambiguous (formats, labels, confirmations)

---

## Repository & Tech Stack

This monorepo is the application foundation (currently bootstrapped from a fullstack template).

| Layer        | Stack                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| **Frontend** | Nuxt 4, Vue 3, Pinia, Tailwind CSS, shadcn-vue / Reka UI, VeeValidate + Zod, `@nuxtjs/i18n`, better-auth client |
| **Backend**  | Elysia (Bun), Drizzle ORM, PostgreSQL, Zod validation, better-auth, OpenAPI                                     |
| **Dev**      | `pnpm` (frontend), `bun` (backend), Docker Compose for Postgres + API                                           |

### Directory layout

```
/
├── frontend/     # Nuxt app (port 3092 in dev)
├── backend/      # Elysia API (port 3000)
├── PROJECT.md    # This file — product context
└── package.json  # Root scripts: dev, install:all
```

### Common commands

```bash
pnpm run install:all   # Install frontend + backend deps
pnpm run dev           # Run frontend + backend concurrently
```

See `backend/README.md` and `frontend/README.md` for environment variables and Docker setup.

---

## Domain Glossary (Indonesia)

| Term              | Meaning                                                               |
| ----------------- | --------------------------------------------------------------------- |
| **MSME**          | Micro, small, and medium enterprises                                  |
| **WBS**           | Work Breakdown Structure                                              |
| **K3**            | Keselamatan dan Kesehatan Kerja (OHS)                                 |
| **SBU**           | Sertifikat Badan Usaha (construction business certificate)            |
| **SIUP**          | Surat Izin Usaha Perdagangan (trade business license; legacy context) |
| **OSS**           | Online Single Submission (licensing system)                           |
| **BPJS**          | Social security (employment/health)                                   |
| **Termin**        | Scheduled payment installment/milestone payment                       |
| **Pemborong**     | Main contractor                                                       |
| **Subkontraktor** | Subcontractor                                                         |

---

## Guidance for AI Assistants

- **Read this file** at the start of feature work, refactors, or UX copy changes.
- **Map features to MVP sections** above; flag if a request belongs to post-MVP scope.
- **Multi-tenancy:** `company` → `project`; user via `company_member`; scope all data by active `company_id`; RBAC is later.
- **Prefer Indonesian** for UI strings; use clear, non-jargon language for contractors.
- **Respect existing patterns** in `frontend/app/` (composables, services, shadcn components) and `backend/src/`.
- **Stack skills** — `.cursor/skills/backend-bun/SKILL.md` and `.cursor/skills/frontend-nuxt/SKILL.md` for step-by-step feature workflows.
- **Do not invent** regulatory requirements—surface placeholders and link to official sources when compliance logic is unspecified.
- **Security** — Auth via better-auth; never commit secrets; use `.env.example` patterns.

---

## Document History

| Date       | Notes                                                         |
| ---------- | ------------------------------------------------------------- |
| 2026-05-19 | Initial product description (English) for AI and team context |
| 2026-05-19 | Multi-company / multi-project model; RBAC deferred to later phase |
