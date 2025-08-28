// src/components/SelectHorario.jsx

import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./SelectHorario.css";

// Importa los componentes de Material-UI
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";

// Importa los componentes de react-big-calendar y moment
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es"; // Asegúrate de importar el locale español para moment
import "react-big-calendar/lib/css/react-big-calendar.css";

// Configura el localizador para moment en español
moment.locale("es");
const localizer = momentLocalizer(moment);

const SelectHorario = ({ consultorio, onBack, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState("week");
  const [calendarDate, setCalendarDate] = useState(moment().toDate());

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

  // Datos de eventos de ejemplo.
  const myEventsList = [
    {
      title: "Cita con Dr. Smith",
      start: new Date(2025, 7, 26, 10, 0, 0),
      end: new Date(2025, 7, 26, 10, 30, 0),
      isBooked: true,
    },
    {
      title: "Espacio Disponible",
      start: new Date(2025, 7, 26, 11, 0, 0),
      end: new Date(2025, 7, 26, 11, 30, 0),
      isBookable: true,
    },
    {
      title: "Cita con Dr. Doe",
      start: new Date(2025, 7, 27, 14, 0, 0),
      end: new Date(2025, 7, 27, 14, 30, 0),
      isBooked: true,
    },
    {
      title: "Espacio Disponible",
      start: new Date(2025, 7, 27, 15, 0, 0),
      end: new Date(2025, 7, 27, 15, 30, 0),
      isBookable: true,
    },
  ];

  const handleSelectEvent = (event) => {
    if (event.isBookable) {
      setSelectedEvent(event);
      alert(
        `Has seleccionado el espacio disponible el ${moment(event.start).format(
          "DD/MM/YYYY"
        )} a las ${moment(event.start).format("HH:mm")}.`
      );
    } else {
      alert("Este horario ya está reservado.");
      setSelectedEvent(null);
    }
  };

  const handleConfirm = () => {
    if (selectedEvent && patientName && patientId) {
      const formattedDate = moment(selectedEvent.start).format("DD/MM/YYYY");
      const formattedTime = moment(selectedEvent.start).format("HH:mm");
      onConfirm({
        consultorio,
        paciente: {
          nombre: patientName,
          cedula: patientId,
        },
        fecha: formattedDate,
        hora: formattedTime,
      });
    } else {
      alert(
        "Por favor, selecciona un horario y completa los datos del paciente."
      );
    }
  };

  const eventPropGetter = (event) => {
    if (event.isBooked) {
      return {
        className: "booked-event",
      };
    }
    if (event.isBookable) {
      return {
        className: "available-event",
      };
    }
    return {};
  };

  return (
    <div className="main-container">
      <div className="cronograma">
        <div onClick={onBack} className="back-link">
          <FaArrowLeft className="back-icon" />
        </div>

        <div className="horario-title">
          <h2>Programar la Cita</h2>
        </div>
      </div>

      <div className="horario-container">
        {/* Lado Izquierdo: Datos del Paciente y Confirmación */}
        <div className="patient-info-section">
          <h2>Datos de la Cita</h2>
          <div className="selected-consultorio-info">
            <h3>Consultorio {consultorio.numero}</h3>
            <p>Estado: {consultorio.estado}</p>
          </div>

          <div className="patient-form">
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Nombre del Paciente</InputLabel>
              <OutlinedInput
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                label="Nombre del Paciente"
              />
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Cédula/ID</InputLabel>
              <OutlinedInput
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                label="Cédula/ID"
              />
            </FormControl>
          </div>

          <div className="selected-slot-info">
            {selectedEvent ? (
              <>
                <p>
                  **Fecha Seleccionada:**{" "}
                  {moment(selectedEvent.start).format("DD/MM/YYYY")}
                </p>
                <p>
                  **Horario Seleccionado:**{" "}
                  {moment(selectedEvent.start).format("HH:mm")}
                </p>
              </>
            ) : (
              <p>Selecciona un horario en el calendario.</p>
            )}
          </div>

          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!selectedEvent || !patientName || !patientId}
            sx={{ mt: 3 }}
          >
            Confirmar Cita
          </Button>
        </div>

        {/* Lado Derecho: Calendario */}
        <div className="big-calendar-container">
          <Calendar
            localizer={localizer}
            events={myEventsList}
            messages={messages}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            date={calendarDate}
            onNavigate={(newDate) => setCalendarDate(newDate)}
            views={["month", "week", "day", "agenda"]}
            view={currentView}
            onView={(view) => setCurrentView(view)}
            selectable
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventPropGetter}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectHorario;
