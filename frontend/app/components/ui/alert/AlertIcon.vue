<script setup lang="ts">
const props = defineProps<{
  status?: string
  size?: number
}>()

const icon = computed(() => {
  switch (props.status) {
    case 'success':
      return 'ph:check-circle-fill'
    case 'error':
      return 'ph:x-circle-fill'
    case 'warning':
      return 'ph:warning-octagon-fill'
    case 'info':
      return 'ph:info-circle-fill'
    default:
      return 'ph:info-circle-fill'
  }
})
</script>

<template>
  <Icon :name="icon" :size="size ?? 16" />
</template>
