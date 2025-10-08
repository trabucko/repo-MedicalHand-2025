// src/components/SelectConsultorio.jsx

import React, { useState, useEffect } from "react";
import "./selectConsultorio.css";
import { FaArrowLeft, FaHospital, FaSadTear } from "react-icons/fa";
import { db } from "../../../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const SelectConsultorio = ({
  onClose,
  onSelectOffice,
  appointmentRequest,
  hospitalId,
}) => {
  // ===================================================================
  // ▼▼▼ LÍNEA DE DEPURACIÓN ▼▼▼
  // Esta línea nos mostrará el valor de hospitalId en la consola del navegador.
  console.log("Prop 'hospitalId' recibido en SelectConsultorio:", hospitalId);
  // ===================================================================

  const [consultorios, setConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultorios = async () => {
      if (!hospitalId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const consultoriosRef = collection(
          db,
          "hospitales_MedicalHand",
          hospitalId,
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
  }, [hospitalId]);

  const handleSelectConsultorio = (cons) => {
    if (!appointmentRequest) {
      console.error("No se recibió appointmentRequest en SelectConsultorio");
      return;
    }
    onSelectOffice({
      consultorio: cons,
      appointment: appointmentRequest,
    });
  };

  if (loading) {
    return (
      <div className="consultorio-container">
        <div className="consultorio-header">
          <div className="consultorio-title">
            <h2>Cargando Consultorios...</h2>
          </div>
        </div>
        <div className="loading-spinner-consultorio"></div>
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
        {consultorios.length === 0 ? (
          <div className="empty-state-consultorios">
            <FaSadTear size={40} />
            <h3>No se encontraron consultorios ocupados</h3>
            <p>Todos los consultorios están actualmente disponibles.</p>
          </div>
        ) : (
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
                  <div className="consultorio-number">{cons.name}</div>
                  <div className="consultorio-status">
                    {cons.assignedDoctorName ? (
                      <p className="medico-asignado">
                        {cons.assignedDoctorName}
                      </p>
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
        )}
      </div>
    </div>
  );
};

export default SelectConsultorio;
