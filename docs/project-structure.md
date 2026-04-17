# 🗄️ Cấu Trúc Dự Án

Phần lớn code nằm trong thư mục `src` và có cấu trúc như sau:

```sh
src
|
+-- app                # Next.js App Router - lớp routing của ứng dụng
|   |                  # Chỉ chứa các route pages và layouts
|   +-- (auth)         # Nhóm routes auth (login, register, forgot-password, etc.)
|   +-- (candidate)    # Nhóm routes ứng viên (jobs, applications, offers, etc.)
|   +-- api            # API Route Handlers (auth session, Google OAuth)
|   +-- enterprise     # Enterprise portal routes
|   |   +-- dept-head  # Department Head portal
|   |   +-- director   # Director portal
|   |   +-- employee   # Employee portal
|   |   +-- hr         # HR Manager portal
|   |   +-- profile    # Shared profile page
|   |   +-- settings   # Shared settings pages
|   +-- providers      # App-level providers (Auth, SWR)
|   +-- globals.css    # Tailwind CSS 4 config & design tokens
|   +-- layout.tsx     # Root layout
|   +-- page.tsx       # Trang chủ (landing/candidate home)
|   +-- not-found.tsx  # 404 page
|
+-- components         # Shared components dùng chung trong toàn bộ ứng dụng
|   +-- common         # Components reusable (Alert, Avatar, Skeleton, Error, FileUpload, etc.)
|   +-- icons          # Dynamic icon loader
|   +-- layout         # Layout components (navbars, footers, sidebar, etc.)
|   +-- shared         # Shared feature components (Coming Soon page, etc.)
|   +-- ui             # UI primitives (shadcn/ui components)
|
+-- config             # Global configurations (site config)
|
+-- features           # Feature-based modules (business logic)
|   +-- candidate      # Ứng viên: ứng tuyển, xem offers, sidebar
|   +-- core           # Cross-cutting: auth, user-profile
|   +-- cv             # Upload CV
|   +-- dashboard      # Dashboard widgets (stat cards)
|   +-- dept-head      # Trưởng phòng: recruitment plans, interviews, training
|   +-- director       # Ban giám đốc: approvals, reports
|   +-- employee       # Nhân viên: interviews, teaching
|   +-- enterprise     # Enterprise shared: sidebar, service
|   +-- hr             # HR: departments, employees, job postings, applications,
|   |                  #     offers, campaigns, interviews, training, dashboard
|   +-- jobs           # Tìm việc: search, filter, detail, saved jobs
|
+-- hooks              # Shared hooks dùng chung (useDebounce, useCloudinaryUpload, useFormHandler, useToast)
|
+-- lib                # Reusable libraries pre-configured
|   +-- api-client.ts  # HTTP client với token, CSRF, error handling
|   +-- server-fetch.ts # Server-side fetch utility
|   +-- cloudinary/    # Cloudinary upload config
|   +-- logger.ts      # Client-side logger
|   +-- swr/           # SWR hooks & configuration
|   +-- utils.ts       # cn() helper (clsx + tailwind-merge)
|
+-- stores             # Global state stores (Zustand)
|   +-- auth-store.ts  # Authentication state
|   +-- use-app-store.ts # App-wide UI state
|
+-- types              # Shared types (User, ApiResponse, PaginationParams)
|
+-- utils              # Shared utility functions
|   +-- constants.ts   # USER_ROLES, ROLE_DASHBOARD_MAP, STORAGE_KEYS
|   +-- error-handler.ts # Centralized error handling
|   +-- jwt.ts         # JWT parsing utilities
|   +-- logger.ts      # Logging utilities
|   +-- sanitization.ts # Input sanitization
|   +-- blocked-companies.ts # Company blocking logic
|
+-- middleware.ts      # Next.js middleware: auth guards, CSRF, CSP headers, routing
```

## Tổ Chức Theo Features

Để dễ dàng mở rộng và bảo trì, organize phần lớn code trong thư mục `features`. Mỗi feature folder chứa code đặc thù cho feature đó, giữ mọi thứ tách biệt gọn gàng.

### Tại Sao Theo Features?

- ✅ **Ngăn chặn việc trộn lẫn** code của feature với shared components
- ✅ **Đơn giản hơn để quản lý** so với flat folder structure
- ✅ **Tăng cường collaboration** - ownership rõ ràng
- ✅ **Dễ đọc hơn** - dễ tìm code
- ✅ **Có khả năng mở rộng** - thêm features mà không làm lộn xộn

Một feature có thể có cấu trúc như sau:

```sh
src/features/awesome-feature
|
+-- api         # API request declarations và hooks
|
+-- components  # Components dành riêng cho feature
|
+-- hooks       # Hooks dành riêng cho feature
|
+-- schemas     # Validation schemas (Zod)
|
+-- types       # TypeScript types cho feature
|
+-- utils       # Utility functions cho feature
|
+-- index.ts    # Public API - chỉ exports những gì cần thiết
```

**LƯU Ý:** Bạn không cần tất cả các folders cho mỗi feature. Chỉ include những cái cần thiết.

## Tổ Chức Features Hiện Tại

### `features/core/` - Cross-cutting Features

Các features được sử dụng xuyên suốt ứng dụng:

```sh
features/core/
|
+-- auth/              # Authentication & authorization
|   +-- actions/       # Server actions
|   +-- api/           # Auth service (login, register, etc.)
|   +-- components/    # Login form, Register form, Forgot password, etc.
|   +-- hooks/         # useAuth, useCandidateAccess, etc.
|   +-- schemas/       # Zod validation schemas
|   +-- types/         # Auth types
|   +-- utils/         # Cookie helpers, Google auth
|   +-- index.ts
|
+-- user-profile/      # Quản lý user profile
    +-- api/           # Profile service
    +-- components/    # Profile forms, avatar section
    +-- hooks/         # useProfileForm
    +-- utils/         # Profile validation
    +-- index.ts
```

### `features/hr/` - HR Manager Feature

Feature lớn nhất, quản lý toàn bộ nghiệp vụ HR:

```sh
features/hr/
|
+-- api/                        # API services
|   +-- application-service.ts  # Screening ứng viên
|   +-- course-content-service.ts
|   +-- course-service.ts
|   +-- dashboard-service.ts    # HR dashboard data
|   +-- department-service.ts   # Quản lý phòng ban
|   +-- employee-service.ts     # Quản lý nhân viên
|   +-- hr-training-service.ts  # Đào tạo
|   +-- interview-service.ts    # Phỏng vấn
|   +-- job-posting-service.ts  # Tin tuyển dụng
|   +-- offer-service.ts        # Offers
|   +-- recruitment-campaign-service.ts
|   +-- training-server-service.ts
|
+-- components/
|   +-- application/            # CV Screening components
|   +-- department/             # Department management
|   +-- employee/               # Employee management
|   +-- hr-dashboard.tsx        # HR dashboard view
|   +-- dashboard-widgets.tsx   # Dashboard stat widgets
|   +-- interview/              # Interview management
|   +-- job-posting/            # Job posting management
|   +-- offer/                  # Offer management
|   +-- recruitment/            # Recruitment campaigns
|   +-- sidebar/                # HR sidebar navigation
|   +-- training/               # Training management
|
+-- hooks/                      # SWR hooks cho data fetching
+-- types/                      # TypeScript types
+-- index.ts
```

### `features/dept-head/` - Department Head Feature

```sh
features/dept-head/
|
+-- api/
|   +-- dept-head-service.ts    # Recruitment plans, proposals
|   +-- interview-service.ts    # Interview management
|   +-- training-service.ts     # Training management
|
+-- components/
|   +-- dept-head-dashboard.tsx
|   +-- dept-head-sidebar.tsx
|   +-- interview/              # Interview: assign, schedule, feedback, shortlist
|   +-- recruitment/            # Plans: create, detail, campaigns
|   +-- training/               # Training: requests, plans, courses, assign
|
+-- hooks/
+-- types/
```

### `features/director/` - Director Feature

```sh
features/director/
|
+-- api/
|   +-- director-training-service.ts
|
+-- components/
    +-- director-dashboard.tsx
    +-- director-sidebar.tsx
    +-- plan-approval-list.tsx
    +-- training/               # Training approval
```

### `features/employee/` - Employee Feature

```sh
features/employee/
|

+-- types/
+-- index.ts
```

### `features/candidate/` - Candidate Feature

```sh
features/candidate/
|
+-- api/
|   +-- application-service.ts  # Ứng tuyển
|   +-- offer-service.ts        # Xem offers
|
+-- components/
|   +-- application-list.tsx
|   +-- applied-job-card.tsx
|   +-- candidate-offer-card.tsx
|   +-- candidate-offer-detail.tsx
|   +-- candidate-offer-list.tsx
|   +-- candidate-sidebar.tsx
|   +-- job-apply-form.tsx
|   +-- screening-results-card.tsx
|
+-- hooks/
+-- types/
```

### `features/jobs/` - Job Listing Feature

```sh
features/jobs/
|
+-- api/                # Job search API
+-- components/         # Job cards, search, filters
+-- data/               # Static data
+-- hooks/              # Job-related hooks
+-- stores/             # Job filter state (Zustand)
+-- styles/             # CSS styles
+-- views/              # Page-level views
+-- constants.ts        # Job constants
+-- job-filtering.ts    # Filter logic
+-- types.ts            # Job types
+-- index.ts
```

### Các Features Khác

- **`features/enterprise/`** - Shared enterprise sidebar, service
- **`features/dashboard/`** - Shared dashboard widgets (StatCard, DashboardStats)
- **`features/cv/`** - CV upload component

## Pattern Public API

Mỗi feature chỉ export những gì cần thiết qua `index.ts`:

```typescript
// features/core/auth/index.ts
export { LoginForm } from './components/login-form'
export { RegisterForm } from './components/register-form'
export { useAuth } from './hooks/use-auth'
export { login, register } from './api/auth-service'
export type { LoginFormData, RegisterFormData } from './schemas/auth-schemas'
```

**Lợi ích:**
- ✅ API surface rõ ràng
- ✅ Đóng gói (encapsulation)
- ✅ Refactor dễ dàng hơn
- ✅ Ngăn chặn internal imports


## Feature Isolation

### ❌ Tránh Cross-Feature Imports

```typescript
// ❌ TỆ - Import từ feature khác
// features/dashboard/components/stats.tsx
import { JobCard } from '@/features/jobs/components/job-card'

// ✅ TỐT - Compose ở app level
// app/(dashboard)/page.tsx
import { DashboardStats } from '@/features/dashboard'
import { JobList } from '@/features/jobs'

export default function DashboardPage() {
  return (
    <div>
      <DashboardStats />
      <JobList />
    </div>
  )
}
```


## Codebase Một Chiều

Code phải flow theo một hướng: **shared → features → app**

```
┌─────────────────────────────────────┐
│   Shared (components, lib, utils)   │ ← Lớp cơ sở
└─────────────┬───────────────────────┘
              │ có thể được import từ
              ↓
┌─────────────────────────────────────┐
│           Features                  │ ← Business logic
└─────────────┬───────────────────────┘
              │ có thể được import từ
              ↓
┌─────────────────────────────────────┐
│       App (pages, layouts)          │ ← Composition
└─────────────────────────────────────┘
```

### Quy Tắc

- ✅ **Shared** có thể được sử dụng bởi **bất kỳ ai**
- ✅ **Features** có thể import từ **shared**
- ✅ **App** có thể import từ **features** và **shared**
- ❌ **Features** KHÔNG THỂ import từ **app**
- ❌ **Shared** KHÔNG THỂ import từ **features** hoặc **app**
- ❌ **Features** KHÔNG THỂ import từ **features** khác


## Trách Nhiệm Của Các Thư Mục

### `app/` - Application Layer

**Trách nhiệm:** Routing và composition DUY NHẤT

```typescript
// ✅ NÊN: Compose features
export default function LoginPage() {
  return (
    <div>
      <LoginForm />
      <LoginHero />
    </div>
  )
}

// ❌ KHÔNG NÊN: Business logic
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const handleSubmit = async () => {
    const response = await fetch('/api/login', ...)
    // ...
  }
  return <form onSubmit={handleSubmit}>...</form>
}
```

### `features/` - Business Logic Layer

**Trách nhiệm:** Tất cả business logic, API calls, validation

```typescript
// ✅ NÊN: Complete feature implementation
export const LoginForm = memo(function LoginForm() {
  const form = useForm({ resolver: zodResolver(loginSchema) })

  const handleSubmit = async (data: LoginFormData) => {
    const response = await login(data)
    // Xử lý response
  }

  return <form onSubmit={form.handleSubmit(handleSubmit)}>...</form>
})
```

### `components/` - Shared UI Layer

**Trách nhiệm:** Reusable, generic components

```
components/
├── common/              # Business-agnostic reusable
│   ├── alert.tsx
│   ├── avatar-dropdown.tsx
│   ├── brand-logo.tsx
│   ├── dashboard/       # Shared dashboard widgets
│   ├── error-boundary.tsx
│   ├── error-dialog.tsx
│   ├── file-upload.tsx
│   ├── image-upload.tsx
│   ├── loading-spinner.tsx
│   ├── skeleton.tsx
│   └── skeletons/       # Skeleton variants
│
├── icons/               # Dynamic icon loading
│
├── layout/              # App layout pieces
│   ├── auth-navbar.tsx
│   ├── auth-footer.tsx
│   ├── brand-decoration.tsx
│   ├── candidate-navbar.tsx
│   ├── client-layout-elements.tsx
│   ├── floating-menu.tsx
│   ├── footer.tsx
│   ├── nav-item.tsx
│   └── settings-sidebar.tsx
│
├── shared/              # Domain-level shared components
│   └── coming-soon-page.tsx
│
└── ui/                  # shadcn/ui primitives
    ├── alert-dialog.tsx, alert.tsx, avatar.tsx, badge.tsx
    ├── button.tsx, calendar.tsx, card.tsx, checkbox.tsx
    ├── dialog.tsx, dropdown-menu.tsx, form.tsx, form-field.tsx
    ├── input.tsx, label.tsx, popover.tsx, progress.tsx
    ├── select.tsx, separator.tsx, sheet.tsx, skeleton.tsx
    ├── switch.tsx, table.tsx, tabs.tsx, textarea.tsx
    └── toast.tsx, tooltip.tsx
```

### `lib/` - Utility Libraries

**Trách nhiệm:** Pre-configured utilities, helpers

```typescript
// api-client.ts - HTTP client với auth token, CSRF, error handling
// server-fetch.ts - Server-side data fetching
// swr/ - SWR hooks configuration
// cloudinary/ - Cloudinary upload config
// utils.ts - cn() helper
```

### `stores/` - Global State

**Trách nhiệm:** Application-wide state only

```typescript
// auth-store.ts - User, token, login/logout
// use-app-store.ts - App-wide UI state
```

### `hooks/` - Shared Hooks

```typescript
// use-cloudinary-upload.ts - Upload file lên Cloudinary
// use-debounce.ts - Debounce function calls
// use-debounced-value.ts - Debounce state values
// use-form-handler.ts - Generic form submission handler
// use-toast.ts - Toast notification hook
```

## Lợi Ích Của Cấu Trúc Này

### 1. Khả Năng Mở Rộng

```
✅ Thêm feature mới → Tạo folder mới trong features/
✅ Xóa feature → Xóa folder
✅ Phát triển song song → Các features khác nhau, không xung đột
```

### 2. Khả Năng Bảo Trì

```
✅ Bug trong auth? → Kiểm tra features/core/auth/
✅ Update job card? → Kiểm tra features/jobs/components/
✅ Thêm API mới? → Kiểm tra thư mục api/ của feature
```

### 3. Cộng Tác Team

```
✅ Ownership rõ ràng → Mỗi feature có owner
✅ Không xung đột → Các folders riêng biệt
✅ Onboarding dễ dàng → Cấu trúc rõ ràng
```

## Anti-Patterns Cần Tránh

### ❌ Circular Dependencies

```typescript
// features/auth/index.ts
import { JobCard } from '@/features/jobs'  // Tệ!

// features/jobs/index.ts
import { useAuth } from '@/features/auth'  // Tạo vòng lặp!
```

**Giải pháp:** Compose ở app level hoặc dùng shared hooks.

### ❌ Trộn Lẫn Concerns

```typescript
// ❌ Tệ - Business logic trong app/
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const handleSubmit = async () => {
    await fetch('/api/login', ...) // Business logic!
  }
  return <form>...</form>
}

// ✅ Tốt - Chỉ composition
export default function LoginPage() {
  return <LoginForm />  // Logic trong feature
}
```

### ❌ God Components

```typescript
// ❌ Tệ - Component làm quá nhiều việc
function JobManagement() {
  // 500 dòng code
  // Xử lý: listing, filtering, creating, editing, deleting
}

// ✅ Tốt - Tách theo trách nhiệm
function JobList() { /* listing */ }
function JobFilters() { /* filtering */ }
function JobForm() { /* creating/editing */ }
```

## Khi Nào Tạo Feature Mới

### Tạo Feature Mới Khi:

- ✅ Bạn có 5+ components liên quan
- ✅ Nó là một business domain riêng biệt
- ✅ Nó có API endpoints riêng
- ✅ Nó yêu cầu state management cụ thể
- ✅ Nó có thể được phát triển độc lập

### Không Tạo Feature Khi:

- ❌ Chỉ có 1-2 components đơn giản
- ❌ Chỉ là UI components (dùng `components/`)
- ❌ Chỉ là utilities (dùng `lib/` hoặc `utils/`)

---
