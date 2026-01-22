# 🗄️ Cấu Trúc Dự Án

Phần lớn code nằm trong thư mục `src` và có cấu trúc như sau:

```sh
src
|
+-- app               # Next.js App Router - lớp routing của ứng dụng
|   |                 # Chỉ chứa các route pages và layouts
|   +-- (auth)        # Nhóm routes auth
|   +-- (dashboard)   # Nhóm routes dashboard
|   +-- (recruitment) # Nhóm routes tuyển dụng
|   +-- (setting)     # Nhóm routes settings
|   +-- layout.tsx    # Root layout
|   +-- page.tsx      # Trang chủ
|
+-- components        # Shared components dùng chung trong toàn bộ ứng dụng
|   +-- common        # Components reusable thông dụng
|   +-- layout        # Layout components (navbar, footer, etc.)
|   +-- ui            # UI primitives (shadcn/ui components)
|
+-- config            # Global configurations, env variables
|
+-- features          # Feature-based modules (business logic)
|   +-- core          # Cross-cutting features (auth, user-profile)
|   +-- dashboard     # Dashboard và statistics
|   +-- home          # Trang chủ components
|   +-- jobs          # Quản lý việc làm
|   +-- recruitment   # Quản lý tuyển dụng HR
|
+-- hooks             # Shared hooks dùng chung trong toàn bộ ứng dụng
|
+-- lib               # Reusable libraries được pre-configured cho ứng dụng
|
+-- stores            # Global state stores (Zustand)
|
+-- types             # Shared types dùng chung trong ứng dụng
|
+-- utils             # Shared utility functions
|
+-- middleware.ts     # Next.js middleware cho security & routing
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

## Tổ Chức Features

ERMS tổ chức features theo cấu trúc phẳng (flat structure) trong thư mục `features/`:

### `features/core/` - Cross-cutting Features

Các features được sử dụng xuyên suốt ứng dụng:

```sh
features/core/
|
+-- auth/              # Authentication & authorization
|   +-- api/
|   +-- components/
|   +-- hooks/
|   +-- schemas/
|   +-- types/
|   +-- index.ts
|
+-- user-profile/      # Quản lý user profile
    +-- api/
    +-- components/
    +-- index.ts
```

**Ví dụ:** auth, user-profile, notifications, settings

### Business Domain Features

Các features đặc thù cho business domains nằm trực tiếp trong `features/`:

```sh
features/
|
+-- dashboard/         # Tổng quan và thống kê
|   +-- components/
|   +-- index.ts
|
+-- home/              # Trang chủ ứng viên
|   +-- constants/
|   +-- index.ts
|
+-- jobs/              # Quản lý việc làm
|   +-- components/
|   +-- constants/
|   +-- index.ts
|
+-- recruitment/       # Quản lý tuyển dụng HR
    +-- components/
    +-- data/
    +-- types/
    +-- index.ts
```

**Ví dụ:** dashboard, home, jobs, recruitment

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


```


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

```typescript
// ✅ NÊN: Generic, reusable
export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}

// ❌ KHÔNG NÊN: Business logic
export function SubmitJobButton() {
  const handleSubmit = () => submitJob() // Quá cụ thể!
  return <button onClick={handleSubmit}>Submit</button>
}
```

### `lib/` - Utility Libraries

**Trách nhiệm:** Pre-configured utilities, helpers

```typescript
// ✅ NÊN: Generic utilities
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN')
}
```

### `stores/` - Global State

**Trách nhiệm:** Application-wide state only

```typescript
// ✅ NÊN: Global state (auth, theme, v.v.)
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
}))

// ❌ KHÔNG NÊN: Feature-specific state
export const useJobFiltersStore = create(...)
// Cái này nên nằm trong features/jobs/
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

### 4. Testing

```
✅ Test feature → Test toàn bộ feature folder
✅ Mock dependencies → Ranh giới rõ ràng
✅ Integration tests → Test feature như một đơn vị
```


## Anti-Patterns Cần Tránh

### ❌ Circular Dependencies

```typescript
// features/auth/index.ts
import { JobCard } from '@/features/jobs'  // Tệ!

// features/jobs/index.ts  
import { useAuth } from '@/features/auth'  // Tạo vòng lặp!
```

**Giải pháp:** Compose ở app level:

```typescript
// app/page.tsx
import { AuthProvider } from '@/features/auth'
import { JobList } from '@/features/jobs'

export default function Page() {
  return (
    <AuthProvider>
      <JobList />
    </AuthProvider>
  )
}
```

### ❌ Trộn Lẫn Concerns

```typescript
// ❌ Tệ - Business logic trong app/
// app/(auth)/login/page.tsx
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

## Best Practices Tổ Chức File


### 1. Sử Dụng Index Files Một Cách Khôn Ngoan

```typescript
// ✅ Tốt - Chỉ export public API
// features/auth/index.ts
export { LoginForm } from './components/login-form'
export { useAuth } from './hooks/use-auth'
// Không export internal helpers

// ❌ Tệ - Export mọi thứ
export * from './components'
export * from './api'
export * from './utils'
```

### 2. Naming Nhất Quán

```
feature-name/
├── api/
│   └── feature-name-service.ts
├── components/
│   └── feature-component.tsx
├── hooks/
│   └── use-feature.ts
└── schemas/
    └── feature-schemas.ts
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

