"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from "@/features/core/auth/hooks/use-auth";
import useSWR from "swr";
import { getEmployees } from "@/features/hr/api/employee-service";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";

export function DeptHeadEmployeeList() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Department Head should only see employees in their department.
  // The auth store does not hydrate departmentId from cookies,
  // so we fetch it explicitly from the user profile endpoint.
  // This ensures we always pass the correct departmentId to the employee query.
  const { data: profile } = useSWR<{ departmentId?: number }>(
    "current-user-profile",
    () =>
      apiClient
        .get("/api/User/profile")
        .then((r) =>
          r.ok ? r.json() : Promise.reject(new Error("Profile fetch failed")),
        ),
  );

  const departmentId = profile?.departmentId || user?.departmentId;

  const { data, isLoading, error } = useSWR(
    // Only fetch when we know the departmentId
    departmentId
      ? ["dept-head-employees", departmentId, page, searchTerm]
      : null,
    () =>
      getEmployees({
        departmentId,
        page,
        pageSize,
        search: searchTerm,
      }),
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page
  };

  const employees = data?.items || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-sm w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên / mã nhân viên"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Tìm kiếm
          </Button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md mb-4">
          {error.message || "Đã có lỗi xảy ra khi tải danh sách"}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="px-4 py-3 rounded-tl-md">Mã NV</th>
              <th className="px-4 py-3">Họ và tên</th>
              <th className="px-4 py-3">Chức vụ</th>
              <th className="px-4 py-3">Kỹ năng</th>
              <th className="px-4 py-3">Ngày gia nhập</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="px-4 py-3 flex justify-center">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </td>
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Không tìm thấy nhân viên nào
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {emp.employeeCode}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#0F4C75]">
                      {emp.fullName}
                    </div>
                    <div className="text-xs text-gray-400">{emp.email}</div>
                  </td>
                  <td className="px-4 py-3">{emp.position || "Nhân viên"}</td>
                  <td className="px-4 py-3">
                    {emp.skillDescription ? (
                      <div className="flex flex-wrap gap-1">
                        {emp.skillDescription.split(",").map((skill, i) => (
                          <span
                            key={i}
                            className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-200"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        Chưa cập nhật
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {emp.hireDate
                      ? format(new Date(emp.hireDate), "dd/MM/yyyy")
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        emp.status === "Active" ? "default" : "secondary"
                      }
                      className={
                        emp.status === "Active"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : ""
                      }
                    >
                      {emp.status === "Active" ? "Đang làm việc" : "Nghỉ việc"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 border-t pt-4">
          <span className="text-sm text-gray-500">
            Đang xem trang {page} / {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Trang trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
