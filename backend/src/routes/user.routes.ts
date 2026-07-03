import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  updatePreferences,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", protect, getProfile);
router.patch("/me", protect, updateProfile);
router.patch("/me/password", protect, changePassword);
router.patch("/me/preferences", protect, updatePreferences);

export default router;
