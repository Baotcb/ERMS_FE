"use client"

import { useEffect } from "react"

export function SecureGate({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Only run in production or when explicitly enabled
        const isProduction = false // process.env.NODE_ENV === "production"

        if (isProduction) {
            // 1. Block Console
            const noop = () => { }
            const consoleMethods = [
                "log",
                "debug",
                "info",
                "warn",
                "error",
                "assert",
                "dir",
                "dirxml",
                "group",
                "groupCollapsed",
                "groupEnd",
                "time",
                "timeEnd",
                "trace",
                "profile",
                "profileEnd",
            ] as const

            consoleMethods.forEach((method) => {
                ; (console as any)[method] = noop
            })

            // 2. Fetch Interceptor (Basic Deterrent)
            const originalFetch = window.fetch
            window.fetch = async (...args) => {
                // Example check: Ensure the request is coming from within the app
                // This is hard to robustly verify client-side, but we can add checks.
                // For now, we simply act as a passthrough but this hook allows future logic
                // like checking for a specific window variable usually set by trusted code.

                // We can also block specific suspicious patterns here.

                return originalFetch(...args)
            }
        }

        // Prevent context menu (Right click) - Optional, adds to the "secure" feel for some clients
        const handleContextMenu = (e: MouseEvent) => {
            // e.preventDefault() 
            // Uncomment strictly if requested, otherwise it annoys users. 
            // User asked to "increase security", usually console blocking is enough annoyance.
        }

        document.addEventListener("contextmenu", handleContextMenu)

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu)
            // Note: We don't restore console/fetch on unmount because 
            // this component is intended to wrap the entire app layout.
        }
    }, [])

    return <>{children}</>
}
