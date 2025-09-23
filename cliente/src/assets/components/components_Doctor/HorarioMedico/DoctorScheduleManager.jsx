import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../firebase";
import HorarioMedico from "./HorarioMedico";
import { useAuth } from "../../../context/AuthContext";

const DoctorScheduleManager = ({ hospitalId, consultorio }) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !hospitalId || !consultorio?.id) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    const schedulesRef = collection(
      db,
      "hospitals",
      hospitalId,
      "dr_office",
      consultorio.id,
      "schedules"
    );

    const unsubscribe = onSnapshot(schedulesRef, (snapshot) => {
      const schedulesData = snapshot.docs.map((doc) => {
        const data = doc.data();
        // Convierte Timestamps de Firebase a objetos Date para React Big Calendar
        return {
          id: doc.id,
          ...data,
          start: data.start ? data.start.toDate() : null,
          end: data.end ? data.end.toDate() : null,
        };
      });
      setSchedules(schedulesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, hospitalId, consultorio]);

  const handleAddSchedule = useCallback(
    async (scheduleData) => {
      if (!user || !hospitalId || !consultorio?.id) {
        console.error("Faltan datos para añadir el horario.");
        return;
      }

      if (
        !(scheduleData.start instanceof Date) ||
        !(scheduleData.end instanceof Date)
      ) {
        console.error(
          "Error de Datos: El evento no tiene fechas de inicio o fin válidas.",
          scheduleData
        );
        return;
      }

      const schedulesRef = collection(
        db,
        "hospitals",
        hospitalId,
        "dr_office",
        consultorio.id,
        "schedules"
      );

      try {
        // --- INICIO DE LA MODIFICACIÓN ---
        // 1. Obtenemos el nombre del día de la semana a partir de la fecha de inicio.
        const isAvailable = scheduleData.isAvailable !== false;

        const dayNames = [
          "Domingo",
          "Lunes",
          "Martes",
          "Miércoles",
          "Jueves",
          "Viernes",
          "Sábado",
        ];
        const dayOfWeek = dayNames[scheduleData.start.getDay()];

        // 2. Creamos el objeto que se guardará en Firestore.
        //    Ahora `start` y `end` son las fechas completas que nos da el calendario.
        const dataToSave = {
          title:
            scheduleData.title ||
            (isAvailable ? "Horario Disponible" : "No Disponible"),
          start: scheduleData.start,
          end: scheduleData.end,
          isAvailable: isAvailable,
          reason: scheduleData.reason || "", // Aseguramos que el campo reason exista
          createdAt: serverTimestamp(),
          doctorId: user.uid,
        };
        // --- FIN DE LA MODIFICACIÓN ---

        await addDoc(schedulesRef, dataToSave);
        console.log("Horario añadido con éxito", dataToSave);
      } catch (error) {
        console.error("Error al añadir el horario: ", error);
      }
    },
    [user, hospitalId, consultorio]
  );

  const handleUpdateSchedule = useCallback(
    async (scheduleData) => {
      if (!user || !hospitalId || !consultorio?.id || !scheduleData.id) {
        console.error("Faltan datos para actualizar el horario.");
        return;
      }
      const scheduleDocRef = doc(
        db,
        "hospitals",
        hospitalId,
        "dr_office",
        consultorio.id,
        "schedules",
        scheduleData.id
      );
      try {
        const { id, ...dataToUpdate } = scheduleData;
        await updateDoc(scheduleDocRef, dataToUpdate);
        console.log("Horario actualizado con éxito");
      } catch (error) {
        console.error("Error al actualizar el horario: ", error);
      }
    },
    [user, hospitalId, consultorio]
  );

  const handleDeleteSchedule = useCallback(
    async (scheduleId) => {
      if (!user || !hospitalId || !consultorio?.id || !scheduleId) {
        console.error("Faltan datos para borrar el horario.");
        return;
      }
      const scheduleDocRef = doc(
        db,
        "hospitals",
        hospitalId,
        "dr_office",
        consultorio.id,
        "schedules",
        scheduleId
      );
      try {
        await deleteDoc(scheduleDocRef);
        console.log("Horario eliminado con éxito");
      } catch (error) {
        console.error("Error al eliminar el horario: ", error);
      }
    },
    [user, hospitalId, consultorio]
  );

  if (loading) {
    return <div>Cargando horarios...</div>;
  }

  if (!consultorio) {
    return (
      <div>Por favor, selecciona un consultorio para ver los horarios.</div>
    );
  }

  return (
    <HorarioMedico
      schedules={schedules}
      onAddSchedule={handleAddSchedule}
      onUpdateSchedule={handleUpdateSchedule}
      onDeleteSchedule={handleDeleteSchedule}
    />
  );
};

export default DoctorScheduleManager;
