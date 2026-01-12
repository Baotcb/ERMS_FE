# 🚀 Hướng Dẫn Nhanh ERMS

## Cài Đặt Ban Đầu

### 1. Clone Dự Án

```bash
git clone https://github.com/Baotcb/erms-fe.git
cd erms-fe
```

### 2. Cài Đặt Dependencies

```bash
npm install
```

### 3. Cấu Hình Environment

Tạo file `.env.local`:

```env
API_URL=http://localhost:5000
```

### 4. Chạy Development Server

```bash
npm run dev
```

Mở trình duyệt tại: http://localhost:3000

## Tài Khoản Test

### Ứng Viên
- **Email:** Candidate@gmail.com
- **Password:** Candidate123???

### Quản Trị Viên
- **Email:** Admin@gmail.com
- **Password:** Admin123???

## Cấu Trúc Thư Mục Cơ Bản

```
src/
├── app/              Trang web (routing)
├── features/         Logic nghiệp vụ
├── components/       UI components dùng chung
├── lib/              Thư viện tiện ích
└── stores/           Quản lý state toàn cục
```

## Quy Tắc Cơ Bản

### 1. Đặt Code Ở Đâu?

| Loại Code | Thư Mục | Ví Dụ |
|-----------|---------|-------|
| Trang web | `app/` | `app/(auth)/login/page.tsx` |
| Logic tính năng | `features/` | `features/core/auth/` |
| UI dùng chung | `components/` | `components/ui/button.tsx` |
| Utilities | `lib/` hoặc `utils/` | `lib/security.ts` |
| Global state | `stores/` | `stores/auth-store.ts` |

### 2. Tạo Feature Mới

```bash
# Tạo thư mục
mkdir -p src/features/domains/ten-feature

# Cấu trúc bên trong
features/ten-feature/
├── api/              # API calls
├── components/       # UI components
├── hooks/            # Custom hooks
└── index.ts          # Exports
```

### 3. Naming Convention

| Loại | Quy Tắc | Ví Dụ |
|------|---------|-------|
| Component | PascalCase | `LoginForm` |
| File | kebab-case | `login-form.tsx` |
| Function | camelCase | `handleSubmit` |
| Constant | UPPER_CASE | `API_BASE_URL` |

## Commands Thường Dùng

```bash
# Development
npm run dev                 # Chạy dev server
npm run build              # Build production
npm start                  # Chạy production

# Code Quality
npm run lint               # Kiểm tra lỗi code
npm run type-check         # Kiểm tra TypeScript
```

## Workflow Đơn Giản

### Thêm Tính Năng Mới

1. **Tạo branch**
   ```bash
   git checkout -b feature/ten-tinh-nang
   ```

2. **Viết code**
   - Tạo folder trong `features/`
   - Viết components, API, validation

3. **Commit**
   ```bash
   git add .
   git commit -m "feat: thêm tính năng xyz"
   git push
   ```

### Sửa Bug

1. **Tạo branch**
   ```bash
   git checkout -b fix/ten-bug
   ```

2. **Sửa code**

3. **Commit**
   ```bash
   git commit -m "fix: sửa lỗi xyz"
   git push
   ```

## Tips Hữu Ích

### Import Paths

```typescript
// ✅ Tốt - Absolute imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/core/auth'

// ❌ Tránh - Relative imports
import { Button } from '../../../components/ui/button'
```

### Component Pattern

```typescript
'use client'

import { memo } from 'react'

export const MyComponent = memo(function MyComponent() {
  return <div>Nội dung</div>
})
```

### API Call Pattern

```typescript
// features/domains/jobs/api/jobs-service.ts
export async function getJobs(): Promise<Job[]> {
  const response = await fetch(`${API_BASE}/api/jobs`)
  return handleApiResponse<Job[]>(response, 'Lỗi tải việc làm')
}
```

## Tài Liệu Chi Tiết

- 📖 [Cấu Trúc Dự Án](./project-structure.md) - Chi tiết về cấu trúc
- 🧱 [Components](./components-and-styling.md) - Cách viết components
- 🗃️ [State Management](./state-management.md) - Quản lý state
- ⚙️ [Standards](./project-standards.md) - Coding standards


**Happy vibing! 🎉**
