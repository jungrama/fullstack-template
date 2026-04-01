<script setup lang="ts">
import BillingPricingCard from '@/components/billing/BillingPricingCard.vue'
import { cn } from '@/lib/utils'

const { t, tm } = useI18n()

/** `tm()` can return plain strings or Vue I18n compiled nodes `{ static?: string, body?: ... }`. */
function messageNodeToString(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'string') return node
  if (typeof node !== 'object') return String(node)
  const o = node as Record<string, unknown>
  if (typeof o.static === 'string') return o.static
  if (Array.isArray(o.body)) return o.body.map(messageNodeToString).join('')
  if (o.body != null) return messageNodeToString(o.body)
  return ''
}

function featureListFromTm(key: string): string[] {
  const raw = tm(key)
  if (!Array.isArray(raw)) return []
  return raw.map(messageNodeToString).filter(s => s.length > 0)
}

type Interval = 'monthly' | 'yearly'

const interval = ref<Interval>('monthly')

const periodLabel = computed(() =>
  interval.value === 'monthly' ? t('billing.perMonth') : t('billing.perYear')
)

const starterPrice = computed(() =>
  interval.value === 'monthly'
    ? t('billing.plans.starter.priceMonthly')
    : t('billing.plans.starter.priceYearly')
)

const growthPrice = computed(() =>
  interval.value === 'monthly'
    ? t('billing.plans.growth.priceMonthly')
    : t('billing.plans.growth.priceYearly')
)

const enterprisePrice = computed(() => t('billing.plans.enterprise.priceCustom'))

const starterFeatures = computed(() => featureListFromTm('billing.plans.starter.features'))
const growthFeatures = computed(() => featureListFromTm('billing.plans.growth.features'))
const enterpriseFeatures = computed(() => featureListFromTm('billing.plans.enterprise.features'))

const emit = defineEmits<{
  upgrade: []
  contact: []
}>()
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="max-w-xl space-y-1">
        <h1 class="text-2xl font-bold tracking-tight">{{ t('billing.title') }}</h1>
        <p class="text-muted-foreground text-sm leading-relaxed">
          {{ t('billing.subtitle') }}
        </p>
      </div>

      <div
        class="bg-muted inline-flex shrink-0 rounded-full p-1"
        role="group"
        aria-label="Billing period"
      >
        <button
          type="button"
          :class="
            cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              interval === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )
          "
          @click="interval = 'monthly'"
        >
          {{ t('billing.monthly') }}
        </button>
        <button
          type="button"
          :class="
            cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              interval === 'yearly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )
          "
          @click="interval = 'yearly'"
        >
          {{ t('billing.yearly') }}
        </button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <BillingPricingCard
        :title="t('billing.plans.starter.name')"
        :badge-label="t('billing.plans.starter.badge')"
        badge-tone="free"
        :price-display="starterPrice"
        :period-label="periodLabel"
        :features="starterFeatures"
        :cta-label="t('billing.plans.starter.ctaCurrent')"
        cta-variant="current"
        disabled
      />
      <BillingPricingCard
        :title="t('billing.plans.growth.name')"
        :badge-label="t('billing.plans.growth.badge')"
        badge-tone="pro"
        :price-display="growthPrice"
        :period-label="periodLabel"
        :features="growthFeatures"
        featured
        :cta-label="t('billing.plans.growth.ctaUpgrade')"
        cta-variant="upgrade"
        @cta="emit('upgrade')"
      />
      <BillingPricingCard
        :title="t('billing.plans.enterprise.name')"
        :badge-label="t('billing.plans.enterprise.badge')"
        badge-tone="advance"
        :price-display="enterprisePrice"
        :period-label="periodLabel"
        :features="enterpriseFeatures"
        :cta-label="t('billing.plans.enterprise.ctaContact')"
        cta-variant="contact"
        @cta="emit('contact')"
      />
    </div>
  </div>
</template>
