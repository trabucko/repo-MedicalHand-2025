import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // <-- Importa Navigate
import { AuthProvider, useAuth } from "../src/assets/context/AuthContext.jsx";
import Login from "../src/assets/pages/Login/Login.jsx";
import Inicio from "../src/assets/pages/Inicio/Inicio.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* AHORA LA RUTA DE LOGIN ESTÁ PROTEGIDA POR PublicRoute */}
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
    </AuthProvider>
  );
}

// 🔒 Ruta protegida MEJORADA
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando sesión...</p>;

  // Si no hay usuario, redirige al login usando Navigate
  if (!user) return <Navigate to="/" />;

  return children;
}

// 🚪 Ruta pública NUEVA
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  // Si hay un usuario, lo mandamos a la página principal
  if (user) return <Navigate to="/Inicio" />;

  return children;
}

export default App;
