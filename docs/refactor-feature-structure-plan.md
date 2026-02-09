# Kế hoạch Refactor & Chuẩn hóa Cấu trúc Features Frontend

## 1. Mục tiêu
Tái cấu trúc thư mục `src/features/` để đảm bảo:
- **Single Source of Truth**: Loại bỏ code define trùng lặp (Types, API services).
- **Clear Ownership**: Code được đặt đúng nơi theo Role sở hữu nhiệm vụ (HR, Dept Head, Director, Candidate).
- **Maintainability**: Dễ bảo trì, dễ mở rộng, giảm coupling giữa các modules.
- **Shared Functionality**: Tách biệt rõ ràng các component/logic dùng chung.

---

## 2. Phân tích Hiện trạng & Vấn đề

### 2.1. Recruitment Plan (CRITICAL) 🔴
**Vấn đề:** Duplicate code và sai ownership.
- Tồn tại ở cả `features/hr/` và `features/dept-head/`.
- **Logic đúng:**
    - **Dept Head**: Owner (Tạo, Sửa).
    - **Director**: Approver (Duyệt).
    - **HR**: Viewer (Xem để tạo tuyển dụng).
- **Hành động:**
    - Xóa toàn bộ define về Recruitment Plan trong `features/hr/`.
    - Quy hoạch về `features/dept-head/` làm single source of truth.
    - Các features khác (HR, Director) sẽ import từ `features/dept-head/`.

### 2.2. CV Feature (MEDIUM) 🟡
**Vấn đề:** Feature nhỏ nằm lẻ loi.
- `features/cv/` chỉ có component upload.
- Nên thuộc về nghiệp vụ của Candidate.
- **Hành động:** Move vào `features/candidate/`.

### 2.3. Enterprise & Dashboard (LOW) 🟢
**Vấn đề:** Cấu trúc chưa rõ ràng cho các phần dùng chung.
- `features/enterprise/`: Chứa sidebar chung?
- `features/dashboard/`: Chứa widgets dashboard?
- **Hành động:** Quy hoạch vào `features/shared/` nếu là component dùng chung cho nhiều roles.

---

## 3. Cấu trúc Thư mục Mục tiêu (Proposed Structure)

```
src/features/
├── core/                    # System core (Auth, Config, User Profile)
│   ├── auth/
│   └── user-profile/
│
├── shared/                  # [NEW] Shared components & logic
│   ├── components/
│   │   ├── dashboard/       # Shared widgets (StatCard, Charts)
│   │   └── ui/              # Domain-specific UI reusing shadcn/ui
│   ├── types/               # Shared domain types (enums, interfaces)
│   └── hooks/               # Shared hooks
│
├── candidate/               # Candidate Role
│   ├── components/
│   │   ├── cv-upload/       # Moved from features/cv
│   │   └── jobs/            # Job search & apply view
│   ├── api/
│   └── types/
│
├── dept-head/               # Department Head Role
│   ├── components/
│   │   └── recruitment-plan/# [Main Owner] Plan management
│   ├── api/                 # recruitment-plan-service.ts
│   └── types/               # recruitment-plan-types.ts
│
├── hr/                      # HR Manager Role
│   ├── components/
│   │   ├── job-posting/     # Job management
│   │   ├── applications/    # Applicant screening
│   │   └── campaigns/       # Recruitment campaigns
│   ├── api/
│   └── types/
│
├── director/                # Director Role
│   ├── components/
│   │   └── approvals/       # Plan approval interface
│   └── ...
```

---

## 4. Kế hoạch Thực hiện Chi tiết

### Phase 1: Chuẩn hóa Shared & Core (Nền tảng)
1.  **Tạo `src/features/shared/`**:
    - Move `features/dashboard/` -> `features/shared/dashboard/`.
    - Move `features/enterprise/` components nếu dùng chung (Sidebar/Layout) -> `src/components/layout/` hoặc `features/shared/layout/`.
2.  **Review `src/features/core/`**: Đảm bảo Auth và User Profile ổn định.

### Phase 2: Refactor Recruitment Plan (Quan trọng nhất)
1.  **Xóa Duplicate ở HR:**
    - `rm src/features/hr/types/recruitment-plan-types.ts`
    - `rm src/features/hr/api/recruitment-plan-service.ts`
    - `rm -rf src/features/hr/components/recruitment-plan/`
2.  **Cập nhật Imports:**
    - Search globally: `from '@/features/hr/types/recruitment-plan-types'` -> Replace: `from '@/features/dept-head/types/recruitment-plan-types'`
    - Search globally: `from '@/features/hr/api/recruitment-plan-service'` -> Replace: `from '@/features/dept-head/api/recruitment-plan-service'`
3.  **Kiểm tra Logic:**
    - Đảm bảo HR screens vẫn load được data từ API của Dept Head (vì API backend thường chia theo resource, frontend gọi đúng service là được).

### Phase 3: Merge CV & Cleanup
1.  **Move CV:**
    - `mv src/features/cv/ src/features/candidate/components/cv-upload/` (hoặc merge logic).
    - Update imports từ `@/features/cv` -> `@/features/candidate`.
2.  **Xóa `src/features/cv/` rỗng.**

---

## 5. Quy tắc Phát triển Mới (Coding Standards)

1.  **API Services:**
    - Mỗi Role folder chứa API service tương ứng với quyền "Write" (Tạo/Sửa) của Role đó.
    - Role chỉ có quyền "Read" thì import service của Role "Write" (hoặc shared service nếu cần).

2.  **Components:**
    - UI Components cụ thể cho 1 feature đặt trong folder feature đó.
    - UI Generic dùng lại nhiều nơi đặt trong `src/components/ui` hoặc `features/shared`.

3.  **Types:**
    - Ưu tiên define types gần nơi sử dụng nhất (colocation).
    - Nếu type dùng chung > 2 features -> cân nhắc `shared/types`.

## 6. Checklist Kiểm tra (Verification)
- [ ] Build project (`npm run build`) không lỗi.
- [ ] Lint command (`npm run lint`) clean.
- [ ] HR Dashboard: Vẫn hiển thị thông tin Plan/Campaign đúng.
- [ ] Dept Head: Vẫn tạo được Plan.
- [ ] Candidate: Upload CV hoạt động bình thường.
