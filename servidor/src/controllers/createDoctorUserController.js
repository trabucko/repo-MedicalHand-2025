import { authAdmin, db } from "../config/firebaseAdmin.js";
import admin from "firebase-admin";

export const createDoctor = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      cedulaProfesional,
      especialidad,
      telefonoDeContacto,
    } = req.body;
    const authUser = req.user;

    // Validación de rol: solo un administrador de hospital puede crear un doctor.
    if (authUser.role !== "hospital_administrador") {
      return res
        .status(403)
        .json({ error: "No autorizado. Debes ser administrador." });
    }

    const hospitalId = authUser.hospitalId;

    // Crear usuario en Firebase Authentication usando authAdmin.
    const userRecord = await authAdmin.createUser({ email, password });

    // Asignar claims personalizados usando authAdmin.
    await authAdmin.setCustomUserClaims(userRecord.uid, {
      role: "hospital_doctor",
      hospitalId,
    });

    // Crear el nombre completo del doctor.
    const fullName = lastName ? `${firstName} ${lastName}` : firstName || "";

    // Guardar los datos del doctor en Firestore usando db.
    // El 'userRecord.uid' se usa como el ID del documento ('doctorId').
    await db.collection("usuarios_hospitales").doc(userRecord.uid).set({
      email,
      role: "hospital_doctor",
      hospitalId,
      fullName,
      firstName,
      lastName,
      cedulaProfesional,
      especialidad,
      telefonoDeContacto,
      consultorioActual: null,
      horariosDisponibles: null,
      isActive: true, // Añadido por consistencia con tu script de monitor
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Envía una respuesta de éxito con los datos del nuevo doctor.
    return res.status(201).json({
      message: "Usuario hospital_doctor creado con éxito",
      doctorId: userRecord.uid,
      email,
      fullName,
      cedulaProfesional,
      especialidad,
    });
  } catch (error) {
    console.error("Error creando usuario hospital_doctor:", error);
    // Manejo de errores, por ejemplo, si el email ya existe.
    if (error.code === "auth/email-already-exists") {
      return res
        .status(409)
        .json({ error: "El correo electrónico ya está en uso." });
    }
    return res.status(500).json({ error: error.message });
  }
};
