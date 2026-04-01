<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toTypeForgotPasswordValidation } from '@/validations/auth'
import { useAuth } from '@/composables/services/useAuth'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { t } = useI18n()
const { requestPasswordReset } = useAuth()
const { addAlert, clearAllAlerts, getAlert } = useAlert()
const validationSchema = toTypeForgotPasswordValidation()
const isSubmitting = ref(false)

const onSubmit = async (values: any) => {
  if (isSubmitting.value) return

  clearAllAlerts()
  isSubmitting.value = true
  try {
    const result = await requestPasswordReset(values.email)
    if (result.error) {
      addAlert('forgot-password', {
        title: result.error?.message || t('errors.generic'),
        status: 'error',
      })
      return
    }

    addAlert('forgot-password', {
      title: t('auth.forgotPassword.success'),
      status: 'success',
    })
  } catch (error) {
    addAlert('forgot-password', {
      title: useErrorMessage(error).message,
      status: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}

definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div class="bg-muted relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <div :class="cn('flex flex-col gap-6')">
        <Card class="overflow-hidden p-0">
          <CardContent class="p-6 md:p-8">
            <Form
              :validation-schema="validationSchema"
              class="flex flex-col gap-6"
              @submit="onSubmit"
            >
              <div class="flex flex-col items-center gap-2 text-center">
                <h1 class="text-2xl font-bold">
                  {{ t('auth.forgotPassword.title') }}
                </h1>
                <p class="text-muted-foreground text-balance">
                  {{ t('auth.forgotPassword.subtitle') }}
                </p>
              </div>
              <div v-if="getAlert('forgot-password')" class="flex flex-col gap-2">
                <Alert :variant="getAlert('forgot-password')?.status">
                  <AlertIcon :status="getAlert('forgot-password')?.status" />
                  <AlertTitle>{{ getAlert('forgot-password')?.title }}</AlertTitle>
                  <AlertDescription v-if="getAlert('forgot-password')?.description">
                    {{ getAlert('forgot-password')?.description }}
                  </AlertDescription>
                </Alert>
              </div>
              <FormField v-slot="{ componentField }" name="email">
                <div class="flex flex-col gap-2">
                  <Label for="email">
                    {{ t('auth.forgotPassword.email') }}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    v-bind="componentField"
                  />
                  <InputError name="email" />
                </div>
              </FormField>
              <Button type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? t('common.loading') : t('auth.forgotPassword.submit') }}
              </Button>
              <p class="text-muted-foreground text-center text-sm">
                <NuxtLink to="/sign-in" class="underline underline-offset-2">
                  {{ t('auth.forgotPassword.backToSignIn') }}
                </NuxtLink>
              </p>
            </Form>
          </CardContent>
        </Card>
        <p class="text-muted-foreground px-6 text-center text-sm">
          {{ t('legal.agreeToTermsPrefix') }}
          <NuxtLink to="/terms-of-service" class="underline underline-offset-2">{{
            t('legal.termsOfService')
          }}</NuxtLink>
          and
          <NuxtLink to="/privacy-policy" class="underline underline-offset-2">{{
            t('legal.privacyPolicy')
          }}</NuxtLink
          >.
        </p>
      </div>
    </div>
  </div>
</template>
