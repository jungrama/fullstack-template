<script setup lang="ts">
import { Toaster } from "@/components/ui/sonner";
import "vue-sonner/style.css";
</script>
<template>
  <div vaul-drawer-wrapper>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ClientOnly>
      <Toaster rich-colors position="top-center" />
    </ClientOnly>
  </div>
</template>
