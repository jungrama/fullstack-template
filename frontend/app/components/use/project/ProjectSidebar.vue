<script setup lang="ts">
import type { ProjectListItem } from './ProjectCard.vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  projects: ProjectListItem[]
}>()

const { locale } = useI18n()

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

// --- Donut chart ---
const DONUT_R = 38
const DONUT_C = 2 * Math.PI * DONUT_R
const DONUT_STROKE = 16
const DONUT_CX = 60
const DONUT_CY = 60

const statusSegments = computed(() => {
  const total = props.projects.length
  if (total === 0) return []

  const groups = [
    {
      key: 'active',
      label: 'Active',
      count: props.projects.filter(p => p.status === 'active').length,
      color: '#10b981',
    },
    {
      key: 'at_risk',
      label: 'At risk',
      count: props.projects.filter(p => p.status === 'at_risk').length,
      color: '#f97316',
    },
    {
      key: 'planning',
      label: 'Planning',
      count: props.projects.filter(p => p.status === 'planning').length,
      color: '#60a5fa',
    },
    {
      key: 'on_hold',
      label: 'On hold',
      count: props.projects.filter(p => p.status === 'on_hold').length,
      color: '#9ca3af',
    },
    {
      key: 'completed',
      label: 'Completed',
      count: props.projects.filter(p => p.status === 'completed').length,
      color: '#6b7280',
    },
  ].filter(g => g.count > 0)

  let accumulated = 0
  return groups.map(g => {
    const fraction = g.count / total
    const dasharray = `${fraction * DONUT_C} ${DONUT_C}`
    const dashoffset = -(accumulated * DONUT_C)
    accumulated += fraction
    return { ...g, dasharray, dashoffset }
  })
})

const legendSegments = computed(() =>
  statusSegments.value.filter(s => ['active', 'at_risk', 'planning'].includes(s.key))
)

// --- Budget bars ---
const budgetProjects = computed(() =>
  [...props.projects]
    .sort((a, b) => b.budgetUsedPercent - a.budgetUsedPercent)
    .slice(0, 4)
)

function budgetBarColor(pct: number) {
  if (pct > 90) return '#ef4444'
  if (pct > 80) return '#f97316'
  return '#10b981'
}

function shortName(name: string) {
  const words = name.split(/[\s—–-]+/)
  return words.slice(0, 2).join(' ')
}

// --- Quick insights ---
const insights = computed(() => {
  const total = props.projects.length
  if (total === 0) return []

  const avgBudget = Math.round(
    props.projects.reduce((s, p) => s + p.budgetUsedPercent, 0) / total
  )
  const overdueTasks = props.projects.reduce((s, p) => s + p.overdueTasks, 0)
  const avgMargin = (
    props.projects.reduce((s, p) => s + p.profitMarginPercent, 0) / total
  ).toFixed(1)
  const totalContract = props.projects.reduce((s, p) => s + p.contractValue, 0)

  return [
    {
      label: 'Avg. Budget Used',
      value: `${avgBudget}%`,
      tone: avgBudget > 90 ? 'text-destructive' : avgBudget > 80 ? 'text-orange-500' : 'text-emerald-500',
    },
    {
      label: 'Overdue Tasks',
      value: String(overdueTasks),
      tone: overdueTasks > 0 ? 'text-orange-500' : 'text-emerald-500',
    },
    {
      label: 'Avg. Profit Margin',
      value: `${avgMargin}%`,
      tone: Number(avgMargin) < 12 ? 'text-orange-500' : 'text-emerald-500',
    },
    {
      label: 'Portfolio Value',
      value: currencyFormatter.value.format(totalContract),
      tone: 'text-foreground',
    },
  ]
})
</script>

<template>
  <aside class="flex flex-col gap-4">
    <!-- Portfolio Status -->
    <div class="rounded-xl border border-border bg-card p-5">
      <h3 class="text-[13px] font-semibold tracking-tight">Portfolio Status</h3>

      <div class="mt-4 flex justify-center">
        <svg viewBox="0 0 120 120" width="140" height="140" class="overflow-visible">
          <!-- Track -->
          <circle
            :cx="DONUT_CX"
            :cy="DONUT_CY"
            :r="DONUT_R"
            fill="none"
            stroke="currentColor"
            class="text-muted/50"
            :stroke-width="DONUT_STROKE"
          />
          <!-- Segments -->
          <circle
            v-for="seg in statusSegments"
            :key="seg.key"
            :cx="DONUT_CX"
            :cy="DONUT_CY"
            :r="DONUT_R"
            fill="none"
            :stroke="seg.color"
            :stroke-width="DONUT_STROKE"
            :stroke-dasharray="seg.dasharray"
            :stroke-dashoffset="seg.dashoffset"
            stroke-linecap="butt"
            transform="rotate(-90 60 60)"
          />
        </svg>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-4">
        <div
          v-for="seg in legendSegments"
          :key="seg.key"
          class="flex flex-col items-center gap-1"
        >
          <span class="text-[11px] text-muted-foreground">{{ seg.label }}</span>
          <span class="text-lg font-bold tabular-nums" :style="`color: ${seg.color}`">
            {{ seg.count }}
          </span>
        </div>
      </div>
    </div>

    <!-- Budget Utilization -->
    <div class="rounded-xl border border-border bg-card p-5">
      <h3 class="text-[13px] font-semibold tracking-tight">Budget Utilization</h3>
      <div class="mt-4 flex flex-col gap-3">
        <div v-for="project in budgetProjects" :key="project.id" class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground truncate text-[11px]">{{ shortName(project.name) }}</span>
            <span
              class="ml-2 shrink-0 text-[11px] font-semibold tabular-nums"
              :style="`color: ${budgetBarColor(project.budgetUsedPercent)}`"
            >
              {{ project.budgetUsedPercent }}%
            </span>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full transition-all"
              :style="`width: ${project.budgetUsedPercent}%; background-color: ${budgetBarColor(project.budgetUsedPercent)}`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Insights -->
    <div class="rounded-xl border border-border bg-card p-5">
      <h3 class="text-[13px] font-semibold tracking-tight">Quick Insights</h3>
      <div class="mt-4 flex flex-col divide-y divide-border/60">
        <div
          v-for="insight in insights"
          :key="insight.label"
          class="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
        >
          <span class="text-muted-foreground text-[12px]">{{ insight.label }}</span>
          <span :class="cn('text-[13px] font-semibold tabular-nums', insight.tone)">
            {{ insight.value }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>
