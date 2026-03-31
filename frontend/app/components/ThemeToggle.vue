<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'

const { theme, toggleTheme } = useTheme()
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>

<template>
  <Button
    variant="outline"
    size="icon"
    type="button"
    :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <Sun v-if="isMounted && theme === 'dark'" class="size-4" />
    <Moon v-else class="size-4" />
  </Button>
</template>
