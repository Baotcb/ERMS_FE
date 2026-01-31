
"use client"

import * as React from "react"




import {
    ToastActionElement,
    ToastProps,
} from "@/components/ui/toast"

type ToasterToast = ToastProps & {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
}

export const useToast = () => {
    const [toasts, setToasts] = React.useState<ToasterToast[]>([])

    const toast = ({ ...props }: Omit<ToasterToast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { id, ...props }])
    }

    return {
        toast,
        toasts
    }
}
