<script setup lang="ts">
import ProjectCard, {
  type ProjectListItem,
  type ProjectStatus,
} from '@/components/use/project/ProjectCard.vue'
import ProjectSidebar from '@/components/use/project/ProjectSidebar.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCompanies } from '@/composables/services/useCompanies'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'auth',
  breadcrumb: 'Projects',
})

const route = useRoute()
const { t, locale } = useI18n()
const { activeCompany } = useCompanies()

const companySlug = computed(() => String(route.params.company ?? ''))
const companyName = computed(() => activeCompany.value?.name ?? t('projects.welcome.workspace'))

const MOCK_PROJECTS: ProjectListItem[] = [
  {
    id: '1',
    slug: 'tower-b-intake',
    name: 'Tower B — Structural & MEP',
    location: 'Jakarta Selatan',
    status: 'active',
    progress: 68,
    contractValue: 4_850_000_000,
    budgetUsedPercent: 71,
    cashFlowMonth: 420_000_000,
    daysRemaining: 94,
    scheduleStatus: 'on_track',
    openTasks: 24,
    overdueTasks: 2,
    pendingPayments: 3,
    teamOnSite: 18,
    profitMarginPercent: 14.2,
  },
  {
    id: '2',
    slug: 'villa-cluster-ciputra',
    name: 'Villa Cluster Ciputra',
    location: 'Tangerang',
    status: 'at_risk',
    progress: 42,
    contractValue: 2_100_000_000,
    budgetUsedPercent: 88,
    cashFlowMonth: -85_000_000,
    daysRemaining: 41,
    scheduleStatus: 'at_risk',
    openTasks: 31,
    overdueTasks: 7,
    pendingPayments: 5,
    teamOnSite: 12,
    profitMarginPercent: 9.1,
  },
  {
    id: '3',
    slug: 'warehouse-logistics-hub',
    name: 'Warehouse & Logistics Hub',
    location: 'Bekasi',
    status: 'active',
    progress: 91,
    contractValue: 6_200_000_000,
    budgetUsedPercent: 89,
    cashFlowMonth: 310_000_000,
    daysRemaining: 28,
    scheduleStatus: 'on_track',
    openTasks: 11,
    overdueTasks: 0,
    pendingPayments: 1,
    teamOnSite: 22,
    profitMarginPercent: 16.8,
  },
  {
    id: '4',
    slug: 'renovation-kemang-office',
    name: 'Kemang Office Renovation',
    location: 'Jakarta Selatan',
    status: 'planning',
    progress: 8,
    contractValue: 780_000_000,
    budgetUsedPercent: 12,
    cashFlowMonth: 45_000_000,
    daysRemaining: 156,
    scheduleStatus: 'on_track',
    openTasks: 9,
    overdueTasks: 0,
    pendingPayments: 0,
    teamOnSite: 4,
    profitMarginPercent: 22.5,
  },
  {
    id: '5',
    slug: 'bridge-span-package-2',
    name: 'Bridge Span — Package 2',
    location: 'Bandung',
    status: 'on_hold',
    progress: 55,
    contractValue: 3_400_000_000,
    budgetUsedPercent: 62,
    cashFlowMonth: 0,
    daysRemaining: 120,
    scheduleStatus: 'delayed',
    openTasks: 6,
    overdueTasks: 4,
    pendingPayments: 2,
    teamOnSite: 0,
    profitMarginPercent: 11.3,
  },
  {
    id: '6',
    slug: 'apartment-phase-1',
    name: 'Apartment Phase 1 (Handover)',
    location: 'Surabaya',
    status: 'completed',
    progress: 100,
    contractValue: 5_100_000_000,
    budgetUsedPercent: 97,
    cashFlowMonth: 180_000_000,
    daysRemaining: 0,
    scheduleStatus: 'on_track',
    openTasks: 2,
    overdueTasks: 0,
    pendingPayments: 0,
    teamOnSite: 3,
    profitMarginPercent: 18.4,
  },
]

const searchQuery = ref('')
const statusFilter = ref<'all' | ProjectStatus | 'at_risk'>('all')

const numberLocale = computed(() => (String(locale.value).startsWith('id') ? 'id-ID' : 'en-US'))

const currencyFormatter = computed(
  () =>
    new Intl.NumberFormat(numberLocale.value, {
      style: 'currency',
      currency: 'IDR',
      notation: 'compact',
      maximumFractionDigits: 1,
    })
)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return t('projects.welcome.morning')
  if (hour < 18) return t('projects.welcome.afternoon')
  return t('projects.welcome.evening')
})

const filteredProjects = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return MOCK_PROJECTS.filter(project => {
    const matchesStatus = statusFilter.value === 'all' || project.status === statusFilter.value
    const matchesSearch =
      !q || project.name.toLowerCase().includes(q) || project.location.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })
})

const portfolioStats = computed(() => {
  const active = MOCK_PROJECTS.filter(p => p.status === 'active').length
  const atRisk = MOCK_PROJECTS.filter(
    p => p.status === 'at_risk' || p.scheduleStatus === 'at_risk' || p.scheduleStatus === 'delayed'
  ).length
  const avgProgress = Math.round(
    MOCK_PROJECTS.reduce((sum, p) => sum + p.progress, 0) / MOCK_PROJECTS.length
  )
  const totalContract = MOCK_PROJECTS.reduce((sum, p) => sum + p.contractValue, 0)
  const overdueTasks = MOCK_PROJECTS.reduce((sum, p) => sum + p.overdueTasks, 0)
  const pendingPayments = MOCK_PROJECTS.reduce((sum, p) => sum + p.pendingPayments, 0)
  const utilization = Math.round((active / MOCK_PROJECTS.length) * 100)

  return {
    total: MOCK_PROJECTS.length,
    active,
    atRisk,
    avgProgress,
    totalContract,
    overdueTasks,
    pendingPayments,
    utilization,
  }
})

const statCards = computed(() => [
  {
    label: t('projects.stats.activeProjects'),
    value: `${portfolioStats.value.active}/${portfolioStats.value.total}`,
    sub: `${portfolioStats.value.utilization}% utilization`,
    icon: 'ph:check-circle',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-500',
  },
  {
    label: t('projects.stats.avgProgress'),
    value: `${portfolioStats.value.avgProgress}%`,
    sub: portfolioStats.value.avgProgress >= 60 ? 'On target pace' : 'Behind schedule',
    icon: 'ph:trend-up',
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-500',
  },
  {
    label: t('projects.stats.portfolioValue'),
    value: currencyFormatter.value.format(portfolioStats.value.totalContract),
    sub: 'Total contract value',
    icon: 'ph:currency-dollar',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-500',
  },
  {
    label: t('projects.stats.needsAttention'),
    value: String(portfolioStats.value.atRisk),
    sub: `${portfolioStats.value.overdueTasks} overdue tasks`,
    icon: 'ph:warning-circle',
    iconBg: 'bg-destructive/15',
    iconColor: 'text-destructive',
  },
])

const filterOptions = [
  { value: 'all' as const, labelKey: 'projects.filters.all' },
  { value: 'active' as const, labelKey: 'projects.filters.active' },
  { value: 'at_risk' as const, labelKey: 'projects.filters.atRisk' },
  { value: 'planning' as const, labelKey: 'projects.filters.planning' },
  { value: 'on_hold' as const, labelKey: 'projects.filters.onHold' },
  { value: 'completed' as const, labelKey: 'projects.filters.completed' },
]

const onNewProject = () => {
  toast.message(t('projects.newProjectToast'))
}
</script>

<template>
  <div class="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-8 py-12 pb-4">
    <!-- Header -->
    <header class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <p class="text-muted-foreground text-sm">{{ greeting }}</p>
        <h1 class="text-[28px] leading-tight font-bold tracking-tight">
          {{ t('projects.listTitle') }}
        </h1>
        <p class="text-muted-foreground text-[14px]">
          {{ t('projects.welcome.subtitle') }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2 pt-1">
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground flex size-9 items-center justify-center rounded-lg transition-colors"
        >
          <Icon name="ph:gear" class="size-5" />
        </button>
        <Button class="h-9 gap-2 px-4" @click="onNewProject">
          <Icon name="ph:plus" class="size-4" />
          {{ t('projects.newProject') }}
        </Button>
      </div>
    </header>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="border-border bg-card rounded-xl border p-5"
      >
        <div class="flex items-start justify-between gap-3">
          <p class="text-muted-foreground text-[13px] font-medium">{{ card.label }}</p>
          <div
            :class="cn('flex size-8 shrink-0 items-center justify-center rounded-lg', card.iconBg)"
          >
            <Icon :name="card.icon" :class="cn('size-4', card.iconColor)" />
          </div>
        </div>
        <p class="mt-3 text-[26px] leading-none font-bold tracking-tight tabular-nums">
          {{ card.value }}
        </p>
        <p class="text-muted-foreground mt-1.5 text-[12px]">{{ card.sub }}</p>
      </div>
    </div>

    <!-- Two-column body -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_268px]">
      <!-- Left: toolbar + project list -->
      <div class="flex min-w-0 flex-col gap-5">
        <!-- Toolbar -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="relative flex-1">
              <Icon
                name="ph:magnifying-glass"
                class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              />
              <Input
                v-model="searchQuery"
                type="search"
                :placeholder="t('projects.searchPlaceholder')"
                class="h-9 pl-9"
              />
            </div>
            <p class="text-muted-foreground shrink-0 text-[13px] tabular-nums">
              {{ filteredProjects.length }} / {{ MOCK_PROJECTS.length }}
            </p>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="opt in filterOptions"
              :key="opt.value"
              type="button"
              :class="
                cn(
                  'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
                  statusFilter === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              "
              @click="statusFilter = opt.value"
            >
              {{ t(opt.labelKey) }}
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="filteredProjects.length === 0"
          class="border-border bg-muted/15 flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center"
        >
          <div class="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
            <Icon name="ph:buildings" class="text-muted-foreground size-6" />
          </div>
          <p class="text-[15px] font-medium">{{ t('projects.emptyTitle') }}</p>
          <p class="text-muted-foreground mt-1 max-w-sm text-sm">
            {{ t('projects.emptySubtitle') }}
          </p>
          <Button variant="outline" size="sm" class="mt-5" @click="onNewProject">
            {{ t('projects.newProject') }}
          </Button>
        </div>

        <!-- Project list -->
        <div v-else class="flex flex-col gap-4">
          <ProjectCard
            v-for="project in filteredProjects"
            :key="project.id"
            :project="project"
            :company-slug="companySlug"
          />
        </div>
      </div>

      <!-- Right: sidebar -->
      <ProjectSidebar :projects="MOCK_PROJECTS" />
    </div>
  </div>
</template>
