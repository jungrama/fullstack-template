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
    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe: !!rememberMe,
    })

    if (!result.error) {
      toast.success(t('auth.login.success') || 'Successfully signed in!')
      await router.push('/app')
    }

    return result
  }

  const signInWithGoogle = async () => {
    const callbackURL =
      typeof window !== 'undefined' ? `${window.location.origin}/app` : '/app'
    return authClient.signIn.social({
      provider: 'google',
      callbackURL,
    })
  }

  const signUp = async (name: string, email: string, password: string) => {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
    })

    if (!result.error) {
      await router.push('/sign-in')
    }

    return result
  }

  const signOut = async () => {
    await authClient.signOut()
    toast.success(t('auth.logout.success') || 'Successfully signed out!')
    await router.push('/sign-in')
  }

  const getSession = async () => {
    return authClient.getSession()
  }

  const resendVerificationEmail = async (email: string) => {
    const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/` : '/'

    return authClient.sendVerificationEmail({
      email,
      callbackURL,
    })
  }

  const requestPasswordReset = async (email: string) => {
    const redirectTo =
      typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : '/reset-password'

    return authClient.requestPasswordReset({
      email,
      redirectTo,
    })
  }

  const resetPassword = async (token: string, newPassword: string) => {
    return authClient.resetPassword({
      token,
      newPassword,
    })
  }

  const updateAccount = async (payload: { name?: string; email?: string; image?: string | null }) => {
    return authClient.updateUser(payload)
  }

  const changePassword = async (payload: {
    currentPassword: string
    newPassword: string
    revokeOtherSessions?: boolean
  }) => {
    return authClient.changePassword(payload)
  }

  const setPassword = async (newPassword: string) => {
    const result = await $fetch<{ success: boolean; data?: unknown; error?: { message?: string } }>(
      '/account/set-password',
      {
        method: 'POST',
        baseURL: apiUrl,
        credentials: 'include',
        body: { newPassword },
      },
    )
    return result
  }

  const uploadAvatar = async (file: File) => {
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

    return result
  }

  const getAvatarSignedUrl = async (key: string) => {
    const result = await $fetch<{ success: boolean; data?: { url: string }; error?: { message?: string } }>(
      '/account/avatar-url',
      {
        method: 'GET',
        baseURL: apiUrl,
        credentials: 'include',
        query: { key },
      },
    )

    return result
  }

  const changeEmail = async (newEmail: string) => {
    const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/app/account` : '/app/account'
    return authClient.changeEmail({
      newEmail,
      callbackURL,
    })
  }

  const listUserAccounts = async () => {
    const client = authClient as any
    const listAccountsHandler = client.listAccounts ?? client.listUserAccounts
    if (!listAccountsHandler) {
      throw new Error(t('errors.generic'))
    }
    return listAccountsHandler()
  }

  const linkSocialAccount = async (provider: string) => {
    const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/app/account` : '/app/account'
    const client = authClient as any
    const linkSocialHandler = client.linkSocial ?? client.linkSocialAccount
    if (!linkSocialHandler) {
      throw new Error(t('errors.generic'))
    }
    return linkSocialHandler({
      provider,
      callbackURL,
    })
  }

  const unlinkAccount = async (providerId: string, accountId?: string) => {
    return authClient.unlinkAccount({
      providerId,
      accountId,
    })
  }

  const deleteAccount = async (payload: { password?: string; token?: string }) => {
    const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/` : '/'
    return authClient.deleteUser({
      callbackURL,
      ...payload,
    })
  }

  const sendDeleteAccountVerification = async () => {
    const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/sign-in` : '/sign-in'
    return authClient.deleteUser({
      callbackURL,
    })
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
