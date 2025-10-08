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
  const { user } = useAuth();

  // ===================================================================
  // ▼▼▼ LÍNEA DE DEPURACIÓN ▼▼▼
  // Esto nos mostrará el contenido completo del objeto 'user' en la consola.
  console.log("Objeto 'user' recibido en DoctorView:", user);
  // ===================================================================

  const [selectedConsultorio, setSelectedConsultorio] = useState(null);
  const [consultorios, setConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAssigning, setIsAssigning] = useState(null);

  useEffect(() => {
    if (!user || !user.hospitalId) {
      console.log("useEffect DETENIDO: No se encontró user o user.hospitalId.");
      setLoading(false);
      setError("No se pudo identificar el hospital del usuario.");
      return;
    }

    const consultoriosRef = collection(
      db,
      "hospitales_MedicalHand",
      user.hospitalId,
      "dr_office"
    );

    const q = query(
      consultoriosRef,
      where("assignedDoctorId", "in", [null, user.uid])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          `Respuesta de Firestore: Se encontraron ${snapshot.size} consultorios.`
        );
        const consultoriosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setConsultorios(consultoriosData);

        const alreadyAssignedConsultorio = consultoriosData.find(
          (c) => c.assignedDoctorId === user.uid
        );
        if (alreadyAssignedConsultorio) {
          setSelectedConsultorio(alreadyAssignedConsultorio);
        }

        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("¡ERROR AL CONECTAR CON FIRESTORE!", err);
        setError("Error de conexión. Revisa la consola.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSelectConsultorio = async (consultorio) => {
    if (!consultorio.assignedDoctorId) {
      setIsAssigning(consultorio.id);
      const consultorioDocRef = doc(
        db,
        "hospitales_MedicalHand",
        user.hospitalId,
        "dr_office",
        consultorio.id
      );
      try {
        await updateDoc(consultorioDocRef, {
          status: "ocupado",
          assignedDoctorId: user.uid,
          assignedDoctorName: user.fullName,
          lastAssignment: serverTimestamp(),
        });
        setSelectedConsultorio({ ...consultorio, assignedDoctorId: user.uid });
      } catch (err) {
        console.error("Error al asignar el consultorio:", err);
        setError("No se pudo asignar el consultorio. Inténtelo de nuevo.");
      } finally {
        setIsAssigning(null);
      }
    } else if (consultorio.assignedDoctorId === user.uid) {
      setSelectedConsultorio(consultorio);
    }
  };

  const handleBack = () => {
    setSelectedConsultorio(null);
  };

  if (loading) {
    return (
      <div className="doctor-view-loading">
        <p>Verificando asignación de consultorio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-view-error">
        <h3>Ha ocurrido un error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!selectedConsultorio) {
    return (
      <DoctorConsultorioSelector
        consultorios={consultorios}
        onSelect={handleSelectConsultorio}
        isAssigning={isAssigning}
      />
    );
  }

  return (
    <div className="doctor-schedule-manager-wrapper">
      <div className="schedule-manager-header">
        <h2 className="h2-header">Horario para: {selectedConsultorio.name}</h2>
        {selectedConsultorio.location && (
          <p>📍 {selectedConsultorio.location}</p>
        )}
      </div>
      <DoctorScheduleManager
        hospitalId={user.hospitalId}
        consultorio={selectedConsultorio}
      />
    </div>
  );
};

export default DoctorView;
