// src/assets/components/Toolbar/Doctor/Delete/DeleteDoctorTool.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import "./DeleteDoctorTool.css";

function DeleteDoctorTool() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDoctorName, setSelectedDoctorName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar la lista de doctores al iniciar
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const token = await getAuth().currentUser.getIdToken();
        const res = await axios.get("http://localhost:4000/api/doctors/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data);
      } catch (err) {
        setError("Error al cargar la lista de doctores.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleDoctorSelect = (e) => {
    const doctorId = e.target.value;
    setSelectedDoctorId(doctorId);
    if (doctorId) {
      const doctor = doctors.find((doc) => doc.id === doctorId);
      setSelectedDoctorName(doctor.fullName);
    } else {
      setSelectedDoctorName("");
    }
    setError(null);
    setSuccessMessage("");
  };

  const handleDeleteAuth = async () => {
    if (!selectedDoctorId) {
      setError("Por favor, selecciona un doctor.");
      return;
    }

    // Mensaje de confirmación actualizado para ser más preciso
    const isConfirmed = window.confirm(
      `¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el acceso para "${selectedDoctorName}"?\n\nEsta acción no se puede deshacer y el doctor no podrá volver a iniciar sesión.`
    );

    if (!isConfirmed) return;

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const token = await getAuth().currentUser.getIdToken();
      await axios.delete(
        `http://localhost:4000/api/doctors/auth/${selectedDoctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage(`¡El acceso para "${selectedDoctorName}" ha sido eliminado permanentemente!`);
      setDoctors(doctors.filter((doc) => doc.id !== selectedDoctorId));
      setSelectedDoctorId("");
      setSelectedDoctorName("");
    } catch (err) {
      setError("Error al eliminar la autenticación. " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-doctor-container">
      <div className="doctor-header">
        <h2>Eliminar Autenticación de Doctor</h2>
        {/* Texto actualizado para mayor claridad */}
        <p>
          Esta acción elimina al doctor del sistema de autenticación de forma
          permanente. Sus datos y registros en la base de datos no serán modificados.
        </p>
      </div>

      <div className="selection-area">
        <label htmlFor="doctor-select">Seleccionar Doctor</label>
        <select id="doctor-select" value={selectedDoctorId} onChange={handleDoctorSelect} disabled={loading}>
          <option value="">-- Elige un doctor --</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.fullName} ({doc.email})
            </option>
          ))}
        </select>
      </div>

      {selectedDoctorId && (
        <div className="action-area">
          <p>
            Se eliminará el acceso para: <strong>{selectedDoctorName}</strong>
          </p>
          <button onClick={handleDeleteAuth} className="delete-button" disabled={loading}>
            {loading ? "Eliminando..." : "Confirmar y Eliminar Autenticación"}
          </button>
        </div>
      )}
      
      {error && <div className="message error-message">{error}</div>}
      {successMessage && <div className="message success-message">{successMessage}</div>}
    </div>
  );
}

export default DeleteDoctorTool;