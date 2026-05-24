<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowUp, Download, Heart, LifeBuoy, Shield, Smartphone, FileText } from 'lucide-vue-next'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const config = useRuntimeConfig()
const { t } = useI18n()

const wrapperRef = ref<HTMLElement | null>(null)
const giantTextRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const linksRef = ref<HTMLElement | null>(null)
const magneticButtons = ref<HTMLElement[]>([])

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.cinematic-footer-wrapper {
  -webkit-font-smoothing: antialiased;
  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe { animation: footer-breathe 8s ease-in-out infinite alternate; }
.animate-footer-scroll-marquee { animation: footer-scroll-marquee 40s linear infinite; }
.animate-footer-heartbeat { animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite; }

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--primary) 15%, transparent) 0%,
    color-mix(in oklch, var(--secondary) 15%, transparent) 40%,
    transparent 70%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
    0 10px 30px -10px var(--pill-shadow),
    inset 0 1px 1px var(--pill-highlight),
    inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
    0 20px 40px -10px var(--pill-shadow-hover),
    inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  display: inline-block;
  line-height: 1.08;
  padding-bottom: 0.12em;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}
`

const marqueeItems = [
  'Accountability Redefined',
  'Transparent Tracking',
  '12-Step Progress',
  'Sponsor Connection',
  'Absolute Privacy',
]

const currentYear = computed(() => new Date().getFullYear())

const setMagneticRef = (refValue: Element | ComponentPublicInstance | null) => {
  const el =
    refValue instanceof HTMLElement
      ? refValue
      : refValue && '$el' in refValue && refValue.$el instanceof HTMLElement
        ? refValue.$el
        : null

  if (el && !magneticButtons.value.includes(el)) {
    magneticButtons.value.push(el)
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

let cleanup: (() => void) | null = null

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  const wrapper = wrapperRef.value
  if (!wrapper) return

  const ctx = gsap.context(() => {
    gsap.fromTo(
      giantTextRef.value,
      { y: '10vh', scale: 0.8, opacity: 0 },
      {
        y: '0vh',
        scale: 1,
        opacity: 1,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 80%',
          end: 'bottom bottom',
          scrub: 1,
        },
      }
    )

    gsap.fromTo(
      [headingRef.value, linksRef.value],
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 40%',
          end: 'bottom bottom',
          scrub: 1,
        },
      }
    )
  }, wrapper)

  const disposers: Array<() => void> = []
  for (const element of magneticButtons.value) {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const h = rect.width / 2
      const w = rect.height / 2
      const x = e.clientX - rect.left - h
      const y = e.clientY - rect.top - w

      gsap.to(element, {
        x: x * 0.4,
        y: y * 0.4,
        rotationX: -y * 0.15,
        rotationY: x * 0.15,
        scale: 1.05,
        ease: 'power2.out',
        duration: 0.4,
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        ease: 'elastic.out(1, 0.3)',
        duration: 1.2,
      })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)
    disposers.push(() => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    })
  }

  cleanup = () => {
    for (const dispose of disposers) dispose()
    ctx.revert()
  }
})

onBeforeUnmount(() => {
  cleanup?.()
  cleanup = null
})
</script>

<template>
  <div>
    <component :is="'style'">{{ STYLES }}</component>

    <div
      ref="wrapperRef"
      class="relative h-screen w-full"
      :style="{ clipPath: 'polygon(0% 0, 100% 0%, 100% 100%, 0 100%)' }"
    >
      <footer
        class="cinematic-footer-wrapper bg-background text-foreground fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden"
      >
        <div
          class="footer-aurora animate-footer-breathe pointer-events-none absolute top-1/2 left-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px]"
        />
        <div class="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

        <div
          ref="giantTextRef"
          class="footer-giant-bg-text pointer-events-none absolute -bottom-[5vh] left-1/2 z-0 -translate-x-1/2 whitespace-nowrap select-none"
        >
          Fullstack
        </div>

        <div
          class="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6"
        >
          <h2
            ref="headingRef"
            class="footer-text-glow mb-12 text-center text-5xl leading-tight font-black tracking-tighter md:text-8xl"
          >
            Ready to begin?
          </h2>

          <div ref="linksRef" class="flex w-full flex-col items-center gap-6">
            <div class="flex w-full flex-wrap justify-center gap-4">
              <Button as-child size="lg" class="group rounded-full px-10 py-5 text-sm md:text-base">
                <a href="#">
                  <Download />
                  Get Started for Free
                </a>
              </Button>
            </div>

            <div class="mt-8 flex w-full flex-col items-center gap-4 text-center">
              <div class="flex flex-col items-center">
                <div class="mb-1 text-xl font-semibold tracking-tight md:text-2xl">
                  {{ config.public.appName }}
                </div>
                <p class="text-muted-foreground max-w-sm text-sm font-medium md:text-base">
                  The modern event platform for a new generation of host and guests. Simple, fast,
                  and social.
                </p>
              </div>
              <div class="flex flex-col items-center">
                <ul class="flex items-center gap-6 text-sm font-semibold">
                  <li>
                    <a
                      href="https://www.instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                      class="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
                    >
                      <Icon name="ph:instagram-logo-fill" size="32" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Facebook"
                      class="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
                    >
                      <Icon name="ph:facebook-logo-fill" size="32" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.tiktok.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="TikTok"
                      class="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
                    >
                      <Icon name="ph:tiktok-logo-fill" size="32" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="YouTube"
                      class="text-muted-foreground hover:text-primary inline-flex items-center transition-colors"
                    >
                      <Icon name="ph:youtube-logo-fill" size="32" />
                    </a>
                  </li>
                </ul>
              </div>
              <div class="flex flex-col items-center">
                <ul
                  class="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold"
                >
                  <li>
                    <NuxtLink
                      to="/privacy-policy"
                      class="text-muted-foreground hover:text-primary inline-flex items-center gap-2 transition-colors"
                    >
                      {{ t('landing_nav.privacy') }}
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink
                      to="/terms-of-service"
                      class="text-muted-foreground hover:text-primary inline-flex items-center gap-2 transition-colors"
                    >
                      {{ t('landing_nav.terms') }}
                    </NuxtLink>
                  </li>
                  <li>
                    <a
                      href="#"
                      class="text-muted-foreground hover:text-primary inline-flex items-center gap-2 transition-colors"
                    >
                      Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div
          class="relative z-20 flex w-full flex-col items-center justify-between gap-6 px-6 pb-8 md:flex-row md:px-12"
        >
          <div
            class="text-muted-foreground order-2 text-[10px] font-semibold tracking-widest uppercase md:order-1 md:text-xs"
          >
            ©{{ currentYear }} {{ config.public.appName }} Inc. All rights reserved.
          </div>

          <Button
            class="order-3 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full"
            type="button"
            @click="scrollToTop"
          >
            <ArrowUp
              class="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1.5"
            />
          </Button>
        </div>
      </footer>
    </div>
  </div>
</template>
