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

    const userRecord = await authAdmin.createUser({ email, password });

    await authAdmin.setCustomUserClaims(userRecord.uid, {
      role: "hospital_monitor",
      hospitalId,
    });

    const fullName = lastName ? `${firstName} ${lastName}` : firstName || "";
    0;
    // AHORA: Guardamos todo en un único documento, sin duplicados.
    await db
      .collection("hospitales_MedicalHand")
      .doc(hospitalId)
      .collection("users")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email,
        role: "hospital_monitor", // El rol es un campo, como debe ser.
        hospitalId,
        fullName,
        firstName: firstName || "",
        lastName: lastName || "",
        phone: phone || null,
        cedula: cedula || null,
        isActive: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // El segundo guardado que creaba la subcolección anidada se ha eliminado.

    return res.status(201).json({
      message: "Usuario hospital_monitor creado con éxito.",
      monitorId: userRecord.uid,
      email: userRecord.email, // <-- Añade esta lín ea
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
