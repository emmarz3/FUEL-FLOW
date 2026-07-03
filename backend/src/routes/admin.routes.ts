import { Router } from "express";
import {
  getAdminStats,
  getAllUsers,
  getAllVendors,
  getAllDrivers,
  getAllSubscriptions,
  getAllPayments,
  getWebhookLogs,
  getFailedPayments,
  getRetryQueue,
} from "../controllers/admin.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/stats", protect, authorize("admin"), getAdminStats);
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/vendors", protect, authorize("admin"), getAllVendors);
router.get("/drivers", protect, authorize("admin"), getAllDrivers);
router.get("/subscriptions", protect, authorize("admin"), getAllSubscriptions);
router.get("/payments", protect, authorize("admin"), getAllPayments);
router.get("/webhooks", protect, authorize("admin"), getWebhookLogs);
router.get("/failed-payments", protect, authorize("admin"), getFailedPayments);
router.get("/retry-queue", protect, authorize("admin"), getRetryQueue);

export default router;
