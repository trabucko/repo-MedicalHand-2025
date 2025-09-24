// src/assets/components/tabMenu/Solicitudes/Solicitudes.jsx

import React, { useState, useEffect } from "react";
import "./Solicitudes.css";
import { FaUserMd, FaFilter, FaTimes } from "react-icons/fa";

// IMPORTACIÓN DE COMPONENTES DE VISTA
import InfoPaciente from "./infoPaciente/infoPaciente";
import SelectConsultorio from "./selectConsultorio/SelectConsultorio";
import SelectHorario from "../Solicitudes/SelectConsultorio/SelectHorario/SelectHorario"; // <--- Ruta de importación corregida

// AÑADIDOS DE FIREBASE
import { db } from "../../../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

const Solicitud = () => {
  // --- Estados de datos y UI ---
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);

  // --- Estados para controlar las vistas ---
  const [showInfoPaciente, setShowInfoPaciente] = useState(false);
  const [showGestionar, setShowGestionar] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState(null); // <-- Nuevo estado para el consultorio

  // --- Estados para filtros y ordenación ---
  const [showModal, setShowModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("más-reciente");

  useEffect(() => {
    console.log("Iniciando useEffect para buscar solicitudes...");
    const citasRef = collection(db, "citas");
    const q = query(citasRef, where("status", "==", "pendiente"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      console.log(
        `LOG 1: Se encontraron ${snapshot.size} citas con estado 'pendiente'.`
      );
      if (snapshot.empty) {
        setLoading(false);
        setSolicitudes([]);
        return;
      }

      const solicitudesPromises = snapshot.docs.map(async (doc) => {
        const citaData = doc.data();
        console.log("LOG 2: Datos de la cita individual:", citaData);
        let pacienteData = {};

        if (citaData.uid) {
          const usersRef = collection(db, "usuarios_movil");
          const userQuery = query(usersRef, where("uid", "==", citaData.uid));
          const userSnapshot = await getDocs(userQuery);

          console.log(
            `LOG 3: Buscando paciente con UID (${citaData.uid})... Encontrados: ${userSnapshot.size}`
          );
          if (!userSnapshot.empty) {
            pacienteData = userSnapshot.docs[0].data();
          }
        } else {
          console.warn(
            "LOG 3 ADVERTENCIA: Esta cita no tiene un campo 'uid'.",
            citaData
          );
        }

        const objetoFinal = {
          id: doc.id,
          paciente: pacienteData.personalInfo?.firstName
            ? `${pacienteData.personalInfo.firstName} ${pacienteData.personalInfo.lastName}`
            : citaData.fullName || "Paciente sin nombre",
          fecha: citaData.requestTimestamp.toDate().toLocaleDateString("es-ES"),
          motivo: citaData.reason,
          estado: "Pendiente",
          especialidad: citaData.specialty,
          citaCompleta: { ...citaData, id: doc.id }, // ⚡ Aquí metemos el id dentro
          pacienteCompleto: pacienteData,
        };
        console.log("LOG 4: Objeto final que se va a retornar:", objetoFinal);
        return objetoFinal;
      });

      const solicitudesCompletas = await Promise.all(solicitudesPromises);
      console.log("LOG 5: Arreglo completo final:", solicitudesCompletas);
      setSolicitudes(solicitudesCompletas);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Funciones Handler para la Interfaz ---

  // Muestra los detalles del paciente
  const handleOpenInfoPaciente = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowInfoPaciente(true);
  };

  // Cierra los detalles del paciente y vuelve a la lista
  const handleCloseInfoPaciente = () => {
    setShowInfoPaciente(false);
    setSelectedSolicitud(null);
  };

  // Muestra la vista para gestionar la solicitud (llamada desde InfoPaciente)
  const handleGestionarSolicitud = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowInfoPaciente(false);
    setShowGestionar(true);
  };

  const handleSelectOffice = (office) => {
    setSelectedOffice(office);
    setShowGestionar(false); // <--- Es importante ocultar la vista anterior
  };

  // Cierra la vista de gestión y vuelve a la lista
  const handleCloseGestionar = () => {
    setShowGestionar(false);
    setSelectedSolicitud(null);
    setSelectedOffice(null); // <--- Resetear el consultorio también
  };

  // Handler para volver a la selección de consultorio
  const handleBackToConsultorio = () => {
    setSelectedOffice(null);
    setShowGestionar(true); // <--- Volver a la vista de gestión (Seleccionar consultorio)
  };

  const toggleModal = () => setShowModal(!showModal);

  // Lógica de filtrado y ordenación (sin cambios)
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

  if (loading) {
    return (
      <div className="content-area">
        <h2 className="solicitudes-title">Cargando Solicitudes...</h2>
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
        consultorio={selectedOffice.consultorio} // ⚡ Aquí pasamos el objeto correcto
        doctor={doctorInfo}
        appointmentRequest={selectedSolicitud.citaCompleta}
        onBack={handleBackToConsultorio}
        onConfirm={handleCloseGestionar}
      />
    );
  }

  if (showGestionar) {
    // Es el momento de renderizar SelectConsultorio
    return (
      <SelectConsultorio
        onClose={handleCloseGestionar}
        onSelectOffice={handleSelectOffice}
        appointmentRequest={selectedSolicitud?.citaCompleta} // 🔥 esta sí existe
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
      <h2 className="solicitudes-title">
        Bandeja de Consultas Médica Entrantes
      </h2>
      <div className="filtro-container">{/* Tu JSX de filtros aquí */}</div>

      {solicitudes.length === 0 ? (
        <div className="no-solicitudes">
          <p>No hay solicitudes pendientes por el momento.</p>
        </div>
      ) : (
        <ul className="solicitudes-list">
          {filteredAndSortedSolicitudes.map((sol) => (
            <li
              key={sol.id}
              className="solicitud-list-item"
              onClick={() => handleOpenInfoPaciente(sol)}
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
                  <strong>Fecha:</strong> {sol.fecha} | <strong>Motivo:</strong>{" "}
                  {sol.motivo}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showModal && (
        <div className="modal-overlay">{/* Tu Modal de Filtros */}</div>
      )}
    </div>
  );
};

export default Solicitud;
