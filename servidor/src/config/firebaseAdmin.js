// src/config/firebaseAdmin.js (CORREGIDO)
import { initializeApp, cert, getApps } from "firebase-admin/app"; // 1. CAMBIO DE IMPORTS
import { getFirestore } from "firebase-admin/firestore"; // 2. CAMBIO DE IMPORTS
import { getAuth } from "firebase-admin/auth"; // 3. CAMBIO DE IMPORTS

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the JSON file synchronously and parse it
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, "serviceAccountKey.json"), "utf8")
);

// 4. CAMBIO DE INICIALIZACIÓN
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

// 5. CAMBIO EN LAS EXPORTACIONES
export const db = getFirestore("medicalhand"); // <-- ¡LA SOLUCIÓN!
export const authAdmin = getAuth();
