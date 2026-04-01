import { useAuth } from '@/composables/services/useAuth'

const AUTH_PAGE_NAMES = ['sign-in', 'sign-up', 'reset-password', 'forgot-password'] as const

export default defineNuxtRouteMiddleware(async to => {
  const { getSession } = useAuth()
  const session = await getSession()
  const hasUser = !!session?.data?.user
  const isAuthPage = AUTH_PAGE_NAMES.includes(to.name as (typeof AUTH_PAGE_NAMES)[number])

  // Logged-in users should not stay on login/register screens
  if (isAuthPage && hasUser) {
    return navigateTo('/app')
  }

  // Only protect non-auth routes: guests may open sign-in / sign-up without redirect loop
  if (!isAuthPage && !hasUser) {
    return navigateTo('/sign-in')
  }
})
