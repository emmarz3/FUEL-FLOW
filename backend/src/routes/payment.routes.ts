import { Router } from "express";
import {
  createPayment,
  verifyPayment,
  refundPayment,
  getPaymentHistory,
  getPaymentById,
} from "../controllers/payment.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protect, authorize("customer", "vendor", "admin"), createPayment);
router.get("/history", protect, authorize("customer", "admin"), getPaymentHistory);
router.get("/:id", protect, getPaymentById);
router.get("/verify/:chargeId", protect, authorize("customer", "admin"), verifyPayment);
router.post("/:id/refund", protect, authorize("admin", "support"), refundPayment);

export default router;
