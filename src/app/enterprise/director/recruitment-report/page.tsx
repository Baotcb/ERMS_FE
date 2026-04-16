import { RecruitmentReportDashboard } from "@/features/director/components/recruitment-report-dashboard";

export default function RecruitmentReportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#0F4C75]">Báo cáo tuyển dụng</h1>
      <p className="text-gray-500 text-sm mb-4">
        Tổng quan hiệu quả chiến dịch tuyển dụng, ngân sách và tỷ lệ sử dụng
        nguồn lực.
      </p>
      <RecruitmentReportDashboard />
    </div>
  );
}
