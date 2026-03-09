'use client'

import { Filter, X } from 'lucide-react'

const EXPERIENCE_OPTIONS = [
    { value: '', label: 'Tất cả kinh nghiệm' },
    { value: '0', label: 'Chưa có kinh nghiệm' },
    { value: '0-1', label: 'Dưới 1 năm' },
    { value: '1-2', label: '1 - 2 năm' },
    { value: '2-3', label: '2 - 3 năm' },
    { value: '3-5', label: '3 - 5 năm' },
    { value: '5+', label: 'Trên 5 năm' },
]

const SALARY_OPTIONS = [
    { value: '', label: 'Tất cả mức lương' },
    { value: '0-10', label: 'Dưới 10 triệu' },
    { value: '10-15', label: '10 - 15 triệu' },
    { value: '15-20', label: '15 - 20 triệu' },
    { value: '20-30', label: '20 - 30 triệu' },
    { value: '30+', label: 'Trên 30 triệu' },
]

const EMPLOYMENT_OPTIONS = [
    { value: '', label: 'Tất cả hình thức' },
    { value: 'FullTime', label: 'Toàn thời gian' },
    { value: 'PartTime', label: 'Bán thời gian' },
    { value: 'Contract', label: 'Hợp đồng' },
    { value: 'Internship', label: 'Thực tập' },
]

interface JobFilterSidebarProps {
    experience: string
    salary: string
    employment: string
    onExperienceChange: (v: string) => void
    onSalaryChange: (v: string) => void
    onEmploymentChange: (v: string) => void
    onClear: () => void
}

export function JobFilterSidebar({
    experience, salary, employment,
    onExperienceChange, onSalaryChange, onEmploymentChange, onClear
}: JobFilterSidebarProps) {
    const hasFilters = experience || salary || employment

    return (
        <aside className="job-filter-sidebar">
            <div className="job-filter-sidebar__header">
                <h3 className="job-filter-sidebar__title">
                    <Filter className="w-4 h-4" />
                    Lọc nâng cao
                </h3>
                {hasFilters && (
                    <button className="job-filter-sidebar__clear" onClick={onClear} type="button">
                        <X className="w-3 h-3" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                        Xoá lọc
                    </button>
                )}
            </div>

            {/* Kinh nghiệm */}
            <div className="job-filter-sidebar__group">
                <h4 className="job-filter-sidebar__group-title">Kinh nghiệm</h4>
                {EXPERIENCE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="job-filter-sidebar__option">
                        <input
                            type="radio"
                            name="experience"
                            checked={experience === opt.value}
                            onChange={() => onExperienceChange(opt.value)}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>

            {/* Mức lương */}
            <div className="job-filter-sidebar__group">
                <h4 className="job-filter-sidebar__group-title">Mức lương</h4>
                {SALARY_OPTIONS.map((opt) => (
                    <label key={opt.value} className="job-filter-sidebar__option">
                        <input
                            type="radio"
                            name="salary"
                            checked={salary === opt.value}
                            onChange={() => onSalaryChange(opt.value)}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>

            {/* Hình thức */}
            <div className="job-filter-sidebar__group">
                <h4 className="job-filter-sidebar__group-title">Hình thức làm việc</h4>
                {EMPLOYMENT_OPTIONS.map((opt) => (
                    <label key={opt.value} className="job-filter-sidebar__option">
                        <input
                            type="radio"
                            name="employment"
                            checked={employment === opt.value}
                            onChange={() => onEmploymentChange(opt.value)}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
        </aside>
    )
}
