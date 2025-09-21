import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import "./ScheduleModal.css";

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
const dayInitials = ["L", "M", "X", "J", "V", "S", "D"];
const initialScheduleState = {
  days: [],
  startTime: "",
  endTime: "",
  isAvailable: true,
  reason: "",
};

const ScheduleModalComponent = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  modalState,
}) => {
  const [schedule, setSchedule] = useState(initialScheduleState);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Memoizar la validación
  const validateSchedule = useCallback((schedule) => {
    if (!schedule.days || schedule.days.length === 0) {
      return "Debes seleccionar al menos un día de la semana.";
    }
    if (
      schedule.startTime &&
      schedule.endTime &&
      schedule.startTime >= schedule.endTime
    ) {
      return "La hora de fin debe ser posterior a la hora de inicio.";
    }
    return "";
  }, []);

  useEffect(() => {
    if (!modalState) return;

    if (modalState.type === "new") {
      const startDayIndex = moment(modalState.start).day() - 1;
      const startDay = daysOfWeek[startDayIndex < 0 ? 6 : startDayIndex];
      const newSchedule = {
        ...initialScheduleState,
        days: [startDay],
        startTime: moment(modalState.start).format("HH:mm"),
        endTime: moment(modalState.end).format("HH:mm"),
      };
      setSchedule(newSchedule);
      setError(validateSchedule(newSchedule));
    } else if (modalState.type === "edit") {
      setSchedule(modalState.schedule);
      setError(validateSchedule(modalState.schedule));
    }
  }, [modalState, validateSchedule]);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;

      setSchedule((prev) => {
        const newSchedule = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };

        if (name === "isAvailable") {
          newSchedule.isAvailable = !checked;
          newSchedule.reason = checked ? prev.reason : "";
        }

        setError(validateSchedule(newSchedule));
        return newSchedule;
      });
    },
    [validateSchedule]
  );

  const handleDayToggle = useCallback(
    (day) => {
      setSchedule((prev) => {
        const newDays = prev.days.includes(day)
          ? prev.days.filter((d) => d !== day)
          : [...prev.days, day];

        const newSchedule = { ...prev, days: newDays };
        setError(validateSchedule(newSchedule));
        return newSchedule;
      });
    },
    [validateSchedule]
  );

  const handleSave = useCallback(async () => {
    if (error || isSaving) return;
    setIsSaving(true);
    try {
      await onSave(schedule);
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setIsSaving(false);
    }
  }, [error, isSaving, onSave, schedule]);

  const handleDelete = useCallback(() => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este horario?")) {
      onDelete(schedule.id);
    }
  }, [onDelete, schedule.id]);

  const handleOverlayClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="google-modal-overlay" onClick={handleOverlayClick}>
      <div className="google-modal-content">
        <div className="google-modal-header">
          <h3 className="google-modal-title">
            {modalState.type === "new"
              ? "Crear horario recurrente"
              : "Editar horario"}
          </h3>
          <button className="google-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="google-modal-body">
          <div className="google-time-inputs">
            <div className="google-time-group">
              <label className="google-time-label">Inicio</label>
              <input
                type="time"
                className="google-time-input"
                name="startTime"
                value={schedule.startTime || ""}
                onChange={handleChange}
                disabled={isSaving}
              />
            </div>

            <div className="google-time-separator">—</div>

            <div className="google-time-group">
              <label className="google-time-label">Fin</label>
              <input
                type="time"
                className="google-time-input"
                name="endTime"
                value={schedule.endTime || ""}
                onChange={handleChange}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="google-days-section">
            <label className="google-section-label">Repetir los días:</label>
            <div className="google-days-grid">
              {daysOfWeek.map((day, index) => (
                <button
                  key={day}
                  className={`google-day-btn ${
                    schedule.days?.includes(day) ? "google-day-active" : ""
                  }`}
                  onClick={() => handleDayToggle(day)}
                  disabled={isSaving}
                  type="button"
                >
                  <span className="google-day-initial">
                    {dayInitials[index]}
                  </span>
                  <span className="google-day-full">{day}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="google-availability-section">
            <label className="google-switch-label">
              <input
                type="checkbox"
                className="google-switch-input"
                name="isAvailable"
                checked={!schedule.isAvailable}
                onChange={handleChange}
                disabled={isSaving}
              />
              <span className="google-switch-slider"></span>
              <span className="google-switch-text">
                Marcar como no disponible
              </span>
            </label>
          </div>

          {!schedule.isAvailable && (
            <div className="google-reason-section">
              <label className="google-section-label">Razón (opcional)</label>
              <input
                type="text"
                className="google-reason-input"
                name="reason"
                value={schedule.reason || ""}
                onChange={handleChange}
                placeholder="Ej: Almuerzo, Reunión, Capacitación..."
                disabled={isSaving}
              />
            </div>
          )}

          {error && <div className="google-error-message">⚠️ {error}</div>}
        </div>

        <div className="google-modal-footer">
          {modalState.type === "edit" && (
            <button
              className="google-btn google-btn-delete"
              onClick={handleDelete}
              disabled={isSaving}
              type="button"
            >
              Eliminar
            </button>
          )}
          <div className="google-footer-actions">
            <button
              className="google-btn google-btn-secondary"
              onClick={onClose}
              disabled={isSaving}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="google-btn google-btn-primary"
              onClick={handleSave}
              disabled={!!error || isSaving}
              type="button"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ScheduleModal = React.memo(ScheduleModalComponent);
