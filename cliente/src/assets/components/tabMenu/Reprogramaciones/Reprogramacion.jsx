// src/components/Reprogramaciones/Reprogramacion.jsx
import React from "react";
import "./Reprogramacion.css"; // Crea un CSS para tus estilos si es necesario

const Reprogramacion = () => {
  return (
    <div className="reprogramacion-container">
      <h2>Reprogramar Cita Médica</h2>
      <p>
        Aquí puedes buscar y seleccionar una cita existente para reprogramarla.
      </p>
      {/* Aquí puedes agregar la lógica para:
        - Mostrar una lista de citas existentes del usuario.
        - Un botón o enlace para seleccionar una cita.
        - Un formulario para elegir la nueva fecha y hora.
        - Botones para confirmar o cancelar la reprogramación.
      */}
    </div>
  );
};

export default Reprogramacion;
