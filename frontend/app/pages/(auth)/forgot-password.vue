<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toTypeForgotPasswordValidation } from "@/validations/auth"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { t } = useI18n()
const validationSchema = toTypeForgotPasswordValidation()

const onSubmit = (values: any) => {
  console.log("Form submitted:", values)
  // TODO: Implement forgot password logic
}
</script>

<template>
  <div class="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <div :class="cn('flex flex-col gap-6')">
        <Card class="overflow-hidden p-0">
          <CardContent class="p-6 md:p-8">
            <Form :validation-schema="validationSchema" class="flex flex-col gap-6" @submit="onSubmit">
              <div class="flex flex-col items-center gap-2 text-center">
                <h1 class="text-2xl font-bold">
                  {{ t("auth.forgotPassword.title") }}
                </h1>
                <p class="text-muted-foreground text-balance">
                  {{ t("auth.forgotPassword.subtitle") }}
                </p>
              </div>
              <FormField v-slot="{ componentField }" name="email">
                <div class="flex flex-col gap-2">
                  <Label for="email">
                    {{ t("auth.forgotPassword.email") }}
                  </Label>
                  <Input id="email" type="email" placeholder="m@example.com" v-bind="componentField" />
                  <InputError name="email" />
                </div>
              </FormField>
              <Button type="submit">
                {{ t("auth.forgotPassword.submit") }}
              </Button>
              <p class="text-center text-sm text-muted-foreground">
                <NuxtLink to="/sign-in" class="underline underline-offset-2">
                  {{ t("auth.forgotPassword.backToSignIn") }}
                </NuxtLink>
              </p>
            </Form>
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
