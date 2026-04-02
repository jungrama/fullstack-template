<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import BillingPricingPlans from '@/components/use/billing/BillingPricingPlans.vue'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/composables/services/useAuth'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'

defineProps<{
  user: {
    name: string
    email: string
    avatar: string
  }
}>()

const { t } = useI18n()
const { isMobile } = useSidebar()
const { signOut } = useAuth()
const { themePreference, setTheme } = useTheme()

const upgradeModalOpen = ref(false)

const closeUpgradeModal = () => {
  upgradeModalOpen.value = false
}

const onPlanUpgrade = () => {
  closeUpgradeModal()
  navigateTo({ name: 'app-billing' })
}

const onPlanContact = () => {
  closeUpgradeModal()
  navigateTo({ name: 'app-billing' })
}

const onSignOut = async () => {
  await signOut()
  toast.success(t('auth.logout.success'))
  await navigateTo('/sign-in')
}

const segmentClass = (value: 'system' | 'light' | 'dark') =>
  cn(
    'flex size-8 items-center justify-center rounded-full transition-colors',
    themePreference.value === value
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground hover:text-foreground'
  )
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg"> CN </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ user.name }}</span>
              <span class="truncate text-xs">{{ user.email }}</span>
            </div>
            <Icon name="ph:caret-up-down" class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-60 rounded-lg"
          :side="isMobile ? 'bottom' : 'top'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="rounded-lg"> CN </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem @click="upgradeModalOpen = true">
              <Icon name="ph:sparkle" class="size-4" />
              Upgrade to Pro
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem @click="navigateTo({ name: 'app-account' })">
              <Icon name="ph:seal-check" class="size-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem @click="navigateTo({ name: 'app-billing' })">
              <Icon name="ph:credit-card" class="size-4" />
              Billing
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <div class="flex items-center justify-between gap-3 px-2 py-2">
            <span class="text-sm font-medium">Theme</span>
            <div
              class="bg-muted/80 flex shrink-0 rounded-full p-0.5"
              role="radiogroup"
              aria-label="Theme"
            >
              <button
                type="button"
                role="radio"
                :aria-checked="themePreference === 'system'"
                :class="segmentClass('system')"
                @click="setTheme('system')"
              >
                <Icon name="ph:monitor" class="size-4" />
              </button>
              <button
                type="button"
                role="radio"
                :aria-checked="themePreference === 'light'"
                :class="segmentClass('light')"
                @click="setTheme('light')"
              >
                <Icon name="ph:sun" class="size-4" />
              </button>
              <button
                type="button"
                role="radio"
                :aria-checked="themePreference === 'dark'"
                :class="segmentClass('dark')"
                @click="setTheme('dark')"
              >
                <Icon name="ph:moon" class="size-4" />
              </button>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="onSignOut">
            <Icon name="ph:sign-out" class="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog v-model:open="upgradeModalOpen">
        <DialogScrollContent
          class="bg-background max-w-5xl gap-6 border p-6 pt-12 shadow-lg sm:rounded-lg"
        >
          <BillingPricingPlans @upgrade="onPlanUpgrade" @contact="onPlanContact">
            <div class="max-w-xl space-y-1">
              <h1 class="text-2xl font-bold tracking-tight">{{ t('nav.upgradeModal.title') }}</h1>
              <p class="text-muted-foreground text-sm leading-relaxed">
                {{ t('nav.upgradeModal.description') }}
              </p>
            </div>
          </BillingPricingPlans>
        </DialogScrollContent>
      </Dialog>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
