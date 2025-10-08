// src/assets/components/tabMenu/Solicitudes/Solicitudes.jsx

import React, { useState, useEffect } from "react";
import "./Solicitudes.css";
import {
  FaUserMd,
  FaFilter,
  FaTimes,
  FaSearch,
  FaCalendarAlt,
  FaStethoscope,
  FaClock,
  FaArrowRight,
  FaExclamationCircle,
} from "react-icons/fa";

// IMPORTACIÓN DE COMPONENTES DE VISTA
import InfoPaciente from "./infoPaciente/infoPaciente";
import SelectConsultorio from "./selectConsultorio/SelectConsultorio";
import SelectHorario from "../Solicitudes/SelectConsultorio/SelectHorario/SelectHorario";

// AÑADIDOS DE FIREBASE
import { db } from "../../../../firebase";
import { useAuth } from "../../../context/AuthContext";

import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

const Solicitud = () => {
  const authData = useAuth();
  console.log("Datos COMPLETOS recibidos de useAuth():", authData);
  const { user: currentUser } = authData;
  // ▲▲▲ FIN DE LÍNEAS DE DEPURACIÓN ▲▲▲

  // --- Estados de datos y UI ---
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  // --- Estados para controlar las vistas ---
  const [showInfoPaciente, setShowInfoPaciente] = useState(false);
  const [showGestionar, setShowGestionar] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);

  // --- Estados para filtros y ordenación ---
  const [showModal, setShowModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("más-reciente");

  useEffect(() => {
    // Si currentUser todavía no está cargado, no hacemos nada.
    if (!currentUser) {
      return;
    }

    console.log("Iniciando useEffect para buscar solicitudes...");
    const citasRef = collection(db, "citas");
    const q = query(citasRef, where("status", "==", "pendiente"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setLoading(false);
        setSolicitudes([]);
        return;
      }

      const solicitudesPromises = snapshot.docs.map(async (doc) => {
        const citaData = doc.data();
        let pacienteData = {};

        if (citaData.uid) {
          const usersRef = collection(db, "usuarios_movil");
          const userQuery = query(usersRef, where("uid", "==", citaData.uid));
          const userSnapshot = await getDocs(userQuery);
          if (!userSnapshot.empty) {
            pacienteData = userSnapshot.docs[0].data();
          }
        }

        return {
          id: doc.id,
          paciente: pacienteData.personalInfo?.firstName
            ? `${pacienteData.personalInfo.firstName} ${pacienteData.personalInfo.lastName}`
            : citaData.fullName || "Paciente sin nombre",
          fecha: citaData.requestTimestamp.toDate().toLocaleDateString("es-ES"),
          hora: citaData.requestTimestamp.toDate().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          motivo: citaData.reason,
          estado: "Pendiente",
          prioridad: citaData.priority || "normal",
          especialidad: citaData.specialty,
          citaCompleta: { ...citaData, id: doc.id },
          pacienteCompleto: pacienteData,
        };
      });

      const solicitudesCompletas = await Promise.all(solicitudesPromises);
      setSolicitudes(solicitudesCompletas);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- Funciones Handler para la Interfaz ---
  const handleOpenInfoPaciente = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowInfoPaciente(true);
  };

  const handleCloseInfoPaciente = () => {
    setShowInfoPaciente(false);
    setSelectedSolicitud(null);
  };

  const handleGestionarSolicitud = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowInfoPaciente(false);
    setShowGestionar(true);
  };

  const handleSelectOffice = (office) => {
    setSelectedOffice(office);
    setShowGestionar(false);
  };

  const handleCloseGestionar = () => {
    setShowGestionar(false);
    setSelectedSolicitud(null);
    setSelectedOffice(null);
  };

  const handleBackToConsultorio = () => {
    setSelectedOffice(null);
    setShowGestionar(true);
  };

  const toggleModal = () => setShowModal(!showModal);

  const clearFilter = (filterType) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterType];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
  };

  // ===================================================================
  // ▼▼▼ BARRERA DE CARGA ▼▼▼
  if (!currentUser || !currentUser.hospitalId) {
    return (
      <div className="content-area">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2 className="solicitudes-title">Verificando usuario...</h2>
        </div>
      </div>
    );
  }
  // ===================================================================

  // Lógica de filtrado y ordenación
  const filteredAndSortedSolicitudes = solicitudes
    .filter((sol) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearchTerm =
        (sol.paciente || "").toLowerCase().includes(searchTermLower) ||
        (sol.motivo || "").toLowerCase().includes(searchTermLower) ||
        (sol.especialidad || "").toLowerCase().includes(searchTermLower);

      if (
        activeFilters.especialidad &&
        sol.especialidad !== activeFilters.especialidad
      ) {
        return false;
      }

      if (
        activeFilters.prioridad &&
        sol.prioridad !== activeFilters.prioridad
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
      if (sortOption === "prioridad") {
        const priorityOrder = { alta: 3, media: 2, normal: 1 };
        return priorityOrder[b.prioridad] - priorityOrder[a.prioridad];
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="content-area">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2 className="solicitudes-title">Cargando Solicitudes</h2>
          <p className="loading-subtitle">
            Recuperando información del sistema
          </p>
        </div>
      </div>
    );
  }

  // --- LÓGICA DE RENDERIZADO CONDICIONAL ---
  if (selectedSolicitud && selectedOffice) {
    const doctorInfo = {
      nombre: selectedOffice.consultorio.assignedDoctorName,
    };

    return (
      <SelectHorario
        hospitalId={currentUser.hospitalId} // <-- AÑADE ESTA LÍNEA
        consultorio={selectedOffice.consultorio}
        doctor={doctorInfo}
        appointmentRequest={selectedSolicitud.citaCompleta}
        onBack={handleBackToConsultorio}
        onConfirm={handleCloseGestionar}
      />
    );
  }

  if (showGestionar) {
    return (
      <SelectConsultorio
        // ▼▼▼ CAMBIO CLAVE AQUÍ ▼▼▼
        hospitalId={currentUser.hospitalId}
        onClose={handleCloseGestionar}
        onSelectOffice={handleSelectOffice}
        appointmentRequest={selectedSolicitud?.citaCompleta}
      />
    );
  }

  if (showInfoPaciente) {
    return (
      <InfoPaciente
        solicitud={selectedSolicitud}
        onClose={handleCloseInfoPaciente}
        onGestionar={handleGestionarSolicitud}
      />
    );
  }

  // Vista PRINCIPAL (lista de solicitudes)
  return (
    <div className="content-area">
      {/* Header limpio y profesional */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="solicitudes-title">Solicitudes de Consulta</h1>
            <p className="solicitudes-subtitle">
              Gestión de solicitudes médicas pendientes
            </p>
          </div>
          <div className="header-info">
            <div className="info-item">
              <span className="info-label">Total:</span>
              <span className="info-value">{solicitudes.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Pendientes:</span>
              <span className="info-value">{solicitudes.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de herramientas minimalista */}
      <div className="control-panel">
        <div className="search-panel">
          <div className="search-field">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por paciente, motivo o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                title="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        <div className="action-panel">
          <div className="sort-control">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
            >
              <option value="más-reciente">Más reciente</option>
              <option value="especialidad">Especialidad</option>
              <option value="prioridad">Prioridad</option>
            </select>
          </div>

          <button className="filter-button" onClick={toggleModal}>
            <FaFilter />
            Filtros
          </button>
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {(Object.keys(activeFilters).length > 0 || searchTerm) && (
        <div className="filters-indicator">
          <div className="filters-content">
            <span className="filters-title">Filtros aplicados:</span>
            <div className="active-filters">
              {searchTerm && (
                <div className="filter-tag">
                  <span>"{searchTerm}"</span>
                  <button onClick={() => setSearchTerm("")}>
                    <FaTimes />
                  </button>
                </div>
              )}
              {activeFilters.especialidad && (
                <div className="filter-tag">
                  <span>Especialidad: {activeFilters.especialidad}</span>
                  <button onClick={() => clearFilter("especialidad")}>
                    <FaTimes />
                  </button>
                </div>
              )}
              {activeFilters.prioridad && (
                <div className="filter-tag">
                  <span>Prioridad: {activeFilters.prioridad}</span>
                  <button onClick={() => clearFilter("prioridad")}>
                    <FaTimes />
                  </button>
                </div>
              )}
              <button className="clear-filters" onClick={clearAllFilters}>
                Limpiar todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="main-content">
        {filteredAndSortedSolicitudes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {solicitudes.length === 0 ? <FaUserMd /> : <FaSearch />}
            </div>
            <h3>
              {solicitudes.length === 0
                ? "No hay solicitudes pendientes"
                : "No se encontraron resultados"}
            </h3>
            <p>
              {solicitudes.length === 0
                ? "No se han encontrado solicitudes de consulta en el sistema."
                : "Modifique los criterios de búsqueda o filtros aplicados."}
            </p>
          </div>
        ) : (
          <div className="solicitudes-container">
            <div className="list-header">
              <span className="results-count">
                {filteredAndSortedSolicitudes.length} solicitud
                {filteredAndSortedSolicitudes.length !== 1 ? "es" : ""}{" "}
                encontrada{filteredAndSortedSolicitudes.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="solicitudes-list">
              {filteredAndSortedSolicitudes.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="solicitud-item"
                  onClick={() => handleOpenInfoPaciente(solicitud)}
                >
                  <div className="item-main">
                    <div className="patient-section">
                      <div className="patient-info">
                        <h3 className="patient-name">{solicitud.paciente}</h3>
                        <div className="patient-meta">
                          <span className="specialty">
                            {solicitud.especialidad}
                          </span>
                          {solicitud.prioridad === "alta" && (
                            <span className="priority-high">
                              <FaExclamationCircle />
                              Alta prioridad
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="request-details">
                      <p className="motivo">{solicitud.motivo}</p>
                      <div className="detail-items">
                        <div className="detail-item">
                          <FaCalendarAlt />
                          <span>{solicitud.fecha}</span>
                        </div>
                        <div className="detail-item">
                          <FaClock />
                          <span>{solicitud.hora}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="item-actions">
                    <div className="status-indicator">
                      <span>{solicitud.estado}</span>
                    </div>
                    <div className="action-indicator">
                      <FaArrowRight />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Filtros */}
      {showModal && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Filtrar Solicitudes</h2>
              <button className="modal-close" onClick={toggleModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              <div className="filter-group">
                <label htmlFor="especialidad-filter">Especialidad Médica</label>
                <select
                  id="especialidad-filter"
                  value={activeFilters.especialidad || ""}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      especialidad: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">Todas las especialidades</option>
                  <option value="Medicina General">Medicina General</option>
                  <option value="Pediatría">Pediatría</option>
                  <option value="Cardiología">Cardiología</option>
                  <option value="Dermatología">Dermatología</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="prioridad-filter">Nivel de Prioridad</label>
                <select
                  id="prioridad-filter"
                  value={activeFilters.prioridad || ""}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      prioridad: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">Todas las prioridades</option>
                  <option value="alta">Alta prioridad</option>
                  <option value="media">Prioridad media</option>
                  <option value="normal">Prioridad normal</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={clearAllFilters}>
                Limpiar filtros
              </button>
              <button className="btn btn-primary" onClick={toggleModal}>
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Solicitud;
