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

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 247,
    todayAppointments: 12,
    completed: 8,
    pending: 4,
  });

  useEffect(() => {
    setUpcomingAppointments([
      {
        id: 1,
        patient: "María González",
        time: "09:30 AM",
        type: "Consulta general",
        status: "confirmado",
      },
      {
        id: 2,
        patient: "Carlos Rodríguez",
        time: "10:15 AM",
        type: "Seguimiento",
        status: "confirmado",
      },
      {
        id: 3,
        patient: "Ana Martínez",
        time: "11:00 AM",
        type: "Revisión",
        status: "pendiente",
      },
      {
        id: 4,
        patient: "Javier López",
        time: "02:30 PM",
        type: "Consulta urgente",
        status: "confirmado",
      },
    ]);
  }, []);

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

  const AppointmentCard = ({ appointment }) => (
    <div className={`doctor-appointment-item ${appointment.status}`}>
      <div className="doctor-appointment-time">
        <FaClock />
        <span>{appointment.time}</span>
      </div>
      <div className="doctor-appointment-info">
        <h4>{appointment.patient}</h4>
        <p>{appointment.type}</p>
      </div>
      <div className={`doctor-appointment-status ${appointment.status}`}>
        {appointment.status === "confirmado" ? "Confirmado" : "Pendiente"}
      </div>
    </div>
  );

  return (
    <main className="doctor-dash-content">
      {/* Encabezado de bienvenida */}

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
          {upcomingAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
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
