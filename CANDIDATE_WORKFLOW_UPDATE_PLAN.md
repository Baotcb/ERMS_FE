# Kế hoạch Cập nhật Frontend - Candidate Workflow

> **Ngày tạo**: 2026-02-09
> **Frontend**: C:\Users\fafac\erms1\ERMS_FE
> **Backend**: C:\Users\fafac\pj1\ERMS_System_BackEnd
> **Scope**: Cập nhật frontend theo screenflow và business workflow của Candidate

---

## Table of Contents
1. [Tổng quan về Candidate Screenflow](#1-tổng-quán-về-candidate-screenflow)
2. [Backend API đã có](#2-backend-api-đã-có)
3. [Frontend hiện tại](#3-frontend-hiện-tại)
4. [Kế hoạch cập nhật chi tiết](#4-kế-h hoạch-cập-nhật-chi-tiết)
5. [API Integration](#5-api-integration)
6. [Type Definitions](#6-type-definitions)
7. [Timeline](#7-timeline)

---

## 1. Tổng quan về Candidate Screenflow

### 1.1 Candidate Business Workflow (Theo ảnh screenflow)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CANDIDATE WORKFLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. BROWSE JOBS (Trang chủ/Tìm việc)
   ├── Tìm kiếm công việc
   ├── Lọc theo: Địa điểm, Loại hình, Kinh nghiệm, Lương
   └── Xem danh sách job cards

2. VIEW JOB DETAILS
   ├── Thông tin công việc
   ├── Yêu cầu / Quyền lợi
   ├── Thông tin công ty (Logo, Tên)
   └── [Nút] Ứng tuyển ngay / Lưu lại

3. APPLY TO JOB
   ├── Form ứng tuyển
   │   ├── Thông tin cá nhân (Họ tên, Email, SĐT)
   │   ├── Upload CV (PDF, max 5MB)
   │   └── Thư giới thiệu (optional)
   └── Kết quả AI Screening (hiển thị ngay)
       ├── Overall Score
       ├── Skill Match Score
       ├── Experience Match Score
       ├── Matched Skills
       └── Summary

4. MY APPLICATIONS
   ├── Danh sách ứng tuyển
   │   ├── Job Title
   │   ├── Company
   │   ├── Status (Applied, Screening, Shortlisted, Interview, etc.)
   │   └── Date Applied
   └── Xem chi tiết từng đơn

5. APPLICATION DETAILS
   ├── Job Information
   ├── Submitted CV (Link download)
   ├── Cover Letter
   └── AI Screening Results (chi tiết)

6. SAVED JOBS
   ├── Danh sách jobs đã lưu
   └── Bỏ lưu
```

---

## 2. Backend API đã có

### 2.1 Applications API

```typescript
// POST /api/applications - Ứng tuyển với CV
{
  "message": "Application submitted successfully.",
  "data": {
    "applicationId": "guid",
    "resumeId": "guid",
    "resumeUrl": "string",
    "stage": "Applied",
    "appliedAt": "datetime",
    "cvScreeningResult": {
      "overallScore": 0.85,
      "skillMatchScore": 0.90,
      "experienceMatchScore": 0.80,
      "educationMatchScore": 0.90,
      "matchedSkills": ["C#", ".NET", "SQL"],
      "missingSkills": ["Angular"],
      "strengths": ["Strong backend experience"],
      "summary": "Good match for the position"
    }
  }
}

// GET /api/applications/job/{jobPostingId} - HR/Director xem applications per job
// [KHÔNG CÓ] GET /api/applications - Candidate xem applications của mình
```

**⚠️ IMPORTANT**: Backend **CHƯA CÓ** API để:
- Candidate xem danh sách applications của mình
- Candidate xem chi tiết application
- Saved Jobs (save/unsave jobs)

### 2.2 Public Jobs API

```typescript
// GET /api/public/jobs - Danh sách jobs công khai
{
  "items": [...],
  "totalCount": 25,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 3
}

// GET /api/public/jobs/{id} - Chi tiết job
{
  "id": "guid",
  "jobTitle": "string",
  "jobCode": "string",
  "description": "string",
  "requirements": "string",
  "benefits": "string",
  "employmentType": "FullTime|PartTime|Contract|Internship",
  "experienceLevel": "string",
  "educationLevel": "string",
  "salaryRangeMin": decimal,
  "salaryRangeMax": decimal,
  "showSalary": bool,
  "location": "string",
  "remoteOption": "OnSite|Remote|Hybrid",
  "quantity": int,
  "applicationDeadline": "datetime",
  "publishedAt": "datetime",
  "enterpriseName": "string",
  "enterpriseLogoUrl": "string",
  "departmentName": "string"
}
```

### 2.3 Application Entity (Backend)

```csharp
public class Application {
    public Guid Id { get; set; }
    public Guid JobPostingId { get; set; }
    public Guid CandidateId { get; set; }
    public Guid? ResumeId { get; set; }
    public string? CoverLetter { get; set; }
    public decimal? ExpectedSalary { get; set; }
    public DateTime? AvailableStartDate { get; set; }
    public string Stage { get; set; } = "Applied"; // Applied, Screening, Shortlisted, Interview, Offer, Rejected, Hired
    public string Status { get; set; } = "Active";
    public DateTime AppliedAt { get; set; }

    // AI Screening
    public virtual CVScreeningResult CVScreeningResult { get; set; }
}
```

---

## 3. Frontend hiện tại

### 3.1 ĐÃ CÓ ✅

| Feature | File | Status |
|---------|------|--------|
| Job listings (public jobs) | `src/features/jobs/components/job-search-view.tsx` | ✅ Mock data, cần API |
| Job detail page | `src/features/jobs/components/public-job-detail.tsx` | ✅ Cần cập nhật types |
| Application form modal | `src/features/candidate/components/job-apply-form.tsx` | ✅ Có form, API đúng |
| CV upload with drag-drop | `src/features/candidate/components/job-apply-form.tsx` | ✅ PDF/DOC/DOCX, 5MB |
| Create application hook | `src/features/candidate/hooks/use-applications.ts` | ✅ SWR mutation |
| Application API service | `src/features/candidate/api/application-service.ts` | ⚠️ Sai field names |
| Application list page | `src/app/(candidate)/applications/page.tsx` | ✅ Route có, component mock |
| Saved jobs page | `src/app/(candidate)/jobs/saved/page.tsx` | ⚠️ Mock data only |
| Candidate navbar | `src/components/layout/candidate-navbar.tsx` | ✅ Có navigation |

### 3.2 CHƯA CÓ ❌

| Feature | Mô tả |
|---------|---------|
| **Get my applications API** | Backend không có endpoint này |
| **Application detail page** | Route `/applications/[id]` chưa có |
| **AI Screening Results Display** | Chưa hiển thị kết quả AI sau khi apply |
| **Saved Jobs API** | Backend không có save/unsave API |
| **Application status timeline** | Chưa có timeline view |
| **Job filters hoàn chỉnh** | Chỉ có search + location basic |

---

## 4. Kế hoạch cập nhật chi tiết

### Phase 1: Cập nhật Public Jobs API (High Priority)

#### 4.1.1 Cập nhật Public Job Types

**File**: `src/features/jobs/types.ts`

```typescript
// UPDATE existing types to match backend exactly
export interface PublicJobPostingDto {
    id: string
    jobTitle: string
    jobCode?: string
    description: string
    requirements?: string
    benefits?: string
    employmentType: 'FullTime' | 'PartTime' | 'Contract' | 'Internship'
    experienceLevel?: string
    educationLevel?: string
    salaryRangeMin?: number
    salaryRangeMax?: number
    showSalary: boolean
    location?: string
    remoteOption: 'OnSite' | 'Remote' | 'Hybrid'
    quantity: number
    applicationDeadline?: string
    publishedAt?: string
    enterpriseName: string
    enterpriseLogoUrl?: string
    departmentName: string
}

export interface PublicJobsResponse {
    items: PublicJobPostingDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
}
```

#### 4.1.2 Tạo Public Jobs API Service

**File mới**: `src/features/jobs/api/public-jobs-service.ts`

```typescript
import { apiClient } from '@/lib/api-client'
import type { PublicJobPostingDto, PublicJobsResponse } from '../types'

interface GetPublicJobsParams {
    pageNumber?: number
    pageSize?: number
    searchTerm?: string
    location?: string
    employmentType?: string
    experienceLevel?: string
    minSalary?: number
    maxSalary?: number
}

export async function getPublicJobs(params?: GetPublicJobsParams): Promise<PublicJobsResponse> {
    const searchParams = new URLSearchParams({
        PageNumber: String(params?.pageNumber ?? 1),
        PageSize: String(params?.pageSize ?? 10),
    })

    if (params?.searchTerm) searchParams.append('SearchTerm', params.searchTerm)
    if (params?.location) searchParams.append('Location', params.location)
    if (params?.employmentType) searchParams.append('EmploymentType', params.employmentType)
    if (params?.experienceLevel) searchParams.append('ExperienceLevel', params.experienceLevel)
    if (params?.minSalary) searchParams.append('MinSalary', String(params.minSalary))
    if (params?.maxSalary) searchParams.append('MaxSalary', String(params.maxSalary))

    const response = await apiClient.get(`/api/public/jobs?${searchParams}`)
    if (!response.ok) {
        throw new Error('Không thể tải danh sách công việc')
    }
    return response.json()
}

export async function getPublicJobById(id: string): Promise<PublicJobPostingDto> {
    const response = await apiClient.get(`/api/public/jobs/${id}`)
    if (!response.ok) {
        throw new Error('Không thể tải thông tin công việc')
    }
    return response.json()
}
```

---

### Phase 2: Application Detail & AI Screening Results Display (Critical)

#### 4.2.1 Route mới cho Application Details

**Tạo**: `src/app/(candidate)/applications/[id]/page.tsx`

```typescript
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ApplicationDetailView } from '@/features/candidate/components/application-detail-view'

export const metadata: Metadata = {
    title: 'Chi tiết đơn ứng tuyển | ERMS',
}

interface PageProps {
    params: { id: string }
}

export default function ApplicationDetailPage({ params }: PageProps) {
    return <ApplicationDetailView applicationId={params.id} />
}
```

#### 4.2.2 Application Detail Component với AI Screening Results

**Tạo**: `src/features/candidate/components/application-detail-view.tsx`

```typescript
'use client'

import { useApplication } from '../hooks/use-applications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, FileText, Calendar, Building2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

export function ApplicationDetailView({ applicationId }: { applicationId: string }) {
    const { data: application, isLoading, error } = useApplication(applicationId)

    if (isLoading) {
        return <ApplicationDetailSkeleton />
    }

    if (error || !application) {
        return <ApplicationErrorState />
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{application.jobTitle}</h1>
                    <p className="text-muted-foreground">{application.enterpriseName}</p>
                </div>
                <StatusBadge stage={application.stage} />
            </div>

            {/* Application Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin ứng tuyển</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InfoRow icon={<Calendar />} label="Ngày ứng tuyển" value={format(new Date(application.appliedAt), 'PPP', { locale: vi })} />
                    <InfoRow icon={<FileText />} label="Mã đơn hàng" value={application.id.slice(0, 8).toUpperCase()} />
                    {application.resumeUrl && (
                        <Button variant="outline" size="sm" asChild>
                            <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Tải CV
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* AI Screening Results Card */}
            {application.cvScreeningResult && (
                <ScreeningResultsCard results={application.cvScreeningResult} />
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
                <Card>
                    <CardHeader>
                        <CardTitle>Thư giới thiệu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{application.coverLetter}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

// Screening Results Card Component
function ScreeningResultsCard({ results }: { results: CVScreeningResult }) {
    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Kết quả đánh giá AI
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Score */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Điểm tổng quan</span>
                        <span className="text-sm font-bold">{(results.overallScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${results.overallScore * 100}%` }}
                        />
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ScoreItem
                        label="Kỹ năng"
                        score={results.skillMatchScore}
                        color="blue"
                    />
                    <ScoreItem
                        label="Kinh nghiệm"
                        score={results.experienceMatchScore}
                        color="green"
                    />
                    <ScoreItem
                        label="Học vấn"
                        score={results.educationMatchScore}
                        color="purple"
                    />
                </div>

                {/* Skills */}
                <div className="space-y-3">
                    <div>
                        <h4 className="text-sm font-medium mb-2 text-green-700">Kỹ năng phù hợp</h4>
                        <div className="flex flex-wrap gap-2">
                            {results.matchedSkills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="bg-green-50 text-green-700">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    {results.missingSkills.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2 text-orange-700">Kỹ năng còn thiếu</h4>
                            <div className="flex flex-wrap gap-2">
                                {results.missingSkills.map((skill) => (
                                    <Badge key={skill} variant="outline" className="border-orange-300 text-orange-700">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Strengths */}
                {results.strengths.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium mb-2">Điểm mạnh</h4>
                        <ul className="space-y-1">
                            {results.strengths.map((strength, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Summary */}
                {results.summary && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-900">{results.summary}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function ScoreItem({ label, score, color }: { label: string; score: number; color: string }) {
    const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
    }

    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">{label}</span>
                <span className="text-xs font-bold">{(score * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colors[color as keyof typeof colors]} rounded-full`}
                    style={{ width: `${score * 100}%` }}
                />
            </div>
        </div>
    )
}

function StatusBadge({ stage }: { stage: string }) {
    const statusConfig = {
        Applied: { label: 'Đã nộp', color: 'bg-gray-100 text-gray-700' },
        Screening: { label: 'Đang sàng lọc', color: 'bg-blue-50 text-blue-700' },
        Shortlisted: { label: 'Đã lọc', color: 'bg-green-50 text-green-700' },
        Interview: { label: 'Phỏng vấn', color: 'bg-purple-50 text-purple-700' },
        Offer: { label: 'Đề xuất', color: 'bg-yellow-50 text-yellow-700' },
        Hired: { label: 'Đã tuyển', color: 'bg-green-600 text-white' },
        Rejected: { label: 'Không phù hợp', color: 'bg-red-50 text-red-700' },
        Withdrawn: { label: 'Đã rút', color: 'bg-gray-50 text-gray-600' },
    }

    const config = statusConfig[stage as keyof typeof statusConfig] || statusConfig.Applied

    return <Badge className={config.color}>{config.label}</Badge>
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-muted-foreground">{icon}</div>
            <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    )
}

function ApplicationDetailSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

function ApplicationErrorState() {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy đơn ứng tuyển</h2>
            <p className="text-muted-foreground mb-6">Đơn ứng tuyển này có thể đã bị xóa hoặc bạn không có quyền truy cập.</p>
            <Button asChild>
                <a href="/applications">Quay lại danh sách</a>
            </Button>
        </div>
    )
}
```

---

### Phase 3: Cập nhật Application Types & API (Critical)

#### 4.3.1 Cập nhật Application Types

**Sửa**: `src/features/candidate/types/application-types.ts`

```typescript
// Match backend response exactly
export interface Application {
    id: string
    jobPostingId: string
    candidateId: string
    resumeId?: string
    resumeUrl?: string
    coverLetter?: string
    expectedSalary?: number
    availableStartDate?: string
    stage: ApplicationStage
    status: string
    appliedAt: string
    createdAt: string
    // Job info
    jobTitle: string
    jobCode?: string
    enterpriseName: string
    enterpriseLogoUrl?: string
    departmentName?: string
    // Screening Results
    cvScreeningResult?: CVScreeningResult
}

export type ApplicationStage =
    | 'Applied'
    | 'Screening'
    | 'Shortlisted'
    | 'Interview'
    | 'Offer'
    | 'Rejected'
    | 'Hired'
    | 'Withdrawn'

export interface CVScreeningResult {
    id: string
    applicationId: string
    overallScore: number
    skillMatchScore?: number
    experienceMatchScore?: number
    educationMatchScore?: number
    matchedSkills?: string // JSON string
    missingSkills?: string // JSON string
    strengths?: string // JSON string
    summary?: string
    concerns?: string // JSON string
}

// Parsed screening result (for display)
export interface ParsedScreeningResult {
    overallScore: number
    skillMatchScore: number
    experienceMatchScore: number
    educationMatchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    strengths: string[]
    summary: string
}

export interface CreateApplicationRequest {
    jobId: string
    cvFile: File
    fullName?: string
    email?: string
    phone?: string
    coverLetter?: string
}
```

#### 4.3.2 Cập nhật Application Service

**Sửa**: `src/features/candidate/api/application-service.ts`

```typescript
import { apiClient } from '@/lib/api-client'
import type { Application, CreateApplicationRequest } from '../types/application-types'

const BASE_URL = '/api/applications'

export async function createApplication(data: CreateApplicationRequest): Promise<{
    message: string
    data: {
        applicationId: string
        resumeId: string
        resumeUrl: string
        stage: string
        appliedAt: string
        cvScreeningResult?: any
    }
}> {
    const formData = new FormData()
    formData.append('JobPostingId', data.jobId)
    formData.append('CvFile', data.cvFile)

    if (data.fullName) formData.append('FullName', data.fullName)
    if (data.email) formData.append('Email', data.email)
    if (data.phone) formData.append('Phone', data.phone)
    if (data.coverLetter) formData.append('CoverLetter', data.coverLetter)

    const response = await apiClient.post(BASE_URL, formData)
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Không thể gửi đơn ứng tuyển')
    }
    return response.json()
}

// ⚠️ Backend CHƯA CÓ endpoint này - cần backend thêm
// export async function getMyApplications(): Promise<PaginatedResponse<Application>>

// ⚠️ Backend CHƯA CÓ endpoint này - cần backend thêm
// export async function getApplicationById(id: string): Promise<Application>
```

**⚠️ BLOCKER**: Backend chưa có API để candidate xem applications của mình.

---

### Phase 4: Hiển thị AI Screening Results ngay sau Apply (Critical)

#### 4.4.1 Cập nhật Job Apply Form để hiển thị kết quả AI

**Sửa**: `src/features/candidate/components/job-apply-form.tsx`

```typescript
// Thêm state để lưu kết quả screening
const [screeningResult, setScreeningResult] = useState<{
    overallScore: number
    skillMatchScore: number
    experienceMatchScore: number
    educationMatchScore: number
    matchedSkills: string[]
    missingSkills: string[]
    summary: string
} | null>(null)

const [showSuccess, setShowSuccess] = useState(false)

// Update onSubmit function
const onSubmit = async (data: ApplicationFormValues) => {
    try {
        const result = await applyJob({
            jobId,
            ...data,
            cvFile: data.cvFile,
        })

        // Lưu kết quả AI screening
        if (result.data.cvScreeningResult) {
            setScreeningResult(result.data.cvScreeningResult)
        }

        setShowSuccess(true)

        toast({
            title: 'Ứng tuyển thành công!',
            description: `Hồ sơ của bạn đã được gửi cho vị trí ${jobTitle}.`,
        })

        if (onSuccess) {
            setTimeout(() => onSuccess(), 3000) // Đợi user thấy kết quả
        }
    } catch (error) {
        console.error(error)
        toast({
            title: 'Lỗi',
            description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi hồ sơ.',
            variant: 'destructive',
        })
    }
}
```

---

### Phase 5: Application List với Status & Screening Summary

#### 4.5.1 Cập nhật Application List Component

**Sửa**: `src/features/candidate/components/application-list.tsx`

```typescript
'use client'

import { useApplications } from '../hooks/use-applications'
import { ApplicationCard } from './application-card'
import { EmptyState } from '@/components/shared/empty-state'
import { FileText } from 'lucide-react'

export function ApplicationList() {
    // ⚠️ Backend cần thêm API get-my-applications
    // Hiện tại dùng mock data
    const { data, isLoading, error } = useApplications({ page: 1, pageSize: 10 })

    if (isLoading) {
        return <ApplicationListSkeleton />
    }

    if (error || !data || data.items.length === 0) {
        return (
            <EmptyState
                icon={<FileText className="h-12 w-12" />}
                title="Chưa có đơn ứng tuyển nào"
                description="Hồ sơ ứng tuyển của bạn sẽ hiển thị ở đây sau khi bạn nộp đơn."
                action={{
                    label: 'Tìm việc làm ngay',
                    href: '/jobs'
                }}
            />
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Đơn ứng tuyển của tôi</h1>
                <span className="text-sm text-muted-foreground">{data.totalCount} đơn</span>
            </div>

            <div className="grid gap-4">
                {data.items.map((application) => (
                    <ApplicationCard key={application.id} application={application} />
                ))}
            </div>
        </div>
    )
}

// Application Card with Screening Summary
interface ApplicationCardProps {
    application: Application
}

function ApplicationCard({ application }: ApplicationCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="font-semibold text-base">{application.jobTitle}</h3>
                        <p className="text-sm text-muted-foreground">{application.enterpriseName}</p>
                    </div>
                    <StatusBadge stage={application.stage} />
                </div>

                {/* AI Screening Score Preview */}
                {application.cvScreeningResult && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">Điểm phù hợp AI</span>
                            <span className="text-sm font-bold text-blue-600">
                                {(application.cvScreeningResult.overallScore * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${application.cvScreeningResult.overallScore * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        {format(new Date(application.appliedAt), 'dd/MM/yyyy')}
                    </span>
                    <Button variant="link" size="sm" asChild>
                        <a href={`/applications/${application.id}`}>
                            Xem chi tiết →
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function ApplicationListSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
```

---

### Phase 6: Backend APIs Cần Thêm (Critical)

⚠️ **IMPORTANT**: Backend cần thêm các endpoints sau để frontend hoạt động đầy đủ:

```csharp
// ApplicationsController.cs - THÊM các endpoints này

/// <summary>
/// Get current candidate's applications with pagination
/// </summary>
[HttpGet("my")]
[Authorize(Roles = AppRoles.Candidate)]
[ProducesResponseType(typeof(PaginatedResponse<ApplicationDto>), StatusCodes.Status200OK)]
public async Task<IActionResult> GetMyApplications(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] string? stage = null)
{
    // Implementation needed
}

/// <summary>
/// Get application details for candidate
/// </summary>
[HttpGet("{id}")]
[Authorize(Roles = AppRoles.Candidate)]
[ProducesResponseType(typeof(ApplicationDetailDto), StatusCodes.Status200OK)]
public async Task<IActionResult> GetApplicationById(Guid id)
{
    // Implementation needed - check if application belongs to current candidate
}

// SavedJobsController.cs - TẠO MỚI controller mới

/// <summary>
/// Saved Jobs API for Candidates
/// </summary>
[Route("api/saved-jobs")]
[ApiController]
[Authorize(Roles = AppRoles.Candidate)]
public class SavedJobsController : ControllerBase
{
    /// <summary>
    /// Get candidate's saved jobs
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SavedJobDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSavedJobs()
    {
        // Implementation needed
    }

    /// <summary>
    /// Save a job posting
    /// </summary>
    [HttpPost("{jobPostingId}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> SaveJob(Guid jobPostingId)
    {
        // Implementation needed
    }

    /// <summary>
    /// Remove saved job
    /// </summary>
    [HttpDelete("{jobPostingId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> UnsaveJob(Guid jobPostingId)
    {
        // Implementation needed
    }
}
```

---

## 5. API Integration

### 5.1 Application API Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CANDIDATE APPLICATION FLOW                   │
└─────────────────────────────────────────────────────────────┘

1. SUBMIT APPLICATION
   POST /api/applications
   Content-Type: multipart/form-data
   Body: {
     JobPostingId: "guid",
     CvFile: File (PDF),
     FullName?: "string",
     Email?: "string",
     Phone?: "string",
     CoverLetter?: "string"
   }

   Response: {
     message: "Application submitted successfully.",
     data: {
       applicationId: "guid",
       resumeId: "guid",
       resumeUrl: "string",
       stage: "Applied",
       appliedAt: "datetime",
       cvScreeningResult: { ... }
     }
   }

2. GET MY APPLICATIONS (⚠️ CẦN BACKEND THÊM)
   GET /api/applications/my
   Headers: Authorization: Bearer {token}
   Query: ?page=1&pageSize=10&stage=Applied

   Response: {
     items: [{ application data with job info, screening results }],
     totalCount: 5,
     page: 1,
     pageSize: 10,
     totalPages: 1
   }

3. GET APPLICATION DETAILS (⚠️ CẦN BACKEND THÊM)
   GET /api/applications/{id}
   Headers: Authorization: Bearer {token}

   Response: {
     // Full application details with screening results
   }
```

---

## 6. Type Definitions

### 6.1 Complete Type Mappings

```typescript
// src/features/candidate/types/application-types.ts

export interface Application {
    // Backend fields
    id: string
    jobPostingId: string
    candidateId: string
    resumeId?: string
    resumeUrl?: string
    coverLetter?: string
    expectedSalary?: number
    availableStartDate?: string
    stage: ApplicationStage
    status: string
    appliedAt: string
    createdAt: string

    // Job info (from JobPosting navigation)
    jobTitle: string
    jobCode?: string
    enterpriseName: string
    enterpriseLogoUrl?: string
    departmentName?: string

    // Screening results
    cvScreeningResult?: CVScreeningResult
}

export type ApplicationStage =
    | 'Applied'       // Đã nộp đơn
    | 'Screening'     // Đang sàng lọc AI
    | 'Shortlisted'   // Đã lọc vào danh sách phỏng vấn
    | 'Interview'      // Đang phỏng vấn
    | 'Offer'         // Đã đề xuất offer
    | 'Rejected'      // Không phù hợp
    | 'Hired'         // Đã tuyển
    | 'Withdrawn'     // Đã rút đơn

export interface CVScreeningResult {
    id: string
    applicationId: string
    overallScore: number              // 0-1
    skillMatchScore?: number          // 0-1
    experienceMatchScore?: number     // 0-1
    educationMatchScore?: number      // 0-1
    keywordMatchScore?: number        // 0-1
    matchedSkills?: string             // JSON array of strings
    missingSkills?: string             // JSON array of strings
    strengths?: string                 // JSON array of strings
    concerns?: string                 // JSON array of strings
    summary?: string
    rawResponse?: string
}

// Parsed version for frontend use
export interface ParsedScreeningResult {
    overallScore: number              // 0-100
    skillMatchScore: number          // 0-100
    experienceMatchScore: number     // 0-100
    educationMatchScore: number      // 0-100
    matchedSkills: string[]
    missingSkills: string[]
    strengths: string[]
    summary: string
}

// Utility to parse JSON strings
export function parseScreeningResult(result: CVScreeningResult): ParsedScreeningResult {
    return {
        overallScore: result.overallScore * 100,
        skillMatchScore: (result.skillMatchScore || 0) * 100,
        experienceMatchScore: (result.experienceMatchScore || 0) * 100,
        educationMatchScore: (result.educationMatchScore || 0) * 100,
        matchedSkills: result.matchedSkills ? JSON.parse(result.matchedSkills) : [],
        missingSkills: result.missingSkills ? JSON.parse(result.missingSkills) : [],
        strengths: result.strengths ? JSON.parse(result.strengths) : [],
        summary: result.summary || '',
    }
}
```

---

## 7. Timeline

### Sprint 1: Public Jobs & Application (Tuần 1)

**Frontend tasks**:
- [ ] Cập nhật `src/features/jobs/types.ts` với `PublicJobPostingDto` chuẩn
- [ ] Tạo `src/features/jobs/api/public-jobs-service.ts`
- [ ] Cập nhật job list dùng real API
- [ ] Cập nhật job detail dùng real API
- [ ] Cập nhật `JobCard` hiển thị `enterpriseLogoUrl` đúng

### Sprint 2: Application Detail & AI Screening (Tuần 2)

**Frontend tasks**:
- [ ] Tạo route `/applications/[id]/page.tsx`
- [ ] Tạo `ApplicationDetailView` component
- [ ] Tạo `ScreeningResultsCard` component
- [ ] Cập nhật `JobApplyForm` hiển thị kết quả AI ngay sau apply
- [ ] Cập nhật application types


### Sprint 3: Saved Jobs (Tuần 3)

**Frontend tasks**:
- [ ] Tạo `src/features/candidate/api/saved-jobs-service.ts`
- [ ] Tạo `useSavedJobs` hook
- [ ] Cập nhật job detail với nút Save/Unsave
- [ ] Cập nhật saved jobs page dùng real API



### Sprint 4: Polish & Optimization (Tuần 4)

- [ ] Thêm advanced filters cho job search
- [ ] Thêm loading states & error handling
- [ ] Optimize re-renders với React.memo
- [ ] Add animations với Framer Motion
- [ ] Mobile responsiveness optimization

---

## 8. Priority Summary

| Priority | Feature | Backend Needed? | Files to Create/Update |
|----------|---------|----------------|----------------------|
| **P0** | Cập nhật Public Jobs API | No | `types.ts`, `public-jobs-service.ts` |
| **P0** | AI Screening hiển thị sau apply | No | `job-apply-form.tsx` |
| **P1** | Application Detail Page | **YES** | `applications/[id]/page.tsx`, components |
| **P1** | Application List với screening summary | **YES** | `application-list.tsx`, types |
| **P2** | Saved Jobs API | **YES** | controller, service, hooks |
| **P2** | Advanced Job Filters | No | `job-filter.tsx` |

---

## Summary


2. **Frontend cần làm**:
   - Cập nhật types khớp backend DTO
   - Tạo application detail page với AI screening results display
   - Cập nhật application form để hiển thị kết quả AI ngay sau apply


