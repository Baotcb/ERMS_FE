'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { ProfileAvatarSection, useProfileForm, type UserProfileDto } from '@/features/core/user-profile';
import { FormField } from '@/components/ui/form-field';

interface ProfileFormViewProps {
  initialData: UserProfileDto | null;
  user: { id: string; email: string; fullName?: string; role?: string } | null;
}

export const ProfileFormView = memo(function ProfileFormView({ initialData, user }: ProfileFormViewProps) {
  const {
    fullName,
    phone,
    hometown,
    dob,
    errors,
    updating,
    maxDate,
    handleFullNameChange,
    handlePhoneChange,
    handleDobChange,
    handleHometownChange,
    handleSubmit,
    isFormValid,
  } = useProfileForm({
    initialData,
    onSuccess: () => window.location.reload(),
  });

  const displayName = fullName || user?.fullName || 'Chưa cập nhật tên';
  const displayEmail = user?.email || '';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Thông tin cá nhân</h1>
        <p className="text-slate-500 text-sm">Cập nhật thông tin hồ sơ của bạn cho nhà tuyển dụng.</p>
      </div>
      <ProfileAvatarSection displayName={displayName} role={user?.role} location={hometown} />
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <FormField label="Họ và Tên" error={errors.fullName}>
            <Input value={fullName} onChange={handleFullNameChange} placeholder="Nhập họ và tên" className={errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''} />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Email"><Input value={displayEmail} disabled className="bg-slate-50" /></FormField>
            <FormField label="Số điện thoại" error={errors.phone} hint="Định dạng số điện thoại Việt Nam">
              <Input type="tel" value={phone} onChange={handlePhoneChange} placeholder="Ví dụ: 0987654321" className={errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Ngày sinh" error={errors.dob} hint="Bạn phải ít nhất 18 tuổi">
              <Input type="date" value={dob} onChange={handleDobChange} max={maxDate} className={errors.dob ? 'border-red-500 focus-visible:ring-red-500' : ''} />
            </FormField>
            <FormField label="Quê quán / Địa điểm" error={errors.hometown}>
              <Input value={hometown} onChange={handleHometownChange} placeholder="Nhập quê quán" className={errors.hometown ? 'border-red-500 focus-visible:ring-red-500' : ''} />
            </FormField>
          </div>
          <div className="h-px bg-slate-100 my-2" />
          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy bỏ</Button>
            <Button type="submit" className="bg-brand-coral hover:bg-[#ff5252] text-white font-bold" disabled={updating || !isFormValid()}>
              {updating && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});
