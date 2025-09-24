import { authAdmin, db } from "../config/firebaseAdmin.js";
import admin from "firebase-admin";

export const createDoctor = async (req, res) => {
  console.log("Datos recibidos en el body:", req.body);

  try {
    console.log("Datos recibidos en el body:", req.body); // <-- aquí

    const {
      email,
      password,
      firstName,
      lastName,
      cedula,
      especialidad,
      telefonoDeContacto,
      isActive,
      assignedOfficeId,
    } = req.body;

    // Validación básica de campos obligatorios
    if (!email || !password || !firstName || !cedula || !especialidad) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const authUser = req.user;

    if (!authUser || authUser.role !== "hospital_administrador") {
      return res
        .status(403)
        .json({ error: "No autorizado. Debes ser administrador." });
    }

    const hospitalId = authUser.hospitalId;

    // 🔹 Crear usuario en Firebase Auth
    const userRecord = await authAdmin.createUser({ email, password });

    await authAdmin.setCustomUserClaims(userRecord.uid, {
      role: "hospital_doctor",
      hospitalId,
    });

    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    // 🔹 Guardar usuario en Firestore
    await db
      .collection("usuarios_hospitales")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email,
        role: "hospital_doctor",
        hospitalId,
        fullName,
        firstName,
        lastName: lastName || "",
        cedula: cedula || "",
        especialidad: especialidad || "",
        telefonoDeContacto: telefonoDeContacto || "",
        assignedOfficeId: assignedOfficeId || null,
        horariosDisponibles: null,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return res.status(201).json({
      message: "Usuario hospital_doctor creado con éxito",
      doctorId: userRecord.uid,
      email,
      cedula, // 🔹 incluimos cedula en la respuesta para chequear que se recibió
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
