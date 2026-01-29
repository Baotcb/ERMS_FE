'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCloudinaryUpload } from '@/hooks/use-cloudinary-upload'
import Image from 'next/image'

interface ImageUploadProps {
    onUploadComplete: (url: string) => void
    defaultImage?: string
    className?: string
    disabled?: boolean
}

export function ImageUpload({
    onUploadComplete,
    defaultImage,
    className,
    disabled
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(defaultImage || null)
    const { uploadImage, isUploading } = useCloudinaryUpload()

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        // Create local preview
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)

        try {
            const url = await uploadImage(file)
            onUploadComplete(url)
        } catch (error) {
            console.error('Upload failed:', error)
            setPreview(null) // Revert on error
        }
    }, [uploadImage, onUploadComplete])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 1,
        disabled: disabled || isUploading,
        maxSize: 5 * 1024 * 1024 // 5MB
    })

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        setPreview(null)
        onUploadComplete('')
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[160px]",
                    isDragActive ? "border-brand-primary bg-brand-primary/5" : "border-gray-200 hover:border-brand-primary/50",
                    disabled && "opacity-50 cursor-not-allowed hover:border-gray-200",
                    preview && "border-solid border-gray-200 p-0 overflow-hidden"
                )}
            >
                <input {...getInputProps()} />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                        <p className="text-sm text-gray-500">Đang tải ảnh lên...</p>
                    </div>
                ) : preview ? (
                    <div className="relative w-full h-40">
                        <Image
                            src={preview}
                            alt="Uploaded image"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                        <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white shadow-sm transition-colors"
                            type="button"
                        >
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-3 bg-brand-primary/10 rounded-full mb-3">
                            <Upload className="h-6 w-6 text-brand-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">
                                {isDragActive ? 'Thả ảnh vào đây' : 'Tải lên logo'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG tối đa 5MB
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
