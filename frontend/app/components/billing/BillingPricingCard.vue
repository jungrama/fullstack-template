<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type BillingPricingBadgeTone = 'free' | 'pro' | 'advance'
export type BillingPricingCtaVariant = 'current' | 'upgrade' | 'contact'

const props = withDefaults(
  defineProps<{
    title: string
    badgeLabel: string
    badgeTone: BillingPricingBadgeTone
    priceDisplay: string
    periodLabel: string
    features: string[]
    featured?: boolean
    ctaLabel: string
    ctaVariant: BillingPricingCtaVariant
    disabled?: boolean
  }>(),
  {
    featured: false,
    disabled: false,
  }
)

const emit = defineEmits<{
  cta: []
}>()

const dotClass = computed(() => {
  switch (props.badgeTone) {
    case 'free':
      return 'bg-orange-500'
    case 'pro':
      return props.featured ? 'bg-white' : 'bg-orange-500'
    case 'advance':
      return 'bg-emerald-500'
    default:
      return 'bg-muted-foreground'
  }
})

const rivetClass = computed(() =>
  props.featured
    ? 'border-white/25 bg-white/10'
    : 'border-border/60 bg-muted/40'
)

const featureIconWrap = computed(() =>
  props.featured
    ? 'bg-white/15 text-white'
    : 'bg-primary/10 text-primary'
)

const onCta = () => {
  if (props.disabled || props.ctaVariant === 'current') return
  emit('cta')
}

const buttonVariant = computed(() => {
  if (props.ctaVariant === 'current') return 'secondary' as const
  if (props.ctaVariant === 'contact' && !props.featured) return 'outline' as const
  return 'default' as const
})

const buttonClass = computed(() => {
  if (props.ctaVariant === 'upgrade' && props.featured) {
    return 'bg-white text-zinc-950 hover:bg-white/90 dark:bg-white dark:text-zinc-950 dark:hover:bg-white/90'
  }
  if (props.ctaVariant === 'contact' && props.featured) {
    return 'border-white/25 bg-transparent text-white hover:bg-white/10 dark:bg-transparent'
  }
  if (props.ctaVariant === 'contact' && !props.featured) {
    return 'border-0 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
  }
  return ''
})
</script>

<template>
  <div
    :class="
      cn(
        'relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 pt-14 shadow-sm',
        featured
          ? 'border-zinc-700/60 bg-gradient-to-b from-zinc-800 to-zinc-950 text-white'
          : 'bg-card text-card-foreground'
      )
    "
  >
    <span
      class="pointer-events-none absolute left-3 top-3 h-1.5 w-1.5 rounded-full border"
      :class="rivetClass"
    />
    <span
      class="pointer-events-none absolute right-3 top-3 h-1.5 w-1.5 rounded-full border"
      :class="rivetClass"
    />
    <span
      class="pointer-events-none absolute bottom-3 left-3 h-1.5 w-1.5 rounded-full border"
      :class="rivetClass"
    />
    <span
      class="pointer-events-none absolute right-3 bottom-3 h-1.5 w-1.5 rounded-full border"
      :class="rivetClass"
    />

    <div class="absolute top-5 right-5">
      <div
        v-if="featured && badgeTone === 'pro'"
        class="flex items-center gap-1.5 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white"
      >
        <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
        {{ badgeLabel }}
      </div>
      <div
        v-else
        :class="
          cn(
            'flex items-center gap-1.5 text-xs font-medium',
            featured ? 'text-white' : 'text-muted-foreground'
          )
        "
      >
        <span class="h-2 w-2 shrink-0 rounded-full" :class="dotClass" />
        {{ badgeLabel }}
      </div>
    </div>

    <div class="mb-6">
      <h3 :class="cn('text-lg font-semibold', featured && 'text-white')">
        {{ title }}
      </h3>
      <p class="mt-3 flex items-baseline gap-1">
        <span :class="cn('text-3xl font-bold tracking-tight', featured && 'text-white')">
          {{ priceDisplay }}
        </span>
        <span
          :class="
            cn(
              'text-sm font-medium',
              featured ? 'text-zinc-400' : 'text-muted-foreground'
            )
          "
        >
          {{ periodLabel }}
        </span>
      </p>
    </div>

    <Button
      class="mb-6 w-full"
      :disabled="disabled || ctaVariant === 'current'"
      :variant="buttonVariant"
      :class="buttonClass"
      @click="onCta"
    >
      {{ ctaLabel }}
    </Button>

    <ul class="flex flex-1 flex-col gap-3">
      <li
        v-for="(feature, index) in features"
        :key="index"
        class="flex gap-3 text-sm leading-snug"
      >
        <span
          class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
          :class="featureIconWrap"
        >
          <Check class="size-3 stroke-[2.5]" />
        </span>
        <span :class="cn(featured ? 'text-zinc-200' : 'text-muted-foreground')">
          {{ feature }}
        </span>
      </li>
    </ul>
  </div>
</template>
