<script setup lang="ts">
import BillingPricingPlans from '@/components/billing/BillingPricingPlans.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon } from '@/components/ui/input-group'
import { Download, Eye, Filter, Search, Upload } from 'lucide-vue-next'

definePageMeta({
  name: 'app-billing',
})

const { t } = useI18n()

type BillingStatus = 'processing' | 'success'

type BillingRow = {
  id: string
  planName: string
  amount: string
  purchaseDate: string
  endDate: string
  status: BillingStatus
}

const rows = ref<BillingRow[]>([
  {
    id: '1',
    planName: 'Starter Plan - Jun 2024',
    amount: '$10.00',
    purchaseDate: '2024-06-01',
    endDate: '2024-06-30',
    status: 'processing',
  },
  {
    id: '2',
    planName: 'Growth Plan - May 2024',
    amount: '$79.00',
    purchaseDate: '2024-05-01',
    endDate: '2024-05-31',
    status: 'success',
  },
  {
    id: '3',
    planName: 'Starter Plan - Apr 2024',
    amount: '$10.00',
    purchaseDate: '2024-04-01',
    endDate: '2024-04-30',
    status: 'success',
  },
  {
    id: '4',
    planName: 'Starter Plan - Mar 2024',
    amount: '$10.00',
    purchaseDate: '2024-03-01',
    endDate: '2024-03-31',
    status: 'success',
  },
])

const searchQuery = ref('')

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(
    row =>
      row.planName.toLowerCase().includes(q) ||
      row.amount.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q)
  )
})

const statusDotClass = (status: BillingStatus) =>
  status === 'processing' ? 'bg-orange-500' : 'bg-emerald-500'

const onUpgrade = () => {
  // Hook for checkout / upgrade flow
}

const onContact = () => {
  // Hook for sales contact
}
</script>

<template>
  <div class="mx-auto w-full max-w-6xl space-y-10 px-4 py-6 md:px-6">
    <BillingPricingPlans @upgrade="onUpgrade" @contact="onContact" />

    <Card class="shadow-sm">
      <CardHeader class="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-lg font-semibold">{{ t('billing.historyTitle') }}</h2>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <InputGroup class="h-9 w-full sm:w-56">
            <InputGroupAddon>
              <Search class="text-muted-foreground size-4" />
            </InputGroupAddon>
            <Input
              v-model="searchQuery"
              data-slot="input-group-control"
              :placeholder="t('billing.searchPlaceholder')"
              class="flex-1 rounded-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          </InputGroup>
          <div class="flex gap-2">
            <Button type="button" variant="outline" size="sm" class="flex-1 sm:flex-none">
              <Filter class="size-4" />
              {{ t('common.filter') }}
            </Button>
            <Button type="button" variant="outline" size="sm" class="flex-1 sm:flex-none">
              <Upload class="size-4" />
              {{ t('billing.export') }}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent class="p-0">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] text-sm">
            <thead>
              <tr class="bg-muted/50 text-muted-foreground border-b">
                <th class="px-6 py-3 text-left font-medium">
                  {{ t('billing.table.planName') }}
                </th>
                <th class="px-6 py-3 text-left font-medium">
                  {{ t('billing.table.amounts') }}
                </th>
                <th class="px-6 py-3 text-left font-medium">
                  {{ t('billing.table.purchaseDate') }}
                </th>
                <th class="px-6 py-3 text-left font-medium">
                  {{ t('billing.table.endDate') }}
                </th>
                <th class="px-6 py-3 text-left font-medium">
                  {{ t('billing.table.status') }}
                </th>
                <th class="px-6 py-3 text-right font-medium">
                  {{ t('billing.table.action') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in filteredRows"
                :key="row.id"
                class="border-b last:border-0"
              >
                <td class="px-6 py-3 font-medium">{{ row.planName }}</td>
                <td class="text-muted-foreground px-6 py-3">{{ row.amount }}</td>
                <td class="text-muted-foreground px-6 py-3">{{ row.purchaseDate }}</td>
                <td class="text-muted-foreground px-6 py-3">{{ row.endDate }}</td>
                <td class="px-6 py-3">
                  <span class="inline-flex items-center gap-2">
                    <span class="size-2 shrink-0 rounded-full" :class="statusDotClass(row.status)" />
                    {{
                      row.status === 'processing'
                        ? t('billing.status.processing')
                        : t('billing.status.success')
                    }}
                  </span>
                </td>
                <td class="px-6 py-3">
                  <div class="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      class="size-8"
                      :aria-label="t('billing.downloadInvoice')"
                    >
                      <Download class="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      class="size-8"
                      :aria-label="t('billing.viewDetails')"
                    >
                      <Eye class="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <p class="text-muted-foreground text-center text-xs">
      <NuxtLink to="/terms-of-service" class="underline underline-offset-2">
        {{ t('legal.termsOfService') }}
      </NuxtLink>
      <span class="px-2">·</span>
      <NuxtLink to="/privacy-policy" class="underline underline-offset-2">
        {{ t('legal.privacyPolicy') }}
      </NuxtLink>
    </p>
  </div>
</template>
