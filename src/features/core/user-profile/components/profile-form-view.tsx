'use client';

import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { useProfileForm } from '../hooks/use-profile-form';
import { ProfileAvatarSection } from './profile-avatar-section';
import type { UserProfileDto } from '../api/profile-service';

interface ProfileFormViewProps {
  initialData: UserProfileDto | null;
  user: { id: string; email: string; fullName?: string; avatarUrl?: string } | null;
}

export const ProfileFormView = memo(function ProfileFormView({
  initialData,
  user,
}: ProfileFormViewProps) {
  const {
    fullName,
    phone,
    hometown,
    dob,
    avatarUrl,
    errors,
    updating,
    avatarUpdating,
    maxDate,
    handleFullNameChange,
    handlePhoneChange,
    handleDobChange,
    handleHometownChange,
    handleSubmit,
    handleAvatarUpload,
    handleRemoveAvatar,
    isFormValid,
  } = useProfileForm({
    initialData,
  });

  const displayName = fullName || initialData?.fullName || 'ChÆ°a cáº­p nháº­t tÃªn';
  const displayEmail = user?.email || initialData?.email || '';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">ThÃ´ng tin cÃ¡ nhÃ¢n</h1>
        <p className="text-slate-500 text-sm">
          Cáº­p nháº­t thÃ´ng tin há»“ sÆ¡ cá»§a báº¡n cho nhÃ  tuyá»ƒn dá»¥ng.
        </p>
      </div>
      <ProfileAvatarSection
        displayName={displayName}
        location={hometown || initialData?.hometown}
        avatarUrl={avatarUrl || user?.avatarUrl || initialData?.avatarUrl || undefined}
        isAvatarUpdating={avatarUpdating}
        onAvatarUploaded={handleAvatarUpload}
        onRemoveAvatar={handleRemoveAvatar}
      />
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <FormField label="Há» vÃ  TÃªn" error={errors.fullName}>
            <Input
              value={fullName}
              onChange={handleFullNameChange}
              placeholder="Nháº­p há» vÃ  tÃªn"
              className={errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Email">
              <Input value={displayEmail} disabled className="bg-slate-50" />
            </FormField>
            <FormField
              label="Sá»‘ Ä‘iá»‡n thoáº¡i"
              error={errors.phone}
              hint="Äá»‹nh dáº¡ng sá»‘ Ä‘iá»‡n thoáº¡i Viá»‡t Nam"
            >
              <Input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="VÃ­ dá»¥: 0987654321"
                className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="NgÃ y sinh"
              error={errors.dob}
              hint="Báº¡n pháº£i Ã­t nháº¥t 18 tuá»•i"
            >
              <Input
                type="date"
                value={dob}
                onChange={handleDobChange}
                max={maxDate}
                className={errors.dob ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
            </FormField>
            <FormField label="QuÃª quÃ¡n / Äá»‹a Ä‘iá»ƒm" error={errors.hometown}>
              <Input
                value={hometown}
                onChange={handleHometownChange}
                placeholder="Nháº­p quÃª quÃ¡n"
                className={errors.hometown ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
            </FormField>
          </div>
          <div className="h-px bg-slate-100 my-2" />
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => window.location.reload()}>
              Há»§y bá»
            </Button>
            <Button
              type="submit"
              className="bg-brand-coral hover:bg-[#ff5252] text-white font-bold"
              disabled={updating || avatarUpdating || !isFormValid()}
            >
              {updating && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
              LÆ°u thay Ä‘á»•i
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});
