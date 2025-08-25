import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut, // Importar signOut para el cierre de sesión
} from "firebase/auth";
import { auth } from "../../firebase.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);

  // Método de cierre de sesión
  const logout = async () => {
    try {
      await signOut(auth); // Cerrar sesión con Firebase
      setUser(null); // Limpiar estado del usuario
      setClaims(null); // Limpiar claims
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  useEffect(() => {
    // Configurar la persistencia
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Suscribirse a los cambios de auth (login, logout, refresh)
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Forzamos refresh para asegurar claims actualizados
              const tokenResult = await firebaseUser.getIdTokenResult(true);
              setUser(firebaseUser);
              setClaims(tokenResult.claims);
            } catch (err) {
              console.error("Error obteniendo claims:", err);
              setUser(firebaseUser);
              setClaims(null);
            }
          } else {
            setUser(null);
            setClaims(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error("Error configurando persistencia:", error);
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        claims,
        setClaims,
        loading,
        logout, // Incluir el método logout en el contexto
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto en cualquier componente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
