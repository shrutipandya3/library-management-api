import { Request, Response, NextFunction } from "express";
import { getAllRolesDropdown } from "@/services/role.service";
import { sendResponse } from "@/utils/sendResponse";
import i18n from "@/config/i18n";

export const getAllRolesDropdownHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await getAllRolesDropdown();
    sendResponse({
      res,
      message: i18n.__("roles_fetched"),
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};
