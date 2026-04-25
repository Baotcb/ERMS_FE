import * as React from "react"
import { cn } from "@/lib/utils"

type AvatarContextValue = {
    imageStatus: "loading" | "loaded" | "error"
    setImageStatus: (status: "loading" | "loaded" | "error") => void
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null)

const Avatar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const [imageStatus, setImageStatus] = React.useState<"loading" | "loaded" | "error">("loading")

    return (
        <AvatarContext.Provider value={{ imageStatus, setImageStatus }}>
            <div
                ref={ref}
                className={cn(
                    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </AvatarContext.Provider>
    )
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
    HTMLImageElement,
    React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt = "", onLoad, onError, src, ...props }, ref) => {
    const ctx = React.useContext(AvatarContext)

    React.useEffect(() => {
        if (!src) {
            ctx?.setImageStatus("error")
        } else {
            ctx?.setImageStatus("loading")
        }
    }, [src, ctx])

    if (!src || ctx?.imageStatus === "error") {
        return null
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={ref}
            src={src}
            className={cn("aspect-square h-full w-full object-cover", className)}
            alt={alt}
            onLoad={(e) => {
                ctx?.setImageStatus("loaded")
                onLoad?.(e)
            }}
            onError={(e) => {
                ctx?.setImageStatus("error")
                onError?.(e)
            }}
            {...props}
        />
    )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const ctx = React.useContext(AvatarContext)
    if (ctx && ctx.imageStatus === "loaded") {
        return null
    }
    return (
        <div
            ref={ref}
            className={cn(
                "flex h-full w-full items-center justify-center rounded-full bg-muted",
                className
            )}
            {...props}
        />
    )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
