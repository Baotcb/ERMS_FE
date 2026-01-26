'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera } from 'lucide-react';

interface ProfileAvatarSectionProps {
  displayName: string;
  role?: string;
  location?: string;
  avatarUrl?: string;
  onChangeAvatar?: () => void;
  onRemoveAvatar?: () => void;
}

export const ProfileAvatarSection = memo(function ProfileAvatarSection({
  displayName,
  role = 'Candidate',
  location,
  avatarUrl = 'https://github.com/shadcn.png',
  onChangeAvatar,
  onRemoveAvatar,
}: ProfileAvatarSectionProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between">
        <div className="flex flex-col sm:flex-row gap-5 items-center">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-white shadow-md">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-brand-coral text-white p-1.5 rounded-full shadow-lg hover:bg-[#ff5252] transition-colors"
              onClick={onChangeAvatar}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-brand-dark text-xl font-bold">{displayName}</h3>
            <p className="text-brand-primary text-sm font-medium">{role}</p>
            <p className="text-slate-500 text-sm flex items-center gap-1 justify-center sm:justify-start mt-1">
              {location || 'Chưa cập nhật địa điểm'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={onRemoveAvatar}
          >
            Xóa ảnh
          </Button>
          <Button
            className="flex-1 sm:flex-none bg-brand-primary hover:bg-blue-700"
            onClick={onChangeAvatar}
          >
            Đổi ảnh
          </Button>
        </div>
      </div>
    </div>
  );
});
