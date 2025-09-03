import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import monitorRoutes from "../src/routes/monitorUserRoutes.js";
import doctorRoutes from "../src/routes/doctorUserRoutes.js"; // Importación del nuevo enrutador de doctores

//se cargan las variables de entorno del archivo .env
dotenv.config();

// Inicializar la aplicación de Express (servidor)
const app = express();

//Middlewares
app.use(morgan("dev"));

// Habilitar CORS para permitir peticiones desde otros dominios/puertos
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Habilitar el parseo de datos JSON en el cuerpo de las peticiones (req.body)
app.use(express.json());

//Ruta de Prueba
app.get("/", (req, res) => {
  res.send("Bienvenido a MedicalHand Backend");
});

// Uso de las rutas
app.use("/monitores", monitorRoutes);
app.use("/doctores", doctorRoutes); // Uso de la nueva ruta para doctores

//puerto
const PORT = process.env.PORT || 3000;

// --- Iniciar servidor ---
// Escuchar conexiones entrantes en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
