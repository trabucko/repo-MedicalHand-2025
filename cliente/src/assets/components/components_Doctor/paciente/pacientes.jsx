// src/assets/components/components_Doctor/paciente/pacientes.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext"; // Ajusta esta ruta si es necesario
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  Timestamp,
  query,
  orderBy,
  getDocs,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import Swal from "sweetalert2";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import PacienteForm from "./PacienteForm/pacienteForm";
import { CircularProgress, Typography } from "@mui/material";

// --- Helper Functions ---
const calcularEdad = (dateOfBirth) => {
  if (!dateOfBirth || !dateOfBirth.toDate) return "";
  const birthDate = dateOfBirth.toDate();
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age.toString();
};

const Paciente = () => {
  const { patientId } = useParams();
  const [pacienteData, setPacienteData] = useState(null);
  const [historial, setHistorial] = useState({ exams: [], notes: [] });
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && currentUser?.hospitalId) {
        try {
          const doctorRef = doc(
            db,
            "hospitales_MedicalHand",
            currentUser.hospitalId,
            "users",
            user.uid
          );
          const doctorSnap = await getDoc(doctorRef);

          if (doctorSnap.exists()) {
            const doctorProfile = doctorSnap.data();
            console.log("Perfil del doctor encontrado:", doctorProfile);

            setDoctor({
              uid: user.uid,
              email: user.email,
              firstName: doctorProfile.firstName,
              lastName: doctorProfile.lastName,
              hospitalId: currentUser.hospitalId,
              // ✅ CAMBIO CLAVE: Se usa el nombre de campo correcto 'assignedOfficeId'
              drOfficeId: doctorProfile.assignedOfficeId,
            });
          } else {
            console.error(
              "No se encontró un perfil de doctor en la ruta:",
              doctorRef.path
            );
            setDoctor({
              uid: user.uid,
              email: user.email,
              hospitalId: currentUser.hospitalId,
            });
          }
        } catch (error) {
          console.error("Error al obtener el perfil del doctor:", error);
          setDoctor(null);
        }
      } else {
        setDoctor(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!patientId) return;
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const patientRef = doc(db, "usuarios_movil", patientId);
        const patientSnap = await getDoc(patientRef);
        if (!patientSnap.exists())
          throw new Error("No se encontró al paciente.");
        const data = patientSnap.data();

        const initialData = {
          nombre: data.personalInfo?.firstName || "",
          apellido: data.personalInfo?.lastName || "",
          email: data.email || "",
          edad: calcularEdad(data.personalInfo?.dateOfBirth),
          genero: data.personalInfo?.sex || "",
          telefono: data.contactInfo?.phoneNumber || "",
          direccion: data.contactInfo?.address || "",
          bloodType: data.medicalInfo?.bloodType || "",
          knownAllergies: data.medicalInfo?.knownAllergies || "",
          chronicDiseases: data.medicalInfo?.chronicDiseases || [],
          motivoConsulta: "",
          descripcionSintomas: "",
          tiempoEnfermedad: "",
          tratamientoPrevio: "",
          estiloVida: "",
          sintomas: "",
          diagnostico: "",
          observaciones: "",
          tratamiento: "",
          medicamentos: [],
          examsRequested: [],
          notes: [],
          nuevoMedicamento: "",
          dosis: "",
          frecuencia: "",
          duracion: "",
          nuevoExamen: "",
          nuevaNotaTipo: "comun",
          nuevaNotaTexto: "",
        };
        setPacienteData(initialData);

        const consultasRef = collection(
          db,
          "expedientes",
          patientId,
          "consultas"
        );
        const q = query(consultasRef, orderBy("fechaConsulta", "asc"));
        const consultaSnap = await getDocs(q);
        let historialExamenes = [];
        let historialNotas = [];

        if (!consultaSnap.empty) {
          consultaSnap.docs.forEach((doc) => {
            const consulta = doc.data();
            const exams =
              consulta.examsRequested || consulta.examenesSolicitados;
            if (Array.isArray(exams)) {
              historialExamenes.push(...exams);
            }
            const notes = consulta.notes || consulta.notas;
            if (Array.isArray(notes)) {
              historialNotas.push(...notes);
            }
          });
        }
        setHistorial({ exams: historialExamenes, notes: historialNotas });
      } catch (error) {
        console.error("Error al cargar datos del paciente:", error);
        Swal.fire(
          "Error",
          `No se pudieron cargar los datos: ${error.message}`,
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [patientId]);

  const displayData = useMemo(() => {
    if (!pacienteData) return null;
    const uniqueById = (arr) => [
      ...new Map(
        arr.map((item) => item && item.id && [item.id, item])
      ).values(),
    ];
    const todosLosExamenes = uniqueById([
      ...historial.exams,
      ...pacienteData.examsRequested,
    ]);
    const todasLasNotas = uniqueById([
      ...historial.notes,
      ...pacienteData.notes,
    ]);
    return {
      ...pacienteData,
      examsRequested: todosLosExamenes.sort(
        (a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
      ),
      notes: todasLasNotas.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      ),
    };
  }, [pacienteData, historial]);

  const handleInputChange = useCallback((field, value) => {
    setPacienteData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleTabChange = useCallback((_, newIndex) => {
    setActiveTab(newIndex);
  }, []);

  const handleGuardar = async () => {
    if (isSaving) return;
    setIsSaving(true);
    Swal.fire({
      title: "Guardando consulta...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const consultaRef = collection(db, "consultas");
      const consultaData = {
        fechaConsulta: Timestamp.fromDate(new Date()),
        hospital_id: doctor?.hospitalId || "N/A",
        patient_uid: patientId,
        doctor_uid: doctor?.uid || "N/A",
        doctor_name: `${doctor?.firstName || ""} ${
          doctor?.lastName || ""
        }`.trim(),
        motivoConsulta: pacienteData.motivoConsulta,
        descripcionSintomas: pacienteData.descripcionSintomas,
        tiempoEnfermedad: pacienteData.tiempoEnfermedad,
        tratamientoPrevio: pacienteData.tratamientoPrevio,
        estiloVida: pacienteData.estiloVida,
        sintomas: pacienteData.sintomas,
        diagnostico: pacienteData.diagnostico,
        observaciones: pacienteData.observaciones,
        tratamiento: pacienteData.tratamiento,
        medicamentos: pacienteData.medicamentos,
        examsRequested: pacienteData.examsRequested,
        notes: pacienteData.notes,
      };
      await addDoc(consultaRef, consultaData);

      const patientRef = doc(db, "usuarios_movil", patientId);
      const infoBaseData = {
        "medicalInfo.bloodType": pacienteData.bloodType,
        "medicalInfo.knownAllergies": pacienteData.knownAllergies,
        "medicalInfo.chronicDiseases": pacienteData.chronicDiseases,
      };
      await updateDoc(patientRef, infoBaseData);

      if (doctor?.hospitalId && doctor?.drOfficeId) {
        const appointmentsRef = collection(
          db,
          "hospitales_MedicalHand",
          doctor.hospitalId,
          "dr_office",
          doctor.drOfficeId,
          "appointments"
        );
        const q = query(
          appointmentsRef,
          where("patientUid", "==", patientId),
          where("status", "==", "confirmada")
        );
        const appointmentSnapshot = await getDocs(q);

        if (!appointmentSnapshot.empty) {
          const updatePromises = appointmentSnapshot.docs.map(
            (appointmentDoc) =>
              updateDoc(appointmentDoc.ref, { status: "finalizada" })
          );
          await Promise.all(updatePromises);
          console.log(
            `${appointmentSnapshot.size} cita(s) actualizada(s) a 'finalizada'.`
          );
        } else {
          console.warn(
            "No se encontraron citas 'confirmadas' para este paciente."
          );
        }
      } else {
        console.error(
          "Faltan datos del doctor (hospitalId, drOfficeId) para actualizar citas."
        );
      }

      Swal.fire(
        "Guardado",
        "La consulta ha sido registrada y las citas actualizadas.",
        "success"
      );
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire(
        "Error",
        `Ocurrió un error al guardar: ${error.message}`,
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const agregarMedicamento = useCallback(() => {
    if (!pacienteData.nuevoMedicamento?.trim()) return;
    const nuevoMed = {
      id: `med_${Date.now()}`,
      nombre: pacienteData.nuevoMedicamento,
      dosis: pacienteData.dosis || "N/A",
      frecuencia: pacienteData.frecuencia || "N/A",
      duracion: pacienteData.duracion || "N/A",
    };
    setPacienteData((prev) => ({
      ...prev,
      medicamentos: [...prev.medicamentos, nuevoMed],
      nuevoMedicamento: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
    }));
  }, [pacienteData]);

  const eliminarMedicamento = useCallback((id) => {
    setPacienteData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((med) => med.id !== id),
    }));
  }, []);

  const agregarExamen = useCallback(() => {
    if (!pacienteData.nuevoExamen?.trim()) return;
    const nuevoExamen = {
      id: `ex_${Date.now()}`,
      nombre: pacienteData.nuevoExamen,
      estado: "solicitado",
      fechaSolicitud: new Date().toISOString(),
      resultados: [],
    };
    setPacienteData((prev) => ({
      ...prev,
      examsRequested: [...prev.examsRequested, nuevoExamen],
      nuevoExamen: "",
    }));
  }, [pacienteData]);

  const eliminarExamen = useCallback((id) => {
    setPacienteData((prev) => ({
      ...prev,
      examsRequested: prev.examsRequested.filter((ex) => ex.id !== id),
    }));
  }, []);

  const agregarNota = useCallback(() => {
    if (!pacienteData.nuevaNotaTexto?.trim()) return;
    const autorNota =
      doctor?.firstName && doctor?.lastName
        ? `${doctor.firstName} ${doctor.lastName}`
        : doctor?.email || "Médico";

    const nuevaNota = {
      id: `nota_${Date.now()}`,
      texto: pacienteData.nuevaNotaTexto,
      tipo: pacienteData.nuevaNotaTipo || "comun",
      fecha: new Date().toISOString(),
      autor: autorNota,
    };

    setPacienteData((prev) => ({
      ...prev,
      notes: [nuevaNota, ...prev.notes],
      nuevaNotaTexto: "",
      nuevaNotaTipo: "comun",
    }));
  }, [pacienteData, doctor]);

  const eliminarNota = useCallback((id) => {
    setPacienteData((prev) => ({
      ...prev,
      notes: prev.notes.filter((nota) => nota.id !== id),
    }));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (!displayData) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography color="error">Error: Paciente no encontrado.</Typography>
      </div>
    );
  }

  return (
    <PacienteForm
      pacienteData={displayData}
      activeTab={activeTab}
      handleTabChange={handleTabChange}
      handleInputChange={handleInputChange}
      handleGuardar={handleGuardar}
      agregarMedicamento={agregarMedicamento}
      eliminarMedicamento={eliminarMedicamento}
      agregarExamen={agregarExamen}
      eliminarExamen={eliminarExamen}
      agregarNota={agregarNota}
      eliminarNota={eliminarNota}
      marcarExamenCompletado={() => {}}
      descargarArchivo={() => {}}
      eliminarExamenArchivo={() => {}}
    />
  );
};

export default Paciente;
