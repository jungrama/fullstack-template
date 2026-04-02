<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar/utils'

const { state, isMobile } = useSidebar()
const isCollapsed = computed(() => state.value === 'collapsed')
const route = useRoute()
const router = useRouter()

defineProps<{
  title?: string
  items: {
    title: string
    url: string
    icon?: string
    isActive?: boolean
    permission?: {
      module: string
      action: string
    }
    items?: {
      title: string
      url: string
      permission?: {
        module: string
        action: string
      }
    }[]
  }[]
}>()

const isItemActive = (url: string) => {
  if (!url || url === '#') return false
  const currentPath = route.path
  // Handle both relative and absolute URLs
  let itemPath = url
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url)
      itemPath = urlObj.pathname
    } catch {
      return false
    }
  } else if (!url.startsWith('/')) {
    // Try to resolve relative URL
    try {
      const resolved = router.resolve(url)
      itemPath = resolved.path
    } catch {
      return false
    }
  }
  // Exact match or current path starts with item path
  return currentPath === itemPath || (itemPath !== '/' && currentPath.startsWith(itemPath + '/'))
}

const isSubItemActive = (url: string) => {
  return isItemActive(url)
}

const hasActiveSubItem = (subItems?: { title: string; url: string }[]) => {
  if (!subItems) return false
  return subItems.some(subItem => isSubItemActive(subItem.url))
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel v-if="title && !isCollapsed">{{ title }}</SidebarGroupLabel>
    <SidebarMenu>
      <template v-for="item in items" :key="item.title">
        <!-- When collapsed and has sub-items, use dropdown menu -->
        <DropdownMenu v-if="item.items && isCollapsed && !isMobile">
          <SidebarMenuItem>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton :tooltip="$t(item.title)">
                <Icon v-if="item.icon" :name="item.icon" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent :side="isMobile ? 'bottom' : 'right'" align="start">
              <DropdownMenuItem v-for="subItem in item.items" :key="subItem.title" as-child>
                <NuxtLink :to="subItem.url">
                  {{ $t(subItem.title) }}
                </NuxtLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </SidebarMenuItem>
        </DropdownMenu>

        <!-- When expanded and has sub-items, use collapsible -->
        <template v-else-if="item.items">
          <Collapsible
            as-child
            :default-open="item.isActive || hasActiveSubItem(item.items)"
            class="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger as-child>
                <SidebarMenuButton :tooltip="$t(item.title)">
                  <Icon v-if="item.icon" :name="item.icon" />
                  <span v-if="!isCollapsed || isMobile">{{ $t(item.title) }}</span>
                  <ChevronRight
                    v-if="!isCollapsed || isMobile"
                    class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent v-if="!isCollapsed || isMobile">
                <SidebarMenuSub>
                  <template v-for="subItem in item.items" :key="subItem.title">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton :is-active="isSubItemActive(subItem.url)" as-child>
                        <NuxtLink :to="subItem.url">
                          <span>{{ $t(subItem.title) }}</span>
                        </NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </template>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </template>

        <!-- NORMAL MENU -->
        <template v-else>
          <SidebarMenuItem>
            <SidebarMenuButton
              :tooltip="$t(item.title)"
              :is-active="isItemActive(item.url)"
              as-child
            >
              <NuxtLink :to="item.url">
                <Icon v-if="item.icon" :name="item.icon" />
                <span v-if="!isCollapsed || isMobile">{{ $t(item.title) }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </template>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
