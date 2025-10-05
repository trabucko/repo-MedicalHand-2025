import { authAdmin, db } from "../config/firebaseAdmin.js";
import admin from "firebase-admin";

//CREATE
export const createDoctor = async (req, res) => {
  console.log("Datos recibidos en el body:", req.body);

  try {
    console.log("Datos recibidos en el body:", req.body);

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

    // Crear usuario en Firebase Auth
    const userRecord = await authAdmin.createUser({ email, password });

    await authAdmin.setCustomUserClaims(userRecord.uid, {
      role: "hospital_doctor",
      hospitalId,
    });

    const fullName = lastName ? `${firstName} ${lastName}` : firstName;

    // Guardar usuario en Firestore
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
      cedula, //  incluimos cedula en la respuesta para chequear que se recibió
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

//READ

export const getAllDoctors = async (req, res) => {
  try {
    const authUser = req.user; // Usuario administrador autenticado

    // Asegurarse que es un administrador
    if (authUser.role !== "hospital_administrador") {
      return res.status(403).json({ error: "No autorizado." });
    }

    const snapshot = await db
      .collection("usuarios_hospitales")
      .where("hospitalId", "==", authUser.hospitalId)
      .where("role", "==", "hospital_doctor")
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]); // Devuelve un array vacío si no hay doctores
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

// READ ONE: Obtiene un doctor por su ID.

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("usuarios_hospitales").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Doctor no encontrado." });
    }

    // Verificar que el admin pertenece al mismo hospital que el doctor
    const authUser = req.user;
    if (doc.data().hospitalId !== authUser.hospitalId) {
      return res
        .status(403)
        .json({ error: "No autorizado para ver este doctor." });
    }

    return res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error al obtener el doctor:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};

//UPDATE: Actualiza los datos de un doctor.

export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const doctorRef = db.collection("usuarios_hospitales").doc(id);
    const doc = await doctorRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Doctor no encontrado." });
    }

    //  Verificar permisos del admin
    const authUser = req.user;
    if (doc.data().hospitalId !== authUser.hospitalId) {
      return res
        .status(403)
        .json({ error: "No autorizado para editar este doctor." });
    }

    // Actualizar datos en Firestore
    await doctorRef.update(data);

    // Si se actualiza el email, también hay que actualizarlo en Firebase Auth
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

// DELETE: Elimina un doctor.

export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctorRef = db.collection("usuarios_hospitales").doc(id);
    const doc = await doctorRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Doctor no encontrado." });
    }

    // Verificar permisos del admin
    const authUser = req.user;
    if (doc.data().hospitalId !== authUser.hospitalId) {
      return res
        .status(403)
        .json({ error: "No autorizado para eliminar este doctor." });
    }

    // **Importante:** Eliminar de ambos, Auth y Firestore
    await authAdmin.deleteUser(id); // Eliminar de Firebase Authentication
    await doctorRef.delete(); // Eliminar de Firestore

    return res.status(200).json({ message: "Doctor eliminado con éxito." });
  } catch (error) {
    console.error("Error al eliminar el doctor:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
};
