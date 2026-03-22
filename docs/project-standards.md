# ⚙️ Chuẩn Mực Dự Án

Áp dụng các chuẩn mực dự án là rất quan trọng để duy trì chất lượng code, sự nhất quán, và khả năng mở rộng trong ứng dụng ERMS. Bằng cách thiết lập và tuân theo các thực hành tốt nhất, lập trình viên có thể đảm bảo codebase luôn sạch sẽ, có tổ chức, và dễ bảo trì.

## ESLint

ERMS sử dụng **ESLint 9.x** với flat config mới (`eslint.config.mjs`):

### Cấu Hình

```javascript
// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

Chạy lint:

```bash
npm run lint
```

## TypeScript

ERMS sử dụng **TypeScript 5.x** với strict mode. Cấu hình trong `tsconfig.json`.

**Thực Hành Tốt Nhất:**
- ✅ Luôn sử dụng kiểu dữ liệu rõ ràng
- ✅ Tránh kiểu `any`
- ✅ Dùng `unknown` thay vì `any` khi cần
- ✅ Ưu tiên `interface` hơn `type` cho objects
- ✅ Sử dụng utility types (`Partial`, `Pick`, `Omit`, v.v.)

### Mẹo TypeScript

```typescript
// ✅ Tốt - Kiểu dữ liệu rõ ràng
interface User {
  id: string
  email: string
  fullName?: string
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Tệ - any ngầm định
function getUser(id) {
  // ...
}

// ✅ Tốt - Sử dụng utility types
type UserUpdate = Partial<Omit<User, 'id'>>

// ✅ Tốt - Type guards
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  )
}
```

## Absolute Imports

Absolute imports đã được cấu hình với prefix `@/` mapping tới `./src/*`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Cách Sử Dụng

```typescript
// ❌ Tệ - Relative imports
import { LoginForm } from '../../../features/core/auth/components/login-form'

// ✅ Tốt - Absolute imports
import { LoginForm } from '@/features/core/auth'
```

## Quy Ước Đặt Tên File

| Loại | Quy Ước | Ví Dụ |
|------|---------|-------|
| Components | kebab-case.tsx | `login-form.tsx` |
| Hooks | use-kebab-case.ts | `use-auth.ts` |
| Utils | kebab-case.ts | `error-handler.ts` |
| Types | kebab-case.ts | `auth-types.ts`, `interview-types.ts` |
| Constants | kebab-case.ts | `constants.ts` |
| Services | kebab-case-service.ts | `employee-service.ts` |
| Schemas | kebab-case-schemas.ts | `auth-schemas.ts` |
| Stores | kebab-case-store.ts | `auth-store.ts` |

## Hướng Dẫn Code Style

### Cấu Trúc Component

```typescript
'use client'

import { memo, useCallback, useState } from 'react'
import { ComponentProps } from './types'

/**
 * ComponentName - Mô tả
 *
 * @param props - Component props
 * @returns JSX Element
 */
export const ComponentName = memo(function ComponentName({
  prop1,
  prop2,
}: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState()

  // 2. Callbacks
  const handleAction = useCallback(() => {
    // Logic
  }, [dependencies])

  // 3. Effects
  useEffect(() => {
    // Hiệu ứng phụ
  }, [dependencies])

  // 4. Render
  return <div>...</div>
})
```

### Cấu Trúc Feature

```
features/[feature-name]/
├── api/                    # Các lời gọi API
│   └── [feature]-service.ts
├── components/             # Components
│   ├── [component].tsx
│   └── index.ts
├── hooks/                  # Hooks
│   └── use-[feature].ts
├── schemas/                # Validation
│   └── [feature]-schemas.ts
├── types/                  # Kiểu dữ liệu
│   └── [feature]-types.ts
└── index.ts                # Exports công khai
```

## Quy Ước Đặt Tên

### Biến & Functions

```typescript
// ✅ camelCase cho biến và functions
const userCount = 10
function getUserById(id: string) {}

// ✅ PascalCase cho components và types
const LoginForm = () => {}
interface UserProfile {}

// ✅ SCREAMING_SNAKE_CASE cho constants
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3
```

### Biến Boolean

```typescript
// ✅ Tiền tố với is, has, should, can
const isAuthenticated = true
const hasPermission = false
const shouldRender = true
const canDelete = false

// ❌ Tệ
const authenticated = true
const permission = false
```

### Event Handlers

```typescript
// ✅ Tiền tố với handle, on
const handleClick = () => {}
const handleSubmit = () => {}
const onChange = () => {}

// ❌ Tệ
const click = () => {}
const submit = () => {}
```

## Thứ Tự Import

```typescript
// 1. React imports
import { useState, useEffect } from 'react'

// 2. Thư viện bên ngoài
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

// 3. Absolute imports nội bộ
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/core/auth'

// 4. Relative imports (tránh nếu có thể)
import { helper } from './utils'

// 5. Types
import type { User } from '@/types'

// 6. Styles
import './styles.css'
```

## Comments & Documentation

### JSDoc Comments

```typescript
/**
 * Đăng nhập user với credentials
 *
 * @param credentials - Email và password của user
 * @returns Response xác thực với token
 * @throws {ApiError} Khi credentials không hợp lệ
 *
 * @example
 * ```ts
 * const response = await login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * })
 * ```
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  // Triển khai
}
```

### Inline Comments

```typescript
// ✅ Tốt - Giải thích TẠI SAO, không phải LÀM GÌ
// Debounce để giảm số lần gọi API khi user đang gõ
const debouncedSearch = useDebounce(search, 300)

// ❌ Tệ - Comment hiển nhiên
// Set loading thành true
setLoading(true)
```

## Commit Message

```
type(scope): subject
```

**Các Types:**
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Thay đổi documentation
- `style`: Thay đổi code style (formatting)
- `refactor`: Code refactoring
- `perf`: Cải thiện hiệu năng
- `test`: Thêm hoặc cập nhật tests
- `chore`: Thay đổi build process hoặc công cụ hỗ trợ

**Ví dụ:**

```
feat(auth): thêm chức năng quên mật khẩu
fix(hr): sửa lỗi employee count trong department
docs(readme): cập nhật tài liệu cấu trúc dự án
refactor(jobs): tách job filtering thành file riêng
```

## Chuẩn Mực Hiệu Năng

- ✅ Memoize các components tốn kém với `React.memo`
- ✅ Sử dụng `useCallback` cho event handlers
- ✅ Sử dụng `useMemo` cho các tính toán tốn kém
- ✅ Debounce user inputs (search, filters) - dùng `useDebounce` hook
- ✅ Lazy load các components nặng
- ✅ Tối ưu images với `next/image`
- ✅ Code split ở cấp độ route (Next.js automatic)
- ✅ Sử dụng `@tanstack/react-virtual` cho danh sách lớn
- ✅ Dùng `optimizePackageImports` trong `next.config.ts`

## Chuẩn Mực Bảo Mật

- ✅ Sanitize tất cả user inputs (dùng `utils/sanitization.ts`)
- ✅ Không bao giờ lưu JWT trong localStorage (dùng HttpOnly cookies)
- ✅ CSRF protection qua middleware
- ✅ CSP headers tự động qua middleware
- ✅ Validate data với Zod schemas
- ✅ API proxy qua Next.js rewrites (ẩn backend URL)
- ✅ Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, etc.

## Chuẩn Mực Accessibility

- ✅ Sử dụng semantic HTML
- ✅ Thêm `aria-label` cho icon buttons
- ✅ Hỗ trợ điều hướng bằng bàn phím
- ✅ Độ tương phản màu phù hợp (WCAG AA)
- ✅ Chỉ báo focus
- ✅ Thân thiện với screen reader (Radix UI primitives)

---
