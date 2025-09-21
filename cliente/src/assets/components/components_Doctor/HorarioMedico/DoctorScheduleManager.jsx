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
      setSchedules([]); // Limpia los horarios si no hay consultorio
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
        // 🚨 IMPORTANTE: Convierte Timestamps de Firebase a objetos Date de JavaScript
        // React Big Calendar necesita objetos Date para funcionar.
        // Asegúrate de que tus campos de fecha se llamen 'start' y 'end' o ajústalo.
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
      // Verifica que tengas la información necesaria
      if (!user || !hospitalId || !consultorio?.id) {
        console.error("Faltan datos para añadir el horario.");
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
        // 🔥 LÓGICA AÑADIDA
        await addDoc(schedulesRef, {
          ...scheduleData,
          createdAt: serverTimestamp(), // Opcional: para saber cuándo se creó
          doctorId: user.uid, // Opcional: para saber qué doctor lo creó
        });
        console.log("Horario añadido con éxito");
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
        // 🔥 LÓGICA AÑADIDA
        // No incluyas el ID en los datos que actualizas
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
        // 🔥 LÓGICA AÑADIDA
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

  // Asegúrate de pasar un `consultorio` seleccionado para renderizar el calendario
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
