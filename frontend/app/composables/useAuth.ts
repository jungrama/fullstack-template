import { createAuthClient } from 'better-auth/client'
import { toast } from 'vue-sonner'

export const useAuth = () => {
  const config = useRuntimeConfig()
  const router = useRouter()
  const { t } = useI18n()

  const apiUrl = config.public.apiUrl || 'http://localhost:3000'
  const authClient = createAuthClient({
    baseURL: apiUrl,
    fetchOptions: {
      credentials: 'include',
    },
  })

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe: !!rememberMe,
      })

      if (result.error) {
        return { success: false, error: result.error }
      }

      toast.success(t('auth.login.success') || 'Successfully signed in!')
      await router.push('/')
      return { success: true, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t('errors.generic')
      return { success: false, error: { message: errorMessage } }
    }
  }

  const signInWithGoogle = async () => {
    const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/` : '/'

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL,
      })

      if (result.error) {
        return { success: false as const, error: result.error }
      }

      return { success: true as const, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t('errors.generic')
      return { success: false as const, error: { message: errorMessage } }
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        return { success: false, error: result.error }
      }

      await router.push('/sign-in')
      return { success: true, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t('errors.generic')
      return { success: false, error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      await authClient.signOut()
      toast.success(t('auth.logout.success') || 'Successfully signed out!')
      await router.push('/sign-in')
    } catch (error: any) {
      toast.error(error?.message || t('errors.generic'))
    }
  }

  const getSession = async () => {
    try {
      const session = await authClient.getSession()
      return session
    } catch (error) {
      return null
    }
  }

  const resendVerificationEmail = async (email: string) => {
    const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/` : '/'

    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL,
    })

    if (result.error) {
      return { success: false as const, error: result.error }
    }

    return { success: true as const, data: result.data }
  }

  const requestPasswordReset = async (email: string) => {
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : '/reset-password'

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo,
    })

    if (result.error) {
      return { success: false as const, error: result.error }
    }

    return { success: true as const, data: result.data }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    const result = await authClient.resetPassword({
      token,
      newPassword,
    })

    if (result.error) {
      return { success: false as const, error: result.error }
    }

    return { success: true as const, data: result.data }
  }

  return {
    authClient,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    getSession,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
  }
}
