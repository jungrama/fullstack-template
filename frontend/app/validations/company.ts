import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

export const getCreateCompanyValidation = () => {
  const { t } = useI18n()

  return z.object({
    name: z
      .string(t('validation.required'))
      .min(2, { message: t('validation.name_min', { min: 2 }) })
      .max(100, { message: t('validation.name_max', { max: 100 }) }),
  })
}

export type createCompanySchema = z.infer<ReturnType<typeof getCreateCompanyValidation>>

export const toTypeCreateCompanyValidation = () => toTypedSchema(getCreateCompanyValidation())
