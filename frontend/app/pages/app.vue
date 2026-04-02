<script setup lang="ts">
import AppSidebar from '@/components/use/layout/AppSidebar.vue'
import NotificationDropdown from '@/components/use/layout/NotificationDropdown.vue'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()

function titleCaseSegment(segment: string) {
  return segment
    .split('-')
    .map(part => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
    .join(' ')
}

const breadcrumbs = computed(() => {
  const normalized = route.path.replace(/\/$/, '') || '/'
  const base = '/app'
  const leafFromMeta = typeof route.meta.breadcrumb === 'string' ? route.meta.breadcrumb : undefined

  if (!normalized.startsWith(base)) {
    return [{ label: 'App' as const }]
  }

  const tail = normalized.slice(base.length).replace(/^\//, '')
  const segments = tail ? tail.split('/').filter(Boolean) : []

  if (segments.length === 0) {
    return [{ label: leafFromMeta ?? 'Dashboard' }]
  }

  const items: { label: string; to?: string }[] = [{ label: 'Dashboard', to: base }]
  let acc = base
  for (let i = 0; i < segments.length - 1; i++) {
    acc += `/${segments[i]}`
    items.push({ label: titleCaseSegment(segments[i]!), to: acc })
  }
  items.push({ label: leafFromMeta ?? titleCaseSegment(segments[segments.length - 1]!) })
  return items
})

const onFeedback = () => {
  toast.message('Feedback', { description: 'Feedback is not wired up yet.' })
}
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1 shrink-0" />
          <Separator orientation="vertical" class="mr-2 shrink-0 data-[orientation=vertical]:h-4" />
          <Breadcrumb class="min-w-0">
            <BreadcrumbList>
              <template v-for="(crumb, index) in breadcrumbs" :key="`${crumb.label}-${index}`">
                <BreadcrumbSeparator v-if="index > 0" class="hidden md:block" />
                <BreadcrumbItem
                  :class="index < breadcrumbs.length - 1 ? 'hidden md:inline-flex' : undefined"
                >
                  <BreadcrumbLink v-if="crumb.to" as-child>
                    <NuxtLink :to="crumb.to" class="truncate">{{ crumb.label }}</NuxtLink>
                  </BreadcrumbLink>
                  <BreadcrumbPage v-else class="truncate">{{ crumb.label }}</BreadcrumbPage>
                </BreadcrumbItem>
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div class="flex shrink-0 items-center gap-1 pr-4">
          <Button
            variant="ghost"
            size="icon"
            class="text-muted-foreground"
            aria-label="Send feedback"
            @click="onFeedback"
          >
            <Icon name="ph:chat-circle-dots-fill" size="20" />
          </Button>
          <NotificationDropdown />
        </div>
      </header>
      <div class="mx-auto w-full max-w-6xl p-4">
        <NuxtPage />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
