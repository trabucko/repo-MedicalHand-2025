import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
import { auth } from "../../firebase.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Ahora solo necesitamos el estado 'user' y 'loading'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              // Obtenemos el token y sus claims
              const tokenResult = await firebaseUser.getIdTokenResult(true);

              // ✅ Fusionamos el objeto del usuario de Firebase con los claims
              const userWithClaims = {
                ...firebaseUser,
                claims: tokenResult.claims,
              };

              setUser(userWithClaims);
            } catch (err) {
              console.error("Error obteniendo claims:", err);
              // Si falla, aún podemos establecer el usuario, pero sin claims
              setUser(firebaseUser);
            }
          } else {
            setUser(null);
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
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
