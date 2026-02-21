# Kế hoạch cập nhật Frontend: HR Applications Screening

## Tổng quan
Triển khai frontend cho màn hình **HR Screening Applications** - cho phép HR xem danh sách ứng viên, AI ranking, và thay đổi trạng thái CV (Forward to Dept Head).

---

## Backend API đã có

### 1. GET /api/applications/job/{jobPostingId}
- **Phân quyền**: HR Manager, Director
- **Query params**:
  - `pageNumber` (default: 1)
  - `pageSize` (default: 20)
  - `stageFilter` (optional): "Applied", "Shortlisted", etc.
- **Response**: Paginated list sắp xếp theo AI score (cao nhất trước)

### 2. PATCH /api/applications/{id}/forward
- **Phân quyền**: HR Manager
- **Request Body**:
  ```json
  {
    "HRNote": "Ghi chú HR (tối đa 2000 ký tự)"
  }
  ```
- **Chuyển stage**: "Applied" → "Shortlisted"

### 3. Application Stages (Enum)
```csharp
Applied → Reviewing → Shortlisted → InterviewScheduled → Interviewed → Offered → Hired
                                                            ↓
                                                        Rejected / Withdrawn
```

---

## Kế hoạch triển khai Frontend

### Phase 1: Types & Service Layer

#### 1.1 Types (`src/features/hr/types/application-types.ts`)
```typescript
// Application Stage
export type ApplicationStage =
  | 'Applied'
  | 'Reviewing'
  | 'Shortlisted'
  | 'InterviewScheduled'
  | 'Interviewed'
  | 'Offered'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn'

// CV Screening Result
export interface CVScreeningResult {
  overallScore: number
  skillMatchScore: number
  experienceMatchScore: number
  educationMatchScore: number
  keywordMatchScore: number
  matchedSkills: string[]
  missingSkills: string[]
  strengths: string[]
  concerns: string[]
  summary: string
}

// Application DTO
export interface ApplicationDto {
  id: string
  jobPostingId: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  stage: ApplicationStage
  status: string
  appliedAt: string
  stageUpdatedAt: string
  cvUrl: string
  hrNote?: string
  rejectionReason?: string
  cvScreeningResult?: CVScreeningResult
}

// Paginated Response
export interface ApplicationsResponse {
  data: ApplicationDto[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

// Forward Request
export interface ForwardApplicationRequest {
  hrNote?: string
}
```

#### 1.2 Service (`src/features/hr/api/application-service.ts`)
```typescript
import { apiClient } from '@/lib/api-client'
import type {
  ApplicationDto,
  ApplicationsResponse,
  ForwardApplicationRequest
} from '../types/application-types'

const BASE_URL = '/api/applications'

// Get applications by job posting
export async function getApplicationsByJob(
  jobPostingId: string,
  params?: {
    pageNumber?: number
    pageSize?: number
    stageFilter?: string
  }
): Promise<ApplicationsResponse> {
  const searchParams = new URLSearchParams()
  if (params?.pageNumber) searchParams.set('pageNumber', String(params.pageNumber))
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params?.stageFilter) searchParams.set('stageFilter', params.stageFilter)

  const response = await apiClient.get(
    `${BASE_URL}/job/${jobPostingId}?${searchParams}`
  )
  if (!response.ok) throw new Error('Không thể tải danh sách ứng tuyển')
  return response.json()
}

// Get application detail
export async function getApplicationById(id: string): Promise<ApplicationDto> {
  const response = await apiClient.get(`${BASE_URL}/${id}`)
  if (!response.ok) throw new Error('Không thể tải thông tin ứng tuyển')
  return response.json()
}

// Forward application to Dept Head
export async function forwardApplication(
  id: string,
  data: ForwardApplicationRequest
): Promise<ApplicationDto> {
  const response = await apiClient.patch(`${BASE_URL}/${id}/forward`, data)
  if (!response.ok) throw new Error('Không thể chuyển hồ sơ')
  return response.json()
}
```

#### 1.3 Hooks (`src/features/hr/hooks/use-applications.ts`)
```typescript
import { useData } from '@/lib/swr/hooks'
import useSWRMutation from 'swr/mutation'
import * as service from '../api/application-service'

export function useApplications(jobPostingId: string, params?: {
  pageNumber?: number
  pageSize?: number
  stageFilter?: string
}) {
  const key = jobPostingId ? [`/api/applications/job/${jobPostingId}`, JSON.stringify(params)] : null
  return useData(key, {
    fetcher: () => service.getApplicationsByJob(jobPostingId, params),
  })
}

export function useApplication(id: string) {
  return useData(id ? `/api/applications/${id}` : null, {
    fetcher: () => service.getApplicationById(id),
  })
}

export function useForwardApplication() {
  return useSWRMutation(
    '/api/applications/forward',
    (_, { arg }: { arg: { id: string; data: ForwardApplicationRequest } }) =>
      service.forwardApplication(arg.id, arg.data)
  )
}
```

---

### Phase 2: Components

#### 2.1 ApplicationTable Component (`src/features/hr/components/application/application-table.tsx`)

**Features:**
- Virtualized list (sử dụng `@tanstack/react-virtual`)
- Hiển thị: Candidate Name, Email, Stage, AI Score, Applied Date
- Filter by Stage
- Sort by AI Score (mặc định)
- Actions: View Detail, Forward (nếu Applied)

**Columns:**
| Column | Description |
|--------|-------------|
| Candidate | Name + Email |
| Stage | Badge with color |
| AI Score | Progress bar 0-100 |
| Applied At | Date format |
| Actions | View, Forward buttons |

#### 2.2 AIScoreBadge Component (`src/features/hr/components/application/ai-score-badge.tsx`)

**Features:**
- Hiển thị Overall Score 0-100
- Color gradient theo score:
  - 80-100: Green (Excellent)
  - 60-79: Blue (Good)
  - 40-59: Yellow (Fair)
  - 0-39: Red (Poor)
- Progress bar animation

#### 2.3 StageBadge Component (`src/features/hr/components/application/stage-badge.tsx`)

**Stage Colors:**
| Stage | Color |
|-------|-------|
| Applied | Gray |
| Reviewing | Blue |
| Shortlisted | Green |
| InterviewScheduled | Purple |
| Interviewed | Indigo |
| Offered | Amber |
| Hired | Emerald |
| Rejected | Red |
| Withdrawn | Gray |

#### 2.4 ApplicationDetailModal (`src/features/hr/components/application/application-detail-modal.tsx`)

**Features:**
- Hiển thị chi tiết CV Screening Result:
  - Overall Score + Progress bars
  - Matched Skills (tags)
  - Missing Skills (tags)
  - Strengths (list)
  - Concerns (list)
  - AI Summary
- Candidate info: Name, Email, Phone
- Applied date, Stage
- HR Note (textarea - edit được)
- Actions: Forward, Close

#### 2.5 ForwardApplicationDialog (`src/features/hr/components/application/forward-application-dialog.tsx`)

**Features:**
- Confirmation dialog
- HR Note textarea (optional, max 2000 chars)
- Character count
- Show: Current stage → New stage (Applied → Shortlisted)

---

### Phase 3: Pages

#### 3.1 Applications List Page (`src/app/enterprise/hr/job-postings/[id]/applications/page.tsx`)

**URL Pattern:** `/enterprise/hr/job-postings/{jobPostingId}/applications`

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  ← Back to Job Postings    Job Title Applications    │
├─────────────────────────────────────────────────────┤
│  Filter: [All] [Applied] [Shortlisted] [Rejected]   │
│  Search: [________________]                          │
├─────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────┐  │
│  │ ApplicationTable (virtualized)                │  │
│  │   - Row 1: Candidate A   [Applied]  85%      │  │
│  │   - Row 2: Candidate B   [Applied]  72%      │  │
│  │   - ...                                       │  │
│  └───────────────────────────────────────────────┘  │
│  Pagination: [< 1 2 3 >]                            │
└─────────────────────────────────────────────────────┘
```

**Key Features:**
- Breadcrumb navigation
- Stage filter tabs
- Search by candidate name/email
- Pagination
- Empty state illustration

---

### Phase 4: Navigation Updates

#### 4.1 Update JobPostingTable (`src/features/hr/components/job-posting/job-posting-table.tsx`)

**Thêm:**
- Cột "Applications" hiển thị số lượng ứng viên
- Click vào số → navigate đến Applications page
- Icon action "Xem hồ sơ" trong dropdown menu

**Modified Row:**
```tsx
<TableCell>
  <Link
    href={`/enterprise/hr/job-postings/${job.id}/applications`}
    className="flex items-center gap-1 hover:underline"
  >
    <span className="font-medium">{job.applicationCount}</span>
    <span className="text-xs text-muted-foreground">hồ sơ</span>
  </Link>
</TableCell>
```

#### 4.2 Update HRSidebar (Optional - nếu cần separate menu)

Không cần thiết nếu navigation thông qua Job Posting page.

---

## File Structure

```
src/features/hr/
├── types/
│   └── application-types.ts          [NEW]
├── api/
│   └── application-service.ts        [NEW]
├── hooks/
│   └── use-applications.ts           [NEW]
├── components/
│   └── application/
│       ├── index.ts                  [NEW]
│       ├── application-table.tsx     [NEW]
│       ├── application-detail-modal.tsx  [NEW]
│       ├── forward-application-dialog.tsx  [NEW]
│       ├── ai-score-badge.tsx        [NEW]
│       └── stage-badge.tsx           [NEW]
└── index.ts                          [UPDATE - export new components]

src/app/enterprise/hr/job-postings/
└── [id]/
    └── applications/
        └── page.tsx                  [NEW]
```

---

## UX/UI Considerations

### Color Palette for AI Score
```css
.score-excellent (80-100) → bg-green-500
.score-good (60-79)      → bg-blue-500
.score-fair (40-59)      → bg-yellow-500
.score-poor (0-39)       → bg-red-500
```

### Stage Badge Colors
```css
.Applied         → bg-slate-100 text-slate-700
.Reviewing       → bg-blue-100 text-blue-700
.Shortlisted     → bg-green-100 text-green-700
.InterviewScheduled → bg-purple-100 text-purple-700
.Interviewed     → bg-indigo-100 text-indigo-700
.Offered         → bg-amber-100 text-amber-700
.Hired           → bg-emerald-100 text-emerald-700
.Rejected        → bg-red-100 text-red-700
.Withdrawn       → bg-gray-100 text-gray-700
```

### Responsive Design
- Mobile: Card view thay vì table
- Tablet: Compact table
- Desktop: Full table with all columns

---

## Dependencies (đã có)
- `@tanstack/react-virtual` - Virtual scrolling
- `swr` / `swr/mutation` - Data fetching
- `lucide-react` - Icons
- `date-fns` - Date formatting
- Shadcn UI components (table, badge, dialog, etc.)

---

## Implementation Order

1. **Types** → Define data structures
2. **Service** → API calls
3. **Hooks** → Data fetching with SWR
4. **Components** → UI components
5. **Page** → Assemble components
6. **Navigation** → Update existing pages

---

## Testing Checklist

- [ ] Load applications list with pagination
- [ ] Filter by stage
- [ ] Search by candidate name/email
- [ ] View application detail modal
- [ ] Forward application with HR note
- [ ] Display AI scores correctly
- [ ] Show matched/missing skills
- [ ] Empty state handling
- [ ] Error handling (API failures)
- [ ] Loading states (skeletons)
- [ ] Responsive design (mobile/tablet)

---

## Notes

- Backend đã sort theo `CVScreeningResult.OverallScore` DESC
- Forward chỉ hoạt động khi stage = "Applied"
- HR Note max 2000 characters
- CV URL từ Cloudinary
