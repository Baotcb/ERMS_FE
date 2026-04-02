import {
  BarChart3,
  Bot,
  Building2,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

import type {
  EnterpriseStatus,
  StatusImpact,
  StatusReasonCategory,
} from "../types";

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface AdminQuickLink {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
  tone: "indigo" | "green" | "amber" | "red" | "gray";
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    title: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Trung tâm xử lý việc hằng ngày",
  },
  {
    title: "Quản lý doanh nghiệp",
    href: "/admin/enterprises",
    icon: Building2,
    description: "Danh sách và quản trị tenant",
  },
  {
    title: "Thanh toán & Gói dịch vụ",
    href: "/admin/payments",
    icon: CreditCard,
    description: "Lịch sử subscription toàn nền tảng",
  },
  {
    title: "AI Services",
    href: "/admin/ai-services",
    icon: Bot,
    description: "Gemini config và usage thực tế",
  },
  {
    title: "Platform Dashboard",
    href: "/admin/platform",
    icon: BarChart3,
    description: "KPI kinh doanh và tăng trưởng",
  },
];

export const ADMIN_QUICK_LINKS: AdminQuickLink[] = [
  {
    title: "Doanh nghiệp",
    href: "/admin/enterprises",
    description: "Tìm kiếm và xử lý tenant",
    icon: Building2,
    tone: "indigo",
  },
  {
    title: "Thanh toán",
    href: "/admin/payments",
    description: "Xem lịch sử và đối soát gói",
    icon: CreditCard,
    tone: "green",
  },
  {
    title: "AI Services",
    href: "/admin/ai-services",
    description: "Theo dõi Gemini và CV scoring",
    icon: Bot,
    tone: "amber",
  },
  {
    title: "Platform KPI",
    href: "/admin/platform",
    description: "Xem MRR, renewal và churn",
    icon: BarChart3,
    tone: "gray",
  },
];

export const ENTERPRISE_STATUS_LABELS: Record<EnterpriseStatus, string> = {
  Active: "Hoạt động",
  Suspended: "Tạm dừng",
  Locked: "Đã khóa",
  Inactive: "Ngừng hoạt động",
};

export const ENTERPRISE_STATUS_COLORS: Record<
  EnterpriseStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  Active: {
    bg: "bg-emerald-50/90",
    border: "border-emerald-100",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
  Suspended: {
    bg: "bg-amber-50/90",
    border: "border-amber-100",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  Locked: {
    bg: "bg-rose-50/90",
    border: "border-rose-100",
    text: "text-rose-800",
    dot: "bg-rose-500",
  },
  Inactive: {
    bg: "bg-slate-100/80",
    border: "border-slate-200/80",
    text: "text-slate-700",
    dot: "bg-slate-400",
  },
};

export const STATUS_REASON_CATEGORIES: ReadonlyArray<{
  value: StatusReasonCategory;
  label: string;
}> = [
  { value: "Violation", label: "Vi phạm chính sách" },
  { value: "PaymentIssue", label: "Vấn đề thanh toán" },
  { value: "InformationPending", label: "Chờ bổ sung thông tin" },
  { value: "AdminDecision", label: "Quyết định quản trị" },
  { value: "EnterpriseRequest", label: "Yêu cầu từ doanh nghiệp" },
  { value: "Other", label: "Khác" },
];

export const STATUS_REASON_CATEGORY_LABELS: Record<
  StatusReasonCategory,
  string
> = {
  Violation: "Vi phạm chính sách",
  PaymentIssue: "Vấn đề thanh toán",
  InformationPending: "Chờ bổ sung thông tin",
  AdminDecision: "Quyết định quản trị",
  EnterpriseRequest: "Yêu cầu từ doanh nghiệp",
  Other: "Khác",
};

export const STATUS_IMPACTS: Record<EnterpriseStatus, StatusImpact> = {
  Active: {
    canLogin: true,
    publicJobsVisible: true,
    canRenewSubscription: true,
    canPostJobs: true,
    description:
      "Doanh nghiệp hoạt động bình thường, mọi tính năng đều khả dụng.",
  },
  Suspended: {
    canLogin: true,
    publicJobsVisible: false,
    canRenewSubscription: true,
    canPostJobs: false,
    description:
      "Tạm dừng để chờ xử lý hoặc bổ sung thông tin. Tenant vẫn đăng nhập được nhưng không đăng tuyển mới.",
  },
  Locked: {
    canLogin: false,
    publicJobsVisible: false,
    canRenewSubscription: false,
    canPostJobs: false,
    description:
      "Tenant bị khóa hoàn toàn để chặn truy cập và hạn chế mọi thao tác vận hành.",
  },
  Inactive: {
    canLogin: false,
    publicJobsVisible: false,
    canRenewSubscription: false,
    canPostJobs: false,
    description:
      "Tenant đã ngừng hoạt động, dữ liệu được lưu nhưng không còn quyền truy cập hay tương tác.",
  },
};

export const QUICK_LINK_TARGETS = {
  dashboard: "/admin/dashboard",
  enterprises: "/admin/enterprises",
  payments: "/admin/payments",
  aiServices: "/admin/ai-services",
  platform: "/admin/platform",
} as const;
