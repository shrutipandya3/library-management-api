import { Router } from "express";
import {
  createLibraryHandler,
  deleteLibraryHandler,
  getAllLibrariesDropdownHandler,
  getAllLibrariesHandler,
  getLibraryByIdHandler,
  updateLibraryHandler,
} from "@/controllers/library.controller";
import { createLibrarySchema, deleteLibrarySchema, getLibraryByIdSchema, updateLibraryBodySchema, updateLibraryParamsSchema } from "@/validators/library.validator";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/rbac.middleware";
import { ActionType } from "@prisma/client";
import { Resource } from "@/config/constants";
import { validate } from "@/middlewares/validate.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(Resource.LIBRARY, ActionType.CREATE),
  validate(createLibrarySchema),
  createLibraryHandler
);

router.get("/dropdown", getAllLibrariesDropdownHandler);


router.get("/", authenticate, authorize(Resource.LIBRARY, ActionType.READ), getAllLibrariesHandler);

router.get(
  "/:id",
  authenticate,
  authorize(Resource.LIBRARY, ActionType.READ),
  validate(getLibraryByIdSchema, "params"),
  getLibraryByIdHandler
);

router.put(
  "/:id",
  authenticate,
  authorize(Resource.LIBRARY, ActionType.UPDATE),
  validate(updateLibraryBodySchema),
  updateLibraryHandler
);

router.delete(
  "/:id",
  authenticate,
  authorize(Resource.LIBRARY, ActionType.DELETE),
  validate(deleteLibrarySchema, "params"),
  deleteLibraryHandler
);

export default router;
