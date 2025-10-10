// src/assets/components/tabMenu/Solicitudes/Solicitudes.jsx

import React, { useState, useEffect } from "react";
import "./Solicitudes.css";
import {
  FaUserMd,
  FaCalendarAlt,
  FaStethoscope,
  FaClock,
  FaArrowRight,
  FaIdCard,
  FaPhone,
} from "react-icons/fa";

// IMPORTACIÓN DE COMPONENTES DE VISTA
import InfoPaciente from "./infoPaciente/infoPaciente";
import RegistroExpediente from "./registroExpediente/registroExpediente"; // <<--- 1. IMPORTADO
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
  const { user: currentUser } = authData;

  // --- Estados de datos y UI ---
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  // --- Estados para controlar las vistas ---
  const [showInfoPaciente, setShowInfoPaciente] = useState(false);
  const [showRegistroExpediente, setShowRegistroExpediente] = useState(false); // <<--- 2. NUEVO ESTADO
  const [showGestionar, setShowGestionar] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    console.log("Iniciando carga de solicitudes...");
    const citasRef = collection(db, "citas");
    const q = query(citasRef, where("status", "==", "pendiente"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        console.log("No se encontraron solicitudes pendientes.");
        setLoading(false);
        setSolicitudes([]);
        return;
      }

      console.log(`Se encontraron ${snapshot.docs.length} solicitudes.`);

      const solicitudesPromises = snapshot.docs.map(async (doc) => {
        // ▼▼▼ BLOQUE DE DEPURACIÓN PARA CADA SOLICITUD ▼▼▼
        try {
          const citaData = doc.data();
          console.log("✅ 1. Datos de la CITA crudos:", citaData);

          let pacienteData = {};
          if (citaData.uid) {
            const usersRef = collection(db, "usuarios_movil");
            const userQuery = query(usersRef, where("uid", "==", citaData.uid));
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
              pacienteData = userSnapshot.docs[0].data();
            }
          }
          console.log("✅ 2. Datos del PACIENTE encontrados:", pacienteData);

          const telefono =
            pacienteData.personalInfo?.phone ||
            pacienteData.phone ||
            pacienteData.telefono ||
            citaData.phone ||
            citaData.telefono ||
            citaData.phoneNumber ||
            "No disponible";

          // Creamos el objeto final en una variable para poder inspeccionarlo
          const solicitudProcesada = {
            id: doc.id,
            paciente: pacienteData.personalInfo?.firstName
              ? `${pacienteData.personalInfo.firstName} ${pacienteData.personalInfo.lastName}`
              : citaData.fullName || "Paciente sin nombre",
            fecha: citaData.requestTimestamp
              .toDate()
              .toLocaleDateString("es-ES"),
            hora: citaData.requestTimestamp
              .toDate()
              .toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            motivo: citaData.reason,
            estado: "Pendiente",
            prioridad: citaData.priority || "normal",
            especialidad: citaData.specialty,
            citaCompleta: { ...citaData, id: doc.id },
            pacienteCompleto: pacienteData,
            telefono: telefono,
            detallePaciente: citaData.requiresFile
              ? "Requiere apertura de expediente" // Mensaje si necesita archivo
              : pacienteData.personalInfo?.age
              ? `${pacienteData.personalInfo.age} años` // Muestra la edad si la tenemos
              : "Paciente registrado", // Mensaje si NO necesita archivo y no hay edad

            requiresFile: citaData.requiresFile === true,
          };

          console.log("✅ 3. Objeto FINAL a mostrar:", solicitudProcesada);
          return solicitudProcesada;
        } catch (error) {
          console.error(
            "❌ ¡ERROR! No se pudo procesar la solicitud con ID:",
            doc.id,
            error
          );
          return null; // Devolvemos null para que no rompa el resto
        }
        // ▲▲▲ FIN DEL BLOQUE DE DEPURACIÓN ▲▲▲
      });

      const solicitudesCompletas = await Promise.all(solicitudesPromises);
      // Filtramos los posibles nulos si hubo errores
      setSolicitudes(solicitudesCompletas.filter((s) => s !== null));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // --- Funciones Handler para la Interfaz ---
  const handleSolicitudClick = (solicitud) => {
    // <<--- 3. NUEVA FUNCIÓN CLICK
    setSelectedSolicitud(solicitud);
    if (solicitud.requiresFile) {
      setShowRegistroExpediente(true);
    } else {
      setShowInfoPaciente(true);
    }
  };

  const handleCloseInfoPaciente = () => {
    setShowInfoPaciente(false);
    setSelectedSolicitud(null);
  };

  const handleCloseRegistroExpediente = () => {
    // <<--- 4. NUEVA FUNCIÓN CLOSE
    setShowRegistroExpediente(false);
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

  // ===================================================================
  // ▼▼▼ BARRERA DE CARGA ▼▼▼
  if (!currentUser || !currentUser.hospitalId) {
    return (
      <div className="content-area">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2 className="solicitudes-title">Verificando credenciales...</h2>
        </div>
      </div>
    );
  }
  // ===================================================================

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
  if (showRegistroExpediente) {
    // <<--- 5. NUEVO BLOQUE DE RENDERIZADO
    return (
      <RegistroExpediente
        solicitud={selectedSolicitud}
        onClose={handleCloseRegistroExpediente}
      />
    );
  }

  if (selectedSolicitud && selectedOffice) {
    const doctorInfo = {
      nombre: selectedOffice.consultorio.assignedDoctorName,
    };

    return (
      <SelectHorario
        hospitalId={currentUser.hospitalId}
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
      {/* Header minimalista */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="solicitudes-title">Solicitudes de Consulta</h1>
            <p className="solicitudes-subtitle">
              {currentUser.hospitalName} - Panel de gestión
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        {solicitudes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaUserMd />
            </div>
            <h3>No hay solicitudes pendientes</h3>
            <p>
              No se han encontrado solicitudes de consulta médica pendientes en
              el sistema.
            </p>
          </div>
        ) : (
          <div className="solicitudes-container">
            <div className="list-header">
              <span className="results-count">
                {solicitudes.length} solicitud
                {solicitudes.length !== 1 ? "es" : ""} pendiente
                {solicitudes.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="solicitudes-list">
              {solicitudes.map((solicitud) => (
                <div
                  key={solicitud.id}
                  className="solicitud-item"
                  onClick={() => handleSolicitudClick(solicitud)} // <<--- 6. ONCLICK ACTUALIZADO
                >
                  <div className="item-main">
                    <div className="patient-section">
                      <div className="patient-info">
                        <h3 className="patient-name">{solicitud.paciente}</h3>
                        <div className="patient-details">
                          <span
                            className={`detail ${
                              solicitud.requiresFile
                                ? "status-required"
                                : "status-ok"
                            }`}
                          >
                            <FaIdCard />
                            {solicitud.detallePaciente}
                          </span>
                          <span className="detail">
                            <FaPhone />
                            {solicitud.telefono}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="request-details">
                      <div className="medical-info">
                        <div className="specialty">
                          <FaStethoscope />
                          {solicitud.especialidad}
                        </div>
                        <div className="request-time">
                          <FaCalendarAlt />
                          {solicitud.fecha}
                          <FaClock />
                          {solicitud.hora}
                        </div>
                      </div>
                      <div className="reason">
                        <p>{solicitud.motivo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="item-actions">
                    <div className="status">
                      <span>{solicitud.estado}</span>
                    </div>
                    <div className="action">
                      <FaArrowRight />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Solicitud;
