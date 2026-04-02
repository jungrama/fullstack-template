<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type NotificationItem = {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  description?: string
  dateLabel: string
  tab: 'inbox' | 'archive' | 'comments'
}

const notifications = ref<NotificationItem[]>([
  {
    id: '1',
    type: 'success',
    title: 'Your team has opted in to data-sharing.',
    description: 'View in Settings.',
    dateLabel: '7h ago',
    tab: 'inbox',
  },
  {
    id: '2',
    type: 'warning',
    title: 'propsassist-r1yl failed to deploy in the Production environment',
    dateLabel: '9/2/25',
    tab: 'inbox',
  },
  {
    id: '3',
    type: 'warning',
    title: 'propsassist failed to deploy in the Production environment',
    dateLabel: '9/2/25',
    tab: 'inbox',
  },
  {
    id: '4',
    type: 'info',
    title: 'Node.js 18 is being discontinued on Monday, September 1st, 2025',
    description: 'Please upgrade your Node.js version today.',
    dateLabel: '8/27/25',
    tab: 'archive',
  },
  {
    id: '5',
    type: 'success',
    title: 'corpv-assignment.jungrama.com is now configured',
    dateLabel: '1/3/24',
    tab: 'archive',
  },
  {
    id: '6',
    type: 'info',
    title: '2 comments on your latest deployment',
    description: 'Review feedback from your team.',
    dateLabel: '2h ago',
    tab: 'comments',
  },
])

const currentTab = ref<'inbox' | 'archive' | 'comments'>('inbox')

const tabs = [
  { key: 'inbox' as const, label: 'Inbox' },
  { key: 'archive' as const, label: 'Archive' },
  { key: 'comments' as const, label: 'Comments' },
]

const unreadCount = computed(() => notifications.value.filter(item => item.tab === 'inbox').length)

const notificationsByTab = computed(() =>
  tabs.reduce(
    (acc, tab) => {
      acc[tab.key] = notifications.value.filter(item => item.tab === tab.key)
      return acc
    },
    {} as Record<'inbox' | 'archive' | 'comments', NotificationItem[]>
  )
)

const iconClass = (type: NotificationItem['type']) => {
  if (type === 'success') {
    return 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-300'
  }
  if (type === 'warning') {
    return 'bg-amber-500/15 text-amber-800 dark:bg-amber-500/25 dark:text-amber-300'
  }
  return 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/25 dark:text-sky-300'
}

const iconName = (type: NotificationItem['type']) => {
  if (type === 'success') return 'ph:check-circle'
  if (type === 'warning') return 'ph:warning-circle'
  return 'ph:info'
}

const archiveAll = () => {
  notifications.value = notifications.value.map(item =>
    item.tab === 'inbox' ? { ...item, tab: 'archive' } : item
  )
  currentTab.value = 'archive'
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="text-muted-foreground relative"
        aria-label="Notifications"
      >
        <Icon name="ph:bell-fill" size="20" />
        <span
          v-if="unreadCount > 0"
          class="bg-primary text-primary-foreground ring-background absolute top-0 right-0 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-semibold ring-2"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="end"
      :side-offset="8"
      class="border-border bg-popover text-popover-foreground w-[420px] p-0 shadow-lg"
    >
      <Tabs v-model="currentTab" class="w-full">
        <div class="border-border border-b p-2 pb-0">
          <div class="flex items-center justify-between px-2 pb-2">
            <TabsList class="bg-transparent p-0">
              <TabsTrigger value="inbox"> Inbox </TabsTrigger>
              <TabsTrigger value="archive"> Archive </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="inbox" class="mt-0">
          <div class="max-h-[520px] overflow-y-auto">
            <ul>
              <li
                v-for="item in notificationsByTab.inbox"
                :key="item.id"
                class="border-border hover:bg-muted/60 border-b px-4 py-3 transition-colors"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="mt-0.5 inline-flex size-6 items-center justify-center rounded-full"
                    :class="iconClass(item.type)"
                  >
                    <Icon :name="iconName(item.type)" class="size-4" />
                  </span>
                  <div class="min-w-0">
                    <p class="text-sm leading-snug font-semibold">{{ item.title }}</p>
                    <p
                      v-if="item.description"
                      class="text-muted-foreground mt-0.5 text-sm leading-snug"
                    >
                      {{ item.description }}
                    </p>
                    <p class="text-muted-foreground mt-1 text-xs opacity-80">
                      {{ item.dateLabel }}
                    </p>
                  </div>
                </div>
              </li>
            </ul>
            <Button variant="ghost" size="sm" class="w-full rounded-none" @click="archiveAll">
              Archive All
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="archive" class="mt-0">
          <div class="max-h-[520px] overflow-y-auto">
            <ul>
              <li
                v-for="item in notificationsByTab.archive"
                :key="item.id"
                class="border-border hover:bg-muted/60 border-b px-4 py-3 transition-colors"
              >
                <p class="text-sm leading-snug font-semibold">{{ item.title }}</p>
                <p
                  v-if="item.description"
                  class="text-muted-foreground mt-0.5 text-sm leading-snug"
                >
                  {{ item.description }}
                </p>
                <p class="text-muted-foreground mt-1 text-xs opacity-80">{{ item.dateLabel }}</p>
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
