<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <Icon name="ph:check-circle" class="size-4" />
    </template>
    <template #info-icon>
      <Icon name="ph:info" class="size-4" />
    </template>
    <template #warning-icon>
      <Icon name="ph:warning" class="size-4" />
    </template>
    <template #error-icon>
      <Icon name="ph:warning-octagon" class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Icon name="ph:spinner" class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <Icon name="ph:x" class="size-4" />
    </template>
  </Sonner>
</template>
