import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../src/assets/context/AuthContext.jsx";
import {
  LoadingProvider,
  useLoading,
} from "../src/assets/context/LoadingContext.jsx";

// --- Importaciones de Componentes y Páginas ---
import Login from "../src/assets/pages/Login/Login.jsx";
import Administracion from "./assets/pages/Administracion/Administracion.jsx";
import ConsultaExterna from "./assets/pages/ConsultaExterna/ConsultaExterna.jsx";
import DoctorDashboard from "./assets/pages/hospitalDoctor/DoctorDashboard.jsx";
import DoctorView from "./assets/components/components_Doctor/HorarioMedico/DoctorView.jsx";
import GlobalLoader from "../src/assets/components/GlobalLoader/GlobalLoader.jsx";
import DoctorLayout from "./assets/components/components_Doctor/Doctor_Layout/Doctor_Layout.jsx"; // <-- ¡NUEVA IMPORTACIÓN CLAVE!

// --- Componentes de Rutas (sin cambios) ---

const GuestRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (user) {
    const role = user.claims?.role;
    if (role === "hospital_monitor")
      return <Navigate to="/consulta-externa" replace />;
    if (role === "hospital_doctor")
      return <Navigate to="/dashboard-doctor" replace />;
    if (role === "hospital_administrador")
      return <Navigate to="/administracion" replace />;
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const ProtectedRoute = ({ requiredRole, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.claims?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppLoader = () => {
  const { isLoading } = useLoading();
  return isLoading ? <GlobalLoader /> : null;
};

// --- Componente Principal App (REESTRUCTURADO) ---

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <Router>
          <AppLoader />
          <Routes>
            {/* --- RUTAS PARA INVITADOS (Login y raíz) --- */}
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
              {/* Las páginas hijas se renderizan DENTRO del DoctorLayout */}
              <Route index element={<DoctorDashboard />} />
              <Route path="horario" element={<DoctorView />} />
              {/* Agrega aquí otras rutas del doctor, ej: <Route path="pacientes" element={<PatientsPage />} /> */}
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
            />

            {/* Ruta para cualquier otra URL no encontrada */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LoadingProvider>
  );
}
export default App;
