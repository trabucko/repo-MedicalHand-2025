import { useState } from "react";
import Navbar from "../../components/Navbar/navbar";
import Tabmenu from "../../components/tabMenu/TabMenu";
function ConsultaExterna() {
  return (
    <div>
      <header>
        <Navbar />
      </header>
      <section className="TapMenu">
        <Tabmenu />
      </section>
    </div>
  );
}

export default ConsultaExterna;
