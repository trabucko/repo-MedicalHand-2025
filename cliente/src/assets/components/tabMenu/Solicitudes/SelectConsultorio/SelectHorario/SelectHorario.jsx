// src/assets/components/tabMenu/Solicitudes/SelectConsultorio/SelectHorario/SelectHorario.jsx

import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUserMd,
  FaHospital,
  FaCalendarAlt,
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
  addDoc,
} from "firebase/firestore";

moment.locale("es");
const localizer = momentLocalizer(moment);

const SelectHorario = ({
  consultorio,
  doctor,
  onBack,
  onConfirm,
  appointmentRequest = {},
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
    noEventsInRange: "No hay horarios disponibles en este rango.",
  };

  useEffect(() => {
    if (!consultorio || !consultorio.id) return;

    const fetchSchedule = async () => {
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
          // Simplificado para leer solo eventos con fecha de inicio y fin
          if (data.start && data.end) {
            if (
              moment(data.start.toDate()).isAfter(moment()) &&
              data.isAvailable
            ) {
              generatedEvents.push({
                id: doc.id, // ID del horario para la actualización
                title: "Espacio Disponible",
                start: data.start.toDate(),
                end: data.end.toDate(),
                isBookable: true,
                isBooked: false,
              });
            } else if (!data.isAvailable) {
              generatedEvents.push({
                id: doc.id,
                title: "Reservado",
                start: data.start.toDate(),
                end: data.end.toDate(),
                isBookable: false,
                isBooked: true,
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
        // Ya no necesitamos pasar el ID de la cita original aquí,
        // porque la lógica de handleConfirmCita ya lo tiene de `appointmentRequest`.
        consultorio,
        doctor,
        fecha: formattedDate,
        hora: formattedTime,
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

  // --- FUNCIÓN DE CONFIRMACIÓN COMPLETAMENTE REFACTORIZADA ---
  const handleConfirmCita = async () => {
    if (!appointmentRequest || !appointmentRequest.id) {
      alert("No se encontró la solicitud de cita original para procesar.");
      return;
    }
    if (!selectedEvent || !selectedEvent.id) {
      alert("Error: No se ha seleccionado un horario válido del calendario.");
      return;
    }

    try {
      // 1. CONSTRUIR LOS DATOS DEL NUEVO APPOINTMENT
      const fechaHora = moment(
        `${citaConfirmadaData.fecha} ${citaConfirmadaData.hora}`,
        "DD/MM/YYYY HH:mm"
      ).toDate();

      const newAppointmentData = {
        patientUid: appointmentRequest.uid,
        patientFullName: appointmentRequest.fullName,
        reason: appointmentRequest.reason,
        specialty: appointmentRequest.specialty,
        status: "confirmada",
        assignedDoctor: doctor.nombre,
        clinicOffice: consultorio.name,
        appointmentDate: Timestamp.fromDate(fechaHora),
        createdAt: Timestamp.now(),
      };

      // 2. CREAR EL DOCUMENTO EN LA COLECCIÓN 'appointments' DEL CONSULTORIO
      const appointmentsRef = collection(
        db,
        "hospitals",
        "HL_FERNANDO_VP",
        "dr_office",
        consultorio.id,
        "appointments"
      );
      const newAppointmentRef = await addDoc(
        appointmentsRef,
        newAppointmentData
      );

      // 3. ACTUALIZAR EL HORARIO ('schedule') PARA ENLAZARLO Y RESERVARLO
      const scheduleRef = doc(
        db,
        "hospitals",
        "HL_FERNANDO_VP",
        "dr_office",
        consultorio.id,
        "schedules",
        selectedEvent.id
      );
      await updateDoc(scheduleRef, {
        isAvailable: false,
        appointmentId: newAppointmentRef.id,
      });

      // 4. ACTUALIZAR LA SOLICITUD ORIGINAL A 'confirmada' PARA EL HISTORIAL
      const originalRequestRef = doc(db, "citas", appointmentRequest.id);
      const dataToUpdate = {
        status: "confirmada",
        assignedDate: Timestamp.fromDate(fechaHora), // ✅ Añadir la fecha
        assignedDoctor: doctor.nombre, // ✅ Añadir el doctor
        clinicOffice: consultorio.name, // ✅ Añadir el consultorio
      };
      await updateDoc(originalRequestRef, dataToUpdate);

      alert("¡Cita agendada y horario reservado exitosamente!");
      setShowModal(false);
      onConfirm();
    } catch (error) {
      console.error("Error en el proceso de agendamiento:", error);
      alert("Hubo un error al agendar la cita. Intenta de nuevo.");
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
          </div>
          <Button
            variant="contained"
            onClick={handleOpenModal}
            disabled={!selectedEvent}
            className="sh-confirm-button"
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
