# 🗃️ Quản Lý State

Quản lý state hiệu quả là rất quan trọng cho việc tối ưu hiệu năng. Thay vì lưu toàn bộ state trong một kho lưu trữ duy nhất, hãy chia nó thành các danh mục dựa trên cách sử dụng.

## Component State

Component state là dành riêng cho từng component và không nên được chia sẻ toàn cục. Có thể truyền xuống các component con như props khi cần thiết.

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

function JobList() {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  // ...
}
```

## Application State

State toàn cục cho những thứ như thông tin user, state UI (modals, notifications), theme, v.v.

### Zustand (ERMS Sử Dụng)

```typescript
// stores/auth-store.ts
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

// Sử dụng
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

[Ví Dụ Auth Store](../src/stores/auth-store.ts)

### Context + Hooks

Cho state nhỏ, cục bộ:

```typescript
// contexts/theme-context.tsx
const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme phải được sử dụng trong ThemeProvider')
  return context
}
```

## Server Cache State

Dữ liệu lấy từ server nên được cache đúng cách. Thay vì lưu trong Redux, hãy sử dụng các thư viện chuyên biệt.


## Form State

Forms yêu cầu xử lý đặc biệt cho validation, submission, errors, v.v.

### React Hook Form + Zod 

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  salary: z.string(),
})

type FormData = z.infer<typeof schema>

function CreateJobForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      salary: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    await createJob(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('title')} />
      {form.formState.errors.title && (
        <span>{form.formState.errors.title.message}</span>
      )}
      
      <button type="submit">Tạo Việc Làm</button>
    </form>
  )
}
```

[Ví Dụ Form](../src/features/core/auth/components/register-form.tsx)

## URL State

State trong URL parameters hoặc query strings:

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

## Thực Hành Tốt Nhất Quản Lý State

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

// ❌ Tệ - Prop drilling
function Page() {
  const user = useUser()
  return <Layout user={user} />
}

function Layout({ user }) {
  return <Sidebar user={user} />
}

function Sidebar({ user }) {
  return <UserProfile user={user} />
}
```

### 3. Chia Nhỏ State Toàn Cục

```typescript
// ✅ Tốt - Chia theo domain
const useAuthStore = create(...)
const useUIStore = create(...)
const useNotificationStore = create(...)

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
// ✅ Tốt - Sử dụng selectors
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

---
