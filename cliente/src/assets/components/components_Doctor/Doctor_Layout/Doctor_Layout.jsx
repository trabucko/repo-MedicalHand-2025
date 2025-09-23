import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom"; // <-- AÑADIDO useNavigate
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  writeBatch,
  serverTimestamp,
  getDoc, // <-- AÑADIDO getDoc
} from "firebase/firestore";
import { db } from "../../../../firebase";
import { useAuth } from "../../../context/AuthContext";

import Sidebar from "../../Sidebar/Sidebar";
import Header from "../../components_Doctor/HorarioMedico/headerDoctor/header";

const DoctorLayout = () => {
  const { user, logout } = useAuth(); // <-- AÑADIDO logout
  const navigate = useNavigate(); // <-- AÑADIDO navigate

  // --- Estados de tu código original (todos se conservan) ---
  const [selectedConsultorio, setSelectedConsultorio] = useState(null);
  const [availableConsultorios, setAvailableConsultorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Inicia abierto
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // --- Estado nuevo para el perfil del doctor ---
  const [doctorProfile, setDoctorProfile] = useState(null); // <-- AÑADIDO

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // --- AÑADIDO: Lógica para obtener el perfil del doctor ---
    const fetchDoctorProfile = async () => {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDoctorProfile(docSnap.data());
      } else {
        console.error("No se encontró el perfil del doctor.");
      }
    };
    fetchDoctorProfile();

    // --- Lógica original para los consultorios (se conserva intacta) ---
    if (user.claims?.hospitalId) {
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
    } else {
      setLoading(false);
    }
  }, [user]);

  // --- AÑADIDO: Función de Logout ---
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // --- Lógica original para liberar consultorio (se conserva intacta) ---
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
      {/* Sidebar ahora recibe todas las props necesarias */}
      <Sidebar
        isOpen={isSidebarOpen}
        fullName={doctorProfile?.fullName} // <-- AÑADIDO
        hospitalName={doctorProfile?.hospitalName} // <-- AÑADIDO
        role={doctorProfile?.role} // <-- AÑADIDO
        handleLogout={handleLogout} // <-- AÑADIDO
      />

      <div className="doctor-main-view">
        {/* Tu Header se queda como estaba */}
        <Header
          user={user}
          consultorio={selectedConsultorio}
          toggleSidebar={toggleSidebar}
          db={db}
          hospitalId={user?.claims?.hospitalId}
          onConsultorioChange={setSelectedConsultorio}
        />
        <main className="doctor-page-content">
          {/* Tu Outlet se queda como estaba, con todo el contexto */}
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
