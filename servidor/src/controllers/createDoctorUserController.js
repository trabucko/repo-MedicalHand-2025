export const createDoctor = async (req, res) => {
  try {
    const { email, password, firstName, lastName, Especialidad } = req.body;
    const authUser = req.user;

    // Validar que quien crea sea admin
    if (authUser.role !== "hospital_administrador") {
      return res
        .status(403)
        .json({ error: "No autorizado. Debes ser administrador." });
    }

    const hospitalId = authUser.hospitalId;

    // Crear usuario Doctor
    const userRecord = await admin.auth().createUser({ email, password });

    // Asignar claims personalizados
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "hospital_doctor",
      hospitalId,
    });

    // Crear nombre completo
    const fullName = lastName ? `${firstName} ${lastName}` : firstName || "";

    // Guardar en Firestore
    await db.collection("usuarios_hospitales").doc(userRecord.uid).set({
      email,
      role: "hospital_doctor",
      hospitalId,
      fullName, // <-- guardamos el nombre completo
      Especialidad,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      message: "Usuario hospital_doctor creado con éxito",
      email,
      hospitalId,
      fullName,
      Especialidad,
    });
  } catch (error) {
    console.error("Error creando usuario hospital_doctor:", error);
    return res.status(500).json({ error: error.message });
  }
};
