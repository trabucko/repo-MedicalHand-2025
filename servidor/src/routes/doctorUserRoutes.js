import express from "express";
import { body } from "express-validator";
import { createDoctor } from "../controllers/createDoctorUserController.js";
import { verifyAuth } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Reglas de validación para crear un doctor
const createDoctorRules = [
  body("email")
    .isEmail()
    .withMessage("El correo no tiene un formato válido.")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres.")
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .withMessage(
      "La contraseña debe contener al menos una mayúscula, un número y un símbolo."
    ),

  body("firstName").trim().notEmpty().withMessage("El nombre es obligatorio."),

  body("lastName").trim().notEmpty().withMessage("El apellido es obligatorio."),

  body("cedula")
    .notEmpty()
    .withMessage("La cédula es obligatoria.")
    .matches(/^001-\d{6}-\d{4}[A-Z]$/)
    .withMessage("El formato de la cédula debe ser 001-XXXXXX-XXXXL."),

  body("especialidad")
    .notEmpty()
    .withMessage("La especialidad es obligatoria."),
];

// Ruta para crear un doctor
router.post(
  "/createDr",
  verifyAuth, // Autentica al usuario
  createDoctorRules, // Ejecuta reglas de validación
  validateRequest, // Verifica errores de validación
  createDoctor // Controlador que crea el doctor
);

export default router;
