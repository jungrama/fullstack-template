<script setup lang="ts">
import { useCompanies } from '@/composables/services/useCompanies'

definePageMeta({
  middleware: 'auth',
  validate: async route => {
    const slug = String(route.params.company ?? '')
    if (slug === 'company') return false

    const { fetchCompanies, setActiveCompanyBySlug, companies } = useCompanies()
    if (companies.value.length === 0) {
      try {
        await fetchCompanies()
      } catch {
        return { statusCode: 500, statusMessage: 'Failed to load companies' }
      }
    }

    const found = setActiveCompanyBySlug(slug)
    if (!found) {
      return { statusCode: 404, statusMessage: 'Company not found' }
    }
    return true
  },
})
</script>

<template>
  <NuxtPage />
</template>
