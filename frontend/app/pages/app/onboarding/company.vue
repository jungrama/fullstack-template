<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCompanies } from '@/composables/services/useCompanies'
import { toTypeCreateCompanyValidation } from '@/validations/company'
import { toast } from 'vue-sonner'

definePageMeta({
  middleware: 'auth',
  layout: false,
})

const { t } = useI18n()
const { fetchCompanies, createCompany } = useCompanies()
const validationSchema = toTypeCreateCompanyValidation()

const isSubmitting = ref(false)
const isCheckingCompanies = ref(true)

onMounted(async () => {
  try {
    const list = await fetchCompanies()
    if (list.length > 0) {
      toast.message(t('onboarding.company.alreadyHasCompany'))
      await navigateTo('/app')
    }
  } catch (error) {
    toast.error(useErrorMessage(error).message)
  } finally {
    isCheckingCompanies.value = false
  }
})

const onSubmit = async (values: Record<string, unknown>) => {
  if (isSubmitting.value) return

  const name = typeof values.name === 'string' ? values.name.trim() : ''
  if (!name) return

  isSubmitting.value = true
  try {
    await createCompany(name)
    toast.success(t('onboarding.company.success'))
    await navigateTo('/app')
  } catch (error) {
    toast.error(useErrorMessage(error).message)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-lg flex-col gap-6 py-8">
    <div class="text-center">
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ t('onboarding.company.title') }}
      </h1>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ t('onboarding.company.subtitle') }}
      </p>
    </div>

    <Card v-if="isCheckingCompanies">
      <CardContent class="text-muted-foreground py-10 text-center text-sm">
        {{ t('common.loading') }}
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader>
        <CardTitle>{{ t('onboarding.company.title') }}</CardTitle>
        <CardDescription>{{ t('onboarding.company.subtitle') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form :validation-schema="validationSchema" class="space-y-4" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="name">
            <div class="flex flex-col gap-2">
              <Label for="company-name">{{ t('onboarding.company.name') }}</Label>
              <Input
                id="company-name"
                type="text"
                :placeholder="t('onboarding.company.namePlaceholder')"
                autocomplete="organization"
                v-bind="componentField"
              />
              <InputError name="name" />
            </div>
          </FormField>
          <Button type="submit" class="w-full" :disabled="isSubmitting">
            {{ isSubmitting ? t('common.loading') : t('onboarding.company.submit') }}
          </Button>
        </Form>
      </CardContent>
    </Card>
  </div>
</template>
