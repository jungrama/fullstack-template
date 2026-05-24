import { defineConfig } from '@hey-api/openapi-ts'

const apiUrl = process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3091'

export default defineConfig({
  input: `${apiUrl}/openapi/json`,
  output: {
    path: 'app/client',
    clean: true,
  },
  plugins: [
    {
      bundle: true,
      name: '@hey-api/client-nuxt',
    },
  ],
})
