import { Response, NextFunction } from "express";
import prisma from "@/config/prisma";
import { ActionType } from "@prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";
import { sendResponse } from "@/utils/sendResponse"; // Assuming this is where sendResponse is
import i18n from "@/config/i18n";

/**
 * Authorization Middleware
 * @param resource - The resource to protect (e.g., "books", "users")
 * @param action - The action to check (CREATE, READ, UPDATE, DELETE)
 */
export const authorize = (resource: string, action: ActionType) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        sendResponse({
          res,
          statusCode: 401,
          message: req.__("unauthorized"),
          data: null,
        });
        return;
      }


      const userRoles = await prisma.userRole.findMany({
        where: { userId, status: "APPROVED" },
        include: {
          role: {
            include: {
              roleActions: {
                include: {
                  action: true,
                },
              },
            },
          },
        },
      });


      const isAllowed = userRoles.some((userRole) =>
        userRole.role.roleActions.some(
          (roleAction) =>
            roleAction.action.resource === resource &&
            roleAction.action.action === action
        )
      );


      if (!isAllowed) {
        sendResponse({
          res,
          statusCode: 403,
          message: req.__("forbidden"),
          data: null,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
