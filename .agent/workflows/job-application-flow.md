---
description: Luồng tạo post (HR) - Apply job (Candidate) - Screen CV (HR) - Đổi status (HR)
---

# Luồng Tuyển Dụng Hoàn Chỉnh

## Tổng quan

Luồng tuyển dụng trong hệ thống ERMS bao gồm 4 bước chính:

1. **HR tạo tin tuyển dụng** (Create Job Posting)
2. **Candidate ứng tuyển** (Apply Job)
3. **AI tự động chấm CV** (Auto CV Screening)
4. **HR quản lý và đổi trạng thái** (Manage Applications & Change Status)

---

## 1. HR Tạo Tin Tuyển Dụng

### Trang: `/enterprise/hr/job-postings/create`

**Component:** `CreateJobPostingForm`

**Tính năng:**
- Form tạo tin tuyển dụng với 3 sections:
  - **Thông tin cơ bản**: Plan Detail ID, Tiêu đề, Số lượng, Hình thức, Địa điểm, Hạn nộp
  - **Lương thưởng & Phúc lợi**: Mức lương min/max, Hiển thị công khai
  - **Chi tiết công việc**: Mô tả, Yêu cầu, Quyền lợi

**UI/UX Improvements:**
- Layout 3 cột với sidebar hướng dẫn
- Step indicators (1, 2, 3) cho từng section
- Color-coded sections
- Tooltips cho các trường phức tạp
- Validation rõ ràng với error messages

**API Endpoint:**
```
POST /api/job-postings
```

**Trạng thái sau khi tạo:** Job Posting được publish và hiển thị công khai

---

## 2. Candidate Ứng Tuyển

### Trang: `/jobs/[id]`

**Component:** `PublicJobDetail`

**Tính năng:**
- Hiển thị chi tiết công việc:
  - Tiêu đề, Công ty, Mức lương, Địa điểm, Kinh nghiệm, Hạn nộp
  - Mô tả công việc, Yêu cầu, Quyền lợi
- Nút "Ứng tuyển ngay" mở dialog form
- Lưu tin, Chia sẻ

**Dialog:** `JobApplyForm`
- Upload CV (PDF, max 5MB)
- Tự động extract text từ PDF
- Gửi lên server

**UI/UX Improvements:**
- Gradient background
- Sticky header với Save/Share buttons
- Info cards với color-coded icons
- Premium Apply button với gradient và hover effects
- Clean company sidebar

**API Endpoint:**
```
POST /api/applications
Content-Type: multipart/form-data
Body: { jobPostingId, cvFile }
```

**Quy trình Backend:**
1. Upload CV lên Cloudinary
2. Extract text từ PDF
3. Gọi AI (Gemini) để chấm điểm CV
4. Lưu Application với CVScreeningResult
5. Trạng thái mặc định: `Applied`

---

## 3. AI Tự Động Chấm CV

**Diễn ra tự động khi Candidate submit application**

**AI Scoring Metrics:**
- `overallScore`: Điểm tổng (0-1)
- `skillMatchScore`: Kỹ năng phù hợp
- `experienceMatchScore`: Kinh nghiệm
- `educationMatchScore`: Học vấn
- `keywordMatchScore`: Từ khóa

**AI Analysis:**
- `matchedSkills`: Danh sách kỹ năng phù hợp
- `missingSkills`: Kỹ năng còn thiếu
- `strengths`: Điểm mạnh
- `concerns`: Điểm cần lưu ý
- `summary`: Tóm tắt đánh giá

---

## 4. HR Quản Lý Hồ Sơ & Đổi Trạng Thái

### Trang: `/enterprise/hr/job-postings/[id]/applications`

**Component:** `ApplicationsView`

**Tính năng:**
- **Filters:**
  - Lọc theo trạng thái: All, Applied, Reviewing, Shortlisted, InterviewScheduled, Interviewed, Offered, Hired, Rejected
  - Tìm kiếm theo tên/email (client-side)

- **Table:** `ApplicationTable`
  - Hiển thị: Avatar, Tên, Email, Trạng thái, AI Match Score, Ngày nộp
  - Actions: Xem chi tiết, Tải CV, Chuyển tiếp (Shortlist), Từ chối

**UI/UX Improvements:**
- Rounded filter pills với active states
- Search bar với icon
- Avatar cho candidates
- Star icon cho high-match candidates (≥80%)
- Hover effects và transitions

### Modal: `ApplicationDetailModal`

**Tính năng:**
- **Header:** Avatar, Tên, Email, Phone, Ngày ứng tuyển, AI Score
- **Main Content:**
  - Đánh giá tổng quan từ AI (Summary)
  - Điểm mạnh / Cần lưu ý
  - Kỹ năng phù hợp / Thiếu
  - Link tải CV
- **Sidebar:**
  - Chi tiết điểm số (Experience, Skills, Education, Keywords)
  - Ghi chú HR
  - Actions: Chuyển tiếp (Shortlist), Từ chối

**UI/UX Improvements:**
- Dark header với gradient background
- Color-coded sections (Green = Strengths, Amber = Concerns)
- Animated progress bars cho scores
- Premium button styling
- Sticky sidebar với actions

### Dialog: `ForwardApplicationDialog`

**Tính năng:**
- Chuyển hồ sơ từ `Applied` → `Shortlisted`
- Thêm ghi chú HR (optional, max 2000 chars)
- Gửi cho Department Head để xem xét

**API Endpoint:**
```
PATCH /api/applications/{id}/forward
Body: { hrNote?: string }
```

**Trạng thái sau khi forward:** `Shortlisted`

---

## Các Trạng Thái Application

| Stage | Mô tả | Ai có thể thay đổi |
|-------|-------|-------------------|
| `Applied` | Vừa nộp hồ sơ | System (auto) |
| `Reviewing` | HR đang xem xét | HR |
| `Shortlisted` | Đã sơ tuyển, chuyển cho Dept Head | HR (via Forward) |
| `InterviewScheduled` | Đã lên lịch phỏng vấn | Dept Head / HR |
| `Interviewed` | Đã phỏng vấn | Dept Head / HR |
| `Offered` | Đã gửi offer | HR / Director |
| `Hired` | Đã tuyển dụng | HR |
| `Rejected` | Từ chối | HR / Dept Head |

---

## Checklist Hoàn Thiện

### ✅ Đã hoàn thành:

**Frontend:**
- [x] Trang tạo tin tuyển dụng (HR)
- [x] Trang chi tiết công việc (Public)
- [x] Form ứng tuyển với upload CV
- [x] Trang quản lý hồ sơ ứng tuyển (HR)
- [x] Bộ lọc theo trạng thái
- [x] Tìm kiếm ứng viên
- [x] Modal xem chi tiết hồ sơ + AI Score
- [x] Dialog chuyển tiếp hồ sơ (Forward to Shortlist)
- [x] UI/UX premium cho tất cả các trang

**Backend:**
- [x] API tạo job posting
- [x] API submit application
- [x] Upload CV lên Cloudinary
- [x] Extract text từ PDF
- [x] AI scoring với Gemini
- [x] API lấy danh sách applications (có filter, pagination)
- [x] API forward application (change status)

### 🚧 Cần bổ sung (Future):

- [ ] Chức năng "Reject" application (API + UI)
- [ ] Thay đổi trạng thái khác (Interview, Offer, Hire)
- [ ] Notification cho candidate khi status thay đổi
- [ ] Email notification
- [ ] Export danh sách ứng viên
- [ ] Bulk actions (Reject nhiều, Forward nhiều)
- [ ] Advanced search (theo kỹ năng, kinh nghiệm, điểm AI)
- [ ] CV preview trong modal (hiện tại chỉ có link download)
- [ ] Plan Detail selector (hiện tại phải nhập UUID thủ công)

---

## Hướng Dẫn Sử Dụng

### Cho HR:

1. **Tạo tin tuyển dụng:**
   - Vào `/enterprise/hr/job-postings`
   - Click "Tạo tin mới"
   - Điền form (cần có Plan Detail ID đã được duyệt)
   - Submit

2. **Quản lý hồ sơ:**
   - Vào `/enterprise/hr/job-postings`
   - Click vào tin tuyển dụng
   - Click "Xem hồ sơ ứng tuyển"
   - Lọc, tìm kiếm, xem chi tiết
   - Chuyển tiếp hồ sơ tốt cho Dept Head

### Cho Candidate:

1. **Tìm việc:**
   - Vào `/jobs`
   - Tìm kiếm, lọc công việc
   - Click vào tin tuyển dụng

2. **Ứng tuyển:**
   - Click "Ứng tuyển ngay"
   - Upload CV (PDF)
   - Submit
   - Nhận kết quả AI screening ngay lập tức

---

## Technical Stack

- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS, shadcn/ui
- **Backend:** .NET 8, ASP.NET Core, MediatR, Entity Framework Core
- **AI:** Google Gemini API
- **Storage:** Cloudinary (CV files)
- **Database:** SQL Server

---

## Notes

- Tất cả các trang đã được cải thiện UI/UX theo design system
- Responsive trên mobile, tablet, desktop
- Loading states và error handling đầy đủ
- Animations và transitions mượt mà
- Color-coded sections để dễ nhận diện
- Tooltips và helper text rõ ràng
