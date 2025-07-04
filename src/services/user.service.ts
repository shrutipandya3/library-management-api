import i18n from "@/config/i18n";
import prisma from "@/config/prisma";
import { UserStatus } from "@prisma/client";
import HttpError from "@/utils/HttpError";
import { ApproveUserRoleInput } from "@/validators/user.validatior";

export const approveUserRole = async (
  { userId, roleId }: ApproveUserRoleInput,
  locale: string
) => {
  i18n.setLocale(locale);

  const userRole = await prisma.userRole.findFirst({
    where: { userId, roleId },
  });

  if (!userRole) {
    throw new HttpError(i18n.__("user_role_not_found"), 404);
  }

  if (userRole.status === UserStatus.APPROVED) {
    throw new HttpError(i18n.__("user_role_already_approved"), 409);
  }

  const updatedUserRole = await prisma.userRole.update({
    where: { id: userRole.id },
    data: { status: UserStatus.APPROVED },
  });

  return updatedUserRole;
};
