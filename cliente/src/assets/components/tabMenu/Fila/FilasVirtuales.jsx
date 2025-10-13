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

    console.log("🔍 Escuchando documento de fila:", queueDocId);

    const unsubscribe = onSnapshot(queueDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("✅ ¡Documento de fila encontrado! Datos:", data);
        setQueueData({
          currentTurn: data.currentTurn || 0,
          lastAssignedTurn: data.lastAssignedTurn || 0,
        });
      } else {
        console.log("❌ No existe documento de fila para hoy con ese ID.");
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
      console.log(
        "👥 Lista de pacientes actualizada:",
        patients.length,
        patients
      );
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
    // ✨ CORRECCIÓN CLAVE: Contar pacientes con estado "finalizada"
    const finalizadosCount = patientsInQueue.filter(
      (p) => p.patientStatus === "finalizada"
    ).length;
    const waitingCount = patientsInQueue.filter(
      (p) => p.patientStatus === "esperando"
    ).length;

    setStats({
      attended: finalizadosCount, // 'attended' es el nombre interno, pero representa finalizados
      waiting: waitingCount,
      total: queueData.lastAssignedTurn,
    });
  }, [patientsInQueue, queueData.lastAssignedTurn]);

  // Lógica para determinar si se puede avanzar
  const canAdvanceTurn = useMemo(() => {
    if (
      currentPatientInConsultation &&
      // ✨ CORRECCIÓN CLAVE: El botón se activa cuando el estado es "finalizada"
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

      console.log(`✅ Turno avanzado a: ${newTurnNumber}`);
    } catch (error) {
      console.error("❌ Error al avanzar turno:", error);
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
      <div className="queue-header">
        <h2 className="queue-title">Fila Virtual</h2>
        <div className="queue-subtitle">
          {currentUser?.hospitalName} - Monitor
        </div>
      </div>

      <div className="current-status-panel">
        <div className="current-turn-section">
          <div className="turn-display">
            <span className="turn-label">Turno Actual</span>
            <span className="turn-number">
              {queueData.currentTurn || "N/A"}
            </span>
          </div>

          {currentPatientInConsultation ? (
            <div className="current-patient-info">
              <div className="patient-badge">
                <FaUserInjured className="patient-icon" />
                <span>En Consulta</span>
              </div>
              <h3 className="patient-name">
                {currentPatientInConsultation.patientName}
              </h3>
              <div className="patient-details">
                <span className="turn-badge">
                  Turno #{currentPatientInConsultation.turnNumber}
                </span>
                {/* ✨ CORRECCIÓN CLAVE: Mostrar el mensaje cuando el estado sea "finalizada" */}
                {currentPatientInConsultation.patientStatus ===
                  "finalizada" && (
                  <span className="ready-badge">
                    <FaCheckCircle /> Finalizada, llama al próximo paciente
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="no-patient-info">
              <div className="no-patient-badge">
                <FaUsers className="no-patient-icon" />
                <span>Sin paciente en consulta</span>
              </div>
              <p>
                {queueData.lastAssignedTurn > queueData.currentTurn
                  ? "Listo para llamar al siguiente paciente."
                  : "No hay pacientes en la fila."}
              </p>
            </div>
          )}
        </div>

        <div className="advance-section">
          <button
            className={`advance-btn ${canAdvanceTurn ? "active" : "disabled"}`}
            onClick={handleAdvanceTurn}
            disabled={!canAdvanceTurn || isAdvancing}
          >
            {isAdvancing ? (
              <>
                <FaSync className="spinning" /> Avanzando...
              </>
            ) : (
              <>
                <FaArrowRight /> Llamar Siguiente Paciente
              </>
            )}
          </button>
          {!canAdvanceTurn && currentPatientInConsultation && (
            <div className="advance-hint">
              <FaExclamationTriangle />
              Esperando que el doctor marque la consulta como Finalizada
            </div>
          )}
        </div>
      </div>

      <div className="queue-stats">
        <div className="stat-card waiting">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.waiting}</span>
            <span className="stat-label">En Espera</span>
          </div>
        </div>

        <div className="stat-card attended">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.attended}</span>
            <span className="stat-label">Finalizados</span>
          </div>
        </div>

        <div className="stat-card total">
          <div className="stat-icon">
            <FaUserInjured />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Hoy</span>
          </div>
        </div>
      </div>

      <div className="patients-queue">
        <div className="queue-header-section">
          <h3>Pacientes en Fila</h3>
          <span className="queue-count">
            {stats.waiting} pacientes esperando
          </span>
        </div>

        {patientsInQueue.length === 0 ? (
          <div className="empty-queue">
            <FaUsers className="empty-icon" />
            <p>No hay pacientes en la fila virtual</p>
          </div>
        ) : (
          <div className="patients-list">
            {patientsInQueue.map((patient) => {
              const isCurrent = patient.turnNumber === queueData.currentTurn;
              const displayStatus =
                isCurrent && patient.patientStatus !== "finalizada" // ✨ CORRECCIÓN CLAVE
                  ? "en_consulta"
                  : patient.patientStatus;

              const visualClass = isCurrent ? "current" : "";

              return (
                <div
                  key={patient.id}
                  className={`patient-item ${displayStatus} ${visualClass}`}
                >
                  <div className="patient-turn">
                    <span className="turn-number">#{patient.turnNumber}</span>
                  </div>
                  <div className="patient-info">
                    <span className="patient-name">{patient.patientName}</span>
                    <div className="patient-meta">
                      <span className="checkin-time">
                        {patient.checkInTime
                          ?.toDate()
                          .toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                    </div>
                  </div>
                  <div className="patient-status">
                    <div className={`status-badge ${displayStatus}`}>
                      {displayStatus === "en_consulta" && "🟡 En Consulta"}
                      {displayStatus === "esperando" && "🔵 Esperando"}
                      {/* ✨ CORRECCIÓN CLAVE: Mostrar "Finalizado" para el estado "finalizada" */}
                      {displayStatus === "finalizada" && "⚪ Finalizado"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilasVirtuales;
