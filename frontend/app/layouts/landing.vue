<script setup lang="ts">
import { Menu, X } from "lucide-vue-next";

const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>

<template>
  <div class="bg-white">
    <!-- Navigation -->
    <nav class="fixed top-4 right-0 left-0 z-50">
      <div class="mx-auto max-w-7xl rounded-xl border-b border-gray-200 bg-white/50 pr-4 pl-8 backdrop-blur-md">
        <div class="flex h-16 items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-xl font-bold text-gray-900">{{ $t("landing_nav.app_name") }}</span>
          </NuxtLink>
          <!-- Desktop Menu -->
          <div class="hidden items-center gap-2 md:flex">
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <NuxtLink to="/pricing">{{ $t("landing_nav.pricing") }}</NuxtLink>
              <NuxtLink to="/security">{{ $t("landing_nav.security") }}</NuxtLink>
              <NuxtLink to="/compare">{{ $t("landing_nav.compare") }}</NuxtLink>
            </div>
            <div class="mx-2 h-8 border-l border-gray-400"></div>
            <Button variant="outline" as-child>
              <NuxtLink to="/sign-in">{{ $t("landing_nav.sign_in") }}</NuxtLink>
            </Button>
            <Button variant="default" as-child>
              <NuxtLink to="/sign-up">{{ $t("landing_nav.sign_up") }}</NuxtLink>
            </Button>
          </div>
          <!-- Mobile Menu Button -->
          <button class="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
            :aria-label="$t('ui.toggle_menu')" @click="toggleMobileMenu">
            <Menu v-if="!mobileMenuOpen" :size="24" class="text-gray-900" />
            <X v-else :size="24" class="text-gray-900" />
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Sidebar -->
    <Teleport to="body">
      <!-- Backdrop -->
      <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
        enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <div v-if="mobileMenuOpen" class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
          @click="closeMobileMenu"></div>
      </Transition>

      <!-- Sidebar -->
      <Transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="translate-x-full"
        enter-to-class="translate-x-0" leave-active-class="transition-transform duration-300 ease-in"
        leave-from-class="translate-x-0" leave-to-class="translate-x-full">
        <aside v-if="mobileMenuOpen"
          class="fixed top-0 right-0 z-[70] h-full w-80 overflow-y-auto bg-white shadow-2xl md:hidden">
          <div class="flex h-full flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-gray-200 p-6">
              <NuxtLink to="/" class="flex items-center gap-2" @click="closeMobileMenu">
                <span class="text-xl font-bold text-gray-900">{{ $t("landing_nav.app_name") }}</span>
              </NuxtLink>
              <button class="rounded-lg p-2 transition-colors hover:bg-gray-100" :aria-label="$t('ui.close_menu')"
                @click="closeMobileMenu">
                <X :size="24" class="text-gray-900" />
              </button>
            </div>

            <!-- Menu Items -->
            <nav class="flex-1 space-y-4 p-6">
              <NuxtLink to="/pricing"
                class="hover:text-primary block py-3 text-base font-medium text-gray-900 transition-colors"
                @click="closeMobileMenu">
                {{ $t("landing_nav.pricing") }}
              </NuxtLink>
              <NuxtLink to="/compare"
                class="hover:text-primary block py-3 text-base font-medium text-gray-900 transition-colors"
                @click="closeMobileMenu">
                {{ $t("landing_nav.compare") }}
              </NuxtLink>
              <NuxtLink to="/security"
                class="hover:text-primary block py-3 text-base font-medium text-gray-900 transition-colors"
                @click="closeMobileMenu">
                {{ $t("landing_nav.security") }}
              </NuxtLink>
            </nav>

            <!-- Footer Actions -->
            <div class="space-y-3 border-t border-gray-200 p-6">
              <Button variant="outline" class="w-full" as-child>
                <NuxtLink to="/login" @click="closeMobileMenu">{{ $t("landing_nav.log_in") }}</NuxtLink>
              </Button>
              <Button variant="default" class="w-full" as-child>
                <NuxtLink to="/sign-up">{{ $t("landing_nav.create_event_for_free") }}</NuxtLink>
              </Button>
            </div>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- Page Content -->
    <slot />

    <section class="relative bg-zinc-900 pt-24 pb-12 text-white">
      <div class="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="mb-6 text-4xl font-bold sm:text-5xl">{{ $t("landing.cta_heading") }}</h2>
        <p class="mb-8 text-gray-300">Join thousands of user using FullStackApp.</p>
        <Button size="lg" variant="default" class="bg-white px-8 py-6 text-lg text-gray-900 hover:bg-gray-100" as-child>
          <NuxtLink to="/sign-up">{{ $t("landing.cta_button") }}</NuxtLink>
        </Button>
      </div>
      <footer class="relative z-10 text-white">
        <div class="mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 lg:px-8">
          <div class="mb-16 grid grid-cols-2 gap-12 md:grid-cols-4">
            <div class="col-span-2">
              <div class="mb-6 flex items-center gap-2 text-2xl tracking-tight">
                <span>{{ $t("landing_nav.app_name") }}</span>
              </div>
              <p class="max-w-sm font-medium">The modern event platform for a new generation of host and guests. Simple,
                fast, and social.</p>
            </div>
            <div>
              <h4 class="mb-6 text-xs font-bold tracking-widest text-white uppercase">Social Media
              </h4>
              <ul class="space-y-4 text-sm font-semibold">
                <li>
                  <a href="#" class="transition-colors hover:text-indigo-400">Instagram</a>
                </li>
                <li>
                  <a href="#" class="transition-colors hover:text-indigo-400">Tiktok</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 class="mb-6 text-xs font-bold tracking-widest text-white uppercase">{{ $t("landing_nav.company") }}
              </h4>
              <ul class="space-y-4 text-sm font-semibold">
                <!-- <li>
                  <a href="#" class="transition-colors hover:text-indigo-400">{{ $t("landing_nav.about") }}</a>
                </li> -->
                <li>
                  <NuxtLink to="/privacy-policy" class="transition-colors hover:text-indigo-400">{{
                    $t("landing_nav.privacy")
                    }}</NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/terms-of-service" class="transition-colors hover:text-indigo-400">{{
                    $t("landing_nav.terms") }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
          <div
            class="flex flex-col items-center justify-between gap-6 border-t border-gray-800 pt-10 text-sm font-medium md:flex-row">
            <span>©{{ new Date().getFullYear() }} FullstackApp Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </section>
  </div>
</template>
