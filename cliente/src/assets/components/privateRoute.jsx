import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>; // mientras verifica el login
  }

  if (!user) {
    return <Navigate to="/" />; // si no hay user → login
  }

  return children; // si hay user → deja entrar
}

export default PrivateRoute;
