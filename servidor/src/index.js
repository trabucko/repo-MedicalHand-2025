import express from "express"; // Framework para crear un servidor web y manejar rutas HTTP (peticiones del Frontend al Backend)
import cors from "cors"; // Middleware para permitir solicitudes desde otros orígenes (CORS)
import dotenv from "dotenv"; //para cargar variables de entorno (para mantener una seguridad en datos valiosos)
import morgan from "morgan";

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
    credentials: true, // si envías cookies o headers
  })
);

// Habilitar el parseo de datos JSON en el cuerpo de las peticiones (req.body)

app.use(express.json()); //hace que estas peticiones , puedan ser facilmente procesadas en formato JSON

//Ruta de Prueba
app.get("/", (req, res) => {
  res.send("Bienvenido a MedicalHand Backend");
});

//puerto
// Si existe process.env.PORT (definido en .env), usarlo, si no usar 3000
const PORT = process.env.PORT || 3000;

// --- Iniciar servidor ---
// Escuchar conexiones entrantes en el puerto definido
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
