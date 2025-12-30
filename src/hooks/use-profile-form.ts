import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useProfileStore } from '@/lib/stores/profile-store'
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/validations/profile'
import { useAuth } from '@/contexts/AuthContext'


export function useProfileForm() {
    const { profile, updateProfile, isUpdating } = useProfileStore()
    const { refreshUser } = useAuth()


    const form = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            fullName: profile?.fullName || '',
            dateOfBirth: profile?.dateOfBirth
                ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
                : '',
            hometown: profile?.hometown || '',
            phones: profile?.phones || '',
        },
    })

    const onSubmit = async (data: UpdateProfileFormData) => {
        try {
            // Convert empty strings to undefined for optional fields
            const submitData = {
                fullName: data.fullName,
                dateOfBirth: data.dateOfBirth || undefined,
                hometown: data.hometown || undefined,
                phones: data.phones || undefined,
            }

            await updateProfile(submitData)
            await refreshUser() // Refresh user data in auth context

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ. Vui lòng thử lại.'
            }
        }
    }

    const resetForm = useCallback(() => {
        if (profile) {
            form.reset({
                fullName: profile.fullName || '',
                dateOfBirth: profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
                    : '',
                hometown: profile.hometown || '',
                phones: profile.phones || '',
            })
        }
    }, [profile, form])

    return {
        form,
        onSubmit,
        resetForm,
        isUpdating,
    }
}
