'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, FileText, Video, File as FileIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface FileUploadProps {
    onUploadComplete: (url: string, file: File | null) => void
    accept?: Record<string, string[]>
    maxSize?: number
    className?: string
    disabled?: boolean
    label?: string
}

export function FileUpload({
    onUploadComplete,
    accept = {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'video/mp4': ['.mp4']
    },
    maxSize = 50 * 1024 * 1024, // 50MB
    className,
    disabled,
    label = 'Tải lên tài liệu hoặc video'
}: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const { toast } = useToast()

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setFileName(file.name)
        setIsUploading(true)

        try {
            // In a real app, we'd upload to a server or Cloudinary
            // For now, we'll simulate an upload and return a fake URL
            await new Promise(resolve => setTimeout(resolve, 1500));
            const fakeUrl = `https://storage.erms.com/files/${file.name}`;
            onUploadComplete(fakeUrl, file)
            toast({ title: 'Thành công', description: `Đã tải lên ${file.name}` });
        } catch (error) {
            console.error('Upload failed:', error)
            setFileName(null)
            toast({
                variant: 'destructive',
                title: 'Tải lên thất bại',
                description: 'Đã xảy ra lỗi khi tải file lên.',
            })
        } finally {
            setIsUploading(false)
        }
    }, [onUploadComplete, toast])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: 1,
        disabled: disabled || isUploading,
        maxSize
    })

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setFileName(null)
        onUploadComplete('', null)
    }

    const getFileIcon = () => {
        if (!fileName) return <Upload className="h-6 w-6 text-[#3282B8]" />
        if (fileName.endsWith('.mp4')) return <Video className="h-6 w-6 text-blue-500" />
        if (fileName.endsWith('.pdf') || fileName.includes('doc')) return <FileText className="h-6 w-6 text-orange-500" />
        return <FileIcon className="h-6 w-6 text-gray-500" />
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px]",
                    isDragActive ? "border-[#3282B8] bg-blue-50/50" : "border-gray-200 hover:border-[#3282B8]/50 hover:bg-gray-50/30",
                    disabled && "opacity-50 cursor-not-allowed",
                    fileName && "border-[#0F4C75]/20 bg-[#0F4C75]/5"
                )}
            >
                <input {...getInputProps()} />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-[#3282B8]" />
                        <p className="text-sm font-medium text-gray-600">Đang xử lý file...</p>
                    </div>
                ) : fileName ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 relative">
                            {getFileIcon()}
                            <button
                                onClick={removeFile}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-all"
                                type="button"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-[#0F4C75] truncate max-w-[200px]">{fileName}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">Sẵn sàng để lưu</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-gray-50 rounded-2xl mb-4 group-hover:bg-white transition-colors">
                            {getFileIcon()}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-700">
                                {isDragActive ? 'Thả file vào đây' : label}
                            </p>
                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                MP4, PDF, DOCX tối đa 50MB
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
