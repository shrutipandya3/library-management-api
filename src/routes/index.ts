import { Router } from "express";
import roleRoutes from "./role.routes";
import authRoutes from "./auth.routes";
import libraryRoutes from "./library.routes";
import bookRoutes from "./book.routes";
import libraryInventoryRoutes from "./libraryInventory.route";
import userRoutes from "./user.routes";

const router = Router();

router.use("/roles", roleRoutes);
router.use("/auth", authRoutes);
router.use("/library", libraryRoutes);
router.use("/book", bookRoutes);
router.use("/library-inventory", libraryInventoryRoutes);
router.use("/user", userRoutes);

export default router;
