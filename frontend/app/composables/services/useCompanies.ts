import {
  getCompanies,
  getCompaniesByCompanyIdLogoUrl,
  postCompanies,
} from '~/api/sdk.gen'
import type { GetCompaniesResponse, PostCompaniesResponse } from '~/api/types.gen'

export type UserCompany = GetCompaniesResponse[number]

export function companyLogoUrl(company: UserCompany): string | null {
  const url = company.logoUrl
  return typeof url === 'string' && url.length > 0 ? url : null
}

function sdkRequestOptions() {
  return import.meta.server
    ? { headers: useRequestHeaders(['cookie']) as Record<string, string> }
    : {}
}

export const useCompanies = () => {
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl as string

  const activeCompanyId = useState<string | null>('active-company-id', () => null)
  const companies = useState<UserCompany[]>('companies-list', () => [])
  const listPending = ref(false)

  const activeCompany = computed(() =>
    companies.value.find(c => c.id === activeCompanyId.value) ?? null
  )

  const companyBySlug = (slug: string) =>
    companies.value.find(c => c.slug === slug) ?? null

  const companyWorkspacePath = (company: Pick<UserCompany, 'slug'>) =>
    `/app/${company.slug}`

  const syncActiveCompanyFromList = (list: UserCompany[]) => {
    if (list.length === 0) {
      activeCompanyId.value = null
      return
    }
    const stillMember = list.some(c => c.id === activeCompanyId.value)
    if (!activeCompanyId.value || !stillMember) {
      activeCompanyId.value = list[0]!.id
    }
  }

  const fetchCompanies = async () => {
    listPending.value = true
    try {
      const data = await getCompanies({
        composable: '$fetch',
        ...sdkRequestOptions(),
      })
      const list = data ?? []
      companies.value = list
      syncActiveCompanyFromList(list)
      return list
    } finally {
      listPending.value = false
    }
  }

  const createCompany = async (name: string): Promise<PostCompaniesResponse> => {
    try {
      const created = await postCompanies({
        composable: '$fetch',
        body: { name },
        ...sdkRequestOptions(),
      })
      companies.value = [...companies.value, created]
      activeCompanyId.value = created.id
      return created
    } catch (error: unknown) {
      const data = (error as { data?: { message?: string } })?.data
      throw new Error(data?.message ?? useErrorMessage(error).message)
    }
  }

  const uploadCompanyLogo = async (companyId: string, file: File): Promise<UserCompany> => {
    const formData = new FormData()
    formData.append('file', file)

    const updated = await $fetch<UserCompany>(`/companies/${companyId}/logo`, {
      method: 'POST',
      baseURL: apiUrl,
      credentials: 'include',
      body: formData,
      ...sdkRequestOptions(),
    })

    companies.value = companies.value.map(c => (c.id === companyId ? updated : c))
    return updated
  }

  const refreshCompanyLogoUrl = async (companyId: string, key: string) => {
    const result = await getCompaniesByCompanyIdLogoUrl({
      composable: '$fetch',
      path: { companyId },
      query: { key },
      ...sdkRequestOptions(),
    })

    companies.value = companies.value.map(c =>
      c.id === companyId ? { ...c, logoUrl: result.url } : c
    )
    return result.url
  }

  const setActiveCompanyBySlug = (slug: string) => {
    const found = companyBySlug(slug)
    if (found) activeCompanyId.value = found.id
    return found
  }

  return {
    activeCompanyId,
    activeCompany,
    companies,
    listPending,
    companyBySlug,
    companyWorkspacePath,
    fetchCompanies,
    createCompany,
    uploadCompanyLogo,
    refreshCompanyLogoUrl,
    setActiveCompanyBySlug,
    refreshCompanies: fetchCompanies,
  }
}
