import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

export const getLoginValidation = () => {
  const { t } = useI18n();

  return z.object({
    email: z
      .string()
      .email(t("validation.email_invalid"))
      .min(2, { message: t("validation.email_min", { min: 2 }) })
      .max(50, { message: t("validation.email_max", { max: 50 }) }),
    password: z
      .string(t("validation.required"))
      .min(8, { message: t("validation.password_min", { min: 8 }) })
      .max(50, { message: t("validation.password_max", { max: 50 }) }),
    rememberMe: z.boolean().optional(),
  });
};

export const getRegisterValidation = () => {
  const { t } = useI18n();
  return z.object({
    name: z.string(t("validation.required")).min(2, { message: t("validation.name_min", { min: 2 }) }).max(50, { message: t("validation.name_max", { max: 50 }) }),
    email: z.string().email(t("validation.email_invalid")).min(2, { message: t("validation.email_min", { min: 2 }) }).max(50, { message: t("validation.email_max", { max: 50 }) }),
    password: z.string(t("validation.required")).min(8, { message: t("validation.password_min", { min: 8 }) }).max(50, { message: t("validation.password_max", { max: 50 }) }),
  });
};


export const getForgotPasswordValidation = () => {
  const { t } = useI18n();

  return z.object({
    email: z
      .string()
      .email({ message: t("validation.email_invalid") })
      .min(2, { message: t("validation.email_min", { min: 2 }) })
      .max(50, { message: t("validation.email_max", { max: 50 }) }),
  });
};

export const getResetPasswordValidation = () => {
  const { t } = useI18n();

  return z
    .object({
      email: z.string(t("validation.required")).email({ message: t("validation.email_invalid") }),
      otp: z.string(t("validation.required")).length(6, { message: t("validation.otp_length") }),
      password: z
        .string(t("validation.required"))
        .min(8, { message: t("validation.password_min", { min: 8 }) })
        .max(50, { message: t("validation.password_max", { max: 50 }) }),
      confirmPassword: z.string(t("validation.required")).min(8, { message: t("validation.password_min", { min: 8 }) }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.password_mismatch"),
      path: ["confirmPassword"],
    });
};

export const getResetPasswordWithTokenValidation = () => {
  const { t } = useI18n();

  return z
    .object({
      password: z
        .string(t("validation.required"))
        .min(8, { message: t("validation.password_min", { min: 8 }) })
        .max(50, { message: t("validation.password_max", { max: 50 }) }),
      confirmPassword: z
        .string(t("validation.required"))
        .min(8, { message: t("validation.password_min", { min: 8 }) }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.password_mismatch"),
      path: ["confirmPassword"],
    });
};

export const getChangePasswordValidation = () => {
  const { t } = useI18n();

  return z
    .object({
      currentPassword: z.string(t("validation.required")),
      newPassword: z
        .string(t("validation.required"))
        .min(8, { message: t("validation.password_min", { min: 8 }) })
        .max(50, { message: t("validation.password_max", { max: 50 }) }),
      confirmNewPassword: z
        .string(t("validation.required"))
        .min(8, { message: t("validation.password_min", { min: 8 }) }),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t("validation.password_mismatch"),
      path: ["confirmNewPassword"],
    });
};


export type loginSchema = z.infer<ReturnType<typeof getLoginValidation>>;
export type registerSchema = z.infer<ReturnType<typeof getRegisterValidation>>;
export type forgotPasswordSchema = z.infer<ReturnType<typeof getForgotPasswordValidation>>;
export type resetPasswordSchema = z.infer<ReturnType<typeof getResetPasswordValidation>>;
export type resetPasswordWithTokenSchema = z.infer<
  ReturnType<typeof getResetPasswordWithTokenValidation>
>;
export type changePasswordSchema = z.infer<ReturnType<typeof getChangePasswordValidation>>;

export const toTypeLoginValidation = () => toTypedSchema(getLoginValidation());
export const toTypeRegisterValidation = () => toTypedSchema(getRegisterValidation());
export const toTypeForgotPasswordValidation = () => toTypedSchema(getForgotPasswordValidation());
export const toTypeResetPasswordValidation = () => toTypedSchema(getResetPasswordValidation());
export const toTypeResetPasswordWithTokenValidation = () =>
  toTypedSchema(getResetPasswordWithTokenValidation());
export const toTypeChangePasswordValidation = () => toTypedSchema(getChangePasswordValidation());