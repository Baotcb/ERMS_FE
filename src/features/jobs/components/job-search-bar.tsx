'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function JobSearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [keyword, setKeyword] = useState(searchParams.get('q') || '')
    const [locationInput, setLocationInput] = useState(searchParams.get('location') || '')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (keyword.trim()) params.set('q', keyword.trim())
        if (locationInput.trim()) params.set('location', locationInput.trim())
        router.push(`/jobs?${params.toString()}`)
    }

    return (
        <div className="job-search-bar">
            <div className="job-search-bar__container">
                <form className="job-search-bar__form" onSubmit={handleSearch}>
                    <input
                        className="job-search-bar__input"
                        type="text"
                        placeholder="Vị trí tuyển dụng, tên công ty..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <input
                        className="job-search-bar__input"
                        type="text"
                        placeholder="Địa điểm làm việc..."
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        style={{ maxWidth: 240 }}
                    />
                    <button className="job-search-bar__button" type="submit">
                        <Search className="w-5 h-5" />
                        Tìm kiếm
                    </button>
                </form>
            </div>
        </div>
    )
}
