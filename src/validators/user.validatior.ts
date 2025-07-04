import i18n from "@/config/i18n";
import { z } from "zod";

export const approveUserRoleSchema = z.object({
  userId: z.coerce.number().int().positive(i18n.__("user_id_must_be_positive_integer")),
  roleId: z.coerce.number().int().positive(i18n.__("role_id_must_be_positive_integer")),
});

export type ApproveUserRoleInput = z.infer<typeof approveUserRoleSchema>;
