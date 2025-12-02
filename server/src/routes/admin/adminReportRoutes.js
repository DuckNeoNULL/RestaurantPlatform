// src/routes/admin/adminReportRoutes.js
import { Router } from "express";
import AdminReportController from "../../controllers/admin/AdminReportController.js";

const router = Router();


router.get("/", AdminReportController.getAll);
router.get("/:id", AdminReportController.getDetail);

router.patch("/:id", AdminReportController.updateStatus);

router.delete("/:id", AdminReportController.delete);

export default router;
