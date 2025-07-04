import { Router } from "express";
import { getAllRolesDropdownHandler } from "@/controllers/role.controller";

const router = Router();

router.get("/dropdown", getAllRolesDropdownHandler);

export default router;
