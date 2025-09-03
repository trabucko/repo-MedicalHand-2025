// src/App.jsx

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
import Login from "../src/assets/pages/Login/Login.jsx";
import ConsultaExterna from "./assets/pages/ConsultaExterna/ConsultaExterna.jsx";
import Administracion from "./assets/pages/Administracion/Administracion.jsx";
import GlobalLoader from "../src/assets/components/GlobalLoader/GlobalLoader.jsx";
import ResumenCita from "../src/assets/components/tabMenu/Solicitudes/SelectConsultorio/SelectHorario/resumenCita/resumenCita.jsx";

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <Router>
          <GlobalLoader />
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/ConsultaExt"
              element={
                <PrivateRoute>
                  <ConsultaExterna />
                </PrivateRoute>
              }
            />

            <Route
              path="/resumen-cita"
              element={
                <PrivateRoute>
                  <ResumenCita />
                </PrivateRoute>
              }
            />

            {/* 🔒 Rutas de administración anidadas */}
            <Route
              path="/administracion/*"
              element={
                <PrivateRoute requiredRole="hospital_administrador">
                  <AdministracionLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="crear-monitor" replace />} />
              <Route path="crear-monitor" element={<Administracion />} />
              <Route path="crear-doctor" element={<Administracion />} />
              <Route path="crear-administrador" element={<Administracion />} />
              <Route path="consultorios" element={<Administracion />} />
              <Route path="reportes" element={<Administracion />} />
            </Route>

            {/* Ruta de respaldo para /Admin (redirecciona a la nueva estructura) */}
            <Route
              path="/Admin"
              element={<Navigate to="/administracion/crear-monitor" replace />}
            />
          </Routes>
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
}

// Layout para las rutas de administración
function AdministracionLayout() {
  return (
    <div>
      <Outlet /> {/* Esto renderizará el componente de la ruta hija */}
    </div>
  );
}

// 🔒 Ruta protegida (mantén el mismo código que ya tienes)
function PrivateRoute({ children, requiredRole }) {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: globalLoading } = useLoading();

  if (authLoading || globalLoading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requiredRole && user.claims?.role !== requiredRole) {
    return <Navigate to="/ConsultaExt" />;
  }

  return children;
}

// 🚪 Ruta pública (mantén el mismo código que ya tienes)
function PublicRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: globalLoading } = useLoading();

  if (authLoading || globalLoading) {
    return <p>Cargando...</p>;
  }
  if (user) {
    return <Navigate to="/ConsultaExt" />;
  }
  return children;
}

export default App;
