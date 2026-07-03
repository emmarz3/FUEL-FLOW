import { Router } from "express";
import {
  createSubscription,
  getUserSubscriptions,
  getSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  upgradeSubscription,
  downgradeSubscription,
} from "../controllers/subscription.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protect, authorize("customer"), createSubscription);
router.get("/", protect, authorize("customer", "admin"), getUserSubscriptions);
router.get("/:id", protect, getSubscription);
router.patch("/:id/pause", protect, authorize("customer"), pauseSubscription);
router.patch("/:id/resume", protect, authorize("customer"), resumeSubscription);
router.patch("/:id/cancel", protect, authorize("customer"), cancelSubscription);
router.patch("/:id/upgrade", protect, authorize("customer"), upgradeSubscription);
router.patch("/:id/downgrade", protect, authorize("customer"), downgradeSubscription);

export default router;
