export interface DashboardStats {
    totalEmployees: number
    totalDepartments: number
    newHires: number
    turnoverRate: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
    // Mock data for now as backend doesn't have stats endpoint yet
    return {
        totalEmployees: 156,
        totalDepartments: 12,
        newHires: 8,
        turnoverRate: 3.2
    }
}
