import { Router } from "express";
import {
  saveCard,
  getUserCards,
  deleteCard,
  setDefaultCard,
} from "../controllers/card.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post("/", protect, authorize("customer"), saveCard);
router.get("/", protect, authorize("customer"), getUserCards);
router.delete("/:id", protect, authorize("customer"), deleteCard);
router.patch("/:id/default", protect, authorize("customer"), setDefaultCard);

export default router;
