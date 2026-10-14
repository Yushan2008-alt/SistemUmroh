# PROJECT HANDOVER & MASTER STATE
**Sistem Manajemen Operasional Umroh & Haji Enterprise**  
*Comprehensive Project State & Context Continuity Document*

---

## 1. Executive Summary

This platform is a production-grade enterprise management system for Umrah and Hajj travel agencies (PPIU & PIHK). It features an elegant Islamic-inspired public portal modeled after the official Saudi **Nusuk (nusuk.sa)** platform, and an internal operational management suite with 5 distinct role-based experiences.

- **Framework**: Next.js 16.3.6 (App Router + Turbopack)
- **Runtime**: React 19.2.8, Node.js v22+
- **Language**: TypeScript Strict Mode (0 compiler errors)
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Backend & Database**: Supabase PostgreSQL (Auth, Row Level Security, Storage, PostgREST)
- **Payment Gateway**: Midtrans Snap SDK (Virtual Accounts, QRIS, E-Wallets, GoPay, DANA)
- **Local Dev Server**: http://localhost:3000

---

## 2. Directory Structure & Architecture

```
sistem-manajemen-umroh-haji/
├── AGENTS.md                    # Universal AI agent instructions & coding standards
├── ARCHITECTURE.md              # In-depth architectural blueprint
├── PROJECT_HANDOVER.md          # Master context & continuity document (this file)
├── .editorconfig                # Multi-editor formatting standards (2 spaces, LF, UTF-8)
├── .vscode/settings.json        # File watcher exclusions for CPU/RAM optimization
├── tsconfig.json                # TypeScript aliases (@/modules/*, @/components/*, etc.)
│
├── src/
│   ├── app/                     # Next.js App Router (35 verified production routes)
│   │   ├── (auth)/              # Login, onboarding, complete profile
│   │   ├── (dashboard)/         # 18 administrative and role-specific dashboard routes
│   │   │   ├── loading.tsx      # Dashboard skeleton transition boundary
│   │   │   ├── error.tsx        # Dashboard-scoped error recovery boundary
│   │   │   └── ...              # Dashboard, packages, pilgrims, payments, manifests, etc.
│   │   ├── api/webhooks/        # Midtrans IPN webhook receiver
│   │   ├── not-found.tsx        # Global branded 404 page (Nusuk emerald aesthetic)
│   │   ├── error.tsx            # Global React error boundary with reset()
│   │   ├── layout.tsx           # Root HTML, Plus Jakarta Sans & Geist Mono fonts
│   │   └── page.tsx             # Public Landing Page (Nusuk Saudi Style)
│   │
│   ├── modules/                 # Domain-Driven Bounded Contexts (Vertical Slices)
│   │   ├── operations/          # Packages, Airlines, Hotels, Manifests, Equipment
│   │   │   ├── index.ts         # Public facade API
│   │   │   ├── types.ts         # Authoritative domain types (PackageItem, Hotel, Airline, etc.)
│   │   │   └── *.actions.ts     # Operations server actions
│   │   ├── pilgrims/            # Pilgrim profiles, Registrations, Documents, Manasik
│   │   │   ├── index.ts         # Public facade API
│   │   │   ├── types.ts         # Authoritative pilgrim domain types
│   │   │   └── *.actions.ts     # Pilgrim lifecycle server actions
│   │   ├── finance/             # Payments, Midtrans Snap, Commissions, Bank Accounts
│   │   │   ├── index.ts         # Public facade API
│   │   │   ├── types.ts         # Authoritative finance domain types
│   │   │   └── *.actions.ts     # Financial server actions
│   │   └── system/              # RBAC Users, Branches, Agents, Guides, Logs, Settings, Dashboards
│   │       ├── index.ts         # Public facade API
│   │       ├── types.ts         # Authoritative system domain types
│   │       ├── dashboard.actions.ts # Real-time Supabase fetchers for all roles
│   │       ├── staff-dashboard.tsx  # Super Admin & Admin Cabang dashboard
│   │       ├── agent-dashboard.tsx  # Agent partnership portal
│   │       ├── guide-dashboard.tsx  # Muthawwif guidance portal
│   │       └── pilgrim-dashboard.tsx# Pilgrim self-service portal
│   │
│   ├── components/              # Shared Presentation Elements
│   │   ├── layout/              # Sidebar, Header, UserNav, BranchFocusSwitcher, DemoRoleSwitcher
│   │   └── ui/                  # Buttons, Badges, Modals, Tables, Cards
│   │
│   ├── lib/                     # Infrastructure & Core Utilities
│   │   ├── action-result.ts     # ActionResult<T> discriminated union pattern
│   │   ├── activity-logger.ts   # Immutable audit trail logging
│   │   ├── midtrans.ts          # Midtrans Snap & Core API client
│   │   ├── utils.ts             # formatCurrency, formatDate, cn()
│   │   └── supabase/            # Supabase client, server, and admin factories
│   │
│   └── types/                   # Global database schema types
│       └── database.types.ts    # Generated PostgreSQL types
└── public/
    └── images/
        └── haramain-hero.jpg    # High-resolution Masjidil Haram photographic hero
```

---

## 3. Five Roles & RBAC Matrix

| Role | Target Portal | Key Capabilities |
| :--- | :--- | :--- |
| **super_admin** | Dashboard Operasional Global | Full CRUD across all branches, global financial overview, system settings, user management, audit logs, and global branch switcher. |
| **admin** | Dashboard Cabang Operasional | Branch-scoped operations, pilgrim registrations, payment verifications, and **Fast Branch Switcher** to switch between branches (Jakarta, Surabaya, Bandung, etc.). |
| **agent** | Portal Kemitraan Mitra Agen | Referral link generation (?ref=CODE), real-time commission tracking, payout requests, and referred pilgrims list. |
| **pilgrim** | Portal Perjalanan Jamaah | Self-service package selection, real-time invoice payment via Midtrans Snap, document checklist upload/verification, and manasik training schedule. |
| **guide** | Portal Bimbingan Muthawwif | Manasik session schedules, pilgrim group guidance lists, passport readiness check, and attendance recording. |

---

## 4. Current Database Schemas & Row Stats (Supabase)

Queried live from the connected Supabase instance:
- **profiles** (14 rows): User auth profiles with linked roles (super_admin, admin, agent, pilgrim, guide) and branch_id.
- **branches** (4 rows): Kantor Pusat Jakarta (HO-JKT), Cabang Surabaya (CAB-SBY), Cabang Bandung (CAB-BDG), Cabang Jawa Timur Surabaya (SBY-01).
- **packages** (3 rows): Umroh Reguler Syawal 1448H, Umroh Ramadhan Berkah I'tikaf, Haji Khusus Furoda VIP Mujamalah.
- **registrations** (3 rows): Active pilgrim registrations with booking codes (REG-*).
- **payments** (4 rows): Down payment and settlement invoices with Midtrans integration.
- **pilgrims** (5 rows): Pilgrim master records with passport, NIK, emergency contact.
- **documents** (20 rows): Passport, KTP, KK, Yellow Fever vaccine, and photo slots.
- **agents** (1 row): Affiliate partner record with commission rates.
- **guides** (1 row): Muthawwif record.
- **manasik_schedules** (1 row): Scheduled training sessions.
- **commissions** (1 row): Agent commission records.

---

## 5. Major Features Built & Verified

1. **Nusuk Saudi Style Landing Page (src/app/page.tsx)**:
   - Deep emerald and gold color palette matching the official nusuk.sa platform.
   - High-definition Masjidil Haram hero background with emerald vignette overlay.
   - Nusuk Islamic archway feature cards (rounded-t-[40px]).
   - Dynamic package catalog pulling live published packages from Supabase with graceful fallback.
   - 5 Pasti Umroh Kemenag compliance section, 4-step registration flow, and customer testimonials.
   - Fully in Indonesian (Bahasa Indonesia).

2. **Clean Layout & Navigation**:
   - Sidebar bottom footer (redundant logout & account elements) has been removed.
   - Unified header with **BranchFocusSwitcher** enabled for both Super Admin and Admin Cabang, user avatar menu, and a prominent **Keluar (Logout)** button.
   - Dynamic branch switcher fetches branches live from Supabase.

3. **100% Real-Time Dashboard (All Roles)**:
   - Zero hardcoded mockups; all metrics, charts, and tables are fed by Supabase queries via dashboard.actions.ts.
   - No "data simulasi" or "demo" disclaimers.
   - Super Admin **Okupansi Kuota Paket** bar chart is **VERTICAL (bars growing UPWARDS)**, paired with a live digital clock ticking every second (WIB) and instant refresh button.

4. **Payment Gateway (Midtrans Snap)**:
   - Interactive payment modal with automatic Snap token creation.
   - Supports BCA/Mandiri/BRI/BNI Virtual Accounts, QRIS, GoPay, DANA.
   - IPN webhook handler in src/app/api/webhooks/midtrans/route.ts.

5. **App Shell Resilience**:
   - src/app/not-found.tsx (branded global 404).
   - src/app/error.tsx (global error recovery boundary).
   - src/app/(dashboard)/loading.tsx (shimmer skeleton transition).
   - src/app/(dashboard)/error.tsx (dashboard-scoped error boundary).

---

## 6. Verification & Build Health

- **TypeScript Strict Check**: npx tsc --noEmit -> **0 errors** (Exit code 0).
- **Turbopack Production Build**: npm run build -> **35/35 routes compiled successfully** (Exit code 0).
- **E2E Browser Verification**: Browser test video recorded and saved at dashboard_realtime_verified_1791952505303.webp.
