import React from "react";
import { Calendar } from "react-big-calendar";

/**
 * Este es un "componente memoizado". React.memo evita que este componente
 * se vuelva a renderizar si sus props no han cambiado. Esto es crucial para
 * el rendimiento, ya que evita que el pesado componente del Calendario se
 * redibuje cada vez que abrimos el modal.
 */
const CalendarWrapper = React.memo(function CalendarWrapper(props) {
  // Este console.log te ayudará a ver en la consola del navegador
  // cuántas veces se renderiza realmente el calendario. ¡Ahora serán muchas menos!
  console.log(
    "Renderizando el Calendario... (deberías ver esto con menos frecuencia)"
  );

  return <Calendar {...props} />;
});

export default CalendarWrapper;
