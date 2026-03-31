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

  const updateAccount = async (payload: { name?: string; email?: string; image?: string | null }) => {
    try {
      const result = await authClient.updateUser(payload)

      if (result.error) {
        return { success: false as const, error: result.error }
      }

      return { success: true as const, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t('errors.generic')
      return { success: false as const, error: { message: errorMessage } }
    }
  }

  const changePassword = async (payload: {
    currentPassword: string
    newPassword: string
    revokeOtherSessions?: boolean
  }) => {
    try {
      const result = await authClient.changePassword(payload)
      if (result.error) {
        return { success: false as const, error: result.error }
      }
      return { success: true as const, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t('errors.generic')
      return { success: false as const, error: { message: errorMessage } }
    }
  }

  const setPassword = async (newPassword: string) => {
    try {
      const result = await $fetch<{ success: boolean; data?: unknown; error?: { message?: string } }>(
        '/account/set-password',
        {
          method: 'POST',
          baseURL: apiUrl,
          credentials: 'include',
          body: { newPassword },
        },
      )
      if (!result.success) {
        return {
          success: false as const,
          error: { message: result.error?.message || t('errors.generic') },
        }
      }
      return { success: true as const, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t('errors.generic')
      return { success: false as const, error: { message: errorMessage } }
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await $fetch<{ success: boolean; data?: { url: string; key: string }; error?: { message?: string } }>(
        '/account/avatar',
        {
          method: 'POST',
          baseURL: apiUrl,
          credentials: 'include',
          body: formData,
        },
      )

      if (!result.success || !result.data?.url || !result.data?.key) {
        return {
          success: false as const,
          error: { message: result.error?.message || t('errors.generic') },
        }
      }

      return { success: true as const, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t('errors.generic')
      return { success: false as const, error: { message: errorMessage } }
    }
  }

  const getAvatarSignedUrl = async (key: string) => {
    try {
      const result = await $fetch<{ success: boolean; data?: { url: string }; error?: { message?: string } }>(
        '/account/avatar-url',
        {
          method: 'GET',
          baseURL: apiUrl,
          credentials: 'include',
          query: { key },
        },
      )

      if (!result.success || !result.data?.url) {
        return {
          success: false as const,
          error: { message: result.error?.message || t('errors.generic') },
        }
      }

      return { success: true as const, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t('errors.generic')
      return { success: false as const, error: { message: errorMessage } }
    }
  }

  const changeEmail = async (newEmail: string) => {
    try {
      const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/app/account` : '/app/account'
      const result = await authClient.changeEmail({
        newEmail,
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

  const listUserAccounts = async () => {
    try {
      const client = authClient as any
      const listAccountsHandler = client.listAccounts ?? client.listUserAccounts
      if (!listAccountsHandler) {
        return { success: false as const, error: { message: t('errors.generic') } }
      }
      const result = await listAccountsHandler()
      if (result.error) {
        return { success: false as const, error: result.error }
      }
      return { success: true as const, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t('errors.generic')
      return { success: false as const, error: { message: errorMessage } }
    }
  }

  const linkSocialAccount = async (provider: string) => {
    try {
      const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/app/account` : '/app/account'
      const client = authClient as any
      const linkSocialHandler = client.linkSocial ?? client.linkSocialAccount
      if (!linkSocialHandler) {
        return { success: false as const, error: { message: t('errors.generic') } }
      }
      const result = await linkSocialHandler({
        provider,
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

  const unlinkAccount = async (providerId: string, accountId?: string) => {
    try {
      const result = await authClient.unlinkAccount({
        providerId,
        accountId,
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

  const deleteAccount = async (payload: { password?: string; token?: string }) => {
    try {
      const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/` : '/'
      const result = await authClient.deleteUser({
        callbackURL,
        ...payload,
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

  const sendDeleteAccountVerification = async () => {
    try {
      const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/sign-in` : '/sign-in'
      const result = await authClient.deleteUser({
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
    updateAccount,
    changePassword,
    setPassword,
    uploadAvatar,
    getAvatarSignedUrl,
    changeEmail,
    listUserAccounts,
    linkSocialAccount,
    unlinkAccount,
    deleteAccount,
    sendDeleteAccountVerification,
  }
}
