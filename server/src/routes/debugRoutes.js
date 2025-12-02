import express from "express";
import db from "../config/db.js";
const router = express.Router();

router.get("/partners/:status", async (req, res) => {
  const status = Number(req.params.status);

  try {
    const data = await db.user.findAll({
      where: { role: 1 },
      include: [
        {
          model: db.restaurantpartner,
          as: "partner",
          where: { status },
          required: true,
        },
      ],
      logging: console.log, // IN SQL RA CONSOLE
    });

    res.json({
      success: true,
      count: data.length,
      data: data.map((x) => x.get({ plain: true })),
    });

  } catch (err) {
    console.error("❌ DEBUG ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
