"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, LayoutGrid, List as ListIcon, SlidersHorizontal } from "lucide-react"
import { JobStatus } from "../../types"

interface JobFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    statusFilter: string
    onStatusChange: (value: string) => void
    viewMode: "grid" | "list"
    onViewModeChange: (mode: "grid" | "list") => void
}

export function JobFilters({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusChange,
    viewMode,
    onViewModeChange
}: JobFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jobs..."
                        className="pl-9 w-full bg-background/50 border-muted-foreground/20 focus:bg-background transition-colors"
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[180px] border-muted-foreground/20">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Jobs</SelectItem>
                        {Object.values(JobStatus).map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                                {status.replace(/([A-Z])/g, ' $1').trim()}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex items-center border rounded-md p-1 bg-muted/20">
                    <Button
                        variant={viewMode === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-sm"
                        onClick={() => onViewModeChange("grid")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-8 w-8 rounded-sm"
                        onClick={() => onViewModeChange("list")}
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
