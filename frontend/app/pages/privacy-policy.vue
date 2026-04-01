<script setup lang="ts">
import LegalDocumentShell from '@/components/legal/LegalDocumentShell.vue'
import type { LegalTocItem } from '@/components/legal/legal-doc'

definePageMeta({
  layout: 'landing',
})

const { t } = useI18n()

const formattedDate = computed(() =>
  new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
)

const tocItems = computed<LegalTocItem[]>(() => [
  { id: 'privacy-intro', label: t('legal.privacy.introduction') },
  { id: 'privacy-collection', label: t('legal.privacy.dataCollection') },
  { id: 'privacy-usage', label: t('legal.privacy.dataUsage') },
  { id: 'privacy-sharing', label: t('legal.privacy.dataSharing') },
  { id: 'privacy-security', label: t('legal.privacy.dataSecurity') },
  { id: 'privacy-rights', label: t('legal.privacy.userRights') },
  { id: 'privacy-cookies', label: t('legal.privacy.cookies') },
  { id: 'privacy-changes', label: t('legal.privacy.changes') },
  { id: 'privacy-contact', label: t('legal.privacy.contact') },
])
</script>

<template>
  <LegalDocumentShell
    :title="t('legal.privacyPolicy')"
    :last-updated="formattedDate"
    :effective-date="formattedDate"
    :toc-items="tocItems"
  >
    <section id="privacy-intro" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.privacy.introduction') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.privacy.introText') }}
      </p>
    </section>

    <section id="privacy-collection" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.privacy.dataCollection') }}
      </h2>
      <p class="text-muted-foreground mb-4 leading-relaxed">
        {{ t('legal.privacy.dataCollectionText') }}
      </p>
      <ul class="text-muted-foreground list-disc space-y-2 pl-6 leading-relaxed">
        <li>{{ t('legal.privacy.dataCollectionItem1') }}</li>
        <li>{{ t('legal.privacy.dataCollectionItem2') }}</li>
        <li>{{ t('legal.privacy.dataCollectionItem3') }}</li>
        <li>{{ t('legal.privacy.dataCollectionItem4') }}</li>
      </ul>
    </section>

    <section id="privacy-usage" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.privacy.dataUsage') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.privacy.dataUsageText') }}
      </p>
    </section>

    <section id="privacy-sharing" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.privacy.dataSharing') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.privacy.dataSharingText') }}
      </p>
    </section>

    <section id="privacy-security" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.privacy.dataSecurity') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.privacy.dataSecurityText') }}
      </p>
    </section>

    <section id="privacy-rights" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.privacy.userRights') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.privacy.userRightsText') }}
      </p>
    </section>

    <section id="privacy-cookies" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.privacy.cookies') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.privacy.cookiesText') }}
      </p>
    </section>

    <section id="privacy-changes" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.privacy.changes') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.privacy.changesText') }}
      </p>
    </section>

    <section id="privacy-contact" class="mb-12">
      <h2 class="text-foreground mb-4 text-xl font-semibold tracking-tight">
        {{ t('legal.privacy.contact') }}
      </h2>
      <p class="text-muted-foreground leading-relaxed">
        {{ t('legal.privacy.contactText') }}
      </p>
    </section>
  </LegalDocumentShell>
</template>
