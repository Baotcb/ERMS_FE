"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-brand-light text-center px-6">
            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <Ghost className="w-12 h-12 text-brand-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-brand-dark mb-4">404</h1>
            <h2 className="text-xl md:text-2xl font-bold text-slate-700 mb-2">Trang không tồn tại</h2>
            <p className="text-slate-500 mb-8 max-w-md">
                Rất tiếc, trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={() => window.history.back()}
                    className="bg-brand-primary hover:bg-blue-700 h-11 px-8 rounded-xl font-bold"
                >
                    Quay lại
                </Button>

            </div>
        </div>
    );
}
