<script setup lang="ts">
import LegalDocumentShell from '@/components/use/legal/LegalDocumentShell.vue'
import type { LegalTocItem } from '~/components/use/legal/legal-doc'

definePageMeta({
  layout: 'landing',
})

const { t } = useI18n()

const formattedDate = computed(() =>
  new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
)

const tocItems = computed<LegalTocItem[]>(() => [
  { id: 'terms-acceptance', label: t('legal.terms.acceptance') },
  { id: 'terms-use', label: t('legal.terms.useOfService') },
  { id: 'terms-accounts', label: t('legal.terms.userAccounts') },
  { id: 'terms-ip', label: t('legal.terms.intellectualProperty') },
  { id: 'terms-user-content', label: t('legal.terms.userContent') },
  { id: 'terms-prohibited', label: t('legal.terms.prohibitedActivities') },
  { id: 'terms-termination', label: t('legal.terms.termination') },
  { id: 'terms-disclaimers', label: t('legal.terms.disclaimers') },
  { id: 'terms-liability', label: t('legal.terms.limitationOfLiability') },
  { id: 'terms-changes', label: t('legal.terms.changes') },
  { id: 'terms-contact', label: t('legal.terms.contact') },
])
</script>

<template>
  <LegalDocumentShell
    :title="t('legal.termsOfService')"
    :last-updated="formattedDate"
    :effective-date="formattedDate"
    :toc-items="tocItems"
  >
    <p
      class="border-primary/60 text-muted-foreground mb-12 border-l-2 pl-4 text-xs leading-relaxed font-semibold tracking-wide uppercase"
    >
      {{ t('legal.terms.importantNotice') }}
    </p>

    <section id="terms-acceptance" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.acceptance') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.acceptanceText') }}
      </p>
    </section>

    <section id="terms-use" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.useOfService') }}
      </h2>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        {{ t('legal.terms.useOfServiceText') }}
      </p>
      <ul class="text-muted-foreground list-disc space-y-2 pl-6 leading-relaxed">
        <li>{{ t('legal.terms.useOfServiceItem1') }}</li>
        <li>{{ t('legal.terms.useOfServiceItem2') }}</li>
        <li>{{ t('legal.terms.useOfServiceItem3') }}</li>
        <li>{{ t('legal.terms.useOfServiceItem4') }}</li>
      </ul>
    </section>

    <section id="terms-accounts" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.userAccounts') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.userAccountsText') }}
      </p>
    </section>

    <section id="terms-ip" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.intellectualProperty') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.intellectualPropertyText') }}
      </p>
    </section>

    <section id="terms-user-content" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.userContent') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.userContentText') }}
      </p>
    </section>

    <section id="terms-prohibited" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.prohibitedActivities') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.prohibitedActivitiesText') }}
      </p>
    </section>

    <section id="terms-termination" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.termination') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.terminationText') }}
      </p>
    </section>

    <section id="terms-disclaimers" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.disclaimers') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.disclaimersText') }}
      </p>
    </section>

    <section id="terms-liability" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.limitationOfLiability') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.limitationOfLiabilityText') }}
      </p>
    </section>

    <section id="terms-changes" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.changes') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.changesText') }}
      </p>
    </section>

    <section id="terms-contact" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.terms.contact') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.terms.contactText') }}
      </p>
    </section>
  </LegalDocumentShell>
</template>
