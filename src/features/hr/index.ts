// HR Management Feature Module
// Only re-export shared UI components and types
// For API services, import directly from their source files
// e.g. import { getDepartments } from '@/features/hr/api/department-service'

// Components
export { HRSidebar } from './components/hr-sidebar'
export { HRDashboard } from './components/hr-dashboard'

// Types only (no runtime imports)
export type {
    Department,
    CreateDepartmentData,
    UpdateDepartmentData,
    GetDepartmentsParams
} from './api/department-service'

export type {
    Employee,
    CreateEmployeeData,
    UpdateEmployeeData,
    GetEmployeesParams,
    EmployeeImportItem,
    BulkCreateResult
} from './api/employee-service'

