import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { useNavigate } from "react-router-dom";

import logo from "../../../assets/img/logo_blanco.png";
import Hamburguer from "../menu_hamburguesa/menu.jsx";
import { FaHistory, FaUserCog, FaSignOutAlt, FaHospital } from "react-icons/fa";
import { GiPc } from "react-icons/gi";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../../firebase.js"; // <-- Cambia a una importación nombrada con llaves
import { useAuth } from "../../context/AuthContext.jsx";

const db = getFirestore(app);
const auth = getAuth();

const Navbar = () => {
  const navigate = useNavigate();
  // ✅ CORREGIDO: Ahora obtenemos el objeto user completo desde el contexto
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hospitalName, setHospitalName] = useState("Nombre del hospital");
  const [fullName, setFullName] = useState("Nombre usuario");

  // ✅ CORREGIDO: Accedemos al rol directamente desde user.claims
  const isAdmin = user?.claims?.role === "hospital_administrador";
  const role = user?.claims?.role || "Rol";
  const hospitalId = user?.claims?.hospitalId;

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Obtener hospital
  useEffect(() => {
    if (!hospitalId) return;
    const fetchHospital = async () => {
      try {
        const docRef = doc(db, "hospitales_MedicalHand", hospitalId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHospitalName(docSnap.data().name);
        }
      } catch (err) {
        console.error("Error obteniendo hospital:", err);
      }
    };
    fetchHospital();
  }, [hospitalId]);

  // Obtener nombre completo del usuario
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) return;
      console.log("Usuario autenticado:", firebaseUser);
      try {
        const querySnapshot = await getDocs(
          collection(db, "usuarios_hospitales")
        );
        let foundUser = null;
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.email === firebaseUser.email) {
            foundUser = data;
          }
        });
        if (foundUser) {
          const name = foundUser.fullName;
          console.log("Nombre completo:", name);
          setFullName(name);
        } else {
          console.log(
            "No se encontraron documentos para el email:",
            firebaseUser.email
          );
        }
      } catch (err) {
        console.error("Error obteniendo usuario:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="navbar-links">
          <a className="navbar-btn" onClick={() => navigate("/ConsultaExt")}>
            Consulta Externa
          </a>
          <a className="navbar-btn" onClick={() => navigate("/historial")}>
            Especialidades
          </a>
          {isAdmin && (
            <a className="navbar-btn" onClick={() => navigate("/Admin")}>
              Administración
            </a>
          )}
        </div>
        <Hamburguer onClick={toggleMenu} isOpen={isOpen} />
      </div>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Reportnic Logo" className="sidebar-logo" />
          <div className="sidebar-title">
            <span className="medical">
              Medical<span className="hand">Hand</span>
            </span>
          </div>
        </div>
        <div className="sidebar-profile">
          <div className="user-info-item">
            <div className="info-icon">
              <FaUserCog className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Usuario</div>
              <div className="info-value">{fullName}</div>
            </div>
          </div>
          <div className="user-info-item hospital">
            <div className="info-icon">
              <FaHospital className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Hospital</div>
              <div className="info-value">{hospitalName}</div>
            </div>
          </div>
          <div className="user-info-item role">
            <div className="info-icon">
              <FaUserCog className="sidebar-icon" />
            </div>
            <div className="info-content">
              <div className="info-label">Rol</div>
              <div className="info-value">{role}</div>
            </div>
          </div>
        </div>
        <button
          className="sidebar-btn"
          onClick={() => navigate("/ConsultaExt")}
        >
          <GiPc className="sidebar-icon" /> Consula Externa
        </button>
        <button className="sidebar-btn" onClick={() => navigate("/historial")}>
          <FaHistory className="sidebar-icon" /> Especialidades
        </button>
        {isAdmin && (
          <button className="sidebar-btn" onClick={() => navigate("/Admin")}>
            <FaUserCog className="sidebar-icon" /> Administración
          </button>
        )}
        <button className="sidebar-btn logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="sidebar-icon" /> Cerrar sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
