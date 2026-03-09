'use client';

import { memo, useCallback, useState } from 'react';
import { Camera } from 'lucide-react';
import { ImageUpload } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileAvatarSectionProps {
  displayName: string;
  location?: string;
  avatarUrl?: string;
  isAvatarUpdating?: boolean;
  onAvatarUploaded?: (avatarUrl: string) => void | Promise<void>;
  onRemoveAvatar?: () => void | Promise<void>;
}

export const ProfileAvatarSection = memo(function ProfileAvatarSection({
  displayName,
  location,
  avatarUrl,
  isAvatarUpdating = false,
  onAvatarUploaded,
  onRemoveAvatar,
}: ProfileAvatarSectionProps) {
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const toggleUploader = useCallback(() => {
    setIsUploaderOpen((prev) => !prev);
  }, []);

  const handleUploadComplete = useCallback(
    async (nextAvatarUrl: string) => {
      await onAvatarUploaded?.(nextAvatarUrl);
      setIsUploaderOpen(false);
    },
    [onAvatarUploaded]
  );

  const handleRemoveAvatar = useCallback(async () => {
    await onRemoveAvatar?.();
    setIsUploaderOpen(false);
  }, [onRemoveAvatar]);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-center">
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-brand-coral text-white p-1.5 rounded-full shadow-lg hover:bg-[#ff5252] transition-colors"
                onClick={toggleUploader}
                disabled={isAvatarUpdating}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-brand-dark text-xl font-bold">{displayName}</h3>
              <p className="text-slate-500 text-sm flex items-center gap-1 justify-center sm:justify-start mt-1">
                {location || 'ChÆ°a cáº­p nháº­t Ä‘á»‹a Ä‘iá»ƒm'}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={handleRemoveAvatar}
              disabled={isAvatarUpdating || !avatarUrl}
            >
              XÃ³a áº£nh
            </Button>
            <Button
              type="button"
              className="flex-1 sm:flex-none bg-brand-primary hover:bg-blue-700"
              onClick={toggleUploader}
              disabled={isAvatarUpdating}
            >
              Äá»•i áº£nh
            </Button>
          </div>
        </div>

        {isUploaderOpen ? (
          <ImageUpload
            onUploadComplete={handleUploadComplete}
            defaultImage={avatarUrl || undefined}
            disabled={isAvatarUpdating}
          />
        ) : null}
      </div>
    </div>
  );
});
