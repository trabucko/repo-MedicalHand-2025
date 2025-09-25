# MedicalHand Portal Web

<p align="center">
  <strong>Una herramienta de gestión clínica centralizada para médicos y personal hospitalario.</strong>
</p>

<p align="center">
  <a href="#descripción">Descripción</a> •
  <a href="#características">Características</a> •
  <a href="#tecnologías-utilizadas">Tecnologías</a> •
  <a href="#instalación">Instalación</a> •
  <a href="#licencia">Licencia</a>
</p>

---

## Descripción

El **Portal Web de MedicalHand** está diseñado como una herramienta de gestión clínica dirigida exclusivamente a médicos y personal hospitalario. Su enfoque principal es centralizar la información del paciente y facilitar la organización de citas, consultas y tratamientos, garantizando eficiencia y un mejor seguimiento de los casos médicos.

---

## Características

El portal cuenta con un sistema de roles robusto para diferenciar las responsabilidades del personal hospitalario:

#### Administración

- Creación y gestión de usuarios con roles de **hospital_monitor (asistente hospitalario)** y **hospital_doctor**.

#### Rol hospital_monitor

- Agendar citas médicas en nombre del paciente.
- Visualizar la información personal del paciente para verificar datos.
- Seleccionar consultorios y programar citas según la disponibilidad del médico.

#### Rol hospital_doctor

- Visualizar solicitudes de pacientes listos para ser atendidos.
- Registrar historia clinica diagnósticos, motivos de visita y descripción de síntomas detallada.
- Solicitar e importar resultados de exámenes médicos.
- Emitir recetas médicas digitales, especificando medicamento, dosis, frecuencia y duración.
- Añadir notas de seguimiento para garantizar la continuidad del tratamiento.
- Gestionar su propio horario de atención de manera flexible y visual.

---

## Tecnologías Utilizadas

Este proyecto está construido con un stack moderno, separando las responsabilidades entre el cliente y el servidor.

#### **Frontend**

- **React 19:** Una biblioteca de JavaScript para construir interfaces de usuario.
- **Vite:** Herramienta de desarrollo frontend de próxima generación.
- **React Router:** Para el enrutamiento del lado del cliente.
- **Material-UI (MUI):** Para componentes de UI estilizados y responsivos.
- **Firebase SDK:** Para la integración con los servicios de Firebase en el cliente.
- **Moment.js:** Para el manejo y formato de fechas y horas.
- **React Big Calendar:** Para la visualización de calendarios y horarios.
- **SweetAlert2:** Para alertas y modales interactivos.

#### **Backend**

- **Node.js:** Entorno de ejecución de JavaScript del lado del servidor.
- **Express.js:** Framework minimalista para construir la API REST.
- **Firebase Admin SDK:** Para la gestión de usuarios y acceso a la base de datos desde el servidor.
- **CORS:** Para habilitar solicitudes entre dominios.
- **Dotenv:** Para la gestión de variables de entorno.
- **Morgan:** Logger de solicitudes HTTP.

#### **Base de Datos**

- **Cloud Firestore:** Base de datos NoSQL, flexible y escalable de Firebase.
- **Authentication:** Servicio de autenticación de Firebase, para gestionar usuarios, iniciar sesión con email/contraseña.

---

## Estructura del proyecto

¡Claro\! Aquí tienes la estructura de tu proyecto con las carpetas `node_modules` eliminadas. He mantenido la estructura principal para que sea clara y legible.

---

```
D:
│
│
│
├───cliente
│   │   .gitignore
│   │   eslint.config.js
│   │   index.html
│   │   package-lock.json
│   │   package.json
│   │   README.md
│   │   vite.config.js
│   │
│   ├───public
│   │       vite.svg
│   │
│   └───src
│       │   App.css
│       │   App.jsx
│       │   firebase.js
│       │   index.css
│       │   main.jsx
│       │
│       └───assets
│           │   react.svg
│           │
│           ├───components
│           │   │   login_form.jsx
│           │   │   privateRoute.jsx
│           │   │
│           │   ├───admin_tools
│           │   │   │   admin_tools.css
│           │   │   │   admin_tools.jsx
│           │   │   │
│           │   │   ├───createUserDoctor
│           │   │   │       createUserDoctorTool.css
│           │   │   │       createUserDoctorTool.jsx
│           │   │   │
│           │   │   └───createUserMonitor
│           │   │           createUserMonitorTool.css
│           │   │           createUserMonitorTool.jsx
│           │   │
│           │   ├───components_Doctor
│           │   │   ├───Doctor_Layout
│           │   │   │       Doctor_Layout.jsx
│           │   │   │
│           │   │   ├───HorarioMedico
│           │   │   │   │   CalendarWrapper.jsx
│           │   │   │   │   DoctorScheduleManager.jsx
│           │   │   │   │   DoctorView.css
│           │   │   │   │   DoctorView.jsx
│           │   │   │   │   HorarioMedico.css
│           │   │   │   │   HorarioMedico.jsx
│           │   │   │   │   ScheduleModal.css
│           │   │   │   │   ScheduleModal.jsx
│           │   │   │   │
│           │   │   │   ├───DoctorConsultorio
│           │   │   │   │       DoctorConsultorioSelector.css
│           │   │   │   │       DoctorConsultorioSelector.jsx
│           │   │   │   │
│           │   │   │   └───headerDoctor
│           │   │   │           header.css
│           │   │   │           header.jsx
│           │   │   │
│           │   │   └───paciente
│           │   │       │   pacientes.jsx
│           │   │       │
│           │   │       └───PacienteForm
│           │   │               pacienteForm.css
│           │   │               pacienteForm.jsx
│           │   │
│           │   ├───GlobalLoader
│           │   │       GlobalLoader.jsx
│           │   │
│           │   ├───menu_hamburguesa
│           │   │       menu.jsx
│           │   │
│           │   ├───Navbar
│           │   │       navbar.css
│           │   │       navbar.jsx
│           │   │
│           │   ├───ProtectedLayout
│           │   │       ProtectedLayout.css
│           │   │       ProtectedLayout.jsx
│           │   │
│           │   ├───Sidebar
│           │   │       Sidebar.css
│           │   │       Sidebar.jsx
│           │   │
│           │   └───tabMenu
│           │       │   tabMenu.css
│           │       │   tabMenu.jsx
│           │       │
│           │       ├───Cancelacion
│           │       │       Cancelacion.css
│           │       │       Cancelacion.jsx
│           │       │
│           │       ├───Reprogramaciones
│           │       │   │   Reprogramacion.css
│           │       │   │   Reprogramacion.jsx
│           │       │   │
│           │       │   └───SelectReprogramacion
│           │       │           SelectReprogramacion.css
│           │       │           SelectReprogramacion.jsx
│           │       │
│           │       └───Solicitudes
│           │           │   Solicitudes.css
│           │           │   Solicitudes.jsx
│           │           │
│           │           ├───infoPaciente
│           │           │       infoPaciente.css
│           │           │       infoPaciente.jsx
│           │           │
│           │           └───SelectConsultorio
│           │               │   selectConsultorio.css
│           │               │   selectConsultorio.jsx
│           │               │
│           │               └───SelectHorario
│           │                   │   selectHorario.css
│           │                   │   SelectHorario.jsx
│           │                   │
│           │                   └───resumenCita
│           │                           resumenCita.css
│           │                           resumenCita.jsx
│           │
│           ├───context
│           │       AuthContext.jsx
│           │       LoadingContext.jsx
│           │
│           ├───fonts
│           │       NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf
│           │
│           ├───img
│           │       logo_blanco.png
│           │
│           ├───pages
│           │   ├───Administracion
│           │   │       Administracion.css
│           │   │       Administracion.jsx
│           │   │
│           │   ├───ConsultaExterna
│           │   │       ConsultaExterna.css
│           │   │       ConsultaExterna.jsx
│           │   │
│           │   ├───Especialidades
│           │   ├───hospitalDoctor
│           │   │       DoctorDashboard.css
│           │   │       DoctorDashboard.jsx
│           │   │
│           │   └───Login
│           │           login.css
│           │           Login.jsx
│           │
│           └───video
│                   bg_video.mp4
│
└───servidor
    │   .env
    │   .gitignore
    │   package-lock.json
    │   package.json
    │
    ├───scripts
    │       createHospitalYadmin.js
    │
    └───src
        │   index.js
        │
        └───config
                firebase.js
```

---

## Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo local.

### **Prerrequisitos**

- **Node.js:** v18.x o superior
- **npm:** v9.x o superior
- **Git:** Para clonar el repositorio
- Un navegador web moderno (Chrome, Firefox, Edge)

### **Pasos**

1.  **Clonar el repositorio**

    ```bash
    git clone [https://github.com/trabucko/repo-MedicalHand-2025.git](https://github.com/trabucko/repo-MedicalHand-2025.git)
    cd repo-MedicalHand-2025
    ```

2.  **Configurar y ejecutar el Backend**

    - Navega a la carpeta del servidor.
      ```bash
      cd servidor
      ```
    - Instala las dependencias.
      ```bash
      npm install
      ```
    - Crea un archivo llamado `.env` en la raíz de la carpeta `servidor` y añade las siguientes variables:
      ```env
      PORT=4000
      NODE_ENV=development
      CORS_ORIGIN=http://localhost:5173
      ```
    - **Importante:** Deberás configurar tus credenciales de servicio de Firebase. Descarga el archivo JSON de tu cuenta de servicio desde la consola de Firebase y guárdalo en la carpeta `servidor`. Asegúrate de referenciarlo correctamente en tu configuración de `firebase-admin`.

    - Inicia el servidor.
      `bash
node .\src\index.js
`
      El servidor backend se ejecutará en `http://localhost:4000`.

3.  **Configurar y ejecutar el Frontend**

    - Abre una **nueva terminal** y navega a la carpeta del cliente.
      ```bash
      cd cliente
      ```
    - Instala las dependencias.
      ```bash
      npm install
      ```
    - **Importante:** Asegúrate de tener tu configuración de Firebase (API Key, Auth Domain, etc.) en un archivo de configuración accesible para tu aplicación de React (normalmente en un archivo como `firebase.js`).

    - Inicia la aplicación de desarrollo.
      `bash
npm run dev
`
      La aplicación frontend se ejecutará en `http://localhost:5173`.

---

## Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar el proyecto, por favor sigue estos pasos:

1.  Haz un "Fork" del repositorio.
2.  Crea una nueva rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`).
3.  Haz "Commit" de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Haz "Push" a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un "Pull Request".

---

## Licencia

Este proyecto está bajo la licencia **MIT**. Puedes usarlo y adaptarlo libremente, aunque no ofrezco garantía de ningún tipo.
