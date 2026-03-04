'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { mutate } from 'swr'
import { cn } from '@/lib/utils'
import {
    Upload,
    FileSpreadsheet,
    AlertCircle,
    X,
    Loader2,
    CheckCircle,
    AlertTriangle,
    XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { importEmployeesFromFile } from '@/features/hr/api/employee-service'
import { useToast } from '@/hooks/use-toast'
import type { ImportEmployeesResult } from '@/features/hr/types/import-types'

interface EmployeeImportProps {
    onSuccess?: () => void
    onCancel?: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EmployeeImport({ onSuccess, onCancel }: EmployeeImportProps) {
    const { toast } = useToast()

    const [file, setFile] = useState<File | null>(null)
    const [importResult, setImportResult] = useState<ImportEmployeesResult | null>(null)
    const [isParsing, setIsParsing] = useState(false)
    const [step, setStep] = useState<'upload' | 'review' | 'importing'>('upload')

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const dropped = acceptedFiles[0]
        if (!dropped) return

        setFile(dropped)
        setImportResult(null)
        setStep('upload')
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        multiple: false
    })

    const handleAnalyze = async () => {
        if (!file) return

        setIsParsing(true)
        try {
            // Step 1: Analyze (commit=false)
            const result = await importEmployeesFromFile(file, false)
            setImportResult(result)
            setStep('review')

            if (result.failedCount > 0) {
                toast({
                    title: 'Phát hiện lỗi dữ liệu',
                    description: `Có ${result.failedCount} dòng lỗi. Vui lòng kiểm tra và sửa lại file.`,
                    variant: 'destructive',
                })
            } else if (result.successCount === 0) {
                toast({
                    title: 'File không có dữ liệu hợp lệ',
                    description: `Không tìm thấy dòng dữ liệu nào hợp lệ để import.`,
                    variant: 'destructive',
                })
            } else {
                toast({
                    title: 'Phân tích hoàn tất',
                    description: `File hợp lệ. ${result.successCount} nhân viên sẵn sàng import.`,
                })
            }
        } catch (error) {
            toast({
                title: 'Lỗi phân tích',
                description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
                variant: 'destructive',
            })
        } finally {
            setIsParsing(false)
        }
    }

    const handleConfirmImport = async () => {
        if (!file) return

        setIsParsing(true)
        setStep('importing')
        try {
            // Step 2: Import (commit=true)
            const result = await importEmployeesFromFile(file, true)
            setImportResult(result)

            if (result.successCount > 0 && result.failedCount === 0) {
                toast({
                    title: 'Thành công',
                    description: `Đã import ${result.successCount} nhân viên`,
                })
                // Revalidate SWR cache instead of full page refresh
                mutate(() => true, undefined, { revalidate: true })
                onSuccess?.()
            } else {
                toast({
                    title: 'Import hoàn tất với cảnh báo',
                    description: `Thành công: ${result.successCount}, Lỗi: ${result.failedCount}`,
                    variant: result.failedCount > 0 ? 'destructive' : 'default',
                })
                // Revalidate SWR cache instead of full page refresh
                mutate(() => true, undefined, { revalidate: true })
            }
        } catch (error) {
            toast({
                title: 'Lỗi Import',
                description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
                variant: 'destructive',
            })
            setStep('review') // Go back to review on error
        } finally {
            setIsParsing(false)
        }
    }

    const reset = () => {
        setFile(null)
        setImportResult(null)
        setIsParsing(false)
        setStep('upload')
    }

    const canImport = importResult && importResult.successCount > 0 && importResult.failedCount === 0;

    return (
        <div className="space-y-6">
            {!file ? (
                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-[#0F4C75] bg-[#BBE1FA]/20' : 'border-gray-200 hover:border-[#0F4C75]'}
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="w-16 h-16 bg-[#BBE1FA]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-[#0F4C75]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">
                        Kéo thả file Excel/CSV vào đây
                    </h3>
                    <p className="text-gray-500 mt-2">
                        hoặc click để chọn file từ máy tính
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                        Hỗ trợ .xlsx, .xls, .csv
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-700">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                    {isParsing ? 'Đang xử lý...' : (step === 'upload' ? 'Sẵn sàng phân tích' : 'Đã phân tích')}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={reset} disabled={isParsing}>
                            <X className="w-4 h-4 text-gray-400" />
                        </Button>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <Button variant="outline" onClick={reset} disabled={isParsing}>Hủy bỏ</Button>

                        {step === 'upload' && (
                            <Button
                                className="bg-[#0F4C75] hover:bg-[#0F4C75]/90"
                                onClick={handleAnalyze}
                                disabled={isParsing}
                            >
                                {isParsing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Phân tích file
                            </Button>
                        )}

                        {step === 'review' && (
                            <Button
                                className={canImport ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}
                                onClick={handleConfirmImport}
                                disabled={isParsing || !canImport}
                            >
                                {isParsing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Xác nhận Import
                            </Button>
                        )}

                        {step === 'importing' && (
                            <Button disabled className="bg-[#0F4C75]">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang thực hiện Import...
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Analysis Results */}
            {importResult && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary */}
                    <div className={cn(
                        "border rounded-lg p-4",
                        importResult.failedCount > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                    )}>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 font-semibold">
                                {importResult.failedCount > 0
                                    ? <><XCircle className="w-5 h-5 text-red-600" /> <span className="text-red-800">File có lỗi - Vui lòng sửa lại</span></>
                                    : <><CheckCircle className="w-5 h-5 text-green-600" /> <span className="text-green-800">Dữ liệu hợp lệ - Sẵn sàng Import</span></>
                                }
                            </div>
                            <div className="flex items-center gap-6 text-sm mt-1 ml-7">
                                <span>Tổng: <strong>{importResult.totalRows}</strong> dòng</span>
                                <span className={importResult.successCount > 0 ? "text-green-700" : ""}>✓ Hợp lệ: <strong>{importResult.successCount}</strong></span>
                                <span className={importResult.failedCount > 0 ? "text-red-700" : ""}>✗ Lỗi: <strong>{importResult.failedCount}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Columns Mapped */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-medium text-green-800 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Cột đã nhận diện ({importResult.columnMappings.filter(c => c.mappedKey).length})
                        </h3>
                        <ul className="mt-2 text-sm text-green-700 space-y-1">
                            {importResult.columnMappings
                                .filter(c => c.mappedKey)
                                .map((col) => (
                                    <li key={col.originalHeader}>• &quot;{col.originalHeader}&quot; → {col.mappedKey}</li>
                                ))}
                        </ul>
                    </div>

                    {/* Unknown Columns (Warnings) */}
                    {importResult.unknownColumns.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-medium text-yellow-800 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Cột không được sử dụng ({importResult.unknownColumns.length})
                            </h3>
                            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                                {importResult.unknownColumns.map((col) => (
                                    <li key={col}>• &quot;{col}&quot; - sẽ bị bỏ qua</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Errors */}
                    {importResult.errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h3 className="font-medium text-red-800 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Lỗi ({importResult.errors.length})
                            </h3>
                            <ul className="mt-2 text-sm text-red-700 space-y-1 max-h-64 overflow-auto scrollbar-thin">
                                {importResult.errors.map((err, i) => (
                                    <li key={`${err.rowNumber ?? i}-${i}`}>
                                        • <strong>Dòng {err.rowNumber}</strong>
                                        {err.email && <span className="text-red-600"> ({err.email})</span>}
                                        : {err.message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <Alert className="bg-blue-50 border-blue-100 text-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Lưu ý về định dạng file</AlertTitle>
                <AlertDescription>
                    File Excel cần có các cột: <strong>Full Name, Email, Department Code</strong> (bắt buộc).
                    Các cột tùy chọn: Phone, Position, Password, Role.
                </AlertDescription>
            </Alert>
        </div>
    )
}
