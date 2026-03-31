<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { toTypeRegisterValidation } from '@/validations/auth'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const { t } = useI18n()
const { signUp, signInWithGoogle } = useAuth()
const { addAlert, clearAllAlerts, getAlert } = useAlert()
const validationSchema = toTypeRegisterValidation()

const isSubmitting = ref(false)
const isGoogleSubmitting = ref(false)

const onSubmit = async (values: any) => {
  if (isSubmitting.value) return

  clearAllAlerts()
  isSubmitting.value = true
  try {
    const result = await signUp(values.name, values.email, values.password)
    if (!result.success) {
      addAlert('sign-up', {
        title: result.error?.message || t('errors.generic'),
        status: 'error',
      })
    }

    addAlert('sign-in', {
      title: t('auth.register.success'),
      description: t('auth.register.successDescription'),
      status: 'success',
      persistent: true,
    })
    navigateTo('/sign-in')
  } catch (error) {
    addAlert('sign-up', {
      title: t('errors.generic'),
      status: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}

const onGoogleSignIn = async () => {
  if (isGoogleSubmitting.value) return

  isGoogleSubmitting.value = true
  try {
    const result = await signInWithGoogle()
    if (!result.success) {
      addAlert('sign-up', {
        title: (result.error as { message?: string })?.message ?? t('errors.generic'),
        status: 'error',
      })
    }
  } finally {
    isGoogleSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm md:max-w-4xl">
      <div :class="cn('flex flex-col gap-6')">
        <Card class="overflow-hidden p-0">
          <CardContent class="grid p-0 md:grid-cols-2">
            <Form :validation-schema="validationSchema" class="p-6 md:p-8" @submit="onSubmit">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col items-center gap-2 text-center">
                  <h1 class="text-2xl font-bold">
                    {{ t('auth.register.title') }}
                  </h1>
                  <p class="text-muted-foreground text-balance">
                    {{ t('auth.register.subtitle') }}
                  </p>
                </div>
                <div v-if="getAlert('sign-up')" class="flex flex-col gap-2">
                  <Alert :variant="getAlert('sign-up')?.status">
                    <AlertIcon :status="getAlert('sign-up')?.status" />
                    <AlertTitle>{{ getAlert('sign-up')?.title }}</AlertTitle>
                    <AlertDescription v-if="getAlert('sign-up')?.description">
                      {{ getAlert('sign-up')?.description }}
                    </AlertDescription>
                  </Alert>
                </div>
                <FormField v-slot="{ componentField }" name="name">
                  <div class="flex flex-col gap-2">
                    <Label for="name">
                      {{ t('auth.register.name') }}
                    </Label>
                    <Input id="name" type="text" placeholder="John Doe" v-bind="componentField" />
                    <InputError name="name" />
                  </div>
                </FormField>
                <FormField v-slot="{ componentField }" name="email">
                  <div class="flex flex-col gap-2">
                    <Label for="email">
                      {{ t('auth.register.email') }}
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
                    <Label for="password">
                      {{ t('auth.register.password') }}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      v-bind="componentField"
                      placeholder="••••••••"
                    />
                    <InputError name="password" />
                  </div>
                </FormField>
                <Button type="submit" :disabled="isSubmitting">
                  {{ isSubmitting ? t('common.loading') : t('auth.register.submit') }}
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
                    isGoogleSubmitting ? t('common.loading') : t('auth.register.continueWithGoogle')
                  }}
                </Button>
                <p class="text-muted-foreground text-center text-sm">
                  {{ t('auth.register.hasAccount') }}
                  <NuxtLink to="/sign-in" class="underline underline-offset-2">
                    {{ t('auth.register.signIn') }}
                  </NuxtLink>
                </p>
              </div>
            </Form>
            <div class="bg-muted relative hidden md:block"></div>
          </CardContent>
        </Card>
        <p class="text-muted-foreground px-6 text-center text-sm">
          {{ t('legal.agreeToTermsPrefix') }}
          <a href="#" class="underline underline-offset-2">{{ t('legal.termsOfService') }}</a>
          and
          <a href="#" class="underline underline-offset-2">{{ t('legal.privacyPolicy') }}</a
          >.
        </p>
      </div>
    </div>
  </div>
</template>
