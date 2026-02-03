"use client";

import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { memo, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrandDecoration } from "@/components/layout/brand-decoration";
import { useAuth } from "@/features/core/auth/hooks/use-auth";
import { logoutAction } from "@/features/core/auth/actions/auth";
import { NavItem } from "./nav-item";

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
        <nav className="sticky top-0 z-50 bg-white border-b border-sidebar-border h-20 transition-all">
            <div className="w-full px-6 lg:px-10 h-full flex items-center justify-between">
                {/* Left Side: Brand & Links */}
                <div className="flex items-center gap-8 h-full">
                    <Link href="/jobs" className="flex items-center gap-4 group">
                        {/* Logo Container */}
                        <div className="flex items-center justify-center">
                            {/* Logo */}
                            <div className="relative w-16 h-16 flex-shrink-0 transition-transform group-hover:scale-105">
                                <Image
                                    src="/logo.png"
                                    alt="ERMS Logo"
                                    fill
                                    sizes="64px"
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        {/* Brand Decoration Icon - 70px wide */}
                        <div className="w-[70px] h-full flex items-center justify-center">
                            <BrandDecoration className="w-full h-auto drop-shadow-sm" />
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-6 h-full">
                        {/* VIỆC LÀM MEGA MENU */}
                        <NavItem
                            label="Việc làm"
                            href="/jobs"
                            className="text-[13px] font-bold min-w-[70px] justify-center"
                        >
                            <div className="grid grid-cols-[200px_1fr] gap-5 w-[580px] p-4">
                                {/* Column 1: Main Actions */}
                                <div className="space-y-4">
                                    {/* Việc làm Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Việc làm</h3>
                                        <div className="space-y-0.5">
                                            <Link href="/jobs" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors group">
                                                <Search className="w-4 h-4 text-[#FF7E67]" />
                                                <span className="text-sm font-bold text-[#FF7E67] group-hover:text-[#FF7E67]/80">Tìm việc làm</span>
                                            </Link>
                                            <Link href="/jobs/saved" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-slate-600 hover:text-[#0F4C75]">
                                                <Bookmark className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm">Việc làm đã lưu</span>
                                            </Link>
                                            <Link href="/not-found" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-slate-600 hover:text-[#0F4C75]">
                                                <FileCheck className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm">Việc làm đã ứng tuyển</span>
                                            </Link>
                                            <Link href="/not-found" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-slate-600 hover:text-[#0F4C75]">
                                                <ThumbsUp className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm">Việc làm phù hợp</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Công ty Section */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Công ty</h3>
                                        <div className="space-y-0.5">
                                            <Link href="/not-found" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-slate-600 hover:text-[#0F4C75]">
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm">Danh sách công ty</span>
                                            </Link>
                                            <Link href="/not-found" className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 transition-colors text-slate-600 hover:text-[#0F4C75]">
                                                <BarChart3 className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm">Top công ty</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2 & 3: Jobs by Position */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Việc làm theo vị trí</h3>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                        {JOB_POSITIONS.map((job) => (
                                            <Link
                                                key={job}
                                                href="/not-found"
                                                className="text-sm text-slate-600 hover:text-[#0F4C75] hover:translate-x-1 transition-all"
                                            >
                                                {job}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </NavItem>

                        {/* Other Simple Links or Menus */}
                        <NavItem label="Hồ sơ & CV" href="/not-found" className="text-[13px] font-bold min-w-[70px] justify-center" />
                        <NavItem label="Công ty" href="/not-found" className="text-[13px] font-bold min-w-[70px] justify-center" />
                        <NavItem label="Cẩm nang" href="/not-found" className="text-[13px] font-bold min-w-[70px] justify-center" />
                    </div>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center gap-4 h-full">
                    {/* Show skeleton while loading to prevent flash */}
                    {isLoading ? (
                        <div className="flex items-center gap-2 animate-pulse">
                            <div className="w-9 h-9 rounded-full bg-slate-200" />
                            <div className="w-20 h-4 rounded bg-slate-200 hidden sm:block" />
                        </div>
                    ) : isAuthenticated ? (
                        <>
                            {/* Notifications */}
                            <div className="hidden sm:flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-brand-primary hover:bg-slate-50 rounded-full">
                                    <Bell className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-brand-primary hover:bg-slate-50 rounded-full">
                                    <MessageSquare className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

                            {/* User Profile Hover Menu */}
                            <NavItem
                                align="right"
                                label={
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-9 h-9 border border-slate-200">
                                            <AvatarImage src="https://github.com/shadcn.png" />
                                            <AvatarFallback>{userInitial}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-slate-700 hidden sm:block">
                                            {displayName}
                                        </span>
                                    </div>
                                }
                            >
                                <div className="w-[320px]">
                                    {/* Profile Header */}
                                    <div className="p-5 bg-white flex items-start gap-4 border-b border-gray-100">
                                        <div className="relative">
                                            <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>{userInitial}</AvatarFallback>
                                            </Avatar>
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#FF7E67] border-2 border-white rounded-full"></span>
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <h4 className="text-base font-bold text-brand-dark truncate leading-tight">{displayName}</h4>
                                            <p className="text-xs text-gray-500 font-medium mt-1">ID: {userId}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{userEmail}</p>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2 max-h-[60vh] overflow-y-auto">
                                        {/* Section 1: Quản lý tìm việc */}
                                        <div className="px-4 py-2">
                                            <div className="flex items-center justify-between text-brand-dark font-bold text-sm mb-2 cursor-pointer hover:text-brand-primary transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Briefcase className="w-5 h-5 text-brand-primary" />
                                                    <span>Quản lý tìm việc</span>
                                                </div>
                                            </div>
                                            <div className="pl-8 space-y-2">
                                                <Link href="/jobs/saved" className="block text-sm text-gray-600 hover:text-brand-primary transition-colors">Việc làm đã lưu</Link>
                                                <Link href="/not-found" className="block text-sm text-gray-600 hover:text-brand-primary transition-colors">Việc làm đã ứng tuyển</Link>
                                                <Link href="/not-found" className="block text-sm text-gray-600 hover:text-brand-primary transition-colors">Việc làm phù hợp</Link>
                                            </div>
                                        </div>

                                        {/* Section 2: Quản lý CV */}
                                        <div className="px-4 py-2 mt-2">
                                            <div className="flex items-center justify-between text-brand-dark font-bold text-sm mb-2 cursor-pointer hover:text-brand-primary transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-brand-primary" />
                                                    <span>Quản lý CV</span>
                                                </div>
                                            </div>
                                            <div className="pl-8">
                                                <Link href="/profile/cv" className="block text-sm text-gray-600 hover:text-brand-primary transition-colors">
                                                    CV của tôi
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Section 3: Email & Thông báo */}
                                        <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors group mt-1">
                                            <Link href="/not-found" className="flex items-center gap-3 text-brand-dark font-bold text-sm group-hover:text-brand-primary transition-colors">
                                                <div className="w-5 flex justify-center"><Mail className="w-5 h-5 text-brand-primary" /></div>
                                                <span>Email & Thông báo</span>
                                            </Link>
                                            <div className="w-4 h-4" /> {/* Spacer for alignment if no chevron */}
                                        </div>

                                        {/* Section 4: Cá nhân & Bảo mật - Dropdown */}
                                        <div className="px-4 py-2 mt-1">
                                            <div className="flex items-center gap-3 text-brand-dark font-bold text-sm mb-2">
                                                <div className="w-5 flex justify-center"><Shield className="w-5 h-5 text-brand-primary" /></div>
                                                <span>Cá nhân & Bảo mật</span>
                                            </div>
                                            <div className="pl-8 space-y-2">
                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-primary transition-colors py-1"
                                                >
                                                    <User className="w-4 h-4" />
                                                    <span>Thông tin cá nhân</span>
                                                </Link>
                                                <Link
                                                    href="/settings/security"
                                                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-primary transition-colors py-1"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                    <span>Đổi mật khẩu</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="p-4 border-t border-slate-100">
                                        <Button
                                            variant="destructive"
                                            className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold h-10 rounded-lg flex items-center justify-center gap-2"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Đăng xuất
                                        </Button>
                                    </div>
                                </div>
                            </NavItem>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" className="text-brand-dark font-semibold hover:text-brand-primary hover:bg-brand-light">
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button className="bg-brand-coral hover:bg-brand-coral/90 text-white font-bold shadow-md shadow-brand-coral/20">
                                    Đăng ký
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Trigger */}
                    <Button variant="ghost" size="icon" className="md:hidden text-slate-500">
                        <Menu className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </nav>
    );
});



