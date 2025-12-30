"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { JobStatus, Job } from "../../types"
import { JobService } from "../../api/jobs-service"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CreateJobWizardProps {
    initialData?: Job
    isEditMode?: boolean
}

export function CreateJobWizard({ initialData, isEditMode = false }: CreateJobWizardProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const REVERSE_DEPARTMENT_ID_MAPPING: Record<number, string> = {
        1: "DEPT-ENG",
        2: "DEPT-HR",
        3: "DEPT-SALES",
        4: "DEPT-MKT"
    }

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        departmentId: initialData?.departmentId ? REVERSE_DEPARTMENT_ID_MAPPING[initialData.departmentId] : "",
        location: initialData?.location || "",
        minSalary: initialData?.minSalary?.toString() || "",
        maxSalary: initialData?.maxSalary?.toString() || "",
        currency: initialData?.currency || "USD",
        description: initialData?.description || "",
        requirements: initialData?.requirements || ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const getDepartmentName = (id: string) => {
        const textMap: Record<string, string> = {
            "DEPT-ENG": "Engineering",
            "DEPT-HR": "Human Resources",
            "DEPT-SALES": "Sales",
            "DEPT-MKT": "Marketing"
        }
        return textMap[id] || "General"
    }

    const DEPARTMENT_ID_MAPPING: Record<string, number> = {
        "DEPT-ENG": 1,
        "DEPT-HR": 2,
        "DEPT-SALES": 3,
        "DEPT-MKT": 4
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // Map string ID to backend Int ID. Default to 1 (General/Eng) if not found.
            const backendDeptId = DEPARTMENT_ID_MAPPING[formData.departmentId] || 1;

            const payload = {
                title: formData.title,
                departmentId: backendDeptId,
                location: formData.location || "Remote",
                minSalary: Number(formData.minSalary) || 0,
                maxSalary: Number(formData.maxSalary) || 0,
                currency: formData.currency,
                description: formData.description,
                requirements: formData.requirements,
                postingType: "External", // Default
                publishDate: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                // skillIds: [] // TODO: Add skill selection
            }

            if (isEditMode && initialData?.id) {
                await JobService.update(initialData.id, payload)
            } else {
                await JobService.create(payload)
            }
            router.push('/recruitment/hr/jobs')
        } catch (err: any) {
            console.error(err)
            const msg = err?.message || `Failed to ${isEditMode ? 'update' : 'create'} job.`
            setError(msg)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 px-4 font-sans">

            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <Link href="/recruitment/hr/jobs" className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center mb-2 transition-colors">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Jobs
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{isEditMode ? 'Edit Job Posting' : 'New Job Posting'}</h1>
                    <p className="text-base text-slate-500 mt-1">
                        {isEditMode ? 'Make changes to your existing job post.' : 'Create a new opportunity for candidates.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="ghost" asChild className="h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                        <Link href="/recruitment/hr/jobs">Discard</Link>
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="h-10 px-6 min-w-[140px] bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        {isEditMode ? 'Save Changes' : 'Publish Job'}
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6 animate-in fade-in slide-in-from-top-2">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Form */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Section 1: Core Info */}
                    <div className="space-y-6">
                        <div className="border-b pb-2">
                            <h2 className="text-lg font-semibold text-slate-800">1. Basic Details</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-slate-700">Job Title</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Product Designer" className="h-11 bg-white border-slate-200 focus:border-slate-400 focus:ring-0 transition-colors text-lg shadow-sm" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="department" className="text-slate-700">Department</Label>
                                    <Select value={formData.departmentId} onValueChange={(val) => setFormData(prev => ({ ...prev, departmentId: val }))}>
                                        <SelectTrigger className="h-11 bg-white border-slate-200 focus:border-slate-400 focus:ring-0 shadow-sm">
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DEPT-ENG">Engineering</SelectItem>
                                            <SelectItem value="DEPT-HR">Human Resources</SelectItem>
                                            <SelectItem value="DEPT-SALES">Sales</SelectItem>
                                            <SelectItem value="DEPT-MKT">Marketing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-slate-700">Location</Label>
                                    <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Remote / HCMC" className="h-11 bg-white border-slate-200 focus:border-slate-400 focus:ring-0 shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Details */}
                    <div className="space-y-6 pt-4">
                        <div className="border-b pb-2">
                            <h2 className="text-lg font-semibold text-slate-800">2. Role Definition</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-700">Description</Label>
                                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="min-h-[160px] bg-white border-slate-200 focus:border-slate-400 focus:ring-0 resize-y shadow-sm p-4 leading-relaxed" placeholder="Describe the role responsibilities and day-to-day tasks..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="requirements" className="text-slate-700">Requirements</Label>
                                <Textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleChange} className="min-h-[160px] bg-white border-slate-200 focus:border-slate-400 focus:ring-0 resize-y shadow-sm p-4 leading-relaxed" placeholder="List the skills, experience, and qualifications needed..." />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar / Settings */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="border-b pb-2 mb-6">
                        <h2 className="text-lg font-semibold text-slate-800">3. Compensation</h2>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="currency" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Currency</Label>
                            <Select value={formData.currency} onValueChange={(val) => setFormData(prev => ({ ...prev, currency: val as "USD" | "VND" }))}>
                                <SelectTrigger className="bg-white border-slate-200 h-9 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="VND">VND (₫)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="minSalary" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Min Salary</Label>
                                <Input type="number" id="minSalary" name="minSalary" value={formData.minSalary} onChange={handleChange} className="bg-white border-slate-200 h-9 text-sm" placeholder="0" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxSalary" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Max Salary</Label>
                                <Input type="number" id="maxSalary" name="maxSalary" value={formData.maxSalary} onChange={handleChange} className="bg-white border-slate-200 h-9 text-sm" placeholder="0" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 text-indigo-900/80 text-sm">
                        <p className="font-medium text-indigo-900 mb-2">💡 Quick Tips</p>
                        <ul className="list-disc pl-4 space-y-1.5 opacity-90">
                            <li>Keep titles shorter than 50 chars for better visibility.</li>
                            <li>Be specific about the tech stack in the description.</li>
                            <li>Jobs with salary ranges get 30% more applicants.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
