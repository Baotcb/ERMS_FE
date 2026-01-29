/**
 * Job Filter Component
 * Memoized for performance optimization
 */

'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import { Search, MapPin, DollarSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { JOB_LOCATIONS, JOB_SALARY_RANGES } from '../data/job-mock-data'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

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

  const [isFocused, setIsFocused] = useState(false)

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
  }, [debouncedKeyword, filters, onFilterChange])

  const updateFilter = useCallback(
    (key: keyof JobFilters) => (value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )



  return (
    <div className={cn(
      "bg-white rounded-xl shadow-xl p-6 -mt-20 relative z-30 transition-shadow duration-300 border border-slate-100",
      isFocused ? "shadow-2xl ring-2 ring-primary/5" : "shadow-lg"
    )}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
        {/* Keyword Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-primary transition-colors z-10" />
          <Input
            type="text"
            placeholder="Vị trí tuyển dụng, tên công ty..."
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword')(e.target.value)}
            className="pl-10 h-12 border-slate-200 focus:border-brand-primary/50 focus:ring-brand-primary/20 transition-all"
          />
        </div>

        {/* Location Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
          <Select value={filters.location} onValueChange={updateFilter('location')}>
            <SelectTrigger className="pl-10 h-12 border-slate-200 hover:border-brand-primary/50 transition-colors">
              <SelectValue placeholder="Tất cả địa điểm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả địa điểm</SelectItem>
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
            <SelectTrigger className="pl-10 h-12 border-slate-200 hover:border-brand-primary/50 transition-colors">
              <SelectValue placeholder="Tất cả mức lương" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức lương</SelectItem>
              {JOB_SALARY_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Actions */}
        <Button
          className="h-12 bg-[#00b14f] hover:bg-[#009643] text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
          onClick={() => { }}
        >
          Tìm kiếm
        </Button>
      </div>
    </div>
  )
})
