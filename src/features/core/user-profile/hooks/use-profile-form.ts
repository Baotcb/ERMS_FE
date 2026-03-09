'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from '../api/profile-service';
import type { UserProfileDto } from '../api/profile-service';
import {
  validateFullName,
  validatePhone,
  validateDOB,
  validateHometown,
  validateProfileForm,
  getMaxDateForAge,
  type ProfileErrors,
} from '../utils/profile-validation';

interface UseProfileFormOptions {
  initialData: UserProfileDto | null;
  onSuccess?: () => void;
}

export function useProfileForm({ initialData, onSuccess }: UseProfileFormOptions) {
  const { toast } = useToast();
  // Token removed - managed by cookies/apiClient

  // Form state
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [phone, setPhone] = useState(initialData?.phones || '');
  const [hometown, setHometown] = useState(initialData?.hometown || '');
  const [dob, setDob] = useState('');
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});

  // Initialize DOB from server data
  useEffect(() => {
    if (initialData?.dateOfBirth) {
      setDob(new Date(initialData.dateOfBirth).toISOString().split('T')[0]);
    }
  }, [initialData]);

  // Field change handlers with validation
  const handleFullNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFullName(value);
      setErrors((prev) => ({ ...prev, fullName: validateFullName(value) }));
    },
    []
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setPhone(value);
      setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
    },
    []
  );

  const handleDobChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setDob(value);
      setErrors((prev) => ({ ...prev, dob: validateDOB(value) }));
    },
    []
  );

  const handleHometownChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setHometown(value);
      setErrors((prev) => ({ ...prev, hometown: validateHometown(value) }));
    },
    []
  );

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return (
      !errors.fullName &&
      !errors.phone &&
      !errors.hometown &&
      !errors.dob &&
      fullName.trim().length >= 2
    );
  }, [errors, fullName]);

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate all fields
      const newErrors = validateProfileForm({ fullName, phone, hometown, dob });
      setErrors(newErrors);

      if (Object.values(newErrors).some((error) => error !== undefined)) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng kiểm tra lại thông tin đã nhập',
          variant: 'destructive',
        });
        return;
      }

      setUpdating(true);
      try {
        await updateProfile({
          fullName,
          phones: phone,
          hometown,
          dateOfBirth: dob ? new Date(dob).toISOString() : undefined,
        });

        // Update user_name cookie so navbar/sidebar show new name immediately
        document.cookie = `user_name=${encodeURIComponent(fullName.trim())}; path=/; max-age=${7 * 24 * 60 * 60}`;

        setErrors({});
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật hồ sơ thành công',
          className: 'bg-green-500 text-white',
        });

        onSuccess?.();
      } catch (error) {
        toast({
          title: 'Lỗi',
          description:
            error instanceof Error ? error.message : 'Cập nhật hồ sơ thất bại',
          variant: 'destructive',
        });
      } finally {
        setUpdating(false);
      }
    },
    [fullName, phone, hometown, dob, toast, onSuccess]
  );

  return {
    // Values
    fullName,
    phone,
    hometown,
    dob,
    errors,
    updating,
    maxDate: getMaxDateForAge(),

    // Handlers
    handleFullNameChange,
    handlePhoneChange,
    handleDobChange,
    handleHometownChange,
    handleSubmit,

    // Utilities
    isFormValid,
  };
}
