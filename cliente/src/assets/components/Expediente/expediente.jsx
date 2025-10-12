// src/components/Expedientes/Expedientes.jsx
import React, { useState, useEffect } from "react";
import "./expediente.css";

const Expedientes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("todos");
  const [pacientes, setPacientes] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Datos de ejemplo - en una app real vendrían de una API
  const pacientesEjemplo = [
    {
      id: 1,
      nombre: "María González López",
      cedula: "V-12345678",
      fechaNacimiento: "15/03/1985",
      telefono: "+58 412-5557890",
      email: "maria.gonzalez@email.com",
      direccion: "Av. Principal, Res. Las Acacias, Caracas",
      tipoSangre: "O+",
      alergias: "Penicilina, Mariscos",
      enfermedadesCronicas: "Hipertensión",
      ultimaConsulta: "15/01/2024",
      proximaCita: "15/02/2024",
      estado: "Activo",
      notas:
        "Paciente con control regular de presión arterial. Respeta tratamiento al 100%.",
      medicamentos: "Losartán 50mg, Aspirina 100mg",
    },
    {
      id: 2,
      nombre: "Carlos Rodríguez Pérez",
      cedula: "V-87654321",
      fechaNacimiento: "22/07/1978",
      telefono: "+58 414-5551234",
      email: "c.rodriguez@email.com",
      direccion: "Calle 5, Urb. El Paraíso, Valencia",
      tipoSangre: "A+",
      alergias: "Ninguna",
      enfermedadesCronicas: "Diabetes Tipo II",
      ultimaConsulta: "10/01/2024",
      proximaCita: "10/03/2024",
      estado: "Activo",
      notas: "Control glucémico estable. Mantiene dieta y ejercicio.",
      medicamentos: "Metformina 850mg, Glibenclamida 5mg",
    },
    {
      id: 3,
      nombre: "Ana Martínez Silva",
      cedula: "V-11223344",
      fechaNacimiento: "30/11/1992",
      telefono: "+58 416-5556677",
      email: "a.martinez@email.com",
      direccion: "Sector La Floresta, Maracaibo",
      tipoSangre: "B-",
      alergias: "Aspirina, Polvo",
      enfermedadesCronicas: "Asma",
      ultimaConsulta: "08/01/2024",
      proximaCita: "08/04/2024",
      estado: "Inactivo",
      notas:
        "Paciente con episodios asmáticos estacionales. Usa inhalador de rescate.",
      medicamentos: "Salbutamol inhalador, Budesonide",
    },
  ];

  const filters = [
    { value: "todos", label: "Todos los campos" },
    { value: "nombre", label: "Nombre completo" },
    { value: "cedula", label: "Cédula de identidad" },
    { value: "email", label: "Correo electrónico" },
    { value: "telefono", label: "Teléfono" },
    { value: "tipoSangre", label: "Tipo de sangre" },
  ];

  useEffect(() => {
    setPacientes(pacientesEjemplo);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setPacienteSeleccionado(null);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const termino = searchTerm.toLowerCase();
      let resultados = [];

      if (searchFilter === "todos") {
        resultados = pacientesEjemplo.filter((paciente) =>
          Object.values(paciente).some((value) =>
            value.toString().toLowerCase().includes(termino)
          )
        );
      } else {
        resultados = pacientesEjemplo.filter((paciente) =>
          paciente[searchFilter]?.toString().toLowerCase().includes(termino)
        );
      }

      if (resultados.length > 0) {
        setPacienteSeleccionado(resultados[0]);
      } else {
        setPacienteSeleccionado(null);
      }
      setLoading(false);
    }, 500);
  };

  const limpiarBusqueda = () => {
    setSearchTerm("");
    setSearchFilter("todos");
    setPacienteSeleccionado(null);
    setShowFilters(false);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="expedientes-container-exp">
      <div className="expedientes-header-exp">
        <h1 className="expedientes-titulo-exp">
          Gestión de Expedientes Médicos
        </h1>
        <p className="expedientes-descripcion-exp">
          Busque y consulte los expedientes de los pacientes con filtros
          avanzados de búsqueda.
        </p>
      </div>

      {/* Barra de búsqueda mejorada */}
      <div className="expedientes-busqueda-container-exp">
        <form onSubmit={handleSearch} className="expedientes-form-busqueda-exp">
          <div className="expedientes-search-main-exp">
            <div className="expedientes-search-input-group-exp">
              <div className="expedientes-search-wrapper-exp">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar pacientes..."
                  className="expedientes-input-busqueda-exp"
                />
                <div className="expedientes-filter-indicator-exp">
                  <span className="expedientes-filter-badge-exp">
                    {filters.find((f) => f.value === searchFilter)?.label}
                  </span>
                  <button
                    type="button"
                    onClick={toggleFilters}
                    className="expedientes-btn-filters-exp"
                  >
                    ⚙️
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="expedientes-btn-buscar-exp"
                disabled={loading}
              >
                {loading ? (
                  <span className="expedientes-loading-exp">
                    <span className="expedientes-spinner-exp"></span>
                    Buscando...
                  </span>
                ) : (
                  "🔍 Buscar"
                )}
              </button>
            </div>

            {/* Filtros desplegables */}
            {showFilters && (
              <div className="expedientes-filters-panel-exp">
                <div className="expedientes-filters-header-exp">
                  <h4>Filtrar por:</h4>
                  <button
                    type="button"
                    onClick={toggleFilters}
                    className="expedientes-btn-close-filters-exp"
                  >
                    ✕
                  </button>
                </div>
                <div className="expedientes-filters-grid-exp">
                  {filters.map((filter) => (
                    <label
                      key={filter.value}
                      className="expedientes-filter-option-exp"
                    >
                      <input
                        type="radio"
                        name="searchFilter"
                        value={filter.value}
                        checked={searchFilter === filter.value}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="expedientes-filter-radio-exp"
                      />
                      <span className="expedientes-filter-label-exp">
                        {filter.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="expedientes-search-actions-exp">
            <button
              type="button"
              onClick={limpiarBusqueda}
              className="expedientes-btn-limpiar-exp"
            >
              🗑️ Limpiar
            </button>
            <div className="expedientes-search-stats-exp">
              {pacienteSeleccionado && (
                <span className="expedientes-stat-exp">
                  ✅ 1 paciente encontrado
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Resultados - Nuevo diseño */}
      <div className="expedientes-resultados-container-exp">
        {pacienteSeleccionado ? (
          <div className="expedientes-detalle-paciente-exp">
            {/* Header del expediente */}
            <div className="expedientes-detalle-header-exp">
              <div className="expedientes-paciente-main-info-exp">
                <h2 className="expedientes-detalle-titulo-exp">
                  {pacienteSeleccionado.nombre}
                </h2>
                <div className="expedientes-paciente-meta-exp">
                  <span className="expedientes-cedula-exp">
                    {pacienteSeleccionado.cedula}
                  </span>
                  <span className="expedientes-edad-exp">• 38 años</span>
                </div>
              </div>
              <div className="expedientes-header-actions-exp">
                <span
                  className={`expedientes-estado-badge-exp expedientes-estado-${pacienteSeleccionado.estado.toLowerCase()}-exp`}
                >
                  {pacienteSeleccionado.estado}
                </span>
                <div className="expedientes-ultima-visita-exp">
                  Última visita: {pacienteSeleccionado.ultimaConsulta}
                </div>
              </div>
            </div>

            {/* Grid de información mejorado */}
            <div className="expedientes-grid-layout-exp">
              {/* Columna izquierda - Información personal */}
              <div className="expedientes-columna-exp">
                <div className="expedientes-info-card-exp">
                  <h3 className="expedientes-card-titulo-exp">
                    📋 Información Personal
                  </h3>
                  <div className="expedientes-info-grid-exp">
                    <div className="expedientes-info-field-exp">
                      <label>Teléfono</label>
                      <span>{pacienteSeleccionado.telefono}</span>
                    </div>
                    <div className="expedientes-info-field-exp">
                      <label>Email</label>
                      <span>{pacienteSeleccionado.email}</span>
                    </div>
                    <div className="expedientes-info-field-exp">
                      <label>Dirección</label>
                      <span>{pacienteSeleccionado.direccion}</span>
                    </div>
                    <div className="expedientes-info-field-exp">
                      <label>Fecha Nacimiento</label>
                      <span>{pacienteSeleccionado.fechaNacimiento}</span>
                    </div>
                  </div>
                </div>

                <div className="expedientes-info-card-exp">
                  <h3 className="expedientes-card-titulo-exp">
                    💊 Medicación Actual
                  </h3>
                  <div className="expedientes-medicamentos-exp">
                    {pacienteSeleccionado.medicamentos}
                  </div>
                </div>
              </div>

              {/* Columna derecha - Información médica */}
              <div className="expedientes-columna-exp">
                <div className="expedientes-info-card-exp">
                  <h3 className="expedientes-card-titulo-exp">
                    🏥 Información Médica
                  </h3>
                  <div className="expedientes-info-grid-exp">
                    <div className="expedientes-info-field-exp">
                      <label>Tipo de Sangre</label>
                      <span className="expedientes-sangre-exp">
                        {pacienteSeleccionado.tipoSangre}
                      </span>
                    </div>
                    <div className="expedientes-info-field-exp">
                      <label>Alergias</label>
                      <span
                        className={
                          pacienteSeleccionado.alergias === "Ninguna"
                            ? "expedientes-no-alergias-exp"
                            : "expedientes-si-alergias-exp"
                        }
                      >
                        {pacienteSeleccionado.alergias}
                      </span>
                    </div>
                    <div className="expedientes-info-field-exp">
                      <label>Enfermedades Crónicas</label>
                      <span>{pacienteSeleccionado.enfermedadesCronicas}</span>
                    </div>
                    <div className="expedientes-info-field-exp">
                      <label>Próxima Cita</label>
                      <span className="expedientes-proxima-cita-exp">
                        {pacienteSeleccionado.proximaCita}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="expedientes-info-card-exp">
                  <h3 className="expedientes-card-titulo-exp">
                    📝 Notas Médicas
                  </h3>
                  <div className="expedientes-notas-exp">
                    {pacienteSeleccionado.notas}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="expedientes-acciones-container-exp">
              <button className="expedientes-btn-primary-exp">
                ✏️ Editar Expediente
              </button>
              <button className="expedientes-btn-secondary-exp">
                📊 Historial Clínico
              </button>
              <button className="expedientes-btn-success-exp">
                🗓️ Nueva Consulta
              </button>
              <button className="expedientes-btn-warning-exp">
                📄 Generar Reporte
              </button>
            </div>
          </div>
        ) : searchTerm && !loading ? (
          <div className="expedientes-sin-resultados-exp">
            <div className="expedientes-no-results-icon-exp">🔍</div>
            <h3>No se encontraron pacientes</h3>
            <p>
              No hay resultados para "<strong>{searchTerm}</strong>" en{" "}
              {filters
                .find((f) => f.value === searchFilter)
                ?.label.toLowerCase()}
              .
            </p>
            <button
              onClick={limpiarBusqueda}
              className="expedientes-btn-intentar-exp"
            >
              Intentar con otros criterios
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Expedientes;
