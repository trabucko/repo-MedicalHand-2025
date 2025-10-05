import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBell,
  FaChartLine,
  FaCalendarAlt,
  FaCalendarDay,
  FaUserInjured,
  FaStethoscope,
  FaDoorOpen,
  FaExchangeAlt,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import { doc, updateDoc } from "firebase/firestore";
import "./Header.css";
import MenuHamburguer from "../../../menu_hamburguesa/menu";

const Header = ({
  user,
  toggleSidebar,
  consultorio,
  db,
  hospitalId,
  onConsultorioChange,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleConsultorioClick = () => {
    if (consultorio) {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleLeaveConsultorio = async () => {
    if (!consultorio || !consultorio.id || !db || !hospitalId) {
      console.error(
        "Error: Faltan datos para procesar la salida del consultorio."
      );
      return;
    }

    setIsUpdating(true);

    const consultorioRef = doc(
      db,
      "hospitales_MedicalHand",
      hospitalId,
      "dr_office",
      consultorio.id
    );

    try {
      await updateDoc(consultorioRef, {
        status: "disponible",
        assignedDoctorId: null,
        assignedDoctorName: null,
      });

      console.log("El consultorio ha sido liberado exitosamente.");

      if (onConsultorioChange) {
        onConsultorioChange(null);
      }
    } catch (error) {
      console.error("Error al actualizar el estado del consultorio:", error);
    } finally {
      setIsUpdating(false);
      setShowModal(false);
    }
  };

  const handleChangeConsultorio = () => {
    if (onConsultorioChange) {
      onConsultorioChange(null);
    }
    setShowModal(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <div className="header-title-group">
            <h1 className="ti">Panel Médico</h1>
            <p>Bienvenido, Dr. {user?.fullName || "Usuario"}</p>
          </div>
        </div>
        <div className="header-right">
          <div
            className={`header-consultorio-info ${
              consultorio ? "assigned" : ""
            }`}
            onClick={handleConsultorioClick}
            title={
              consultorio ? "Gestionar consultorio" : "Sin consultorio asignado"
            }
          >
            <FaDoorOpen className="consultorio-icon" />
            <span className="consultorio-iam">
              {consultorio
                ? `Consultorio: ${consultorio.name}`
                : "Consultorio: No asignado"}
            </span>
          </div>

          <button className="notification-btn">
            <FaBell />
            <span className="notification-badge">3</span>
          </button>
          <MenuHamburguer onClick={toggleSidebar} />
        </div>
      </header>

      {showModal && (
        <div className="consultorio-modal-overlay" onClick={handleCloseModal}>
          <div
            className="consultorio-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Acciones del Consultorio</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Estás asignado al <strong>{consultorio?.name}</strong>. ¿Qué
                deseas hacer?
              </p>
              <div className="consultorio-options">
                <button
                  className="option-btn leave-btn"
                  onClick={handleLeaveConsultorio}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    "Saliendo..."
                  ) : (
                    <>
                      <FaSignOutAlt /> Salir del consultorio
                    </>
                  )}
                </button>
                <button
                  className="option-btn change-btn"
                  onClick={handleChangeConsultorio}
                  disabled={isUpdating}
                >
                  <FaExchangeAlt /> Cambiar de consultorio
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="header-sub-nav">
        <NavLink
          to="/dashboard-doctor"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
          end
        >
          <FaChartLine /> Resumen
        </NavLink>
        <NavLink
          to="/dashboard-doctor/appointments"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
        >
          <FaCalendarAlt /> Citas
        </NavLink>
        <NavLink
          to="/dashboard-doctor/horario"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
        >
          <FaCalendarDay /> Horario
        </NavLink>
        <NavLink
          to="/dashboard-doctor/patients"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
        >
          <FaUserInjured /> Pacientes
        </NavLink>
        <NavLink
          to="/dashboard-doctor/reports"
          className={({ isActive }) =>
            isActive ? "header-nav-btn active" : "header-nav-btn"
          }
        >
          <FaStethoscope /> Reportes
        </NavLink>
      </nav>
    </>
  );
};

export default Header;
