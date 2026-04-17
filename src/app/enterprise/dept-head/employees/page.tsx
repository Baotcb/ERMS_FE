import { DeptHeadEmployeeList } from "@/features/dept-head/components/employees/dept-head-employee-list";

export default function DeptHeadEmployeesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F4C75]">Danh sách nhân sự</h1>
        <p className="text-gray-500 text-sm mt-1">
          Quản lý danh sách nhân sự trực thuộc phòng ban của bạn.
        </p>
      </div>
      <DeptHeadEmployeeList />
    </div>
  );
}
