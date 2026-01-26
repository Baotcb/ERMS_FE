
"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// Minimal implementation of Select using standard React
// to replace Radix UI dependency if missing

const SelectContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}>({ value: "", onValueChange: () => { }, open: false, setOpen: () => { } });

interface SelectProps {
    children: React.ReactNode;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    value?: string;
}

const Select = ({ children, defaultValue, onValueChange, value: controlledValue }: SelectProps) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(defaultValue || "");

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const handleValueChange = (val: string) => {
        setInternalValue(val);
        onValueChange?.(val);
        setOpen(false);
    };

    return (
        <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative inline-block w-full">{children}</div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SelectContext);
    return (
        <button
            ref={ref}
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
    const { value } = React.useContext(SelectContext);
    // This is a naive implementation, ideally we find the label for the value
    // But for now we just show value or placeholder
    return (
        <span
            ref={ref}
            className={cn("block truncate", className)}
            {...props}
        >
            {value || placeholder}
        </span>
    )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { open } = React.useContext(SelectContext);
    if (!open) return null;
    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 w-full mt-1",
                className
            )}
            {...props}
        >
            <div className="p-1">{children}</div>
        </div>
    )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, children, value: itemValue, ...props }, ref) => {
    const { onValueChange, value } = React.useContext(SelectContext);
    return (
        <div
            ref={ref}
            onClick={() => onValueChange(itemValue)}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {value === itemValue && <Check className="h-4 w-4" />}
            </span>
            <span className="truncate">{children}</span>
        </div>
    )
})
SelectItem.displayName = "SelectItem"

export {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
}
