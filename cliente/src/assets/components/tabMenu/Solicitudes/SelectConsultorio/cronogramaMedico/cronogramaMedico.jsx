// src/components/CronogramaMedico.jsx

import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./CronogramaMedico.css"; // Crearemos este archivo CSS

const CronogramaMedico = ({ onBack, doctor }) => {
  // Datos de ejemplo para el cronograma.
  // En una aplicación real, estos datos vendrían de una API,
  // filtrados por el doctor o consultorio seleccionado.
  const [schedule, setSchedule] = useState([
    {
      id: 1,
      date: "2025-08-27",
      time: "09:00",
      status: "ocupado",
      patient: "Juan Pérez",
    },
    { id: 2, date: "2025-08-27", time: "09:30", status: "disponible" },
    {
      id: 3,
      date: "2025-08-27",
      time: "10:00",
      status: "ocupado",
      patient: "Ana García",
    },
    { id: 4, date: "2025-08-27", time: "10:30", status: "disponible" },
    { id: 5, date: "2025-08-27", time: "11:00", status: "disponible" },
    { id: 6, date: "2025-08-28", time: "09:00", status: "disponible" },
    {
      id: 7,
      date: "2025-08-28",
      time: "09:30",
      status: "ocupado",
      patient: "Carlos Ruiz",
    },
  ]);

  const handleSelectTimeSlot = (slotId) => {
    // Lógica para manejar la selección de un horario
    const selectedSlot = schedule.find((slot) => slot.id === slotId);
    if (selectedSlot && selectedSlot.status === "disponible") {
      const confirmSelection = window.confirm(
        `¿Deseas seleccionar el horario del ${selectedSlot.date} a las ${selectedSlot.time}?`
      );
      if (confirmSelection) {
        // En una aplicación real, aquí llamarías a una función
        // para guardar la cita en la base de datos.
        alert("Cita confirmada!");
        // Por ejemplo, podrías llamar a una función 'onConfirm'
        // que viene de las props del componente padre.
        // onConfirm(selectedSlot);
      }
    }
  };

  // Agrupar los horarios por fecha para renderizarlos de forma organizada
  const groupedByDate = schedule.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="cronograma-container">
      <div className="cronograma-header">
        <div onClick={onBack} className="back-link">
          <FaArrowLeft className="back-icon" />
          <span>Volver</span>
        </div>
        <h2>Cronograma del Dr. {doctor ? doctor.name : "..."}</h2>
      </div>

      <div className="cronograma-content">
        {Object.entries(groupedByDate).map(([date, slots]) => (
          <div key={date} className="day-schedule">
            <h3 className="day-title">{date}</h3>
            <div className="time-slots">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`time-slot ${slot.status}`}
                  onClick={() => handleSelectTimeSlot(slot.id)}
                >
                  <p className="slot-time">{slot.time}</p>
                  <p className="slot-status">{slot.status}</p>
                  {slot.patient && (
                    <p className="slot-patient">{slot.patient}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CronogramaMedico;
