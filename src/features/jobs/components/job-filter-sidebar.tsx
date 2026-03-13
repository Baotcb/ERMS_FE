'use client'

import { Filter, X } from 'lucide-react'
import { EMPLOYMENT_OPTIONS, EXPERIENCE_OPTIONS, SALARY_OPTIONS } from '../job-filtering'
import type { PublicDepartmentFilterOption, PublicJobFilterOption } from '../types'

interface JobFilterSidebarProps {
    experience: string
    salary: string
    employment: string
    departmentId: string
    departments: PublicDepartmentFilterOption[]
    employmentTypes: PublicJobFilterOption[]
    onExperienceChange: (value: string) => void
    onSalaryChange: (value: string) => void
    onEmploymentChange: (value: string) => void
    onDepartmentChange: (value: string) => void
    onClear: () => void
}

export function JobFilterSidebar({
    experience,
    salary,
    employment,
    departmentId,
    departments,
    employmentTypes,
    onExperienceChange,
    onSalaryChange,
    onEmploymentChange,
    onDepartmentChange,
    onClear,
}: JobFilterSidebarProps) {
    const hasFilters = experience || salary || employment || departmentId
    const availableEmploymentTypes = employmentTypes.length > 0 ? employmentTypes : EMPLOYMENT_OPTIONS

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

            {departments.length > 0 && (
                <div className="job-filter-sidebar__group">
                    <h4 className="job-filter-sidebar__group-title">Phòng ban</h4>
                    <select
                        className="w-full rounded-md border border-[#d8dee4] bg-white px-3 py-2 text-sm text-[#212f3f] outline-none focus:border-[#1B5583]"
                        value={departmentId}
                        onChange={(event) => onDepartmentChange(event.target.value)}
                    >
                        <option value="">Tất cả phòng ban</option>
                        {departments.map((department) => (
                            <option key={department.id} value={String(department.id)}>
                                {department.departmentName} ({department.jobCount})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="job-filter-sidebar__group">
                <h4 className="job-filter-sidebar__group-title">Kinh nghiệm</h4>
                {EXPERIENCE_OPTIONS.map((option) => (
                    <label key={option.value} className="job-filter-sidebar__option">
                        <input
                            type="radio"
                            name="experience"
                            checked={experience === option.value}
                            onChange={() => onExperienceChange(option.value)}
                        />
                        {option.label}
                    </label>
                ))}
            </div>

            <div className="job-filter-sidebar__group">
                <h4 className="job-filter-sidebar__group-title">Mức lương</h4>
                {SALARY_OPTIONS.map((option) => (
                    <label key={option.value} className="job-filter-sidebar__option">
                        <input
                            type="radio"
                            name="salary"
                            checked={salary === option.value}
                            onChange={() => onSalaryChange(option.value)}
                        />
                        {option.label}
                    </label>
                ))}
            </div>

            <div className="job-filter-sidebar__group">
                <h4 className="job-filter-sidebar__group-title">Hình thức làm việc</h4>
                {availableEmploymentTypes.map((option) => (
                    <label key={option.value} className="job-filter-sidebar__option">
                        <input
                            type="radio"
                            name="employment"
                            checked={employment === option.value}
                            onChange={() => onEmploymentChange(option.value)}
                        />
                        {option.label}
                    </label>
                ))}
            </div>
        </aside>
    )
}
