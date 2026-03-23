# 🗃️ Quản Lý State

Quản lý state hiệu quả là rất quan trọng cho việc tối ưu hiệu năng. Thay vì lưu toàn bộ state trong một kho lưu trữ duy nhất, hãy chia nó thành các danh mục dựa trên cách sử dụng.

## Tổng Quan State Types

| Loại State | Công Cụ | Khi Nào Dùng | Ví Dụ |
|-----------|--------|-------------|-------|
| Component State | `useState`, `useReducer` | State nội bộ 1 component | Form inputs, toggles |
| Application State | **Zustand** | State toàn app | Auth, UI settings |
| Server State | **SWR** | Data từ API, cần cache | Employees list, dashboard data |
| Form State | **React Hook Form** + **Zod** | Form validation & submission | Login form, Employee form |
| URL State | `useSearchParams` | Filters, pagination | Search keywords, page numbers |

## Component State

### useState

Cho các state đơn giản, độc lập:

```typescript
function JobFilter() {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')

  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <input value={location} onChange={(e) => setLocation(e.target.value)} />
    </div>
  )
}
```

### useReducer

Cho state phức tạp với nhiều giá trị con:

```typescript
interface State {
  filters: JobFilters
  sorting: SortConfig
  pagination: PaginationConfig
}

type Action =
  | { type: 'SET_FILTER'; payload: Partial<JobFilters> }
  | { type: 'SET_SORTING'; payload: SortConfig }
  | { type: 'SET_PAGE'; payload: number }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case 'SET_SORTING':
      return { ...state, sorting: action.payload }
    case 'SET_PAGE':
      return { ...state, pagination: { ...state.pagination, page: action.payload } }
    default:
      return state
  }
}
```

## Application State (Zustand)

ERMS sử dụng **Zustand 5.x** cho global state. Hiện tại có 2 stores:

### Auth Store (`stores/auth-store.ts`)

Store chính quản lý authentication:

```typescript
import { create } from 'zustand'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token, user) => {
    localStorage.setItem('auth_token', token)
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))

// Sử dụng trong components
function ProfileMenu() {
  const { user, logout } = useAuthStore()

  return (
    <div>
      <p>{user?.fullName}</p>
      <button onClick={logout}>Đăng xuất</button>
    </div>
  )
}
```

### App Store (`stores/use-app-store.ts`)

Store cho app-wide UI state:

```typescript
export const useAppStore = create<AppState>((set) => ({
  // UI state: sidebar collapsed, theme, etc.
}))
```

### Feature-level Store Ví Dụ (`features/jobs/stores/`)

Các feature cũng có thể có store riêng cho state cụ thể:

```typescript
// features/jobs/stores/ - Job filter state
// Chỉ dùng trong feature jobs
```

### Best Practices Zustand

```typescript
// ✅ Tốt - Sử dụng selectors (tránh re-renders)
function UserName() {
  const userName = useAuthStore(state => state.user?.fullName)
  return <span>{userName}</span>
}

// ❌ Tệ - Subscribe toàn bộ store
function UserName() {
  const { user } = useAuthStore()
  return <span>{user?.fullName}</span>
}
```

## Server State (SWR)

ERMS sử dụng **SWR 2.x** cho data fetching từ API. SWR tự động handle caching, revalidation, focus tracking.

### Pattern: Service + Hook

```typescript
// 1. Service layer (features/hr/api/employee-service.ts)
export async function getEmployees(params?: PaginationParams) {
  const response = await apiClient.get('/api/Employees', { params })
  return response.json()
}

// 2. Hook layer (features/hr/hooks/use-employees.ts)
export function useEmployees(params?: PaginationParams) {
  return useSWR(
    ['/api/Employees', params],
    () => getEmployees(params)
  )
}

// 3. Component layer
function EmployeeList() {
  const { data, error, isLoading, mutate } = useEmployees({ page: 1, limit: 20 })

  if (isLoading) return <ListSkeleton />
  if (error) return <ErrorMessage error={error} />

  return <EmployeeTable employees={data} onRefresh={() => mutate()} />
}
```

### SWR Configuration

ERMS có custom SWR provider (`app/providers/swr-provider.tsx`) và hooks (`lib/swr/`):

```typescript
// lib/swr/hooks.ts - Custom SWR hooks
export function useData<T>(key: string | null, options?: {
  fetcher?: () => Promise<T>
}) {
  // Pre-configured SWR hook with error handling
}
```

### Mutations với SWR

```typescript
import useSWRMutation from 'swr/mutation'

export function useCreateEmployee() {
  return useSWRMutation(
    '/api/Employees',
    (_, { arg }: { arg: CreateEmployeeData }) =>
      createEmployee(arg)
  )
}

// Sử dụng
function CreateEmployeeForm() {
  const { trigger, isMutating } = useCreateEmployee()

  const onSubmit = async (data: FormData) => {
    await trigger(data)
    // SWR auto-revalidate
  }
}
```

## Form State (React Hook Form + Zod)

ERMS sử dụng **React Hook Form 7.x** + **Zod 4.x** cho form management:

### Pattern Chuẩn

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Define schema
const employeeSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
  role: z.string().min(1, 'Vui lòng chọn vai trò'),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

// 2. Use in component
function EmployeeForm() {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: '',
      email: '',
      departmentId: '',
      role: '',
    },
  })

  const onSubmit = async (data: EmployeeFormData) => {
    await createEmployee(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('fullName')} />
      {form.formState.errors.fullName && (
        <span>{form.formState.errors.fullName.message}</span>
      )}

      <button type="submit" disabled={form.formState.isSubmitting}>
        Tạo Nhân Viên
      </button>
    </form>
  )
}
```

### Custom Form Handler Hook

ERMS có shared hook `useFormHandler` cho common form patterns:

```typescript
// hooks/use-form-handler.ts
// Wraps React Hook Form with standard error handling,
// loading states, and success callbacks
```

## URL State

State trong URL parameters cho filtering/pagination:

```typescript
import { useSearchParams } from 'next/navigation'

function JobList() {
  const searchParams = useSearchParams()
  const page = searchParams.get('page') || '1'
  const keyword = searchParams.get('keyword') || ''

  return (
    <div>
      <p>Trang: {page}</p>
      <p>Từ khóa: {keyword}</p>
    </div>
  )
}

// Cập nhật URL
import { useRouter } from 'next/navigation'

function JobFilter() {
  const router = useRouter()

  const handleSearch = (keyword: string) => {
    router.push(`/jobs?keyword=${encodeURIComponent(keyword)}`)
  }

  return <input onChange={(e) => handleSearch(e.target.value)} />
}
```

## Thực Hành Tốt Nhất

### 1. Bắt Đầu Cục Bộ, Di Chuyển Lên Khi Cần

```typescript
// ✅ Tốt - Bắt đầu với state cục bộ
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}

// ❌ Tệ - Ngay lập tức dùng state toàn cục
const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set(s => ({ count: s.count + 1 }))
}))
```

### 2. Tránh Prop Drilling Bằng Composition

```typescript
// ✅ Tốt - Sử dụng composition
function Page() {
  return (
    <Layout>
      <UserProfile />
    </Layout>
  )
}

// ❌ Tệ - Prop drilling qua nhiều levels
function Page() {
  const user = useUser()
  return <Layout user={user} />
}
```

### 3. Chia Nhỏ State Toàn Cục

```typescript
// ✅ Tốt - Chia theo domain
const useAuthStore = create(...)   // Auth only
const useAppStore = create(...)    // App UI only

// ❌ Tệ - Một store khổng lồ
const useStore = create((set) => ({
  user: null,
  token: null,
  theme: 'light',
  notifications: [],
  modals: {},
  // ... 100 fields nữa
}))
```

### 4. Sử Dụng Selectors

```typescript
// ✅ Tốt - Chỉ subscribe giá trị cần
function UserName() {
  const userName = useAuthStore(state => state.user?.fullName)
  return <span>{userName}</span>
}

// ❌ Tệ - Subscribe toàn bộ store → re-render khi bất kỳ field nào thay đổi
function UserName() {
  const { user } = useAuthStore()
  return <span>{user?.fullName}</span>
}
```

### 5. Server State ≠ Client State

```typescript
// ✅ Tốt - Dùng SWR cho server data
function EmployeeList() {
  const { data: employees } = useSWR('/api/Employees', fetcher)
  return <Table data={employees} />
}

// ❌ Tệ - Lưu server data vào Zustand
const useStore = create((set) => ({
  employees: [], // Không nên!
  fetchEmployees: async () => {
    const data = await fetch('/api/Employees')
    set({ employees: data })
  }
}))
```

---
