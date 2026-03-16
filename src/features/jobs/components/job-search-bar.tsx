'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { buildJobsHref, mergeJobSearchParams } from '../job-filtering'

export function JobSearchBar() {
    const searchParams = useSearchParams()
    const searchKey = `${searchParams.get('q') || ''}|${searchParams.get('location') || ''}`

    return (
        <JobSearchBarForm
            key={searchKey}
            initialKeyword={searchParams.get('q') || ''}
            initialLocation={searchParams.get('location') || ''}
        />
    )
}

function JobSearchBarForm({
    initialKeyword,
    initialLocation,
}: {
    initialKeyword: string
    initialLocation: string
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [keyword, setKeyword] = useState(initialKeyword)
    const [locationInput, setLocationInput] = useState(initialLocation)

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const nextParams = mergeJobSearchParams(searchParams, {
            q: keyword.trim() || null,
            location: locationInput.trim() || null,
        })

        router.push(buildJobsHref({}, nextParams, false))
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
                        onChange={(event) => setKeyword(event.target.value)}
                    />
                    <input
                        className="job-search-bar__input"
                        type="text"
                        placeholder="Địa điểm làm việc..."
                        value={locationInput}
                        onChange={(event) => setLocationInput(event.target.value)}
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
