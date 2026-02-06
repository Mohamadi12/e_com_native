import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createReview,
  deleteReview,
} from "../controllers/review.controller.js";

const router = Router();

router.post("/", protectRoute, createReview);
// we did not implement this function in the mobile app - in the frontend (Nous n’avons pas implémenté cette fonction dans l’application mobile)
// but jic if you'd like to see the backend code here it is - i provided (mais juste au cas où (jic = just in case), si tu veux voir le code backend, le voici — je l’ai fourni)
router.delete("/:reviewId", protectRoute, deleteReview);

export default router;
