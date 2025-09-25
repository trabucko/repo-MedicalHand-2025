// src/assets/components/components_Doctor/paciente/pacientes.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import Swal from "sweetalert2";

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
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- LÓGICA DE DATOS ---
  useEffect(() => {
    if (!patientId) return;

    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const patientRef = doc(db, "usuarios_movil", patientId);
        const patientSnap = await getDoc(patientRef);

        if (!patientSnap.exists()) {
          throw new Error("No se encontró al paciente.");
        }

        const data = patientSnap.data();
        let initialData = {
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
          examenesSolicitados: [],
          notas: [],
          nuevoMedicamento: "",
          dosis: "",
          frecuencia: "",
          duracion: "",
          nuevoExamen: "",
          nuevaNotaTipo: "comun",
          nuevaNotaTexto: "",
        };

        const consultasRef = collection(
          db,
          "expedientes",
          patientId,
          "consultas"
        );
        const q = query(
          consultasRef,
          orderBy("fechaConsulta", "desc"),
          limit(1)
        );
        const consultaSnap = await getDocs(q);

        if (!consultaSnap.empty) {
          const ultimaConsulta = consultaSnap.docs[0].data();
          initialData = { ...initialData, ...ultimaConsulta };
        }

        setPacienteData(initialData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        Swal.fire("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

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
      title: "Guardando...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const consultaRef = collection(db, "expedientes", patientId, "consultas");
      const consultaData = {
        fechaConsulta: Timestamp.fromDate(new Date()),
        motivoConsulta: pacienteData.motivoConsulta,
        descripcionSintomas: pacienteData.descripcionSintomas,
        tiempoEnfermedad: pacienteData.tiempoEnfermedad,
        tratamientoPrevio: pacienteData.tratamientoPrevio,
        estiloVida: pacienteData.estiloVida,
        sintomas: pacienteData.sintomas,
        diagnostico: pacienteData.diagnostico,
        observaciones: pacienteData.observaciones,
        tratamiento: pacienteData.tratamiento,
        prescriptions: pacienteData.medicamentos,
        examsRequested: pacienteData.examenesSolicitados,
        notes: pacienteData.notas,
      };
      await addDoc(consultaRef, consultaData);

      const patientRef = doc(db, "usuarios_movil", patientId);
      const infoBaseData = {
        "medicalInfo.bloodType": pacienteData.bloodType,
        "medicalInfo.knownAllergies": pacienteData.knownAllergies,
        "medicalInfo.chronicDiseases": pacienteData.chronicDiseases,
      };
      await updateDoc(patientRef, infoBaseData);

      Swal.fire(
        "Guardado",
        "La consulta ha sido registrada y el expediente actualizado.",
        "success"
      );
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire("Error", "Ocurrió un error al guardar los cambios.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ --- FUNCIONES COMPLETAS AÑADIDAS AQUÍ ---

  const agregarMedicamento = () => {
    if (!pacienteData.nuevoMedicamento?.trim()) return;
    const nuevoMed = {
      id: Date.now(),
      nombre: pacienteData.nuevoMedicamento,
      dosis: pacienteData.dosis,
      frecuencia: pacienteData.frecuencia,
      duracion: pacienteData.duracion,
    };
    setPacienteData((prev) => ({
      ...prev,
      medicamentos: [...prev.medicamentos, nuevoMed],
      nuevoMedicamento: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
    }));
  };

  const eliminarMedicamento = (id) => {
    setPacienteData((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((med) => med.id !== id),
    }));
  };

  const agregarExamen = () => {
    if (!pacienteData.nuevoExamen?.trim()) return;
    const nuevoExamen = {
      id: Date.now(),
      nombre: pacienteData.nuevoExamen,
      estado: "solicitado",
      fechaSolicitud: new Date().toLocaleDateString("es-ES"),
      resultados: [],
    };
    setPacienteData((prev) => ({
      ...prev,
      examenesSolicitados: [...prev.examenesSolicitados, nuevoExamen],
      nuevoExamen: "",
    }));
  };

  const eliminarExamen = (id) => {
    setPacienteData((prev) => ({
      ...prev,
      examenesSolicitados: prev.examenesSolicitados.filter(
        (ex) => ex.id !== id
      ),
    }));
  };

  const agregarNota = () => {
    if (!pacienteData.nuevaNotaTexto?.trim()) return;
    const nuevaNota = {
      id: Date.now(),
      texto: pacienteData.nuevaNotaTexto,
      tipo: pacienteData.nuevaNotaTipo || "comun",
      fecha: new Date().toLocaleDateString("es-ES"),
      autor: "Dr. García", // Reemplazar con datos reales del doctor
    };
    setPacienteData((prev) => ({
      ...prev,
      notas: [nuevaNota, ...prev.notas],
      nuevaNotaTexto: "",
      nuevaNotaTipo: "comun",
    }));
  };

  const eliminarNota = (id) => {
    setPacienteData((prev) => ({
      ...prev,
      notas: prev.notas.filter((nota) => nota.id !== id),
    }));
  };

  // --- RENDERIZADO ---
  if (loading) {
    return (
      <div className="px-center-container">
        <CircularProgress />
      </div>
    );
  }

  if (!pacienteData) {
    return (
      <div className="px-center-container">
        <Typography color="error">Error: Paciente no encontrado.</Typography>
      </div>
    );
  }

  return (
    <PacienteForm
      pacienteData={pacienteData}
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
