// src/assets/pages/Administracion/Administracion.jsx

import React from "react";
import Navbar from "../../components/Navbar/navbar";
import AdminTools from "../../components/admin_tools/admin_tools.jsx";
import "./Administracion.css";

const Administracion = () => {
  return (
    <>
      <Navbar />
      <div className="administracion-main-container">
        <AdminTools />
      </div>
    </>
  );
};

export default Administracion;
