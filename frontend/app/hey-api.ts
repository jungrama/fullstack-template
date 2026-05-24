import type { CreateClientConfig } from '~/api/client.gen'

/**
 * Runtime config for the generated Hey API Nuxt client.
 * @see https://heyapi.dev/docs/openapi-typescript/clients/nuxt
 */
export const createClientConfig: CreateClientConfig = config => ({
  ...config,
  baseURL: import.meta.env.NUXT_PUBLIC_API_URL || 'http://localhost:3091',
  credentials: 'include',
})
