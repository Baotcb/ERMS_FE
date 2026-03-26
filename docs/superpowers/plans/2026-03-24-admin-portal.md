# Admin Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete Platform Admin portal with login integration, two dashboards (action center + KPI), enterprise management (list/detail/status), payment history ledger, and system integrations console.

**Architecture:** Reuse existing `/login` flow, redirect Admin role to `/admin/dashboard`. New `src/features/admin/` feature module with dedicated sidebar, navbar, layout. New `src/app/admin/` route group. Backend needs new Admin-specific API endpoints via a new `AdminController`.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Zustand, SWR, Lucide Icons. Backend: .NET 8, MediatR CQRS, EF Core.

**Methodology: Test-Driven Development (TDD)**

Plan này được cấu trúc theo phương pháp TDD:
- **Frontend UI/UX** (sidebar, navbar, pages, components): Chỉ cung cấp **mô tả giao diện** (layout, thành phần, hành vi), không viết JSX chi tiết — để người triển khai tự code dựa trên mô tả.
- **Backend** (handlers, commands, queries): Viết test trước (xUnit + Moq + FluentAssertions) → implement handler → chạy test.

> **Lưu ý quan trọng — Reuse existing entities:**
> - **Status History:** Sử dụng `ApprovalHistory` (đã có sẵn trong DB) với `EntityType = "Enterprise"` thay vì tạo entity mới. Field `Action` encode ReasonCategory (vd: `"StatusChange:Violation"`), field `Note` lưu admin note.
> - **LockEnterpriseCommand:** Backend đã có `LockEnterpriseCommand` (toggle Active/Locked). Plan tạo `ChangeEnterpriseStatusCommand` mở rộng hỗ trợ 4 trạng thái + reason tracking. Khi triển khai: deprecate endpoint `lock-enterprise` cũ trong `EnterpriseController`, chuyển sang dùng `PUT /api/Admin/enterprise/{id}/status`.
> - **ViewPaymentHistoryEnterprise:** Đã có sẵn, hoạt động per-enterprise. Plan tạo thêm `GetGlobalPaymentHistory` — global ledger có pagination + filters, phục vụ admin portal. Không thay thế endpoint cũ.

---

## Scope Overview

This plan covers **8 subsystems** organized into **6 phases**:

| Phase | Subsystems | Tasks | Dependency |
|-------|-----------|-------|------------|
| 1 - Foundation | Login redirect, Admin layout, Sidebar, Navbar | 1–8 | None |
| 2 - Shared Components | Shared components, Admin Guard Hook, API Service | 9–9b, 10 | Phase 1 |
| 3 - Core Pages | Admin Dashboard, Manage Enterprise | 11–12 | Phase 2 |
| 4 - Enterprise Ops | Enterprise Detail, Edit Status | 13–14 | Phase 3 |
| 5 - Platform Features | Payment History, System Integrations, Platform Dashboard | 15–17 | Phase 2 |
| BE - Backend | DTOs, Controller, ApprovalHistory, MediatR Handlers | 18–21 | — |

---

## File Structure

### New Files to Create

```
src/
├── features/admin/
│   ├── types/
│   │   └── index.ts                          # All admin-related TypeScript interfaces
│   ├── api/
│   │   └── admin-service.ts                  # SWR hooks + API calls for admin
│   ├── components/
│   │   ├── admin-sidebar.tsx                 # Admin portal sidebar navigation
│   │   ├── admin-navbar.tsx                  # Admin portal top navbar
│   │   ├── admin-stat-card.tsx               # Reusable stat/KPI card
│   │   ├── admin-data-table.tsx              # Reusable data table with filters
│   │   ├── enterprise-status-badge.tsx       # Status badge component (Active/Locked/etc.)
│   │   ├── health-flag-badge.tsx             # Health flag badge (Normal/Expiring/etc.)
│   │   ├── edit-status-drawer.tsx            # Drawer for changing enterprise status
│   │   ├── connector-card.tsx                # Integration connector card
│   │   └── connector-detail-panel.tsx        # Integration detail side panel
│   ├── hooks/
│   │   └── use-admin-guard.ts               # Client-side admin role guard
│   └── constants/
│       └── index.ts                          # Admin navigation items, status configs
│
├── app/admin/
│   ├── layout.tsx                            # Admin portal layout (navbar + sidebar + main)
│   ├── dashboard/
│   │   └── page.tsx                          # Admin Dashboard (action center)
│   ├── enterprises/
│   │   ├── page.tsx                          # Suspense wrapper (server component)
│   │   ├── enterprise-list-content.tsx       # Enterprise list client component
│   │   └── [id]/
│   │       └── page.tsx                      # Enterprise Detail view
│   ├── payments/
│   │   ├── page.tsx                          # Suspense wrapper (server component)
│   │   └── payment-history-content.tsx       # Payment history client component
│   ├── integrations/
│   │   └── page.tsx                          # System Integrations console
│   └── platform/
│       └── page.tsx                          # Platform Dashboard (KPI)
```

### Existing Files to Modify

```
src/utils/constants.ts                        # Update ROLE_DASHBOARD_MAP for Admin
src/middleware.ts                             # Add /admin to protected routes + Admin-only guard
src/features/core/auth/components/login-form.tsx  # (No change needed - uses ROLE_DASHBOARD_MAP)
```

### Backend New Files (ERMS_BE_BugFix)

```
ERMS.API/Controllers/AdminController.cs       # New admin-only API controller
ERMS.Application/Features/Admin/
├── Queries/
│   ├── GetAdminDashboard/
│   │   ├── GetAdminDashboardQuery.cs
│   │   └── GetAdminDashboardQueryHandler.cs
│   ├── GetEnterpriseList/
│   │   ├── GetEnterpriseListQuery.cs
│   │   └── GetEnterpriseListQueryHandler.cs
│   ├── GetEnterpriseAdminDetail/
│   │   ├── GetEnterpriseAdminDetailQuery.cs
│   │   └── GetEnterpriseAdminDetailQueryHandler.cs
│   ├── GetGlobalPaymentHistory/
│   │   ├── GetGlobalPaymentHistoryQuery.cs
│   │   └── GetGlobalPaymentHistoryQueryHandler.cs
│   ├── GetPlatformStats/
│   │   ├── GetPlatformStatsQuery.cs
│   │   └── GetPlatformStatsQueryHandler.cs
│   └── GetSystemIntegrations/
│       ├── GetSystemIntegrationsQuery.cs
│       └── GetSystemIntegrationsQueryHandler.cs
├── Commands/
│   ├── ChangeEnterpriseStatus/
│   │   ├── ChangeEnterpriseStatusCommand.cs
│   │   └── ChangeEnterpriseStatusCommandHandler.cs
│   └── TestIntegrationConnection/
│       ├── TestConnectionCommand.cs
│       └── TestConnectionCommandHandler.cs
└── DTOs/
    └── AdminDTOs.cs                          # All admin-related DTOs
```

> **Không cần tạo entity mới:** Status history dùng `ApprovalHistory` sẵn có với `EntityType = "Enterprise"`. Không cần migration.

---

## Phase 1: Foundation (Login + Layout + Navigation)

### Task 1: Update Admin Role Redirect

**Files:**
- Modify: `src/utils/constants.ts:44` (ROLE_DASHBOARD_MAP)

- [ ] **Step 1: Update the Admin entry in ROLE_DASHBOARD_MAP**

Open `src/utils/constants.ts` and change the Admin mapping:

```typescript
// Before:
[USER_ROLES.ADMIN]: '/enterprise/hr/dashboard',

// After:
[USER_ROLES.ADMIN]: '/admin/dashboard',
```

- [ ] **Step 2: Verify no other constants need updating**

Confirm that `HR_ROLES` array still includes `USER_ROLES.ADMIN` (line 53) — this is fine for backward compatibility but Admin will now have their own portal.


---

### Task 2: Update Middleware for Admin Routes

**Files:**
- Modify: `src/middleware.ts:24-32` (PROTECTED_ROUTE_PATTERNS)
- Modify: `src/middleware.ts:185-220` (admin route guard logic)

- [ ] **Step 1: Add `/admin` to PROTECTED_ROUTE_PATTERNS**

In `src/middleware.ts`, add `/admin` to the protected patterns array:

```typescript
const PROTECTED_ROUTE_PATTERNS = [
  '/admin',      // ← ADD THIS
  '/dashboard',
  '/departments',
  '/employees',
  '/profile',
  '/security',
  '/candidate',
  '/enterprise',
  '/hr',
] as const
```

- [ ] **Step 2: Add Admin-only guard logic in middleware**

After the existing `if (pathname.startsWith('/enterprise') && ... role === USER_ROLES.CANDIDATE)` block (around line 213), add:

```typescript
// Admin portal: only Admin role can access /admin/*
if (pathname.startsWith('/admin') && authCookie && !isExpired) {
  if (role !== USER_ROLES.ADMIN) {
    const dashboard = ROLE_DASHBOARD_MAP[role || ''] || DEFAULT_ENTERPRISE_DASHBOARD
    return NextResponse.redirect(new URL(dashboard, request.url))
  }
}
```

- [ ] **Step 3: Verify middleware changes compile**

Run: `npm run build --filter=middleware` or `npx next lint src/middleware.ts`
Expected: No errors


---

### Task 3: Create Admin Types

**Files:**
- Create: `src/features/admin/types/index.ts`

- [ ] **Step 1: Create all TypeScript interfaces**

```typescript
// src/features/admin/types/index.ts

// ─── Enterprise Management ───

export type EnterpriseStatus = 'Active' | 'Suspended' | 'Locked' | 'Inactive'
export type HealthFlag = 'Normal' | 'ExpiringSoon' | 'PaymentMissing' | 'Locked' | 'PendingReview'

export interface EnterpriseListItem {
  id: string
  enterpriseName: string
  enterpriseCode: string
  contactEmail: string | null
  contactPhone: string | null
  status: EnterpriseStatus
  currentPlanName: string
  currentPlanCode: string
  subscriptionEndDate: string
  createdDate: string
  lastPaymentDate: string | null
  lastPaymentAmount: number | null
  healthFlag: HealthFlag
  employeeCount: number
  logoUrl: string | null
}

export interface EnterpriseListResponse {
  items: EnterpriseListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface EnterpriseListFilters {
  search?: string
  status?: EnterpriseStatus | ''
  planCode?: string
  healthFlag?: HealthFlag | ''
  registeredFrom?: string
  registeredTo?: string
  expiringFrom?: string
  expiringTo?: string
  pageNumber: number
  pageSize: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

// ─── Enterprise Detail ───

export interface EnterpriseAdminDetail {
  // Overview
  id: string
  enterpriseName: string
  enterpriseCode: string
  taxCode: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  logoUrl: string | null
  createdDate: string
  createdByName: string | null
  status: EnterpriseStatus

  // Subscription & Billing
  currentPlan: {
    planId: string
    planName: string
    planCode: string
    priceMonthly: number
    priceYearly: number
    maxUsers: number
    maxJobPostings: number
    maxCourses: number
  }
  subscriptionStartDate: string
  subscriptionEndDate: string
  subscriptionStatus: string
  lastPayment: {
    amount: number
    date: string
    method: string | null
  } | null
  totalSpent: number

  // Usage Snapshot
  departmentCount: number
  employeeCount: number
  jobPostingCount: number
  trainingPlanCount: number
  recruitmentPlanCount: number

  // Risk Summary
  riskFlags: string[]

  // Admin Timeline
  statusHistory: AdminStatusHistoryEntry[]
}

export interface AdminStatusHistoryEntry {
  id: string
  previousStatus: EnterpriseStatus
  newStatus: EnterpriseStatus
  reason: string
  reasonCategory: string
  adminNote: string | null
  changedByName: string
  changedAt: string
  notificationSent: boolean
}

// ─── Change Status ───

export type StatusReasonCategory =
  | 'Violation'
  | 'PaymentIssue'
  | 'InformationPending'
  | 'AdminDecision'
  | 'EnterpriseRequest'
  | 'Other'

export interface ChangeStatusRequest {
  enterpriseId: string
  newStatus: EnterpriseStatus
  reasonCategory: StatusReasonCategory
  adminNote: string
  sendNotification: boolean
}

export interface StatusImpact {
  canLogin: boolean
  publicJobsVisible: boolean
  canRenewSubscription: boolean
  canPostJobs: boolean
  description: string
}

export const STATUS_IMPACTS: Record<EnterpriseStatus, StatusImpact> = {
  Active: {
    canLogin: true,
    publicJobsVisible: true,
    canRenewSubscription: true,
    canPostJobs: true,
    description: 'Doanh nghiệp hoạt động bình thường, mọi tính năng đều khả dụng.',
  },
  Suspended: {
    canLogin: true,
    publicJobsVisible: false,
    canRenewSubscription: true,
    canPostJobs: false,
    description: 'Tạm dừng – chờ duyệt hoặc bổ sung thông tin. Đăng nhập vẫn được nhưng không đăng tuyển.',
  },
  Locked: {
    canLogin: false,
    publicJobsVisible: false,
    canRenewSubscription: false,
    canPostJobs: false,
    description: 'Bị khóa do vi phạm hoặc công nợ. Không thể đăng nhập hay sử dụng hệ thống.',
  },
  Inactive: {
    canLogin: false,
    publicJobsVisible: false,
    canRenewSubscription: false,
    canPostJobs: false,
    description: 'Ngừng hoạt động – hồ sơ đã đóng. Dữ liệu được lưu trữ nhưng không thể truy cập.',
  },
}

// ─── Payment History ───

export interface PaymentHistoryItem {
  id: string
  enterpriseId: string
  enterpriseName: string
  enterpriseCode: string
  actionType: string // Subscribe, Upgrade, Downgrade, Renew
  planName: string
  previousPlanName: string | null
  amount: number
  currency: string
  paymentMethod: string | null
  paymentReference: string | null
  periodStartDate: string
  periodEndDate: string
  note: string | null
  createdByName: string | null
  createdDate: string
}

export interface PaymentHistoryResponse {
  items: PaymentHistoryItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface PaymentHistoryFilters {
  enterpriseSearch?: string
  planCode?: string
  actionType?: string
  paymentMethod?: string
  dateFrom?: string
  dateTo?: string
  pageNumber: number
  pageSize: number
}

// ─── Admin Dashboard ───

export interface AdminDashboardData {
  // Action Summary Cards
  pendingReviewCount: number
  expiringSoonCount: number
  paymentIssueCount: number
  integrationErrorCount: number

  // Needs Attention
  needsAttention: NeedsAttentionItem[]

  // Recent Admin Actions
  recentActions: RecentAdminAction[]

  // Billing Alerts
  billingAlerts: BillingAlert[]

  // Integration Alerts
  integrationAlerts: IntegrationAlert[]
}

export interface NeedsAttentionItem {
  enterpriseId: string
  enterpriseName: string
  enterpriseCode: string
  status: EnterpriseStatus
  issue: string
  healthFlag: HealthFlag
}

export interface RecentAdminAction {
  id: string
  action: string
  targetName: string
  adminName: string
  timestamp: string
}

export interface BillingAlert {
  id: string
  enterpriseId: string
  enterpriseName: string
  alertType: 'FailedPayment' | 'MissingReference' | 'Expired' | 'ExpiringSoon'
  message: string
  date: string
}

export interface IntegrationAlert {
  connectorName: string
  status: 'Error' | 'Degraded' | 'Warning'
  message: string
  lastChecked: string
}

// ─── Platform Dashboard ───

export interface PlatformStatsData {
  // KPI Cards
  totalEnterprises: number
  activeEnterprises: number
  suspendedEnterprises: number
  lockedEnterprises: number
  inactiveEnterprises: number
  mrrCurrentMonth: number
  renewalRate: number

  // Charts
  enterpriseGrowth: ChartDataPoint[]
  revenueByMonth: ChartDataPoint[]
  subscriptionMix: { planName: string; count: number }[]
  statusDistribution: { status: string; count: number }[]

  // Integration Health
  integrationHealth: {
    healthy: number
    warning: number
    error: number
  }

  // Top Enterprises
  topEnterprises: {
    enterpriseId: string
    enterpriseName: string
    metric: string
    value: number
  }[]

  // Churn Watchlist
  churnWatchlist: {
    enterpriseId: string
    enterpriseName: string
    riskReason: string
    lastActivityDate: string
  }[]
}

export interface ChartDataPoint {
  label: string
  value: number
}

// ─── System Integrations ───

export type ConnectorCategory = 'Authentication' | 'Communication' | 'Storage' | 'Meetings' | 'AI' | 'Location'
export type ConnectorStatus = 'Healthy' | 'Warning' | 'Error' | 'Disabled'

export interface SystemConnector {
  id: string
  name: string
  category: ConnectorCategory
  status: ConnectorStatus
  lastTested: string | null
  lastFailure: string | null
  usedByFeatures: string[]
  environmentScope: string
  configSummary: Record<string, string> // key-value, secrets masked
  dependencyMap: string[]
  recentLogs: ConnectorLogEntry[]
}

export interface ConnectorLogEntry {
  timestamp: string
  level: 'Info' | 'Warning' | 'Error'
  message: string
}

export interface FeatureImpactMap {
  connectorName: string
  affectedFeatures: string[]
  impactDescription: string
}
```


---

### Task 4: Create Admin Constants & Navigation Config

**Files:**
- Create: `src/features/admin/constants/index.ts`

- [ ] **Step 1: Create admin constants file**

```typescript
// src/features/admin/constants/index.ts

import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Trung tâm xử lý công việc hằng ngày',
  },
  {
    title: 'Quản lý Doanh nghiệp',
    href: '/admin/enterprises',
    icon: Building2,
    description: 'Danh sách và quản trị tenant',
  },
  {
    title: 'Lịch sử Thanh toán',
    href: '/admin/payments',
    icon: CreditCard,
    description: 'Ledger thanh toán subscription',
  },
  {
    title: 'Tích hợp Hệ thống',
    href: '/admin/integrations',
    icon: Settings,
    description: 'Quản lý connector nền tảng',
  },
  {
    title: 'Platform Dashboard',
    href: '/admin/platform',
    icon: BarChart3,
    description: 'KPI & sức khỏe nền tảng',
  },
]

export const STATUS_REASON_CATEGORIES = [
  { value: 'Violation', label: 'Vi phạm chính sách' },
  { value: 'PaymentIssue', label: 'Vấn đề thanh toán' },
  { value: 'InformationPending', label: 'Chờ bổ sung thông tin' },
  { value: 'AdminDecision', label: 'Quyết định quản trị' },
  { value: 'EnterpriseRequest', label: 'Yêu cầu từ doanh nghiệp' },
  { value: 'Other', label: 'Khác' },
] as const

export const ENTERPRISE_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  Suspended: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  Locked: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  Inactive: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
}

export const HEALTH_FLAG_COLORS: Record<string, { bg: string; text: string }> = {
  Normal: { bg: 'bg-green-50', text: 'text-green-700' },
  ExpiringSoon: { bg: 'bg-amber-50', text: 'text-amber-700' },
  PaymentMissing: { bg: 'bg-red-50', text: 'text-red-700' },
  Locked: { bg: 'bg-red-50', text: 'text-red-700' },
  PendingReview: { bg: 'bg-blue-50', text: 'text-blue-700' },
}

export const CONNECTOR_CATEGORIES = [
  { key: 'Authentication', label: 'Xác thực', connectors: ['Google OAuth'] },
  { key: 'Communication', label: 'Giao tiếp', connectors: ['SMTP/Email'] },
  { key: 'Storage', label: 'Lưu trữ', connectors: ['Cloudinary'] },
  { key: 'Meetings', label: 'Cuộc họp', connectors: ['Zoom'] },
  { key: 'AI', label: 'AI Services', connectors: ['Gemini'] },
  { key: 'Location', label: 'Vị trí', connectors: ['Geolocation'] },
] as const
```


---

### Task 5: Create Admin Sidebar Component

**Files:**
- Create: `src/features/admin/components/admin-sidebar.tsx`

**Reference pattern:** Copy cấu trúc từ `src/features/director/components/director-sidebar.tsx`.

- [ ] **Step 1: Implement sidebar theo mô tả UI sau**

**Mô tả giao diện AdminSidebar:**
- Client component (`'use client'`), wrap bằng `memo`.
- **Header (top):** Icon `Shield` trên nền `bg-indigo-600` (rounded-lg, 32×32), bên cạnh text "Platform Admin" (semibold) + subtitle "Quản trị nền tảng" (11px, gray-400). Có border-b ngăn cách.
- **Navigation:** Render `ADMIN_NAV_ITEMS` từ constants. Mỗi item là `<Link>` với icon + title. Active state: `bg-indigo-50 text-indigo-700 shadow-sm`. Inactive: `text-gray-600 hover:bg-gray-50 hover:text-indigo-700`. Active detection: `pathname === href || pathname.startsWith(href + '/')`.
- **Desktop:** Sidebar sticky bên trái, `w-64`, ẩn/hiện theo `isSidebarOpen` từ `useAppStore`. Khi collapsed → `w-0 pointer-events-none`.
- **Mobile:** Sidebar fixed overlay trên top-14, slide-in từ trái. Có backdrop `bg-black/50` khi mở. Tự đóng khi viewport >= lg. Đảm bảo `aria-hidden` và `inert` khi đóng.
- Nhấp nav item trên mobile → tự đóng sidebar.


---

### Task 6: Create Admin Navbar Component

**Files:**
- Create: `src/features/admin/components/admin-navbar.tsx`

**Reference pattern:** Copy cấu trúc từ `src/components/layout/enterprise-navbar.tsx`.

- [ ] **Step 1: Implement navbar theo mô tả UI sau**

**Mô tả giao diện AdminNavbar:**
- Client component (`'use client'`), wrap bằng `memo`.
- Sticky top, `h-14`, border-b, bg-white, `z-30`.
- **Trái:** Nút hamburger toggle sidebar (desktop: `toggleSidebar`, mobile: `toggleMobileSidebar`). Bên cạnh logo link → `/admin/dashboard`: icon Shield trên nền indigo-600 + text "ERMS" + badge "ADMIN" (bg-indigo-100, text-indigo-700, rounded).
- **Giữa (md+):** Input search bar — placeholder "Tìm doanh nghiệp, mã DN...", icon Search bên trái. Khi nhấn Enter → navigate `/admin/enterprises?search=...` (encodeURIComponent).
- **Phải:** Tên user (`user?.fullName || 'Admin'`) + subtitle "Platform Administrator" (ẩn trên mobile). Nút logout (icon LogOut) → gọi POST `/api/auth/session/logout`, sau đó `logout()` + redirect `/login`. Fallback: `window.location.href = '/login'`.


---

### Task 7: Create Admin Layout

**Files:**
- Create: `src/app/admin/layout.tsx`

**Reference pattern:** Copy cấu trúc từ `src/app/enterprise/hr/layout.tsx`.

- [ ] **Step 1: Implement layout theo mô tả sau**

**Mô tả Admin Layout:**
- **Server component** (async) — dùng `getServerSession()` để lấy session từ cookie.
- Guard: Nếu không có `session.token` → redirect `/login`. Nếu `session.role !== USER_ROLES.ADMIN` → redirect `/login`.
- Metadata: `title: 'Platform Admin - ERMS'`, `description: 'Quản trị nền tảng ERMS'`.
- **Cấu trúc:** `<div flex flex-col min-h-screen bg-gray-50>` → `<AdminNavbar />` → `<div flex flex-1 min-h-0>` → `<AdminSidebar />` + `<main min-w-0 flex-1 overflow-y-auto p-4 md:p-5 xl:p-6>{children}</main>`.


---

### Task 8: Create Placeholder Admin Dashboard Page

**Files:**
- Create: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Implement placeholder page theo mô tả sau**

**Mô tả Placeholder Dashboard:**
- Server component (không cần `'use client'`).
- Heading: "Admin Dashboard" (2xl, bold, gray-900) + subtitle "Trung tâm xử lý công việc hằng ngày" (sm, gray-500).
- Body: Một `div` rounded-xl, border dashed gray-300, bg-white, padding 12, text center: "Dashboard content will be implemented in Phase 2".

- [ ] **Step 2: Verify full flow**

1. `npm run dev`
2. Đăng nhập tài khoản Admin → redirect `/admin/dashboard`
3. Sidebar hiển thị 5 nav items
4. Navbar hiển thị "ERMS ADMIN" branding + tên user + nút logout


---

## Phase 2: Shared Components + API Service

### Task 9: Create Shared Admin Components

**Files:**
- Create: `src/features/admin/components/admin-stat-card.tsx`
- Create: `src/features/admin/components/enterprise-status-badge.tsx`
- Create: `src/features/admin/components/health-flag-badge.tsx`

- [ ] **Step 1: Implement stat card theo mô tả sau**

**Mô tả AdminStatCard:**
- Props: `title` (string), `value` (number|string), `icon` (LucideIcon), `trend?` (string), `color?` ('blue'|'green'|'red'|'amber'|'indigo'|'gray', default: 'indigo'), `href?` (string).
- Card rounded-xl, border gray-200, bg-white, shadow-sm, p-5.
- Layout: flex justify-between. Trái: title (sm, medium, gray-500) → value (2xl, bold, gray-900) → trend nhỏ (xs, medium, dùng color tương ứng). Phải: icon trên nền color nhạt (rounded-lg, p-2.5).
- Color map 6 màu: mỗi màu có bg, icon color, badge color riêng.

- [ ] **Step 2: Implement status badge theo mô tả sau**

**Mô tả EnterpriseStatusBadge:**
- Props: `status` (EnterpriseStatus), `size?` ('sm'|'md', default: 'sm').
- Hiển thị pill badge rounded-full: dot tròn nhỏ (1.5×1.5) + label text.
- Mapping màu từ `ENTERPRISE_STATUS_COLORS` constants.
- Label tiếng Việt: Active → "Hoạt động", Suspended → "Tạm dừng", Locked → "Đã khóa", Inactive → "Ngừng HĐ".
- Size sm: `px-2 py-0.5 text-xs`. Size md: `px-3 py-1 text-sm`.

- [ ] **Step 3: Implement health flag badge theo mô tả sau**

**Mô tả HealthFlagBadge:**
- Props: `flag` (HealthFlag).
- Pill badge rounded-md, `px-2 py-0.5 text-xs font-medium`.
- Mapping màu từ `HEALTH_FLAG_COLORS` constants.
- Label tiếng Việt: Normal → "Bình thường", ExpiringSoon → "Sắp hết hạn", PaymentMissing → "Thiếu thanh toán", Locked → "Đã khóa", PendingReview → "Chờ duyệt".


---

### Task 9a: Create Admin Data Table Component

**Files:**
- Create: `src/features/admin/components/admin-data-table.tsx`

- [ ] **Step 1: Implement data table theo mô tả sau**

Shared table component cho admin portal. Available cho tất cả admin pages cần data table.

**Mô tả AdminDataTable<T> (generic):**
- Props: `columns` (array of `{key, header, className?, render(item) → ReactNode}`), `data` (T[] | undefined), `isLoading`, `emptyIcon?`, `emptyMessage?` (default: "Không có dữ liệu"), `pageNumber?`, `pageSize?`, `totalCount?`, `totalPages?`, `onPageChange?`, `keyExtractor(item) → string`.
- Container: rounded-xl, border gray-200, bg-white, shadow-sm, overflow-x-auto.
- **Thead:** border-b gray-100, bg-gray-50/50. Render column headers (px-4, py-3, font-medium, text-gray-500).
- **Tbody:** divide-y divide-gray-50. 3 trạng thái:
  - `isLoading`: Spinner (indigo) + "Đang tải..." centered, colSpan full.
  - `!data?.length`: emptyIcon (nếu có) + emptyMessage centered, colSpan full.
  - Data rows: hover:bg-gray-50/50, render từng column qua `col.render(item)`.
- **Pagination footer** (chỉ hiện khi totalPages > 1 AND onPageChange): border-t, flex justify-between. Trái: "Hiển thị X – Y / Z". Phải: nút prev/next (ghost buttons, ChevronLeft/Right) + "Trang X / Y".


---

### Task 9b: Create Admin Guard Hook

**Files:**
- Create: `src/features/admin/hooks/use-admin-guard.ts`

- [ ] **Step 1: Implement hook**

```typescript
// src/features/admin/hooks/use-admin-guard.ts

'use client'

import { useAuth } from '@/features/core/auth/hooks/use-auth'
import { USER_ROLES } from '@/utils/constants'

/**
 * Client-side admin role guard.
 * Layout handles server-side redirect; this hook provides
 * client-side role checks for conditional rendering and
 * guarding before mutation calls.
 */
export function useAdminGuard() {
  const { user, isAuthenticated } = useAuth()

  const isAdmin = isAuthenticated && user?.role === USER_ROLES.ADMIN

  /** Throws if current user is not admin — use before mutations */
  const assertAdmin = () => {
    if (!isAdmin) {
      throw new Error('Chỉ Admin mới có quyền thực hiện thao tác này.')
    }
  }

  return { isAdmin, assertAdmin, user }
}
```

---

### Task 10: Create Admin API Service

**Files:**
- Create: `src/features/admin/api/admin-service.ts`

- [ ] **Step 1: Implement API service**

Follow the pattern from `src/features/hr/hooks/use-departments.ts` — each hook defines its own inline fetcher using `apiClient`:

```typescript
// src/features/admin/api/admin-service.ts

import { useData, type Fetcher } from '@/lib/swr/hooks'
import { apiClient } from '@/lib/api-client'
import type {
  AdminDashboardData,
  EnterpriseListResponse,
  EnterpriseListFilters,
  EnterpriseAdminDetail,
  PaymentHistoryResponse,
  PaymentHistoryFilters,
  PlatformStatsData,
  SystemConnector,
  ChangeStatusRequest,
} from '../types'

// ─── Helpers ───

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  return searchParams.toString()
}

// ─── SWR Keys ───

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  enterprises: () => [...adminKeys.all, 'enterprises'] as const,
  enterpriseList: (filters: EnterpriseListFilters) => [...adminKeys.enterprises(), JSON.stringify(filters)] as const,
  enterpriseDetail: (id: string) => [...adminKeys.all, 'enterprise', id] as const,
  payments: () => [...adminKeys.all, 'payments'] as const,
  paymentList: (filters: PaymentHistoryFilters) => [...adminKeys.payments(), JSON.stringify(filters)] as const,
  platformStats: () => [...adminKeys.all, 'platform-stats'] as const,
  integrations: () => [...adminKeys.all, 'integrations'] as const,
}

// ─── Admin Dashboard ───

async function fetchDashboard(): Promise<AdminDashboardData> {
  const response = await apiClient.get('/api/Admin/dashboard')
  if (!response.ok) throw new Error('Không thể tải Admin Dashboard')
  return response.json()
}

export function useAdminDashboard() {
  return useData<AdminDashboardData>(adminKeys.dashboard().join('/'), {
    fetcher: fetchDashboard as unknown as Fetcher<AdminDashboardData>,
    refreshInterval: 60000,
  })
}

// ─── Enterprise List ───

async function fetchEnterpriseList([, , filtersString]: readonly [string, string, string]): Promise<EnterpriseListResponse> {
  const filters = JSON.parse(filtersString) as EnterpriseListFilters
  const qs = buildQueryString(filters as Record<string, unknown>)
  const response = await apiClient.get(`/api/Admin/enterprises?${qs}`)
  if (!response.ok) throw new Error('Không thể tải danh sách doanh nghiệp')
  return response.json()
}

export function useEnterpriseList(filters: EnterpriseListFilters) {
  const key = adminKeys.enterpriseList(filters)
  return useData<EnterpriseListResponse>(key, {
    fetcher: fetchEnterpriseList as unknown as Fetcher<EnterpriseListResponse>,
    keepPreviousData: true,
  })
}

// ─── Enterprise Detail ───

export function useEnterpriseAdminDetail(id: string | null) {
  const key = id ? adminKeys.enterpriseDetail(id).join('/') : null
  return useData<EnterpriseAdminDetail>(key, {
    fetcher: async () => {
      const response = await apiClient.get(`/api/Admin/enterprise/${id}`)
      if (!response.ok) throw new Error('Không thể tải chi tiết doanh nghiệp')
      return response.json()
    } as unknown as Fetcher<EnterpriseAdminDetail>,
  })
}

// ─── Change Enterprise Status (mutation) ───

export async function changeEnterpriseStatus(data: ChangeStatusRequest): Promise<void> {
  const response = await apiClient.put(
    `/api/Admin/enterprise/${data.enterpriseId}/status`,
    {
      newStatus: data.newStatus,
      reasonCategory: data.reasonCategory,
      adminNote: data.adminNote,
      sendNotification: data.sendNotification,
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Thao tác thất bại' }))
    throw new Error(err.message || 'Thao tác thất bại')
  }
}

// ─── Payment History ───

async function fetchPaymentHistory([, , filtersString]: readonly [string, string, string]): Promise<PaymentHistoryResponse> {
  const filters = JSON.parse(filtersString) as PaymentHistoryFilters
  const qs = buildQueryString(filters as Record<string, unknown>)
  const response = await apiClient.get(`/api/Admin/payment-history?${qs}`)
  if (!response.ok) throw new Error('Không thể tải lịch sử thanh toán')
  return response.json()
}

export function useGlobalPaymentHistory(filters: PaymentHistoryFilters) {
  const key = adminKeys.paymentList(filters)
  return useData<PaymentHistoryResponse>(key, {
    fetcher: fetchPaymentHistory as unknown as Fetcher<PaymentHistoryResponse>,
    keepPreviousData: true,
  })
}

// ─── Platform Stats ───

async function fetchPlatformStats(): Promise<PlatformStatsData> {
  const response = await apiClient.get('/api/Admin/platform-stats')
  if (!response.ok) throw new Error('Không thể tải platform stats')
  return response.json()
}

export function usePlatformStats() {
  return useData<PlatformStatsData>(adminKeys.platformStats().join('/'), {
    fetcher: fetchPlatformStats as unknown as Fetcher<PlatformStatsData>,
    refreshInterval: 300000,
  })
}

// ─── System Integrations ───

async function fetchIntegrations(): Promise<SystemConnector[]> {
  const response = await apiClient.get('/api/Admin/integrations')
  if (!response.ok) throw new Error('Không thể tải danh sách integrations')
  return response.json()
}

export function useSystemIntegrations() {
  return useData<SystemConnector[]>(adminKeys.integrations().join('/'), {
    fetcher: fetchIntegrations as unknown as Fetcher<SystemConnector[]>,
  })
}

export async function testIntegrationConnection(connectorId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post(`/api/Admin/integrations/${encodeURIComponent(connectorId)}/test`, {})
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Test failed' }))
    throw new Error(err.message)
  }
  return response.json()
}
```

---

## Phase 3: Core Pages (Admin Dashboard + Manage Enterprise)

### Task 11: Build Admin Dashboard Page

**Files:**
- Modify: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Implement dashboard theo mô tả UI sau**

**Mô tả giao diện Admin Dashboard:**

Client component, dùng `useAdminDashboard()` hook. Loading state: spinner indigo centered.

**1. Page Header:**
- Tiêu đề "Admin Dashboard" (2xl, bold) + subtitle "Trung tâm xử lý công việc hằng ngày".
- Phải: Link button "Tìm doanh nghiệp" (icon Search) → `/admin/enterprises`, bg-indigo-600.

**2. Action Summary Cards (grid 4 cột trên lg):**
- "Chờ duyệt" (icon Building2, blue) → `pendingReviewCount`
- "Sắp hết hạn" (icon AlertTriangle, amber) → `expiringSoonCount`
- "Thanh toán cần kiểm tra" (icon CreditCard, red) → `paymentIssueCount`
- "Integration lỗi" (icon Wifi, red) → `integrationErrorCount`

**3. Main grid (3 cột trên lg):**

*Cột trái (2 cột) — "Cần xử lý":*
- Card rounded-xl, border. Header: "Cần xử lý" + link "Xem tất cả" → `/admin/enterprises`.
- Danh sách `needsAttention` (tối đa 8 items). Mỗi item: tên DN + mã + HealthFlagBadge + EnterpriseStatusBadge + link "Chi tiết →" → `/admin/enterprises/:id`.
- Empty state: "Không có doanh nghiệp nào cần xử lý".

*Cột phải (1 cột):*
- **Thao tác nhanh:** Card bg-white. 4 link → enterprises, payments, integrations, platform. Mỗi link: label + icon ExternalLink. Hover bg-gray-50 text-indigo-700.
- **Thao tác gần đây:** Card bg-white, max-h-64 overflow-y-auto. Danh sách `recentActions` (tối đa 5). Mỗi entry: action text + adminName + timestamp (vi-VN format). Empty: "Chưa có thao tác".

**4. Bottom grid (2 cột trên lg):**
- **Cảnh báo Thanh toán:** Card list `billingAlerts` (tối đa 5). Mỗi alert: enterpriseName + message + link "Xem" → detail. Header có link "Xem tất cả" → `/admin/payments`.
- **Cảnh báo Tích hợp:** Card list `integrationAlerts`. Mỗi alert: connectorName + message + status badge (Error: red, Degraded: amber, Warning: yellow). Header có link "Xem tất cả" → `/admin/integrations`.


---

### Task 12: Build Manage Enterprise Page

**Files:**
- Create: `src/app/admin/enterprises/page.tsx` (server component — Suspense wrapper)
- Create: `src/app/admin/enterprises/enterprise-list-content.tsx` (client component)

> **Suspense boundary required:** `useSearchParams()` cần `<Suspense>` wrapper theo pattern codebase (xem `enterprise/hr/job-postings/page.tsx`). File `page.tsx` là server component, client logic nằm trong `enterprise-list-content.tsx`.

- [ ] **Step 0: Create server component wrapper with Suspense**

`page.tsx` là server component, import `EnterpriseListContent` wrapped trong `<Suspense>` với loading spinner fallback.

- [ ] **Step 1: Implement enterprise list theo mô tả UI sau**

**Mô tả giao diện EnterpriseListContent:**

Client component, dùng `useEnterpriseList(filters)` hook. Đọc `searchParams.get('search')` làm initial search value.

**1. Page Header:**
- Tiêu đề "Quản lý Doanh nghiệp" + subtitle "Danh sách và quản trị tenant trên nền tảng".

**2. Quick Filters (pill buttons):**
- 4 nút lọc nhanh: "Chờ duyệt" (healthFlag: PendingReview), "Sắp hết hạn" (healthFlag: ExpiringSoon), "Bị khóa" (status: Locked), "Không hoạt động" (status: Inactive).
- Nút "Xóa bộ lọc" reset tất cả filters.
- Style: rounded-full, border gray-200, hover border-indigo-300 bg-indigo-50 text-indigo-700.

**3. Search & Filter Bar:**
- Input search (icon Search bên trái), placeholder "Tìm theo tên hoặc mã doanh nghiệp...", Enter → trigger search.
- Nút "Lọc" (icon Filter).
- Dropdown select trạng thái: "Tất cả trạng thái" / Active / Suspended / Locked / Inactive.

**4. Data Table (8 cột):**
- Columns: Doanh nghiệp (logo/avatar + tên), Mã (mono font), Liên hệ (email), Trạng thái (EnterpriseStatusBadge), Gói hiện tại, Hết hạn (vi-VN date), Health (HealthFlagBadge), Thao tác (link "Chi tiết" → detail page).
- Logo: Nếu có `logoUrl` → `<img>` 32×32 rounded. Nếu không → div bg-gray-100 chứa chữ cái đầu.
- Empty state: icon Building2 + "Không tìm thấy doanh nghiệp nào".
- Loading state: spinner + "Đang tải...".

**5. Pagination footer:**
- "Hiển thị X - Y / Z" bên trái.
- Nút prev/next + "Trang X / Y" bên phải.
- Chỉ hiện khi totalPages > 1.


---

## Phase 4: Enterprise Operations (Detail + Status Change)

### Task 13: Build Enterprise Detail Page

**Files:**
- Create: `src/app/admin/enterprises/[id]/page.tsx`

- [ ] **Step 1: Implement enterprise detail theo mô tả UI sau**

**Mô tả giao diện EnterpriseDetailPage:**

Client component, dùng `useEnterpriseAdminDetail(id)`. Loading: spinner. Not found: text + link quay lại.

**1. Breadcrumb:** Link "← Quay lại danh sách" → `/admin/enterprises`.

**2. Header:** Flex row (responsive).
- Trái: Logo (img 56×56 rounded-xl hoặc avatar chữ cái đầu trên bg-indigo-50) + tên DN (xl, bold) + EnterpriseStatusBadge size md + subtitle (mã DN, gói, ngày hết hạn).
- Phải: Nút "Đổi trạng thái" (variant outline, mở EditStatusDrawer) + link button "Thanh toán" (icon CreditCard) → `/admin/payments?enterprise=:id`.

**3. Risk Summary (conditional):** Chỉ hiện khi `riskFlags.length > 0`. Box border-amber-200, bg-amber-50. Icon AlertTriangle + "Cảnh báo". Danh sách bullet các risk flags.

**4. Main grid (2 cột trên lg):**

*Block 1 — "Thông tin cơ bản":*
- Card rounded-xl. Definition list: Mã số thuế, Địa chỉ, Website (icon Globe), Điện thoại (icon Phone), Email (icon Mail), Ngày tạo (icon Calendar), Người tạo. Giá trị null → "—".

*Block 2 — "Subscription & Billing":*
- Card rounded-xl. Gói hiện tại, Giới hạn Users, Giới hạn Job postings, Hiệu lực (start → end), Subscription Status. Thanh toán gần nhất (amount + method), Ngày thanh toán. Border-t: Tổng chi tiêu (bold).

*Block 3 — "Mức độ sử dụng":*
- Card rounded-xl. Grid 2×2: Phòng ban (icon Briefcase), Nhân viên (icon Users), Job Postings (icon ClipboardList), Khóa đào tạo (icon BookOpen). Mỗi ô: rounded-lg bg-gray-50, icon centered + value (xl bold) + label (xs).

*Block 4 — "Lịch sử thao tác Admin":*
- Card rounded-xl, icon History trong heading. Nếu không có statusHistory → "Chưa có thao tác".
- Timeline dọc (border-left-2 gray-200, dot tròn). Mỗi entry: "previousStatus → newStatus" (sm, medium) + reasonCategory: reason (xs) + adminNote (xs, italic) + changedByName · timestamp (vi-VN).

**5. EditStatusDrawer:** Render `<EditStatusDrawer>` component, điều khiển bằng state `statusDrawerOpen`. Khi thành công → gọi `mutate()` refresh data.


---

### Task 14: Build Edit Status Drawer

**Files:**
- Create: `src/features/admin/components/edit-status-drawer.tsx`

- [ ] **Step 1: Implement status drawer theo mô tả UI sau**

**Mô tả giao diện EditStatusDrawer:**

Client component, dùng Shadcn `<Sheet>` + `<SheetContent>` (side panel, sm:max-w-lg, overflow-y-auto).

Props: `open`, `onClose`, `enterpriseId`, `enterpriseName`, `currentStatus`, `onSuccess`.
State: `newStatus`, `reasonCategory`, `adminNote`, `sendNotification` (default true), `isSubmitting`, `error`.

**Layout bên trong SheetContent:**

1. **SheetHeader:** Title "Đổi trạng thái", Description = enterpriseName.

2. **Trạng thái hiện tại:** Label + `EnterpriseStatusBadge` (size md).

3. **Trạng thái mới:** Grid 2 cột, render 3 nút (loại bỏ currentStatus). Mỗi nút: border-2, rounded-lg, p-3. Selected: border-indigo-500 bg-indigo-50. Click → setNewStatus.

4. **Impact Preview (conditional):** Chỉ hiện khi đã chọn newStatus. Box bg-indigo-50/50, border-indigo-100. Icon Info + "Tác động khi chuyển sang trạng thái này". Mô tả từ `STATUS_IMPACTS[newStatus]`. 4 dòng check/X: Đăng nhập, Public Jobs, Gia hạn, Đăng tuyển mới. Check = icon Check green, X = icon X red.

5. **Lý do:** Dropdown select từ `STATUS_REASON_CATEGORIES` constants. Placeholder "Chọn lý do...".

6. **Ghi chú:** Textarea 3 rows. Bắt buộc (*) khi newStatus là 'Locked' hoặc 'Inactive'. Nếu bắt buộc mà trống → cảnh báo amber (icon AlertTriangle).

7. **Notification toggle:** Checkbox + label "Gửi thông báo cho doanh nghiệp".

8. **Error display:** Nếu có error → box bg-red-50 text-red-700.

9. **Actions footer:** Border-t. 2 nút: "Hủy" (outline) + "Xác nhận đổi trạng thái" (bg-indigo-600). Submit gọi `changeEnterpriseStatus()`, thành công → `onSuccess()` + `onClose()` + reset form.

**Validation `canSubmit`:** newStatus && newStatus !== currentStatus && reasonCategory && (!requiresReason || adminNote.trim().length > 0).


---

## Phase 5: Platform Features (Payments, Integrations, Platform Dashboard)

### Task 15: Build Payment History Page

**Files:**
- Create: `src/app/admin/payments/page.tsx` (server component — Suspense wrapper)
- Create: `src/app/admin/payments/payment-history-content.tsx` (client component)

> **Suspense boundary required:** `useSearchParams()` cần `<Suspense>` wrapper theo pattern codebase (xem `enterprise/hr/job-postings/page.tsx`).

- [ ] **Step 1: Implement theo mô tả UI sau**

**Mô tả giao diện `page.tsx` (server component):**

Suspense wrapper, fallback = spinner indigo. Render `<PaymentHistoryContent />`.

**Mô tả giao diện `PaymentHistoryContent` (client component):**

State: `filters` (PaymentHistoryFilters) với `enterpriseSearch` (init từ `searchParams.get('enterprise')`), `pageNumber=1`, `pageSize=20`, `actionType`, `dateFrom`, `dateTo`.
Data: `useGlobalPaymentHistory(filters)`.

1. **Header:** H1 "Lịch sử Thanh toán", subtitle "Ledger thanh toán subscription toàn nền tảng".

2. **Filters row:** Flex wrap gap-3.
   - Input text "Tìm doanh nghiệp..." (max-w-xs), bind `enterpriseSearch`.
   - Select "Loại thao tác" với options: Đăng ký (Subscribe), Gia hạn (Renew), Nâng cấp (Upgrade), Hạ cấp (Downgrade).
   - 2 × Input type=date cho `dateFrom` và `dateTo` (max-w-[180px]).
   - Mọi filter change → reset `pageNumber=1`.

3. **Data table:** Rounded-xl, border, shadow-sm, overflow-x-auto.
   - **9 cột:** Doanh nghiệp (name link + code), Loại (badge gray), Gói, Gói trước (hoặc "—"), Số tiền (format vi-VN + currency), Phương thức (hoặc "—"), Thời hạn (start → end, vi-VN date), Ghi chú (truncate 150px), Ngày (vi-VN date).
   - **Loading:** colSpan=9, "Đang tải...".
   - **Empty:** colSpan=9, icon CreditCard + "Không có dữ liệu thanh toán".
   - **Row hover:** bg-gray-50/50.

4. **Pagination footer:** Chỉ hiện khi totalPages > 1. Bên trái: "{totalCount} giao dịch". Bên phải: ChevronLeft/Right buttons + "page/totalPages".


---

### Task 16: Build System Integrations Page

**Files:**
- Create: `src/features/admin/components/connector-card.tsx`
- Create: `src/features/admin/components/connector-detail-panel.tsx`
- Create: `src/app/admin/integrations/page.tsx`

- [ ] **Step 1: Implement ConnectorCard theo mô tả UI sau**

**Mô tả giao diện ConnectorCard:**

Props: `name`, `category`, `status` (ConnectorStatus), `lastTested`, `usedByFeatures`, `onClick`.

Dùng `STATUS_CONFIG` map (Healthy/Warning/Error/Disabled) → icon (Wifi/AlertTriangle/WifiOff/Power), color, bg, label.

Card button: rounded-xl, border, shadow-sm, hover:border-indigo-200 + shadow-md.
- **Top row:** Bên trái = category (uppercase xs) + name (semibold). Bên phải = icon trong bg tương ứng.
- **Middle row:** Label badge (rounded-full, bg+color theo status). Bên phải = "Test: {date vi-VN}" hoặc "Chưa test".
- **Bottom:** "Dùng bởi: {first 3 features}" + `+N` nếu > 3.

- [ ] **Step 2: Implement ConnectorDetailPanel theo mô tả UI sau**

**Mô tả giao diện ConnectorDetailPanel:**

Client component, dùng Shadcn `<Sheet>`. Props: `connector: SystemConnector | null`, `onClose`.
Sheet open khi `!!connector`. SheetContent sm:max-w-lg, overflow-y-auto.

State: `testing`, `testResult`.

1. **SheetHeader:** Description = category, Title = name.

2. **Cấu hình:** H3 "Cấu hình". DL list từ `connector.configSummary` entries. Mỗi entry: row bg-gray-50 với dt (gray-500) + dd (font-mono gray-700). Secrets đã masked từ server.

3. **Tính năng phụ thuộc:** H3 "Tính năng phụ thuộc". Flex wrap badges từ `connector.dependencyMap`, bg-indigo-50 text-indigo-700.

4. **Kiểm tra kết nối:** H3 "Kiểm tra kết nối". Button outline "Test Connection" (icon Play). Khi test → "Đang test...", disabled. Hiện "Lần cuối: {date}" nếu có lastTested. TestResult → box green-50/red-50 tùy success.

5. **Log gần đây:** H3 "Log gần đây". Max-h-48 overflow-y-auto. Mỗi log entry: dot indicator (Error=red, Warning=amber, else=green) + timestamp (vi-VN) + message. Empty → "Không có log".

- [ ] **Step 3: Implement IntegrationsPage theo mô tả UI sau**

**Mô tả giao diện IntegrationsPage:**

Client component. Data: `useSystemIntegrations()`. State: `selectedConnector`.

Tính `healthSummary` bằng `useMemo`: đếm Healthy/Warning/Error.

Loading: spinner indigo.

1. **Header:** H1 "Tích hợp Hệ thống", subtitle "Quản lý connector nền tảng".

2. **Health Summary:** Grid 3 cột `AdminStatCard`: Hoạt động (green, Wifi), Cảnh báo (amber, AlertTriangle), Lỗi (red, WifiOff).

3. **Connector Grid by Category:** Loop `CONNECTOR_CATEGORIES`. Mỗi category: H2 label + grid sm:2 lg:3 ConnectorCard. Skip category nếu không có connector.

4. **Feature Impact Map:** Card rounded-xl. Header = icon AlertTriangle amber + "Feature Impact Map". Grid sm:2 lg:3. Mỗi entry: connector name (bold), description, tags affected features (bg-gray-100, text 10px). Dữ liệu `FEATURE_IMPACT` hardcoded:
   - Google OAuth → Đăng nhập Google, Liên kết tài khoản
   - SMTP/Email → Xác minh email, Thông báo offer, Mời phỏng vấn
   - Cloudinary → Upload CV, Upload ảnh đại diện, Tài liệu đào tạo
   - Zoom → Lịch phỏng vấn, Meeting links
   - Gemini → AI screening, JD suggestions, Quiz generation
   - Geolocation → Bản đồ việc làm, Lọc theo vị trí

5. **Detail Panel:** `<ConnectorDetailPanel connector={selectedConnector} onClose={...} />`


---

### Task 17: Build Platform Dashboard Page

**Files:**
- Create: `src/app/admin/platform/page.tsx`

- [ ] **Step 1: Implement platform dashboard theo mô tả UI sau**

> **Note:** Charts sử dụng CSS progress bars (không cần thêm dependency). Nếu sau này cần biểu đồ line/bar, xem xét thêm Recharts.

**Mô tả giao diện PlatformDashboardPage:**

Client component. Data: `usePlatformStats()`. Loading: spinner indigo.

1. **Header:** H1 "Platform Dashboard", subtitle "KPI & sức khỏe tổng quan nền tảng".

2. **KPI Cards:** Grid sm:2 lg:4 `AdminStatCard`:
   - Tổng Enterprise (indigo, Building2)
   - Active (green, Users)
   - MRR tháng này (blue, DollarSign) — format vi-VN
   - Tỉ lệ gia hạn (green, RefreshCw) — hiện %

3. **Grid 2 cột (lg:grid-cols-2):**

   a. **Phân bổ trạng thái:** Card rounded-xl. Loop `statusDistribution`. Mỗi status: `EnterpriseStatusBadge` + count (pct%). Dưới: CSS progress bar h-2 rounded-full. Màu: Active=green, Suspended=yellow, Locked=red, else=gray.

   b. **Subscription Mix:** Card rounded-xl. Loop `subscriptionMix`. Mỗi plan: planName text + progress bar w-24 bg-indigo-500 + count number.

   c. **Integration Health:** Card rounded-xl. Header + link "Chi tiết →" → `/admin/integrations`. Grid 3 cột, mỗi cột: icon + số lớn + label. Healthy (green-50, Wifi), Warning (amber-50, AlertTriangle), Error (red-50, Wifi).

   d. **Top Doanh nghiệp:** Card rounded-xl. Top 5 enterprises. Mỗi entry: số thứ tự (circle bg-indigo-100) + link enterprise name → detail page + value + metric text.

4. **Churn Watchlist:** Card full-width rounded-xl. Header icon AlertTriangle amber + "Churn Watchlist". Divide-y list. Mỗi item: enterprise name link + riskReason + "Hoạt động cuối: {date vi-VN}". Empty → "Không có doanh nghiệp rủi ro".


---

## Phase BE: Backend API Endpoints

### Task 18: Create Backend Admin DTOs

**Files:**
- Create: `ERMS.Application/Features/Admin/DTOs/AdminDTOs.cs`

- [ ] **Step 1: Create all DTOs needed for admin APIs**

```csharp
// ERMS.Application/Features/Admin/DTOs/AdminDTOs.cs

using System;
using System.Collections.Generic;

namespace ERMS.Application.Features.Admin.DTOs
{
    // Enterprise List
    public class EnterpriseListItemDto
    {
        public Guid Id { get; set; }
        public string EnterpriseName { get; set; } = null!;
        public string EnterpriseCode { get; set; } = null!;
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string Status { get; set; } = null!;
        public string CurrentPlanName { get; set; } = null!;
        public string CurrentPlanCode { get; set; } = null!;
        public DateTime SubscriptionEndDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? LastPaymentDate { get; set; }
        public decimal? LastPaymentAmount { get; set; }
        public string HealthFlag { get; set; } = "Normal";
        public int EmployeeCount { get; set; }
        public string? LogoUrl { get; set; }
    }

    public class EnterpriseListResponseDto
    {
        public List<EnterpriseListItemDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    // Enterprise Detail
    public class EnterpriseAdminDetailDto
    {
        public Guid Id { get; set; }
        public string EnterpriseName { get; set; } = null!;
        public string EnterpriseCode { get; set; } = null!;
        public string? TaxCode { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? LogoUrl { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? CreatedByName { get; set; }
        public string Status { get; set; } = null!;

        public PlanSummaryDto CurrentPlan { get; set; } = null!;
        public DateTime SubscriptionStartDate { get; set; }
        public DateTime SubscriptionEndDate { get; set; }
        public string SubscriptionStatus { get; set; } = null!;
        public PaymentSummaryDto? LastPayment { get; set; }
        public decimal TotalSpent { get; set; }

        public int DepartmentCount { get; set; }
        public int EmployeeCount { get; set; }
        public int JobPostingCount { get; set; }
        public int TrainingPlanCount { get; set; }
        public int RecruitmentPlanCount { get; set; }

        public List<string> RiskFlags { get; set; } = new();
        public List<StatusHistoryEntryDto> StatusHistory { get; set; } = new();
    }

    public class PlanSummaryDto
    {
        public Guid PlanId { get; set; }
        public string PlanName { get; set; } = null!;
        public string PlanCode { get; set; } = null!;
        public decimal PriceMonthly { get; set; }
        public decimal PriceYearly { get; set; }
        public int MaxUsers { get; set; }
        public int MaxJobPostings { get; set; }
        public int MaxCourses { get; set; }
    }

    public class PaymentSummaryDto
    {
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string? Method { get; set; }
    }

    public class StatusHistoryEntryDto
    {
        public Guid Id { get; set; }
        public string PreviousStatus { get; set; } = null!;
        public string NewStatus { get; set; } = null!;
        public string Reason { get; set; } = null!;
        public string ReasonCategory { get; set; } = null!;
        public string? AdminNote { get; set; }
        public string ChangedByName { get; set; } = null!;
        public DateTime ChangedAt { get; set; }
        public bool NotificationSent { get; set; }
    }

    // Change Status
    public class ChangeEnterpriseStatusDto
    {
        public string NewStatus { get; set; } = null!;
        public string ReasonCategory { get; set; } = null!;
        public string AdminNote { get; set; } = null!;
        public bool SendNotification { get; set; }
    }

    // Admin Dashboard
    public class AdminDashboardDto
    {
        public int PendingReviewCount { get; set; }
        public int ExpiringSoonCount { get; set; }
        public int PaymentIssueCount { get; set; }
        public int IntegrationErrorCount { get; set; }
        public List<NeedsAttentionItemDto> NeedsAttention { get; set; } = new();
        public List<RecentAdminActionDto> RecentActions { get; set; } = new();
        public List<BillingAlertDto> BillingAlerts { get; set; } = new();
        public List<IntegrationAlertDto> IntegrationAlerts { get; set; } = new();
    }

    public class NeedsAttentionItemDto
    {
        public Guid EnterpriseId { get; set; }
        public string EnterpriseName { get; set; } = null!;
        public string EnterpriseCode { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string Issue { get; set; } = null!;
        public string HealthFlag { get; set; } = null!;
    }

    public class RecentAdminActionDto
    {
        public Guid Id { get; set; }
        public string Action { get; set; } = null!;
        public string TargetName { get; set; } = null!;
        public string AdminName { get; set; } = null!;
        public DateTime Timestamp { get; set; }
    }

    public class BillingAlertDto
    {
        public Guid Id { get; set; }
        public Guid EnterpriseId { get; set; }
        public string EnterpriseName { get; set; } = null!;
        public string AlertType { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime Date { get; set; }
    }

    public class IntegrationAlertDto
    {
        public string ConnectorName { get; set; } = null!;
        public string Status { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime LastChecked { get; set; }
    }

    // Payment History (Global)
    public class GlobalPaymentHistoryItemDto
    {
        public Guid Id { get; set; }
        public Guid EnterpriseId { get; set; }
        public string EnterpriseName { get; set; } = null!;
        public string EnterpriseCode { get; set; } = null!;
        public string ActionType { get; set; } = null!;
        public string PlanName { get; set; } = null!;
        public string? PreviousPlanName { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = null!;
        public string? PaymentMethod { get; set; }
        public string? PaymentReference { get; set; }
        public DateTime PeriodStartDate { get; set; }
        public DateTime PeriodEndDate { get; set; }
        public string? Note { get; set; }
        public string? CreatedByName { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class GlobalPaymentHistoryResponseDto
    {
        public List<GlobalPaymentHistoryItemDto> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    // Platform Stats
    public class PlatformStatsDto
    {
        public int TotalEnterprises { get; set; }
        public int ActiveEnterprises { get; set; }
        public int SuspendedEnterprises { get; set; }
        public int LockedEnterprises { get; set; }
        public int InactiveEnterprises { get; set; }
        public decimal MrrCurrentMonth { get; set; }
        public double RenewalRate { get; set; }
        public List<ChartDataPointDto> EnterpriseGrowth { get; set; } = new();
        public List<ChartDataPointDto> RevenueByMonth { get; set; } = new();
        public List<SubscriptionMixDto> SubscriptionMix { get; set; } = new();
        public List<StatusDistributionDto> StatusDistribution { get; set; } = new();
        public IntegrationHealthDto IntegrationHealth { get; set; } = new();
        public List<TopEnterpriseDto> TopEnterprises { get; set; } = new();
        public List<ChurnWatchlistDto> ChurnWatchlist { get; set; } = new();
    }

    public class ChartDataPointDto
    {
        public string Label { get; set; } = null!;
        public decimal Value { get; set; }
    }

    public class SubscriptionMixDto
    {
        public string PlanName { get; set; } = null!;
        public int Count { get; set; }
    }

    public class StatusDistributionDto
    {
        public string Status { get; set; } = null!;
        public int Count { get; set; }
    }

    public class IntegrationHealthDto
    {
        public int Healthy { get; set; }
        public int Warning { get; set; }
        public int Error { get; set; }
    }

    public class TopEnterpriseDto
    {
        public Guid EnterpriseId { get; set; }
        public string EnterpriseName { get; set; } = null!;
        public string Metric { get; set; } = null!;
        public int Value { get; set; }
    }

    public class ChurnWatchlistDto
    {
        public Guid EnterpriseId { get; set; }
        public string EnterpriseName { get; set; } = null!;
        public string RiskReason { get; set; } = null!;
        public DateTime LastActivityDate { get; set; }
    }
}
```


---

### Task 19: Create Backend AdminController

**Files:**
- Create: `ERMS.API.UnitTests/Controllers/AdminControllerTests.cs`
- Create: `ERMS.API/Controllers/AdminController.cs`

- [ ] **Step 1: Viết test trước (RED)**

```csharp
// ERMS.API.UnitTests/Controllers/AdminControllerTests.cs

using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;
using FluentAssertions;
using ERMS.API.Controllers;
using ERMS.Application.Features.Admin.DTOs;
using ERMS.Application.Features.Admin.Queries.GetAdminDashboard;
using ERMS.Application.Features.Admin.Queries.GetEnterpriseList;
using ERMS.Application.Features.Admin.Queries.GetEnterpriseAdminDetail;
using ERMS.Application.Features.Admin.Queries.GetGlobalPaymentHistory;
using ERMS.Application.Features.Admin.Queries.GetPlatformStats;
using ERMS.Application.Features.Admin.Queries.GetSystemIntegrations;
using ERMS.Application.Features.Admin.Commands.ChangeEnterpriseStatus;
using ERMS.Application.Features.Admin.Commands.TestIntegrationConnection;

namespace ERMS.API.UnitTests.Controllers;

[TestFixture]
public class AdminControllerTests
{
    private Mock<ISender> _senderMock;
    private AdminController _controller;

    [SetUp]
    public void Setup()
    {
        _senderMock = new Mock<ISender>();
        _controller = new AdminController(_senderMock.Object);
    }

    [Test]
    public async Task GetDashboard_ShouldReturnOk_WithDashboardData()
    {
        var expected = new AdminDashboardDto { PendingReviewCount = 3 };
        _senderMock
            .Setup(s => s.Send(It.IsAny<GetAdminDashboardQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _controller.GetDashboard();

        result.Should().BeOfType<OkObjectResult>();
        ((OkObjectResult)result).Value.Should().Be(expected);
    }

    [Test]
    public async Task GetEnterprises_ShouldCapPageSizeAt50()
    {
        _senderMock
            .Setup(s => s.Send(It.IsAny<GetEnterpriseListQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EnterpriseListResponseDto());

        await _controller.GetEnterprises(null, null, null, null, 1, 999);

        _senderMock.Verify(s => s.Send(
            It.Is<GetEnterpriseListQuery>(q => q.PageSize == 50),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Test]
    public async Task GetEnterprises_ShouldPassFiltersToQuery()
    {
        _senderMock
            .Setup(s => s.Send(It.IsAny<GetEnterpriseListQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new EnterpriseListResponseDto());

        await _controller.GetEnterprises("abc", "Active", "PRO", "ExpiringSoon", 2, 10);

        _senderMock.Verify(s => s.Send(
            It.Is<GetEnterpriseListQuery>(q =>
                q.Search == "abc" &&
                q.Status == "Active" &&
                q.PlanCode == "PRO" &&
                q.HealthFlag == "ExpiringSoon" &&
                q.PageNumber == 2 &&
                q.PageSize == 10),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Test]
    public async Task GetEnterpriseDetail_ShouldSendQueryWithCorrectId()
    {
        var id = Guid.NewGuid();
        var expected = new EnterpriseAdminDetailDto { Id = id };
        _senderMock
            .Setup(s => s.Send(It.IsAny<GetEnterpriseAdminDetailQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var result = await _controller.GetEnterpriseDetail(id);

        result.Should().BeOfType<OkObjectResult>();
        _senderMock.Verify(s => s.Send(
            It.Is<GetEnterpriseAdminDetailQuery>(q => q.EnterpriseId == id),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Test]
    public async Task ChangeStatus_ShouldMapDtoToCommand()
    {
        var id = Guid.NewGuid();
        var dto = new ChangeEnterpriseStatusDto
        {
            NewStatus = "Suspended",
            ReasonCategory = "Violation",
            AdminNote = "Test note",
            SendNotification = true
        };
        _senderMock
            .Setup(s => s.Send(It.IsAny<ChangeEnterpriseStatusCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _controller.ChangeStatus(id, dto);

        result.Should().BeOfType<OkObjectResult>();
        _senderMock.Verify(s => s.Send(
            It.Is<ChangeEnterpriseStatusCommand>(c =>
                c.EnterpriseId == id &&
                c.NewStatus == "Suspended" &&
                c.ReasonCategory == "Violation" &&
                c.AdminNote == "Test note" &&
                c.SendNotification == true),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Test]
    public async Task GetPaymentHistory_ShouldCapPageSizeAt100()
    {
        _senderMock
            .Setup(s => s.Send(It.IsAny<GetGlobalPaymentHistoryQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new GlobalPaymentHistoryResponseDto());

        await _controller.GetPaymentHistory(null, null, null, null, null, null, 1, 500);

        _senderMock.Verify(s => s.Send(
            It.Is<GetGlobalPaymentHistoryQuery>(q => q.PageSize == 100),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Test]
    public async Task TestConnection_ShouldSendCommandWithConnectorId()
    {
        _senderMock
            .Setup(s => s.Send(It.IsAny<TestConnectionCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new { success = true, message = "OK" });

        await _controller.TestConnection("google-oauth");

        _senderMock.Verify(s => s.Send(
            It.Is<TestConnectionCommand>(c => c.ConnectorId == "google-oauth"),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

```bash
# Chạy test — PHẢI FAIL (RED) vì AdminController chưa tồn tại
cd ERMS_BE_BugFix
dotnet test ERMS.API.UnitTests --filter "AdminControllerTests" --no-build 2>&1 | head -5
# Expected: Build error — AdminController not found
```

- [ ] **Step 2: Implement AdminController (GREEN)**

```csharp
// ERMS.API/Controllers/AdminController.cs

using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using ERMS.Domain.Constants.Roles;
using ERMS.Application.Features.Admin.DTOs;
using ERMS.Application.Features.Admin.Queries.GetAdminDashboard;
using ERMS.Application.Features.Admin.Queries.GetEnterpriseList;
using ERMS.Application.Features.Admin.Queries.GetEnterpriseAdminDetail;
using ERMS.Application.Features.Admin.Queries.GetGlobalPaymentHistory;
using ERMS.Application.Features.Admin.Queries.GetPlatformStats;
using ERMS.Application.Features.Admin.Queries.GetSystemIntegrations;
using ERMS.Application.Features.Admin.Commands.ChangeEnterpriseStatus;
using ERMS.Application.Features.Admin.Commands.TestIntegrationConnection;

namespace ERMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = AppRoles.Admin)]
    [EnableRateLimiting("fixed")]
    public class AdminController : ControllerBase
    {
        private readonly ISender _sender;

        public AdminController(ISender sender)
        {
            _sender = sender;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _sender.Send(new GetAdminDashboardQuery());
            return Ok(result);
        }

        [HttpGet("enterprises")]
        public async Task<IActionResult> GetEnterprises(
            [FromQuery] string? search,
            [FromQuery] string? status,
            [FromQuery] string? planCode,
            [FromQuery] string? healthFlag,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 15)
        {
            var query = new GetEnterpriseListQuery
            {
                Search = search,
                Status = status,
                PlanCode = planCode,
                HealthFlag = healthFlag,
                PageNumber = pageNumber,
                PageSize = Math.Min(pageSize, 50)
            };

            var result = await _sender.Send(query);
            return Ok(result);
        }

        [HttpGet("enterprise/{id:guid}")]
        public async Task<IActionResult> GetEnterpriseDetail(Guid id)
        {
            var result = await _sender.Send(new GetEnterpriseAdminDetailQuery { EnterpriseId = id });
            return Ok(result);
        }

        [HttpPut("enterprise/{id:guid}/status")]
        public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeEnterpriseStatusDto dto)
        {
            var command = new ChangeEnterpriseStatusCommand
            {
                EnterpriseId = id,
                NewStatus = dto.NewStatus,
                ReasonCategory = dto.ReasonCategory,
                AdminNote = dto.AdminNote,
                SendNotification = dto.SendNotification
            };

            var result = await _sender.Send(command);
            return Ok(new { message = "Đổi trạng thái thành công", result });
        }

        [HttpGet("payment-history")]
        public async Task<IActionResult> GetPaymentHistory(
            [FromQuery] string? enterpriseSearch,
            [FromQuery] string? planCode,
            [FromQuery] string? actionType,
            [FromQuery] string? paymentMethod,
            [FromQuery] DateTime? dateFrom,
            [FromQuery] DateTime? dateTo,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = new GetGlobalPaymentHistoryQuery
            {
                EnterpriseSearch = enterpriseSearch,
                PlanCode = planCode,
                ActionType = actionType,
                PaymentMethod = paymentMethod,
                DateFrom = dateFrom,
                DateTo = dateTo,
                PageNumber = pageNumber,
                PageSize = Math.Min(pageSize, 100)
            };

            var result = await _sender.Send(query);
            return Ok(result);
        }

        [HttpGet("platform-stats")]
        public async Task<IActionResult> GetPlatformStats()
        {
            var result = await _sender.Send(new GetPlatformStatsQuery());
            return Ok(result);
        }

        [HttpGet("integrations")]
        public async Task<IActionResult> GetIntegrations()
        {
            var result = await _sender.Send(new GetSystemIntegrationsQuery());
            return Ok(result);
        }

        [HttpPost("integrations/{connectorId}/test")]
        public async Task<IActionResult> TestConnection(string connectorId)
        {
            var result = await _sender.Send(new TestConnectionCommand { ConnectorId = connectorId });
            return Ok(result);
        }
    }
}
```


---

### Task 20: Reuse ApprovalHistory for Status Change Logging

> **Không tạo entity mới.** `ApprovalHistory` đã có sẵn với đúng cấu trúc cần thiết:
> `EntityType`, `EntityId`, `Action`, `PreviousStatus`, `NewStatus`, `PerformedById`, `Note`.
> DbSet `ApprovalHistories` đã tồn tại trong `IERMSDbContext` → không cần migration.

**Files:**
- Modify (backend): Handlers sẽ ghi `ApprovalHistory` records khi đổi trạng thái enterprise

- [ ] **Step 1: Mapping convention cho ApprovalHistory records**

Khi `ChangeEnterpriseStatusCommandHandler` thay đổi status enterprise, ghi một record:

```csharp
// Trong ChangeEnterpriseStatusCommandHandler.Handle():
var history = new ApprovalHistory
{
    EntityType = "Enterprise",
    EntityId = enterprise.Id,
    Action = $"StatusChange:{request.ReasonCategory}", // encode category vào Action
    PreviousStatus = enterprise.Status,
    NewStatus = request.NewStatus,
    PerformedById = currentUserId,
    Note = request.AdminNote
};
_context.ApprovalHistories.Add(history);
```

- [ ] **Step 2: Query convention cho Enterprise Detail**

Khi `GetEnterpriseAdminDetailQueryHandler` lấy status history:

```csharp
var statusHistory = await _context.ApprovalHistories
    .AsNoTracking()
    .Where(h => h.EntityType == "Enterprise" && h.EntityId == enterpriseId)
    .OrderByDescending(h => h.CreatedAt)
    .Select(h => new StatusHistoryEntryDto
    {
        Id = h.Id,
        PreviousStatus = h.PreviousStatus ?? "",
        NewStatus = h.NewStatus,
        Reason = h.Action, // contains "StatusChange:Violation" etc.
        ReasonCategory = h.Action.Contains(':') ? h.Action.Split(':')[1] : "Other",
        AdminNote = h.Note,
        ChangedByName = h.PerformedBy.FullName,
        ChangedAt = h.CreatedAt,
        NotificationSent = false // Track via Notification entity separately
    })
    .Take(20)
    .ToListAsync(cancellationToken);
```


---

### Task 21: Create MediatR Query/Command Handlers (Full Implementation)

> **Note:** All handlers follow the existing project pattern: inject `IERMSDbContext` + `ICurrentUserService`, query EF Core directly. Status history uses `ApprovalHistory` with `EntityType = "Enterprise"` (see Task 20).

**Files:**
- Create: `ERMS.UnitTests/Features/Admin/Queries/GetEnterpriseListQueryHandlerTests.cs`
- Create: `ERMS.UnitTests/Features/Admin/Commands/ChangeEnterpriseStatusCommandHandlerTests.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetEnterpriseList/GetEnterpriseListQuery.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetEnterpriseList/GetEnterpriseListQueryHandler.cs`
- Create: `ERMS.Application/Features/Admin/Commands/ChangeEnterpriseStatus/ChangeEnterpriseStatusCommand.cs`
- Create: `ERMS.Application/Features/Admin/Commands/ChangeEnterpriseStatus/ChangeEnterpriseStatusCommandHandler.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetAdminDashboard/GetAdminDashboardQuery.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetAdminDashboard/GetAdminDashboardQueryHandler.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetEnterpriseAdminDetail/GetEnterpriseAdminDetailQuery.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetEnterpriseAdminDetail/GetEnterpriseAdminDetailQueryHandler.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetGlobalPaymentHistory/GetGlobalPaymentHistoryQuery.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetGlobalPaymentHistory/GetGlobalPaymentHistoryQueryHandler.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetPlatformStats/GetPlatformStatsQuery.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetPlatformStats/GetPlatformStatsQueryHandler.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetSystemIntegrations/GetSystemIntegrationsQuery.cs`
- Create: `ERMS.Application/Features/Admin/Queries/GetSystemIntegrations/GetSystemIntegrationsQueryHandler.cs`
- Create: `ERMS.Application/Features/Admin/Commands/TestIntegrationConnection/TestConnectionCommand.cs`
- Create: `ERMS.Application/Features/Admin/Commands/TestIntegrationConnection/TestConnectionCommandHandler.cs`

---

#### Step 0: Viết test trước (RED)

> Sử dụng cùng pattern với `SubmitApplicationHandlerTests.cs`: xUnit `[Fact]`, Moq `Mock<IERMSDbContext>`, FluentAssertions, `CreateMockDbSet<T>`.

```csharp
// ERMS.UnitTests/Features/Admin/Queries/GetEnterpriseListQueryHandlerTests.cs

using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using ERMS.Application.Interface;
using ERMS.Application.Features.Admin.Queries.GetEnterpriseList;
using ERMS.Application.Features.Admin.DTOs;
using ERMS.Domain.Entities.Enterprise;
using ERMS.Domain.Entities.Subscription;
using ERMS.UnitTests.Helpers; // for CreateMockDbSet<T>

namespace ERMS.UnitTests.Features.Admin.Queries;

public class GetEnterpriseListQueryHandlerTests
{
    private readonly Mock<IERMSDbContext> _contextMock;
    private readonly GetEnterpriseListQueryHandler _handler;

    public GetEnterpriseListQueryHandlerTests()
    {
        _contextMock = new Mock<IERMSDbContext>();
        _handler = new GetEnterpriseListQueryHandler(_contextMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnPaginatedResult()
    {
        // Arrange
        var plan = new SubscriptionPlan { Id = Guid.NewGuid(), PlanName = "Pro", PlanCode = "PRO" };
        var enterprises = new List<Enterprise>
        {
            new() { Id = Guid.NewGuid(), EnterpriseName = "Công ty A", EnterpriseCode = "A001", Status = "Active", SubscriptionPlan = plan, SubscriptionEndDate = DateTime.UtcNow.AddDays(60), IsDeleted = false },
            new() { Id = Guid.NewGuid(), EnterpriseName = "Công ty B", EnterpriseCode = "B002", Status = "Suspended", SubscriptionPlan = plan, SubscriptionEndDate = DateTime.UtcNow.AddDays(10), IsDeleted = false },
        }.AsQueryable();

        var mockSet = TestHelpers.CreateMockDbSet(enterprises);
        _contextMock.Setup(c => c.Enterprises).Returns(mockSet.Object);
        _contextMock.Setup(c => c.Employees).Returns(TestHelpers.CreateMockDbSet(new List<Employee>().AsQueryable()).Object);

        var query = new GetEnterpriseListQuery { PageNumber = 1, PageSize = 10 };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.PageNumber.Should().Be(1);
    }

    [Fact]
    public async Task Handle_ShouldFilterBySearch_CaseInsensitive()
    {
        // Arrange — setup enterprises with 3 items, search should match only 1
        var plan = new SubscriptionPlan { Id = Guid.NewGuid(), PlanName = "Basic", PlanCode = "BASIC" };
        var enterprises = new List<Enterprise>
        {
            new() { Id = Guid.NewGuid(), EnterpriseName = "TechCorp", EnterpriseCode = "TC01", Status = "Active", SubscriptionPlan = plan, SubscriptionEndDate = DateTime.UtcNow.AddDays(60), IsDeleted = false },
            new() { Id = Guid.NewGuid(), EnterpriseName = "HealthCare Ltd", EnterpriseCode = "HC01", Status = "Active", SubscriptionPlan = plan, SubscriptionEndDate = DateTime.UtcNow.AddDays(60), IsDeleted = false },
        }.AsQueryable();

        var mockSet = TestHelpers.CreateMockDbSet(enterprises);
        _contextMock.Setup(c => c.Enterprises).Returns(mockSet.Object);
        _contextMock.Setup(c => c.Employees).Returns(TestHelpers.CreateMockDbSet(new List<Employee>().AsQueryable()).Object);

        var query = new GetEnterpriseListQuery { Search = "tech", PageNumber = 1, PageSize = 10 };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items[0].EnterpriseName.Should().Be("TechCorp");
    }

    [Fact]
    public async Task Handle_ShouldFilterByStatus()
    {
        var plan = new SubscriptionPlan { Id = Guid.NewGuid(), PlanName = "Pro", PlanCode = "PRO" };
        var enterprises = new List<Enterprise>
        {
            new() { Id = Guid.NewGuid(), EnterpriseName = "A", EnterpriseCode = "A01", Status = "Active", SubscriptionPlan = plan, SubscriptionEndDate = DateTime.UtcNow.AddDays(60), IsDeleted = false },
            new() { Id = Guid.NewGuid(), EnterpriseName = "B", EnterpriseCode = "B01", Status = "Suspended", SubscriptionPlan = plan, SubscriptionEndDate = DateTime.UtcNow.AddDays(60), IsDeleted = false },
        }.AsQueryable();

        var mockSet = TestHelpers.CreateMockDbSet(enterprises);
        _contextMock.Setup(c => c.Enterprises).Returns(mockSet.Object);
        _contextMock.Setup(c => c.Employees).Returns(TestHelpers.CreateMockDbSet(new List<Employee>().AsQueryable()).Object);

        var query = new GetEnterpriseListQuery { Status = "Suspended", PageNumber = 1, PageSize = 10 };

        var result = await _handler.Handle(query, CancellationToken.None);

        result.Items.Should().HaveCount(1);
        result.Items[0].Status.Should().Be("Suspended");
    }

    [Fact]
    public async Task Handle_ShouldExcludeDeletedEnterprises()
    {
        var plan = new SubscriptionPlan { Id = Guid.NewGuid(), PlanName = "Pro", PlanCode = "PRO" };
        var enterprises = new List<Enterprise>
        {
            new() { Id = Guid.NewGuid(), EnterpriseName = "Active", EnterpriseCode = "A01", Status = "Active", SubscriptionPlan = plan, SubscriptionEndDate = DateTime.UtcNow.AddDays(60), IsDeleted = false },
            new() { Id = Guid.NewGuid(), EnterpriseName = "Deleted", EnterpriseCode = "D01", Status = "Active", SubscriptionPlan = plan, SubscriptionEndDate = DateTime.UtcNow.AddDays(60), IsDeleted = true },
        }.AsQueryable();

        var mockSet = TestHelpers.CreateMockDbSet(enterprises);
        _contextMock.Setup(c => c.Enterprises).Returns(mockSet.Object);
        _contextMock.Setup(c => c.Employees).Returns(TestHelpers.CreateMockDbSet(new List<Employee>().AsQueryable()).Object);

        var query = new GetEnterpriseListQuery { PageNumber = 1, PageSize = 10 };

        var result = await _handler.Handle(query, CancellationToken.None);

        result.Items.Should().HaveCount(1);
        result.Items[0].EnterpriseName.Should().Be("Active");
    }
}
```

```csharp
// ERMS.UnitTests/Features/Admin/Commands/ChangeEnterpriseStatusCommandHandlerTests.cs

using Xunit;
using Moq;
using FluentAssertions;
using ERMS.Application.Interface;
using ERMS.Application.Features.Admin.Commands.ChangeEnterpriseStatus;
using ERMS.Domain.Constants.Roles;
using ERMS.Domain.Entities.Enterprise;
using ERMS.Domain.Entities.Recruitment;
using ERMS.UnitTests.Helpers;

namespace ERMS.UnitTests.Features.Admin.Commands;

public class ChangeEnterpriseStatusCommandHandlerTests
{
    private readonly Mock<IERMSDbContext> _contextMock;
    private readonly Mock<ICurrentUserService> _currentUserMock;
    private readonly ChangeEnterpriseStatusCommandHandler _handler;
    private readonly Guid _adminUserId = Guid.NewGuid();

    public ChangeEnterpriseStatusCommandHandlerTests()
    {
        _contextMock = new Mock<IERMSDbContext>();
        _currentUserMock = new Mock<ICurrentUserService>();
        _handler = new ChangeEnterpriseStatusCommandHandler(_contextMock.Object, _currentUserMock.Object);

        // Default: authenticated Admin
        _currentUserMock.Setup(u => u.UserId).Returns(_adminUserId);
        _currentUserMock.Setup(u => u.Roles).Returns(new[] { AppRoles.Admin });
    }

    [Fact]
    public async Task Handle_ShouldUpdateStatusAndLogHistory()
    {
        // Arrange
        var enterpriseId = Guid.NewGuid();
        var enterprise = new Enterprise { Id = enterpriseId, Status = "Active", EnterpriseName = "Test" };

        _contextMock.Setup(c => c.Enterprises.FindAsync(enterpriseId))
            .ReturnsAsync(enterprise);

        var histories = new List<ApprovalHistory>();
        var historyMock = TestHelpers.CreateMockDbSet(histories.AsQueryable());
        historyMock.Setup(d => d.Add(It.IsAny<ApprovalHistory>()))
            .Callback<ApprovalHistory>(h => histories.Add(h));
        _contextMock.Setup(c => c.ApprovalHistories).Returns(historyMock.Object);
        _contextMock.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        var command = new ChangeEnterpriseStatusCommand
        {
            EnterpriseId = enterpriseId,
            NewStatus = "Suspended",
            ReasonCategory = "Violation",
            AdminNote = "Policy breach",
            SendNotification = true
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        enterprise.Status.Should().Be("Suspended");
        histories.Should().HaveCount(1);
        histories[0].PreviousStatus.Should().Be("Active");
        histories[0].NewStatus.Should().Be("Suspended");
        histories[0].Action.Should().Contain("Violation");
        _contextMock.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrow_WhenUserIsNotAdmin()
    {
        _currentUserMock.Setup(u => u.Roles).Returns(new[] { AppRoles.HRManager });

        var command = new ChangeEnterpriseStatusCommand
        {
            EnterpriseId = Guid.NewGuid(),
            NewStatus = "Suspended",
            ReasonCategory = "Violation",
            AdminNote = "Test"
        };

        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_ShouldThrow_WhenEnterpriseNotFound()
    {
        var command = new ChangeEnterpriseStatusCommand
        {
            EnterpriseId = Guid.NewGuid(),
            NewStatus = "Locked",
            ReasonCategory = "PaymentOverdue",
            AdminNote = "Test"
        };

        _contextMock.Setup(c => c.Enterprises.FindAsync(command.EnterpriseId))
            .ReturnsAsync((Enterprise?)null);

        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task Handle_ShouldThrow_WhenNewStatusSameAsCurrent()
    {
        var enterpriseId = Guid.NewGuid();
        var enterprise = new Enterprise { Id = enterpriseId, Status = "Active" };

        _contextMock.Setup(c => c.Enterprises.FindAsync(enterpriseId))
            .ReturnsAsync(enterprise);

        var command = new ChangeEnterpriseStatusCommand
        {
            EnterpriseId = enterpriseId,
            NewStatus = "Active",
            ReasonCategory = "Other",
            AdminNote = "Test"
        };

        var act = async () => await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
```

```bash
# Chạy test — PHẢI FAIL (RED) vì handlers chưa tồn tại
cd ERMS_BE_BugFix
dotnet test ERMS.UnitTests --filter "GetEnterpriseListQueryHandlerTests|ChangeEnterpriseStatusCommandHandlerTests" --no-build 2>&1 | head -5
# Expected: Build error — handlers not found
```

#### Step 1: Implement GetEnterpriseListQuery + Handler (GREEN)

```csharp
// GetEnterpriseListQuery.cs
using MediatR;
using ERMS.Application.Features.Admin.DTOs;

namespace ERMS.Application.Features.Admin.Queries.GetEnterpriseList
{
    public class GetEnterpriseListQuery : IRequest<EnterpriseListResponseDto>
    {
        public string? Search { get; set; }
        public string? Status { get; set; }
        public string? PlanCode { get; set; }
        public string? HealthFlag { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 15;
    }
}
```

```csharp
// GetEnterpriseListQueryHandler.cs
using MediatR;
using Microsoft.EntityFrameworkCore;
using ERMS.Application.Interface;
using ERMS.Application.Features.Admin.DTOs;

namespace ERMS.Application.Features.Admin.Queries.GetEnterpriseList
{
    public class GetEnterpriseListQueryHandler : IRequestHandler<GetEnterpriseListQuery, EnterpriseListResponseDto>
    {
        private readonly IERMSDbContext _context;

        public GetEnterpriseListQueryHandler(IERMSDbContext context)
        {
            _context = context;
        }

        public async Task<EnterpriseListResponseDto> Handle(GetEnterpriseListQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Enterprises
                .AsNoTracking()
                .Where(e => !e.IsDeleted)
                .Include(e => e.SubscriptionPlan)
                .Include(e => e.CreatedBy)
                .AsQueryable();

            // Search filter
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.Trim().ToLower();
                query = query.Where(e =>
                    e.EnterpriseName.ToLower().Contains(search) ||
                    e.EnterpriseCode.ToLower().Contains(search));
            }

            // Status filter
            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                query = query.Where(e => e.Status == request.Status);
            }

            // Plan filter
            if (!string.IsNullOrWhiteSpace(request.PlanCode))
            {
                query = query.Where(e => e.SubscriptionPlan.PlanCode == request.PlanCode);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(e => e.CreatedAt)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(e => new EnterpriseListItemDto
                {
                    Id = e.Id,
                    EnterpriseName = e.EnterpriseName,
                    EnterpriseCode = e.EnterpriseCode,
                    ContactEmail = e.Email,
                    ContactPhone = e.Phone,
                    Status = e.Status,
                    CurrentPlanName = e.SubscriptionPlan.PlanName,
                    CurrentPlanCode = e.SubscriptionPlan.PlanCode,
                    SubscriptionEndDate = e.SubscriptionEndDate,
                    CreatedDate = e.CreatedAt,
                    EmployeeCount = _context.Employees.Count(emp => emp.EnterpriseId == e.Id),
                    LogoUrl = e.LogoUrl,
                    HealthFlag = e.Status == "Locked" ? "Locked"
                        : e.Status == "Suspended" ? "PendingReview"
                        : e.SubscriptionEndDate <= DateTime.UtcNow.AddDays(30) ? "ExpiringSoon"
                        : "Normal"
                })
                .ToListAsync(cancellationToken);

            // Apply HealthFlag filter in-memory (computed field)
            if (!string.IsNullOrWhiteSpace(request.HealthFlag))
            {
                items = items.Where(i => i.HealthFlag == request.HealthFlag).ToList();
            }

            return new EnterpriseListResponseDto
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize)
            };
        }
    }
}
```

---

#### Step 2: Implement ChangeEnterpriseStatusCommand + Handler (GREEN)

```csharp
// ChangeEnterpriseStatusCommand.cs
using MediatR;

namespace ERMS.Application.Features.Admin.Commands.ChangeEnterpriseStatus
{
    public class ChangeEnterpriseStatusCommand : IRequest<bool>
    {
        public Guid EnterpriseId { get; set; }
        public string NewStatus { get; set; } = null!;
        public string ReasonCategory { get; set; } = null!;
        public string AdminNote { get; set; } = null!;
        public bool SendNotification { get; set; }
    }
}
```

```csharp
// ChangeEnterpriseStatusCommandHandler.cs
using MediatR;
using ERMS.Application.Interface;
using ERMS.Domain.Constants.Enterprise;
using ERMS.Domain.Constants.Roles;
using ERMS.Domain.Entities.Recruitment;

namespace ERMS.Application.Features.Admin.Commands.ChangeEnterpriseStatus
{
    public class ChangeEnterpriseStatusCommandHandler : IRequestHandler<ChangeEnterpriseStatusCommand, bool>
    {
        private readonly IERMSDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ChangeEnterpriseStatusCommandHandler(IERMSDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<bool> Handle(ChangeEnterpriseStatusCommand request, CancellationToken cancellationToken)
        {
            // Auth check
            var userId = _currentUserService.UserId
                ?? throw new UnauthorizedAccessException("Không tìm thấy thông tin người dùng.");
            if (!_currentUserService.Roles.Contains(AppRoles.Admin))
                throw new UnauthorizedAccessException("Chỉ Admin mới có quyền thay đổi trạng thái doanh nghiệp.");

            // Validate status
            if (!EnterpriseStatus.IsValid(request.NewStatus))
                throw new ArgumentException($"Trạng thái '{request.NewStatus}' không hợp lệ.");

            // Find enterprise
            var enterprise = await _context.Enterprises.FindAsync(request.EnterpriseId)
                ?? throw new KeyNotFoundException($"Không tìm thấy doanh nghiệp với ID {request.EnterpriseId}.");

            if (enterprise.Status == request.NewStatus)
                throw new InvalidOperationException("Trạng thái mới trùng với trạng thái hiện tại.");

            // Log to ApprovalHistory (reuse existing entity)
            var history = new ApprovalHistory
            {
                EntityType = "Enterprise",
                EntityId = enterprise.Id,
                Action = $"StatusChange:{request.ReasonCategory}",
                PreviousStatus = enterprise.Status,
                NewStatus = request.NewStatus,
                PerformedById = userId,
                Note = request.AdminNote
            };
            _context.ApprovalHistories.Add(history);

            // Update status
            enterprise.Status = request.NewStatus;
            _context.Enterprises.Update(enterprise);

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
```

---

#### Step 3: Implement remaining Query/Command types (GREEN)

Follow the same pattern above for each handler. Key implementation notes:

**GetAdminDashboardQueryHandler:**
```csharp
// Query counts from Enterprises table
PendingReviewCount = await _context.Enterprises.CountAsync(e => !e.IsDeleted && e.Status == EnterpriseStatus.Suspended);
ExpiringSoonCount = await _context.Enterprises.CountAsync(e => !e.IsDeleted && e.Status == EnterpriseStatus.Active && e.SubscriptionEndDate <= DateTime.UtcNow.AddDays(30));
// NeedsAttention: composite query of Suspended + Locked + ExpiringSoon enterprises
// RecentActions: query ApprovalHistories where EntityType == "Enterprise", OrderByDescending CreatedAt, Take(10)
```

**GetEnterpriseAdminDetailQueryHandler:**
```csharp
// Single enterprise with Include(SubscriptionPlan), Include(CreatedBy)
// Counts: Departments, Employees (by EnterpriseId), JobPostings (via Departments → employees → ???), TrainingPlans
// StatusHistory: ApprovalHistories.Where(h => h.EntityType == "Enterprise" && h.EntityId == id)
// RiskFlags: computed list based on SubscriptionEndDate, Status, missing PaymentReference
// TotalSpent: SubscriptionHistories.Where(sh => sh.EnterpriseId == id).Sum(sh => sh.Amount)
```

**GetGlobalPaymentHistoryQueryHandler:**
```csharp
// Query _context.SubscriptionHistories across ALL enterprises (not filtered by single EnterpriseId like existing ViewPaymentHistoryEnterprise)
// Include Enterprise (for name/code), SubscriptionPlan, PreviousPlan
// Apply filters: enterpriseSearch (name/code), planCode, actionType, paymentMethod, dateFrom, dateTo
// Paginate with PageNumber/PageSize
```

**GetPlatformStatsQueryHandler:**
```csharp
// Aggregate queries:
// - Count by status using GroupBy
// - MRR: SubscriptionHistories this month sum of Amount
// - RenewalRate: count of "Renew" actions / total enterprises with expired subscriptions
// - SubscriptionMix: GroupBy SubscriptionPlanId → PlanName + count
// - TopEnterprises: by EmployeeCount
// - ChurnWatchlist: Active enterprises with SubscriptionEndDate < 15 days and no recent SubscriptionHistory
```

**GetSystemIntegrationsQuery + TestConnectionCommand:**
```csharp
// These return hardcoded connector config since integrations (Google OAuth, SMTP, Cloudinary, Zoom, Gemini, Geolocation)
// are configured via appsettings.json, not stored in DB.
// Handler reads IConfiguration to build SystemConnector[] with masked secrets.
// TestConnectionCommand: performs actual health check (e.g., SMTP ping, Cloudinary API call) and returns result.
```

- [ ] **Step 4: Xác nhận tests PASS (GREEN)**

```bash
cd ERMS_BE_BugFix
dotnet test ERMS.UnitTests --filter "GetEnterpriseListQueryHandlerTests|ChangeEnterpriseStatusCommandHandlerTests" --verbosity normal
# Expected: All 8 tests pass
```


---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|-----------------|
| 1 | Tasks 1–8 | Login redirect, layout, sidebar, navbar — admin can log in and see their portal |
| 2 | Tasks 9–9b, 10 | Shared components (stat card, badges, data table, guard hook), API service |
| 3 | Tasks 11–12 | Admin Dashboard + Manage Enterprise list — daily workbench operational |
| 4 | Tasks 13–14 | Enterprise Detail + Status Change — 360° tenant view with controlled actions |
| 5 | Tasks 15–17 | Payment History + Integrations + Platform KPI — full platform admin capability |
| BE | Tasks 18–21 | Backend APIs — DTOs, Controller, ApprovalHistory reuse, MediatR handlers — **có TDD tests** |

**TDD approach:**
- **FE UI** (pages, components): Chỉ mô tả giao diện, không viết code JSX trong plan
- **BE handlers**: Viết xUnit test trước (RED) → Implement handler (GREEN) → Verify all pass

**Key design decisions:**
- Admin portal uses **indigo** color scheme vs enterprise blue (`#0F4C75`) to visually differentiate
- Reuses existing auth flow — no separate login page, just route redirect
- Follows existing pattern: feature module → layout → sidebar → pages
- **Reuses `ApprovalHistory`** for status change tracking — no new entity or migration needed
- **Deprecates `LockEnterpriseCommand`** — replaced by `ChangeEnterpriseStatusCommand` (4 statuses + reason)
- **No `jsonFetcher`** — each SWR hook has its own inline fetcher following `use-departments.ts` pattern
- **SWR keys** follow codebase convention: `adminKeys.all → .enterprises() → .enterpriseList(filters)`
- Status change via **Shadcn Sheet** (not raw drawer) for built-in accessibility (focus trap, aria-modal, Escape key)
- `useSearchParams()` pages use **Suspense boundary** pattern matching `enterprise/hr/job-postings/page.tsx`
- `AdminDataTable` available as shared generic table component for admin pages
- `useAdminGuard` hook for client-side role check before mutations
- Backend follows existing MediatR CQRS pattern with Clean Architecture
