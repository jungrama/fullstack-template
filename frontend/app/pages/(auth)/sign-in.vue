<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toTypeLoginValidation } from '@/validations/auth'
import { useAuth } from '@/composables/services/useAuth'

const { t } = useI18n()
const { signIn, signInWithGoogle, resendVerificationEmail } = useAuth()
const { addAlert, clearAllAlerts, getAlert } = useAlert()
const validationSchema = toTypeLoginValidation()

const isSubmitting = ref(false)
const isResendingVerification = ref(false)
const isGoogleSubmitting = ref(false)
const emailPendingVerification = ref<string | null>(null)

const onSubmit = async (values: any) => {
  if (isSubmitting.value) return

  clearAllAlerts()
  emailPendingVerification.value = null
  isSubmitting.value = true
  try {
    const rememberMe: boolean = values.rememberMe === undefined ? true : !!values.rememberMe
    const result = await signIn(values.email, values.password, rememberMe)
    if (result.error) {
      const err = result.error as { code?: string; message?: string } | undefined
      if (err?.code === 'EMAIL_NOT_VERIFIED') {
        emailPendingVerification.value = values.email
        addAlert('sign-in', {
          title: err.message ?? t('auth.login.emailNotVerified'),
          status: 'warning',
        })
        return
      }
      throw new Error(err?.message ?? t('errors.generic'))
    }
  } catch (error) {
    addAlert('sign-in', {
      title: useErrorMessage(error, t('errors.generic')).message,
      status: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}

const onResendVerification = async () => {
  const email = emailPendingVerification.value
  if (!email || isResendingVerification.value) return

  isResendingVerification.value = true
  try {
    const result = await resendVerificationEmail(email)
    if (result.error) {
      addAlert('sign-in', {
        title: (result.error as { message?: string })?.message ?? t('errors.generic'),
        status: 'error',
      })
      return
    }
    addAlert('sign-in', {
      title: t('auth.login.resendVerificationSuccess'),
      status: 'success',
    })
    emailPendingVerification.value = null
  } catch (error) {
    addAlert('sign-in', {
      title: useErrorMessage(error, t('errors.generic')).message,
      status: 'error',
    })
  } finally {
    isResendingVerification.value = false
  }
}

const onGoogleSignIn = async () => {
  if (isGoogleSubmitting.value) return

  isGoogleSubmitting.value = true
  try {
    const result = await signInWithGoogle()
    if (result.error) {
      addAlert('sign-in', {
        title: (result.error as { message?: string })?.message ?? t('errors.generic'),
        status: 'error',
      })
    }
  } catch (error) {
    addAlert('sign-in', {
      title: useErrorMessage(error, t('errors.generic')).message,
      status: 'error',
    })
  } finally {
    isGoogleSubmitting.value = false
  }
}

onUnmounted(() => {
  clearAllAlerts()
})
</script>

<template>
  <div class="bg-muted relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm md:max-w-4xl">
      <div :class="cn('flex flex-col gap-4')">
        <Card class="overflow-hidden p-0">
          <CardContent class="grid p-0 md:grid-cols-2">
            <Form
              :validation-schema="validationSchema"
              :initial-values="{ rememberMe: true }"
              class="p-6 md:p-8"
              @submit="onSubmit"
            >
              <div class="flex flex-col gap-4">
                <div class="flex flex-col items-center gap-2 text-center">
                  <h1 class="text-2xl font-bold">
                    {{ t('auth.login.title') }}
                  </h1>
                  <p class="text-muted-foreground text-balance">
                    {{ t('auth.login.subtitle') }}
                  </p>
                </div>
                <div v-if="getAlert('sign-in')" class="flex flex-col gap-2">
                  <Alert :variant="getAlert('sign-in')?.status">
                    <AlertIcon :status="getAlert('sign-in')?.status" />
                    <AlertTitle>{{ getAlert('sign-in')?.title }}</AlertTitle>
                    <AlertDescription v-if="getAlert('sign-in')?.description">
                      {{ getAlert('sign-in')?.description }}
                    </AlertDescription>
                    <AlertDescription v-if="emailPendingVerification" class="text-foreground">
                      <button
                        type="button"
                        class="text-primary font-medium underline-offset-4 hover:underline"
                        :disabled="isResendingVerification"
                        @click="onResendVerification"
                      >
                        {{
                          isResendingVerification
                            ? t('common.loading')
                            : t('auth.login.resendVerification')
                        }}
                      </button>
                    </AlertDescription>
                  </Alert>
                </div>
                <FormField v-slot="{ componentField }" name="email">
                  <div class="flex flex-col gap-2">
                    <Label for="email">
                      {{ t('auth.login.email') }}
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
                <FormField v-slot="{ componentField }" name="password">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center">
                      <Label for="password">
                        {{ t('auth.login.password') }}
                      </Label>
                      <NuxtLink
                        to="/forgot-password"
                        class="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        {{ t('auth.login.forgotPassword') }}
                      </NuxtLink>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      v-bind="componentField"
                      placeholder="••••••••"
                    />
                    <InputError name="password" />
                  </div>
                </FormField>
                <FormField v-slot="{ value, handleChange }" name="rememberMe">
                  <div class="flex items-center gap-2">
                    <Checkbox :checked="value" @update:checked="handleChange" id="rememberMe" />
                    <Label for="rememberMe" class="cursor-pointer text-sm font-normal">
                      {{ t('auth.login.rememberMe') }}
                    </Label>
                  </div>
                </FormField>
                <Button type="submit" :disabled="isSubmitting">
                  {{ isSubmitting ? t('common.loading') : t('auth.login.submit') }}
                </Button>
                <div class="relative flex items-center gap-4 py-2">
                  <div class="flex-1 border-t" />
                  <span class="text-muted-foreground text-sm">{{
                    t('auth.login.continueWith')
                  }}</span>
                  <div class="flex-1 border-t" />
                </div>
                <Button
                  variant="outline"
                  type="button"
                  :disabled="isGoogleSubmitting"
                  @click="onGoogleSignIn"
                >
                  <Icon name="devicon:google" />
                  {{
                    isGoogleSubmitting ? t('common.loading') : t('auth.login.continueWithGoogle')
                  }}
                </Button>
                <p class="text-muted-foreground text-center text-sm">
                  {{ t('auth.login.noAccount') }}
                  <NuxtLink to="/sign-up" class="underline underline-offset-2">
                    {{ t('auth.login.signUp') }}
                  </NuxtLink>
                </p>
              </div>
            </Form>
            <div class="bg-muted relative hidden md:block"></div>
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
