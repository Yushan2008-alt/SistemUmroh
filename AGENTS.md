# AGENTS.md — AI Coding Assistant Guidelines & Directives
**Repository**: Sistem Manajemen Operasional Umroh & Haji Enterprise  
**Core Framework**: Next.js 16 (App Router + Turbopack), React 19, TypeScript (Strict), Tailwind CSS v4, Supabase, Midtrans Snap

---

## 1. Architectural Directives (Non-Negotiable)

1. **Domain-Driven Modular Architecture (DDMA)**:
   - All feature business logic, components, server actions, and type contracts reside exclusively within the **4 Bounded Domain Modules** under `src/modules/`:
     - `@/modules/operations`: Packages, Airlines, Hotels, Manifests, Equipment
     - `@/modules/pilgrims`: Pilgrim Profiles, Registrations, Document Verification, Manasik
     - `@/modules/finance`: Payments, Midtrans Snap, Commissions, Bank Accounts
     - `@/modules/system`: RBAC Users, Branches, Agents, Guides, Announcements, Audit Logs, Settings, Dashboards
   - **Do NOT** create loose micro-feature folders or bring back fragmented directories.
   - When importing from another domain, **always** import through the public facade API:
     `import { PackageItem, getPackages } from '@/modules/operations'`

2. **Single-Source-of-Truth Domain Types**:
   - Every domain module has exactly one authoritative `types.ts` (e.g. `src/modules/operations/types.ts`).
   - Do NOT create fragmented `*-types.ts` files. All module types are re-exported via `index.ts`.

3. **Standardized Server Action Response**:
   - All server actions must adhere to the discriminated union pattern defined in `@/lib/action-result`:
     `ActionResult<T> = { success: true, data: T } | { success: false, error: string, code?: string }`

4. **Supabase Client Usage Rules**:
   - Client Components / Browser: Use `createClient()` from `@/lib/supabase/client`.
   - Server Components / Route Handlers: Use `await createClient()` from `@/lib/supabase/server`.
   - Privileged Server Operations / Background Actions: Use `createAdminClient()` from `@/lib/supabase/admin`.
   - **Rule**: Never import `createAdminClient` in client components or expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

5. **Laptop-Friendly & Performance Rules**:
   - Keep file watcher exclusions in `.vscode/settings.json` (`.next`, `node_modules`, `.git`, `.tempmediaStorage`).
   - Keep file count clean. Current project maintains ~78 folders (reduced from 125 legacy folders).
   - All changes must pass `npx tsc --noEmit` with 0 errors and `npm run build` with exit code 0.

---

## 2. Path Aliases Reference (tsconfig.json)

- `@/*` -> `./src/*`
- `@/modules/*` -> `./src/modules/*`
- `@/components/*` -> `./src/components/*`
- `@/lib/*` -> `./src/lib/*`
- `@/types/*` -> `./src/types/*`

---

## 3. UI & Styling Rules

- **Theme Palette**: Islamic Emerald & Gold (`#022318`, `#064e3b`, `#059669`, accents `#d97706`, `#f59e0b`).
- **Icons**: Use `lucide-react` exclusively.
- **Language**: Indonesian throughout (pertahankan bahasa Indonesia).
- **Navigation Layout**:
  - Sidebar: Top brand emblem and navigation items only (bottom logout and account footers are removed).
  - Header: Contains DemoRoleSwitcher, BranchFocusSwitcher, UserNav, and prominent Logout button.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
