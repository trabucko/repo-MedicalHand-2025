import React, { useState, useMemo, useCallback, Suspense } from "react";
import "./HorarioMedico.css";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/es";
import toast from 'react-hot-toast';

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

  // Esta lógica ahora procesará AMBOS tipos de horarios.
  const calendarEvents = useMemo(() => {
    // Esta lógica genera múltiples eventos para cada día de la semana para horarios recurrentes
    return schedules.flatMap((schedule) => {
      // CASO 1: Horario específico con fecha y hora completas
      if (schedule.start && schedule.end) {
        return [
          {
            title: schedule.isAvailable
              ? "Disponible"
              : schedule.reason || "Reservado",
            start: schedule.start,
            end: schedule.end,
            resource: schedule,
          },
        ];
      }

      // CASO 2: Horario recurrente (se generan eventos para varias semanas)
      if (schedule.startTime && schedule.endTime && schedule.days) {
        const events = [];
        const [startHour, startMinute] = schedule.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

        // Generar eventos para un rango de semanas (ej. 4 semanas atrás y 8 adelante)
        for (let i = -4; i < 8; i++) {
          schedule.days.forEach((day) => {
            const dayIndex = momentDaysOfWeek.indexOf(day);
            if (dayIndex === -1) return;

            const dayDate = moment()
              .add(i, "weeks")
              .isoWeekday(dayIndex + 1);

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

            events.push({
              title: schedule.isAvailable
                ? "Disponible"
                : schedule.reason || "No Disponible",
              start: startDate,
              end: endDate,
              resource: { ...schedule, day }, // Guardamos el día específico para posible edición
            });
          });
        }
        return events;
      }

      console.warn("Horario ignorado por formato desconocido:", schedule);
      return [];
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
    if (moment(start).isBefore(moment().startOf('day'))) {
      toast.error("No puedes crear horarios en fechas pasadas.");
      return; 
    }
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
      try {
        // --- Lógica para Actualizar ---
        if (dataFromModal.id) {
          onUpdateSchedule(dataFromModal);
          toast.success("Horario actualizado correctamente");
          handleCloseModal();
          return;
        }

        // --- Lógica para CREAR ---
        if (dataFromModal.days && dataFromModal.days.length > 0) {
          // CASO 1: Creando horarios recurrentes
          const [startHour, startMinute] = dataFromModal.startTime
            .split(":")
            .map(Number);
          const [endHour, endMinute] = dataFromModal.endTime
            .split(":")
            .map(Number);
          const referenceDate = moment(modalState.start);

          dataFromModal.days.forEach((day) => {
            const dayIndex = momentDaysOfWeek.indexOf(day);
            if (dayIndex === -1) return;

            const targetDate = referenceDate.clone().isoWeekday(dayIndex + 1);
            const newStart = targetDate
              .clone()
              .hour(startHour)
              .minute(startMinute)
              .second(0)
              .toDate();
            const newEnd = targetDate
              .clone()
              .hour(endHour)
              .minute(endMinute)
              .second(0)
              .toDate();

            const newSchedule = {
              start: newStart,
              end: newEnd,
              reason: dataFromModal.reason || "",
              isAvailable: dataFromModal.isAvailable,
            };
            onAddSchedule(newSchedule);
          });
          toast.success(`Horarios recurrentes creados para ${dataFromModal.days.length} días`);
        } else {
          // CASO 2: Creando un evento único
          const singleEvent = {
            start: modalState.start,
            end: modalState.end,
            reason: dataFromModal.reason || "",
            isAvailable: dataFromModal.isAvailable,
          };
          onAddSchedule(singleEvent);
          toast.success("Horario creado correctamente");
        }

        handleCloseModal();
      } catch (error) {
        toast.error("Error al guardar el horario");
        console.error("Error saving schedule:", error);
      }
    },
    [modalState, onUpdateSchedule, onAddSchedule, handleCloseModal]
  );

  const handleDeleteSchedule = useCallback(
    (scheduleId) => {
      try {
        onDeleteSchedule(scheduleId);
        toast.success("Horario eliminado correctamente");
        handleCloseModal();
      } catch (error) {
        toast.error("Error al eliminar el horario");
        console.error("Error deleting schedule:", error);
      }
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