// src/assets/components/components_Doctor/paciente/pacientes.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
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
import { db, storage } from "../../../../firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import Swal from "sweetalert2";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import PacienteForm from "./PacienteForm/pacienteForm";
import { CircularProgress, Typography } from "@mui/material";

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
  const [nuevaConsulta, setNuevaConsulta] = useState(null);
  const [historialAgregado, setHistorialAgregado] = useState({
    exams: [],
    notes: [],
  });
  const [consultasPasadas, setConsultasPasadas] = useState([]);
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
            setDoctor({
              uid: user.uid,
              email: user.email,
              firstName: doctorProfile.firstName,
              lastName: doctorProfile.lastName,
              hospitalId: currentUser.hospitalId,
              drOfficeId: doctorProfile.assignedOfficeId,
            });
          } else {
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

        const consultasRef = collection(db, "consultas");
        const q = query(
          consultasRef,
          where("patient_uid", "==", patientId),
          orderBy("fechaConsulta", "desc")
        );
        const consultaSnap = await getDocs(q);

        const allConsultas = [];
        let historialExamenes = [];
        let historialNotas = [];

        if (!consultaSnap.empty) {
          consultaSnap.docs.forEach((doc) => {
            allConsultas.push({ id: doc.id, ...doc.data() });

            const consulta = doc.data();
            if (Array.isArray(consulta.examsRequested)) {
              historialExamenes.push(...consulta.examsRequested);
            }
            if (Array.isArray(consulta.notes)) {
              historialNotas.push(...consulta.notes);
            }
          });
        }
        setConsultasPasadas(allConsultas);
        setHistorialAgregado({
          exams: historialExamenes,
          notes: historialNotas,
        });

        const initialConsulta = {
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
          archivoParaSubir: null,
          examenSeleccionadoId: "",
        };
        setNuevaConsulta(initialConsulta);
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

  const datosParaVista = useMemo(() => {
    if (!nuevaConsulta) return null;

    const uniqueById = (arr) => [
      ...new Map(
        arr.map((item) => item && item.id && [item.id, item])
      ).values(),
    ];

    const todosLosExamenes = uniqueById([
      ...historialAgregado.exams,
      ...nuevaConsulta.examsRequested,
    ]);
    const todasLasNotas = uniqueById([
      ...historialAgregado.notes,
      ...nuevaConsulta.notes,
    ]);

    return {
      ...nuevaConsulta,
      examsRequested: todosLosExamenes.sort(
        (a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud)
      ),
      notes: todasLasNotas.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      ),
    };
  }, [nuevaConsulta, historialAgregado]);

  const handleInputChange = useCallback((field, value) => {
    setNuevaConsulta((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleTabChange = useCallback((_, newIndex) => {
    setActiveTab(newIndex);
  }, []);

  const handleFileChange = useCallback((e) => {
    if (e.target.files[0]) {
      setNuevaConsulta((prev) => ({
        ...prev,
        archivoParaSubir: e.target.files[0],
      }));
    }
  }, []);

  const eliminarExamenArchivo = useCallback(async (examId, fileUrl) => {
    // ... (esta función ya está correcta)
  }, []);

  const handleGuardar = async () => {
    // ... (esta función ya está correcta)
  };

  const agregarExamen = useCallback(() => {
    if (!nuevaConsulta.nuevoExamen?.trim()) return;
    const nuevoExamen = {
      id: `ex_${Date.now()}`,
      nombre: nuevaConsulta.nuevoExamen,
      estado: "solicitado",
      fechaSolicitud: new Date().toISOString(),
      resultados: [],
    };
    setNuevaConsulta((prev) => ({
      ...prev,
      examsRequested: [nuevoExamen, ...prev.examsRequested],
      nuevoExamen: "",
    }));
  }, [nuevaConsulta]);

  const eliminarExamen = useCallback((id) => {
    setNuevaConsulta((prev) => ({
      ...prev,
      examsRequested: prev.examsRequested.filter((ex) => ex.id !== id),
    }));
  }, []);

  const agregarNota = useCallback(() => {
    if (!nuevaConsulta.nuevaNotaTexto?.trim()) return;
    const autorNota =
      doctor?.firstName && doctor?.lastName
        ? `${doctor.firstName} ${doctor.lastName}`
        : doctor?.email || "Médico";
    const nuevaNota = {
      id: `nota_${Date.now()}`,
      texto: nuevaConsulta.nuevaNotaTexto,
      tipo: nuevaConsulta.nuevaNotaTipo || "comun",
      fecha: new Date().toISOString(),
      autor: autorNota,
    };
    setNuevaConsulta((prev) => ({
      ...prev,
      notes: [nuevaNota, ...prev.notes],
      nuevaNotaTexto: "",
      nuevaNotaTipo: "comun",
    }));
  }, [nuevaConsulta, doctor]);

  const eliminarNota = useCallback((id) => {
    setNuevaConsulta((prev) => ({
      ...prev,
      notes: prev.notes.filter((nota) => nota.id !== id),
    }));
  }, []);

  const agregarMedicamento = useCallback(() => {
    if (!nuevaConsulta.nuevoMedicamento?.trim()) return;
    const nuevoMed = {
      id: `med_${Date.now()}`,
      nombre: nuevaConsulta.nuevoMedicamento,
      dosis: nuevaConsulta.dosis || "N/A",
      frecuencia: nuevaConsulta.frecuencia || "N/A",
      duracion: nuevaConsulta.duracion || "N/A",
    };
    setNuevaConsulta((prev) => ({
      ...prev,
      medicamentos: [...prev.medicamentos, nuevoMed],
      nuevoMedicamento: "",
      dosis: "",
      frecuencia: "",
      duracion: "",
    }));
  }, [nuevaConsulta]);

  const eliminarMedicamento = useCallback((id) => {
    setNuevaConsulta((prev) => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((med) => med.id !== id),
    }));
  }, []);

  if (loading || !datosParaVista) {
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

  return (
    <PacienteForm
      pacienteData={datosParaVista}
      consultasPrevias={consultasPasadas}
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
      handleFileChange={handleFileChange}
      eliminarExamenArchivo={eliminarExamenArchivo}
    />
  );
};

export default Paciente;
