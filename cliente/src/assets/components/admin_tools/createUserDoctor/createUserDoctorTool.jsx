import { useState } from "react";
import { getAuth } from "firebase/auth";
import axios from "axios";
import "./CreateUserDoctorTool.css";

// --- FUNCIÓN DE AYUDA PARA FORMATEAR LA CÉDULA ---
const formatCedula = (value) => {
  // Limpia cualquier caracter que no sea número o letra y convierte a mayúsculas
  const cleaned = value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();

  // Limita la longitud a 14 caracteres (3+6+4+1)
  const truncated = cleaned.substring(0, 14);
  const parts = [];

  // Primera parte: 3 caracteres
  if (truncated.length > 0) {
    parts.push(truncated.substring(0, 3));
  }
  // Segunda parte: 6 caracteres
  if (truncated.length > 3) {
    parts.push(truncated.substring(3, 9));
  }
  // Tercera parte: 5 caracteres
  if (truncated.length > 9) {
    parts.push(truncated.substring(9, 14));
  }

  // Une las partes con un guion
  return parts.join("-");
};

// --- COMPONENTE PRINCIPAL ---
function CreateUserDoctorTool() {
  // --- ESTADOS ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    cedula: "",
    especialidad: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- DATOS ---
  const especialidades = [
    "Medicina General",
    "Cardiología",
    "Dermatología",
    "Pediatría",
    "Ginecología",
    "Ortopedia",
    "Neurología",
    "Oftalmología",
    "Psiquiatría",
    "Odontología",
  ];

  // --- MANEJADORES ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "cedula") {
      const formattedValue = formatCedula(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setErrors({
          form: "No estás autenticado. Por favor, inicia sesión como administrador.",
        });
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const res = await axios.post(
        "http://localhost:4000/api/doctors/createDr",
        {
          ...formData,
          telefonoDeContacto: formData.phone,
          assignedOfficeId: null,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(`Doctor "${res.data.email}" creado con éxito.`);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        cedula: "",
        especialidad: "",
        isActive: true,
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const backendErrors = error.response.data.errors;
        const errorMap = {};
        backendErrors.forEach((err) => {
          errorMap[err.path] = err.msg;
        });
        setErrors(errorMap);
      } else {
        setErrors({
          form: "Error en la conexión con el servidor. Inténtalo de nuevo.",
        });
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO ---
  return (
    <div className="create-doctor-container">
      <div className="doctor-header">
        <h2>Crear Nuevo Doctor</h2>
        <p>Complete la información para agregar un nuevo doctor al sistema.</p>
      </div>

      <form onSubmit={handleSubmit} className="doctor-form" noValidate>
        <div className="form-section">
          <h3>Información Personal</h3>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="firstName">Nombre *</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Ej: Carlos"
                required
              />
              {errors.firstName && (
                <p className="error-text">{errors.firstName}</p>
              )}
            </div>
            <div className="input-group">
              <label htmlFor="lastName">Apellido *</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Ej: Rodríguez"
                required
              />
              {errors.lastName && (
                <p className="error-text">{errors.lastName}</p>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Credenciales de Acceso</h3>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="email">Correo electrónico *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="doctor@clinica.com"
                required
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña segura"
                required
              />
              {errors.password && (
                <p className="error-text">{errors.password}</p>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Información Profesional</h3>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="cedula">Cédula *</label>
              <input
                id="cedula"
                name="cedula"
                type="text"
                value={formData.cedula}
                onChange={handleChange}
                placeholder="001-XXXXXX-XXXXL"
                required
                maxLength="18"
              />
              {errors.cedula && <p className="error-text">{errors.cedula}</p>}
            </div>
            <div className="input-group">
              <label htmlFor="especialidad">Especialidad *</label>
              <select
                id="especialidad"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una especialidad</option>
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
              {errors.especialidad && (
                <p className="error-text">{errors.especialidad}</p>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="phone">Teléfono de Contacto</label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ej: 8888-8888"
              />
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Estado del Doctor</h3>
          <div className="toggle-group">
            <label className="toggle-label">
              <span>Estado del doctor:</span>
              <div className="toggle-switch">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  hidden
                />
                <label htmlFor="isActive" className="toggle-slider">
                  <span className="toggle-text">
                    {formData.isActive ? "Activo" : "Inactivo"}
                  </span>
                </label>
              </div>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Creando...
              </>
            ) : (
              "Crear Doctor"
            )}
          </button>
        </div>

        {errors.form && (
          <div className="message error-message">
            <span className="message-icon">⚠️</span>
            <span>{errors.form}</span>
          </div>
        )}
        {successMessage && (
          <div className="message success-message">
            <span className="message-icon">✓</span>
            <span>{successMessage}</span>
          </div>
        )}
      </form>
    </div>
  );
}

export default CreateUserDoctorTool;
