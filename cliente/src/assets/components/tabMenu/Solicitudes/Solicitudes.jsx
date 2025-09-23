import React, { useState, useEffect } from "react";
import "./Solicitudes.css";
import { FaUserMd, FaFilter, FaTimes } from "react-icons/fa";

// 1. IMPORTA el componente para mostrar los detalles
import InfoPaciente from "./infoPaciente/infoPaciente"; // Asegúrate de que la ruta sea correcta

// --- AÑADIDOS DE FIREBASE ---
import { db } from "../../../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const Solicitud = () => {
  // --- Estados ---
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfoPaciente, setShowInfoPaciente] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("más-reciente");

  useEffect(() => {
    // Escuchamos en tiempo real la colección 'citas' por solicitudes pendientes
    const citasRef = collection(db, "citas");
    const q = query(citasRef, where("status", "==", "pendiente"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // --- LÓGICA SIMPLIFICADA ---
      // Ya no hay segunda búsqueda. Mapeamos directamente los datos de cada cita.
      const solicitudesData = snapshot.docs.map((doc) => {
        const citaData = doc.data();

        // El objeto se crea usando únicamente los campos del documento de la 'cita'
        return {
          id: doc.id, // Usamos el ID del documento de la cita
          paciente: citaData.fullName, // Leído directamente de la cita
          fecha: citaData.requestTimestamp.toDate().toLocaleDateString("es-ES"),
          motivo: citaData.reason,
          estado: "Pendiente",
          especialidad: citaData.specialty,

          // Pasamos el objeto completo a InfoPaciente
          datosCompletos: citaData,
        };
      });

      setSolicitudes(solicitudesData);
      setLoading(false);
    });

    // Limpiamos la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  // --- Funciones para la interfaz ---
  const handleOpenInfoPaciente = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowInfoPaciente(true);
  };

  const handleCloseInfoPaciente = () => {
    setShowInfoPaciente(false);
    setSelectedSolicitud(null);
  };

  const toggleModal = () => setShowModal(!showModal);

  // (El resto de tus funciones y lógica de filtrado no necesitan cambios)
  // (El resto de tus funciones y lógica de filtrado no necesitan cambios)
  const filteredAndSortedSolicitudes = solicitudes
    .filter((sol) => {
      // Aseguramos que el término de búsqueda esté en minúsculas para una comparación insensible
      const searchTermLower = searchTerm.toLowerCase();

      // Verificamos si el término de búsqueda coincide con alguno de los campos
      // Usamos (sol.campo || "") para evitar errores si algún dato viene nulo o indefinido
      const matchesSearchTerm =
        (sol.paciente || "").toLowerCase().includes(searchTermLower) ||
        (sol.motivo || "").toLowerCase().includes(searchTermLower) ||
        (sol.especialidad || "").toLowerCase().includes(searchTermLower);

      // Aquí puedes añadir la lógica de tus otros filtros si los tienes
      if (
        activeFilters.especialidad &&
        sol.especialidad !== activeFilters.especialidad
      ) {
        return false;
      }

      // Devolvemos true si el término de búsqueda coincide
      return matchesSearchTerm;
    })
    .sort((a, b) => {
      // Aquí va tu lógica de ordenamiento (la que tenías antes)
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

  return (
    <div className="content-area">
      <h2 className="solicitudes-title">
        {showInfoPaciente
          ? "Detalles de la Solicitud"
          : "Bandeja de Consultas Médica Entrantes"}
      </h2>

      {showInfoPaciente ? (
        <InfoPaciente
          solicitud={selectedSolicitud}
          onClose={handleCloseInfoPaciente}
        />
      ) : (
        <>
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
                      <strong>Fecha:</strong> {sol.fecha} |{" "}
                      <strong>Motivo:</strong> {sol.motivo}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {showModal && (
        <div className="modal-overlay">{/* Tu Modal de Filtros */}</div>
      )}
    </div>
  );
};

export default Solicitud;
