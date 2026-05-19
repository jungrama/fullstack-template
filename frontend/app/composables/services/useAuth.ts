import { createAuthClient } from 'better-auth/client'
import { useApi } from '@/composables/useApi'

export const useAuth = () => {
  const config = useRuntimeConfig()

  const apiUrl = config.public.apiUrl || 'http://localhost:3000'
  const authClient = createAuthClient({
    baseURL: apiUrl,
    fetchOptions: {
      credentials: 'include',
      ...(import.meta.server ? { headers: useRequestHeaders(['cookie']) } : {}),
    },
  })

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    return authClient.signIn.email({
      email,
      password,
      rememberMe: !!rememberMe,
    })
  }

  const signInWithGoogle = async () => {
    const callbackURL = typeof window !== 'undefined' ? `${window.location.origin}/app` : '/app'
    return authClient.signIn.social({
      provider: 'google',
      callbackURL,
    })
  }

  const signUp = async (name: string, email: string, password: string) => {
    const callbackURL =
      typeof window !== 'undefined' ? `${window.location.origin}/app` : '/app'

    return authClient.signUp.email({
      email,
      password,
      name,
      callbackURL,
    })
  }

  const signOut = async () => {
    return authClient.signOut()
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

  const updateAccount = async (payload: {
    name?: string
    email?: string
    image?: string | null
  }) => {
    return authClient.updateUser(payload)
  }

  const changePassword = async (payload: {
    currentPassword: string
    newPassword: string
    revokeOtherSessions?: boolean
  }) => {
    return authClient.changePassword(payload)
  }

  const setPasswordBody = ref({ newPassword: '' })
  const setPasswordRequest = useApi<{
    success: boolean
    data?: unknown
    error?: { message?: string }
  }>('/account/set-password', {
    method: 'POST',
    body: setPasswordBody,
    immediate: false,
    credentials: 'include',
  })

  const setPassword = async (newPassword: string) => {
    setPasswordBody.value = { newPassword }
    await setPasswordRequest.execute()
    return setPasswordRequest.data.value
  }

  const uploadAvatar = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const result = await $fetch<{
      success: boolean
      data?: { url: string; key: string }
      error?: { message?: string }
    }>('/account/avatar', {
      method: 'POST',
      baseURL: apiUrl,
      credentials: 'include',
      body: formData,
    })

    return result
  }

  const getAvatarSignedUrl = async (key: string) => {
    const result = await $fetch<{
      success: boolean
      data?: { url: string }
      error?: { message?: string }
    }>('/account/avatar-url', {
      method: 'GET',
      baseURL: apiUrl,
      credentials: 'include',
      query: { key },
    })

    return result
  }

  const changeEmail = async (newEmail: string) => {
    const callbackURL =
      typeof window !== 'undefined' ? `${window.location.origin}/app/account` : '/app/account'
    return authClient.changeEmail({
      newEmail,
      callbackURL,
    })
  }

  const listUserAccounts = async () => {
    const client = authClient as any
    const listAccountsHandler = client.listAccounts ?? client.listUserAccounts
    if (!listAccountsHandler) {
      throw new Error('Account operation is not available')
    }
    return listAccountsHandler()
  }

  const linkSocialAccount = async (provider: string) => {
    const callbackURL =
      typeof window !== 'undefined' ? `${window.location.origin}/app/account` : '/app/account'
    const client = authClient as any
    const linkSocialHandler = client.linkSocial ?? client.linkSocialAccount
    if (!linkSocialHandler) {
      throw new Error('Account operation is not available')
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
    const callbackURL =
      typeof window !== 'undefined' ? `${window.location.origin}/sign-in` : '/sign-in'
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
