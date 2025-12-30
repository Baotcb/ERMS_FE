import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProfileStore } from '@/lib/stores/profile-store'
import { updateProfileSchema, type UpdateProfileFormData } from '@/lib/validations/profile'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export function useProfileForm() {
  const { profile, updateProfile, isUpdating } = useProfileStore()
  const { refreshUser } = useAuth()
  const { toast } = useToast()

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

      toast({
        title: 'Thành công',
        description: 'Cập nhật hồ sơ thành công',
      })

      return true
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật hồ sơ. Vui lòng thử lại.',
        variant: 'destructive',
      })
      return false
    }
  }

  const resetForm = () => {
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
  }

  return {
    form,
    onSubmit,
    resetForm,
    isUpdating,
  }
}
