'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle2, Trash2, Eye, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export function CVUpload() {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadedCV, setUploadedCV] = useState<{ name: string; date: string } | null>(null)
    const { toast } = useToast()

    const handleUpload = () => {
        setIsUploading(true)
        setTimeout(() => {
            setUploadedCV({
                name: 'Nguyen-Van-A-CV-Fullstack.pdf',
                date: new Date().toLocaleDateString('vi-VN')
            })
            setIsUploading(false)
            toast({
                title: "Tải lên thành công",
                description: "Hồ sơ của bạn đã được cập nhật.",
            })
        }, 1500)
    }

    const handleDelete = () => {
        if (confirm('Bạn có chắc chắn muốn xóa CV này không?')) {
            setUploadedCV(null)
            toast({
                title: "Đã xóa CV",
                description: "CV đã được gỡ bỏ khỏi hồ sơ.",
                variant: 'destructive'
            })
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-brand-dark">
                    <FileText className="w-8 h-8 text-brand-primary" />
                    Quản lý CV & Hồ sơ
                </h1>
                <p className="text-lg text-gray-500 mt-2">
                    Tải lên CV giúp nhà tuyển dụng tìm thấy bạn nhanh hơn 50%.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">CV đã tải lên</h2>
                                <p className="text-sm text-slate-500">CV chính dùng để ứng tuyển nhanh (.pdf, .doc, .docx)</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 bg-brand-primary/10 text-brand-primary rounded">
                                Khuyên dùng
                            </span>
                        </div>

                        <div className="p-8">
                            {uploadedCV ? (
                                <div className="flex items-start gap-4 p-5 border rounded-xl bg-blue-50/30 border-blue-100 transition-all hover:shadow-md">
                                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 text-red-500">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h3 className="font-bold text-slate-800 text-lg truncate" title={uploadedCV.name}>
                                            {uploadedCV.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Cập nhật: {uploadedCV.date} • 2.5 MB
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-2 text-green-600 text-sm font-semibold">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Đã sẵn sàng ứng tuyển</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button variant="outline" size="sm" className="hover:bg-blue-50 text-blue-600 border-blue-200">
                                            <Eye className="w-4 h-4 mr-2" /> Xem
                                        </Button>
                                        <Button variant="outline" size="sm" className="hover:bg-red-50 text-red-600 border-red-200 hover:border-red-300" onClick={handleDelete}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={!isUploading ? handleUpload : undefined}
                                    className={cn(
                                        "border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300",
                                        isUploading ? "opacity-70 cursor-wait bg-slate-50" : "cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-[1.01]"
                                    )}
                                >
                                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6 shadow-inner">
                                        {isUploading ? (
                                            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Upload className="w-10 h-10 text-slate-400" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 mb-2">
                                        {isUploading ? 'Đang tải lên...' : 'Kéo thả hoặc Click để tải lên'}
                                    </h3>
                                    <p className="text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                                        Hỗ trợ định dạng PDF, DOC, DOCX. Dung lượng tối đa 5MB.
                                    </p>
                                    <Button
                                        className="bg-brand-primary hover:bg-brand-primary/90 font-bold text-lg h-12 px-8"
                                        disabled={isUploading}
                                    >
                                        Chọn file từ máy tính
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-brand-primary" />
                            Trạng thái hồ sơ
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-600">Mức độ hoàn thiện</span>
                                <span className="font-bold text-brand-primary">70%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                            <p className="text-xs text-slate-500">
                                Hãy cập nhật thêm kinh nghiệm làm việc để đạt 100%.
                            </p>
                            <Button variant="outline" className="w-full text-brand-primary border-brand-primary hover:bg-brand-primary/5">
                                Cập nhật Profile
                            </Button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-brand-primary/5 to-purple-500/5 rounded-xl p-6 border border-brand-primary/10">
                        <h3 className="font-bold text-brand-dark mb-4">Mẹo CV ấn tượng</h3>
                        <ul className="space-y-3 text-sm text-slate-700">
                            <li className="flex gap-2 items-start">
                                <span className="text-brand-primary font-bold">•</span>
                                <div>Chỉ nên dài từ <span className="font-bold">1-2 trang</span></div>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="text-brand-primary font-bold">•</span>
                                <div>Tập trung vào <span className="font-bold">số liệu</span> cụ thể</div>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="text-brand-primary font-bold">•</span>
                                <div>Dùng định dạng <span className="font-bold">PDF</span> chuẩn</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
