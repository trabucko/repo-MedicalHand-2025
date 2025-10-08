// src/assets/pages/hospitalDoctor/DoctorDashboard.jsx

import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaUserInjured,
  FaClock,
  FaChartLine,
  FaStethoscope,
} from "react-icons/fa";
import "./DoctorDashboard.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDoc, // Importamos getDoc para buscar un único documento
  doc, // Importamos doc para referenciar un único documento
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import moment from "moment";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 247,
    todayAppointments: 12,
    completed: 8,
    pending: 4,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Si no tenemos la información del usuario del contexto, no hacemos nada.
    if (!user || !user.hospitalId) {
      setLoading(false);
      return;
    }

    const fetchDoctorDataAndAppointments = async () => {
      setLoading(true);
      try {
        // 1. Construimos la RUTA CORRECTA al documento del doctor.
        const userDocRef = doc(
          db,
          "hospitales_MedicalHand",
          user.hospitalId,
          "users",
          user.uid
        );

        // 2. Obtenemos el documento del doctor para ver si tiene un consultorio asignado.
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.log(
            "No se encontró el documento del doctor en la ruta correcta."
          );
          setLoading(false);
          return;
        }

        const doctorData = userDocSnap.data();
        const { assignedOfficeId } = doctorData; // Obtenemos el ID del consultorio asignado.

        // 3. Verificamos si el doctor tiene un consultorio asignado (el paso que querías).
        if (!assignedOfficeId) {
          console.log(
            "El doctor no tiene un consultorio asignado en su perfil."
          );
          // Aquí podrías redirigir o mostrar un mensaje para que seleccione uno.
          setLoading(false);
          return;
        }

        // 4. Si tiene consultorio, construimos la RUTA CORRECTA a las citas.
        const todayStart = Timestamp.fromDate(moment().startOf("day").toDate());
        const appointmentsRef = collection(
          db,
          "hospitales_MedicalHand", // Colección principal correcta
          user.hospitalId, // ID del hospital desde el contexto
          "dr_office",
          assignedOfficeId, // ID del consultorio que acabamos de encontrar
          "appointments"
        );

        // 5. Buscamos las citas de hoy en adelante.
        const q = query(
          appointmentsRef,
          where("appointmentDate", ">=", todayStart),
          orderBy("appointmentDate", "asc")
        );

        const querySnapshot = await getDocs(q);
        const appointmentsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          // Hacemos una verificación para evitar errores si 'appointmentDate' no existe
          const time = data.appointmentDate
            ? moment(data.appointmentDate.toDate()).format("hh:mm A")
            : "Hora no definida";

          return {
            id: doc.id,
            patientId: data.patientUid,
            patient: data.patientFullName,
            time: time,
            type: data.reason || "Consulta",
            status: data.status,
          };
        });

        setUpcomingAppointments(appointmentsList);
      } catch (error) {
        console.error(
          "Error al obtener los datos del doctor y sus citas:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDataAndAppointments();
  }, [user]); // El efecto depende del objeto 'user'

  const handleAppointmentClick = (patientId) => {
    if (patientId) {
      navigate(`/dashboard-doctor/paciente/${patientId}`);
    } else {
      console.error("ID del paciente no encontrado en esta cita.");
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className="doctor-stat-card">
      <div className="doctor-stat-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="doctor-stat-content">
        <h3>{value}</h3>
        <p className="doctor-stat-title">{title}</p>
        <p className="doctor-stat-subtitle">{subtitle}</p>
      </div>
    </div>
  );

  const AppointmentCard = ({ appointment, onClick }) => (
    <div
      className={`doctor-appointment-item ${appointment.status}`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="doctor-appointment-time">
        <FaClock />
        <span>{appointment.time}</span>
      </div>
      <div className="doctor-appointment-info">
        <h4>{appointment.patient}</h4>
        <p>{appointment.type}</p>
      </div>
      <div className={`doctor-appointment-status ${appointment.status}`}>
        {appointment.status}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container" style={{ padding: "50px" }}>
        <div className="loading-spinner"></div>
        <h2 style={{ textAlign: "center", marginTop: "20px" }}>
          Cargando información del doctor...
        </h2>
      </div>
    );
  }

  return (
    <main className="doctor-dash-content">
      <section className="doctor-stats-grid">
        <StatCard
          icon={<FaUserInjured />}
          title="Pacientes Totales"
          value={stats.totalPatients}
          subtitle="+12 este mes"
          color="#4CAF50"
        />
        <StatCard
          icon={<FaCalendarAlt />}
          title="Citas Hoy"
          value={stats.todayAppointments}
          subtitle={`${stats.completed} completadas`}
          color="#2196F3"
        />
        <StatCard
          icon={<FaClock />}
          title="Pendientes"
          value={stats.pending}
          subtitle="Por atender"
          color="#FF9800"
        />
        <StatCard
          icon={<FaStethoscope />}
          title="Consultas Mensuales"
          value="184"
          subtitle="+8% vs mes anterior"
          color="#9C27B0"
        />
      </section>

      <section className="doctor-appointments-section">
        <div className="doctor-section-header">
          <h2>Próximas Citas</h2>
          <button className="doctor-view-all-btn">Ver todas</button>
        </div>
        <div className="doctor-appointments-list">
          {upcomingAppointments.length === 0 ? (
            <p className="doctor-no-appointments">
              No hay citas próximas para hoy.
            </p>
          ) : (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onClick={() => handleAppointmentClick(appointment.patientId)}
              />
            ))
          )}
        </div>
      </section>

      <div className="doctor-dash-grid">
        <section className="doctor-quick-actions">
          <div className="doctor-section-header">
            <h2>Acciones Rápidas</h2>
          </div>
          <div className="doctor-actions-grid">
            <button className="doctor-action-btn">
              <FaCalendarAlt />
              <span>Nueva Cita</span>
            </button>
            <button className="doctor-action-btn">
              <FaUserInjured />
              <span>Nuevo Paciente</span>
            </button>
            <button className="doctor-action-btn">
              <FaStethoscope />
              <span>Registrar Consulta</span>
            </button>
            <button className="doctor-action-btn">
              <FaChartLine />
              <span>Generar Reporte</span>
            </button>
          </div>
        </section>
        <section className="doctor-recent-activity">
          <div className="doctor-section-header">
            <h2>Actividad Reciente</h2>
          </div>
          <div className="doctor-activity-list">
            <div className="doctor-activity-item">
              <div className="doctor-activity-icon">
                <FaUserInjured />
              </div>
              <div className="doctor-activity-content">
                <p>
                  Nuevo paciente registrado: <strong>Laura Sánchez</strong>
                </p>
                <span className="doctor-activity-time">Hace 15 minutos</span>
              </div>
            </div>
            <div className="doctor-activity-item">
              <div className="doctor-activity-icon">
                <FaCalendarAlt />
              </div>
              <div className="doctor-activity-content">
                <p>
                  Cita completada con <strong>Carlos Mendoza</strong>
                </p>
                <span className="doctor-activity-time">Hace 1 hora</span>
              </div>
            </div>
            <div className="doctor-activity-item">
              <div className="doctor-activity-icon">
                <FaStethoscope />
              </div>
              <div className="doctor-activity-content">
                <p>
                  Diagnóstico registrado para <strong>Ana Rodríguez</strong>
                </p>
                <span className="doctor-activity-time">Hace 2 horas</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default DoctorDashboard;
