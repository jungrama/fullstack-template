<script setup lang="ts">
import { ErrorMessage } from "vee-validate";

const props = defineProps<{
  name: string;
  as?: string;
  class?: string;
}>();
</script>

<template>
  <ErrorMessage :name="props.name" :as="props.as" :class="['text-xs text-red-500', props.class]" />
</template>
