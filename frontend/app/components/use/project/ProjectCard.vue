<script setup lang="ts">
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export type ProjectStatus = 'active' | 'planning' | 'on_hold' | 'completed' | 'at_risk'
export type ScheduleStatus = 'on_track' | 'at_risk' | 'delayed'

export type ProjectListItem = {
  id: string
  slug: string
  name: string
  location: string
  status: ProjectStatus
  progress: number
  contractValue: number
  budgetUsedPercent: number
  cashFlowMonth: number
  daysRemaining: number
  scheduleStatus: ScheduleStatus
  openTasks: number
  overdueTasks: number
  pendingPayments: number
  teamOnSite: number
  profitMarginPercent: number
}

const props = defineProps<{
  project: ProjectListItem
  companySlug: string
}>()

const { t, locale } = useI18n()

const numberLocale = computed(() =>
  String(locale.value).startsWith('id') ? 'id-ID' : 'en-US'
)

const currencyFormatter = computed(
  () =>
    new Intl.NumberFormat(numberLocale.value, {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1,
    })
)

const projectTo = computed(() => `/app/${props.companySlug}/p/${props.project.slug}`)

const statusConfig = computed(() => {
  switch (props.project.status) {
    case 'active':
      return { class: 'bg-emerald-500/15 text-emerald-500' }
    case 'at_risk':
      return { class: 'bg-orange-500/15 text-orange-500' }
    case 'planning':
      return { class: 'bg-sky-500/15 text-sky-500' }
    case 'on_hold':
      return { class: 'bg-muted text-muted-foreground' }
    case 'completed':
      return { class: 'bg-muted text-muted-foreground' }
    default:
      return { class: 'bg-muted text-muted-foreground' }
  }
})

const scheduleStyle = computed(() => {
  switch (props.project.scheduleStatus) {
    case 'on_track': return 'text-emerald-500'
    case 'at_risk': return 'text-orange-500'
    case 'delayed': return 'text-destructive'
    default: return 'text-muted-foreground'
  }
})

const metrics = computed(() => [
  {
    label: t('projects.card.contractValue'),
    value: currencyFormatter.value.format(props.project.contractValue),
    tone: 'text-foreground',
    icon: null,
  },
  {
    label: t('projects.card.budgetUsed'),
    value: `${props.project.budgetUsedPercent}%`,
    tone:
      props.project.budgetUsedPercent > 90
        ? 'text-destructive'
        : props.project.budgetUsedPercent > 80
          ? 'text-orange-500'
          : 'text-foreground',
    icon: null,
  },
  {
    label: t('projects.card.cashFlow'),
    value: currencyFormatter.value.format(Math.abs(props.project.cashFlowMonth)),
    tone: props.project.cashFlowMonth >= 0 ? 'text-emerald-500' : 'text-destructive',
    icon: props.project.cashFlowMonth >= 0 ? 'ph:arrow-up-right' : 'ph:arrow-down-right',
  },
  {
    label: t('projects.card.profitMargin'),
    value: `${props.project.profitMarginPercent}%`,
    tone:
      props.project.profitMarginPercent < 10
        ? 'text-destructive'
        : props.project.profitMarginPercent < 15
          ? 'text-orange-500'
          : 'text-emerald-500',
    icon: null,
  },
])
</script>

<template>
  <NuxtLink
    :to="projectTo"
    class="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-border/60 hover:shadow-md"
  >
    <!-- Header: name + badge + progress -->
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3
            class="text-[15px] font-bold leading-snug tracking-tight transition-colors group-hover:text-primary"
          >
            {{ project.name }}
          </h3>
          <span :class="cn('shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold', statusConfig.class)">
            {{ t(`projects.status.${project.status}`) }}
          </span>
        </div>
        <p class="text-muted-foreground mt-1.5 flex items-center gap-1 text-[13px]">
          <Icon name="ph:map-pin" class="size-3.5 shrink-0 opacity-60" />
          <span class="truncate">{{ project.location }}</span>
        </p>
      </div>
      <div class="shrink-0 text-right">
        <p class="text-2xl font-bold tabular-nums leading-none tracking-tight">
          {{ project.progress }}%
        </p>
        <p class="text-muted-foreground mt-0.5 text-[11px]">
          {{ t('projects.card.progress') }}
        </p>
      </div>
    </div>

    <!-- Progress bar -->
    <Progress :model-value="project.progress" class="mt-4 h-[3px]" />

    <!-- Metrics 4-col -->
    <dl class="mt-4 grid grid-cols-4 gap-x-3">
      <div v-for="metric in metrics" :key="metric.label" class="min-w-0">
        <dt class="text-muted-foreground truncate text-[11px]">{{ metric.label }}</dt>
        <dd
          :class="
            cn('mt-1 flex items-center gap-0.5 text-[13px] font-bold tabular-nums', metric.tone)
          "
        >
          <Icon v-if="metric.icon" :name="metric.icon" class="size-3.5 shrink-0" />
          {{ metric.value }}
        </dd>
      </div>
    </dl>

    <!-- Footer -->
    <div
      class="text-muted-foreground mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-4 text-[12px]"
    >
      <span class="inline-flex items-center gap-1.5">
        <Icon name="ph:calendar-blank" class="size-3.5 opacity-70" />
        <span class="text-foreground font-medium tabular-nums">
          {{ project.daysRemaining > 0 ? project.daysRemaining : '—' }}
        </span>
        days left
      </span>
      <span
        class="inline-flex items-center gap-1.5"
        :class="project.overdueTasks > 0 ? 'text-orange-500' : ''"
      >
        <Icon
          :name="project.overdueTasks > 0 ? 'ph:warning' : 'ph:check-square'"
          class="size-3.5"
        />
        <span class="font-medium tabular-nums">{{ project.openTasks }}</span>
        open tasks
      </span>
      <span class="inline-flex items-center gap-1.5">
        <Icon name="ph:users" class="size-3.5 opacity-70" />
        <span class="text-foreground font-medium tabular-nums">{{ project.teamOnSite }}</span>
        on site
      </span>
      <span :class="cn('ml-auto font-semibold', scheduleStyle)">
        {{ t(`projects.schedule.${project.scheduleStatus}`) }}
      </span>
    </div>
  </NuxtLink>
</template>
