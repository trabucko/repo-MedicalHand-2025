// src/pages/ConsultaExterna.jsx (o donde lo tengas)
import { Outlet } from "react-router-dom"; // ✅ 1. Importa Outlet
import Navbar from "../../components/Navbar/navbar";
// Ya no necesitas importar Tabmenu aquí, el router se encargará de eso.

function ConsultaExterna() {
  return (
    <div>
      <header>
        {/* El Navbar es parte del layout y siempre será visible en esta sección */}
        <Navbar />
      </header>
      <section className="ContentArea">
        {" "}
        {/* Puedes cambiar el nombre de la clase si quieres */}
        {/* ✅ 2. Reemplaza Tabmenu con Outlet */}
        <Outlet />
      </section>
    </div>
  );
}

export default ConsultaExterna;
