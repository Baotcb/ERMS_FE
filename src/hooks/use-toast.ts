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

type ToastInput = Omit<ToasterToast, "id"> & {
    id?: string
}

type ToastListener = (toasts: ToasterToast[]) => void

let toastState: ToasterToast[] = []
const listeners = new Set<ToastListener>()

const emitToastState = (nextState: ToasterToast[]) => {
    toastState = nextState
    listeners.forEach((listener) => listener(toastState))
}

const upsertToast = (toast: ToasterToast) => {
    const existingIndex = toastState.findIndex((item) => item.id === toast.id)

    if (existingIndex === -1) {
        emitToastState([...toastState, toast])
        return
    }

    const nextState = [...toastState]
    nextState[existingIndex] = toast
    emitToastState(nextState)
}

const removeToast = (id: string) => {
    emitToastState(toastState.filter((toast) => toast.id !== id))
}

export const useToast = () => {
    const [toasts, setToasts] = React.useState<ToasterToast[]>(toastState)

    React.useEffect(() => {
        listeners.add(setToasts)

        return () => {
            listeners.delete(setToasts)
        }
    }, [])

    const toast = React.useCallback(({ id, onOpenChange, open, ...props }: ToastInput) => {
        const nextId = id ?? Math.random().toString(36).slice(2, 11)

        upsertToast({
            id: nextId,
            open: open ?? true,
            onOpenChange: (nextOpen) => {
                onOpenChange?.(nextOpen)

                if (!nextOpen) {
                    removeToast(nextId)
                }
            },
            ...props,
        })

        return nextId
    }, [])

    const dismiss = React.useCallback((id: string) => {
        removeToast(id)
    }, [])

    return {
        toast,
        dismiss,
        toasts,
    }
}