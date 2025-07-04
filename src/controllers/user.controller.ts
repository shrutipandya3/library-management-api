import { Request, Response, NextFunction } from "express";
import i18n from "@/config/i18n";
import { ApproveUserRoleInput } from "@/validators/user.validatior";
import { approveUserRole } from "@/services/user.service";
import { sendResponse } from "@/utils/sendResponse";

export const approveUserRoleHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, roleId }: ApproveUserRoleInput = req.body;

    const updatedUserRole = await approveUserRole({ userId, roleId }, req.getLocale());

    sendResponse({
      res,
      statusCode: 200,
      message: i18n.__("user_role_approved"),
      data: updatedUserRole,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
