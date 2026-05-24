import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
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
  vite: {
    plugins: [tailwindcss() as any],
    server: {
      allowedHosts: ['dev.mainlabs.online'],
    },
    ssr: {
      noExternal: ['vue', 'vue-router', '@vueuse/core', 'reka-ui'],
    },
  },
  // Bundle Vue into the server build — avoids Node ESM "no default export" at preview/runtime
  nitro: {
    externals: {
      inline: [
        'vue',
        'vue-router',
        '@vue/shared',
        '@vue/reactivity',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/server-renderer',
        '@vue/compiler-dom',
      ],
    },
  },
})
