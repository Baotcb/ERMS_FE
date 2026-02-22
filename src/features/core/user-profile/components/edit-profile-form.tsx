"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/features/core/auth";
import { getProfile, updateProfile, UserProfileDto } from "@/features/core/user-profile/api/profile-service";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

// Validation constants
const MIN_AGE = 18;
const VIETNAM_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/;

type FormData = { fullName: string; phone: string; hometown: string; dob: string }
type FormErrors = { fullName?: string; phone?: string; hometown?: string; dob?: string }

export const EditProfileForm = memo(function EditProfileForm() {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState<UserProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { toast } = useToast();
    const fetchedRef = useRef(false);

    const [formData, setFormData] = useState<FormData>({ fullName: "", phone: "", hometown: "", dob: "" });
    const [errors, setErrors] = useState<FormErrors>({});

    // Calculate max date (18 years ago from today)
    const today = new Date();
    const maxDate = new Date(
        today.getFullYear() - MIN_AGE,
        today.getMonth(),
        today.getDate()
    ).toISOString().split('T')[0];

    // Validation functions - memoized for performance
    const validatePhone = useCallback((value: string): string | undefined => {
        if (!value) return undefined;
        if (!VIETNAM_PHONE_REGEX.test(value)) {
            return "Số điện thoại không đúng định dạng Việt Nam";
        }
        return undefined;
    }, []);

    const validateDOB = useCallback((value: string): string | undefined => {
        if (!value) return undefined;
        const birthDate = new Date(value);
        const today = new Date();

        if (birthDate > today) {
            return "Ngày sinh không được trong tương lai";
        }

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        // Subtract 1 if birthday hasn't occurred yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < MIN_AGE) {
            return `Bạn phải ít nhất ${MIN_AGE} tuổi`;
        }

        return undefined;
    }, []);

    const validateFullName = useCallback((value: string): string | undefined => {
        if (!value) return "Họ và tên không được để trống";
        if (value.trim().length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
        if (value.trim().length > 100) return "Họ và tên không được quá 100 ký tự";
        if (!/^[\p{L}\s]+$/u.test(value)) return "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
        return undefined;
    }, []);

    const validateHometown = useCallback((value: string): string | undefined => {
        if (value && value.length > 200) return "Địa chỉ không được quá 200 ký tự";
        return undefined;
    }, []);

    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, phone: value }));
        setErrors(prev => ({ ...prev, phone: validatePhone(value) }));
    }, [validatePhone]);

    const handleDobChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, dob: value }));
        setErrors(prev => ({ ...prev, dob: validateDOB(value) }));
    }, [validateDOB]);

    const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, fullName: value }));
        setErrors(prev => ({ ...prev, fullName: validateFullName(value) }));
    }, [validateFullName]);

    const handleHometownChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, hometown: value }));
        setErrors(prev => ({ ...prev, hometown: validateHometown(value) }));
    }, [validateHometown]);

    const isFormValid = useCallback(() => {
        return !errors.fullName && !errors.phone && !errors.hometown && !errors.dob &&
            formData.fullName.trim().length >= 2;
    }, [errors.fullName, errors.phone, errors.hometown, errors.dob, formData.fullName]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfile();
                setProfile(data);
                setFormData({
                    fullName: data.fullName || "",
                    phone: data.phones || "",
                    hometown: data.hometown || "",
                    dob: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
                });
            } catch (error) {
                logger.error('Failed to fetch user profile', error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin hồ sơ",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        if (user && !fetchedRef.current) {
            fetchedRef.current = true;
            fetchProfile();
        }
    }, [toast, user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const { fullName, phone, hometown, dob } = formData;
        const newErrors: FormErrors = {
            fullName: validateFullName(fullName),
            phone: validatePhone(phone),
            hometown: validateHometown(hometown),
            dob: validateDOB(dob),
        };

        setErrors(newErrors);

        if (Object.values(newErrors).some((error) => error !== undefined)) {
            toast({
                title: "Lỗi",
                description: "Vui lòng kiểm tra lại thông tin đã nhập",
                variant: "destructive"
            });
            return;
        }

        setUpdating(true);
        try {
            const updatedProfile = await updateProfile({
                fullName,
                phones: phone,
                hometown,
                dateOfBirth: dob ? new Date(dob).toISOString() : undefined
            });

            setProfile(updatedProfile);

            if (updatedProfile.fullName) updateUser({ fullName: updatedProfile.fullName });

            if (updatedProfile.dateOfBirth) {
                const formattedDob = new Date(updatedProfile.dateOfBirth).toISOString().split('T')[0];
                if (formattedDob !== dob) {
                    setFormData(prev => ({ ...prev, dob: formattedDob }));
                }
            }

            setErrors({});

            toast({
                title: "Thành công",
                description: "Đã cập nhật hồ sơ thành công",
                className: "bg-green-500 text-white"
            });
        } catch {
            toast({
                title: "Lỗi",
                description: "Cập nhật hồ sơ thất bại",
                variant: "destructive"
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin w-8 h-8 text-brand-primary" /></div>;
    }

    const { fullName, phone, hometown, dob } = formData;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-brand-dark">Thông tin cá nhân</h1>
                <p className="text-slate-500 text-sm">Cập nhật thông tin hồ sơ của bạn cho nhà tuyển dụng.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between">
                    <div className="flex flex-col sm:flex-row gap-5 items-center">
                        <div className="relative group">
                            <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>{fullName ? fullName.charAt(0) : "U"}</AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 bg-brand-coral text-white p-1.5 rounded-full shadow-lg hover:bg-[#ff5252] transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-brand-dark text-xl font-bold">{fullName || "Chưa cập nhật tên"}</h3>
                            <p className="text-brand-primary text-sm font-medium">Candidate</p>
                            <p className="text-slate-500 text-sm flex items-center gap-1 justify-center sm:justify-start mt-1">
                                {hometown || "Chưa cập nhật địa điểm"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:flex-none">Xóa ảnh</Button>
                        <Button className="flex-1 sm:flex-none bg-brand-primary hover:bg-blue-700">Đổi ảnh</Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 md:p-8">
                <form className="flex flex-col gap-6" onSubmit={handleUpdate}>
                    <div className="space-y-2">
                        <Label>Họ và Tên</Label>
                        <Input
                            value={fullName}
                            onChange={handleFullNameChange}
                            placeholder="Nhập họ và tên"
                            className={errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.fullName && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={profile?.email || ""} disabled className="bg-slate-50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Số điện thoại</Label>
                            <Input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="Ví dụ: 0987654321"
                                className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                            {errors.phone && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.phone}
                                </p>
                            )}
                            <p className="text-xs text-slate-500">Định dạng số điện thoại Việt Nam</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Ngày sinh</Label>
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={dob}
                                    onChange={handleDobChange}
                                    max={maxDate}
                                    className={errors.dob ? "border-red-500 focus-visible:ring-red-500" : ""}
                                />
                            </div>
                            {errors.dob && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.dob}
                                </p>
                            )}
                            <p className="text-xs text-slate-500">Bạn phải ít nhất 18 tuổi</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Quê quán / Địa điểm</Label>
                            <Input
                                value={hometown}
                                onChange={handleHometownChange}
                                placeholder="Nhập quê quán"
                                className={errors.hometown ? "border-red-500 focus-visible:ring-red-500" : ""}
                            />
                            {errors.hometown && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {errors.hometown}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 my-2"></div>

                    <div className="flex justify-end gap-4">
                        <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy bỏ</Button>
                        <Button type="submit" className="bg-brand-coral hover:bg-[#ff5252] text-white font-bold" disabled={updating || !isFormValid()}>
                            {updating ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            Lưu thay đổi
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
});
