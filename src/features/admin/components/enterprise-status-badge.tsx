"use client";

import type { EnterpriseStatus } from "@/features/admin/types";
import {
  ENTERPRISE_STATUS_COLORS,
  ENTERPRISE_STATUS_LABELS,
} from "@/features/admin/constants";
import { cn } from "@/lib/utils";

export function EnterpriseStatusBadge({
  status,
  size = "sm",
}: {
  status: EnterpriseStatus;
  size?: "sm" | "md";
}) {
  const colors = ENTERPRISE_STATUS_COLORS[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border text-center font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        colors.bg,
        colors.border,
        colors.text,
        size === "md"
          ? "w-40 px-3.5 py-1.5 text-sm leading-none"
          : "w-32 px-2.5 py-1 text-[11px] leading-none",
      )}
    >
      {ENTERPRISE_STATUS_LABELS[status]}
    </span>
  );
}
