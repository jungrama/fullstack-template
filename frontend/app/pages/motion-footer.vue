<script setup lang="ts">
import MotionFooter from "@/components/ui/motion-footer.vue";
</script>

<template>
  <div class="relative min-h-screen w-full overflow-x-hidden bg-background font-sans selection:bg-white/20">
    <main class="relative z-10 flex min-h-[120vh] w-full flex-col items-center justify-center rounded-b-3xl border-b border-white/10 bg-background shadow-2xl">
      <div
        class="pointer-events-none absolute inset-0 bg-cover bg-center opacity-25"
        style="background-image: url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1920&q=80');"
      />
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.08)_0%,transparent_60%)]" />

      <h1 class="relative z-10 mb-8 px-4 text-center text-4xl font-light tracking-[0.2em] text-neutral-400 uppercase md:text-5xl">
        Scroll down to reveal
      </h1>

      <div class="relative z-10 h-32 w-[1px] bg-gradient-to-b from-neutral-400 to-transparent" />
    </main>

    <MotionFooter />
  </div>
</template>
