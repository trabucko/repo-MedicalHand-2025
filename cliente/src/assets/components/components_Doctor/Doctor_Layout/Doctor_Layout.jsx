// src/assets/components/components_Doctor/Doctor_Layout/Doctor_Layout.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
  or,
  doc,
  writeBatch,
  serverTimestamp,
  updateDoc,
  getDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import styled from "styled-components";

import OriginalSidebar from "../../Sidebar/Sidebar";
import Header from "../../components_Doctor/HorarioMedico/headerDoctor/header";

// --- Styled Components ---

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
`;

const Sidebar = styled(OriginalSidebar)`
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 280px;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 100;

  &.is-open {
    transform: translateX(0);
  }

  // ✨ CORRECCIÓN 1: En escritorio, siempre es visible.
  @media (min-width: 768px) {
    transform: translateX(0);
  }
`;

const MainView = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
  // ✨ CORRECCIÓN 2: El margen izquierdo SOLO se aplica en escritorio.
  @media (min-width: 768px) {
    margin-left: 0px;
  }
`;

const PageContent = styled.main`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 421px;
  width: 90%;
`;

const ModalHeader = styled.div`
  h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const ModalBody = styled.div`
  p {
    margin: 0 0 1rem 0;
    color: #666;
    line-height: 1.5;
    font-size: 1rem;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 80px;

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
`;

const CancelButton = styled(Button)`
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #dee2e6;

  &:hover {
    background-color: #e2e6ea;
    border-color: #dae0e5;
  }
`;

const ConfirmButton = styled(Button)`
  background-color: #007bff;
  color: white;

  &:hover {
    background-color: #0056b3;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.1rem;
  color: #666;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid #e9ecef;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin-right: 12px;
    cursor: pointer;
  }

  label {
    cursor: pointer;
    font-size: 0.95rem;
    color: #333;
  }
`;

// Función auxiliar para formato de fecha
const getFormattedDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);
  const [availableConsultorios, setAvailableConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [releaseOnLogout, setReleaseOnLogout] = useState(true);

  // Estados para la fila virtual
  const [queueData, setQueueData] = useState(null);
  const [patientsInQueue, setPatientsInQueue] = useState([]);
  const [currentPatientDetails, setCurrentPatientDetails] = useState(null);
  const [queueId, setQueueId] = useState(null);

  // ✨ 1. NUEVO ESTADO PARA EL ÚLTIMO PACIENTE ATENDIDO
  const [lastAttendedPatient, setLastAttendedPatient] = useState(null);

  // ✨ 2. CREAR UNA REFERENCIA PARA RECORDAR EL TURNO ANTERIOR
  const previousTurnRef = useRef();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // useEffect para los consultorios
  useEffect(() => {
    if (!user?.uid || !user.hospitalId) {
      setLoading(false);
      return;
    }
    const consultoriosRef = collection(
      db,
      "hospitales_MedicalHand",
      user.hospitalId,
      "dr_office"
    );
    const q = query(
      consultoriosRef,
      or(
        where("assignedDoctorId", "==", null),
        where("assignedDoctorId", "==", user.uid)
      )
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const consultoriosData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setAvailableConsultorios(consultoriosData);
      const alreadyAssigned = consultoriosData.find(
        (c) => c.assignedDoctorId === user.uid
      );
      setSelectedConsultorio(alreadyAssigned || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid, user.hospitalId]);

  // Listener para el documento principal de la fila
  useEffect(() => {
    if (!user?.hospitalId) return;
    const todayFormatted = getFormattedDate(new Date());
    const queueName = "ConsultaExterna";
    const queueDocId = `${queueName}-${user.hospitalId}-${todayFormatted}`;
    setQueueId(queueDocId);
    const queueDocRef = doc(db, "filas_virtuales", queueDocId);
    const unsubscribe = onSnapshot(queueDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setQueueData(docSnap.data());
      } else {
        setQueueData(null);
      }
    });
    return () => unsubscribe();
  }, [user?.hospitalId]);

  // Listener para la subcolección de pacientes
  useEffect(() => {
    if (!queueId) {
      setPatientsInQueue([]);
      return;
    }
    const patientsRef = collection(db, "filas_virtuales", queueId, "pacientes");
    const q = query(patientsRef, orderBy("turnNumber", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patientsData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setPatientsInQueue(patientsData);
    });
    return () => unsubscribe();
  }, [queueId]);

  // Identificar al paciente que corresponde al turno actual
  const patientFromQueue = useMemo(() => {
    if (!queueData || queueData.currentTurn === 0) return null;
    return patientsInQueue.find((p) => p.turnNumber === queueData.currentTurn);
  }, [queueData, patientsInQueue]);

  // Buscar detalles completos del paciente identificado
  useEffect(() => {
    const fetchFullAppointmentDetails = async () => {
      if (
        !patientFromQueue ||
        !patientFromQueue.appointmentId ||
        !selectedConsultorio?.id
      ) {
        setCurrentPatientDetails(patientFromQueue);
        return;
      }
      try {
        const appointmentRef = doc(
          db,
          "hospitales_MedicalHand",
          user.hospitalId,
          "dr_office",
          selectedConsultorio.id,
          "appointments",
          patientFromQueue.appointmentId
        );
        const appointmentSnap = await getDoc(appointmentRef);
        if (appointmentSnap.exists()) {
          setCurrentPatientDetails({
            ...patientFromQueue,
            ...appointmentSnap.data(),
          });
        } else {
          setCurrentPatientDetails(patientFromQueue);
        }
      } catch (error) {
        console.error("Error al buscar detalles completos de la cita:", error);
        setCurrentPatientDetails(patientFromQueue);
      }
    };
    fetchFullAppointmentDetails();
  }, [patientFromQueue, selectedConsultorio, user?.hospitalId]);

  // ✨ 3. REEMPLAZAR LA LÓGICA DE LIMPIEZA
  // Este efecto ahora solo se fija en si el NÚMERO DE TURNO ha cambiado.
  useEffect(() => {
    const currentTurn = queueData?.currentTurn;

    // Si hay un turno previo guardado y es DIFERENTE al actual, significa que el monitor avanzó la fila.
    if (
      previousTurnRef.current !== undefined &&
      previousTurnRef.current !== currentTurn
    ) {
      console.log(
        `CAMBIO DE TURNO DETECTADO: de ${previousTurnRef.current} a ${currentTurn}. Limpiando último paciente.`
      );
      setLastAttendedPatient(null);
    }

    // Actualizamos la referencia para la próxima vez que este efecto se ejecute.
    previousTurnRef.current = currentTurn;
  }, [queueData?.currentTurn]); // Dependencia clave: solo el número de turno.

  // ✨ 4. CALCULAR DATOS ADICIONALES PARA PASAR AL DASHBOARD
  const waitingPatients = useMemo(() => {
    if (!patientsInQueue.length) return [];

    return patientsInQueue
      .filter((p) => p.patientStatus === "esperando")
      .sort((a, b) => a.turnNumber - b.turnNumber)
      .slice(0, 10); // Limitar a los próximos 10 pacientes
  }, [patientsInQueue]);

  const queueStats = useMemo(() => {
    const completed = patientsInQueue.filter(
      (p) => p.patientStatus === "finalizada"
    ).length;
    const waiting = patientsInQueue.filter(
      (p) => p.patientStatus === "esperando"
    ).length;
    const inProgress = patientsInQueue.filter(
      (p) => p.patientStatus === "en_consulta"
    ).length;

    return {
      totalToday: queueData?.lastAssignedTurn || patientsInQueue.length,
      inProgress: inProgress,
      waiting: waiting,
      completed: completed,
      currentTurn: queueData?.currentTurn || 0,
      lastAssignedTurn: queueData?.lastAssignedTurn || 0,
    };
  }, [patientsInQueue, queueData]);

  // Función para seleccionar consultorio
  const handleSelectConsultorio = async (consultorio) => {
    if (!consultorio || !user) {
      alert("ERROR: Faltan datos de consultorio o usuario.");
      return;
    }

    const batch = writeBatch(db);
    const consultorioRef = doc(
      db,
      "hospitales_MedicalHand",
      user.hospitalId,
      "dr_office",
      consultorio.id
    );
    const userDocRef = doc(
      db,
      "hospitales_MedicalHand",
      user.hospitalId,
      "users",
      user.uid
    );

    try {
      batch.update(consultorioRef, {
        status: "ocupado",
        assignedDoctorId: user.uid,
        assignedDoctorName: user.fullName,
        lastAssignment: serverTimestamp(),
      });

      batch.update(userDocRef, {
        assignedOfficeId: consultorio.id,
        assignedOfficeName: consultorio.name,
      });

      await batch.commit();
      setSelectedConsultorio(consultorio);
    } catch (error) {
      console.error("Error al asignar consultorio:", error);
      alert("Hubo un problema al intentar asignar el consultorio.");
    }
  };

  // Función para liberar consultorio
  const handleReleaseConsultorio = async () => {
    if (!selectedConsultorio || !user) return;

    const consultorioToRelease = selectedConsultorio;
    setSelectedConsultorio(null);

    const batch = writeBatch(db);
    const consultorioRef = doc(
      db,
      "hospitales_MedicalHand",
      user.hospitalId,
      "dr_office",
      consultorioToRelease.id
    );
    const userDocRef = doc(
      db,
      "hospitales_MedicalHand",
      user.hospitalId,
      "users",
      user.uid
    );

    try {
      batch.update(consultorioRef, {
        status: "disponible",
        assignedDoctorId: null,
        assignedDoctorName: null,
      });

      batch.update(userDocRef, {
        assignedOfficeId: null,
        assignedOfficeName: null,
      });

      await batch.commit();
    } catch (error) {
      console.error("Error al liberar el consultorio:", error);
      setSelectedConsultorio(consultorioToRelease);
    }
  };

  // ✨ 5. ACTUALIZAR LA FUNCIÓN PARA FINALIZAR CONSULTA
  const handleFinalizeConsultation = async () => {
    if (
      !currentPatientDetails?.id ||
      currentPatientDetails.patientStatus === "finalizada"
    ) {
      alert(
        "No hay un paciente activo para finalizar o ya ha sido finalizado."
      );
      return;
    }

    const patientToFinalize = { ...currentPatientDetails };
    const queueDocId = queueId;
    const patientDocRef = doc(
      db,
      "filas_virtuales",
      queueDocId,
      "pacientes",
      patientToFinalize.id
    );

    try {
      await updateDoc(patientDocRef, { patientStatus: "finalizada" });
      setLastAttendedPatient(patientToFinalize);
      // La siguiente línea fue eliminada:
      // alert("Consulta finalizada. Esperando al siguiente paciente.");
    } catch (error) {
      console.error("Error al finalizar la consulta:", error);
      alert("Hubo un error al marcar la consulta como finalizada.");
    }
  };

  // Funciones de logout
  const handleLogoutClick = () => {
    setSidebarOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      if (releaseOnLogout && selectedConsultorio) {
        await handleReleaseConsultorio();
      }
      await logout();
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setShowLogoutModal(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  if (loading) {
    return <LoadingContainer>Cargando panel médico...</LoadingContainer>;
  }

  return (
    <>
      <Sidebar
        className={isSidebarOpen ? "is-open" : ""}
        isOpen={isSidebarOpen}
        fullName={user?.fullName}
        hospitalName={user?.hospitalName}
        role={user?.claims?.role}
        handleLogout={handleLogoutClick}
      />
      <LayoutContainer>
        {/* ✨ CORRECCIÓN 3: Ya no se necesita la clase dinámica aquí */}
        <MainView>
          <Header
            user={user}
            consultorio={selectedConsultorio}
            toggleSidebar={toggleSidebar}
            onRelease={handleReleaseConsultorio}
          />
          <PageContent>
            <Outlet
              context={{
                selectedConsultorio,
                availableConsultorios,
                handleSelectConsultorio,
                currentPatient: currentPatientDetails,
                handleFinalizeConsultation,
                waitingPatients: waitingPatients,
                queueStats: queueStats,
                queueData: queueData,
                allPatientsInQueue: patientsInQueue,
                // ✨ 6. PASAR EL NUEVO ESTADO AL CONTEXTO
                lastAttendedPatient: lastAttendedPatient,
              }}
            />
          </PageContent>
        </MainView>
      </LayoutContainer>
      {showLogoutModal && (
        <ModalOverlay onClick={handleCancelLogout}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Confirmar Cierre de Sesión</h3>
            </ModalHeader>
            <ModalBody>
              <p>¿Estás seguro de que quieres cerrar tu sesión?</p>
              {selectedConsultorio && (
                <CheckboxContainer>
                  <input
                    type="checkbox"
                    id="release-consultorio-checkbox"
                    checked={releaseOnLogout}
                    onChange={(e) => setReleaseOnLogout(e.target.checked)}
                  />
                  <label htmlFor="release-consultorio-checkbox">
                    Liberar consultorio ({selectedConsultorio.name}) al salir.
                  </label>
                </CheckboxContainer>
              )}
            </ModalBody>
            <ModalActions>
              <CancelButton onClick={handleCancelLogout}>Cancelar</CancelButton>
              <ConfirmButton onClick={handleConfirmLogout}>Salir</ConfirmButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default DoctorLayout;
