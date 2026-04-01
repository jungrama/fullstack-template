type ThemeMode = 'light' | 'dark'
type ThemePreference = 'system' | ThemeMode

const THEME_STORAGE_KEY = 'theme-mode'

const getSystemTheme = (): ThemeMode => {
  if (!import.meta.client) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyThemeToDom = (theme: ThemeMode) => {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

const parseStoredPreference = (raw: string | null): ThemePreference => {
  if (raw === 'system' || raw === 'light' || raw === 'dark') return raw
  return 'system'
}

export const useTheme = () => {
  const themePreference = useState<ThemePreference>('theme-preference', () => 'system')
  const systemSnapshot = useState<ThemeMode>('theme-system-snapshot', () => 'light')
  const initialized = useState<boolean>('theme-mode-initialized', () => false)

  const refreshSystemSnapshot = () => {
    if (!import.meta.client) return
    systemSnapshot.value = getSystemTheme()
  }

  if (import.meta.client && !initialized.value) {
    themePreference.value = parseStoredPreference(window.localStorage.getItem(THEME_STORAGE_KEY))
    refreshSystemSnapshot()
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    mql.addEventListener('change', refreshSystemSnapshot)
    initialized.value = true
  }

  const resolvedTheme = computed<ThemeMode>(() => {
    if (themePreference.value === 'system') return systemSnapshot.value
    return themePreference.value
  })

  if (import.meta.client) {
    watch(
      resolvedTheme,
      value => {
        applyThemeToDom(value)
      },
      { immediate: true }
    )

    watch(
      themePreference,
      value => {
        window.localStorage.setItem(THEME_STORAGE_KEY, value)
        if (value === 'system') refreshSystemSnapshot()
      },
      { immediate: true }
    )
  }

  const setTheme = (value: ThemePreference) => {
    themePreference.value = value
  }

  const toggleTheme = () => {
    themePreference.value = resolvedTheme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    /** Effective appearance (`light` | `dark`), including when preference is `system`. */
    theme: resolvedTheme,
    /** User choice: follow OS, light, or dark. */
    themePreference,
    setTheme,
    toggleTheme,
  }
}
