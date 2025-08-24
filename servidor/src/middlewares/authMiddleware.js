import admin from "firebase-admin";

export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
    if (!token)
      return res.status(401).json({ error: "Token no proporcionado" });

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Aquí tienes los claims: role, hospitalId, etc.
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
