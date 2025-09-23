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

  // ✅ ================== INICIO DE LA ACTUALIZACIÓN ================== ✅
  // Esta lógica ahora procesará AMBOS tipos de horarios.
  const calendarEvents = useMemo(() => {
    const now = moment(); // Base para horarios recurrentes
    return schedules.flatMap((schedule) => {
      // CASO 1: Es un horario específico con fechas completas (Formato Nuevo)
      if (schedule.start && schedule.end) {
        return [
          {
            title: schedule.title || "Reservado",
            start: schedule.start, // Ya es un objeto Date
            end: schedule.end, // Ya es un objeto Date
            resource: schedule,
          },
        ];
      }

      // CASO 2: Es un horario recurrente (Formato Antiguo)
      if (schedule.startTime && schedule.endTime && schedule.days) {
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
      }

      // Si no es ninguno de los dos, es un dato inválido y se ignora.
      console.warn("Horario ignorado por formato desconocido:", schedule);
      return []; // Retorna un array vacío para ser filtrado por flatMap
    });
  }, [schedules]);
  // ✅ =================== FIN DE LA ACTUALIZACIÓN =================== ✅

  const { minTime, maxTime } = useMemo(
    () => ({
      minTime: moment().startOf("day").toDate(),
      maxTime: moment().endOf("day").toDate(),
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
        padding: "20px 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
    // Para horarios específicos, el 'resource' es el horario completo
    // Para recurrentes, también lo es. Esta lógica es universal.
    setModalState({ type: "edit", schedule: event.resource });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState(null);
  }, []);

  const handleSaveSchedule = useCallback(
    (dataFromModal) => {
      if (dataFromModal.id) {
        onUpdateSchedule(dataFromModal);
      } else {
        const finalSchedule = {
          // Asegúrate que tu modal envíe algo como:
          // { isAvailable: false, reason: "Cita personal" }
          // o { isAvailable: true, title: "Espacio extra" }
          ...dataFromModal,
          start: modalState.start,
          end: modalState.end,
        };
        onAddSchedule(finalSchedule);
      }
      handleCloseModal();
    },
    [modalState, onUpdateSchedule, onAddSchedule, handleCloseModal]
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
