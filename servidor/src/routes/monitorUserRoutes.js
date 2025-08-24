import express from "express";
import { createMonitor } from "../controllers/createMonitorUserController.js";
import { verifyAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyAuth, createMonitor);

export default router;
