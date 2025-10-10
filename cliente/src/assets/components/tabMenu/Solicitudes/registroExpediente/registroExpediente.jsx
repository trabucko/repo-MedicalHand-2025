// src/assets/components/tabMenu/Solicitudes/registroExpediente/RegistroExpediente.jsx

import React, { useState } from "react";
import "./registroExpediente.css";
import {
  FaUser,
  FaPhone,
  FaBirthdayCake,
  FaIdCard,
  FaFileMedical,
  FaLink,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTint,
  FaAllergies,
  FaHeartbeat,
  FaTimes,
  FaFileMedicalAlt,
  FaUserFriends,
  FaExclamationTriangle,
} from "react-icons/fa";

// 1. RECIBIMOS LAS NUEVAS PROPS
const RegistroExpediente = ({
  solicitud,
  onClose,
  onCrearExpediente,
  isSubmitting,
}) => {
  const { pacienteCompleto } = solicitud;
  const [selectedImage, setSelectedImage] = useState(null);

  // Extraemos datos del paciente
  const { personalInfo, contactInfo, medicalInfo, email, verification } =
    pacienteCompleto;

  const nombreCompleto = personalInfo
    ? `${personalInfo.firstName} ${personalInfo.lastName}`
    : "Nombre no disponible";

  // Función para formatear fechas de Firestore
  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "No especificada";
    return timestamp.toDate().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Función para calcular edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento || !fechaNacimiento.toDate) return "N/A";
    const nacimiento = fechaNacimiento.toDate();
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return `${edad} años`;
  };

  // Modal para ver imagen en grande
  const ImageModal = ({ imageUrl, onClose }) => (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        <img src={imageUrl} alt="Documento" className="modal-image" />
      </div>
    </div>
  );

  // 2. FUNCIÓN HANDLER QUE LLAMA A LA PROP
  const handleSubmit = () => {
    if (onCrearExpediente) {
      onCrearExpediente(solicitud);
    }
  };

  return (
    <div className="registro-container">
      {/* Modal para imágenes */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Encabezado Mejorado */}
      <div className="registro-header">
        <div className="header-content">
          <div className="header-main">
            <div className="header-icon">
              <FaFileMedicalAlt />
            </div>
            <div className="header-text">
              <h1>Creación de Expediente Médico</h1>
              <p className="header-subtitle">Registro de paciente</p>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            <FaTimes /> Cancelar
          </button>
          {/* 3. BOTÓN ACTUALIZADO */}
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={isSubmitting}
          >
            <FaFileMedicalAlt />
            {isSubmitting ? "Creando..." : "Crear Expediente"}
          </button>
        </div>
      </div>

      {/* Contenido con la información - ESTRUCTURA SIMPLIFICADA */}
      <div className="registro-content">
        {/* CAJA 1 - Información Personal */}
        <div className="info-card">
          <div className="card-header">
            <FaUser className="card-icon" />
            <h3>Información Personal</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <label>Nombre Completo</label>
              <span>{nombreCompleto}</span>
            </div>
            <div className="info-item">
              <label>Cédula</label>
              <span>{personalInfo?.idNumber || "No disponible"}</span>
            </div>
            <div className="info-item">
              <label>Sexo</label>
              <span>{personalInfo?.sex || "No especificado"}</span>
            </div>
            <div className="info-item">
              <label>Fecha de Nacimiento</label>
              <span>{formatDate(personalInfo?.dateOfBirth)}</span>
            </div>
            <div className="info-item">
              <label>Edad</label>
              <span>{calcularEdad(personalInfo?.dateOfBirth)}</span>
            </div>
          </div>
        </div>

        {/* CAJA 2 - Información Médica */}
        <div className="info-card">
          <div className="card-header">
            <FaHeartbeat className="card-icon" />
            <h3>Información Médica</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <label>
                <FaTint /> Tipo de Sangre
              </label>
              <span
                className={`blood-type ${medicalInfo?.bloodType
                  ?.replace("+", "pos")
                  .replace("-", "neg")}`}
              >
                {medicalInfo?.bloodType || "No especificado"}
              </span>
            </div>
            <div className="info-item full-width">
              <label>
                <FaAllergies /> Alergias Conocidas
              </label>
              <span className="medical-text">
                {medicalInfo?.knownAllergies || "Ninguna registrada"}
              </span>
            </div>
            <div className="info-item full-width">
              <label>
                <FaFileMedical /> Enfermedades Crónicas
              </label>
              <div className="diseases-list">
                {medicalInfo?.chronicDiseases?.length > 0 ? (
                  medicalInfo.chronicDiseases.map((disease, index) => (
                    <span key={index} className="disease-tag">
                      {disease}
                    </span>
                  ))
                ) : (
                  <span className="medical-text">Ninguna registrada</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CAJA 3 - Información de Contacto */}
        <div className="info-card">
          <div className="card-header">
            <FaPhone className="card-icon" />
            <h3>Información de Contacto</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <label>
                <FaEnvelope /> Email
              </label>
              <span>{email || "No disponible"}</span>
            </div>
            <div className="info-item">
              <label>
                <FaPhone /> Teléfono
              </label>
              <span>{contactInfo?.phoneNumber || "No disponible"}</span>
            </div>
            <div className="info-item">
              <label>
                <FaMapMarkerAlt /> Dirección
              </label>
              <span>{contactInfo?.address || "No disponible"}</span>
            </div>
          </div>
        </div>

        {/* CAJA 4 - Contacto de Emergencia */}
        <div className="info-card">
          <div className="card-header">
            <FaUserFriends className="card-icon" />
            <h3>Contacto de Emergencia</h3>
          </div>
          <div className="card-content">
            {contactInfo?.emergencyContact ? (
              <>
                <div className="info-item">
                  <label>Nombre del Contacto</label>
                  <span>
                    {contactInfo.emergencyContact.name || "No especificado"}
                  </span>
                </div>
                <div className="info-item">
                  <label>
                    <FaPhone /> Teléfono
                  </label>
                  <span>
                    {contactInfo.emergencyContact.phoneNumber ||
                      "No disponible"}
                  </span>
                </div>
              </>
            ) : (
              <div className="emergency-contact-empty">
                <FaExclamationTriangle className="empty-icon" />
                <p>No se ha registrado contacto de emergencia</p>
                <span className="empty-subtitle">
                  Se recomienda solicitar esta información al paciente
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CAJA 5 - Documentos de Identificación */}
        <div className="info-card full-width-card">
          <div className="card-header">
            <FaIdCard className="card-icon" />
            <h3>Documentos de Identificación</h3>
          </div>
          <div className="card-content">
            <div className="documents-grid">
              <div className="document-item">
                <label>ID (Frente)</label>
                <div
                  className="document-preview"
                  onClick={() => setSelectedImage(verification?.idFrontUrl)}
                >
                  <img
                    src={verification?.idFrontUrl}
                    alt="Frente de identificación"
                    className="document-image"
                  />
                  <div className="document-overlay">
                    <FaLink /> Ver en grande
                  </div>
                </div>
              </div>

              <div className="document-item">
                <label>ID (Dorso)</label>
                <div
                  className="document-preview"
                  onClick={() => setSelectedImage(verification?.idBackUrl)}
                >
                  <img
                    src={verification?.idBackUrl}
                    alt="Dorso de identificación"
                    className="document-image"
                  />
                  <div className="document-overlay">
                    <FaLink /> Ver en grande
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroExpediente;
