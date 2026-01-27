// HR Management Feature Module
// All UI/UX components for HR dashboard

// Components
export { HRSidebar } from './components/hr-sidebar'
export { HRDashboard } from './components/hr-dashboard'

// API Services
export { getDashboardStats, type DashboardStats } from './api/dashboard-service'

export {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    type Department,
    type CreateDepartmentData,
    type UpdateDepartmentData,
    type GetDepartmentsParams
} from './api/department-service'

export {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    bulkCreateEmployees,
    type Employee,
    type CreateEmployeeData,
    type UpdateEmployeeData,
    type GetEmployeesParams,
    type EmployeeImportItem,
    type BulkCreateResult
} from './api/employee-service'

export {
    fetchDepartmentList,
    fetchEmployeeList
} from './api/server-utils'
