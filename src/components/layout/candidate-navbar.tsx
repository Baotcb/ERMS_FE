"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrandDecoration } from "@/components/layout/brand-decoration";
import { useAuth } from "@/features/core/auth/hooks/use-auth";
import { logoutAction } from "@/features/core/auth/actions/auth";
import { NavItem } from "./nav-item";
import {
    Bell,
    MessageSquare,
    LogOut,
    Menu,
    Search,
    Bookmark,
    FileCheck,
    ThumbsUp,
    Building2,
    BarChart3,
    Briefcase,
    FileText,
    Mail,
    Shield,
    User,
    KeyRound,
} from 'lucide-react';

// Direct imports — optimizePackageImports in next.config handles tree-shaking
const Icons = {
    Bell, MessageSquare, LogOut, Menu, Search, Bookmark,
    FileCheck, ThumbsUp, Building2, BarChart3, Briefcase,
    FileText, Mail, Shield, User, KeyRound,
};

const JOB_POSITIONS = [
    "Việc làm Nhân viên kinh doanh",
    "Việc làm Kế toán",
    "Việc làm Marketing",
    "Việc làm Hành chính nhân sự",
    "Việc làm Chăm sóc khách hàng",
    "Việc làm Ngân hàng",
    "Việc làm IT",
    "Việc làm Lao động phổ thông",
    "Việc làm Senior",
    "Việc làm Kỹ sư xây dựng",
    "Việc làm Thiết kế đồ họa",
    "Việc làm Bất động sản",
    "Việc làm Giáo dục",
    "Việc làm Telesales",
] as const;

export const CandidateNavbar = memo(function CandidateNavbar() {
    const { isAuthenticated, user, isLoading } = useAuth();

    const handleLogout = useCallback(() => {
        logoutAction();
    }, []);

    const userInitial = useMemo(() => user?.fullName?.charAt(0) || 'U', [user?.fullName]);
    const displayName = useMemo(() => user?.fullName || 'Ứng viên', [user?.fullName]);
    const userEmail = useMemo(() => user?.email || 'email@example.com', [user?.email]);
    const userId = useMemo(() => user?.id || 'N/A', [user?.id]);

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-[#e8e8e8] h-16 shadow-sm">
            <div className="container mx-auto px-4 lg:px-6 h-full flex items-center justify-between max-w-[1320px]">
                {/* Left Side: Brand & Links */}
                <div className="flex items-center gap-6 h-full">
                    <Link href="/jobs" className="flex items-center gap-3 group">
                        {/* Logo */}
                        <div className="relative w-10 h-10 flex-shrink-0 transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="ERMS Logo"
                                fill
                                sizes="40px"
                                className="object-contain"
                            />
                        </div>
                        {/* Brand Text */}
                        <div className="w-[60px] h-full flex items-center justify-center">
                            <BrandDecoration className="w-full h-auto" />
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 h-full">
                        {/* VIỆC LÀM MEGA MENU */}
                        <NavItem
                            label="Việc làm"
                            href="/jobs"
                            className="text-[13px] font-bold px-3 text-[#212f3f] hover:text-[#00b14f]"
                        >
                            <div className="grid grid-cols-[200px_1fr] gap-5 w-[580px] p-4">
                                {/* Column 1: Main Actions */}
                                <div className="space-y-4">
                                    {/* Việc làm Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-[#a6acb2] mb-2 uppercase tracking-wider">Việc làm</h3>
                                        <div className="space-y-0.5">
                                            <Link href="/jobs" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#f0faf4] transition-colors group/item">
                                                <Icons.Search className="w-4 h-4 text-[#00b14f]" />
                                                <span className="text-sm font-bold text-[#00b14f]">Tìm việc làm</span>
                                            </Link>
                                            <Link href="/jobs/saved" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#f4f5f5] transition-colors text-[#6f7882] hover:text-[#00b14f]">
                                                <Icons.Bookmark className="w-4 h-4 text-[#a6acb2]" />
                                                <span className="text-sm">Việc làm đã lưu</span>
                                            </Link>
                                            <Link href="/not-found" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#f4f5f5] transition-colors text-[#6f7882] hover:text-[#00b14f]">
                                                <Icons.FileCheck className="w-4 h-4 text-[#a6acb2]" />
                                                <span className="text-sm">Việc làm đã ứng tuyển</span>
                                            </Link>
                                            <Link href="/not-found" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#f4f5f5] transition-colors text-[#6f7882] hover:text-[#00b14f]">
                                                <Icons.ThumbsUp className="w-4 h-4 text-[#a6acb2]" />
                                                <span className="text-sm">Việc làm phù hợp</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Công ty Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-[#a6acb2] mb-2 uppercase tracking-wider">Công ty</h3>
                                        <div className="space-y-0.5">
                                            <Link href="/not-found" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#f4f5f5] transition-colors text-[#6f7882] hover:text-[#00b14f]">
                                                <Icons.Building2 className="w-4 h-4 text-[#a6acb2]" />
                                                <span className="text-sm">Danh sách công ty</span>
                                            </Link>
                                            <Link href="/not-found" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-[#f4f5f5] transition-colors text-[#6f7882] hover:text-[#00b14f]">
                                                <Icons.BarChart3 className="w-4 h-4 text-[#a6acb2]" />
                                                <span className="text-sm">Top công ty</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2 & 3: Jobs by Position */}
                                <div>
                                    <h3 className="text-xs font-bold text-[#a6acb2] mb-2 uppercase tracking-wider">Việc làm theo vị trí</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                        {JOB_POSITIONS.map((job) => (
                                            <Link
                                                key={job}
                                                href="/not-found"
                                                className="text-sm text-[#6f7882] hover:text-[#00b14f] hover:translate-x-0.5 transition-all"
                                            >
                                                {job}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </NavItem>

                        {/* Other Simple Links */}
                        <NavItem label="Hồ sơ & CV" href="/not-found" className="text-[13px] font-bold px-3 text-[#212f3f] hover:text-[#00b14f]" />
                        <NavItem label="Công ty" href="/not-found" className="text-[13px] font-bold px-3 text-[#212f3f] hover:text-[#00b14f]" />
                        <NavItem label="Cẩm nang" href="/not-found" className="text-[13px] font-bold px-3 text-[#212f3f] hover:text-[#00b14f]" />
                    </div>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center gap-3 h-full">
                    {/* Show skeleton while loading */}
                    {isLoading ? (
                        <div className="flex items-center gap-2 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-[#f4f5f5]" />
                            <div className="w-16 h-4 rounded bg-[#f4f5f5] hidden sm:block" />
                        </div>
                    ) : isAuthenticated ? (
                        <>
                            {/* Notifications */}
                            <div className="hidden sm:flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-[#6f7882] hover:text-[#00b14f] hover:bg-[#f0faf4] rounded-full h-9 w-9"
                                >
                                    <Icons.Bell className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-[#6f7882] hover:text-[#00b14f] hover:bg-[#f0faf4] rounded-full h-9 w-9"
                                >
                                    <Icons.MessageSquare className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="h-5 w-px bg-[#e8e8e8] hidden sm:block" />

                            {/* User Profile Hover Menu */}
                            <NavItem
                                align="right"
                                label={
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8 border border-[#e8e8e8]">
                                            <AvatarImage src="https://github.com/shadcn.png" loading="lazy" />
                                            <AvatarFallback className="bg-[#00b14f] text-white text-xs">{userInitial}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-[#212f3f] hidden sm:block">
                                            {displayName}
                                        </span>
                                    </div>
                                }
                            >
                                <div className="w-[300px]">
                                    {/* Profile Header */}
                                    <div className="p-4 bg-white flex items-start gap-3 border-b border-[#f4f5f5]">
                                        <div className="relative">
                                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                                <AvatarImage src="https://github.com/shadcn.png" loading="lazy" />
                                                <AvatarFallback className="bg-[#00b14f] text-white">{userInitial}</AvatarFallback>
                                            </Avatar>
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00b14f] border-2 border-white rounded-full" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <h4 className="text-sm font-bold text-[#212f3f] truncate">{displayName}</h4>
                                            <p className="text-[11px] text-[#a6acb2] mt-0.5">ID: {userId}</p>
                                            <p className="text-[11px] text-[#a6acb2] truncate">{userEmail}</p>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1 max-h-[60vh] overflow-y-auto">
                                        {/* Section: Quản lý tìm việc */}
                                        <div className="px-4 py-2">
                                            <div className="flex items-center gap-2.5 text-[#212f3f] font-semibold text-[13px] mb-1.5">
                                                <Icons.Briefcase className="w-4 h-4 text-[#00b14f]" />
                                                <span>Quản lý tìm việc</span>
                                            </div>
                                            <div className="pl-6.5 space-y-1.5" style={{ paddingLeft: '26px' }}>
                                                <Link href="/jobs/saved" className="block text-[13px] text-[#6f7882] hover:text-[#00b14f] transition-colors py-0.5">Việc làm đã lưu</Link>
                                                <Link href="/not-found" className="block text-[13px] text-[#6f7882] hover:text-[#00b14f] transition-colors py-0.5">Việc làm đã ứng tuyển</Link>
                                                <Link href="/not-found" className="block text-[13px] text-[#6f7882] hover:text-[#00b14f] transition-colors py-0.5">Việc làm phù hợp</Link>
                                            </div>
                                        </div>

                                        {/* Section: Quản lý CV */}
                                        <div className="px-4 py-2">
                                            <div className="flex items-center gap-2.5 text-[#212f3f] font-semibold text-[13px] mb-1.5">
                                                <Icons.FileText className="w-4 h-4 text-[#00b14f]" />
                                                <span>Quản lý CV</span>
                                            </div>
                                            <div style={{ paddingLeft: '26px' }}>
                                                <Link href="/profile/cv" className="block text-[13px] text-[#6f7882] hover:text-[#00b14f] transition-colors py-0.5">
                                                    CV của tôi
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Section: Email & Thông báo */}
                                        <Link
                                            href="/not-found"
                                            className="px-4 py-2.5 flex items-center gap-2.5 text-[#212f3f] font-semibold text-[13px] hover:bg-[#f4f5f5] transition-colors"
                                        >
                                            <Icons.Mail className="w-4 h-4 text-[#00b14f]" />
                                            <span>Email & Thông báo</span>
                                        </Link>

                                        {/* Section: Cá nhân & Bảo mật */}
                                        <div className="px-4 py-2">
                                            <div className="flex items-center gap-2.5 text-[#212f3f] font-semibold text-[13px] mb-1.5">
                                                <Icons.Shield className="w-4 h-4 text-[#00b14f]" />
                                                <span>Cá nhân & Bảo mật</span>
                                            </div>
                                            <div style={{ paddingLeft: '26px' }} className="space-y-1.5">
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-2 text-[13px] text-[#6f7882] hover:text-[#00b14f] transition-colors py-0.5"
                                                >
                                                    <Icons.User className="w-3.5 h-3.5" />
                                                    <span>Thông tin cá nhân</span>
                                                </Link>
                                                <Link
                                                    href="/settings/security"
                                                    className="flex items-center gap-2 text-[13px] text-[#6f7882] hover:text-[#00b14f] transition-colors py-0.5"
                                                >
                                                    <Icons.KeyRound className="w-3.5 h-3.5" />
                                                    <span>Đổi mật khẩu</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer: Logout */}
                                    <div className="p-3 border-t border-[#f4f5f5]">
                                        <Button
                                            variant="outline"
                                            className="w-full border-[#e74c3c] text-[#e74c3c] hover:bg-[#e74c3c] hover:text-white font-semibold h-9 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                            onClick={handleLogout}
                                        >
                                            <Icons.LogOut className="w-4 h-4" />
                                            Đăng xuất
                                        </Button>
                                    </div>
                                </div>
                            </NavItem>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button
                                    variant="outline"
                                    className="border-[#00b14f] text-[#00b14f] hover:bg-[#00b14f] hover:text-white font-semibold h-9 px-4 rounded-lg text-sm transition-colors"
                                >
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-[#00b14f] hover:bg-[#009643] text-white font-semibold h-9 px-4 rounded-lg text-sm shadow-none transition-colors">
                                    Đăng ký
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Trigger */}
                    <Button variant="ghost" size="icon" className="md:hidden text-[#6f7882] h-9 w-9">
                        <Icons.Menu className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </nav>
    );
});
