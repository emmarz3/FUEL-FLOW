import { Router } from "express";
import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  assignDriver,
  confirmDelivery,
} from "../controllers/delivery.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protect, authorize("customer", "vendor"), createDelivery);
router.get("/", protect, authorize("customer", "vendor", "driver", "admin"), getDeliveries);
router.get("/:id", protect, authorize("customer", "vendor", "driver", "admin"), getDeliveryById);
router.patch("/:id/status", protect, authorize("customer", "vendor", "driver", "admin"), updateDeliveryStatus);
router.patch("/:id/assign-driver", protect, authorize("vendor", "admin"), assignDriver);
router.patch("/:id/confirm", protect, authorize("customer"), confirmDelivery);

export default router;
