import type { UseFetchOptions } from 'nuxt/app'

export const useApi = <T>(url: string, config?: UseFetchOptions<T>) => {
  const runtimeConfig = useRuntimeConfig()
  const _cookies = useCookie('access_token')
  return useFetch(url, {
    baseURL: runtimeConfig.public.apiUrl,
    headers: {
      Authorization: `Bearer ${_cookies.value}`,
    },
    onResponseError: ({ response }) => {
      if (url.includes('/auth/login')) {
        return
      }

      if (response.status === 401) {
        window.location.replace('/sign-in')
      }
    },
    ...config,
  })
}
