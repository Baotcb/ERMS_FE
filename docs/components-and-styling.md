# 🧱 Components Và Styling

## Thực Hành Tốt Nhất Cho Components

### Đặt Mọi Thứ Gần Nơi Sử Dụng Nhất Có Thể

Giữ components, functions, styles, state, v.v. gần nhất có thể với nơi chúng được sử dụng. Điều này không chỉ làm cho codebase dễ đọc và dễ hiểu hơn mà còn cải thiện hiệu năng của ứng dụng bằng cách giảm re-renders không cần thiết.

```typescript
// ❌ Tệ - Feature component trong shared components
// src/components/job-card.tsx
export const JobCard = () => {}

// ✅ Tốt - Feature component trong feature folder
// src/features/domains/jobs/components/job-card.tsx
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

// Hoặc dùng composition
<JobCard>
  <JobCard.Header {...headerProps} />
  <JobCard.Content {...contentProps} />
  <JobCard.Actions {...actionsProps} />
</JobCard>
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

[Ví Dụ Memoization - CandidateNavbar](../src/components/layout/candidate-navbar.tsx)

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

// Compound components
Dialog.Header = function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="dialog-header">{children}</div>
}

Dialog.Body = function DialogBody({ children }: { children: React.ReactNode }) {
  return <div className="dialog-body">{children}</div>
}

Dialog.Footer = function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="dialog-footer">{children}</div>
}

// Sử dụng
<Dialog open={open} onClose={handleClose}>
  <Dialog.Header>Tiêu đề</Dialog.Header>
  <Dialog.Body>Nội dung</Dialog.Body>
  <Dialog.Footer>Hành động</Dialog.Footer>
</Dialog>
```

## Thư Viện Components

ERMS sử dụng **shadcn/ui** - một thư viện component headless với các lợi ích:

### Tại Sao shadcn/ui?

- ✅ **Không phải package** - Copy code component vào project
- ✅ **Tùy biến được** - Toàn quyền kiểm soát components
- ✅ **Dễ tiếp cận** - Xây dựng trên Radix UI primitives
- ✅ **An toàn kiểu** - TypeScript first
- ✅ **Hiện đại** - Sử dụng các React patterns mới nhất

### Cấu Trúc Components

```
src/components/ui/
├── button.tsx          # Component button cơ bản
├── input.tsx           # Component input cơ bản
├── select.tsx          # Component select cơ bản
├── dialog.tsx          # Dialog primitives
├── dropdown-menu.tsx   # Dropdown menu
└── ...
```

[Components shadcn/ui](../src/components/ui/)

### Thêm Components Mới

```bash
# Thêm component mới từ shadcn/ui
npx shadcn-ui@latest add [component-name]

# Ví dụ
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
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

ERMS sử dụng **Tailwind CSS 4** cho styling với các lý do sau:

### Tại Sao Tailwind CSS?

- ✅ **Không có runtime** - Styles được tạo lúc build
- ✅ **An toàn kiểu** - với `tailwind-merge` và `class-variance-authority`
- ✅ **Utility-first** - Phát triển nhanh chóng
- ✅ **Responsive** - Tiếp cận mobile-first
- ✅ **Dark mode** - Hỗ trợ sẵn có
- ✅ **Hiệu năng** - Bundle size nhỏ

### Cấu Hình Tailwind

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#3f51b5',
          primary: '#2196f3',
          secondary: '#00bcd4',
          coral: '#ff4081',
          light: '#f5f7fa',
        },
      },
    },
  },
  plugins: [],
}
```

### Design Tokens

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --brand-dark: #3f51b5;
    --brand-primary: #2196f3;
    --brand-secondary: #00bcd4;
    --brand-coral: #ff4081;
    --brand-light: #f5f7fa;
    
    --radius: 0.5rem;
  }
}

@layer components {
  .btn-primary {
    @apply bg-brand-primary text-white rounded-lg px-4 py-2 hover:bg-brand-primary/90 transition-colors;
  }
}
```

### Sử Dụng Tailwind

```typescript
// ✅ Tốt - Các utility classes có ngữ nghĩa
<button className="bg-brand-primary text-white rounded-lg px-4 py-2 hover:bg-brand-primary/90 transition-colors">
  Nhấn vào đây
</button>

// ✅ Tốt hơn - Tách thành component
<Button variant="primary">Nhấn vào đây</Button>

// ✅ Tốt nhất - Sử dụng cva cho variants
const buttonVariants = cva('base-classes', {
  variants: {
    variant: {
      primary: 'brand-primary-classes',
      secondary: 'brand-secondary-classes',
    },
  },
})
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
// Bật dark mode trong Tailwind
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  Nội dung
</div>
```

## CSS Modules (Khi Cần)

Cho các animations hoặc styles phức tạp, có thể sử dụng CSS Modules:

```typescript
// component.module.css
.card {
  @apply bg-white rounded-lg shadow-md;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// component.tsx
import styles from './component.module.css'

export function Card() {
  return <div className={styles.card}>Nội dung</div>
}
```

## Kiểm Thử Components

### Unit Testing Components

```typescript
// button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('hiển thị đúng', () => {
    render(<Button>Nhấn vào đây</Button>)
    expect(screen.getByText('Nhấn vào đây')).toBeInTheDocument()
  })

  it('xử lý click', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Nhấn vào đây</Button>)
    
    fireEvent.click(screen.getByText('Nhấn vào đây'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('áp dụng variant styles', () => {
    render(<Button variant="destructive">Xóa</Button>)
    const button = screen.getByText('Xóa')
    expect(button).toHaveClass('bg-red-500')
  })
})
```

## Storybook (Khuyến Nghị)

Storybook là công cụ xuất sắc cho việc phát triển và kiểm thử components một cách độc lập.

### Cài Đặt

```bash
npm install --save-dev @storybook/react @storybook/addon-essentials
npx storybook init
```

### Ví Dụ Story

```typescript
// button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Xóa',
    variant: 'destructive',
  },
}
```

---


