import express from "express";
import { createDoctor } from "../controllers/createDoctorUserController.js";
import { verifyAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/createDr", verifyAuth, createDoctor);

export default router;
