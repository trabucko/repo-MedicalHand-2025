import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";

// Si tienes el componente del Loader en otro archivo, impórtalo.
// import Loader from '../components/GlobalLoader';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  // useRef se usa para guardar la referencia al temporizador entre renderizados
  const loaderTimeout = useRef(null);

  const showLoader = useCallback(() => {
    // Si ya existe un temporizador para ocultar el loader, lo cancelamos.
    // Esto evita que el loader se oculte si se llama a showLoader() de nuevo rápidamente.
    if (loaderTimeout.current) {
      clearTimeout(loaderTimeout.current);
      loaderTimeout.current = null;
    }
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    // ✅ Lógica para el tiempo mínimo de espera
    // Se asegura de que el loader se muestre por lo menos 400 milisegundos.
    // Esto da tiempo a la animación y previene parpadeos extraños en la UI.
    loaderTimeout.current = setTimeout(() => {
      setIsLoading(false);
    }, 400);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
      {/* Opcional: Puedes renderizar tu Loader global aquí mismo */}
      {/* {isLoading && <Loader />} */}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading debe ser usado dentro de un LoadingProvider");
  }
  return context;
};
