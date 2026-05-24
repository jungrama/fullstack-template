<script setup lang="ts">
import CompanyList from '@/components/use/company/list.vue'

definePageMeta({
  middleware: 'auth',
  layout: false,
  name: 'app-company-picker',
})
</script>

<template>
  <div class="bg-background flex min-h-svh flex-col items-center justify-center px-4 py-12">
    <CompanyList />
  </div>
</template>
