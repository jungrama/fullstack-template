<script setup lang="ts">
const mobileMenuOpen = ref(false)
const config = useRuntimeConfig()

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
  <div class="bg-background text-foreground">
    <!-- Navigation -->
    <nav class="fixed top-4 right-0 left-0 z-50">
      <div
        class="bg-background/80 border-border mx-auto max-w-7xl rounded-xl border-b pr-4 pl-8 backdrop-blur-md"
      >
        <div class="flex h-16 items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-xl font-bold">{{ config.public.appName }}</span>
          </NuxtLink>
          <!-- Desktop Menu -->
          <div class="hidden items-center gap-2 md:flex">
            <div class="text-muted-foreground flex items-center gap-4 text-sm">
              <NuxtLink to="/pricing">{{ $t('landing_nav.pricing') }}</NuxtLink>
              <NuxtLink to="/security">{{ $t('landing_nav.security') }}</NuxtLink>
              <NuxtLink to="/compare">{{ $t('landing_nav.compare') }}</NuxtLink>
            </div>
            <div class="border-border mx-2 h-8 border-l"></div>
            <ThemeToggle />
            <Button variant="outline" as-child>
              <NuxtLink to="/sign-in">{{ $t('landing_nav.sign_in') }}</NuxtLink>
            </Button>
            <Button variant="default" as-child>
              <NuxtLink to="/sign-up">{{ $t('landing_nav.sign_up') }}</NuxtLink>
            </Button>
          </div>
          <!-- Mobile Menu Button -->
          <button
            class="hover:bg-muted rounded-lg p-2 transition-colors md:hidden"
            :aria-label="$t('ui.toggle_menu')"
            @click="toggleMobileMenu"
          >
            <Icon v-if="!mobileMenuOpen" name="ph:list" class="text-foreground size-6" />
            <Icon v-else name="ph:x" class="text-foreground size-6" />
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Sidebar -->
    <Teleport to="body">
      <!-- Backdrop -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-300"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
          @click="closeMobileMenu"
        ></div>
      </Transition>

      <!-- Sidebar -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-300 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <aside
          v-if="mobileMenuOpen"
          class="bg-background fixed top-0 right-0 z-[70] h-full w-80 overflow-y-auto shadow-2xl md:hidden"
        >
          <div class="flex h-full flex-col">
            <!-- Header -->
            <div class="border-border flex items-center justify-between border-b p-6">
              <NuxtLink to="/" class="flex items-center gap-2" @click="closeMobileMenu">
                <span class="text-xl font-bold">{{ config.public.appName }}</span>
              </NuxtLink>
              <div class="flex items-center gap-2">
                <ThemeToggle />
                <button
                  class="hover:bg-muted rounded-lg p-2 transition-colors"
                  :aria-label="$t('ui.close_menu')"
                  @click="closeMobileMenu"
                >
                  <Icon name="ph:x" class="text-foreground size-6" />
                </button>
              </div>
            </div>

            <!-- Menu Items -->
            <nav class="flex-1 space-y-4 p-6">
              <NuxtLink
                to="/pricing"
                class="text-foreground hover:text-primary block py-3 text-base font-medium transition-colors"
                @click="closeMobileMenu"
              >
                {{ $t('landing_nav.pricing') }}
              </NuxtLink>
              <NuxtLink
                to="/compare"
                class="text-foreground hover:text-primary block py-3 text-base font-medium transition-colors"
                @click="closeMobileMenu"
              >
                {{ $t('landing_nav.compare') }}
              </NuxtLink>
              <NuxtLink
                to="/security"
                class="text-foreground hover:text-primary block py-3 text-base font-medium transition-colors"
                @click="closeMobileMenu"
              >
                {{ $t('landing_nav.security') }}
              </NuxtLink>
            </nav>

            <!-- Footer Actions -->
            <div class="border-border space-y-3 border-t p-6">
              <Button variant="outline" class="w-full" as-child>
                <NuxtLink to="/login" @click="closeMobileMenu">{{
                  $t('landing_nav.log_in')
                }}</NuxtLink>
              </Button>
              <Button variant="default" class="w-full" as-child>
                <NuxtLink to="/sign-up">{{ $t('landing_nav.create_event_for_free') }}</NuxtLink>
              </Button>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- Page Content -->
    <slot />

    <section class="bg-card text-card-foreground relative overflow-hidden border-t pt-24 pb-12">
      <div class="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="mb-6 text-4xl font-bold sm:text-5xl">{{ $t('landing.cta_heading') }}</h2>
        <p class="text-muted-foreground mb-8">
          Join thousands of user using {{ config.public.appName }}.
        </p>
        <Button size="lg" variant="default" class="px-8 py-6 text-lg" as-child>
          <NuxtLink to="/sign-up">{{ $t('landing.cta_button') }}</NuxtLink>
        </Button>
      </div>
      <footer class="relative z-10">
        <div class="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
          <div class="mb-16 grid grid-cols-2 gap-12 md:grid-cols-4">
            <div class="col-span-2">
              <div class="mb-6 flex items-center gap-2 text-2xl tracking-tight">
                <span>{{ config.public.appName }}</span>
              </div>
              <p class="max-w-sm font-medium">
                The modern event platform for a new generation of host and guests. Simple, fast, and
                social.
              </p>
            </div>
            <div>
              <h4 class="mb-6 text-xs font-bold tracking-widest uppercase">Social Media</h4>
              <ul class="space-y-4 text-sm font-semibold">
                <li>
                  <a href="#" class="text-muted-foreground hover:text-primary transition-colors"
                    >Instagram</a
                  >
                </li>
                <li>
                  <a href="#" class="text-muted-foreground hover:text-primary transition-colors"
                    >Tiktok</a
                  >
                </li>
              </ul>
            </div>
            <div>
              <h4 class="mb-6 text-xs font-bold tracking-widest uppercase">
                {{ $t('landing_nav.company') }}
              </h4>
              <ul class="space-y-4 text-sm font-semibold">
                <!-- <li>
                  <a href="#" class="transition-colors hover:text-indigo-400">{{ $t("landing_nav.about") }}</a>
                </li> -->
                <li>
                  <NuxtLink
                    to="/privacy-policy"
                    class="text-muted-foreground hover:text-primary transition-colors"
                    >{{ $t('landing_nav.privacy') }}</NuxtLink
                  >
                </li>
                <li>
                  <NuxtLink
                    to="/terms-of-service"
                    class="text-muted-foreground hover:text-primary transition-colors"
                    >{{ $t('landing_nav.terms') }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
          <div
            class="border-border text-muted-foreground flex flex-col items-center justify-between gap-6 border-t pt-10 text-sm font-medium md:flex-row"
          >
            <span
              >©{{ new Date().getFullYear() }} {{ config.public.appName }} Inc. All rights
              reserved.</span
            >
          </div>
        </div>
      </footer>
      <div class="relative -mt-16 h-10 w-full" aria-hidden="true">
        <div
          class="absolute bottom-0 left-1/2 z-0 -translate-x-1/2 translate-y-2/3"
          aria-hidden="true"
        >
          <div class="h-56 w-56 rounded-full border-[20px] border-orange-500/80 blur-[80px]"></div>
        </div>
      </div>
    </section>
  </div>
</template>
