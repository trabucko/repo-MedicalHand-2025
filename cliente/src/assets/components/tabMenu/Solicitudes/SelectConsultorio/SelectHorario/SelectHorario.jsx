// src/components/SelectHorario.jsx

import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "./SelectHorario.css";
import { Button, Modal, Box } from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ResumenCita from "../SelectHorario/resumenCita/resumenCita";

moment.locale("es");
const localizer = momentLocalizer(moment);

const SelectHorario = ({ consultorio, doctor, onBack, onConfirm }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentView, setCurrentView] = useState("week");
  const [calendarDate, setCalendarDate] = useState(moment().toDate());
  const [showModal, setShowModal] = useState(false);
  const [citaConfirmadaData, setCitaConfirmadaData] = useState(null);

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
    {
      title: "Espacio Disponible",
      start: new Date(2025, 8, 1, 15, 0, 0),
      end: new Date(2025, 8, 1, 1, 0, 0),
      isBookable: true,
    },
  ];

  const handleSelectEvent = (event) => {
    if (event.isBookable) {
      setSelectedEvent(event);
    } else {
      alert("Este horario ya está reservado.");
      setSelectedEvent(null);
    }
  };

  const handleOpenModal = () => {
    if (selectedEvent) {
      const formattedDate = moment(selectedEvent.start).format("DD/MM/YYYY");
      const formattedTime = moment(selectedEvent.start).format("HH:mm");
      const citaData = {
        consultorio,
        doctor,
        fecha: formattedDate,
        hora: formattedTime,
      };
      setCitaConfirmadaData(citaData);
      setShowModal(true);
    } else {
      alert("Por favor, selecciona un horario en el calendario.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleConfirmCita = () => {
    alert("¡Cita agendada con éxito!");
    handleCloseModal();
    onConfirm(citaConfirmadaData);
  };

  const eventPropGetter = (event) => {
    if (event.isBooked) {
      return { className: "booked-event" };
    }
    if (event.isBookable) {
      return { className: "available-event" };
    }
    return {};
  };

  return (
    <div className="main-container">
      <div className="cronograma">
        <div onClick={onBack} className="back-link">
          <FaArrowLeft className="back-icon" />
          <span>Volver</span> {/* Añadimos "Volver" para claridad */}
        </div>
        <div className="horario-title">
          <h2>Programar la Cita</h2>
        </div>
      </div>
      <div className="horario-container">
        <div className="patient-info-section">
          <div className="selected-consultorio-info">
            <h3>Información de la Cita</h3>
            <p>
              <span className="info-label">Doctor:</span> {doctor.nombre}
            </p>
            <p>
              <span className="info-label">Consultorio:</span>{" "}
              {consultorio.name} {/* <--- CAMBIO AQUÍ */}
            </p>
            <p>
              <span className="info-label">Estado:</span> {consultorio.estado}
            </p>
          </div>
          <div className="selected-slot-info">
            <h4>Detalles de la Cita</h4>
            {selectedEvent ? (
              <>
                <p>
                  <span className="info-label">Fecha:</span>{" "}
                  {moment(selectedEvent.start).format("DD/MM/YYYY")}
                </p>
                <p>
                  <span className="info-label">Horario:</span>{" "}
                  {moment(selectedEvent.start).format("HH:mm")}
                </p>
              </>
            ) : (
              <p className="no-selection-message">
                Selecciona un horario disponible en el calendario para
                continuar.
              </p>
            )}
          </div>
          <Button
            variant="contained"
            onClick={handleOpenModal}
            disabled={!selectedEvent}
            sx={{
              mt: 3,
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#115293" },
            }}
          >
            Confirmar Cita
          </Button>
        </div>
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

      <Modal open={showModal} onClose={handleCloseModal}>
        <ResumenCita
          appointmentDetails={citaConfirmadaData}
          onConfirm={handleConfirmCita}
          onBack={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default SelectHorario;
