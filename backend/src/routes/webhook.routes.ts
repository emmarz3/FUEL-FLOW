import { Router } from "express";
import {
  handleWebhook,
  getWebhookLogs,
  getWebhookLogById,
} from "../controllers/webhook.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

// Webhook endpoint - no auth required, signature verification in controller
router.post("/nomba", handleWebhook);

// Admin endpoints for viewing webhook logs
router.get("/", protect, authorize("admin", "manager"), getWebhookLogs);
router.get("/:id", protect, authorize("admin", "manager"), getWebhookLogById);

export default router;
