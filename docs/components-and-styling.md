# 🧱 Components Và Styling

## Thực Hành Tốt Nhất Cho Components

### Đặt Mọi Thứ Gần Nơi Sử Dụng Nhất Có Thể

Giữ components, functions, styles, state, v.v. gần nhất có thể với nơi chúng được sử dụng. Điều này không chỉ làm cho codebase dễ đọc và dễ hiểu hơn mà còn cải thiện hiệu năng của ứng dụng bằng cách giảm re-renders không cần thiết.

```typescript
// ❌ Tệ - Feature component trong shared components
// src/components/job-card.tsx
export const JobCard = () => {}

// ✅ Tốt - Feature component trong feature folder
// src/features/jobs/components/job-card.tsx
export const JobCard = () => {}
```

### Tránh Components Lớn Với Các Hàm Render Lồng Nhau

Không thêm nhiều hàm rendering bên trong component. Tách chúng thành các components riêng biệt.

```typescript
// ❌ Tệ - Các hàm rendering lồng nhau
function JobList() {
  function renderFilters() {
    return <div>{/* bộ lọc phức tạp */}</div>
  }

  function renderJobCards() {
    return jobs.map(job => <div key={job.id}>{/* card phức tạp */}</div>)
  }

  return (
    <div>
      {renderFilters()}
      {renderJobCards()}
    </div>
  )
}

// ✅ Tốt - Tách thành components riêng
function JobFilters() {
  return <div>{/* bộ lọc phức tạp */}</div>
}

function JobCards({ jobs }: { jobs: Job[] }) {
  return jobs.map(job => <JobCard key={job.id} job={job} />)
}

function JobList() {
  return (
    <div>
      <JobFilters />
      <JobCards jobs={jobs} />
    </div>
  )
}
```

### Giữ Sự Nhất Quán

Giữ code style nhất quán. ERMS sử dụng:
- ✅ PascalCase cho tên component
- ✅ kebab-case cho tên file
- ✅ Memoization với `React.memo`
- ✅ Named exports với memo pattern

```typescript
// ✅ ERMS Pattern
export const LoginForm = memo(function LoginForm() {
  return <form>...</form>
})
```

### Giới Hạn Số Lượng Props

Nếu component nhận quá nhiều props, cân nhắc chia nó thành nhiều components hoặc sử dụng kỹ thuật composition.

```typescript
// ❌ Tệ - Quá nhiều props
interface JobCardProps {
  title: string
  company: string
  location: string
  salary: string
  description: string
  requirements: string[]
  benefits: string[]
  isHot: boolean
  isFeatured: boolean
  onApply: () => void
  onSave: () => void
  onShare: () => void
}

// ✅ Tốt - Gom nhóm props hoặc composition
interface JobCardProps {
  job: Job
  actions: JobCardActions
}
```


## Các Pattern Cho Component

### Pattern Memoization

```typescript
'use client'

import { memo, useCallback, useMemo } from 'react'

interface Props {
  data: Data[]
  onSelect: (id: string) => void
}

export const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
  onSelect,
}: Props) {
  // Memoize các tính toán tốn kém
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item))
  }, [data])

  // Memoize callbacks
  const handleSelect = useCallback((id: string) => {
    onSelect(id)
  }, [onSelect])

  return <div>{/* UI */}</div>
})
```

### Pattern Composition

```typescript
interface DialogProps {
  children: React.ReactNode
  open: boolean
  onClose: () => void
}

export function Dialog({ children, open, onClose }: DialogProps) {
  if (!open) return null

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
```

## Thư Viện Components

ERMS sử dụng **shadcn/ui** - một thư viện component headless xây dựng trên Radix UI:

### Tại Sao shadcn/ui?

- ✅ **Không phải package** - Copy code component vào project
- ✅ **Tùy biến được** - Toàn quyền kiểm soát components
- ✅ **Dễ tiếp cận** - Xây dựng trên Radix UI primitives
- ✅ **An toàn kiểu** - TypeScript first
- ✅ **Hiện đại** - Sử dụng các React patterns mới nhất

### Danh Sách Components Hiện Có

```
src/components/ui/
├── alert-dialog.tsx    # Confirmation dialogs
├── alert.tsx           # Alert messages
├── avatar.tsx          # User avatars
├── badge.tsx           # Status badges
├── button.tsx          # Button variants
├── calendar.tsx        # Date picker calendar
├── card.tsx            # Card containers
├── checkbox.tsx        # Checkbox input
├── dialog.tsx          # Modal dialogs
├── dropdown-menu.tsx   # Dropdown menus
├── form.tsx            # React Hook Form integration
├── form-field.tsx      # Form field wrapper
├── input.tsx           # Text input
├── label.tsx           # Form labels
├── popover.tsx         # Popover containers
├── progress.tsx        # Progress bars
├── select.tsx          # Select dropdowns
├── separator.tsx       # Visual separators
├── sheet.tsx           # Side panels
├── skeleton.tsx        # Loading skeletons
├── switch.tsx          # Toggle switches
├── table.tsx           # Data tables
├── tabs.tsx            # Tab navigation
├── textarea.tsx        # Multi-line input
├── toast.tsx           # Toast notifications
└── tooltip.tsx         # Tooltips
```

### Thêm Components Mới

```bash
# Thêm component mới từ shadcn/ui
npx shadcn@latest add [component-name]

# Ví dụ
npx shadcn@latest add accordion
npx shadcn@latest add slider
```

### Tùy Biến Components

```typescript
// src/components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary text-white hover:bg-brand-primary/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

## Giải Pháp Styling

ERMS sử dụng **Tailwind CSS 4** với cú pháp mới (`@theme inline`, `@import`).

### Tại Sao Tailwind CSS?

- ✅ **Không có runtime** - Styles được tạo lúc build
- ✅ **Utility-first** - Phát triển nhanh chóng
- ✅ **Responsive** - Tiếp cận mobile-first
- ✅ **Dark mode** - Hỗ trợ sẵn có
- ✅ **Hiệu năng** - Bundle size nhỏ

### Cấu Hình Tailwind CSS 4

ERMS dùng Tailwind CSS 4 với cú pháp mới trong `globals.css`:

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Brand Colors - Deep Blue / Coral Theme */
  --color-brand-primary: #0F4C75;
  --color-brand-secondary: #BBE1FA;
  --color-brand-coral: #FF7E67;
  --color-brand-dark: #0F4C75;
  --color-brand-light: #F7F9FC;
  --color-brand-white: #FFFFFF;
  --color-brand-bg: #F7F9FC;

  /* shadcn/ui CSS variables mapping */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-destructive: var(--destructive);
  /* ... */

  /* Radius tokens */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... light mode variables */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... dark mode variables */
}
```

> **Chú ý:** Tailwind CSS 4 KHÔNG dùng `tailwind.config.ts`. Tất cả config nằm trong CSS bằng `@theme inline` và `@custom-variant`.

### Sử Dụng Brand Colors

```tsx
// Sử dụng brand colors trong components
<div className="bg-brand-primary text-white">Primary</div>
<div className="bg-brand-coral">Coral accent</div>
<div className="bg-brand-light">Light background</div>
<div className="bg-brand-secondary">Secondary blue</div>
```

### Sử Dụng shadcn/ui Colors

```tsx
// shadcn/ui semantic colors (auto dark mode)
<div className="bg-background text-foreground">Auto theme</div>
<div className="bg-card text-card-foreground">Card</div>
<div className="bg-muted text-muted-foreground">Muted</div>
<div className="bg-destructive">Error</div>
```

### Enterprise Scale Utility

ERMS có custom utility `enterprise-scale` để zoom UI cho enterprise portal:

```css
@layer utilities {
  @media (min-width: 1024px) {
    .enterprise-scale {
      zoom: 0.85;
      min-height: calc(100vh / 0.85);
    }
  }
}
```

### Responsive Design

```typescript
<div className="
  grid
  grid-cols-1        // Mobile
  md:grid-cols-2     // Tablet
  lg:grid-cols-3     // Desktop
  gap-4
  p-4
  lg:p-6
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Dark Mode

```typescript
// Sử dụng custom variant dark
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  Nội dung
</div>
```

## Shared Components (components/common/)

### Danh Sách Components Hiện Có

| Component | File | Mục Đích |
|-----------|------|----------|
| Alert | `alert.tsx` | Hiển thị thông báo (success, error, warning) |
| AvatarDropdown | `avatar-dropdown.tsx` | Menu dropdown cho user avatar |
| BrandLogo | `brand-logo.tsx` | Logo ERMS |
| DashboardWidgets | `dashboard/widget-containers.tsx` | Container cho dashboard cards |
| ErrorBoundary | `error-boundary.tsx` | Catch React errors |
| ErrorDialog | `error-dialog.tsx` | Dialog hiển thị lỗi |
| FileUpload | `file-upload.tsx` | Upload file (react-dropzone) |
| ImageUpload | `image-upload.tsx` | Upload ảnh (Cloudinary) |
| LoadingSpinner | `loading-spinner.tsx` | Loading indicator |
| Skeleton | `skeleton.tsx` | Loading skeleton |
| ListSkeleton | `skeletons/list-skeleton.tsx` | Skeleton cho danh sách |

### Layout Components

| Component | File | Mục Đích |
|-----------|------|----------|
| AuthNavbar | `auth-navbar.tsx` | Navbar trang auth |
| AuthFooter | `auth-footer.tsx` | Footer trang auth |
| BrandDecoration | `brand-decoration.tsx` | Trang trí brand gradient |
| CandidateNavbar | `candidate-navbar.tsx` | Navbar ứng viên |
| ClientLayoutElements | `client-layout-elements.tsx` | Client-side layout logic |
| FloatingMenu | `floating-menu.tsx` | Menu floating mobile |
| Footer | `footer.tsx` | Footer chung |
| NavItem | `nav-item.tsx` | Item trong sidebar |
| SettingsSidebar | `settings-sidebar.tsx` | Sidebar trang settings |

---
