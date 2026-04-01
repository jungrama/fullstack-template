<script setup lang="ts">
import BillingPricingPlans from '@/components/billing/BillingPricingPlans.vue'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'landing',
})

const comparisonRows = [
  { feature: 'Projects', starter: 'Up to 3', growth: 'Up to 20', enterprise: 'Unlimited' },
  { feature: 'Team members', starter: 'Up to 3', growth: 'Up to 25', enterprise: 'Unlimited' },
  { feature: 'Storage', starter: '10 GB', growth: '500 GB', enterprise: 'Custom' },
  { feature: 'Automations', starter: false, growth: true, enterprise: true },
  { feature: 'Role-based permissions', starter: false, growth: true, enterprise: true },
  { feature: 'Audit logs', starter: false, growth: true, enterprise: true },
  { feature: 'Dedicated success manager', starter: false, growth: false, enterprise: true },
  { feature: 'SLA', starter: false, growth: false, enterprise: '99.99%' },
]

const faqItems = [
  {
    q: 'Which plan is right for me?',
    a: 'Starter is best for personal projects, Growth is best for active teams, and Enterprise is ideal for regulated or high-scale organizations.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. You can upgrade or downgrade at any time. Changes take effect immediately and are prorated automatically.',
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Yes. Annual billing is available for every paid tier with discounted pricing compared to monthly billing.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Growth includes a trial period for new workspaces. Enterprise demos are guided by our solutions team.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'Major credit cards are supported by default. Enterprise can also use invoices and purchase orders.',
  },
  {
    q: 'Do you provide custom contracts?',
    a: 'Yes. Enterprise includes custom terms, security review support, and procurement assistance.',
  },
]
</script>

<template>
  <main class="bg-background text-foreground pt-28">
    <!-- Hero + pricing cards -->
    <section class="border-border border-b">
      <div class="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div class="mx-auto mb-12 max-w-3xl space-y-4 text-center">
          <p class="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Pricing</p>
          <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple plans for every stage
          </h1>
          <p class="text-muted-foreground text-base leading-relaxed sm:text-lg">
            Start free, scale with your team, and unlock enterprise controls when you need them.
          </p>
        </div>

        <BillingPricingPlans
          context="marketing"
          @upgrade="navigateTo('/sign-up')"
          @contact="navigateTo('/sign-up')"
        />
      </div>
    </section>

    <!-- Comparison -->
    <section class="legal-doc-root border-border border-b">
      <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div class="mb-10 text-center">
          <p class="text-primary mb-2 text-xs font-semibold tracking-[0.2em] uppercase">Compare</p>
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">Feature comparison</h2>
          <p class="text-muted-foreground mx-auto mt-3 max-w-2xl text-base">
            The same table your team uses to decide between tiers—clear limits, no surprises.
          </p>
        </div>

        <div class="border-border bg-card/40 overflow-hidden rounded-2xl border shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full table-fixed text-base">
              <colgroup>
                <col class="w-[32%]" />
                <col class="w-[22.6%]" />
                <col class="w-[22.6%]" />
                <col class="w-[22.6%]" />
              </colgroup>
              <thead>
                <tr class="border-border bg-muted/50 border-b">
                  <th
                    class="text-muted-foreground px-4 py-4 text-left text-xs font-semibold tracking-wide uppercase"
                  >
                    Feature
                  </th>
                  <th class="text-foreground px-4 py-4 text-center text-sm font-semibold">
                    Starter
                  </th>
                  <th class="text-foreground px-4 py-4 text-center text-sm font-semibold">
                    Growth
                  </th>
                  <th class="text-foreground px-4 py-4 text-center text-sm font-semibold">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody class="divide-border divide-y">
                <tr
                  v-for="row in comparisonRows"
                  :key="row.feature"
                  class="hover:bg-muted/25 transition-colors"
                >
                  <td class="text-foreground px-4 py-4 font-medium">{{ row.feature }}</td>
                  <td class="text-muted-foreground px-4 py-4 text-center">
                    <template v-if="typeof row.starter === 'boolean'">
                      <span class="inline-flex justify-center">
                        <Icon
                          :name="row.starter ? 'ph:check-circle' : 'ph:x-circle'"
                          class="size-5"
                          :class="row.starter ? 'text-emerald-500' : 'text-muted-foreground/50'"
                        />
                      </span>
                    </template>
                    <template v-else>{{ row.starter }}</template>
                  </td>
                  <td class="text-muted-foreground px-4 py-4 text-center">
                    <template v-if="typeof row.growth === 'boolean'">
                      <span class="inline-flex justify-center">
                        <Icon
                          :name="row.growth ? 'ph:check-circle' : 'ph:x-circle'"
                          class="size-5"
                          :class="row.growth ? 'text-emerald-500' : 'text-muted-foreground/50'"
                        />
                      </span>
                    </template>
                    <template v-else>{{ row.growth }}</template>
                  </td>
                  <td class="text-muted-foreground px-4 py-4 text-center">
                    <template v-if="typeof row.enterprise === 'boolean'">
                      <span class="inline-flex justify-center">
                        <Icon
                          :name="row.enterprise ? 'ph:check-circle' : 'ph:x-circle'"
                          class="size-5"
                          :class="row.enterprise ? 'text-emerald-500' : 'text-muted-foreground/50'"
                        />
                      </span>
                    </template>
                    <template v-else>{{ row.enterprise }}</template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="border-border">
      <div
        class="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12 lg:px-8"
      >
        <div>
          <p class="text-primary mb-2 text-xs font-semibold tracking-[0.2em] uppercase">FAQ</p>
          <h2 class="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            Frequently<br class="hidden sm:block" />
            asked questions.
          </h2>
        </div>

        <div
          class="border-border bg-card/40 divide-border divide-y overflow-hidden rounded-2xl border shadow-sm"
        >
          <details v-for="item in faqItems" :key="item.q" class="group px-5 py-5 sm:px-6">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium"
            >
              <span class="text-left">{{ item.q }}</span>
              <Icon
                name="ph:caret-down"
                class="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-180"
              />
            </summary>
            <p class="text-muted-foreground pt-4 text-base leading-relaxed">
              {{ item.a }}
            </p>
          </details>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
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
