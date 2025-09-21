import React, { useState, useMemo, useCallback, Suspense } from "react";
import "./HorarioMedico.css";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/es";
const ScheduleModal = React.lazy(() =>
  import("./ScheduleModal").then((module) => ({
    default: module.ScheduleModal,
  }))
);
import CalendarWrapper from "./CalendarWrapper";

// --- Configuración de Moment.js ---
moment.locale("es");
const localizer = momentLocalizer(moment);

const momentDaysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const calendarStyle = { height: 600 };
const calendarViews = ["month", "week", "day"];
const calendarMessages = {
  next: "Siguiente",
  previous: "Anterior",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay horarios definidos en este rango.",
};

const HorarioMedico = ({
  schedules = [],
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
}) => {
  const [modalState, setModalState] = useState(null);
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());

  const calendarEvents = useMemo(() => {
    const now = moment();
    return schedules
      .filter((schedule) => {
        const hasValidTimes =
          schedule &&
          typeof schedule.startTime === "string" &&
          schedule.startTime &&
          typeof schedule.endTime === "string" &&
          schedule.endTime;
        if (!hasValidTimes) {
          console.warn("Horario ignorado por datos incompletos:", schedule);
        }
        return hasValidTimes;
      })
      .flatMap((schedule) => {
        if (!schedule.days || schedule.days.length === 0) {
          return [];
        }
        return schedule.days.map((day) => {
          const dayIndex = momentDaysOfWeek.indexOf(day);
          const [startHour, startMinute] = schedule.startTime
            .split(":")
            .map(Number);
          const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
          const dayDate = now.clone().day(dayIndex + 1);
          const startDate = dayDate
            .clone()
            .hour(startHour)
            .minute(startMinute)
            .toDate();
          const endDate = dayDate
            .clone()
            .hour(endHour)
            .minute(endMinute)
            .toDate();
          return {
            title: schedule.isAvailable
              ? "Disponible"
              : schedule.reason || "No Disponible",
            start: startDate,
            end: endDate,
            resource: schedule,
          };
        });
      });
  }, [schedules]);

  // ✅ CAMBIO 1: Modificamos minTime y maxTime para que abarquen 24 horas.
  const { minTime, maxTime } = useMemo(
    () => ({
      minTime: moment().startOf("day").toDate(), // 00:00
      maxTime: moment().endOf("day").toDate(), // 23:59
    }),
    []
  );

  const handleView = useCallback((newView) => setView(newView), []);
  const handleNavigate = useCallback((newDate) => setDate(newDate), []);

  const eventPropGetter = useCallback(
    (event) => ({
      style: {
        borderRadius: "5px",
        opacity: 0.9,
        color: "white",
        border: "0px",
        padding: "20px 10px", // Mantiene tu padding para la altura

        // ✅ --- INICIO DE LOS CAMBIOS ---
        display: "flex", // 1. Convierte el cuadro en un contenedor flexible
        alignItems: "center", // 2. Centra el contenido verticalmente
        justifyContent: "center", // 3. Centra el contenido horizontalmente
        // ✅ --- FIN DE LOS CAMBIOS ---

        backgroundColor:
          event.resource && !event.resource.isAvailable
            ? "#d53535ff"
            : "#299950ff",
      },
    }),
    []
  );

  const handleSelectSlot = useCallback(({ start, end }) => {
    setModalState({ type: "new", start, end });
  }, []);

  const handleSelectEvent = useCallback((event) => {
    setModalState({ type: "edit", schedule: event.resource });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState(null);
  }, []);

  const handleSaveSchedule = useCallback(
    (scheduleData) => {
      if (scheduleData.id) {
        onUpdateSchedule(scheduleData);
      } else {
        onAddSchedule(scheduleData);
      }
      handleCloseModal();
    },
    [onUpdateSchedule, onAddSchedule, handleCloseModal]
  );

  const handleDeleteSchedule = useCallback(
    (scheduleId) => {
      onDeleteSchedule(scheduleId);
      handleCloseModal();
    },
    [onDeleteSchedule, handleCloseModal]
  );

  return (
    <div className="horario-medico-container">
      <div className="horario-header">
        <h2>Gestión de Horario Médico</h2>
        <p>
          Defina y administre su disponibilidad. Haz clic en cualquier dia del
          calendario para empezar a configurar tu horario.
        </p>
      </div>
      <div className="calendar-container">
        <CalendarWrapper
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventPropGetter}
          view={view}
          date={date}
          onView={handleView}
          onNavigate={handleNavigate}
          style={calendarStyle}
          views={calendarViews}
          messages={calendarMessages}
          min={minTime}
          max={maxTime}
          // ✅ CAMBIO 2: Añadimos estas props para hacer las celdas más altas.
          step={60}
          timeslots={1}
        />
      </div>
      <Suspense fallback={<div>Cargando...</div>}>
        {modalState && (
          <ScheduleModal
            isOpen={!!modalState}
            onClose={handleCloseModal}
            onSave={handleSaveSchedule}
            onDelete={handleDeleteSchedule}
            modalState={modalState}
          />
        )}
      </Suspense>
    </div>
  );
};

export default HorarioMedico;
