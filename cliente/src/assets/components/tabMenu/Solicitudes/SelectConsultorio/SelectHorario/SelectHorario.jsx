// src/assets/components/tabMenu/Solicitudes/SelectConsultorio/SelectHorario/SelectHorario.jsx

import React, { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaUserMd,
  FaHospital,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import "./SelectHorario.css";
import { Button, Modal } from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ResumenCita from "./resumenCita/resumenCita";
import { db } from "../../../../../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  addDoc,
  setDoc, // ✨ 1. Importar setDoc
} from "firebase/firestore";

moment.locale("es");
const localizer = momentLocalizer(moment);

const SelectHorario = ({
  consultorio,
  doctor,
  onBack,
  onConfirm,
  appointmentRequest = {},
  hospitalId,
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
    if (!hospitalId || !consultorio?.id) {
      console.error(
        "[SelectHorario] Falta hospitalId o consultorio.id para buscar horarios."
      );
      setLoading(false);
      return;
    }

    setLoading(true);

    const scheduleRef = collection(
      db,
      "hospitales_MedicalHand",
      hospitalId,
      "dr_office",
      consultorio.id,
      "schedules"
    );

    const unsubscribe = onSnapshot(
      scheduleRef,
      (snapshot) => {
        console.log(
          `[SelectHorario] Firestore respondió con ${snapshot.size} horarios.`
        );
        const generatedEvents = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const docId = doc.id;

          if (data.start?.toDate && data.end?.toDate) {
            const start = data.start.toDate();
            const end = data.end.toDate();

            if (data.isAvailable) {
              generatedEvents.push({
                id: docId,
                title: "Disponible",
                start,
                end,
                isBookable: true,
                isBooked: false,
              });
            } else {
              generatedEvents.push({
                id: docId,
                title: "Reservado",
                start,
                end,
                isBookable: false,
                isBooked: true,
              });
            }
          } else {
            console.warn(
              `[SelectHorario] El horario con ID ${docId} tiene fechas inválidas.`
            );
          }
        });

        console.log(
          "[SelectHorario] Horarios procesados para el calendario:",
          generatedEvents
        );
        setEventsList(generatedEvents);
        setLoading(false);
      },
      (error) => {
        console.error("[SelectHorario] Error al obtener horarios:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [consultorio, hospitalId]);

  const handleSelectEvent = (event) => {
    if (event.isBookable) {
      setSelectedEvent(event);
    } else {
      alert("Este horario ya está reservado.");
      setSelectedEvent(null);
    }
  };

  const handleOpenModal = () => {
    if (!appointmentRequest?.id) {
      alert("Error: No se ha proporcionado una solicitud de cita válida.");
      return;
    }
    if (selectedEvent) {
      const citaData = {
        consultorio,
        doctor,
        fecha: moment(selectedEvent.start).format("DD/MM/YYYY"),
        hora: moment(selectedEvent.start).format("HH:mm"),
        patient: {
          fullName: appointmentRequest?.fullName || "N/A",
          reason: appointmentRequest?.reason || "N/A",
        },
        hospital: appointmentRequest?.hospital || "N/A",
      };
      setCitaConfirmadaData(citaData);
      setShowModal(true);
    } else {
      alert("Por favor, selecciona un horario disponible en el calendario.");
    }
  };

  const handleCloseModal = () => setShowModal(false);

  const handleConfirmCita = async () => {
    if (!appointmentRequest?.id || !selectedEvent?.id || !hospitalId) {
      alert(
        "Faltan datos para confirmar la cita (solicitud, horario o hospital)."
      );
      return;
    }

    try {
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
        // El campo 'appointment_id' ya no es necesario aquí,
        // porque el ID del DOCUMENTO será el mismo que el de la solicitud.
      };

      // ✨ 2. Definimos la ruta a la colección de citas confirmadas
      const appointmentsRef = collection(
        db,
        "hospitales_MedicalHand",
        hospitalId,
        "dr_office",
        consultorio.id,
        "appointments"
      );

      // ✨ 3. Creamos una referencia al NUEVO documento USANDO EL ID de la solicitud original
      const newAppointmentRef = doc(appointmentsRef, appointmentRequest.id);

      // ✨ 4. Usamos setDoc para crear el documento con el ID que especificamos
      await setDoc(newAppointmentRef, newAppointmentData);

      const scheduleRef = doc(
        db,
        "hospitales_MedicalHand",
        hospitalId,
        "dr_office",
        consultorio.id,
        "schedules",
        selectedEvent.id
      );
      // Ahora actualizamos el horario con el ID del nuevo documento de cita, que es el mismo que el de la solicitud
      await updateDoc(scheduleRef, {
        isAvailable: false,
        appointmentId: newAppointmentRef.id, // Esto sigue funcionando, .id nos da el ID de la referencia
      });

      const originalRequestRef = doc(db, "citas", appointmentRequest.id);
      await updateDoc(originalRequestRef, {
        status: "confirmada",
        assignedDate: Timestamp.fromDate(fechaHora),
        assignedDoctor: doctor.nombre,
        clinicOffice: consultorio.name,
      });

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
            <div className="calendar-loader">Cargando agenda...</div>
          ) : (
            <Calendar
              localizer={localizer}
              events={eventsList}
              messages={messages}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "calc(100vh - 200px)" }}
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
