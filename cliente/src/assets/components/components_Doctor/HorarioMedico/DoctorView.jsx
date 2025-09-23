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
  const { user } = useAuth();
  // Este estado ahora se inicializará desde la carga de datos si ya existe una asignación
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);
  const [consultorios, setConsultorios] = useState([]);
  const [loading, setLoading] = useState(true); // Se mantiene en true hasta que se verifique la asignación
  const [error, setError] = useState("");
  const [isAssigning, setIsAssigning] = useState(null);

  // --- EFECTOS (Carga de Datos y Verificación de Asignación) ---
  // src/components/DoctorView.jsx

  // --- EFECTOS (Carga de Datos y Verificación de Asignación) ---
  useEffect(() => {
    if (!user || !user.claims?.hospitalId) {
      console.log(
        "useEffect DETENIDO: No se encontró user o user.claims.hospitalId."
      );
      setLoading(false);
      setError("No se pudo identificar el hospital del usuario.");
      return;
    }

    // --- PASO 1: Verificando los datos que usaremos en la consulta ---
    console.log("Iniciando la carga de datos con:");
    console.log("-> Hospital ID:", user.claims.hospitalId);
    console.log("-> Doctor UID:", user.uid);

    const consultoriosRef = collection(
      db,
      "hospitals",
      user.claims.hospitalId,
      "dr_office"
    );

    const q = query(
      consultoriosRef,
      where("assignedDoctorId", "in", [null, user.uid])
    );

    console.log("Ejecutando consulta en Firestore...");

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // --- PASO 2: Verificando qué respondió Firestore ---
        console.log(
          `Respuesta de Firestore: Se encontraron ${snapshot.size} consultorios.`
        );

        if (snapshot.empty) {
          console.warn(
            "La consulta no devolvió resultados. Revisa que el Hospital ID sea correcto y que haya documentos que cumplan la condición."
          );
        }

        const consultoriosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // --- PASO 3: Verificando los datos finales ---
        console.log("Datos procesados:", consultoriosData);

        setConsultorios(consultoriosData);

        // ... el resto de tu lógica para encontrar el ya asignado ...
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
        // --- PASO 4: ¡Muy importante! Verificando si hubo un error ---
        console.error("¡ERROR AL CONECTAR CON FIRESTORE!", err);
        setError(
          "Error de conexión. Revisa la consola para más detalles (podría ser un problema de permisos/reglas de seguridad)."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // --- MANEJADORES DE EVENTOS ---

  // Esta función ahora solo se llamará para consultorios que están libres
  const handleSelectConsultorio = async (consultorio) => {
    // La lógica de asignación solo se ejecuta si se hace clic en un consultorio libre
    if (!consultorio.assignedDoctorId) {
      setIsAssigning(consultorio.id);
      const consultorioDocRef = doc(
        db,
        "hospitals",
        user.claims.hospitalId,
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
        // Una vez asignado, lo establecemos como seleccionado para cambiar la vista
        setSelectedConsultorio({ ...consultorio, assignedDoctorId: user.uid });
      } catch (err) {
        console.error("Error al asignar el consultorio:", err);
        setError("No se pudo asignar el consultorio. Inténtelo de nuevo.");
      } finally {
        setIsAssigning(null);
      }
    } else if (consultorio.assignedDoctorId === user.uid) {
      // Si el doctor hace clic en su propio consultorio, simplemente lo seleccionamos
      setSelectedConsultorio(consultorio);
    }
  };

  // Permite al doctor volver a la pantalla de selección.
  // Podríamos incluso añadir una lógica para "liberar" el consultorio aquí si fuera necesario.
  const handleBack = () => {
    setSelectedConsultorio(null);
  };

  // --- LÓGICA DE RENDERIZADO (sin cambios) ---
  // El flujo de renderizado ya funciona perfectamente con la nueva lógica,
  // porque se basa en los estados `loading`, `error` y `selectedConsultorio`.

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
        hospitalId={user.claims.hospitalId}
        consultorio={selectedConsultorio}
      />
    </div>
  );
};

export default DoctorView;
