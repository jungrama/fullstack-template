<script setup lang="ts">
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
    <Icon v-if="isMounted && theme === 'dark'" name="ph:sun" class="size-4" />
    <Icon v-else name="ph:moon" class="size-4" />
  </Button>
</template>
