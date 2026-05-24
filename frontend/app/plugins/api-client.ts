import { client } from '~/client/client.gen'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const accessToken = useCookie('access_token')
  const router = useRouter()

  client.setConfig({
    baseURL: config.public.apiUrl as string,
    onRequest({ options }) {
      if (accessToken.value) {
        options.headers.set('Authorization', `Bearer ${accessToken.value}`)
      }
    },
    onResponseError({ response, request }) {
      if (response.status === 401) {
        const url = typeof request === 'string' ? request : request.url
        if (!url.includes('/auth/login')) {
          router.push('/sign-in')
        }
      }
    },
  })
})
