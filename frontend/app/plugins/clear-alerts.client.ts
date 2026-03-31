export default defineNuxtPlugin(() => {
  const { clearNonPersistentAlerts } = useAlert()
  const router = useRouter()

  router.beforeEach(() => {
    clearNonPersistentAlerts()
  })
})
