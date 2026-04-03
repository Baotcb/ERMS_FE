import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

type MetricCardTheme = 'blue' | 'amber' | 'green' | 'red' | 'default';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtext?: React.ReactNode;
    icon?: LucideIcon;
    theme?: MetricCardTheme;
    className?: string;
    valueSuffix?: React.ReactNode;
}

const themeStyles: Record<MetricCardTheme, {
    container: string;
    title: string;
    value: string;
    iconWrapper: string;
    icon: string;
}> = {
    default: {
        container: 'border-gray-100 bg-white',
        title: 'text-gray-500',
        value: 'text-[#0F4C75]',
        iconWrapper: 'text-[#0F4C75]',
        icon: 'text-[#0F4C75]',
    },
    blue: {
        container: 'border-blue-100 bg-blue-50',
        title: 'text-blue-700',
        value: 'text-blue-700',
        iconWrapper: 'text-blue-700',
        icon: 'text-blue-700',
    },
    amber: {
        container: 'border-amber-100 bg-amber-50',
        title: 'text-amber-700',
        value: 'text-amber-700',
        iconWrapper: 'text-amber-700',
        icon: 'text-amber-700',
    },
    green: {
        container: 'border-green-100 bg-green-50',
        title: 'text-green-700',
        value: 'text-green-700',
        iconWrapper: 'text-green-700',
        icon: 'text-green-700',
    },
    red: {
        container: 'border-red-100 bg-red-50',
        title: 'text-red-700',
        value: 'text-red-700',
        iconWrapper: 'text-red-700',
        icon: 'text-red-700',
    },
};

export function MetricCard({
    title,
    value,
    subtext,
    icon: Icon,
    theme = 'default',
    className,
    valueSuffix,
}: MetricCardProps) {
    const styles = themeStyles[theme];

    return (
        <div className={cn('rounded-2xl border p-5 shadow-sm', styles.container, className)}>
            {Icon ? (
                <div className={cn('mb-3 flex items-center gap-3', styles.iconWrapper)}>
                    <Icon className={cn('h-5 w-5', styles.icon)} />
                    <span className="font-semibold">{title}</span>
                </div>
            ) : (
                <p className={cn('text-xs font-semibold uppercase tracking-wide', styles.title)}>
                    {title}
                </p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
                <p className={cn('text-3xl font-bold', styles.value)}>{value}</p>
                {valueSuffix && <span className={cn('text-sm', styles.title)}>{valueSuffix}</span>}
            </div>

            {subtext && (
                <div className={cn('text-xs mt-2', theme === 'default' ? 'text-gray-500' : 'opacity-80', styles.title)}>
                    {subtext}
                </div>
            )}
        </div>
    );
}
