// src/assets/components/Layout/ProtectedLayout.jsx

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../components_Doctor/HorarioMedico/headerDoctor/header"; // ✅ Importamos el nuevo Header
import { useAuth } from "../../context/AuthContext";

const ProtectedLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, handleLogout } = useAuth();

  if (!user) return null;

  const sidebarProps = {
    isOpen: isSidebarOpen,
    fullName: user.claims?.name || "Usuario",
    hospitalName: user.claims?.hospitalName || "Hospital",
    role: user.claims?.role || "Rol",
    handleLogout,
  };

  return (
    <div className="app-layout">
      <Sidebar {...sidebarProps} />

      <div
        className={`main-content-area ${isSidebarOpen ? "sidebar-open" : ""}`}
      >
        {/* ✅ Usamos el Header y le pasamos las props que necesita */}
        <Header
          user={user}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;
