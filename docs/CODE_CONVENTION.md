# QUY CHUẨN KỸ THUẬT & QUY TRÌNH QUẢN LÝ MÃ NGUỒN (CODE CONVENTION & RULES)
**Dự án:** Hệ thống Tuyển dụng và Đào tạo Nội bộ (ERMS)
**Phiên bản:** 1.0
**Ngày hiệu lực:** 26/12/2025

---

## 1. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1.  **Safety First:** Mọi đoạn code liên quan đến input/output dữ liệu đều phải có Validation và Sanitization.
2.  **User-Centric:** Ưu tiên UX/UI mượt mà, tốc độ phản hồi nhanh.
3.  **Maintainability:** Code phải dễ đọc hơn dễ viết. Viết code cho người sau đọc.
4.  **Single Source of Truth:** Dữ liệu không được lưu rải rác. State quản lý tập trung (Zustand).

---

## 2. TECH STACK & STANDARD

*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript (Strict mode: ON, `noImplicitAny`: TRUE)
*   **Styling:** Tailwind CSS v4 + Shadcn UI
*   **State Management:** Zustand (Client State)
*   **Form & Validation:** React Hook Form + Zod
*   **Testing:** Jest + React Testing Library

---

## 3. CẤU TRÚC THƯ MỤC (DIRECTORY STRUCTURE)

Tuân thủ kiến trúc Feature-based kết hợp Layered Architecture của Next.js:

```
src/
├── app/                          # Routing & Layouts (Server Components mặc định)
│   ├── (auth)/                   # Route Group: Auth (Login, Register)
│   ├── (dashboard)/              # Route Group: Dashboard (Protected)
│   │   ├── candidates/           # Feature: Tuyển dụng
│   │   ├── training/             # Feature: Đào tạo
│   │   └── settings/             # Feature: Cấu hình
│   ├── api/                      # Backend API Routes
│   ├── globals.css               # Global Styles
│   └── layout.tsx                # Root Layout
│
├── components/                   # Shared Components
│   ├── ui/                       # Shadcn/Base Components (Button, Input...)
│   ├── common/                   # Components dùng chung (Header, Footer, Sidebar)
│   └── [feature]/                # (Optional) Nếu feature quá lớn có thể tách riêng
│
├── features/                     # (RECOMMENDED) Logic chi tiết cho từng nghiệp vụ
│   ├── recruitment/              # Module Tuyển dụng
│   │   ├── components/           # UI components đặc thù
│   │   ├── hooks/                # Custom hooks (e.g., useCandidate)
│   │   ├── types.ts              # Domain types
│   │   └── utils.ts              # Helper functions
│   └── training/                 # Module Đào tạo
│
├── hooks/                        # Global Hooks (useToast, useAuth)
├── lib/                          # Utils, configs, clients (db, axios)
├── stores/                       # Global State (Zustand stores)
├── types/                        # Global Types/Interfaces
└── contexts/                     # React Contexts (Theme, AuthWrapper)
```

---

## 4. QUY TẮC ĐẶT TÊN (NAMING CONVENTION)

| Đối tượng | Quy tắc | Ví dụ |
| :--- | :--- | :--- |
| **Thư mục (Dirs)** | kebab-case | `user-profile`, `auth-provider` |
| **File (.ts, .tsx)** | kebab-case | `page.tsx`, `nav-bar.tsx`, `utils.ts` |
| **Component** | PascalCase | `UserProfile`, `SubmitButton` |
| **Variable / Function** | camelCase | `isValid`, `fetchUserData`, `handleSubmit` |
| **Variable Constant** | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE`, `DEFAULT_PAGE_LIMIT` |
| **Interface / Type** | PascalCase | `User`, `CandidateProfile` (Không dùng prefix `I`) |
| **Custom Hook** | camelCase (prefix `use`) | `useAuth`, `useDebounce` |
| **Event Handler** | handle + Action | `handleSubmit`, `handleInputChange` |
| **Props Callback** | on + Action | `onSubmit`, `onValueChange` |

---

## 5. CODING STYLE & BEST PRACTICES

### 5.1. TypeScript
*   ❌ **KHÔNG** dùng `any`. Sử dụng `unknown` nếu chưa rõ kiểu và ép kiểu an toàn sau đó.
*   ✅ Định nghĩa Interface/Type rõ ràng cho mọi Props của Component.
*   ✅ Ưu tiên `type` cho Union/Intersection và `interface` cho Object definitions mở rộng được.

### 5.2. React & Next.js
*   **Server vs Client Components:** Mặc định viết Server Component (`async function`). Chỉ thêm `'use client'` khi cần state (`useState`, `useEffect`) hoặc event listeners.
*   **Hooks:** Đặt tất cả logic phức tạp vào Custom Hooks để giữ Component sạch sẽ (View only).
*   **Performance:**
    *   Sử dụng `next/image` cho mọi hình ảnh.
    *   Lazy load các component nặng (`next/dynamic`).

### 5.3. CSS & Tailwind
*   Sử dụng Utility classes làm chuẩn.
*   Tránh viết CSS thuần (`.css` files) trừ khi override thư viện bên thứ 3 phức tạp.
*   Sắp xếp class theo thứ tự logic (hoặc dùng `prettier-plugin-tailwindcss`): Layout -> Box Model -> Typography -> Visual -> Misc.
    *   *Ví dụ:* `flex items-center justify-between p-4 bg-white rounded-lg shadow`

### 5.4. Security 
*   **Data Masking:** Không log thông tin nhạy cảm (PII - Email, SĐT, CCCD) ra console production.
*   **Validation:** Validate cả Client-side (với Zod) và Server-side. Client-side chỉ để UX, Server-side để bảo mật.

---

## 6. QUY TRÌNH QUẢN LÝ SOURCE CODE (GIT WORKFLOW)

Sử dụng mô hình **Feature Branch**.

### 6.1. Nhánh (Branches)
*   `main`: Nhánh production, code luôn chạy được, đã qua test.
*   `develop` (hoặc `dev`): Nhánh development chính, nơi merge các feature về trước khi release.
*   `feature/[tên-chức-năng]`: Nhánh phát triển tính năng mới.
    *   *Ví dụ:* `feature/candidate-list`, `feature/login-page`
*   `fix/[tên-bug]`: Nhánh sửa lỗi.
    *   *Ví dụ:* `fix/login-error-toast`
*   `hotfix/[tên-bug-nghiêm-trọng]`: Sửa lỗi gấp trên production.

### 6.2. Commit Message
Format: `[Type]: [Short Description]`

**Type:**
*   `feat`: Tính năng mới
*   `fix`: Sửa lỗi
*   `ui`: Thay đổi giao diện
*   `chore`: Thay đổi cấu hình, build script, deps
*   `refactor`: Tối ưu code, cấu trúc lại
*   `test`: Test cases

**Ví dụ:**
*   `feat: thêm chức năng lọc ứng viên theo kỹ năng`
*   `fix: sửa lỗi validation form đăng ký`
*   `ui: cập nhật màu button theo design system mới`

### 6.3. Pull Request (PR)
*   Tiêu đề PR phải rõ ràng, map với ticket/task (nếu có).
*   Mô tả PR phải có:
    *   **What:** Làm cái gì?
    *   **Why:** Tại sao làm?
    *   **Screenshots:** (Nếu có thay đổi UI)
*   Reviewer phải check checklist trước khi Approve (Logic, Style, Security).

---

## 7. MÔI TRƯỜNG & BIẾN (ENV)

*   File `.env` không được commit lên git.
*   Sử dụng `.env.example` để liệt kê các biến cần thiết.
*   Các biến public (client-side) phải có prefix `NEXT_PUBLIC_`.

---

## 8. DEFINITION OF DONE (Tiêu chí hoàn thành)

Một task/feature được coi là hoàn thành khi:
1.  [ ] Code đúng logic & requirement.
2.  [ ] Đã format code .
3.  [ ] Không có lỗi type (TypeScript check).
4.  [ ] Đã test case cơ bản .
5.  [ ] Đã xóa các `console.log` debug.

---
*Tài liệu này được cập nhật định kỳ khi dự án phát triển.*
