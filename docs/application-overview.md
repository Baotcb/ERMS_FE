# 🏢 Tổng Quan Ứng Dụng ERMS

## ERMS Là Gì?

**ERMS (Enterprise Recruitment Management System)** là hệ thống quản lý tuyển dụng và đào tạo nhân sự toàn diện, kết nối ứng viên với doanh nghiệp. Hệ thống phục vụ nhiều vai trò khác nhau trong quy trình tuyển dụng và đào tạo.

## 🎭 Các Vai Trò Trong Hệ Thống

| Vai Trò | Mô Tả | Route Prefix |
|---------|--------|-------------|
| **Candidate** | Ứng viên tìm việc, ứng tuyển, xem offers | `/(candidate)/*` |
| **HR Manager / HR** | Quản lý nhân sự: tuyển dụng, phòng ban, nhân viên, đào tạo | `/enterprise/hr/*` |
| **Department Head** | Trưởng phòng: kế hoạch tuyển dụng, phỏng vấn, đào tạo | `/enterprise/dept-head/*` |
| **Director** | Ban giám đốc: phê duyệt kế hoạch, báo cáo | `/enterprise/director/*` |
| **Employee** | Nhân viên: phỏng vấn, giảng dạy, học tập (Training), quản lý kỹ năng | `/enterprise/employee/*` |

### Role Constants (Backend Mapping)

```typescript
export const USER_ROLES = {
  ADMIN: 'Admin',
  DIRECTOR: 'Director',
  HR_MANAGER: 'HRManager',
  HR: 'HR',
  TRAINER: 'Trainer',
  DEPARTMENT_HEAD: 'DepartmentHead',
  EMPLOYEE: 'Employee',
  CANDIDATE: 'Candidate',
} as const
```

## 🛠️ Tech Stack

### Core Framework

| Công Nghệ | Version | Mục Đích |
|-----------|---------|----------|
| **Next.js** | 16.x | App Router, SSR, API proxy |
| **React** | 19.x | UI Library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first CSS |

### UI Components

| Thư Viện | Mục Đích |
|---------|----------|
| **shadcn/ui** (Radix UI) | Headless UI primitives (Dialog, Select, Dropdown, etc.) |
| **Lucide React** | Icon system |
| **Framer Motion** | Animations |
| **class-variance-authority** | Component variants |
| **tailwind-merge** | Merge Tailwind classes |

### State & Data

| Thư Viện | Mục Đích |
|---------|----------|
| **Zustand** | Global state (auth, app settings) |
| **SWR** | Server data fetching & caching |
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |

### Utilities

| Thư Viện | Mục Đích |
|---------|----------|
| **date-fns** | Date formatting & manipulation |
| **react-dropzone** | File upload (CV, images) |
| **react-day-picker** | Date picker component |

## 🏗️ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
├──────────────────────────┬──────────────────────────────────┤
│    Candidate Portal       │      Enterprise Portal           │
│    /(candidate)/*         │      /enterprise/*               │
│                           │  ┌────────────────────────────┐  │
│  • Tìm việc               │  │ HR     │ DeptHead │Director│  │
│  • Ứng tuyển              │  │ Employee│          │        │  │
│  • Xem offers             │  └────────────────────────────┘  │
├──────────────────────────┴──────────────────────────────────┤
│                  Next.js App Router                           │
│           (Middleware: Auth + CSRF + Security)               │
├─────────────────────────────────────────────────────────────┤
│               API Proxy (next.config.ts rewrites)            │
│                /api/* → Backend API                          │
├─────────────────────────────────────────────────────────────┤
│                    .NET Backend (ERMS_BE)                     │
│                    SQL Server Database                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication & Security

### Flow Đăng Nhập

1. User submit credentials → `/api/auth/session/login` (Next.js API route)
2. Next.js route gọi backend `/api/Auth/login`
3. Nhận JWT token, set `auth_token` cookie (HttpOnly)
4. Set `user_role` cookie cho middleware routing
5. Middleware redirect theo role → dashboard tương ứng

### Security Features

- **Middleware**: CSP headers, CSRF protection, route guards
- **JWT Parsing**: Client-side để đọc role, không verify signature
- **Cookie-based Auth**: `auth_token` (JWT), `user_role` (plain text)
- **API Proxy**: Backend URL hidden qua Next.js rewrites
- **Google OAuth**: Callback flow qua `/api/auth/google/*`

### Route Protection

```typescript
// Middleware.ts logic:
// 1. Public routes → Cho phép truy cập
// 2. Protected routes + no token → Redirect /login
// 3. Candidate truy cập /enterprise → Redirect /
// 4. Enterprise role truy cập / → Redirect dashboard
// 5. CSRF validation cho mutations (POST, PUT, DELETE, PATCH)
```

## 📱 Các Module Chức Năng

### Candidate Portal (`/(candidate)/*`)

| Page | Route | Mô Tả |
|------|-------|--------|
| Tìm việc | `/jobs` | Danh sách việc làm, search, filter |
| Chi tiết việc | `/jobs/[id]` | Xem chi tiết & ứng tuyển |
| Việc đã lưu | `/jobs/saved` | Danh sách việc đã bookmark |
| Hồ sơ ứng tuyển | `/applications` | Danh sách đã ứng tuyển |
| Offers | `/offers` | Danh sách lời mời |
| Chi tiết offer | `/offers/[id]` | Xem chi tiết offer |
| Công ty | `/companies` | Danh sách công ty |
| Chi tiết công ty | `/companies/[id]` | Xem thông tin công ty |
| Profile | `/settings/profile` | Cập nhật hồ sơ cá nhân |
| Bảo mật | `/settings/security` | Đổi mật khẩu |

### HR Portal (`/enterprise/hr/*`)

| Page | Route | Mô Tả |
|------|-------|--------|
| Dashboard | `/dashboard` | Thống kê tổng quan HR |
| Phòng ban | `/departments` | Quản lý phòng ban |
| Sửa phòng ban | `/departments/[id]/edit` | Chỉnh sửa phòng ban |
| Nhân viên | `/employees` | Quản lý nhân viên |
| Sửa nhân viên | `/employees/[id]/edit` | Chỉnh sửa thông tin nhân viên |
| Tin tuyển dụng | `/job-postings` | Quản lý tin đăng |
| Hồ sơ ứng tuyển | `/job-postings/[id]/applications` | Screening CV, AI scoring |
| Chiến dịch | `/recruitment-campaigns` | Quản lý chiến dịch tuyển dụng |
| Phỏng vấn | `/interviews` | Quản lý lịch phỏng vấn |
| Offers | `/offers` | Quản lý offers cho ứng viên |
| Đào tạo - yêu cầu | `/training/requests` | Yêu cầu đào tạo |
| Đào tạo - kế hoạch | `/training/plans` | Kế hoạch đào tạo |
| Đào tạo - phân công | `/training/assign` | Phân công đào tạo |
| Đào tạo - lịch | `/training/schedule` | Lịch đào tạo |

### Department Head Portal (`/enterprise/dept-head/*`)

| Page | Route | Mô Tả |
|------|-------|--------|
| Dashboard | `/dashboard` | Thống kê trưởng phòng |
| Kế hoạch tuyển dụng | `/recruitment-plans` | Tạo & quản lý kế hoạch |
| Chi tiết chiến dịch | `/recruitment-plans/campaign/[id]` | Xem chiến dịch |
| Tuyển dụng | `/recruitment` | Quản lý tuyển dụng |
| Đề xuất | `/proposals` | Đề xuất nhân sự |
| Hồ sơ được chọn | `/shortlisted` | Danh sách ứng viên đã lọc |
| Chi tiết hồ sơ | `/shortlisted/[planDetailId]` | Xem chi tiết hồ sơ |
| Phỏng vấn | `/interviews` | Quản lý phỏng vấn |
| Feedback phỏng vấn | `/feedback/[applicationId]` | Nhập đánh giá |
| Quyết định | `/decision/[applicationId]` | Ra quyết định tuyển |
| Đào tạo | `/training` | Quản lý đào tạo |
| Đào tạo - courses | `/training/courses` | Danh sách khóa học |
| Đào tạo - kế hoạch | `/training/plans` | Kế hoạch đào tạo |
| Đào tạo - phân công | `/training/assign` | Phân công nhân viên |
| Đào tạo - lịch | `/training/schedule` | Lịch đào tạo |
| Giảng dạy | `/teaching` | Quản lý giảng dạy |
| Chi tiết khóa | `/teaching/course/[id]` | Chi tiết khóa giảng |

### Director Portal (`/enterprise/director/*`)

| Page | Route | Mô Tả |
|------|-------|--------|
| Dashboard | `/dashboard` | Thống kê ban giám đốc |
| Kế hoạch tuyển dụng | `/recruitment-plans` | Phê duyệt kế hoạch |
| Chi tiết kế hoạch | `/recruitment-plans/[id]` | Xem chi tiết để duyệt |
| Báo cáo tuyển dụng | `/recruitment-report` | Báo cáo tổng hợp |
| Subscription | `/subscription` | Quản lý gói dịch vụ |
| Phê duyệt đào tạo | `/training-approval` | Duyệt kế hoạch đào tạo |
| Báo cáo đào tạo | `/training-report` | Báo cáo đào tạo |
| Giảng dạy | `/teaching` | Xem hoạt động giảng dạy |
| Chi tiết khóa | `/teaching/course/[id]` | Chi tiết khóa học |

### Employee Portal (`/enterprise/employee/*`)

| Page | Route | Mô Tả |
|------|-------|--------|
| Dashboard | `/dashboard` | Thống kê nhân viên |
| Phỏng vấn | `/interviews` | Lịch phỏng vấn của tôi |
| Feedback | `/feedback/[applicationId]` | Nhập feedback phỏng vấn |
| Giảng dạy | `/teaching` | Nhiệm vụ giảng dạy |
| Chi tiết khóa giảng| `/teaching/course/[id]` | Quản lý khóa giảng |
| Học tập | `/learning` | Danh sách khóa học cần tham gia |
| Bài kiểm tra (Quiz) | `/learning/quiz/[id]` | Thực hiện bài kiểm tra cuối khóa |
| Kỹ năng | Modal / Badge | Cập nhật skills gap & thông tin cá nhân |

### Shared Enterprise

| Page | Route | Mô Tả |
|------|-------|--------|
| Profile | `/enterprise/profile` | Thông tin cá nhân |
| Settings | `/enterprise/settings` | Cài đặt chung |
| Security | `/enterprise/settings/security` | Đổi mật khẩu |

### Auth (`/(auth)/*`)

| Page | Route | Mô Tả |
|------|-------|--------|
| Đăng nhập | `/login` | Login form |
| Đăng ký ứng viên | `/register` | Đăng ký tài khoản ứng viên |
| Đăng ký doanh nghiệp | `/register/employer` | Đăng ký tài khoản doanh nghiệp |
| Đăng ký HR | `/register/hr` | Tạo tài khoản HR |
| Quên mật khẩu | `/forgot-password` | Reset password flow |
| Đặt lại mật khẩu | `/reset-password` | Trang nhập password mới |
| Xác minh email | `/verify-email` | Trang chờ xác minh |
| Xác nhận email | `/confirm-email` | Xác nhận qua link email |
| Google callback | `/google-callback` | OAuth callback |

## 🎨 Design System

### Brand Colors

```css
--color-brand-primary: #0F4C75;    /* Deep Blue - Primary actions */
--color-brand-secondary: #BBE1FA;  /* Light Blue - Secondary elements */
--color-brand-coral: #FF7E67;      /* Coral - Accent/CTA */
--color-brand-dark: #0F4C75;       /* Dark Blue - Headers */
--color-brand-light: #F7F9FC;      /* Light Gray - Backgrounds */
--color-brand-white: #FFFFFF;      /* White */
--color-brand-bg: #F7F9FC;         /* App background */
```

### Typography

- **Font chính**: Geist Sans (Google Fonts)
- **Font mono**: Geist Mono

### Component Library

- **shadcn/ui** components: Button, Input, Select, Dialog, Dropdown Menu, Toast, Tooltip, Table, Tabs, Badge, Calendar, Card, Checkbox, Form, Label, Progress, Separator, Sheet, Switch, Textarea, Alert Dialog
- **Custom components**: Avatar Dropdown, Brand Logo, Error Boundary, File Upload, Image Upload, Loading Spinner, Skeleton, Coming Soon Page

## 🔧 Cấu Hình Quan Trọng

### API Proxy

```typescript
// next.config.ts
async rewrites() {
  return [
    { source: '/api/:path*', destination: `${API_URL}/api/:path*` }
  ]
}
```

Frontend gọi `/api/*` → Next.js proxy tới backend. Backend URL KHÔNG expose cho client.

### Environment Variables

```env
# Server-side only (không expose cho client)
API_URL=https://backend-api-url

# Public (có thể dùng ở client, fallback)
NEXT_PUBLIC_API_URL=https://backend-api-url

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=xxx

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
```

### Build & Deploy

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

- **Dev**: Turbopack cho HMR nhanh
- **Build**: Output `standalone` cho Docker deployment
- **CI/CD**: Azure Pipelines (`azure-pipeline-dev.yml`, `azure-pipeline-main.yml`, `azure-pipelines-uat.yml`)

---
