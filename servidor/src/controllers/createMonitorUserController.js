import { authAdmin, db } from "../config/firebaseAdmin.js";
import admin from "firebase-admin";
export const createMonitor = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, cedula } = req.body;
    const authUser = req.user;

    if (!authUser || authUser.role !== "hospital_administrador") {
      return res
        .status(403)
        .json({ error: "No autorizado. Debes ser administrador." });
    }

    const hospitalId = authUser.hospitalId;

    // Crear usuario monitor en Firebase Auth
    const userRecord = await authAdmin.createUser({ email, password });

    // Asignar claims personalizados
    await authAdmin.setCustomUserClaims(userRecord.uid, {
      role: "hospital_monitor",
      hospitalId,
    });

    // Crear nombre completo
    const fullName = lastName ? `${firstName} ${lastName}` : firstName || "";

    // Guardar en Firestore
    await db
      .collection("usuarios_hospitales")
      .doc(userRecord.uid)
      .set({
        email,
        role: "hospital_monitor",
        hospitalId,
        fullName,
        phone: phone || null,
        cedula: cedula || null,
        isActive: true, // por defecto activo
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return res.status(201).json({
      message: "Usuario hospital_monitor creado con éxito",
      email,
      hospitalId,
      fullName,
      phone: phone || null,
      cedula: cedula || null,
      isActive: true,
    });
  } catch (error) {
    console.error("Error creando usuario hospital_monitor:", error);
    if (error.code === "auth/email-already-exists") {
      return res
        .status(409)
        .json({ error: "El correo electrónico ya está en uso." });
    }
    return res.status(500).json({ error: error.message });
  }
};
