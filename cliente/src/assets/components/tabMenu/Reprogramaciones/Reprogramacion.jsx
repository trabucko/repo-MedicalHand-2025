// src/components/Reprogramacion.jsx

import React, { useState } from "react";
import "./Reprogramacion.css";
import {
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaArrowRight,
  FaFilter,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

// Importa el nuevo componente para la reprogramación
import SelectReprogramacion from "./SelectReprogramacion/SelectReprogramacion";

const Reprogramacion = () => {
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("más-reciente");
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  // --- Datos de las SOLICITUDES de reprogramación ---
  const solicitudes = [
    {
      paciente: { id: "12345", nombre: "Carlos Sánchez" },
      citaOriginal: {
        id: 1,
        doctor: "Dr. Ana Gómez",
        fecha: "2025-09-10",
        hora: "10:00 AM",
        consultorio: 101,
        especialidad: "Pediatría",
      },
      motivo: "Conflicto de horario personal.",
    },
    {
      paciente: { id: "67890", nombre: "Laura Méndez" },
      citaOriginal: {
        id: 2,
        doctor: "Dr. Juan Pérez",
        fecha: "2025-09-15",
        hora: "03:30 PM",
        consultorio: 205,
        especialidad: "Medicina Interna",
      },
      motivo: "Cita de emergencia familiar.",
    },
    {
      paciente: { id: "11223", nombre: "Sofía Torres" },
      citaOriginal: {
        id: 3,
        doctor: "Dr. Ana Gómez",
        fecha: "2025-09-12",
        hora: "09:00 AM",
        consultorio: 101,
        especialidad: "Pediatría",
      },
      motivo: "Motivo del paciente.",
    },
  ];

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    toggleModal();
  };

  const removeFilter = (filterKey) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterKey];
    setActiveFilters(newFilters);
  };

  const handleReprogramar = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setStep(2);
  };

  const handleVolver = () => {
    setStep(1);
    setSelectedSolicitud(null);
  };

  const filteredAndSortedSolicitudes = solicitudes
    .filter((sol) => {
      const matchesSearchTerm =
        sol.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sol.citaOriginal.doctor
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        sol.citaOriginal.especialidad
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      if (
        activeFilters.especialidad &&
        sol.citaOriginal.especialidad !== activeFilters.especialidad
      ) {
        return false;
      }
      return matchesSearchTerm;
    })
    .sort((a, b) => {
      if (sortOption === "más-reciente") {
        const dateA = new Date(
          a.citaOriginal.fecha.split("/").reverse().join("-")
        );
        const dateB = new Date(
          b.citaOriginal.fecha.split("/").reverse().join("-")
        );
        return dateB - dateA;
      }
      if (sortOption === "especialidad") {
        return a.citaOriginal.especialidad.localeCompare(
          b.citaOriginal.especialidad
        );
      }
      return 0;
    });

  return (
    <div className="reprogramacion-container">
      {step === 1 && (
        <>
          <div className="reprogramacion-header">
            <h2>Solicitudes de Reprogramación de Citas</h2>
          </div>
          <div className="paso-contenido">
            <div className="filter-container">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Buscar por paciente, doctor o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="search-icon" />
              </div>
              <button className="filter-button" onClick={toggleModal}>
                <FaFilter /> Filtrar
              </button>
            </div>

            <div className="active-filters">
              {Object.entries(activeFilters).map(([key, value]) => (
                <div key={key} className="filter-tag">
                  <span>{`${key}: ${value}`}</span>
                  <FaTimes onClick={() => removeFilter(key)} />
                </div>
              ))}
            </div>

            {filteredAndSortedSolicitudes.length > 0 ? (
              filteredAndSortedSolicitudes.map((solicitud) => (
                <div key={solicitud.citaOriginal.id} className="solicitud-card">
                  <div className="solicitud-info">
                    <div className="paciente-info">
                      <p>
                        <FaUser /> Paciente:{" "}
                        <strong>{solicitud.paciente.nombre}</strong>
                      </p>
                    </div>
                    <div className="cita-original-info">
                      <p>
                        <FaUserMd /> {solicitud.citaOriginal.doctor}
                      </p>
                      <p>
                        <FaCalendarAlt /> {solicitud.citaOriginal.fecha}
                      </p>
                      <p>
                        <FaClock /> {solicitud.citaOriginal.hora}
                      </p>
                    </div>
                  </div>
                  <button
                    className="reprogramar-button"
                    onClick={() => handleReprogramar(solicitud)}
                  >
                    Procesar <FaArrowRight />
                  </button>
                </div>
              ))
            ) : (
              <p className="no-solicitudes">
                No hay solicitudes de reprogramación que coincidan con los
                filtros.
              </p>
            )}
          </div>
        </>
      )}

      {step === 2 && selectedSolicitud && (
        <SelectReprogramacion onReturn={handleVolver} />
      )}

      {showModal && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Opciones de Filtrado</h2>
              <FaTimes className="modal-close-icon" onClick={toggleModal} />
            </div>
            <div className="modal-body">
              <div className="filter-group">
                <label>Especialidad:</label>
                <select
                  onChange={(e) =>
                    applyFilters({ especialidad: e.target.value })
                  }
                >
                  <option value="">Todas</option>
                  <option value="Pediatría">Pediatría</option>
                  <option value="Medicina Interna">Medicina Interna</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reprogramacion;
