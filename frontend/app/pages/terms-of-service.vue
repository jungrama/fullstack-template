<script setup lang="ts">
definePageMeta({
  layout: "landing",
})

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-white pt-32 pb-24">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <div class="mb-4 flex justify-center">
          <Icon name="tabler:file-text" class="h-16 w-16 text-primary" />
        </div>
        <h1 class="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
          {{ $t("legal.termsOfService") }}
        </h1>
        <p class="text-gray-600">
          {{ $t("legal.lastUpdated") }}: {{ new Date().toLocaleDateString() }}
        </p>
      </div>

      <!-- Content -->
      <div class="prose prose-lg mx-auto max-w-none">
        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:check" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.acceptance") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.acceptanceText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:apps" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.useOfService") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.useOfServiceText") }}
          </p>
          <ul class="mb-4 ml-6 list-disc space-y-2 text-gray-700">
            <li>{{ $t("legal.terms.useOfServiceItem1") }}</li>
            <li>{{ $t("legal.terms.useOfServiceItem2") }}</li>
            <li>{{ $t("legal.terms.useOfServiceItem3") }}</li>
            <li>{{ $t("legal.terms.useOfServiceItem4") }}</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:user" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.userAccounts") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.userAccountsText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:copyright" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.intellectualProperty") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.intellectualPropertyText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:file-upload" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.userContent") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.userContentText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:ban" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.prohibitedActivities") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.prohibitedActivitiesText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:x" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.termination") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.terminationText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:alert-triangle" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.disclaimers") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.disclaimersText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:shield-off" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.limitationOfLiability") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.limitationOfLiabilityText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:edit" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.changes") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.changesText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:mail" class="h-6 w-6 text-primary" />
            {{ $t("legal.terms.contact") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.terms.contactText") }}
          </p>
        </section>
      </div>

    </div>
  </div>
</template>
