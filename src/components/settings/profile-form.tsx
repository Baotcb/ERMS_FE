"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect } from "react"
import { Loader2, Camera, User, Mail, Phone, MapPin } from "lucide-react"

const profileFormSchema = z.object({
    fullName: z
        .string()
        .min(2, {
            message: "Tên phải có ít nhất 2 ký tự.",
        })
        .max(30, {
            message: "Tên không được quá 30 ký tự.",
        }),
    email: z.string().email(),
    phoneNumber: z.string().min(10, { message: "Số điện thoại không hợp lệ" }).optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
    const { user, isLoading } = useAuth()

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
            address: "",
        },
        mode: "onChange",
    })

    useEffect(() => {
        if (user) {
            form.reset({
                fullName: user.fullName || user.name || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                address: user.address || "",
            })
        }
    }, [user, form])

    async function onSubmit(data: ProfileFormValues) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        toast({
            title: "Cập nhật thành công",
            description: "Thông tin hồ sơ của bạn đã được thay đổi.",
        })
    }

    if (isLoading) {
        return <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
    }

    return (
        <div className="grid gap-6">
            <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader className="bg-muted/20">
                    <CardTitle className="text-primary flex items-center gap-2">
                        <User className="size-5" />
                        Thông Tin Cá Nhân
                    </CardTitle>

                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Avatar Section */}
                            <div className="flex justify-center pb-6">
                                <div className="relative group">
                                    <Avatar className="size-32 border-4 border-background shadow-xl cursor-pointer">
                                        <AvatarImage src="" />
                                        <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                                            {user?.name?.charAt(0).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="text-white size-10 drop-shadow-md" />
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full border-2 border-background shadow-sm">
                                        <Camera className="size-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Họ và tên</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="Nhập tên hiển thị" {...field} />
                                                </div>
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        readOnly
                                                        className="pl-9 bg-muted/50 text-muted-foreground"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Số điện thoại</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="0912345678" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quê quán</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="Hà Nội, Việt Nam" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" className="min-w-[120px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
