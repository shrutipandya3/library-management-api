import { Resource } from "@/config/constants";
import { addBookToInventoryHandler, getLibraryInventoryHandler, removeBookFromInventoryHandler } from "@/controllers/libraryInventory.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/rbac.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { addBookToInventorySchema, getLibraryInventorySchema, removeBookFromInventorySchema } from "@/validators/libraryInventory.validator";
import { ActionType } from "@prisma/client";
import { Router } from "express";

const router = Router();

router.post(
  "/:id/inventory",
  authenticate,
  authorize(Resource.LIBRARYINVENTORY, ActionType.CREATE),
  validate(addBookToInventorySchema),
  addBookToInventoryHandler
);

router.get(
  "/:id/inventory",
  authenticate,
  authorize(Resource.LIBRARYINVENTORY, ActionType.READ),
  validate(getLibraryInventorySchema, "params"),
  getLibraryInventoryHandler
);


router.delete(
  "/:id/inventory/:bookId",
  authenticate,
  authorize(Resource.LIBRARYINVENTORY, ActionType.DELETE),
  validate(removeBookFromInventorySchema, "params"),
  removeBookFromInventoryHandler
);

export default router;
