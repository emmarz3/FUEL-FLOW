import { Router } from "express";
import {
  getAnalytics,
  getRevenue,
  getSubscriptions,
  getCustomers,
  getPayments,
  getDeliveries,
  getChurnRate,
  getFuelConsumption,
} from "../controllers/analytics.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect, authorize("admin", "manager"), getAnalytics);
router.get("/revenue", protect, authorize("admin", "manager"), getRevenue);
router.get("/subscriptions", protect, authorize("admin", "manager"), getSubscriptions);
router.get("/customers", protect, authorize("admin", "manager"), getCustomers);
router.get("/payments", protect, authorize("admin", "manager"), getPayments);
router.get("/deliveries", protect, authorize("admin", "manager"), getDeliveries);
router.get("/churn-rate", protect, authorize("admin", "manager"), getChurnRate);
router.get("/fuel-consumption", protect, authorize("admin", "manager"), getFuelConsumption);

export default router;
