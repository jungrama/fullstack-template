<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toTypeResetPasswordWithTokenValidation } from '@/validations/auth'
import { useAuth } from '@/composables/services/useAuth'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { resetPassword } = useAuth()
const { addAlert, clearAllAlerts, getAlert } = useAlert()
const validationSchema = toTypeResetPasswordWithTokenValidation()

const isSubmitting = ref(false)

const resetToken = computed(() => {
  const token = route.query.token
  return typeof token === 'string' ? token : ''
})

onMounted(() => {
  if (!resetToken.value) {
    addAlert('reset-password', {
      title: t('auth.resetPassword.invalidToken'),
      status: 'error',
      persistent: true,
    })
  }
})

const onSubmit = async (values: any) => {
  if (!resetToken.value) {
    addAlert('reset-password', {
      title: t('auth.resetPassword.invalidToken'),
      status: 'error',
      persistent: true,
    })
    return
  }

  if (isSubmitting.value) return

  clearAllAlerts()
  isSubmitting.value = true
  try {
    const result = await resetPassword(resetToken.value, values.password)
    if (result.error) {
      addAlert('reset-password', {
        title: result.error?.message || t('errors.generic'),
        status: 'error',
      })
      return
    }

    addAlert('reset-password', {
      title: t('auth.resetPassword.success'),
      status: 'success',
      persistent: true,
    })

    await router.push('/sign-in')
  } catch (error) {
    addAlert('reset-password', {
      title: useErrorMessage(error, t('errors.generic')).message,
      status: 'error',
    })
  } finally {
    isSubmitting.value = false
  }
}
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
                  {{ t('auth.resetPassword.title') }}
                </h1>
                <p class="text-muted-foreground text-balance">
                  {{ t('auth.resetPassword.subtitle') }}
                </p>
              </div>
              <div v-if="getAlert('reset-password')" class="flex flex-col gap-2">
                <Alert :variant="getAlert('reset-password')?.status">
                  <AlertIcon :status="getAlert('reset-password')?.status" />
                  <AlertTitle>{{ getAlert('reset-password')?.title }}</AlertTitle>
                  <AlertDescription v-if="getAlert('reset-password')?.description">
                    {{ getAlert('reset-password')?.description }}
                  </AlertDescription>
                </Alert>
              </div>
              <FormField v-slot="{ componentField }" name="password">
                <div class="flex flex-col gap-2">
                  <Label for="password">
                    {{ t('auth.resetPassword.password') }}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    v-bind="componentField"
                  />
                  <InputError name="password" />
                </div>
              </FormField>
              <FormField v-slot="{ componentField }" name="confirmPassword">
                <div class="flex flex-col gap-2">
                  <Label for="confirmPassword">
                    {{ t('auth.resetPassword.confirmPassword') }}
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    v-bind="componentField"
                  />
                  <InputError name="confirmPassword" />
                </div>
              </FormField>
              <Button type="submit" :disabled="isSubmitting || !resetToken">
                {{ isSubmitting ? t('common.loading') : t('auth.resetPassword.submit') }}
              </Button>
              <p class="text-muted-foreground text-center text-sm">
                <NuxtLink to="/sign-in" class="underline underline-offset-2">
                  {{ t('auth.forgotPassword.backToSignIn') }}
                </NuxtLink>
              </p>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
