'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import * as XLSX from 'xlsx'
import {
    Upload,
    FileSpreadsheet,
    AlertCircle,
    X,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { bulkCreateEmployees, type EmployeeImportItem } from '@/features/hr/api/employee-service'
import { useToast } from '@/hooks/use-toast'

export function EmployeeImport() {
    const router = useRouter()
    const { toast } = useToast()
    const [isUploading, setIsUploading] = useState(false)
    const [parsedData, setParsedData] = useState<EmployeeImportItem[]>([])
    const [fileName, setFileName] = useState<string | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setFileName(file.name)
        const reader = new FileReader()

        reader.onload = (e) => {
            const data = e.target?.result
            const workbook = XLSX.read(data, { type: 'binary' })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const jsonData = XLSX.utils.sheet_to_json(sheet) as any[]

            // Debug: Log the raw data to see actual column names
            console.log('Raw Excel data:', jsonData)
            if (jsonData.length > 0) {
                console.log('Column names in Excel:', Object.keys(jsonData[0]))
            }

            // Map and validate keys (basic mapping) - support various column name formats
            const mappedData: EmployeeImportItem[] = jsonData.map(row => ({
                fullName: row['Full Name'] || row['Họ và tên'] || row['FullName'] || row['Ho va ten'] || row['Họ tên'] || '',
                email: row['Email'] || row['email'] || '',
                phone: row['Phone'] || row['Số điện thoại'] || row['SĐT'] || row['SDT'] || '',
                departmentCode: (row['Department Code'] || row['Mã phòng ban'] || row['DepartmentCode'] || row['Phòng ban'] || row['Ma phong ban'] || '').toUpperCase(),
                position: row['Position'] || row['Chức vụ'] || row['Chuc vu'] || '',
                password: row['Password'] || row['Mật khẩu'] || '', // Empty = will generate random password
                role: row['Role'] || row['Vai trò'] || row['Chức danh'] || '', // Optional: Employee, Trainer, Director, DepartmentHead
            })).filter(item => item.email && item.fullName && item.departmentCode)

            console.log('Mapped data to send:', mappedData)
            setParsedData(mappedData)
        }

        reader.readAsBinaryString(file)
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

    const handleImport = async () => {
        console.log('=== handleImport called ===')
        console.log('parsedData:', parsedData)
        if (parsedData.length === 0) {
            console.log('parsedData is empty, returning early')
            return
        }

        setIsUploading(true)
        try {
            console.log('Calling bulkCreateEmployees with:', parsedData)
            const result = await bulkCreateEmployees(parsedData)
            console.log('bulkCreateEmployees result:', result)

            if (result.failedCount > 0) {
                console.log('Import had failures - FULL DETAILS:', JSON.stringify(result.errors, null, 2))
                toast({
                    title: 'Import hoàn tất với lỗi',
                    description: `Thành công: ${result.successCount}, Lỗi: ${result.failedCount}`,
                    variant: 'destructive',
                })
                // Could show specific errors here
            } else {
                toast({
                    title: 'Thành công',
                    description: `Đã import ${result.successCount} nhân viên`,
                })
                router.push('/employees')
            }
        } catch (error) {
            console.error('bulkCreateEmployees error:', error)
            toast({
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi import',
                variant: 'destructive',
            })
        } finally {
            setIsUploading(false)
        }
    }

    const reset = () => {
        setParsedData([])
        setFileName(null)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#0F4C75]">Import Nhân viên</h1>
                <Button variant="outline" onClick={() => router.back()}>
                    Quay lại
                </Button>
            </div>

            {!fileName ? (
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
                                <p className="font-medium text-gray-700">{fileName}</p>
                                <p className="text-xs text-gray-500">{parsedData.length} dòng dữ liệu hợp lệ</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={reset}>
                            <X className="w-4 h-4 text-gray-400" />
                        </Button>
                    </div>

                    <div className="max-h-[400px] overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Họ và tên</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Phòng ban (Code)</th>
                                    <th className="px-4 py-3">Chức vụ</th>
                                    <th className="px-4 py-3">SĐT</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {parsedData.slice(0, 100).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{row.fullName}</td>
                                        <td className="px-4 py-3">{row.email}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{row.departmentCode}</td>
                                        <td className="px-4 py-3">{row.position}</td>
                                        <td className="px-4 py-3">{row.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 100 && (
                            <div className="p-3 text-center text-xs text-gray-400 border-t border-gray-100">
                                ... và {parsedData.length - 100} dòng khác
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        <Button variant="outline" onClick={reset}>Hủy bỏ</Button>
                        <Button
                            className="bg-[#0F4C75] hover:bg-[#0F4C75]/90"
                            onClick={handleImport}
                            disabled={isUploading || parsedData.length === 0}
                        >
                            {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Tiến hành Import
                        </Button>
                    </div>
                </div>
            )}

            <Alert className="bg-blue-50 border-blue-100 text-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle>Lưu ý về định dạng file</AlertTitle>
                <AlertDescription>
                    File Excel cần có các cột: <strong>Full Name, Email, Department Code</strong> (bắt buộc).
                    Các cột tùy chọn: Phone, Position, Password.
                </AlertDescription>
            </Alert>
        </div>
    )
}
