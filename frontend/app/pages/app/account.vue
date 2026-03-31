<script setup lang="ts">
import {
  toTypeAccountProfileValidation,
  toTypeChangePasswordValidation,
  toTypeSetPasswordValidation,
} from '@/validations/auth'

const { t } = useI18n()
const {
  getSession,
  updateAccount,
  changePassword,
  setPassword,
  uploadAvatar,
  getAvatarSignedUrl,
  listUserAccounts,
  linkSocialAccount,
  unlinkAccount,
  sendDeleteAccountVerification,
} = useAuth()
const { addAlert, clearAllAlerts, getAlert } = useAlert()

type ProviderAccount = {
  providerId: string
  accountId?: string
}

type ProviderOption = {
  id: string
  label: string
  supportsLink: boolean
}

const profileValidationSchema = toTypeAccountProfileValidation()
const changePasswordValidationSchema = toTypeChangePasswordValidation()
const setPasswordValidationSchema = toTypeSetPasswordValidation()

const isLoading = ref(true)
const isSavingProfile = ref(false)
const isChangingPassword = ref(false)
const isSettingPassword = ref(false)
const isLoadingAccounts = ref(false)
const isDeletingAccount = ref(false)

const user = useState<{ name: string; email: string; image?: string | null } | null>(
  'auth-user',
  () => null
)
const linkedAccounts = ref<ProviderAccount[]>([])
const providerActionLoading = ref<Record<string, boolean>>({})
const availableSocialProviders = ref<ProviderOption[]>([
  { id: 'google', label: 'Google', supportsLink: true },
])

const profileInitialValues = ref({
  name: '',
  email: '',
})
const profileFormKey = computed(
  () => `${profileInitialValues.value.name}-${profileInitialValues.value.email}`
)

const dangerForm = ref({
  confirmText: '',
})

const selectedAvatarFile = ref<File | null>(null)
const selectedAvatarPreviewUrl = ref<string | null>(null)
const activeTab = ref<'profile' | 'security' | 'connections' | 'danger'>('profile')

const avatarPreview = computed(() => selectedAvatarPreviewUrl.value || user.value?.image || '')
const hasPasswordCredential = computed(() =>
  linkedAccounts.value.some(account =>
    ['credential', 'email-password', 'email'].includes(
      String(account.providerId || '').toLowerCase()
    )
  )
)
const canDeleteAccount = computed(
  () => dangerForm.value.confirmText.trim().toUpperCase() === 'DELETE'
)
const providerOptions = computed<ProviderOption[]>(() => {
  const options = new Map<string, ProviderOption>()

  for (const provider of availableSocialProviders.value) {
    options.set(provider.id.toLowerCase(), provider)
  }

  for (const linked of linkedAccounts.value) {
    const id = String(linked.providerId || '').toLowerCase()
    if (!id || options.has(id)) continue
    options.set(id, {
      id,
      label: id === 'credential' ? 'Password' : linked.providerId,
      supportsLink: id !== 'credential',
    })
  }

  return Array.from(options.values())
})

const setAlertError = (error: unknown) => {
  addAlert('account', {
    title: useErrorMessage(error, t('errors.generic')).message,
    status: 'error',
  })
}

const resolveAvatarUrl = async (value?: string | null) => {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  const result = await getAvatarSignedUrl(value)
  if (!result.success) return null
  return result.data.url
}

const loadAccounts = async () => {
  isLoadingAccounts.value = true
  try {
    const result = await listUserAccounts()
    if (!result.success) {
      return
    }
    linkedAccounts.value = (result.data as ProviderAccount[]) ?? []
  } finally {
    isLoadingAccounts.value = false
  }
}

const loadSession = async () => {
  isLoading.value = true
  try {
    const session = await getSession()
    if (!session?.data?.user) {
      addAlert('account', {
        title: t('errors.unauthorized'),
        status: 'error',
      })
      return
    }

    const sessionUser = {
      name: session.data.user.name ?? '',
      email: session.data.user.email ?? '',
      image: (await resolveAvatarUrl(session.data.user.image ?? null)) ?? null,
    }
    user.value = sessionUser
    profileInitialValues.value = {
      name: sessionUser.name,
      email: sessionUser.email,
    }
  } catch (error) {
    setAlertError(error)
  } finally {
    isLoading.value = false
  }
}

const onSaveProfile = async (values: any) => {
  if (isSavingProfile.value) return
  clearAllAlerts()
  isSavingProfile.value = true
  try {
    let uploadedAvatarUrl: string | undefined
    let uploadedAvatarKey: string | undefined
    if (selectedAvatarFile.value) {
      const uploadResult = await uploadAvatar(selectedAvatarFile.value)
      if (!uploadResult.success) {
        addAlert('account', {
          title: (uploadResult.error as { message?: string })?.message ?? t('errors.generic'),
          status: 'error',
        })
        return
      }
      uploadedAvatarUrl = uploadResult.data.url
      uploadedAvatarKey = uploadResult.data.key
    }

    const result = await updateAccount({
      name: values.name.trim(),
      image: uploadedAvatarKey,
    })
    if (!result.success) {
      addAlert('account', {
        title: (result.error as { message?: string })?.message ?? t('errors.generic'),
        status: 'error',
      })
      return
    }
    user.value = {
      name: values.name.trim(),
      email: user.value?.email ?? '',
      image: uploadedAvatarUrl ?? user.value?.image ?? null,
    }
    selectedAvatarFile.value = null
    selectedAvatarPreviewUrl.value = null
    addAlert('account', {
      title: t('account.profile.success'),
      status: 'success',
    })
  } catch (error) {
    setAlertError(error)
  } finally {
    isSavingProfile.value = false
  }
}

const onChangePassword = async (values: any) => {
  if (!hasPasswordCredential.value) return
  if (isChangingPassword.value) return
  clearAllAlerts()
  isChangingPassword.value = true
  try {
    const result = await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: false,
    })
    if (!result.success) {
      addAlert('account', {
        title: (result.error as { message?: string })?.message ?? t('errors.generic'),
        status: 'error',
      })
      return
    }
    addAlert('account', {
      title: t('account.password.success'),
      status: 'success',
    })
  } finally {
    isChangingPassword.value = false
  }
}

const onSetPassword = async (values: any) => {
  if (hasPasswordCredential.value || isSettingPassword.value) return
  clearAllAlerts()
  isSettingPassword.value = true
  try {
    const result = await setPassword(values.newPassword)
    if (!result.success) {
      addAlert('account', {
        title: (result.error as { message?: string })?.message ?? t('errors.generic'),
        status: 'error',
      })
      return
    }
    await loadAccounts()
    addAlert('account', {
      title: 'Password has been set successfully.',
      status: 'success',
    })
  } finally {
    isSettingPassword.value = false
  }
}

const isProviderLinked = (providerId: string) =>
  linkedAccounts.value.some(
    account => String(account.providerId || '').toLowerCase() === providerId.toLowerCase()
  )

const onToggleProviderLink = async (providerId: string) => {
  const id = providerId.toLowerCase()
  if (providerActionLoading.value[id]) return

  providerActionLoading.value[id] = true
  try {
    const result = await linkSocialAccount(id)
    if (!result.success) {
      addAlert('account', {
        title: (result.error as { message?: string })?.message ?? t('errors.generic'),
        status: 'error',
      })
      return
    }

    await loadAccounts()
    addAlert('account', {
      title: t('account.connected.linked'),
      status: 'success',
    })
  } finally {
    providerActionLoading.value[id] = false
  }
}

const onConfirmUnlinkProvider = async (providerId: string) => {
  const id = providerId.toLowerCase()
  const linked = linkedAccounts.value.find(
    account => String(account.providerId || '').toLowerCase() === id
  )
  if (!linked || providerActionLoading.value[id]) return

  providerActionLoading.value[id] = true
  try {
    await onUnlinkAccount(linked.providerId, linked.accountId)
  } finally {
    providerActionLoading.value[id] = false
  }
}

const onUnlinkAccount = async (providerId: string, accountId?: string) => {
  const result = await unlinkAccount(providerId, accountId)
  if (!result.success) {
    addAlert('account', {
      title: (result.error as { message?: string })?.message ?? t('errors.generic'),
      status: 'error',
    })
    return
  }
  await loadAccounts()
  addAlert('account', {
    title: t('account.connected.unlinked'),
    status: 'success',
  })
}

const onDeleteAccount = async () => {
  if (isDeletingAccount.value || !canDeleteAccount.value) return
  clearAllAlerts()
  isDeletingAccount.value = true
  try {
    const result = await sendDeleteAccountVerification()
    if (!result.success) {
      addAlert('account', {
        title: (result.error as { message?: string })?.message ?? t('errors.generic'),
        status: 'error',
      })
      return
    }
    addAlert('account', {
      title: t('account.danger.verificationSent'),
      description: t('account.danger.verificationSentDescription'),
      status: 'success',
    })
  } finally {
    isDeletingAccount.value = false
  }
}

const onAvatarSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    addAlert('account', {
      title: t('account.avatar.invalidType'),
      status: 'error',
    })
    return
  }
  selectedAvatarFile.value = file
  selectedAvatarPreviewUrl.value = URL.createObjectURL(file)
}

onMounted(async () => {
  await Promise.all([loadSession(), loadAccounts()])
})
</script>

<template>
  <div class="mx-auto w-full max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold">{{ t('account.title') }}</h1>
      <p class="text-muted-foreground mt-1 text-sm">{{ t('account.subtitle') }}</p>
    </div>

    <div v-if="getAlert('account')" class="flex flex-col gap-2">
      <Alert :variant="getAlert('account')?.status">
        <AlertIcon :status="getAlert('account')?.status" />
        <AlertTitle>{{ getAlert('account')?.title }}</AlertTitle>
        <AlertDescription v-if="getAlert('account')?.description">
          {{ getAlert('account')?.description }}
        </AlertDescription>
      </Alert>
    </div>

    <Tabs v-model="activeTab" class="space-y-5">
      <TabsList class="grid h-auto w-full grid-cols-2 gap-2 p-1 md:grid-cols-4">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="connections">Connections</TabsTrigger>
        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardContent>
            <div class="mb-4">
              <h2 class="text-lg font-semibold">{{ t('account.profile.title') }}</h2>
              <p class="text-muted-foreground text-sm">{{ t('account.profile.description') }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-4 rounded-lg border p-4">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="avatar preview"
                  class="h-16 w-16 rounded-full border object-cover"
                />
                <div
                  v-else
                  class="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-full border text-xs"
                >
                  No Photo
                </div>
                <div class="flex-1 space-y-2">
                  <Label for="avatar">{{ t('account.avatar.label') }}</Label>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    :disabled="isLoading || isSavingProfile"
                    @change="onAvatarSelected"
                  />
                </div>
              </div>

              <Form
                :key="profileFormKey"
                :validation-schema="profileValidationSchema"
                :initial-values="profileInitialValues"
                @submit="onSaveProfile"
              >
                <div class="space-y-4">
                  <FormField v-slot="{ componentField }" name="name">
                    <div class="flex flex-col gap-2">
                      <Label for="account-name">{{ t('auth.register.name') }}</Label>
                      <Input
                        id="account-name"
                        type="text"
                        :disabled="isLoading || isSavingProfile"
                        v-bind="componentField"
                      />
                      <InputError name="name" />
                    </div>
                  </FormField>

                  <FormField v-slot="{ componentField }" name="email">
                    <div class="flex flex-col gap-2">
                      <Label for="account-email">{{ t('auth.login.email') }}</Label>
                      <Input
                        id="account-email"
                        type="email"
                        :disabled="true"
                        v-bind="componentField"
                      />
                      <InputError name="email" />
                    </div>
                  </FormField>

                  <Button type="submit" :disabled="isLoading || isSavingProfile">
                    {{ isSavingProfile ? t('common.loading') : t('common.save') }}
                  </Button>
                </div>
              </Form>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <div class="space-y-4">
          <Card>
            <CardContent>
              <div class="mb-4">
                <h2 class="text-lg font-semibold">
                  {{ hasPasswordCredential ? t('auth.changePassword.title') : 'Set password' }}
                </h2>
                <p class="text-muted-foreground text-sm">
                  {{
                    hasPasswordCredential
                      ? t('auth.changePassword.subtitle')
                      : `
                  This account has no password credential yet. Set a password to enable
                  email/password sign in.`
                  }}
                </p>
              </div>
              <template v-if="hasPasswordCredential">
                <Form
                  :validation-schema="changePasswordValidationSchema"
                  :initial-values="{ currentPassword: '', newPassword: '', confirmNewPassword: '' }"
                  @submit="onChangePassword"
                >
                  <div class="space-y-4">
                    <FormField v-slot="{ componentField }" name="currentPassword">
                      <div class="flex flex-col gap-2">
                        <Label for="current-password">{{
                          t('auth.changePassword.currentPassword')
                        }}</Label>
                        <Input
                          id="current-password"
                          type="password"
                          :disabled="isChangingPassword"
                          v-bind="componentField"
                        />
                        <InputError name="currentPassword" />
                      </div>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="newPassword">
                      <div class="flex flex-col gap-2">
                        <Label for="new-password">{{ t('auth.changePassword.newPassword') }}</Label>
                        <Input
                          id="new-password"
                          type="password"
                          :disabled="isChangingPassword"
                          v-bind="componentField"
                        />
                        <InputError name="newPassword" />
                      </div>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="confirmNewPassword">
                      <div class="flex flex-col gap-2">
                        <Label for="confirm-new-password">{{
                          t('auth.changePassword.confirmNewPassword')
                        }}</Label>
                        <Input
                          id="confirm-new-password"
                          type="password"
                          :disabled="isChangingPassword"
                          v-bind="componentField"
                        />
                        <InputError name="confirmNewPassword" />
                      </div>
                    </FormField>
                    <Button type="submit" :disabled="isChangingPassword">
                      {{
                        isChangingPassword ? t('common.loading') : t('auth.changePassword.submit')
                      }}
                    </Button>
                  </div>
                </Form>
              </template>
              <div v-else>
                <Form
                  :validation-schema="setPasswordValidationSchema"
                  :initial-values="{ newPassword: '', confirmNewPassword: '' }"
                  @submit="onSetPassword"
                >
                  <div class="space-y-4">
                    <FormField v-slot="{ componentField }" name="newPassword">
                      <div class="flex flex-col gap-2">
                        <Label for="set-new-password">{{
                          t('auth.changePassword.newPassword')
                        }}</Label>
                        <Input
                          id="set-new-password"
                          type="password"
                          :disabled="isSettingPassword"
                          v-bind="componentField"
                        />
                        <InputError name="newPassword" />
                      </div>
                    </FormField>
                    <FormField v-slot="{ componentField }" name="confirmNewPassword">
                      <div class="flex flex-col gap-2">
                        <Label for="set-confirm-password">{{
                          t('auth.changePassword.confirmNewPassword')
                        }}</Label>
                        <Input
                          id="set-confirm-password"
                          type="password"
                          :disabled="isSettingPassword"
                          v-bind="componentField"
                        />
                        <InputError name="confirmNewPassword" />
                      </div>
                    </FormField>
                    <Button type="submit" :disabled="isSettingPassword">
                      {{ isSettingPassword ? t('common.loading') : 'Set password' }}
                    </Button>
                  </div>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="connections">
        <Card>
          <CardContent>
            <div class="mb-4">
              <h2 class="text-lg font-semibold">{{ t('account.connected.title') }}</h2>
              <p class="text-muted-foreground text-sm">{{ t('account.connected.description') }}</p>
            </div>
            <div v-if="isLoadingAccounts" class="text-muted-foreground text-sm">
              {{ t('common.loading') }}
            </div>
            <div v-else-if="!providerOptions.length" class="text-muted-foreground text-sm">
              {{ t('account.connected.empty') }}
            </div>
            <div v-else class="flex flex-col gap-2">
              <div
                v-for="provider in providerOptions"
                :key="provider.id"
                class="flex items-center justify-between rounded-md border p-3"
              >
                <div class="flex flex-col">
                  <span class="text-sm font-medium capitalize">{{ provider.label }}</span>
                  <span class="text-muted-foreground text-xs">
                    {{
                      isProviderLinked(provider.id)
                        ? t('account.connected.connected')
                        : t('account.connected.notConnected')
                    }}
                  </span>
                </div>
                <template v-if="provider.supportsLink">
                  <template v-if="isProviderLinked(provider.id)">
                    <Popover>
                      <PopoverTrigger as-child>
                        <Button
                          variant="destructive"
                          size="sm"
                          :disabled="providerActionLoading[provider.id]"
                        >
                          {{
                            providerActionLoading[provider.id]
                              ? t('common.loading')
                              : t('account.connected.unlink')
                          }}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent class="w-72">
                        <div class="space-y-3">
                          <p class="mb-0 text-sm font-medium">
                            Unlink {{ provider.label }} account?
                          </p>
                          <p class="text-muted-foreground text-xs">
                            You can link this provider again later.
                          </p>
                          <div class="flex justify-start gap-2">
                            <PopoverClose as-child>
                              <Button variant="outline" size="sm">{{ t('common.cancel') }}</Button>
                            </PopoverClose>
                            <PopoverClose as-child>
                              <Button
                                variant="destructive"
                                size="sm"
                                :disabled="providerActionLoading[provider.id]"
                                @click="onConfirmUnlinkProvider(provider.id)"
                              >
                                {{
                                  providerActionLoading[provider.id]
                                    ? t('common.loading')
                                    : t('account.connected.unlink')
                                }}
                              </Button>
                            </PopoverClose>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </template>
                  <Button
                    v-else
                    variant="outline"
                    size="sm"
                    :disabled="providerActionLoading[provider.id]"
                    @click="onToggleProviderLink(provider.id)"
                  >
                    {{
                      providerActionLoading[provider.id]
                        ? t('common.loading')
                        : t('account.connected.link')
                    }}
                  </Button>
                </template>
                <span v-else class="text-muted-foreground text-xs">
                  {{ t('account.connected.noAction') }}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="danger">
        <Card class="border-destructive/50 bg-destructive/1">
          <CardContent>
            <div class="mb-4">
              <h2 class="text-destructive text-lg font-semibold">
                {{ t('account.danger.title') }}
              </h2>
              <p class="text-muted-foreground text-sm">{{ t('account.danger.description') }}</p>
            </div>
            <div class="mb-4 flex flex-col gap-2">
              <Label for="delete-confirm">{{ t('account.danger.confirmLabel') }}</Label>
              <Input
                id="delete-confirm"
                class="capitalize"
                v-model="dangerForm.confirmText"
                :placeholder="t('account.danger.confirmPlaceholder')"
                :disabled="isDeletingAccount"
              />
            </div>
            <Button
              variant="destructive"
              :disabled="!canDeleteAccount || isDeletingAccount"
              @click="onDeleteAccount"
            >
              {{ isDeletingAccount ? t('common.loading') : t('account.danger.sendVerification') }}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
