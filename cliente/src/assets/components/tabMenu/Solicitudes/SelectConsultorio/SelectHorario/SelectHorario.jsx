// src/components/SelectHorario.jsx

import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUserMd,
  FaHospital,
  FaCalendarAlt,
  FaInfoCircle,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./SelectHorario.css";
import { Button, Modal } from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ResumenCita from "../SelectHorario/resumenCita/resumenCita";
import { db } from "../../../../../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

moment.locale("es");
const localizer = momentLocalizer(moment);

// ✅ 1. Se añade un valor por defecto al prop para evitar que sea 'undefined'
const SelectHorario = ({
  consultorio,
  doctor,
  onBack,
  onConfirm,
  appointmentRequest = {}, // Valor por defecto es un objeto vacío
}) => {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (!consultorio || !consultorio.id) return;
    const fetchSchedule = async () => {
      console.log("consultorio recibido en SelectHorario:", consultorio);
      console.log("consultorio.id:", consultorio?.id);
      setLoading(true);
      const generatedEvents = [];
      try {
        const scheduleRef = collection(
          db,
          "hospitals",
          "HL_FERNANDO_VP",
          "dr_office",
          consultorio.id,
          "schedules"
        );
        const querySnapshot = await getDocs(scheduleRef);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.start && data.end) {
            if (
              moment(data.start.toDate()).isAfter(moment()) &&
              data.isAvailable
            ) {
              generatedEvents.push({
                title: "Espacio Disponible",
                start: data.start.toDate(),
                end: data.end.toDate(),
                isBookable: true,
                isBooked: false,
              });
            } else if (!data.isAvailable) {
              generatedEvents.push({
                title: "Reservado",
                start: data.start.toDate(),
                end: data.end.toDate(),
                isBookable: false,
                isBooked: true,
              });
            }
          } else if (data.days && data.startTime && data.endTime) {
            const momentDaysOfWeek = [
              "Lunes",
              "Martes",
              "Miércoles",
              "Jueves",
              "Viernes",
              "Sábado",
              "Domingo",
            ];
            const [startHour, startMinute] = data.startTime
              .split(":")
              .map(Number);
            const [endHour, endMinute] = data.endTime.split(":").map(Number);
            for (let i = 0; i < 8; i++) {
              data.days.forEach((day) => {
                const dayIndex = momentDaysOfWeek.indexOf(day);
                if (dayIndex === -1) return;
                const dayDate = moment()
                  .add(i, "weeks")
                  .isoWeekday(dayIndex + 1);
                if (dayDate.isSameOrAfter(moment(), "day")) {
                  const startDate = dayDate
                    .clone()
                    .hour(startHour)
                    .minute(startMinute)
                    .second(0)
                    .toDate();
                  const endDate = dayDate
                    .clone()
                    .hour(endHour)
                    .minute(endMinute)
                    .second(0)
                    .toDate();
                  generatedEvents.push({
                    title: data.isAvailable
                      ? "Espacio Disponible"
                      : "Reservado",
                    start: startDate,
                    end: endDate,
                    isBookable: data.isAvailable,
                    isBooked: !data.isAvailable,
                  });
                }
              });
            }
          }
        });
        setEventsList(generatedEvents);
      } catch (error) {
        console.error("Error al procesar la agenda:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [consultorio]);

  const handleSelectEvent = (event) => {
    if (event.isBookable) {
      setSelectedEvent(event);
    } else {
      alert("Este horario ya está reservado.");
      setSelectedEvent(null);
    }
  };

  const handleOpenModal = () => {
    // ✅ 2. Se añade una comprobación para asegurar que 'appointmentRequest' tiene datos
    if (!appointmentRequest || !appointmentRequest.id) {
      alert(
        "Error: No se ha proporcionado una solicitud de cita válida para agendar."
      );
      return;
    }

    if (selectedEvent) {
      const formattedDate = moment(selectedEvent.start).format("DD/MM/YYYY");
      const formattedTime = moment(selectedEvent.start).format("HH:mm");
      const citaData = {
        consultorio,
        doctor,
        fecha: formattedDate,
        hora: formattedTime,
        // Se usa optional chaining (?.) para máxima seguridad
        patient: {
          fullName: appointmentRequest?.fullName || "Paciente no especificado",
          reason: appointmentRequest?.reason || "Sin especificar",
        },
        hospital: appointmentRequest?.hospital || "Hospital no especificado",
      };
      setCitaConfirmadaData(citaData);
      setShowModal(true);
    } else {
      alert("Por favor, selecciona un horario en el calendario.");
    }
  };

  const handleCloseModal = () => setShowModal(false);

  // Dentro de SelectHorario
  const handleConfirmCita = async () => {
    if (!citaConfirmadaData?.id) {
      alert("No se encontró el ID de la cita a confirmar.");
      return;
    }

    try {
      const citaRef = doc(db, "citas", citaConfirmadaData.id); // colección 'citas'

      const fechaHora = moment(
        `${citaConfirmadaData.fecha} ${citaConfirmadaData.hora}`,
        "DD/MM/YYYY HH:mm"
      ).toDate();

      const dataToUpdate = {
        assignedDate: Timestamp.fromDate(fechaHora), // Fecha y hora
        assignedDoctor: citaConfirmadaData.doctor.nombre, // Nombre del doctor
        clinicOffice: citaConfirmadaData.consultorio.name, // Nombre del consultorio
        status: "confirmada", // Cambiar de 'pendiente' a 'confirmada'
      };

      await updateDoc(citaRef, dataToUpdate);

      alert("¡Cita confirmada exitosamente!");
      setShowModal(false);
      onConfirm(dataToUpdate); // ⚡ Para volver a la pantalla anterior
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      alert("Hubo un error al confirmar la cita, intenta de nuevo.");
    }
  };

  const eventPropGetter = (event) => {
    if (event.isBooked) return { className: "booked-event" };
    if (event.isBookable) return { className: "available-event" };
    return {};
  };

  return (
    <div className="sh-main-container">
      <div className="sh-cronograma">
        <div onClick={onBack} className="sh-back-link">
          <FaArrowLeft className="sh-back-icon" />
          <span>Volver</span>
        </div>
        <div className="sh-horario-title">
          <h2>Programar la Cita</h2>
        </div>
      </div>
      <div className="sh-horario-container">
        <div className="sh-patient-info-section">
          <div className="sh-info-header">
            <div className="sh-doctor-avatar">
              <FaUserMd className="sh-avatar-icon" />
            </div>
            <div className="sh-doctor-main-info">
              <h3>Dr. {doctor.nombre}</h3>
              <p className="sh-specialty">
                {doctor.especialidad || "Medicina General"}
              </p>
            </div>
          </div>
          <div className="sh-info-cards-container">
            <div className="sh-info-card">
              <div className="sh-card-icon">
                <FaHospital className="sh-icon" />
              </div>
              <div className="sh-card-content">
                <h4>Consultorio</h4>
                <p className="sh-card-value">{consultorio.name}</p>
                {consultorio.numero && (
                  <p className="sh-card-detail">Número: {consultorio.numero}</p>
                )}
                {consultorio.piso && (
                  <p className="sh-card-detail">Piso: {consultorio.piso}</p>
                )}
              </div>
            </div>
            <div className="sh-info-card sh-highlight">
              <div className="sh-card-icon">
                <FaCalendarAlt className="sh-icon" />
              </div>
              <div className="sh-card-content">
                <h4>Detalles de la Cita</h4>
                {selectedEvent ? (
                  <>
                    <p className="sh-card-value sh-highlight-date">
                      {moment(selectedEvent.start).format(
                        "DD [de] MMMM [de] YYYY"
                      )}
                    </p>
                    <p className="sh-card-value sh-highlight-time">
                      <FaClock className="sh-time-icon" />
                      {moment(selectedEvent.start).format("HH:mm")} hrs
                    </p>
                    <p className="sh-card-detail sh-status-available">
                      ✓ Horario disponible
                    </p>
                  </>
                ) : (
                  <div className="sh-no-selection">
                    <FaClock className="sh-no-selection-icon" />
                    <p className="sh-no-selection-text">
                      Selecciona un horario disponible en el calendario
                    </p>
                  </div>
                )}
              </div>
            </div>
            {consultorio.direccion && (
              <div className="sh-info-card">
                <div className="sh-card-icon">
                  <FaMapMarkerAlt className="sh-icon" />
                </div>
                <div className="sh-card-content">
                  <h4>Ubicación</h4>
                  <p className="sh-card-detail">{consultorio.direccion}</p>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="contained"
            onClick={handleOpenModal}
            disabled={!selectedEvent}
            className="sh-confirm-button"
            sx={{
              mt: 2,
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#115293",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
              },
              transition: "all 0.3s ease",
              fontSize: "1.1rem",
              padding: "12px 24px",
              borderRadius: "10px",
              fontWeight: "600",
              textTransform: "none",
            }}
          >
            {selectedEvent
              ? "Confirmar Cita Seleccionada"
              : "Selecciona un Horario"}
          </Button>
        </div>
        <div className="sh-big-calendar-container">
          {loading ? (
            <p>Cargando agenda...</p>
          ) : (
            <Calendar
              localizer={localizer}
              events={eventsList}
              messages={messages}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 690 }}
              date={calendarDate}
              onNavigate={(newDate) => setCalendarDate(newDate)}
              views={["month", "week", "day", "agenda"]}
              view={currentView}
              onView={(view) => setCurrentView(view)}
              selectable
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventPropGetter}
            />
          )}
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
