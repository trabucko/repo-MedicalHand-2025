// src/components/SelectConsultorio.jsx

import React, { useState, useEffect } from "react";
import "./selectConsultorio.css";
import { FaArrowLeft, FaHospital } from "react-icons/fa";
import { db } from "../../../../../firebase"; // Asegúrate de que la ruta a tu configuración de Firebase sea correcta
import { collection, query, where, getDocs } from "firebase/firestore";

const SelectConsultorio = ({
  onClose,
  onSelectOffice,
  isReprogramming = false,
  appointmentRequest, // <-- ADD THIS LINE
}) => {
  const [consultorios, setConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);

  useEffect(() => {
    const fetchConsultorios = async () => {
      try {
        const consultoriosRef = collection(
          db,
          "hospitals",
          "HL_FERNANDO_VP",
          "dr_office"
        );
        const q = query(consultoriosRef, where("status", "==", "ocupado"));
        const querySnapshot = await getDocs(q);

        const consultoriosList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setConsultorios(consultoriosList);
      } catch (error) {
        console.error("Error al obtener los consultorios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultorios();
  }, []);

  const handleSelectConsultorio = (cons) => {
    if (!appointmentRequest) {
      console.error("No se recibió appointmentRequest en SelectConsultorio");
      return;
    }

    onSelectOffice({
      consultorio: cons,
      appointment: appointmentRequest, // 🔥 mandamos ambos
    });
  };

  if (loading) {
    return (
      <div className="consultorio-container">
        <div className="consultorio-header">
          <div onClick={onClose} className="back-link">
            <FaArrowLeft className="back-icon" />
            <span>Volver</span>
          </div>
          <div className="consultorio-title">
            <h2>Cargando Consultorios...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="consultorio-container">
      <div className="consultorio-header">
        <div onClick={onClose} className="back-link">
          <FaArrowLeft className="back-icon" />
          <span>Volver</span>
        </div>
        <div className="consultorio-title">
          <h2>Seleccione un Consultorio</h2>
        </div>
      </div>
      <div className="consultorio-list-container">
        <ul className="consultorio-list">
          {consultorios.map((cons) => (
            <li
              key={cons.id}
              className="consultorio-list-item available"
              onClick={() => handleSelectConsultorio(cons)}
            >
              <div className="consultorio-icon-wrapper">
                <FaHospital />
              </div>
              <div className="consultorio-details">
                {/* *** CAMBIO 2: Mostrar el nombre del consultorio desde el campo 'name' *** */}
                <div className="consultorio-number">{cons.name}</div>
                {/* *** CAMBIO 3: Mostrar solo el nombre del doctor asignado *** */}
                <div className="consultorio-status">
                  {cons.assignedDoctorName ? (
                    <p className="medico-asignado">{cons.assignedDoctorName}</p>
                  ) : (
                    <p className="medico-asignado">Sin doctor asignado</p>
                  )}
                </div>
              </div>
              <div className="consultorio-action">
                <button className="select-button">Seleccionar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SelectConsultorio;
