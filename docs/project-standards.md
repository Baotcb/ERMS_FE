# ⚙️ Chuẩn Mực Dự Án

Áp dụng các chuẩn mực dự án là rất quan trọng để duy trì chất lượng code, sự nhất quán, và khả năng mở rộng trong ứng dụng ERMS. Bằng cách thiết lập và tuân theo các thực hành tốt nhất, lập trình viên có thể đảm bảo codebase luôn sạch sẽ, có tổ chức, và dễ bảo trì.

## ESLint

ESLint là công cụ linting quan trọng cho JavaScript, giúp lập trình viên duy trì chất lượng code và tuân theo các chuẩn mực coding. Bằng cách cấu hình các rules trong file `eslint.config.mjs`, ESLint giúp xác định và ngăn chặn các lỗi phổ biến, đảm bảo code chính xác và thúc đẩy sự nhất quán trong toàn bộ codebase.

### Cấu Hình

```javascript
// eslint.config.mjs
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  }
)
```

[Cấu Hình ESLint - ERMS](../eslint.config.mjs)

## Prettier (Khuyến Nghị)

Prettier là công cụ hữu ích cho việc duy trì định dạng code nhất quán. Bật tính năng "format on save" trong IDE để code tự động được định dạng theo các rules trong file `.prettierrc`.

### Cấu Hình

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

**Lưu ý**: ERMS hiện không bắt buộc Prettier nhưng khuyến khích sử dụng để đảm bảo sự nhất quán trong team.

## TypeScript

TypeScript là thiết yếu cho dự án ERMS để tăng cường an toàn kiểu dữ liệu và phát hiện lỗi sớm. Khi refactor, ưu tiên cập nhật khai báo kiểu trước, sau đó giải quyết các lỗi TypeScript trong toàn bộ dự án.

### Cấu Hình

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

[Cấu Hình TypeScript - ERMS](../tsconfig.json)

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

## Husky (Khuyến Nghị)

Husky được sử dụng để triển khai git hooks trong quy trình làm việc. Chạy kiểm tra code trước mỗi commit để đảm bảo chất lượng code và không có commit lỗi được push lên.

### Cài Đặt

```bash
npm install --save-dev husky
npx husky init
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
```

### Pre-push Hook

```bash
# .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run test
npm run build
```

**Lưu ý**: ERMS hiện chưa cài đặt Husky nhưng rất khuyến khích cho production.

## Absolute Imports

Absolute imports đã được cấu hình và nên luôn được sử dụng vì nó giúp dễ dàng di chuyển files và tránh các đường dẫn import rối rắm như `../../../component`.

### Cấu Hình

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

**Lợi ích:**
- ✅ Dễ dàng di chuyển files
- ✅ Imports sạch sẽ hơn
- ✅ Phân biệt rõ ràng với `node_modules`
- ✅ IDE autocomplete tốt hơn

## Quy Ước Đặt Tên File

ERMS áp dụng quy ước đặt tên file để duy trì sự nhất quán và dễ điều hướng.

### Quy Tắc

| Loại | Quy Ước | Ví Dụ |
|------|---------|-------|
| Components | kebab-case.tsx | `login-form.tsx` |
| Hooks | use-kebab-case.ts | `use-auth.ts` |
| Utils | kebab-case.ts | `error-handler.ts` |
| Types | kebab-case.ts | `auth-types.ts` |
| Constants | kebab-case.ts | `api-constants.ts` |

### Áp Dụng Với ESLint

```javascript
'check-file/filename-naming-convention': [
  'error',
  {
    '**/*.{ts,tsx}': 'KEBAB_CASE',
  },
  {
    ignoreMiddleExtensions: true,
  },
],
'check-file/folder-naming-convention': [
  'error',
  {
    'src/**/!(__tests__)': 'KEBAB_CASE',
  },
],
```

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

### Cấu Trúc Function

```typescript
/**
 * Mô tả function
 * 
 * @param param1 - Mô tả
 * @param param2 - Mô tả
 * @returns Mô tả
 */
export function functionName(param1: Type1, param2: Type2): ReturnType {
  // Triển khai
}
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
│   └── index.ts
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

## Hướng Dẫn Code Review

### Trước Khi Submit PR

- ✅ Chạy `npm run lint`
- ✅ Chạy `npm run type-check`
- ✅ Chạy `npm run test`
- ✅ Test thủ công trong browser
- ✅ Cập nhật documentation nếu cần
- ✅ Thêm commit messages có ý nghĩa

### Định Dạng Commit Message

```
type(scope): subject

body (tùy chọn)

footer (tùy chọn)
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

- Thêm forgot password form
- Triển khai gửi email
- Thêm reset password page

Closes #123
```

## Chuẩn Mực Hiệu Năng

- ✅ Memoize các components tốn kém với `React.memo`
- ✅ Sử dụng `useCallback` cho event handlers
- ✅ Sử dụng `useMemo` cho các tính toán tốn kém
- ✅ Debounce user inputs (search, filters)
- ✅ Lazy load các components nặng
- ✅ Tối ưu images với `next/image`
- ✅ Code split ở cấp độ route

## Chuẩn Mực Bảo Mật

- ✅ Sanitize tất cả user inputs
- ✅ Không bao giờ lưu dữ liệu nhạy cảm trong localStorage
- ✅ Sử dụng HTTPS trong production
- ✅ Triển khai CSP headers
- ✅ Validate data với Zod
- ✅ Sử dụng parameterized queries
- ✅ Triển khai rate limiting

## Chuẩn Mực Accessibility

- ✅ Sử dụng semantic HTML
- ✅ Thêm `aria-label` cho icon buttons
- ✅ Hỗ trợ điều hướng bằng bàn phím
- ✅ Độ tương phản màu phù hợp (WCAG AA)
- ✅ Chỉ báo focus
- ✅ Thân thiện với screen reader

---

**Tuân theo các chuẩn mực này đảm bảo:**
- 🎯 Chất lượng code nhất quán
- 🚀 Hiệu năng tốt hơn
- 🔒 Bảo mật được tăng cường
- 👥 Cộng tác dễ dàng hơn
- 📈 Codebase có khả năng mở rộng
