import { authAdmin, db } from "../config/firebaseAdmin.js";
import admin from "firebase-admin";

// CREATE
export const createDoctor = async (req, res) => {
  try {
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
    const userRecord = await authAdmin.createUser({ email, password });
    await authAdmin.setCustomUserClaims(userRecord.uid, {
      role: "hospital_doctor",
      hospitalId,
    });
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    // Estructura RÁPIDA: Un solo guardado en un único lugar.
    await db
      .collection("hospitales_MedicalHand")
      .doc(hospitalId)
      .collection("users")
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
      message: "Usuario hospital_doctor creado con éxito.",
      doctorId: userRecord.uid,
      email: userRecord.email, // <-- Añade esta línea
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

// READ (Consulta RÁPIDA y optimizada)
export const getAllDoctors = async (req, res) => {
  try {
    const authUser = req.user;
    if (authUser.role !== "hospital_administrador") {
      return res.status(403).json({ error: "No autorizado." });
    }

    const snapshot = await db
      .collection("hospitales_MedicalHand")
      .doc(authUser.hospitalId)
      .collection("users")
      .where("role", "==", "hospital_doctor")
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }
    const doctors = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json(doctors);
  } catch (error) {
    console.error("Error al obtener los doctores:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

// READ ONE (Búsqueda RÁPIDA y directa)
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user;

    const doc = await db
      .collection("hospitales_MedicalHand")
      .doc(authUser.hospitalId)
      .collection("users")
      .doc(id)
      .get();

    if (!doc.exists || doc.data().role !== "hospital_doctor") {
      return res.status(404).json({ error: "Doctor no encontrado." });
    }
    return res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error al obtener el doctor:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

// UPDATE (Acceso RÁPIDO y directo)
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const authUser = req.user;

    const doctorRef = db
      .collection("hospitales_MedicalHand")
      .doc(authUser.hospitalId)
      .collection("users")
      .doc(id);

    const doc = await doctorRef.get();
    if (!doc.exists || doc.data().role !== "hospital_doctor") {
      return res.status(404).json({ error: "Doctor no encontrado." });
    }

    delete data.role;
    delete data.hospitalId;

    await doctorRef.update(data);
    if (data.email) {
      await authAdmin.updateUser(id, {
        email: data.email,
      });
    }
    return res.status(200).json({ message: "Doctor actualizado con éxito." });
  } catch (error) {
    console.error("Error al actualizar el doctor:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

// DELETE (Acceso RÁPIDO y directo)
export const disableDoctorAuth = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user;

    // 1. Referencia al documento (solo para verificar que existe)
    const doctorRef = db
      .collection("hospitales_MedicalHand")
      .doc(authUser.hospitalId)
      .collection("users")
      .doc(id);

    // 2. Verificar que el doctor existe en Firestore antes de borrar su auth
    const doc = await doctorRef.get();
    if (!doc.exists || doc.data().role !== "hospital_doctor") {
      return res.status(404).json({ error: "Doctor no encontrado." });
    }

    // 3. Eliminar la autenticación del usuario. ESTE ES EL ÚNICO PASO DE BORRADO.
    await authAdmin.deleteUser(id);

    // 4. No hacemos nada en Firestore. El documento se queda intacto.

    return res
      .status(200)
      .json({ message: "La autenticación del doctor fue eliminada con éxito." });
  } catch (error) {
    console.error("Error al eliminar la autenticación del doctor:", error);
    // Manejar el caso en que el usuario de auth ya no exista
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: "El usuario de autenticación no fue encontrado. Es posible que ya haya sido eliminado." });
    }
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};
