/**
 * Job Filter Component
 * Memoized for performance optimization
 */

'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import { Search, MapPin, Briefcase, DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { JOB_LOCATIONS, JOB_SALARY_RANGES, JOB_TYPES } from '../constants/job-mock-data'
import { useDebounce } from '@/hooks/use-debounce'

interface JobFilters {
  keyword: string
  location: string
  salary: string
  type: string
}

interface JobFilterProps {
  onFilterChange?: (filters: JobFilters) => void
}

export const JobFilter = memo(function JobFilter({ onFilterChange }: JobFilterProps) {
  const [filters, setFilters] = useState<JobFilters>({
    keyword: '',
    location: '',
    salary: '',
    type: '',
  })

  // Debounce keyword to reduce API calls
  const debouncedKeyword = useDebounce(filters.keyword, 300)

  // Notify parent when filters change (debounced for keyword)
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        keyword: debouncedKeyword
      })
    }
  }, [debouncedKeyword, filters.location, filters.salary, filters.type, onFilterChange])

  const updateFilter = useCallback(
    (key: keyof JobFilters) => (value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const resetFilters = useCallback(() => {
    setFilters({
      keyword: '',
      location: '',
      salary: '',
      type: '',
    })
  }, [])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 -mt-20 relative z-30 border border-gray-100 dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Keyword Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
          <Input
            type="text"
            placeholder="Tìm kiếm vị trí, công ty..."
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword')(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Location Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
          <Select value={filters.location} onValueChange={updateFilter('location')}>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Địa điểm" />
            </SelectTrigger>
            <SelectContent>
              {JOB_LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Salary Filter */}
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
          <Select value={filters.salary} onValueChange={updateFilter('salary')}>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Mức lương" />
            </SelectTrigger>
            <SelectContent>
              {JOB_SALARY_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Type Filter */}
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
          <Select value={filters.type} onValueChange={updateFilter('type')}>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Loại hình" />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="mt-4 flex gap-3">
        <Button variant="default" className="flex-1">
          Tìm kiếm
        </Button>
        <Button
          variant="outline"
          onClick={resetFilters}
          className="px-6"
        >
          Đặt lại
        </Button>
      </div>
    </div>
  )
})
