// src/assets/context/AuthContext.jsx (Versión Adaptada)

import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth, app } from "../../firebase.js";
import { useLoading } from "./LoadingContext.jsx";

const db = getFirestore(app);
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useLoading();

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    showLoader();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult(true);
          const claims = tokenResult.claims;
          // --- AÑADE ESTOS LOGS PARA DEPURAR ---
          console.log("Firebase User UID:", firebaseUser.uid);
          console.log("Custom Claims:", claims);
          if (!claims.hospitalId) {
            console.error("¡ERROR! No se encontró hospitalId en los claims.");
            // ... tu lógica de error
          } else {
            console.log("hospitalId encontrado:", claims.hospitalId);
          }
          // --- FIN DE LOGS ---
          // Si el usuario no tiene un hospitalId en sus claims, no podemos continuar.
          if (!claims.hospitalId) {
            throw new Error(
              "El usuario no tiene un hospitalId asignado en sus claims."
            );
          }

          // --- CAMBIO CLAVE AQUÍ ---
          // Ahora buscamos el documento del usuario dentro de la subcolección de su hospital.
          const userDocRef = doc(
            db,
            "hospitales_MedicalHand",
            claims.hospitalId, // Usamos el ID del hospital...
            "users", // ...para llegar a la subcolección 'users'...
            firebaseUser.uid // ...y encontrar el documento del usuario.
          );
          // --- FIN DEL CAMBIO ---

          const userDocSnap = await getDoc(userDocRef);

          // --- OTRO LOG CRÍTICO ---
          console.log(
            "¿Existe el documento del usuario?",
            userDocSnap.exists()
          );
          if (userDocSnap.exists()) {
            console.log("Datos del usuario en Firestore:", userDocSnap.data());
          }
          // --- FIN DE LOG ---

          const firestoreUserData = userDocSnap.data();

          // La lógica para obtener los datos del hospital no cambia.
          const hospitalDocRef = doc(
            db,
            "hospitales_MedicalHand",
            claims.hospitalId
          );
          const hospitalDocSnap = await getDoc(hospitalDocRef);
          const hospitalData = hospitalDocSnap.data();

          const completeUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            claims: claims,
            fullName: firestoreUserData?.fullName || "Usuario sin nombre",
            hospitalName: hospitalData?.name || "Hospital no asignado",
            hospitalId: claims.hospitalId,
          };

          setUser(completeUser);
        } catch (err) {
          console.error("Error al enriquecer el usuario:", err);
          // Si algo falla (ej. el documento no se encuentra), cerramos la sesión para evitar un estado inconsistente.
          await logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
      hideLoader();
    });

    return () => unsubscribe();
  }, []);

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
