// src/components/DoctorView.jsx

import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useOutletContext } from "react-router-dom"; // 👈 Se importa para recibir datos del layout
import DoctorScheduleManager from "./DoctorScheduleManager";
import DoctorConsultorioSelector from "../HorarioMedico/DoctorConsultorio/DoctorConsultorioSelector";
import "./DoctorView.css";

const DoctorView = () => {
  const { user } = useAuth();

  // 🔹 Traemos desde el Outlet context lo que manda DoctorLayout.jsx
  // Toda la lógica de fetching y selección ahora viene de un componente padre.
  const {
    selectedConsultorio,
    availableConsultorios,
    handleSelectConsultorio,
    isAssigning, // Asumiendo que el estado de carga también viene del padre
  } = useOutletContext();

  // 🧩 DEBUG para confirmar que el contexto llega bien
  console.log("🧩 Contexto recibido desde DoctorLayout:");
  console.log("selectedConsultorio:", selectedConsultorio);
  console.log("availableConsultorios:", availableConsultorios);
  console.log("handleSelectConsultorio:", handleSelectConsultorio);

  // ⚙️ El estado local ahora es mínimo, solo para errores o cargas propias de esta vista si las hubiera.
  // La lógica principal de carga/error la maneja el componente padre.
  const [loading] = useState(false);
  const [error] = useState("");

  // ===================================================================
  // ▼▼▼ CÓDIGO ELIMINADO EN ESTA REFACTORIZACIÓN ▼▼▼
  //
  // 1. Todo el bloque `useEffect` que se conectaba a Firestore para
  //    buscar consultorios ha sido removido.
  //
  // 2. La función `handleSelectConsultorio` que actualizaba el
  //    documento en Firestore también fue removida.
  //
  // 3. La función `handleBack` fue removida.
  //
  // 4. Múltiples estados locales como `consultorios`, `loading`,
  //    `error` y `isAssigning` fueron eliminados porque ahora
  //    se gestionan en el componente padre.
  //
  // ===================================================================

  if (loading) {
    return (
      <div className="doctor-view-loading">
        <p>Cargando vista del doctor...</p>
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

  // 🔸 Si aún no hay consultorio seleccionado, mostramos el selector.
  //    Este componente ahora recibe los datos y la función desde el contexto.
  if (!selectedConsultorio) {
    return (
      <DoctorConsultorioSelector
        consultorios={availableConsultorios || []}
        onSelect={handleSelectConsultorio}
        isAssigning={isAssigning} // El estado de carga de un botón específico
      />
    );
  }

  // 🔹 Si ya hay un consultorio seleccionado, mostramos el gestor de horarios.
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
