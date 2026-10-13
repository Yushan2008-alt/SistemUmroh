# Architectural Blueprint & System Design
**Sistem Manajemen Operasional Umroh & Haji Enterprise**  
*Senior-Grade Domain-Driven Modular Architecture for Next.js App Router & Supabase*

---

## 1. Executive Summary & Design Philosophy

This repository is built using an **Enterprise Domain-Driven Modular Architecture (DDMA)** designed for high performance, maintainability, strict type safety, and optimal developer ergonomics.

### Core Architectural Pillars
1. **Vertical Slices within Domain Modules**: Business logic, presentation components, server actions, and type contracts are co-located within distinct domain modules (`src/modules/*`) rather than scattered across arbitrary technical buckets.
2. **Horizontal Foundation**: Shared components, utilities, and infrastructure live in clean, foundational layers (`@/components`, `@/lib`, `@/types`).
3. **Strict Single-Source Type Authority**: Each domain module maintains a consolidated, authoritative `types.ts` that is re-exported via its public facade (`index.ts`).
4. **Resilient Boundary Layers**: Full coverage of Next.js App Router boundaries (`not-found.tsx`, `error.tsx`, `loading.tsx`) ensures graceful error recovery and responsive transitions.
5. **Resource-Conscious / Laptop-Friendly**: Streamlined folder structures and configured file-watcher exclusions eliminate IDE memory bloat and CPU exhaustion.

---

## 2. Repository Layout & High-Level Topology

```
sistem-manajemen-umroh-haji/
├── .editorconfig                # Multi-editor formatting standards
├── .vscode/                     # Performance-optimized file watcher settings
├── tsconfig.json                # Strict TypeScript configuration with clean path aliases
├── ARCHITECTURE.md              # Architectural blueprint (this document)
├── src/
│   ├── app/                     # Routing & Page Composition Shell
│   │   ├── (auth)/              # Authentication & onboarding routes
│   │   ├── (dashboard)/         # Protected administrative & user portals
│   │   │   ├── loading.tsx      # Dashboard skeleton transition boundary
│   │   │   ├── error.tsx        # Dashboard-scoped error recovery boundary
│   │   │   └── ...              # 18 functional dashboard pages
│   │   ├── api/                 # Webhooks (Midtrans IPN, external endpoints)
│   │   ├── not-found.tsx        # Branded global 404 page
│   │   ├── error.tsx            # Branded global error boundary
│   │   └── layout.tsx           # Root HTML, Plus Jakarta Sans & Geist Mono fonts
│   │
│   ├── modules/                 # Bounded Domain Modules (Vertical Slices)
│   │   ├── operations/          # Travel logistics, packages, airlines, hotels, manifests
│   │   ├── pilgrims/            # Pilgrim lifecycle, registrations, documents, manasik
│   │   ├── finance/             # Payments, Midtrans Snap, commissions, bank accounts
│   │   └── system/              # RBAC users, branches, agents, guides, audit logs, settings
│   │
│   ├── components/              # Shared Reusable Presentation Elements
│   │   ├── layout/              # Sidebar, Header, MobileNav shells
│   │   └── ui/                  # Primitives (buttons, badges, modals, cards)
│   │
│   ├── lib/                     # Infrastructure & Core Utilities
│   │   ├── action-result.ts     # Standardized ActionResult<T> server response pattern
│   │   ├── activity-logger.ts   # Unified audit trail logging
│   │   ├── constants.ts         # System-wide enum maps & configuration constants
│   │   ├── midtrans.ts          # Payment gateway integration (Snap & Core API)
│   │   ├── utils.ts             # Currency formatting, cn(), date helpers
│   │   └── supabase/            # Supabase client factories (client, server, admin)
│   │
│   └── types/                   # Foundational Global Type Definitions
│       ├── database.types.ts    # Generated PostgreSQL & Supabase schema models
│       └── supabase.ts          # Client type helpers
└── public/                      # Static assets, branding, icons
```

---

## 3. The 4 Core Domain Modules

Each module in `src/modules/` represents a self-contained bounded context with a standardized public facade.

```
src/modules/<domain>/
├── index.ts                     # Public API facade (exports components, actions, types)
├── types.ts                     # Unified, authoritative domain type definitions
├── <feature>.actions.ts         # Server Actions interacting with Supabase
└── <feature>-<type>.tsx         # Specialized client/server presentation components
```

### 3.1. Operations (`@/modules/operations`)
- **Mission**: Manages all travel inventory, logistical assets, flight manifests, and equipment fulfillment.
- **Capabilities**:
  - Umroh & Haji package cataloging (pricing, quotas, departures, tiers).
  - Airline management and flight route associations.
  - Hotel inventory management (Makkah & Madinah star ratings, capacities).
  - Flight manifests, rooming lists, and passenger grouping.
  - Pilgrim equipment distribution tracking (kain ihram, mukena, koper, batik).

### 3.2. Pilgrims (`@/modules/pilgrims`)
- **Mission**: Governs the complete pilgrim journey from registration through departure.
- **Capabilities**:
  - Pilgrim profile master data (NIK, passport, mahram, medical history).
  - Package registrations, booking statuses, and package assignments.
  - Document management (passports, yellow fever, meningitis, visa checks) with inline review & verification modals.
  - Manasik training schedules, venue coordination, and QR/manual attendance tracking.

### 3.3. Finance (`@/modules/finance`)
- **Mission**: Orchestrates financial processing, payment reconciliation, and affiliate revenue.
- **Capabilities**:
  - Multi-tier payment recording (DP, installments, pelunasan).
  - Midtrans Snap payment gateway integration (virtual accounts, QRIS, e-wallets, GoPay, DANA).
  - Dynamic invoice generation and automated payment verification via Midtrans webhooks.
  - Agent commission calculations, disbursement approvals, and commission summaries.
  - Company bank accounts directory and transfer instructions.

### 3.4. System (`@/modules/system`)
- **Mission**: System administration, security governance, and multi-tenant organizational structure.
- **Capabilities**:
  - User identity management, role assignments, and password reset flows.
  - Branch office hierarchy (headquarters and regional branches).
  - Agent and partner management (referral codes, tiers).
  - Tour guides (Muthawwif) registry and tour assignments.
  - System-wide broadcast announcements with role-based audience filtering.
  - Immutable audit logs capturing operational user activities.
  - Global system settings (branding, contact details, currency defaults).

---

## 4. Role-Based Access Control (RBAC) Matrix

The system enforces role-based authorization across layouts, pages, and server actions.

| Feature / Resource | Super Admin | Admin (Cabang) | Agent (Mitra) | Pilgrim (Jamaah) | Guide (Muthawwif) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **All Branches Data** | Full (CRUD) | Branch-Scoped | None | None | None |
| **Packages & Inventory** | Full (CRUD) | Full (CRUD) | Read Only | Read Only | Read Only |
| **Pilgrim Registrations** | Full (CRUD) | Branch-Scoped | Own Referred | Self | Assigned Group |
| **Payments & Invoicing** | Full (CRUD) | Branch-Scoped | Own Referred | Pay Own | None |
| **Document Verification** | Full (CRUD) | Full (CRUD) | View Own | Upload Self | Read Only |
| **Manasik Attendance** | Full (CRUD) | Full (CRUD) | Read Only | View Self | Record Attendance |
| **Commissions Payout** | Full (CRUD) | Read Only | View Own | None | None |
| **User Administration** | Full (CRUD) | Branch Staff | None | None | None |
| **Audit Logs** | Full (Read) | None | None | None | None |

---

## 5. Data Access & Security Architecture

### 5.1. Supabase Client Strategy
To prevent security leaks while maintaining optimal execution speed, the repository uses three distinct Supabase client factories:

1. **Browser Client (`createClient()` from `@/lib/supabase/client`)**:
   - Runs on the client side with PKCE session handling.
   - Used for interactive real-time listeners and client-initiated auth state.
2. **Server Client (`createClient()` from `@/lib/supabase/server`)**:
   - Runs in Next.js Server Components, Server Actions, and Route Handlers.
   - Enforces the authenticated user's session cookies and respects database Row-Level Security (RLS).
3. **Admin Client (`createAdminClient()` from `@/lib/supabase/admin`)**:
   - Utilizes `SUPABASE_SERVICE_ROLE_KEY`.
   - Strictly reserved for privileged server operations (e.g. initial user provisioning, webhook verification, background reconciliations).
   - **Rule**: Never expose the admin client to the browser or import it in client components.

### 5.2. Server Action Contract (`ActionResult<T>`)
All Server Actions adhere to the standardized response pattern defined in `@/lib/action-result`:

```typescript
import { ActionResult, successResult, errorResult } from '@/lib/action-result'

export async function updatePackageStatus(id: number, status: string): Promise<ActionResult<{ id: number }>> {
  try {
    const supabase = await createClient()
    // Perform operation...
    return successResult({ id }, 'Paket berhasil diperbarui')
  } catch (err: any) {
    return errorResult(err.message || 'Gagal memperbarui paket')
  }
}
```

---

## 6. Developer Guidelines & Performance Best Practices

1. **Public Facade Rule**: When consuming code from another domain module, always import via the module root:
   - `import { PackageItem, createPackage } from '@/modules/operations'`
   - Avoid deep relative path traversal across modules (e.g. do NOT use `../../operations/packages.actions`).
2. **Type Single Source of Truth**: All domain types live in the module's `types.ts`. Do not create loose `*-types.ts` files.
3. **Audit Trail Logging**: Any destructive or financially consequential server action must invoke `logActivity()` from `@/lib/activity-logger`.
4. **Resilient Routing**: When introducing new dashboard routes, adhere to the established pattern:
   - Create route at `src/app/(dashboard)/<feature>/page.tsx`.
   - Maintain client components and actions inside their corresponding domain module in `src/modules/<domain>/`.
5. **Watcher Efficiency**: Keep heavy build directories (`.next`, `node_modules`, `.git`) excluded in IDE watcher configurations to prevent local machine slowdowns.
