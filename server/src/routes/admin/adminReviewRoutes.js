// src/routes/admin/adminReviewRoutes.js
import { Router } from "express";
import AdminReviewController from "../../controllers/admin/AdminReviewController.js";

const router = Router();


router.get("/", AdminReviewController.getAll);
router.get("/:id",AdminReviewController.getDetail);

router.patch(
  "/:id/visibility",
  AdminReviewController.updateVisibility
);

router.delete("/:id", AdminReviewController.delete);

export default router;
