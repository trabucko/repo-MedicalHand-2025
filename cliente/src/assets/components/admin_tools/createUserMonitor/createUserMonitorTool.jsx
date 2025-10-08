import { useState } from "react";
import { getAuth } from "firebase/auth";
import "./CreateUserMonitorTool.css";

function CrearMonitor() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [cedula, setCedula] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setMensaje(
          "No estás autenticado. Por favor, inicia sesión como administrador."
        );
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const res = await fetch("http://localhost:4000/monitores/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
          cedula,
          isActive,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(`Monitor "${data.email}" creado con éxito.`);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setCedula("");
        setIsActive(true);
      } else {
        setMensaje(
          `Error: ${
            data.error || data.message || "No se pudo crear el usuario."
          }`
        );
      }
    } catch (error) {
      setMensaje("Error en la conexión con el servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-monitor-container">
      <div className="monitor-header">
        <h2>Crear Nuevo Monitor</h2>
        <p>Complete la información para agregar un nuevo monitor al sistema.</p>
      </div>

      <form onSubmit={handleSubmit} className="monitor-form">
        <div className="form-section">
          <h3>Información Personal</h3>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="firstName">Nombre *</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej: Carlos"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="lastName">Apellido *</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej: Rodríguez"
                required
              />
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="monitor@clinica.com"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña segura"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Información Adicional</h3>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +505 1234 5678"
              />
            </div>
            <div className="input-group">
              <label htmlFor="cedula">Cédula *</label>
              <input
                id="cedula"
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ej: 00123456789"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Estado del Monitor</h3>
          <div className="toggle-group">
            <label className="toggle-label">
              <span>Estado del monitor:</span>
              <div className="toggle-switch">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  hidden
                />
                <label htmlFor="isActive" className="toggle-slider">
                  <span className="toggle-text">
                    {isActive ? "Activo" : "Inactivo"}
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
                <span className="spinner"></span>
                Creando...
              </>
            ) : (
              "Crear Monitor"
            )}
          </button>
        </div>
      </form>

      {mensaje && (
        <div
          className={
            mensaje.includes("Error")
              ? "message error-message"
              : "message success-message"
          }
        >
          <span className="message-icon">
            {mensaje.includes("Error") ? "⚠︎" : "✓"}
          </span>
          <span>{mensaje}</span>
        </div>
      )}
    </div>
  );
}

export default CrearMonitor;
