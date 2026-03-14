<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toTypeLoginValidation } from "@/validations/auth"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { t } = useI18n()
const { signIn } = useAuth()
const validationSchema = toTypeLoginValidation()

const initialValues = {
  rememberMe: true,
}

const isSubmitting = ref(false)

const onSubmit = async (values: any) => {
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    const result = await signIn(values.email, values.password, values.rememberMe)
    if (!result.success) {
      // Error is already handled in the composable with toast
      console.error("Sign in failed:", result.error)
    }
  } catch (error) {
    console.error("Unexpected error during sign in:", error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm md:max-w-4xl">
      <div :class="cn('flex flex-col gap-4')">
        <Card class="overflow-hidden p-0">
          <CardContent class="grid p-0 md:grid-cols-2">
            <Form :validation-schema="validationSchema" :initial-values="initialValues" class="p-6 md:p-8"
              @submit="onSubmit">
              <div class="flex flex-col gap-4">
                <div class="flex flex-col items-center gap-2 text-center">
                  <h1 class="text-2xl font-bold">
                    {{ t("auth.login.title") }}
                  </h1>
                  <p class="text-muted-foreground text-balance">
                    {{ t("auth.login.subtitle") }}
                  </p>
                </div>
                <FormField v-slot="{ componentField }" name="email">
                  <div class="flex flex-col gap-2">
                    <Label for="email">
                      {{ t("auth.login.email") }}
                    </Label>
                    <Input id="email" type="email" placeholder="m@example.com" v-bind="componentField" />
                    <InputError name="email" />
                  </div>
                </FormField>
                <FormField v-slot="{ componentField }" name="password">
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center">
                      <Label for="password">
                        {{ t("auth.login.password") }}
                      </Label>
                      <NuxtLink to="/forgot-password" class="ml-auto text-sm underline-offset-2 hover:underline">
                        {{ t("auth.login.forgotPassword") }}
                      </NuxtLink>
                    </div>
                    <Input id="password" type="password" v-bind="componentField" />
                    <InputError name="password" />
                  </div>
                </FormField>
                <FormField v-slot="{ value, handleChange }" name="rememberMe">
                  <div class="flex items-center gap-2">
                    <Checkbox :checked="value" @update:checked="handleChange" />
                    <Label for="rememberMe" class="text-sm font-normal cursor-pointer">
                      {{ t("auth.login.rememberMe") }}
                    </Label>
                  </div>
                </FormField>
                <Button type="submit" :disabled="isSubmitting">
                  {{ isSubmitting ? t("common.loading") : t("auth.login.submit") }}
                </Button>
                <div class="relative flex items-center gap-4 py-2">
                  <div class="flex-1 border-t" />
                  <span class="text-muted-foreground text-sm">{{ t("auth.login.continueWith") }}</span>
                  <div class="flex-1 border-t" />
                </div>
                <Button variant="outline" type="button">
                  <Icon name="devicon:google" />
                  {{ t("auth.login.continueWithGoogle") }}
                </Button>
                <p class="text-center text-sm text-muted-foreground">
                  {{ t("auth.login.noAccount") }}
                  <NuxtLink to="/sign-up" class="underline underline-offset-2">
                    {{ t("auth.login.signUp") }}
                  </NuxtLink>
                </p>
              </div>
            </Form>
            <div class="bg-muted relative hidden md:block">
            </div>
          </CardContent>
        </Card>
        <p class="px-6 text-center text-sm text-muted-foreground">
          {{ t("legal.agreeToTermsPrefix") }}
          <a href="#" class="underline underline-offset-2">{{ t("legal.termsOfService") }}</a>
          and
          <a href="#" class="underline underline-offset-2">{{ t("legal.privacyPolicy") }}</a>.
        </p>
      </div>
    </div>
  </div>
</template>
