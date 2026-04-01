import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Last breadcrumb label; if omitted, the final URL segment is title-cased. */
    breadcrumb?: string
  }
}

export {}

// // Type declarations for Nuxt auto-imported composables
// declare global {
//   // @nuxtjs/i18n
//   function useI18n(): {
//     t: (key: string, params?: Record<string, any>) => string
//     locale: Ref<string>
//     locales: any[]
//     setLocale: (locale: string) => void
//   }
// }

// export {}
