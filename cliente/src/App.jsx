import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

// --- Contextos ---
import { AuthProvider, useAuth } from "./assets/context/AuthContext.jsx";
import {
  LoadingProvider,
  useLoading,
} from "./assets/context/LoadingContext.jsx";

// --- Componentes y Páginas ---
import Login from "./assets/pages/Login/Login.jsx";
import Administracion from "./assets/pages/Administracion/Administracion.jsx";
import ConsultaExterna from "./assets/pages/ConsultaExterna/ConsultaExterna.jsx";
import DoctorDashboard from "./assets/pages/hospitalDoctor/DoctorDashboard.jsx";
import DoctorView from "./assets/components/components_Doctor/HorarioMedico/DoctorView.jsx";
import GlobalLoader from "./assets/components/GlobalLoader/GlobalLoader.jsx";
import DoctorLayout from "./assets/components/components_Doctor/Doctor_Layout/Doctor_Layout.jsx";
import Paciente from "./assets/components/components_Doctor/paciente/pacientes.jsx";

// --- Componentes de Control de Rutas ---

const GuestRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null; // Espera a que se determine el estado de autenticación

  if (user) {
    const role = user.claims?.role;
    if (role === "hospital_monitor")
      return <Navigate to="/consulta-externa" replace />;
    if (role === "hospital_doctor")
      return <Navigate to="/dashboard-doctor" replace />;
    if (role === "hospital_administrador")
      return <Navigate to="/administracion" replace />;

    // Si el usuario tiene un rol no reconocido, lo enviamos al login por seguridad
    return <Navigate to="/login" replace />;
  }
  // Si no hay usuario, permite el acceso a las rutas hijas (Login)
  return <Outlet />;
};

const ProtectedRoute = ({ requiredRole, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Muestra nada mientras se verifica el usuario
  }

  // Si no hay usuario, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol del usuario no coincide con el requerido, redirige al login
  if (requiredRole && user.claims?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Si todo está correcto, renderiza el componente hijo
  return children;
};

const AppLoader = () => {
  const { isLoading } = useLoading();
  return isLoading ? <GlobalLoader /> : null;
};

// --- Componente Principal de la Aplicación ---

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <Router>
          <AppLoader />
          <Routes>
            {/* --- RUTAS PÚBLICAS (Solo para usuarios no autenticados) --- */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Login />} />
            </Route>

            {/* --- LAYOUT PROTEGIDO PARA EL ROL DE DOCTOR --- */}
            <Route
              path="/dashboard-doctor"
              element={
                <ProtectedRoute requiredRole="hospital_doctor">
                  <DoctorLayout />
                </ProtectedRoute>
              }
            >
              {/* Estas páginas se renderizan dentro del DoctorLayout */}
              <Route index element={<DoctorDashboard />} />
              <Route path="horario" element={<DoctorView />} />
              <Route path="paciente/:patientId" element={<Paciente />} />
              {/* Puedes agregar más rutas específicas para el doctor aquí */}
            </Route>

            {/* --- RUTAS PROTEGIDAS PARA OTROS ROLES --- */}
            <Route
              path="/consulta-externa"
              element={
                <ProtectedRoute requiredRole="hospital_monitor">
                  <ConsultaExterna />
                </ProtectedRoute>
              }
            />
            <Route
              path="/administracion"
              element={
                <ProtectedRoute requiredRole="hospital_administrador">
                  <Administracion />
                </ProtectedRoute>
              }
            >
              {/* Rutas hijas de Administración */}
              <Route path="crear-doctor" element={<Administracion />} />
              <Route path="crear-monitor" element={<Administracion />} />
              <Route path="crear-administrador" element={<Administracion />} />
              <Route path="consultorios" element={<Administracion />} />
              <Route path="reportes" element={<Administracion />} />
            </Route>

            {/* --- RUTA COMODÍN (Redirige cualquier URL no encontrada) --- */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LoadingProvider>
  );
}

export default App;
