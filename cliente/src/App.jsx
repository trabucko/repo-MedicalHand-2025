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

// Tus componentes de página
import Login from "../src/assets/pages/Login/Login.jsx";
import DoctorDashboard from "./assets/pages/hospitalDoctor/DoctorDashboard.jsx";
import Administracion from "./assets/pages/Administracion/Administracion.jsx";
import GlobalLoader from "../src/assets/components/GlobalLoader/GlobalLoader.jsx";
import ConsultaExterna from "./assets/pages/ConsultaExterna/ConsultaExterna.jsx";
import DoctorView from "./assets/components/components_Doctor/HorarioMedico/DoctorView.jsx";
import ProtectedLayout from "./assets/components/ProtectedLayout/ProtectedLayout.jsx"; // ✅ ¡ERROR CORREGIDO!

// --- Componentes de Rutas ---

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

// --- Componente Principal App ---

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <Router>
          <AppLoader />
          <Routes>
            {/* --- RUTAS PARA INVITADOS --- */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Login />} />
            </Route>

            {/* --- RUTAS PROTEGIDAS USANDO EL LAYOUT --- */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ProtectedLayout />
                </ProtectedRoute>
              }
            >
              <Route
                path="dashboard-doctor"
                element={
                  <ProtectedRoute requiredRole="hospital_doctor">
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard-doctor/horario"
                element={
                  <ProtectedRoute requiredRole="hospital_doctor">
                    <DoctorView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="consulta-externa"
                element={
                  <ProtectedRoute requiredRole="hospital_monitor">
                    <ConsultaExterna />
                  </ProtectedRoute>
                }
              />
              <Route
                path="administracion/*"
                element={
                  <ProtectedRoute requiredRole="hospital_administrador">
                    <Administracion />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Ruta para cualquier otra URL no encontrada */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LoadingProvider>
  );
}
export default App;
