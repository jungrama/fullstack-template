type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'theme-mode'

const getSystemTheme = (): ThemeMode => {
  if (!import.meta.client) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const applyThemeToDom = (theme: ThemeMode) => {
  if (!import.meta.client) return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useTheme = () => {
  const theme = useState<ThemeMode>('theme-mode', () => 'light')
  const initialized = useState<boolean>('theme-mode-initialized', () => false)

  if (import.meta.client && !initialized.value) {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
    theme.value = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : getSystemTheme()
    applyThemeToDom(theme.value)
    initialized.value = true
  }

  if (import.meta.client) {
    watch(
      theme,
      value => {
        applyThemeToDom(value)
        window.localStorage.setItem(THEME_STORAGE_KEY, value)
      },
      { immediate: true },
    )
  }

  const setTheme = (value: ThemeMode) => {
    theme.value = value
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
