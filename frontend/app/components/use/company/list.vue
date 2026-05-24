<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { companyLogoUrl, useCompanies, type UserCompany } from '@/composables/services/useCompanies'
import { cn } from '@/lib/utils'
import { toTypeCreateCompanyValidation } from '@/validations/company'
import { toast } from 'vue-sonner'

const props = withDefaults(
  defineProps<{
    redirectOnSelect?: boolean
    showCreate?: boolean
  }>(),
  {
    redirectOnSelect: true,
    showCreate: true,
  }
)

const emit = defineEmits<{
  select: [company: UserCompany]
}>()

const { t } = useI18n()
const {
  activeCompanyId,
  companies,
  listPending,
  fetchCompanies,
  createCompany,
  uploadCompanyLogo,
  companyWorkspacePath,
} = useCompanies()

const createOpen = ref(false)
const isCreating = ref(false)
const createValidationSchema = toTypeCreateCompanyValidation()
const createLogoFile = ref<File | null>(null)
const createLogoPreview = ref<string | null>(null)
const uploadingCompanyId = ref<string | null>(null)
const logoInputRef = ref<HTMLInputElement | null>(null)
const createLogoInputRef = ref<HTMLInputElement | null>(null)
const logoTargetCompanyId = ref<string | null>(null)

const ICON_PALETTES = [
  'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
] as const

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function hashName(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 1)) % 2147483647
  return h
}

function companyInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
}

function iconPalette(name: string) {
  return ICON_PALETTES[hashName(name) % ICON_PALETTES.length]!
}

function roleLabel(role: UserCompany['role']) {
  return t(`companies.roles.${role}`)
}

function canUploadLogo(company: UserCompany) {
  return company.role === 'owner' || company.role === 'admin'
}

function isSelected(company: UserCompany) {
  return activeCompanyId.value === company.id
}

function revokePreviewUrl() {
  if (createLogoPreview.value) {
    URL.revokeObjectURL(createLogoPreview.value)
    createLogoPreview.value = null
  }
}

function applyLogoFile(file: File | null) {
  revokePreviewUrl()
  createLogoFile.value = file
  if (file) createLogoPreview.value = URL.createObjectURL(file)
}

function onCreateLogoChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    toast.error(t('companies.picker.logoInvalidType'))
    input.value = ''
    return
  }
  applyLogoFile(file)
}

function openLogoPicker(companyId: string) {
  logoTargetCompanyId.value = companyId
  logoInputRef.value?.click()
}

async function onLogoInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  const companyId = logoTargetCompanyId.value
  input.value = ''
  logoTargetCompanyId.value = null

  if (!file || !companyId) return
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    toast.error(t('companies.picker.logoInvalidType'))
    return
  }

  uploadingCompanyId.value = companyId
  try {
    await uploadCompanyLogo(companyId, file)
    toast.success(t('companies.picker.logoUpdated'))
  } catch (error) {
    toast.error(useErrorMessage(error).message)
  } finally {
    uploadingCompanyId.value = null
  }
}

async function selectCompany(company: UserCompany) {
  activeCompanyId.value = company.id
  emit('select', company)
  if (props.redirectOnSelect) {
    await navigateTo(companyWorkspacePath(company))
  }
}

async function onCreateSubmit(values: Record<string, unknown>) {
  if (isCreating.value) return
  const name = typeof values.name === 'string' ? values.name.trim() : ''
  if (!name) return

  isCreating.value = true
  try {
    const created = await createCompany(name)
    if (createLogoFile.value) {
      await uploadCompanyLogo(created.id, createLogoFile.value)
    }
    createOpen.value = false
    applyLogoFile(null)
    toast.success(t('companies.picker.createSuccess'))
    const refreshed = companies.value.find(c => c.id === created.id) ?? created
    await selectCompany(refreshed)
  } catch (error) {
    toast.error(useErrorMessage(error).message)
  } finally {
    isCreating.value = false
  }
}

function onCreateDialogToggle(open: boolean) {
  createOpen.value = open
  if (!open) applyLogoFile(null)
}

onMounted(() => {
  fetchCompanies().catch(error => {
    toast.error(useErrorMessage(error).message)
  })
})

onBeforeUnmount(() => {
  revokePreviewUrl()
})
</script>

<template>
  <div class="mx-auto w-full max-w-3xl">
    <input
      ref="logoInputRef"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/gif"
      class="sr-only"
      @change="onLogoInputChange"
    />

    <header class="mb-8 text-center">
      <h1 class="text-foreground text-2xl font-semibold tracking-tight">
        {{ t('companies.picker.title') }}
      </h1>
      <p class="text-muted-foreground mt-2 text-sm">
        {{ t('companies.picker.subtitle') }}
      </p>
    </header>

    <div
      v-if="listPending && companies.length === 0"
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="bg-muted/40 h-[7.5rem] animate-pulse rounded-xl border border-transparent"
      />
    </div>

    <div
      v-else
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      role="listbox"
      :aria-label="t('companies.picker.title')"
    >
      <div
        v-for="company in companies"
        :key="company.id"
        role="option"
        tabindex="0"
        :aria-selected="isSelected(company)"
        :class="
          cn(
            'group bg-card relative flex min-h-[7.5rem] cursor-pointer flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all',
            'hover:border-foreground/15 hover:bg-muted/30 hover:shadow-sm',
            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            isSelected(company)
              ? 'border-foreground/25 bg-muted/40 ring-foreground/10 shadow-sm ring-1'
              : 'border-border/80'
          )
        "
        @click="selectCompany(company)"
        @keydown.enter.prevent="selectCompany(company)"
        @keydown.space.prevent="selectCompany(company)"
      >
        <span
          v-if="isSelected(company)"
          class="bg-primary text-primary-foreground absolute top-3 right-3 flex size-5 items-center justify-center rounded-full"
          aria-hidden="true"
        >
          <Icon name="ph:check-bold" class="size-3" />
        </span>

        <Avatar class="size-10 shrink-0 rounded-md">
          <AvatarImage
            v-if="companyLogoUrl(company)"
            :src="companyLogoUrl(company)!"
            :alt="company.name"
            class="rounded-md object-cover"
          />
          <AvatarFallback
            :class="cn('rounded-md text-sm font-semibold', iconPalette(company.name))"
          >
            {{ companyInitials(company.name) }}
          </AvatarFallback>
        </Avatar>

        <span class="min-w-0 flex-1 pr-6">
          <span class="text-foreground line-clamp-2 text-sm leading-snug font-medium">
            {{ company.name }}
          </span>
          <span class="text-muted-foreground mt-1 block text-xs">
            {{ roleLabel(company.role) }}
          </span>
        </span>
      </div>

      <button
        v-if="showCreate"
        type="button"
        class="hover:border-foreground/20 hover:bg-muted/20 focus-visible:ring-ring border-border/90 flex min-h-[7.5rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-transparent p-4 text-center transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        @click="createOpen = true"
      >
        <span
          class="text-muted-foreground border-border bg-muted/30 flex size-10 items-center justify-center rounded-md border border-dashed"
          aria-hidden="true"
        >
          <Icon name="ph:plus" class="size-5" />
        </span>
        <span class="text-muted-foreground text-sm font-medium">
          {{ t('companies.picker.createTile') }}
        </span>
      </button>
    </div>

    <p
      v-if="!listPending && companies.length === 0 && !showCreate"
      class="text-muted-foreground py-12 text-center text-sm"
    >
      {{ t('companies.picker.empty') }}
    </p>

    <Dialog :open="createOpen" @update:open="onCreateDialogToggle">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('companies.picker.createTitle') }}</DialogTitle>
          <DialogDescription>{{ t('companies.picker.createDescription') }}</DialogDescription>
        </DialogHeader>
        <Form
          :validation-schema="createValidationSchema"
          class="space-y-4"
          @submit="onCreateSubmit"
        >
          <div class="flex flex-col items-center gap-3">
            <button
              type="button"
              class="focus-visible:ring-ring relative rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              @click="createLogoInputRef?.click()"
            >
              <Avatar class="size-16 rounded-xl">
                <AvatarImage
                  v-if="createLogoPreview"
                  :src="createLogoPreview"
                  alt=""
                  class="rounded-xl object-cover"
                />
                <AvatarFallback
                  class="bg-muted text-muted-foreground rounded-xl text-lg font-semibold"
                >
                  <Icon name="ph:image" class="size-7" />
                </AvatarFallback>
              </Avatar>
              <span
                class="bg-background/90 border-border/80 absolute inset-0 flex items-center justify-center rounded-xl border"
              >
                <Icon name="ph:camera" class="text-muted-foreground size-5" />
              </span>
            </button>
            <input
              ref="createLogoInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="sr-only"
              @change="onCreateLogoChange"
            />
            <p class="text-muted-foreground text-center text-xs">
              {{ t('companies.picker.logoOptional') }}
            </p>
          </div>

          <FormField v-slot="{ componentField }" name="name">
            <div class="flex flex-col gap-2">
              <Label for="picker-company-name">{{ t('companies.picker.name') }}</Label>
              <Input
                id="picker-company-name"
                type="text"
                :placeholder="t('companies.picker.namePlaceholder')"
                autocomplete="organization"
                v-bind="componentField"
              />
              <InputError name="name" />
            </div>
          </FormField>
          <DialogFooter class="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" @click="onCreateDialogToggle(false)">
              {{ t('common.cancel') }}
            </Button>
            <Button type="submit" :disabled="isCreating">
              {{ isCreating ? t('common.loading') : t('companies.picker.createSubmit') }}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  </div>
</template>
