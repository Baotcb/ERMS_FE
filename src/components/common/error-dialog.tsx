'use client'

import * as React from 'react'
import { AlertCircle, Lock } from 'lucide-react'
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ErrorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    message: string
    variant?: 'error' | 'forbidden'
}

export function ErrorDialog({ 
    open, 
    onOpenChange, 
    title = 'Thông báo hệ thống', 
    message,
    variant = 'error'
}: ErrorDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-t-4 border-t-red-500">
                <DialogHeader className="flex flex-row items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                        {variant === 'forbidden' ? (
                            <Lock className="h-5 w-5 text-red-600" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {title}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {message}
                    </p>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button 
                        onClick={() => onOpenChange(false)}
                        className="bg-red-600 hover:bg-red-700 text-white min-w-[100px] font-semibold"
                    >
                        Đã hiểu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
