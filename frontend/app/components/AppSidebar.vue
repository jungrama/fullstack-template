<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'
import { useAuth } from '@/composables/services/useAuth'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon',
})
const config = useRuntimeConfig()
const appName = computed(() => config.public.appName || 'FullstackApp')

const { getSession, getAvatarSignedUrl } = useAuth()
const authUser = useState<{ name: string; email: string; image?: string | null } | null>(
  'auth-user',
  () => null
)

// This is sample data.
const data = {
  user: {
    name: 'User',
    email: 'user@notsignin.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: appName.value,
      logo: 'ph:stack',
      plan: 'Enterprise',
    },
    {
      name: `${appName.value} Labs`,
      logo: 'ph:waveform',
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: 'ph:command',
      plan: 'Free',
    },
  ],
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: 'ph:house',
      isActive: true,
    },
    {
      title: 'My Projects',
      url: '#',
      icon: 'ph:laptop',
      items: [
        {
          title: 'Project Planning',
          url: '#',
        },
        {
          title: 'Project Timeline',
          url: '#',
        },
        {
          title: 'Task List',
          url: '#',
        },
      ],
    },
    {
      title: 'My Document',
      url: '#',
      icon: 'ph:file-text',
      items: [
        {
          title: 'Introduction',
          url: '#',
        },
        {
          title: 'Get Started',
          url: '#',
        },
        {
          title: 'Tutorials',
          url: '#',
        },
        {
          title: 'Changelog',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'My Pages',
      url: '#',
      icon: 'ph:folder',
      actionIcon: 'ph:plus',
      items: [
        {
          title: 'Page 1',
          url: '#',
        },
        {
          title: 'Page 2',
          url: '#',
        },
      ],
    },
  ],
}

const userData = computed(() => ({
  name: authUser.value?.name || data.user.name,
  email: authUser.value?.email || data.user.email,
  avatar: authUser.value?.image || data.user.avatar,
}))

const resolveAvatarUrl = async (value?: string | null) => {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  const result = await getAvatarSignedUrl(value)
  if (!result.success || !result.data?.url) return null
  return result.data.url
}

onMounted(async () => {
  if (authUser.value) return
  try {
    const session = await getSession()
    if (!session?.data?.user) return
    authUser.value = {
      name: session.data.user.name ?? '',
      email: session.data.user.email ?? '',
      image: (await resolveAvatarUrl(session.data.user.image ?? null)) ?? null,
    }
  } catch {
    // Ignore sidebar hydration failures and keep fallback user data.
  }
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" label="Main" />
      <NavMain :items="data.navSecondary" label="Pages" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="userData" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
