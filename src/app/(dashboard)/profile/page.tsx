'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useProfileStore } from '@/lib/stores/profile-store'
import { useProfileForm } from '@/hooks/use-profile-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/common/navbar'
import { Footer } from '@/components/common/footer'
import { Loader2, Edit, X, Save } from 'lucide-react'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

export default function ProfilePage() {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const { profile, fetchProfile, isLoading } = useProfileStore()
    const { form, onSubmit, resetForm, isUpdating } = useProfileForm()
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        // If not authenticated, redirect handling should be done via middleware or protected route wrappers usually
        // But keeping this as per original code, might need adjustment if AuthContext logic differs
        if (!isAuthenticated) {
            // router.push('/login') // Let the user navigate or middleware handle
        }

        fetchProfile()
    }, [isAuthenticated, router, fetchProfile])

    useEffect(() => {
        // Reset form when profile data changes and not editing
        if (profile && !isEditing) {
            form.reset({
                fullName: profile.fullName || '',
                dateOfBirth: profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toISOString().split('T')[0]
                    : '',
                hometown: profile.hometown || '',
                phones: profile.phones || '',
            })
        }
    }, [profile, isEditing, form])

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        resetForm()
        setIsEditing(false)
    }

    const handleSave = async () => {
        const success = await onSubmit(form.getValues())
        if (success) {
            setIsEditing(false)
        }
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Chưa cập nhật'
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const getStatusBadge = (status: number) => {
        const statusMap = {
            0: { label: 'Không hoạt động', variant: 'secondary' as const },
            1: { label: 'Hoạt động', variant: 'default' as const },
            2: { label: 'Tạm khóa', variant: 'destructive' as const },
        }
        return statusMap[status as keyof typeof statusMap] || statusMap[0]
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </main>
                <Footer />
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Lỗi tải hồ sơ</CardTitle>
                            <CardDescription>Không thể tải thông tin hồ sơ của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={fetchProfile} className="w-full">
                                Thử lại
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        )
    }

    const statusInfo = getStatusBadge(profile.status)

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
                        {!isEditing && (
                            <Button onClick={handleEdit} className="gap-2">
                                <Edit className="h-4 w-4" />
                                Chỉnh sửa
                            </Button>
                        )}
                    </div>

                    {/* Profile Overview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarFallback className="text-2xl bg-blue-600 text-white">
                                        {profile.fullName?.charAt(0)?.toUpperCase() || profile.userName?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{profile.fullName || 'Chưa cập nhật'}</CardTitle>
                                    <CardDescription className="text-lg">{profile.userName}</CardDescription>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={statusInfo.variant}>
                                            {statusInfo.label}
                                        </Badge>
                                        {profile.departmentName && (
                                            <Badge variant="outline">
                                                {profile.departmentName}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Profile Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin chi tiết</CardTitle>
                            <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                                        {/* Edit Form */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="fullName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Họ và tên *</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Nhập họ và tên" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="dateOfBirth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Ngày sinh</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="date" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="hometown"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Quê quán</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Nhập quê quán" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="phones"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Số điện thoại</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="0912345678" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <Button type="submit" disabled={isUpdating} className="gap-2">
                                                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                                                <Save className="h-4 w-4" />
                                                Lưu thay đổi
                                            </Button>
                                            <Button type="button" variant="outline" onClick={handleCancel} disabled={isUpdating}>
                                                <X className="h-4 w-4 mr-2" />
                                                Hủy
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            ) : (
                                <>
                                    {/* Display Mode */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Họ và tên</Label>
                                            <p className="text-lg font-medium mt-1">{profile.fullName || 'Chưa cập nhật'}</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Tên đăng nhập</Label>
                                            <p className="text-lg font-medium mt-1">{profile.userName}</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                                            <p className="text-lg font-medium mt-1">{profile.email}</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Ngày sinh</Label>
                                            <p className="text-lg font-medium mt-1">{formatDate(profile.dateOfBirth)}</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Quê quán</Label>
                                            <p className="text-lg font-medium mt-1">{profile.hometown || 'Chưa cập nhật'}</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Số điện thoại</Label>
                                            <p className="text-lg font-medium mt-1">{profile.phones || 'Chưa cập nhật'}</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Phòng ban</Label>
                                            <p className="text-lg font-medium mt-1">{profile.departmentName || 'Chưa phân công'}</p>
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Ngày tham gia</Label>
                                            <p className="text-lg font-medium mt-1">{formatDate(profile.dateJoined)}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    )
}
