import { Router } from "express";
import {
  loginSchema,
  registerSchema,
} from "@/validators/auth.validatior";
import { loginHandler, logoutHandler, registerHandler } from "@/controllers/auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";

const router = Router();

router.post("/register", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);
router.post("/logout", authenticate, logoutHandler)

export default router;
