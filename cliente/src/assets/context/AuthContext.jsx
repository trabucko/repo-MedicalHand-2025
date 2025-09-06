// src/assets/context/AuthContext.jsx (Versión Final)

import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth, app } from "../../firebase.js";
import { useLoading } from "./LoadingContext.jsx"; // ✅ 1. Importa el hook del LoadingContext

const db = getFirestore(app);
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useLoading(); // ✅ 2. Obtén las funciones para mostrar/ocultar el loader

  const logout = async () => {
    // No necesitamos el loader aquí porque la redirección es instantánea
    await signOut(auth);
  };

  useEffect(() => {
    // ✅ 3. MUESTRA EL LOADER al inicio de la verificación
    // Esto se ejecutará tanto en la carga inicial de la página como después del login.
    showLoader();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // ... (toda tu lógica para obtener claims y datos de firestore no cambia)
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const claims = tokenResult.claims;
          const userDocRef = doc(db, "usuarios_hospitales", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          const firestoreUserData = userDocSnap.data();
          let hospitalData = {};
          if (claims.hospitalId) {
            const hospitalDocRef = doc(
              db,
              "hospitales_MedicalHand",
              claims.hospitalId
            );
            const hospitalDocSnap = await getDoc(hospitalDocRef);
            hospitalData = hospitalDocSnap.data();
          }
          const completeUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            claims: claims,
            fullName: firestoreUserData?.fullName || "Usuario sin nombre",
            hospitalName: hospitalData?.name || "Hospital no asignado",
          };
          setUser(completeUser);
        } catch (err) {
          console.error("Error al enriquecer el usuario:", err);
          setUser(firebaseUser); // Establece el usuario básico si falla
        }
      } else {
        setUser(null);
      }

      setLoading(false); // Avisa a las rutas que la carga de autenticación terminó
      // ✅ 4. OCULTA EL LOADER al final de todo el proceso
      hideLoader();
    });

    return () => unsubscribe();
  }, []); // El array vacío asegura que esto solo se configure una vez

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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
