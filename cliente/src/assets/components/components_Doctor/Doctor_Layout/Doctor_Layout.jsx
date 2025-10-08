// src/assets/components/components_Doctor/Doctor_Layout/Doctor_Layout.jsx

import { useState, useEffect } from "react";
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
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useAuth } from "../../../context/AuthContext";
import styled from "styled-components";

// Se renombra el import para evitar conflictos de nombres
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

  /* El bloque @media que forzaba la visibilidad ha sido ELIMINADO */
`;

const MainView = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;

  @media (min-width: 768px) {
    &.sidebar-open {
      margin-left: 280px;
    }
  }
`;

const PageContent = styled.main`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

// ... (El resto de tus styled-components para el Modal)
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

const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedConsultorio, setSelectedConsultorio] = useState(null);
  const [availableConsultorios, setAvailableConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [releaseOnLogout, setReleaseOnLogout] = useState(true); // Estado para el checkbox

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

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

  const handleSelectConsultorio = async (consultorio) => {
    if (!consultorio || !user) return;
    const batch = writeBatch(db);
    const consultorioRef = doc(
      db,
      "hospitales_MedicalHand",
      user.hospitalId,
      "dr_office",
      consultorio.id
    );
    try {
      batch.update(consultorioRef, {
        status: "ocupado",
        assignedDoctorId: user.uid,
        assignedDoctorName: user.fullName,
        lastAssignment: serverTimestamp(),
      });
      await batch.commit();
      setSelectedConsultorio(consultorio);
    } catch (error) {
      console.error("Error al seleccionar el consultorio:", error);
    }
  };

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
    try {
      batch.update(consultorioRef, {
        status: "disponible",
        assignedDoctorId: null,
        assignedDoctorName: null,
        lastAssignment: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      console.error("Error al liberar el consultorio:", error);
      setSelectedConsultorio(consultorioToRelease);
    }
  };

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
    setReleaseOnLogout(true);
  };

  if (loading) {
    return <LoadingContainer>Cargando panel médico...</LoadingContainer>;
  }

  return (
    <>
      {/* El Sidebar ahora es un hermano del LayoutContainer */}
      <Sidebar
        className={isSidebarOpen ? "is-open" : ""}
        isOpen={isSidebarOpen}
        fullName={user?.fullName}
        hospitalName={user?.hospitalName}
        role={user?.claims?.role}
        handleLogout={handleLogoutClick}
      />

      {/* El LayoutContainer ahora solo envuelve el contenido principal */}
      <LayoutContainer>
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
              }}
            />
          </PageContent>
        </MainView>
      </LayoutContainer>

      {/* El modal se queda fuera de la estructura principal */}
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
              <ConfirmButton onClick={handleConfirmLogout}>
                Sí, salir
              </ConfirmButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default DoctorLayout;
