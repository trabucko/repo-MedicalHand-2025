import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../firebase"; // Ajusta la ruta a tu config de firebase
import { useAuth } from "../../../context/AuthContext";

// --- CORRECCIONES ---
// 1. Importa el componente Sidebar (la ruta puede necesitar ajuste)
import Sidebar from "../../Sidebar/Sidebar";
// 2. Importa el Header (ajustando la ruta a una más estándar)
import Header from "../../components_Doctor/HorarioMedico/headerDoctor/header";
// 3. Importa los estilos del layout

const DoctorLayout = () => {
  const { user } = useAuth();
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);
  const [availableConsultorios, setAvailableConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);

  // La declaración de estos estados es correcta
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (!user || !user.claims?.hospitalId) {
      setLoading(false);
      return;
    }
    const consultoriosRef = collection(
      db,
      "hospitals",
      user.claims.hospitalId,
      "dr_office"
    );
    const q = query(
      consultoriosRef,
      where("assignedDoctorId", "in", [null, user.uid])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const consultoriosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        hospitalId: user.claims.hospitalId,
      }));
      setAvailableConsultorios(consultoriosData);
      const alreadyAssigned = consultoriosData.find(
        (c) => c.assignedDoctorId === user.uid
      );
      setSelectedConsultorio(alreadyAssigned || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleReleaseConsultorio = async () => {
    if (!selectedConsultorio) return;

    const consultorioToRelease = selectedConsultorio;
    setSelectedConsultorio(null);

    const batch = writeBatch(db);
    const consultorioRef = doc(
      db,
      "hospitals",
      user.claims.hospitalId,
      "dr_office",
      consultorioToRelease.id
    );

    try {
      batch.update(consultorioRef, {
        status: "disponible",
        assignedDoctorId: null,
        assignedDoctorName: null,
        lastAssignment: serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      console.error("Error al liberar el consultorio:", error);
      setSelectedConsultorio(consultorioToRelease);
    }
  };

  if (loading) {
    return <div>Cargando panel médico...</div>;
  }

  return (
    <div
      className={`doctor-layout-container ${
        isSidebarOpen ? "sidebar-open" : ""
      }`}
    >
      {/* Ahora Sidebar está definido y puede ser renderizado */}
      <Sidebar isOpen={isSidebarOpen} />

      <div className="doctor-main-view">
        <Header
          user={user}
          consultorio={selectedConsultorio}
          toggleSidebar={toggleSidebar}
          // --- DATOS QUE FALTABAN ---
          db={db} // <-- AÑADIR: Pasa la instancia de la base de datos.
          hospitalId={user?.claims?.hospitalId} // <-- AÑADIR: Es buena práctica pasarlo también.
          onConsultorioChange={setSelectedConsultorio} // <-- CORREGIR: Cambia el nombre de la prop y pasa la función para actualizar el estado.
        />
        <main className="doctor-page-content">
          <Outlet
            context={{
              selectedConsultorio,
              setSelectedConsultorio,
              availableConsultorios,
              handleReleaseConsultorio,
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
