// En src/components/Solicitudes/Solicitudes.jsx
import React, { useState } from "react";
import "./Solicitudes.css";
import { FaUserMd, FaFilter, FaTimes, FaSearch } from "react-icons/fa";
import SelectConsultorio from "./SelectConsultorio/selectConsultorio.jsx";

const Solicitud = () => {
  const solicitudesData = [
    {
      id: 1,
      paciente: "Juan Pérez",
      fecha: "25/08/2025",
      motivo: "Consulta general",
      estado: "Nuevo",
      especialidad: "Cardiología",
    },
    {
      id: 2,
      paciente: "María López",
      fecha: "26/08/2025",
      motivo: "Dolor de cabeza",
      estado: "Nuevo",
      especialidad: "Neurología",
    },
    {
      id: 3,
      paciente: "Carlos García",
      fecha: "27/08/2025",
      motivo: "Chequeo rutinario",
      estado: "Nuevo",
      especialidad: "Medicina Interna",
    },
    {
      id: 4,
      paciente: "Laura Torres",
      fecha: "27/08/2025",
      motivo: "Revisión de resultados",
      estado: "Nuevo",
      especialidad: "Cardiología",
    },
  ];

  const [showModal, setShowModal] = useState(false);
  const [showConsultorioModal, setShowConsultorioModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("más-reciente");

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

  const handleOpenConsultorioModal = () => {
    setShowConsultorioModal(true);
  };

  const handleCloseConsultorioModal = () => {
    setShowConsultorioModal(false);
  };

  const filteredAndSortedSolicitudes = solicitudesData
    .filter((sol) => {
      const matchesSearchTerm =
        sol.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sol.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sol.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
      if (
        activeFilters.especialidad &&
        sol.especialidad !== activeFilters.especialidad
      ) {
        return false;
      }
      return matchesSearchTerm;
    })
    .sort((a, b) => {
      if (sortOption === "más-reciente") {
        const dateA = new Date(a.fecha.split("/").reverse().join("-"));
        const dateB = new Date(b.fecha.split("/").reverse().join("-"));
        return dateB - dateA;
      }
      if (sortOption === "especialidad") {
        return a.especialidad.localeCompare(b.especialidad);
      }
      return 0;
    });

  return (
    <div className="content-area">
           {" "}
      <h2 className="solicitudes-title">
               {" "}
        {showConsultorioModal ? "" : "Bandeja de Consultas Médica Entrantes"}   
         {" "}
      </h2>
      {showConsultorioModal ? (
        <SelectConsultorio onClose={handleCloseConsultorioModal} />
      ) : (
        <>
          <div className="filter-container">
            <button className="filter-button" onClick={toggleModal}>
              <FaFilter /> Filtrar
            </button>

            <div className="active-filters">
              {Object.entries(activeFilters).map(([key, value]) => (
                <div key={key} className="filter-tag">
                  <span>{`${key}: ${value}`}</span>
                  <FaTimes onClick={() => removeFilter(key)} />
                </div>
              ))}
            </div>
          </div>

          <ul className="solicitudes-list">
            {filteredAndSortedSolicitudes.map((sol) => (
              <li
                key={sol.id}
                className="solicitud-list-item"
                onClick={handleOpenConsultorioModal}
              >
                <div className="list-item-badge">
                  <span>{sol.estado}</span>
                </div>
                <div className="list-item-content">
                  <h3>
                    <FaUserMd className="list-item-icon" />
                    {sol.paciente}
                  </h3>
                  <p className="list-item-details">
                    <strong>Fecha:</strong> {sol.fecha} |{" "}
                    <strong>Motivo:</strong> {sol.motivo}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
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
                  <option value="Cardiología">Cardiología</option>
                  <option value="Neurología">Neurología</option>
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

export default Solicitud;
