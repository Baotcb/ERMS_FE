import { useState } from 'react'
import { CLOUDINARY_CONFIG } from '@/lib/cloudinary/cloudinary-config'

export function useCloudinaryUpload() {
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const uploadImage = async (file: File): Promise<string> => {
        setIsUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            )

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('Cloudinary Error:', response.status, response.statusText, errorData)
                throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`)
            }

            const data = await response.json()
            return data.secure_url
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
            throw err
        } finally {
            setIsUploading(false)
        }
    }

    return { uploadImage, isUploading, error }
}
