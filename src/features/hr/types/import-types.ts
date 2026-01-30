export interface ColumnMapping {
    originalHeader: string
    mappedKey: string | null
}

export interface ParseWarning {
    type: 'unknown_column' | 'empty_value'
    column: string
    message: string
}

export interface ImportError {
    rowNumber: number
    email?: string
    column: string
    message: string
}

export interface ImportEmployeesResult {
    // Parse info
    columnMappings: ColumnMapping[]
    unknownColumns: string[]
    warnings: ParseWarning[]

    // Import result
    totalRows: number
    validRows: number
    successCount: number
    failedCount: number
    errors: ImportError[]
}
