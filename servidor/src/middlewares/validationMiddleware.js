// src/middlewares/validationMiddleware.js
import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Si hay errores, responde con un código 400 y la lista de errores.
    return res.status(400).json({ errors: errors.array() });
  }
  // Si no hay errores, permite que la petición continúe hacia el controlador.
  next();
};
