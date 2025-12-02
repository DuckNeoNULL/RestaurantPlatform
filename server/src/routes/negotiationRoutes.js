// src/routes/negotiationRoutes.js
import { Router } from "express";
import { authenticateJWT } from "../middlewares/jwtToken.js";
import NegotiationController from "../controllers/NegotiationController.js";

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// GET /api/negotiation/:partnerID - Get partner negotiation data
router.get("/:partnerID", NegotiationController.getNegotiationData);

// GET /api/negotiation/:partnerID/history - Get negotiation history
router.get("/:partnerID/history", NegotiationController.getHistory);

// POST /api/negotiation/:partnerID/offer - Create new offer
router.post("/:partnerID/offer", NegotiationController.createOffer);

// POST /api/negotiation/:partnerID/accept - Accept current offer
router.post("/:partnerID/accept", NegotiationController.acceptOffer);

export default router;

