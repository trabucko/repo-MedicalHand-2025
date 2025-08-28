// src/App.jsx

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../src/assets/context/AuthContext.jsx";
import {
  LoadingProvider,
  useLoading,
} from "../src/assets/context/LoadingContext.jsx";
import Login from "../src/assets/pages/Login/Login.jsx";
import Inicio from "../src/assets/pages/Inicio/Inicio.jsx";
import GlobalLoader from "../src/assets/components/GlobalLoader/GlobalLoader.jsx";

function App() {
  return (
    // 1. AuthProvider para la autenticación en toda la app
    <AuthProvider>
      // 2. LoadingProvider para el estado de carga global
      <LoadingProvider>
        // 3. Router para manejar las rutas
        <Router>
          // 4. El loader se renderiza aquí para estar en toda la app
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
              path="/Inicio"
              element={
                <PrivateRoute>
                  <Inicio />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
}

// 🔒 Ruta protegida
function PrivateRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: globalLoading } = useLoading();

  // Muestra la pantalla de carga si AuthContext o LoadingContext están cargando
  if (authLoading || globalLoading) {
    return <p>Cargando...</p>;
  }
  if (!user) {
    return <Navigate to="/" />;
  }
  return children;
}

// 🚪 Ruta pública
function PublicRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: globalLoading } = useLoading();

  if (authLoading || globalLoading) {
    return <p>Cargando...</p>;
  }
  if (user) {
    return <Navigate to="/Inicio" />;
  }
  return children;
}

export default App;
