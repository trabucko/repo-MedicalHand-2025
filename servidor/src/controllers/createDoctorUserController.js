import { authAdmin, db } from "../config/firebaseAdmin.js";
import admin from "firebase-admin";

export const createDoctor = async (req, res) => {
  try {
    // ✅ 1. RECIBIMOS LOS NUEVOS CAMPOS DEL FRONTEND
    const {
      email,
      password,
      firstName,
      lastName,
      cedulaProfesional,
      especialidad,
      telefonoDeContacto,
      isActive, // <--- CAMPO RECIBIDO
      assignedOfficeId, // <--- CAMPO RECIBIDO (vendrá como null)
    } = req.body;

    const authUser = req.user;

    if (authUser.role !== "hospital_administrador") {
      return res
        .status(403)
        .json({ error: "No autorizado. Debes ser administrador." });
    }

    const hospitalId = authUser.hospitalId;

    const userRecord = await authAdmin.createUser({ email, password });

    await authAdmin.setCustomUserClaims(userRecord.uid, {
      role: "hospital_doctor",
      hospitalId,
    });

    const fullName = lastName ? `${firstName} ${lastName}` : firstName || "";

    // ✅ 2. AÑADIMOS EL 'uid' Y LOS OTROS CAMPOS AL DOCUMENTO
    await db.collection("usuarios_hospitales").doc(userRecord.uid).set({
      uid: userRecord.uid, // <--- ¡LA CLAVE! AÑADIR EL UID COMO CAMPO
      email,
      role: "hospital_doctor",
      hospitalId,
      fullName,
      firstName,
      lastName,
      cedulaProfesional,
      especialidad,
      telefonoDeContacto,
      assignedOfficeId: assignedOfficeId, // Guardamos el null que viene del frontend
      horariosDisponibles: null, // Este campo parece que ya no lo usas, podrías quitarlo
      isActive: isActive, // Usamos el valor que viene del frontend
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Usuario hospital_doctor creado con éxito",
      doctorId: userRecord.uid,
      email,
    });
  } catch (error) {
    console.error("Error creando usuario hospital_doctor:", error);
    if (error.code === "auth/email-already-exists") {
      return res
        .status(409)
        .json({ error: "El correo electrónico ya está en uso." });
    }
    return res.status(500).json({ error: error.message });
  }
};
