"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Job } from "@/features/recruitment/jobs/types"
import { MockJobService } from "@/features/recruitment/jobs/data/mock-jobs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, UploadCloud, FileText, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ApplyJobPage() {
    const params = useParams()
    const router = useRouter()
    const [job, setJob] = useState<Job | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [coverLetter, setCoverLetter] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchJob = async () => {
            if (!params.id) return
            const data = await MockJobService.getById(params.id as string)
            setJob(data || null)
        }
        fetchJob()
    }, [params.id])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!cvFile) {
            setError("Please upload your CV/Resume to proceed.")
            return
        }

        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        setIsSubmitting(false)
        router.push('/recruitment/candidate')
    }

    if (!job) return null

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="container mx-auto px-4 max-w-2xl">
                <Button variant="ghost" className="mb-6 gap-2" asChild>
                    <Link href={`/recruitment/candidate/${job.id}`}>
                        <ArrowLeft className="h-4 w-4" />
                        Back to Job Details
                    </Link>
                </Button>

                <Card className="shadow-lg border-indigo-100">
                    <CardHeader className="bg-indigo-50/50 border-b border-indigo-50">
                        <CardTitle className="text-2xl text-indigo-900">Apply for {job.title}</CardTitle>
                        <CardDescription>
                            {job.departmentName} • {job.location}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Info Section (Pre-filled simulation) */}
                            <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                                <h3 className="font-medium flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    Your Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                                    <div>
                                        <span className="block text-xs text-slate-400">Full Name</span>
                                        <span className="font-medium text-slate-900">Nguyen Van A</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-slate-400">Email</span>
                                        <span className="font-medium text-slate-900">fafac...</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cv">Upload CV / Resume <span className="text-red-500">*</span></Label>
                                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-8 transition-colors text-center cursor-pointer relative bg-white">
                                    <input
                                        type="file"
                                        id="cv"
                                        accept=".pdf,.doc,.docx"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                            {cvFile ? <FileText className="h-6 w-6" /> : <UploadCloud className="h-6 w-6" />}
                                        </div>
                                        {cvFile ? (
                                            <div>
                                                <p className="font-medium text-slate-900">{cvFile.name}</p>
                                                <p className="text-xs text-slate-500">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-medium text-slate-900">Click to upload or drag and drop</p>
                                                <p className="text-xs text-slate-500">PDF, DOCX up to 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                                <Textarea
                                    id="coverLetter"
                                    placeholder="Tell us why you're a great fit..."
                                    className="min-h-[150px] resize-y"
                                    value={coverLetter}
                                    onChange={e => setCoverLetter(e.target.value)}
                                />
                            </div>

                            <div className="pt-4">
                                <Button type="submit" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
