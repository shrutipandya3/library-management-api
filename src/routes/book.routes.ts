import { Router } from "express";
import { upload } from "../middlewares/upload.middleware";
import {
  borrowBookHandler,
  createBookHandler,
  deleteBookByIdHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  returnBookHandler,
  updateBookHandler,
} from "@/controllers/book.controller";
import {
  borrowBookSchema,
  createBookSchema,
  deleteBookByIdSchema,
  getBookByIdSchema,
  returnBookSchema,
  updateBookSchema,
} from "@/validators/book.validator";
import { validate } from "@/middlewares/validate.middleware";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/rbac.middleware";
import { Resource } from "@/config/constants";
import { ActionType } from "@prisma/client";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(Resource.BOOK, ActionType.CREATE),
  upload.single("cover"),
  validate(createBookSchema, "body"),
  createBookHandler
);
router.get(
  "/",
  authenticate,
  authorize(Resource.BOOK, ActionType.READ),
  getAllBooksHandler
);

router.get(
  "/:id",
  authenticate,
  authorize(Resource.BOOK, ActionType.READ),
  validate(getBookByIdSchema, "params"),
  getBookByIdHandler
);

router.delete(
  "/:id",
  authenticate,
  authorize(Resource.BOOK, ActionType.DELETE),
  validate(deleteBookByIdSchema, "params"),
  deleteBookByIdHandler
);

router.put(
  "/:id",
  authenticate,
  authorize(Resource.BOOK, ActionType.UPDATE),
  upload.single("cover"),
  validate(updateBookSchema, "body"),
  updateBookHandler
);

router.post(
  "/borrow",
  authenticate,
  authorize(Resource.BOOKBORROWER, ActionType.CREATE), // Assuming BOOK is a valid Resource, else adjust
  validate(borrowBookSchema),
  borrowBookHandler
);

router.put(
  "/return/:id",
  authenticate,
  authorize(Resource.BOOKBORROWER, ActionType.UPDATE),
  validate(returnBookSchema, "params"),
  returnBookHandler
);

export default router;
