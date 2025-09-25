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
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { db } from "../../../firebase"; // Ajusta la ruta a tu config de Firebase
import {
  collection,
  query,
  where,
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
    if (!user) return;

    const fetchDoctorData = async () => {
      setLoading(true);
      try {
        const adminUsersRef = collection(db, "usuarios_hospitales");
        const userQuery = query(adminUsersRef, where("uid", "==", user.uid));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          console.log("No se encontró el documento del doctor.");
          setLoading(false);
          return;
        }

        const doctorData = userSnapshot.docs[0].data();
        const { hospitalId, assignedOfficeId } = doctorData;

        if (!hospitalId || !assignedOfficeId) {
          console.log("El doctor no tiene un consultorio asignado.");
          setLoading(false);
          return;
        }

        const todayStart = Timestamp.fromDate(moment().startOf("day").toDate());
        const appointmentsRef = collection(
          db,
          "hospitals",
          hospitalId,
          "dr_office",
          assignedOfficeId,
          "appointments"
        );
        const q = query(
          appointmentsRef,
          where("appointmentDate", ">=", todayStart),
          orderBy("appointmentDate", "asc")
        );

        const querySnapshot = await getDocs(q);
        const appointmentsList = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            // Asegúrate de que tus documentos de citas tengan el campo 'patientId'
            patientId: data.patientUid,
            patient: data.patientFullName,
            time: moment(data.appointmentDate.toDate()).format("hh:mm A"),
            type: data.reason || "Consulta",
            status: data.status,
          };
        });

        setUpcomingAppointments(appointmentsList);
      } catch (error) {
        console.error("Error al obtener las citas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [user]);

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
        {appointment.status === "confirmada" ? "Confirmado" : "Pendiente"}
      </div>
    </div>
  );

  return (
    <main className="doctor-dash-content">
      {/* ... (sección de stats no cambia) ... */}
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
          {loading ? (
            <p>Cargando citas...</p>
          ) : upcomingAppointments.length === 0 ? (
            <p className="doctor-no-appointments">
              No hay citas próximas para hoy.
            </p>
          ) : (
            // ✅ CORRECCIÓN CLAVE AQUÍ
            upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                // Le pasamos la función y el ID correcto
                onClick={() => handleAppointmentClick(appointment.patientId)}
              />
            ))
          )}
        </div>
      </section>

      {/* ... (resto del JSX no cambia) ... */}
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
