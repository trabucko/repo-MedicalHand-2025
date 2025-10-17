// src/assets/components/Toolbar/Doctor/View/ViewDoctorsTool.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import "./VistaDoctorTool.css"; // Crearemos este archivo para los estilos

const ViewDoctorsTool = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = await getAuth().currentUser.getIdToken();
        const res = await axios.get("http://localhost:4000/api/doctors/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data);
      } catch (err) {
        setError("No se pudo cargar la lista de doctores.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) return <p>Cargando doctores...</p>;
  if (error) return <div className="message error-message">{error}</div>;

  return (
    <div className="view-doctors-container">
      {doctors.length === 0 ? (
        <p>No hay doctores registrados en el sistema.</p>
      ) : (
        <table className="doctors-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Correo Electrónico</th>
              <th>Especialidad</th>
              <th>Cédula</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.fullName}</td>
                <td>{doctor.email}</td>
                <td>{doctor.especialidad}</td>
                <td>{doctor.cedula}</td>
                <td>
                  <span className={`status ${doctor.isActive ? "active" : "inactive"}`}>
                    {doctor.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewDoctorsTool;