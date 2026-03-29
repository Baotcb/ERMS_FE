"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminStatCardColor =
  | "blue"
  | "green"
  | "red"
  | "amber"
  | "indigo"
  | "gray";

interface AdminStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  color?: AdminStatCardColor;
  href?: string;
}

const COLOR_MAP: Record<
  AdminStatCardColor,
  {
    accentBar: string;
    accentSurface: string;
    hoverBorder: string;
    iconRing: string;
    iconText: string;
    trendBadge: string;
  }
> = {
  blue: {
    accentBar: "bg-blue-500",
    accentSurface: "from-blue-100/70 via-white to-white",
    hoverBorder: "hover:border-blue-200",
    iconRing: "ring-blue-100",
    iconText: "text-blue-600",
    trendBadge: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  green: {
    accentBar: "bg-emerald-500",
    accentSurface: "from-emerald-100/70 via-white to-white",
    hoverBorder: "hover:border-emerald-200",
    iconRing: "ring-emerald-100",
    iconText: "text-emerald-600",
    trendBadge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  red: {
    accentBar: "bg-rose-500",
    accentSurface: "from-rose-100/70 via-white to-white",
    hoverBorder: "hover:border-rose-200",
    iconRing: "ring-rose-100",
    iconText: "text-rose-600",
    trendBadge: "bg-rose-50 text-rose-700 ring-rose-100",
  },
  amber: {
    accentBar: "bg-amber-500",
    accentSurface: "from-amber-100/80 via-white to-white",
    hoverBorder: "hover:border-amber-200",
    iconRing: "ring-amber-100",
    iconText: "text-amber-600",
    trendBadge: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  indigo: {
    accentBar: "bg-indigo-500",
    accentSurface: "from-indigo-100/80 via-white to-white",
    hoverBorder: "hover:border-indigo-200",
    iconRing: "ring-indigo-100",
    iconText: "text-indigo-600",
    trendBadge: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  },
  gray: {
    accentBar: "bg-slate-400",
    accentSurface: "from-slate-100/90 via-white to-white",
    hoverBorder: "hover:border-slate-300",
    iconRing: "ring-slate-200",
    iconText: "text-slate-600",
    trendBadge: "bg-slate-100 text-slate-600 ring-slate-200",
  },
};

export function AdminStatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "indigo",
  href,
}: AdminStatCardProps) {
  const styles = COLOR_MAP[color];
  const content = (
    <>
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90",
          styles.accentSurface,
        )}
      />
      <div className={cn("absolute inset-x-0 top-0 h-1", styles.accentBar)} />

      <div className="relative flex min-w-0 flex-1 flex-col justify-between gap-5">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>
          <div className="space-y-1">
            <p className="text-3xl font-semibold tracking-tight text-[color:var(--admin-shell)] sm:text-[2rem]">
              {value}
            </p>
            {trend ? (
              <span
                className={cn(
                  "inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
                  styles.trendBadge,
                )}
              >
                {trend}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-inset",
          styles.iconRing,
        )}
      >
        <Icon className={cn("h-5 w-5", styles.iconText)} aria-hidden="true" />
      </div>
    </>
  );

  const cardClassName = cn(
    "relative flex justify-between gap-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-[border-color,box-shadow,transform] duration-200",
    href &&
      cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(15,23,42,0.12)]",
        styles.hoverBorder,
      ),
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
