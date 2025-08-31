import React, { useState } from "react";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./SelectReprogramacion.css";
import SelectConsultorio from "../../Solicitudes/SelectConsultorio/selectConsultorio";

moment.locale("es");
const localizer = momentLocalizer(moment);

const SelectReprogramacion = ({ onReturn, originalCita }) => {
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [reprogrammingReason, setReprogrammingReason] = useState(
    "Fiebre y dolor de garganta"
  );
  const [currentCalendarDate, setCurrentCalendarDate] = useState(
    new Date(2025, 8, 10)
  );

  const myEventsList = [
    {
      title: "Ocupado",
      start: new Date(2025, 8, 10, 10, 0),
      end: new Date(2025, 8, 10, 11, 0),
      status: "ocupado",
      isBookable: false,
    },
    {
      title: "Disponible",
      start: new Date(2025, 8, 10, 11, 0),
      end: new Date(2025, 8, 10, 12, 0),
      status: "disponible",
      isBookable: true,
    },
    {
      title: "No trabaja",
      start: new Date(2025, 8, 11, 8, 0),
      end: new Date(2025, 8, 11, 17, 0),
      status: "no-trabaja",
      isBookable: false,
    },
    {
      title: "Disponible",
      start: new Date(2025, 8, 12, 9, 0),
      end: new Date(2025, 8, 12, 10, 0),
      status: "disponible",
      isBookable: true,
    },
    {
      title: "Ocupado",
      start: new Date(2025, 8, 15, 15, 30),
      end: new Date(2025, 8, 15, 16, 30),
      status: "ocupado",
      isBookable: false,
    },
    {
      title: "Disponible",
      start: new Date(2025, 8, 15, 16, 30),
      end: new Date(2025, 8, 15, 17, 30),
      status: "disponible",
      isBookable: true,
    },
    {
      title: "Disponible",
      start: new Date(2025, 8, 12, 10, 0),
      end: new Date(2025, 8, 12, 11, 0),
      status: "disponible",
      isBookable: true,
    },
  ];

  const eventPropGetter = (event) => {
    switch (event.status) {
      case "disponible":
        return { className: "available-event" };
      case "ocupado":
        return { className: "booked-event" };
      case "no-trabaja":
        return { className: "off-event" };
      default:
        return {};
    }
  };

  const messages = {
    allDay: "Todo el día",
    previous: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Evento",
    noEventsInRange: "Sin eventos",
  };

  const originalPatientData = {
    nombre: "Ana Gómez",
    cedula: "123-456789-0123P",
    contacto: "ana.g@example.com",
    cita: {
      fecha: "10/09/2025",
      hora: "10:00 AM",
      doctor: "Dr. Ana Gómez",
    },
  };

  const handleSelectEvent = (event) => {
    if (event.isBookable) {
      setSelectedEvent(event);
      setShowCalendarModal(false);
    } else {
      alert("Este horario ya está reservado.");
      setSelectedEvent(null);
    }
  };

  const handleSelectOffice = (office) => {
    // This function receives the selected office from SelectConsultorio
    setSelectedOffice(office);
    setShowOfficeModal(false);
    setShowCalendarModal(true);
  };

  const handleNavigate = (newDate) => {
    setCurrentCalendarDate(newDate);
  };

  const handleView = (newView) => {
    // Puedes manejar el cambio de vista aquí si es necesario
  };

  return (
    <div className="select-reprogramacion-container">
      <div className="contenedor-repro">
        <div className="select-reprogramacion-header">
          <div onClick={onReturn} className="back-linkk">
            <FaArrowLeft className="back-icon" />
          </div>
          <h2>Reprogramar Cita</h2>
        </div>

        <div className="main-card-wrapper">
          <div className="reprogram-card">
            <div className="card-header-icon">
              <FaUser className="user-icon" />
              <h3 className="card-title">Datos de la Cita</h3>
            </div>

            <div className="card-fields">
              <div className="card-field">
                <label>Paciente</label>
                <p className="patient-value">{originalPatientData.nombre}</p>
              </div>
              <div className="card-field">
                <label>Cédula</label>
                <p className="patient-value">{originalPatientData.cedula}</p>
              </div>
              <div className="card-field">
                <label>Correo Electrónico</label>
                <p className="patient-value">{originalPatientData.contacto}</p>
              </div>

              <div className="card-field editable-field">
                <label>Consultorio</label>
                <div
                  className="select-consultorio-trigger"
                  onClick={() => setShowOfficeModal(true)}
                >
                  <p>
                    {selectedOffice
                      ? selectedOffice.name
                      : "Selecciona un consultorio..."}
                  </p>
                </div>
              </div>

              <div className="card-field editable-field">
                <label>Fecha y Hora de la Cita</label>
                <span className="value-display">
                  {selectedEvent
                    ? `${moment(selectedEvent.start).format(
                        "DD/MM/YYYY"
                      )} - ${moment(selectedEvent.start).format("HH:mm A")}`
                    : "Aún no has escogido una fecha y hora"}
                </span>
              </div>

              <div className="card-field">
                <label htmlFor="reason-input">
                  Motivo de Reprogramación (Dictado del paciente)
                </label>
                <textarea
                  id="reason-input"
                  className="textarea-input"
                  placeholder="Escribe el motivo aquí..."
                  value={reprogrammingReason}
                  onChange={(e) => setReprogrammingReason(e.target.value)}
                />
              </div>
            </div>

            <button
              className="reprogramar-btn"
              onClick={() => {
                // Logic for final reprogramming
              }}
              disabled={!selectedEvent || !selectedOffice}
            >
              Confirmar Reprogramación
            </button>
          </div>
        </div>

        {showOfficeModal && (
          <div className="modal-overlay">
            <SelectConsultorio
              onClose={() => setShowOfficeModal(false)}
              onSelectOffice={handleSelectOffice}
              isReprogramming={true} // <-- ¡Activa el modo de reprogramación!
            />
          </div>
        )}

        {showCalendarModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowCalendarModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close-btn"
                onClick={() => setShowCalendarModal(false)}
              >
                &times;
              </button>
              <h3 className="modal-title">
                Horario para {selectedOffice?.name || "Consultorio"}
              </h3>
              <Calendar
                localizer={localizer}
                events={myEventsList}
                messages={messages}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                date={currentCalendarDate}
                onNavigate={handleNavigate}
                onView={handleView}
                views={["month", "week", "day", "agenda"]}
                selectable={true}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventPropGetter}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectReprogramacion;
