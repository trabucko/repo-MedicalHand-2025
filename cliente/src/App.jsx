// src/App.jsx

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../src/assets/context/AuthContext.jsx";
import { LoadingProvider } from "../src/assets/context/LoadingContext.jsx";

// Tus componentes de página
import Login from "../src/assets/pages/Login/Login.jsx"; // ⚠️ ¡Asegúrate que la ruta sea correcta!
import DoctorDashboard from "./assets/pages/hospitalDoctor/DoctorDashboard.jsx";
import Administracion from "./assets/pages/Administracion/Administracion.jsx";
import GlobalLoader from "../src/assets/components/GlobalLoader/GlobalLoader.jsx";
import ConsultaExterna from "./assets/pages/ConsultaExterna/ConsultaExterna.jsx";

// ✅ 1. COMPONENTE PARA RUTAS DE INVITADOS (NO LOGUEADOS)
// Este componente es la clave para romper el bucle infinito.
const GuestRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <GlobalLoader />;
  if (user) {
    const role = user.claims?.role;
    // ✅ 2. AÑADE LA REGLA PARA EL NUEVO ROL
    if (role === "hospital_monitor")
      return <Navigate to="/consulta-externa" replace />;
    if (role === "hospital_doctor")
      return <Navigate to="/dashboard-doctor" replace />;
    if (role === "hospital_administrador")
      return <Navigate to="/administracion" replace />;
    // Si tiene un rol desconocido, lo mandamos al login para evitar errores.
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// ✅ 2. COMPONENTE MEJORADO PARA RUTAS PROTEGIDAS (LOGUEADOS)
// Tu versión era buena, esta es una versión ligeramente refinada.
const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GlobalLoader />;
  }

  // Si no hay usuario, siempre a la página de login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere un rol y el usuario no lo tiene, lo redirigimos.
  if (requiredRole && user.claims?.role !== requiredRole) {
    // Lo ideal es redirigir a una página de "Acceso Denegado" o a su propio dashboard.
    // Por ahora, lo mandamos al login para evitar bucles.
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está logueado y tiene el rol correcto (o no se requiere rol),
  // le mostramos la página solicitada.
  return <Outlet />;
};

function App() {
  return (
    // ✅ ESTE ES EL ORDEN CORRECTO Y LA SOLUCIÓN AL ERROR
    // LoadingProvider debe estar por fuera, envolviendo todo.
    <LoadingProvider>
      <AuthProvider>
        <Router>
          <GlobalLoader />
          <Routes>
            {/* --- RUTAS PARA INVITADOS --- */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Login />} />
            </Route>

            {/* --- RUTAS PROTEGIDAS --- */}
            {/* ✅ 3. CREA EL NUEVO GRUPO DE RUTAS PARA EL MONITOR */}
            <Route element={<ProtectedRoute requiredRole="hospital_monitor" />}>
              <Route path="/consulta-externa" element={<ConsultaExterna />} />
            </Route>

            {/* Rutas para Doctores */}
            <Route element={<ProtectedRoute requiredRole="hospital_doctor" />}>
              <Route path="/dashboard-doctor" element={<DoctorDashboard />} />
            </Route>

            {/* Rutas para Administradores */}
            <Route
              element={<ProtectedRoute requiredRole="hospital_administrador" />}
            >
              <Route path="/administracion/*" element={<Administracion />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LoadingProvider>
  );
}
export default App;
