'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/core/auth/hooks/use-auth';
import { STORAGE_KEYS } from '@/utils/constants';
import { updateProfile } from '../api/profile-service';
import type { ChangeProfileRequest, UserProfileDto } from '../api/profile-service';
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

function formatDateForInput(date?: string) {
  return date ? new Date(date).toISOString().split('T')[0] : '';
}

function buildSavedProfile(initialData: UserProfileDto | null): ChangeProfileRequest {
  return {
    fullName: initialData?.fullName || '',
    phones: initialData?.phones || '',
    hometown: initialData?.hometown || '',
    dateOfBirth: initialData?.dateOfBirth,
    avatarUrl: initialData?.avatarUrl || null,
  };
}

function setPublicCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${7 * 24 * 60 * 60}`;
}

function clearPublicCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function useProfileForm({ initialData, onSuccess }: UseProfileFormOptions) {
  const router = useRouter();
  const { toast } = useToast();
  const { updateUser } = useAuth();

  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [phone, setPhone] = useState(initialData?.phones || '');
  const [hometown, setHometown] = useState(initialData?.hometown || '');
  const [dob, setDob] = useState(formatDateForInput(initialData?.dateOfBirth));
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '');
  const [savedProfile, setSavedProfile] = useState<ChangeProfileRequest>(() =>
    buildSavedProfile(initialData)
  );
  const [updating, setUpdating] = useState(false);
  const [avatarUpdating, setAvatarUpdating] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});

  useEffect(() => {
    setFullName(initialData?.fullName || '');
    setPhone(initialData?.phones || '');
    setHometown(initialData?.hometown || '');
    setDob(formatDateForInput(initialData?.dateOfBirth));
    setAvatarUrl(initialData?.avatarUrl || '');
    setSavedProfile(buildSavedProfile(initialData));
  }, [initialData]);

  const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    setErrors((prev) => ({ ...prev, fullName: validateFullName(value) }));
  }, []);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
  }, []);

  const handleDobChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDob(value);
    setErrors((prev) => ({ ...prev, dob: validateDOB(value) }));
  }, []);

  const handleHometownChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHometown(value);
    setErrors((prev) => ({ ...prev, hometown: validateHometown(value) }));
  }, []);

  const isFormValid = useCallback(() => {
    return (
      !errors.fullName &&
      !errors.phone &&
      !errors.hometown &&
      !errors.dob &&
      fullName.trim().length >= 2
    );
  }, [errors, fullName]);

  const syncSessionProfile = useCallback(
    (nextFullName: string, nextAvatarUrl?: string | null) => {
      setPublicCookie(STORAGE_KEYS.USER_NAME, nextFullName.trim());

      if (nextAvatarUrl) {
        setPublicCookie(STORAGE_KEYS.USER_AVATAR, nextAvatarUrl);
      } else {
        clearPublicCookie(STORAGE_KEYS.USER_AVATAR);
      }

      updateUser({
        fullName: nextFullName.trim(),
        avatarUrl: nextAvatarUrl || undefined,
      });
    },
    [updateUser]
  );

  const applyUpdatedProfile = useCallback(
    (updatedProfile: UserProfileDto) => {
      setSavedProfile(buildSavedProfile(updatedProfile));
      setFullName(updatedProfile.fullName || '');
      setPhone(updatedProfile.phones || '');
      setHometown(updatedProfile.hometown || '');
      setDob(formatDateForInput(updatedProfile.dateOfBirth));
      setAvatarUrl(updatedProfile.avatarUrl || '');
      syncSessionProfile(updatedProfile.fullName || '', updatedProfile.avatarUrl || null);
    },
    [syncSessionProfile]
  );

  const persistAvatar = useCallback(
    async (nextAvatarUrl?: string | null) => {
      if (!savedProfile.fullName?.trim()) {
        toast({
          title: 'Lá»—i',
          description: 'KhÃ´ng thá»ƒ cáº­p nháº­t áº£nh Ä‘áº¡i diá»‡n khi thiáº¿u thÃ´ng tin há» tÃªn',
          variant: 'destructive',
        });
        return;
      }

      setAvatarUpdating(true);
      try {
        const updatedProfile = await updateProfile({
          ...savedProfile,
          avatarUrl: nextAvatarUrl || null,
        });

        applyUpdatedProfile(updatedProfile);
        toast({
          title: 'ThÃ nh cÃ´ng',
          description: nextAvatarUrl
            ? 'ÄÃ£ cáº­p nháº­t áº£nh Ä‘áº¡i diá»‡n'
            : 'ÄÃ£ xÃ³a áº£nh Ä‘áº¡i diá»‡n',
          className: 'bg-green-500 text-white',
        });

        router.refresh();
      } catch (error) {
        toast({
          title: 'Lá»—i',
          description:
            error instanceof Error ? error.message : 'Cáº­p nháº­t áº£nh Ä‘áº¡i diá»‡n tháº¥t báº¡i',
          variant: 'destructive',
        });
      } finally {
        setAvatarUpdating(false);
      }
    },
    [applyUpdatedProfile, router, savedProfile, toast]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors = validateProfileForm({ fullName, phone, hometown, dob });
      setErrors(newErrors);

      if (Object.values(newErrors).some((error) => error !== undefined)) {
        toast({
          title: 'Lá»—i',
          description: 'Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin Ä‘Ã£ nháº­p',
          variant: 'destructive',
        });
        return;
      }

      setUpdating(true);
      try {
        const updatedProfile = await updateProfile({
          fullName,
          phones: phone,
          hometown,
          dateOfBirth: dob ? new Date(dob).toISOString() : undefined,
          avatarUrl: avatarUrl || null,
        });

        applyUpdatedProfile(updatedProfile);
        setErrors({});
        toast({
          title: 'ThÃ nh cÃ´ng',
          description: 'ÄÃ£ cáº­p nháº­t há»“ sÆ¡ thÃ nh cÃ´ng',
          className: 'bg-green-500 text-white',
        });

        router.refresh();
        onSuccess?.();
      } catch (error) {
        toast({
          title: 'Lá»—i',
          description:
            error instanceof Error ? error.message : 'Cáº­p nháº­t há»“ sÆ¡ tháº¥t báº¡i',
          variant: 'destructive',
        });
      } finally {
        setUpdating(false);
      }
    },
    [applyUpdatedProfile, avatarUrl, dob, fullName, hometown, onSuccess, phone, router, toast]
  );

  const handleAvatarUpload = useCallback(
    async (nextAvatarUrl: string) => {
      await persistAvatar(nextAvatarUrl);
    },
    [persistAvatar]
  );

  const handleRemoveAvatar = useCallback(async () => {
    await persistAvatar(null);
  }, [persistAvatar]);

  return {
    fullName,
    phone,
    hometown,
    dob,
    avatarUrl,
    errors,
    updating,
    avatarUpdating,
    maxDate: getMaxDateForAge(),
    handleFullNameChange,
    handlePhoneChange,
    handleDobChange,
    handleHometownChange,
    handleSubmit,
    handleAvatarUpload,
    handleRemoveAvatar,
    isFormValid,
  };
}
