import i18n from "@/config/i18n";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(i18n.__("invalid_email_format")),
  password: z.string().min(1, i18n.__("password_required")),
});

export const registerSchema = z.object({
  name: z.string().min(1, i18n.__("name_required")),
  email: z.string().email(i18n.__("invalid_email_format")),
  password: z
    .string()
    .min(6, i18n.__("password_min_length"))
    .regex(/[!@#$%^&*(),.?":{}|<>]/, i18n.__("password_special_char"))
    .regex(/\d/, i18n.__("password_digit_required")),
  role_id: z.number().int(i18n.__("role_id_must_be_integer")).optional(),
  library_id: z.number().int(i18n.__("library_id_must_be_integer")).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
