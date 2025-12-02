import { Router } from "express";
import UserController from "../../controllers/UserController.js";

const router = Router();

// Users
router.get("/", UserController.getAllUsers);
router.get("/customers", UserController.getCustomers);
router.get("/owners", UserController.getOwners);
router.post("/update/status/:id", UserController.updateUserStatus);
router.get("/:id", UserController.getUserById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

// Partner workflow
router.get("/partners/pending", UserController.getPendingPartners);
router.get("/partners/negotiating", UserController.getNegotiatingPartners);
router.get("/partners/approved", UserController.getApprovedPartners);

router.put("/partners/:id/approve", UserController.approvePartner);
router.put("/partners/:id/reject", UserController.rejectPartner);
router.put("/partners/:id/activate", UserController.activatePartner);

export default router;
