import { Router } from "express";
import {
  getVendorOrders,
  getVendorCustomers,
  getVendorRevenue,
  updateInventory,
  getVendorAnalytics,
} from "../controllers/vendor.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.use(authorize("vendor", "admin"));

router.get("/orders", getVendorOrders);
router.get("/customers", getVendorCustomers);
router.get("/revenue", getVendorRevenue);
router.patch("/inventory", updateInventory);
router.get("/analytics", getVendorAnalytics);

export default router;
