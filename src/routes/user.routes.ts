import { Resource } from "@/config/constants";
import { approveUserRoleHandler } from "@/controllers/user.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/rbac.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { approveUserRoleSchema } from "@/validators/user.validatior";
import { ActionType } from "@prisma/client";
import { Router } from "express";
const router = Router();

router.post(
  "/approve",
  authenticate,
  authorize(Resource.USERROLE, ActionType.UPDATE),
  validate(approveUserRoleSchema),
  approveUserRoleHandler
);

export default router;
