import type {
  EnterpriseDetailsResponse,
  PublicEnterprise,
  PublicJobPostingDto,
} from '../types'

export interface CompanyDetailResult {
  company: PublicEnterprise
  jobs: PublicJobPostingDto[]
}

interface CompanyJobsResult {
  items: PublicJobPostingDto[]
  totalCount: number
}

export interface CompanyDetailDeps {
  getEnterpriseById: (id: string) => Promise<EnterpriseDetailsResponse>
  getJobsByEnterpriseId: (enterpriseId: string) => Promise<CompanyJobsResult>
  getEnterpriseByName: (name: string) => Promise<CompanyDetailResult>
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isGuidIdentifier(identifier: string): boolean {
  return UUID_PATTERN.test(identifier)
}

export function getCompanyProfileHref(company: {
  id?: string | null
  enterpriseName: string
}): string {
  const trimmedId = company.id?.trim()
  const identifier =
    trimmedId && isGuidIdentifier(trimmedId)
      ? trimmedId
      : encodeURIComponent(company.enterpriseName)

  return `/companies/${identifier}`
}

export async function getCompanyDetailByIdentifier(
  identifier: string,
  deps: CompanyDetailDeps
): Promise<CompanyDetailResult> {
  const decodedIdentifier = decodeURIComponent(identifier)

  if (!isGuidIdentifier(decodedIdentifier)) {
    return deps.getEnterpriseByName(decodedIdentifier)
  }

  const enterprise = await deps.getEnterpriseById(decodedIdentifier)
  const jobs = await deps.getJobsByEnterpriseId(enterprise.id)
  const locations = [...new Set(jobs.items.map((job) => job.location).filter(Boolean))] as string[]

  return {
    company: {
      id: enterprise.id,
      enterpriseName: enterprise.enterpriseName,
      enterpriseLogoUrl: enterprise.logoUrl ?? undefined,
      jobCount: jobs.totalCount || jobs.items.length,
      locations,
      departmentName: jobs.items[0]?.departmentName,
    },
    jobs: jobs.items,
  }
}
