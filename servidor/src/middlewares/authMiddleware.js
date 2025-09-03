// src/middlewares/authMiddleware.js

// ✅ Importa el módulo con su nombre exacto: authAdmin
import { authAdmin } from "../config/firebaseAdmin.js";

export const verifyAuth = async (req, res, next) => {
  console.log("🔐 Middleware verifyAuth ejecutado");

  // Extraer token
  const authHeader = req.headers.authorization;
  console.log("📌 Header Authorization recibido:", authHeader);

  const token = authHeader?.split("Bearer ")[1];
  console.log(
    "📌 Token extraído:",
    token ? "[TOKEN DETECTADO]" : "❌ No hay token"
  );

  if (!token) {
    return res.status(401).json({ error: "No se proporcionó un token." });
  }

  try {
    // ✅ Utiliza authAdmin para verificar el token
    console.log("✅ Verificando token con Firebase...");
    const decodedToken = await authAdmin.verifyIdToken(token);
    console.log("🎉 Token verificado correctamente:", decodedToken);

    // Adjunta la información del usuario al objeto de la petición
    req.user = decodedToken;

    // Obtener los custom claims
    console.log("📌 Buscando usuario en Firebase:", decodedToken.uid);
    const user = await authAdmin.getUser(decodedToken.uid);
    console.log("✅ Usuario obtenido de Firebase:", {
      uid: user.uid,
      claims: user.customClaims,
    });

    req.user.role = user.customClaims?.role || null;
    req.user.hospitalId = user.customClaims?.hospitalId || null;

    console.log("📌 Usuario final en req.user:", req.user);

    next();
  } catch (error) {
    console.error("❌ Error al verificar el token:", error);

    return res.status(401).json({
      error: "Token de autenticación inválido o expirado.",
      detalle: error.message,
    });
  }
};
