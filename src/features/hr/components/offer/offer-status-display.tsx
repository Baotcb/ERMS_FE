import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface StatusConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface OfferStatusDisplayProps {
  status: "loading" | "accepted" | "rejected" | "error" | "invalid";
  errorMsg?: string | null;
}

const STATUS_CONFIG: Record<OfferStatusDisplayProps["status"], StatusConfig> = {
  loading: {
    icon: <Loader2 className="w-14 h-14 text-slate-400 animate-spin" />,
    title: "Đang xử lý phản hồi...",
    description: "Vui lòng chờ trong giây lát.",
  },
  accepted: {
    icon: (
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-11 h-11 text-green-500" />
      </div>
    ),
    title: "Bạn đã chấp nhận offer!",
    description:
      "Chúc mừng! Chúng tôi rất vui được chào đón bạn. Nhà tuyển dụng sẽ liên hệ với bạn sớm để thực hiện các bước tiếp theo.",
  },
  rejected: {
    icon: (
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
        <XCircle className="w-11 h-11 text-slate-400" />
      </div>
    ),
    title: "Bạn đã từ chối offer.",
    description:
      "Cảm ơn bạn đã phản hồi. Chúc bạn tìm được cơ hội phù hợp hơn trong tương lai.",
  },
  error: {
    icon: (
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="w-11 h-11 text-red-400" />
      </div>
    ),
    title: "Không thể xử lý yêu cầu.",
    description:
      "Liên kết đã hết hạn, không hợp lệ hoặc đã được sử dụng. Vui lòng liên hệ nhà tuyển dụng nếu cần hỗ trợ.",
  },
  invalid: {
    icon: (
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <AlertCircle className="w-11 h-11 text-red-400" />
      </div>
    ),
    title: "Liên kết không hợp lệ",
    description:
      "Liên kết này không đúng định dạng. Vui lòng kiểm tra lại email.",
  },
};

export function OfferStatusDisplay({
  status,
  errorMsg,
}: OfferStatusDisplayProps) {
  const config = STATUS_CONFIG[status];

  // Nếu là lỗi và có errorMsg cụ thể, dùng errorMsg thay cho description mặc định
  const description =
    status === "error" && errorMsg ? errorMsg : config.description;

  return (
    <>
      <div className="flex justify-center mb-5">{config.icon}</div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">{config.title}</h1>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </>
  );
}
