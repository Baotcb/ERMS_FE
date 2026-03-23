# 🚀 Hướng Dẫn Nhanh (Quick Start)

## Yêu Cầu Hệ Thống

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**

## Setup Project

### 1. Clone Repository

```bash
git clone -b dev <repo-url> ERMS_FE
cd ERMS_FE
```

### 2. Cài Dependencies

```bash
npm install
```

### 3. Cấu Hình Environment

Copy file `.env.example` thành `.env.local` và điền các giá trị:

```bash
cp .env.example .env.local
```

Các biến cần thiết:

```env
# Backend API URL (server-side proxy)
API_URL=https://your-backend-url

# Fallback (nếu API_URL không set)
NEXT_PUBLIC_API_URL=https://your-backend-url

# Cloudinary (upload CV, avatar)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset

# Google OAuth (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Chạy Development Server

```bash
npm run dev
```

Mở browser tại `http://localhost:3000`.

### 5. Build Production

```bash
npm run build
npm start
```

### 6. Lint

```bash
npm run lint
```



## Tech Stack Tóm Tắt

| Công Nghệ | Version | Vai Trò |
|-----------|---------|---------|
| Next.js | 16.x | Framework (App Router, SSR) |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | latest | UI Components |
| Zustand | 5.x | Global State |
| SWR | 2.x | Server Data Fetching |
| React Hook Form | 7.x | Form Management |
| Zod | 4.x | Validation |

## Cấu Trúc Thư Mục Chính

```
src/
├── app/           # Routes & pages
├── components/    # Shared UI components
├── features/      # Business logic modules
├── hooks/         # Shared hooks
├── lib/           # Configured libraries
├── stores/        # Zustand stores
├── types/         # Global types
├── utils/         # Helper functions
└── middleware.ts   # Auth & security
```

Xem chi tiết: [Cấu Trúc Dự Án](./project-structure.md)

## Các URL Portal

| Portal | URL | Role |
|--------|-----|------|
| Landing/Candidate | `http://localhost:3000/` | Public / Candidate |
| HR Dashboard | `http://localhost:3000/enterprise/hr/dashboard` | HRManager, HR |
| Dept Head Dashboard | `http://localhost:3000/enterprise/dept-head/dashboard` | DepartmentHead |
| Director Dashboard | `http://localhost:3000/enterprise/director/dashboard` | Director |
| Employee Dashboard | `http://localhost:3000/enterprise/employee/dashboard` | Employee |

## Troubleshooting

### API không kết nối
- Kiểm tra `API_URL` trong `.env.local`
- Đảm bảo backend đang chạy
- Kiểm tra CORS settings

### Build lỗi TypeScript
```bash
npm run lint
```
Fix các lỗi TypeScript trước khi build.

### Cloudinary upload không hoạt động
- Kiểm tra `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` và `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

---
