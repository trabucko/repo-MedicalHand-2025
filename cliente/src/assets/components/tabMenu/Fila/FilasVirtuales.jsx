// src/components/tabMenu/FilasVirtuales/FilasVirtuales.jsx
import React, { useState, useEffect, useMemo } from "react";
import "./FilasVirtuales.css";
import {
  FaUserInjured,
  FaUsers,
  FaCheckCircle,
  FaArrowRight,
  FaSync,
  FaExclamationTriangle,
  FaClock,
  FaStethoscope,
  FaListAlt,
  FaHospital,
  FaUserClock,
  FaUserCheck,
  FaChevronRight,
  FaEllipsisH,
} from "react-icons/fa";

// Firebase
import { db } from "../../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  where,
  getDocs,
} from "firebase/firestore";

// Constantes para los nombres de colecciones
const QUEUE_COLLECTION = "filas_virtuales";
const PATIENTS_SUBCOLLECTION = "pacientes";

const getFormattedDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Componentes reutilizables
const StatusBadge = ({ status, isCurrent }) => {
  const getStatusConfig = () => {
    switch (status) {
      case "en_consulta":
        return {
          icon: <FaStethoscope />,
          text: "En Consulta",
          className: "en_consulta",
        };
      case "esperando":
        return {
          icon: <FaUserClock />,
          text: "Esperando",
          className: "esperando",
        };
      case "finalizada":
        return {
          icon: <FaUserCheck />,
          text: "Completado",
          className: "finalizada",
        };
      default:
        return {
          icon: <FaUserClock />,
          text: "Pendiente",
          className: "esperando",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`status-badge ${config.className} ${
        isCurrent ? "current" : ""
      }`}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

const PatientItem = ({ patient, isCurrent }) => {
  const displayStatus =
    isCurrent && patient.patientStatus !== "finalizada"
      ? "en_consulta"
      : patient.patientStatus;

  return (
    <div
      className={`patient-item ${displayStatus} ${isCurrent ? "current" : ""}`}
    >
      <div className="patient-turn">
        <span className="turn-number">#{patient.turnNumber}</span>
      </div>
      <div className="patient-info">
        <div className="patient-main">
          <span className="patient-name">{patient.patientName}</span>
          <div className="patient-meta">
            <span className="checkin-time">
              <FaClock className="meta-icon" />
              {patient.checkInTime?.toDate().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <StatusBadge status={displayStatus} isCurrent={isCurrent} />
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, type }) => (
  <div className={`stat-card ${type}`}>
    <div className="stat-content">
      <div className="stat-header">
        <div className="stat-icon">{icon}</div>
        <span className="stat-title">{title}</span>
      </div>
      <span className="stat-number">{value}</span>
      <span className="stat-subtitle">{subtitle}</span>
    </div>
  </div>
);

const FilasVirtuales = () => {
  const { user: currentUser } = useAuth();

  const [queueData, setQueueData] = useState({
    currentTurn: 0,
    lastAssignedTurn: 0,
  });
  const [patientsInQueue, setPatientsInQueue] = useState([]);
  const [stats, setStats] = useState({ attended: 0, waiting: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // 1. Escucha el documento principal de la fila
  useEffect(() => {
    if (!currentUser?.hospitalId) return;

    const todayFormatted = getFormattedDate(new Date());
    const queueName = "ConsultaExterna";
    const queueDocId = `${queueName}-${currentUser.hospitalId}-${todayFormatted}`;
    const queueDocRef = doc(db, QUEUE_COLLECTION, queueDocId);

    const unsubscribe = onSnapshot(queueDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setQueueData({
          currentTurn: data.currentTurn || 0,
          lastAssignedTurn: data.lastAssignedTurn || 0,
        });
      } else {
        setQueueData({ currentTurn: 0, lastAssignedTurn: 0 });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 2. Escucha la subcolección de pacientes
  useEffect(() => {
    if (!currentUser?.hospitalId) return;

    const todayFormatted = getFormattedDate(new Date());
    const queueName = "ConsultaExterna";
    const queueDocId = `${queueName}-${currentUser.hospitalId}-${todayFormatted}`;
    const patientsRef = collection(
      db,
      QUEUE_COLLECTION,
      queueDocId,
      PATIENTS_SUBCOLLECTION
    );
    const q = query(patientsRef, orderBy("turnNumber", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPatientsInQueue(patients);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // El paciente actual se determina por `currentTurn` para una UI instantánea
  const currentPatientInConsultation = useMemo(() => {
    if (queueData.currentTurn === 0) return null;
    return patientsInQueue.find((p) => p.turnNumber === queueData.currentTurn);
  }, [patientsInQueue, queueData.currentTurn]);

  // Cálculo de estadísticas
  useEffect(() => {
    const finalizadosCount = patientsInQueue.filter(
      (p) => p.patientStatus === "finalizada"
    ).length;
    const waitingCount = patientsInQueue.filter(
      (p) => p.patientStatus === "esperando"
    ).length;

    setStats({
      attended: finalizadosCount,
      waiting: waitingCount,
      total: queueData.lastAssignedTurn,
    });
  }, [patientsInQueue, queueData.lastAssignedTurn]);

  // Lógica para determinar si se puede avanzar
  const canAdvanceTurn = useMemo(() => {
    if (
      currentPatientInConsultation &&
      currentPatientInConsultation.patientStatus === "finalizada"
    ) {
      return true;
    }
    if (
      !currentPatientInConsultation &&
      queueData.lastAssignedTurn > queueData.currentTurn
    ) {
      return true;
    }
    return false;
  }, [currentPatientInConsultation, queueData]);

  // Función para avanzar al siguiente turno
  const handleAdvanceTurn = async () => {
    if (!canAdvanceTurn || isAdvancing || !currentUser?.hospitalId) return;

    setIsAdvancing(true);
    const newTurnNumber = queueData.currentTurn + 1;

    if (newTurnNumber > queueData.lastAssignedTurn) {
      alert("No hay más pacientes en la fila.");
      setIsAdvancing(false);
      return;
    }

    try {
      const todayFormatted = getFormattedDate(new Date());
      const queueName = "ConsultaExterna";
      const queueDocId = `${queueName}-${currentUser.hospitalId}-${todayFormatted}`;
      const queueDocRef = doc(db, QUEUE_COLLECTION, queueDocId);
      const patientsRef = collection(
        db,
        QUEUE_COLLECTION,
        queueDocId,
        PATIENTS_SUBCOLLECTION
      );

      const nextPatientQuery = query(
        patientsRef,
        where("turnNumber", "==", newTurnNumber)
      );
      const nextPatientSnapshot = await getDocs(nextPatientQuery);

      if (nextPatientSnapshot.empty) {
        throw new Error(
          `No se encontró el paciente con el turno #${newTurnNumber}`
        );
      }

      const nextPatientDoc = nextPatientSnapshot.docs[0];

      await runTransaction(db, async (transaction) => {
        transaction.update(queueDocRef, { currentTurn: newTurnNumber });
        const nextPatientRef = doc(
          db,
          QUEUE_COLLECTION,
          queueDocId,
          PATIENTS_SUBCOLLECTION,
          nextPatientDoc.id
        );
        transaction.update(nextPatientRef, { patientStatus: "en_consulta" });
      });
    } catch (error) {
      console.error("Error al avanzar turno:", error);
      alert("Error al avanzar el turno. Por favor, intenta nuevamente.");
    } finally {
      setIsAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="filas-virtuales-container">
        <div className="loading-queue">
          <div className="loading-spinner"></div>
          <p>Cargando estado de la fila...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="filas-virtuales-container">
      {/* Header Compacto */}
      <div className="queue-header">
        <div className="header-main">
          <div className="header-title-section">
            <div>
              <h1>Fila Virtual</h1>
              <p className="header-subtitle">
                {currentUser?.hospitalName} - Consulta Externa
              </p>
            </div>
          </div>
          <div className="header-stats">
            <div className="header-stat">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="header-stat">
              <span className="stat-value">{stats.waiting}</span>
              <span className="stat-label">En Espera</span>
            </div>
            <div className="header-stat">
              <span className="stat-value">{stats.attended}</span>
              <span className="stat-label">Atendidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Principal Compacto */}
      <div className="main-panel">
        {/* Sección de Control Principal */}
        <div className="control-section">
          <div className="current-turn-card">
            <div className="turn-display">
              <span className="turn-label">Turno Actual</span>
              <span className="turn-number-large">
                {queueData.currentTurn || "0"}
              </span>
            </div>

            <div className="patient-display">
              {currentPatientInConsultation ? (
                <div className="current-patient">
                  <div className="patient-info-compact">
                    <div className="patient-name-section">
                      <span className="patient-name">
                        {currentPatientInConsultation.patientName}
                      </span>
                      <span className="patient-turn-badge">
                        #{currentPatientInConsultation.turnNumber}
                      </span>
                    </div>
                    <StatusBadge
                      status={currentPatientInConsultation.patientStatus}
                      isCurrent={true}
                    />
                  </div>
                  {currentPatientInConsultation.patientStatus ===
                    "finalizada" && (
                    <div className="completion-notice">
                      <FaCheckCircle />
                      <span>Listo para siguiente paciente</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-patient">
                  <FaUsers className="no-patient-icon" />
                  <div>
                    <h3>Sin paciente en consulta</h3>
                    <p>
                      {queueData.lastAssignedTurn > queueData.currentTurn
                        ? "Listo para llamar al siguiente paciente"
                        : "No hay pacientes en la fila"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              className={`advance-btn ${
                canAdvanceTurn ? "active" : "disabled"
              }`}
              onClick={handleAdvanceTurn}
              disabled={!canAdvanceTurn || isAdvancing}
            >
              {isAdvancing ? (
                <>
                  <FaSync className="spinning" />
                  <span>Avanzando...</span>
                </>
              ) : (
                <>
                  <FaChevronRight />
                  <span>Siguiente Paciente</span>
                </>
              )}
            </button>

            {!canAdvanceTurn && currentPatientInConsultation && (
              <div className="advance-hint">
                <FaExclamationTriangle />
                <span>Esperando que finalice la consulta actual</span>
              </div>
            )}
          </div>

          {/* Estadísticas Compactas */}
          <div className="stats-section-compact">
            <div className="section-title">
              <FaUsers />
              <span>Resumen del Día</span>
            </div>
            <div className="stats-grid-compact">
              <StatCard
                icon={<FaUserInjured />}
                title="Total"
                value={stats.total}
                subtitle="Pacientes"
                type="total"
              />
              <StatCard
                icon={<FaUsers />}
                title="En Espera"
                value={stats.waiting}
                subtitle="Pendientes"
                type="waiting"
              />
              <StatCard
                icon={<FaCheckCircle />}
                title="Atendidos"
                value={stats.attended}
                subtitle="Completados"
                type="attended"
              />
            </div>
          </div>
        </div>

        {/* Lista de Pacientes Compacta */}
        <div className="patients-section-compact">
          <div className="section-header-compact">
            <div className="section-title">
              <FaListAlt />
              <span>Pacientes en Fila</span>
              <span className="patient-count">({stats.waiting})</span>
            </div>
            <div className="queue-info">
              <FaClock />
              <span>Tiempo de espera</span>
            </div>
          </div>

          <div className="patients-list-container-compact">
            {patientsInQueue.length === 0 ? (
              <div className="empty-queue-compact">
                <FaUsers className="empty-icon" />
                <h3>No hay pacientes en la fila</h3>
                <p>Los pacientes aparecerán aquí cuando se registren</p>
              </div>
            ) : (
              <div className="patients-list-compact">
                {patientsInQueue.map((patient) => {
                  const isCurrent =
                    patient.turnNumber === queueData.currentTurn;
                  return (
                    <PatientItem
                      key={patient.id}
                      patient={patient}
                      isCurrent={isCurrent}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilasVirtuales;
