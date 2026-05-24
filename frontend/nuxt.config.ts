import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@hey-api/nuxt',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/i18n',
    'shadcn-nuxt',
    [
      '@vee-validate/nuxt',
      {
        autoImports: true,
        componentNames: {
          Form: 'Form',
          Field: 'FormField',
          FieldArray: 'FormFieldArray',
          ErrorMessage: 'FormErrorMessage',
        },
      },
    ],
    '@pinia/nuxt',
  ],
  imports: {
    dirs: ['./app/composables/**'],
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss({
        // Explicitly tell Tailwind where to find source files
        // The @source directive in CSS should handle this, but this ensures it works
      }) as any,
    ],
    server: {
      allowedHosts: ['dev.mainlabs.online'],
    },
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'FullstackApp',
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '~/components/ui',
  },
  i18n: {
    locales: [{ code: 'en', name: 'English', file: 'en.json' }],
    strategy: 'no_prefix',
  },
})
