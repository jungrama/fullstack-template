<script setup lang="ts">
import type { LegalTocItem } from './legal-doc'

defineProps<{
  title: string
  lastUpdated: string
  effectiveDate: string
  tocItems: LegalTocItem[]
}>()

const { t } = useI18n()
</script>

<template>
  <div
    class="legal-doc-root border-border bg-background relative min-h-screen border-x pt-28 pb-24"
  >
    <div class="border-border mx-auto max-w-6xl border-b">
      <header class="border-border px-4 py-12 text-center sm:px-8">
        <h1 class="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          {{ title }}
        </h1>
        <div
          class="text-muted-foreground flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm"
        >
          <p>
            <span class="text-foreground/80">{{ t('legal.lastUpdated') }}</span>
            {{ lastUpdated }}
          </p>
          <span class="bg-border hidden h-3 w-px sm:inline-block" aria-hidden="true" />
          <p>
            <span class="text-foreground/80">{{ t('legal.effectiveDate') }}</span>
            {{ effectiveDate }}
          </p>
        </div>
      </header>
    </div>

    <div
      class="border-border mx-auto grid max-w-6xl gap-0 lg:grid-cols-[minmax(0,1fr)_min(280px,32%)] lg:items-start lg:gap-0"
    >
      <article
        class="legal-doc-content border-border order-2 min-w-0 px-4 py-10 sm:px-8 lg:order-1 lg:border-r lg:py-14 lg:pr-10"
      >
        <slot />
      </article>

      <aside
        class="border-border bg-background/80 order-1 border-b px-4 py-8 sm:px-8 lg:sticky lg:top-28 lg:order-2 lg:self-start lg:border-b-0 lg:border-l lg:px-6 lg:py-14"
      >
        <div class="lg:pl-2">
          <p class="text-foreground mb-4 text-sm font-semibold tracking-tight">
            {{ t('legal.onThisPage') }}
          </p>
          <nav class="text-sm" aria-label="Table of contents">
            <ul class="space-y-2">
              <li v-for="item in tocItems" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  class="text-muted-foreground hover:text-foreground hover:border-primary block border-l-2 border-transparent py-0.5 pl-3 transition-colors"
                >
                  {{ item.label }}
                </a>
                <ul
                  v-if="item.children?.length"
                  class="border-border mt-2 ml-3 space-y-1.5 border-l pl-3"
                >
                  <li v-for="child in item.children" :key="child.id">
                    <a
                      :href="`#${child.id}`"
                      class="text-muted-foreground hover:text-foreground block py-0.5 transition-colors"
                    >
                      {{ child.label }}
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.legal-doc-content {
  counter-reset: legal-section;
}

.legal-doc-content :deep(section) {
  scroll-margin-top: 7rem;
}

.legal-doc-content :deep(section h2) {
  counter-increment: legal-section;
}

.legal-doc-content :deep(section h2::before) {
  content: counter(legal-section) '.';
  color: var(--muted-foreground);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  margin-right: 0.5rem;
}

.legal-doc-root {
  background-image:
    linear-gradient(
      to right,
      color-mix(in oklch, var(--border) 25%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      color-mix(in oklch, var(--border) 25%, transparent) 1px,
      transparent 1px
    );
  background-size: 32px 32px;
}
</style>
