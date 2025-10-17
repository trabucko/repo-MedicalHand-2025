// src/assets/components/Toolbar/Doctor/Update/UpdateDoctorTool.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";
import "./UpdateDoctorTool.css"; // Crearemos este archivo para los estilos

// Reutilizamos la función de formateo de cédula
const formatCedula = (value) => {
  const cleaned = value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
  const truncated = cleaned.substring(0, 14);
  const parts = [];
  if (truncated.length > 0) parts.push(truncated.substring(0, 3));
  if (truncated.length > 3) parts.push(truncated.substring(3, 9));
  if (truncated.length > 9) parts.push(truncated.substring(9, 14));
  return parts.join("-");
};

function UpdateDoctorTool() {
  // --- ESTADOS ---
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cedula: "",
    especialidad: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const especialidades = [
    "Medicina General", "Cardiología", "Dermatología", "Pediatría",
    "Ginecología", "Ortopedia", "Neurología", "Oftalmología",
    "Psiquiatría", "Odontología",
  ];

  // --- EFECTOS ---

  // 1. Cargar la lista de doctores al montar el componente
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      setError(null);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("No estás autenticado.");
        
        const token = await user.getIdToken();
        const res = await axios.get("http://localhost:4000/api/doctors/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctors(res.data);
      } catch (err) {
        setError("Error al cargar la lista de doctores. " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // 2. Cuando se selecciona un doctor, rellenar el formulario
  useEffect(() => {
    if (selectedDoctorId) {
      const selectedDoctor = doctors.find((doc) => doc.id === selectedDoctorId);
      if (selectedDoctor) {
        setFormData({
          firstName: selectedDoctor.firstName || "",
          lastName: selectedDoctor.lastName || "",
          email: selectedDoctor.email || "",
          phone: selectedDoctor.telefonoDeContacto || "",
          cedula: selectedDoctor.cedula || "",
          especialidad: selectedDoctor.especialidad || "",
          isActive: selectedDoctor.isActive !== undefined ? selectedDoctor.isActive : true,
        });
        setError(null); // Limpiar errores anteriores
        setSuccessMessage(""); // Limpiar mensajes de éxito
      }
    } else {
      // Si no hay doctor seleccionado, limpiar el formulario
      setFormData({
        firstName: "", lastName: "", email: "", phone: "",
        cedula: "", especialidad: "", isActive: true,
      });
    }
  }, [selectedDoctorId, doctors]);


  // --- MANEJADORES ---

  const handleDoctorSelect = (e) => {
    setSelectedDoctorId(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    
    if (name === "cedula") {
      setFormData((prev) => ({ ...prev, [name]: formatCedula(val) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError("Por favor, selecciona un doctor para actualizar.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("No estás autenticado.");
      
      const token = await user.getIdToken();
      const updateData = {
          ...formData,
          telefonoDeContacto: formData.phone // Mapear de nuevo al nombre del campo del backend
      };
      delete updateData.phone; // Eliminar el campo 'phone' que no existe en el backend

      await axios.put(
        `http://localhost:4000/api/doctors/update/${selectedDoctorId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccessMessage("¡Doctor actualizado con éxito!");
      
      // Opcional: Refrescar la lista de doctores para reflejar los cambios
      setDoctors(prevDoctors => prevDoctors.map(doc => 
        doc.id === selectedDoctorId ? { ...doc, ...updateData, telefonoDeContacto: updateData.telefonoDeContacto } : doc
      ));

    } catch (err) {
      setError("Error al actualizar el doctor. " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };


  // --- RENDERIZADO ---
  return (
    <div className="update-doctor-container">
      <div className="doctor-header">
        <h2>Actualizar Información del Doctor</h2>
        <p>Selecciona un doctor de la lista para editar sus datos.</p>
      </div>

      <div className="doctor-selection-section">
        <label htmlFor="doctor-select">Seleccionar Doctor *</label>
        <select id="doctor-select" value={selectedDoctorId} onChange={handleDoctorSelect} disabled={loading}>
          <option value="">-- Elige un doctor --</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.fullName} ({doc.email})
            </option>
          ))}
        </select>
      </div>
      
      {loading && !doctors.length && <p>Cargando doctores...</p>}

      {selectedDoctorId && (
        <form onSubmit={handleSubmit} className="doctor-form" noValidate>
            {/* ... Se copian los mismos campos del formulario de creación ... */}
            {/* Información Personal */}
            <div className="form-section">
              <h3>Información Personal</h3>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="firstName">Nombre *</label>
                  <input id="firstName" name="firstName" type="text" value={formData.firstName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label htmlFor="lastName">Apellido *</label>
                  <input id="lastName" name="lastName" type="text" value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Credenciales (Email es editable, pero la contraseña no se debe manejar aquí) */}
            <div className="form-section">
              <h3>Credenciales de Acceso</h3>
              <div className="form-row">
                 <div className="input-group">
                  <label htmlFor="email">Correo electrónico *</label>
                  <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
              </div>
               <p className="form-note">La contraseña no puede ser modificada desde este formulario.</p>
            </div>

            {/* Información Profesional */}
            <div className="form-section">
              <h3>Información Profesional</h3>
              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="cedula">Cédula *</label>
                  <input id="cedula" name="cedula" type="text" value={formData.cedula} onChange={handleChange} required maxLength="18" />
                </div>
                <div className="input-group">
                  <label htmlFor="especialidad">Especialidad *</label>
                  <select id="especialidad" name="especialidad" value={formData.especialidad} onChange={handleChange} required>
                    <option value="">Seleccione una especialidad</option>
                    {especialidades.map((esp) => (<option key={esp} value={esp}>{esp}</option>))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                    <label htmlFor="phone">Teléfono de Contacto</label>
                    <input id="phone" name="phone" type="text" value={formData.phone} onChange={handleChange}/>
                </div>
              </div>
            </div>

            {/* Estado del Doctor */}
             <div className="form-section">
                <h3>Estado del Doctor</h3>
                <div className="toggle-group">
                  <label className="toggle-label">
                    <span>Estado del doctor:</span>
                    <div className="toggle-switch">
                      <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} hidden/>
                      <label htmlFor="isActive" className="toggle-slider">
                        <span className="toggle-text">{formData.isActive ? "Activo" : "Inactivo"}</span>
                      </label>
                    </div>
                  </label>
                </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Actualizando..." : "Actualizar Doctor"}
              </button>
            </div>
            
            {error && <div className="message error-message">{error}</div>}
            {successMessage && <div className="message success-message">{successMessage}</div>}
        </form>
      )}
    </div>
  );
}

export default UpdateDoctorTool;