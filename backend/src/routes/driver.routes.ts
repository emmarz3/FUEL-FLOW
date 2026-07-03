import { Router } from "express";
import {
  getAssignedDeliveries,
  updateDeliveryStatus,
  getDeliveryHistory,
  updateLocation,
} from "../controllers/driver.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.use(authorize("driver", "admin"));

router.get("/deliveries", getAssignedDeliveries);
router.get("/history", getDeliveryHistory);
router.patch("/deliveries/:id/status", updateDeliveryStatus);
router.patch("/location", updateLocation);

export default router;
