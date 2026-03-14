import { createAuthClient } from "better-auth/client"
import { toast } from "vue-sonner"

export const useAuth = () => {
  const config = useRuntimeConfig()
  const router = useRouter()
  const { t } = useI18n()

  const apiUrl = config.public.apiUrl || "http://localhost:3000"
  const authClient = createAuthClient({
    baseURL: apiUrl,
    fetchOptions: {
      credentials: "include",
    },
  })

  const signIn = async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      })

      if (result.error) {
        toast.error(result.error.message || t("errors.generic"))
        return { success: false, error: result.error }
      }

      toast.success(t("auth.login.success") || "Successfully signed in!")
      await router.push("/")
      return { success: true, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t("errors.generic")
      toast.error(errorMessage)
      return { success: false, error: { message: errorMessage } }
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
        toast.error(result.error.message || t("errors.generic"))
        return { success: false, error: result.error }
      }

      toast.success(t("auth.register.success") || "Account created successfully!")
      await router.push("/sign-in")
      return { success: true, data: result.data }
    } catch (error: any) {
      const errorMessage = error?.message || t("errors.generic")
      toast.error(errorMessage)
      return { success: false, error: { message: errorMessage } }
    }
  }

  const signOut = async () => {
    try {
      await authClient.signOut()
      toast.success(t("auth.logout.success") || "Successfully signed out!")
      await router.push("/sign-in")
    } catch (error: any) {
      toast.error(error?.message || t("errors.generic"))
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

  return {
    authClient,
    signIn,
    signUp,
    signOut,
    getSession,
  }
}
