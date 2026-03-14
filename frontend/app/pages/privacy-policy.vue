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
          <Icon name="tabler:shield-lock" class="h-16 w-16 text-primary" />
        </div>
        <h1 class="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
          {{ $t("legal.privacyPolicy") }}
        </h1>
        <p class="text-gray-600">
          {{ $t("legal.lastUpdated") }}: {{ new Date().toLocaleDateString() }}
        </p>
      </div>

      <!-- Content -->
      <div class="prose prose-lg mx-auto max-w-none">
        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:info-circle" class="h-6 w-6 text-primary" />
            {{ $t("legal.privacy.introduction") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.privacy.introText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:database" class="h-6 w-6 text-primary" />
            {{ $t("legal.privacy.dataCollection") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.privacy.dataCollectionText") }}
          </p>
          <ul class="mb-4 ml-6 list-disc space-y-2 text-gray-700">
            <li>{{ $t("legal.privacy.dataCollectionItem1") }}</li>
            <li>{{ $t("legal.privacy.dataCollectionItem2") }}</li>
            <li>{{ $t("legal.privacy.dataCollectionItem3") }}</li>
            <li>{{ $t("legal.privacy.dataCollectionItem4") }}</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:settings" class="h-6 w-6 text-primary" />
            {{ $t("legal.privacy.dataUsage") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.privacy.dataUsageText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:share" class="h-6 w-6 text-primary" />
            {{ $t("legal.privacy.dataSharing") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.privacy.dataSharingText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:lock" class="h-6 w-6 text-primary" />
            {{ $t("legal.privacy.dataSecurity") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.privacy.dataSecurityText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:user-check" class="h-6 w-6 text-primary" />
            {{ $t("legal.privacy.userRights") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.privacy.userRightsText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:cookie" class="h-6 w-6 text-primary" />
            {{ $t("legal.privacy.cookies") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.privacy.cookiesText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:edit" class="h-6 w-6 text-primary" />
            {{ $t("legal.privacy.changes") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.privacy.changesText") }}
          </p>
        </section>

        <section class="mb-8">
          <h2 class="mb-4 flex items-center gap-2 text-2xl font-semibold text-gray-900">
            <Icon name="tabler:mail" class="h-6 w-6 text-primary" />
            {{ $t("legal.privacy.contact") }}
          </h2>
          <p class="mb-4 text-gray-700 leading-relaxed">
            {{ $t("legal.privacy.contactText") }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>
