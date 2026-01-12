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
|   +-- domains       # Business domain features (dashboard, jobs)
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

## Core vs Domains

ERMS tổ chức features thành hai loại:

### `features/core/` - Cross-cutting Features

Các features được sử dụng across nhiều domains:

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

### `features/domains/` - Business Domain Features

Các features đặc thù cho business domains:

```sh
features/domains/
|
+-- dashboard/         # Analytics và statistics
|   +-- components/
|   +-- index.ts
|
+-- jobs/              # Quản lý việc làm
|   +-- api/
|   +-- components/
|   +-- constants/
|   +-- index.ts
|
+-- training/          # Quản lý đào tạo (sắp ra mắt)
    +-- api/
    +-- components/
    +-- index.ts
```

**Ví dụ:** dashboard, jobs, training, recruitment

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
// features/domains/dashboard/components/stats.tsx
import { JobCard } from '@/features/domains/jobs/components/job-card'

// ✅ TỐT - Compose ở app level
// app/(dashboard)/page.tsx
import { DashboardStats } from '@/features/domains/dashboard'
import { JobList } from '@/features/domains/jobs'

export default function DashboardPage() {
  return (
    <div>
      <DashboardStats />
      <JobList />
    </div>
  )
}
```

### Enforcement Với ESLint

```javascript
// eslint.config.mjs
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      // Ngăn chặn cross-feature imports
      {
        target: './src/features/core/auth',
        from: './src/features',
        except: ['./core/auth'],
      },
      {
        target: './src/features/domains/jobs',
        from: './src/features',
        except: ['./domains/jobs'],
      },
      // Thêm nếu cần
    ],
  },
],
```

## Codebase Một Chiều

Code phải flow theo một hướng: **shared → features → app**

```
┌─────────────────────────────────────┐
│   Shared (components, lib, utils)   │ ← Lớp cơ sở
└─────────────┬───────────────────────┘
              │ có thể import từ
              ↓
┌─────────────────────────────────────┐
│      Features (core, domains)       │ ← Business logic
└─────────────┬───────────────────────┘
              │ có thể import từ
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

### Enforcement Với ESLint

```javascript
'import/no-restricted-paths': [
  'error',
  {
    zones: [
      // Ngăn features import từ app
      {
        target: './src/features',
        from: './src/app',
      },
      
      // Ngăn shared import từ features/app
      {
        target: [
          './src/components',
          './src/hooks',
          './src/lib',
          './src/utils',
        ],
        from: ['./src/features', './src/app'],
      },
    ],
  },
],
```

## Ví Dụ: Thêm Training Feature

### 1. Tạo Cấu Trúc Feature

```bash
mkdir -p src/features/domains/training/{api,components,hooks,schemas,types}
```

### 2. Implement Feature

```typescript
// features/domains/training/api/training-service.ts
export async function getTrainings(): Promise<Training[]> {
  const response = await fetch(`${API_BASE}/api/trainings`)
  return handleApiResponse<Training[]>(response)
}

// features/domains/training/components/training-list.tsx
export const TrainingList = memo(function TrainingList() {
  return <div>{/* UI */}</div>
})

// features/domains/training/hooks/use-trainings.ts
export function useTrainings() {
  const [trainings, setTrainings] = useState<Training[]>([])
  // Logic
  return { trainings, isLoading }
}

// features/domains/training/schemas/training-schemas.ts
export const trainingSchema = z.object({
  title: z.string().min(5),
  duration: z.number().min(1),
})

// features/domains/training/index.ts
export { TrainingList } from './components/training-list'
export { useTrainings } from './hooks/use-trainings'
export { getTrainings } from './api/training-service'
export type { Training } from './types'
```

### 3. Sử Dụng Trong App

```typescript
// app/(dashboard)/training/page.tsx
import { TrainingList } from '@/features/domains/training'

export default function TrainingPage() {
  return (
    <div>
      <h1>Khóa Đào Tạo</h1>
      <TrainingList />
    </div>
  )
}
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
// Cái này nên nằm trong features/domains/jobs/
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
✅ Update job card? → Kiểm tra features/domains/jobs/components/
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

## So Sánh Với Các Cấu Trúc Khác

### Flat Structure (❌ Không Có Khả Năng Mở Rộng)

```
src/
├── components/
│   ├── LoginForm.tsx
│   ├── JobCard.tsx
│   ├── DashboardStats.tsx
│   └── ... (100+ files) ← Khó navigate
├── utils/
│   └── ... (50+ files)
└── hooks/
    └── ... (30+ files)
```

### Feature-Based (✅ ERMS Sử Dụng Cái Này)

```
src/
├── features/
│   ├── core/
│   │   └── auth/          ← Mọi thứ liên quan đến auth
│   └── domains/
│       └── jobs/          ← Mọi thứ liên quan đến jobs
└── components/            ← Chỉ shared UI
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

## Thích Ứng Với Các Frameworks Khác


Chỉ thư mục `app/` khác nhau dựa trên framework, cấu trúc features vẫn giữ nguyên!

---

