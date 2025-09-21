// src/components/DoctorView.jsx

import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import DoctorScheduleManager from "./DoctorScheduleManager";
import DoctorConsultorioSelector from "../HorarioMedico/DoctorConsultorio/DoctorConsultorioSelector";
import "./DoctorView.css";

const DoctorView = () => {
  // --- ESTADOS ---
  // Gestiona el estado completo de la vista del doctor
  const { user } = useAuth();
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);
  const [consultorios, setConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAssigning, setIsAssigning] = useState(null); // Para feedback visual al asignar

  // --- EFECTOS (Carga de Datos) ---
  // Se suscribe a los consultorios del hospital del doctor en tiempo real
  useEffect(() => {
    if (!user || !user.claims?.hospitalId) {
      setLoading(false);
      setError("No se pudo identificar el hospital del usuario.");
      return;
    }

    // Crea la referencia a la subcolección de consultorios del hospital
    const consultoriosRef = collection(
      db,
      "hospitals",
      user.claims.hospitalId,
      "dr_office"
    );

    // Crea una consulta eficiente que filtra en la base de datos (servidor)
    // Solo trae los consultorios que están libres (null) o que ya pertenecen al doctor actual
    const q = query(
      consultoriosRef,
      where("assignedDoctorId", "in", [null, user.uid])
    );

    // onSnapshot escucha los cambios en tiempo real
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const consultoriosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConsultorios(consultoriosData);
        setLoading(false);
        setError(""); // Limpia cualquier error anterior si la carga es exitosa
      },
      (err) => {
        // Manejo de errores de la suscripción de Firestore
        console.error("Error escuchando consultorios:", err);
        setError("Error de conexión al obtener consultorios.");
        setLoading(false);
      }
    );

    // Función de limpieza: se desuscribe cuando el componente se desmonta
    return () => unsubscribe();
  }, [user]); // Se vuelve a ejecutar si el usuario cambia

  // --- MANEJADORES DE EVENTOS ---

  // Se ejecuta cuando el doctor selecciona un consultorio de la lista
  const handleSelectConsultorio = async (consultorio) => {
    // Si el consultorio está libre, lo asigna al doctor actual
    if (!consultorio.assignedDoctorId) {
      setIsAssigning(consultorio.id); // Activa el estado de carga para esta tarjeta

      const consultorioDocRef = doc(
        db,
        "hospitals",
        user.claims.hospitalId,
        "dr_office",
        consultorio.id
      );

      const dataToUpdate = {
        status: "ocupado",
        assignedDoctorId: user.uid,
        assignedDoctorName: user.fullName,
        lastAssignment: serverTimestamp(),
      };

      try {
        await updateDoc(consultorioDocRef, dataToUpdate);
      } catch (err) {
        console.error("Error al asignar el consultorio:", err);
        setError("No se pudo asignar el consultorio. Inténtelo de nuevo.");
      } finally {
        setIsAssigning(null); // Desactiva el estado de carga al finalizar
      }
    }
    // Establece el consultorio seleccionado para cambiar la vista
    setSelectedConsultorio(consultorio);
  };

  // Permite al doctor volver a la pantalla de selección
  const handleBack = () => {
    setSelectedConsultorio(null);
  };

  // --- LÓGICA DE RENDERIZADO ---

  // 1. Muestra un estado de carga inicial
  if (loading) {
    return (
      <div className="doctor-view-loading">
        <p>Cargando consultorios disponibles...</p>
        {/* Aquí podrías poner tu componente GlobalLoader si lo deseas */}
      </div>
    );
  }

  // 2. Muestra un mensaje de error si algo falló
  if (error) {
    return (
      <div className="doctor-view-error">
        <h3>Ha ocurrido un error</h3>
        <p>{error}</p>
      </div>
    );
  }

  // 3. Si no hay un consultorio seleccionado, muestra la lista para elegir
  if (!selectedConsultorio) {
    return (
      <DoctorConsultorioSelector
        consultorios={consultorios}
        onSelect={handleSelectConsultorio}
        isAssigning={isAssigning}
      />
    );
  }

  // 4. Si ya se seleccionó un consultorio, muestra el gestor de horarios
  return (
    <div className="doctor-schedule-manager-wrapper">
      <button onClick={handleBack} className="back-button">
        &larr; Volver a la selección
      </button>
      <div className="schedule-manager-header">
        <h2 className="h2-header">Horario para: {selectedConsultorio.name}</h2>
        {selectedConsultorio.location && (
          <p>📍 {selectedConsultorio.location}</p>
        )}
      </div>
      <DoctorScheduleManager
        hospitalId={user.claims.hospitalId}
        consultorio={selectedConsultorio}
      />
    </div>
  );
};

export default DoctorView;
