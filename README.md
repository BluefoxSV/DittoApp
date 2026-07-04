# Super DittoApp Aplicacion/Jobcrafter/Micraft

SuperDittoApp/Jobcrafter/Micraft es una plataforma para impulsar el empleo informal y a su vez capacitar a las personas en nuevos ambitos de trabajo. La plataforma de aprendizaje también cuenta con cursos para facilitar la educación financiera para personas sin experiencia que quieran empezar a generar ingresos.

## Características de la aplicación:
- Es una plataforma web PWA
- La apliación distingue entre trabajadores y usuarios que buscan un servicio específico. (Roles)
- La plataforma solo admite trabajos que requieran hablidad técnica (no especializada) o roles informales.

## Características de negocio:
- El trabajador puede crear su perfil de trabajador incluyendo experiencia, perfil, fotografias del trabajo, información de contacto, lecciones completadas dentro de la aplicación.
- El trabajador puede enlistarse en la lista de cursos de la plataforma que incluyen videos, diapositivas y programas para aprender hablidades.
- El trabajdor debe estar verificado con experiencia comprobada
- El trabajdor va a estar dentro de un sistema de clasificación que se comprueba según su nivel de conocimiento basado en un cuestionario inicial y sus certificaciones/experiencia.
- El usuario y el trabajador se van a comunicar directamente dentro del chat de plataforma.
- Se va a dar seguimiento por Whatsapp al trabajador sobre los cursos que ha tomado, tiene pendientes o se ha enlistado.
- El seguimiento del usuario va a ser del servicio que está recibiendo de un trabajdor, cuanto se termine el servicio, envío de formulario de satisfacción, etc.

## Diseño de la plataforma
- Login
- Registro. Se pueden registrar usuario, trabajadores, y soporte.
- Inicio. La pantalla de inicio será un chat conectado a IA donde el usuario va a escribir sus necesidades o su problema y en base a los trabajadoes en la base de datos la IA va a sugerir trabajadores. La pantalla de inicio debe ser diferente para el usuario registrado y para el usuario no registrado.
- Pantalla de terminos y condiciones donde el usuario acepte compartir su información siguiendo estandares de calidad y privacidad de la plataforma.
- Inicio de trabajadores. Va a ser un dashboard que muestre su hisorial de cursos y aprendizaje y las personas que han solicitado sus servicios.
- Perfil de usuario. El usuario puede ingresar datos de contacto e información personal para facilitar la busqueda de servicios.
- Perfil de trabajdor. El trabajador puede agregar experiencia, historial académico e información personal y de contacto para hacer más fácil de encontrar su perfil para los usuarios.
- Lista de cursos. El trabajador puede elegir un curso, enlistarse en él y ver el resumen y contenido del curso.
- Visor de curso. El trabajador puede ver las diapositivas, videos y lecciones necesarias para completar el curso y agregarlo a su perfil.

## Limitaciones de proyecto.
- DB = postgress
- BE = FASTAPI
- FE = REACT JS

- BotWA = GoWA (Unir flujo con n8n) (Agentes de seguimiento)\

- Interfaz grafica debe de estar en MATERIAL UI

- Combinar con TAILWIND

## Estructura del proyecto.

DittoApp/
├── public/
│
├── src/
│   ├── assets/
│   │   └── Imágenes, iconografía y archivos visuales que serán renderizados en el Frontend.
│   │
│   ├── components/
│   │   └── Componentes reutilizables de la plataforma:
│   │       ├── Dashboard/
│   │       ├── Login/
│   │       ├── Signup/
│   │       ├── Data/
│   │       └── Otros componentes generales.
│   │
│   ├── pages/
│   │   └── Páginas principales donde se renderizan los componentes.
│   │
│   ├── services/
│   │   └── Lógica JavaScript para manejar respuestas, peticiones y procesos usados por las páginas.
│   │
│   ├── styles/
│   │   └── Archivos CSS generales del proyecto.
│   │
│   ├── App.jsx
│   │   └── Enrutador principal del proyecto. Define las páginas mostrables.
│   │
│   ├── index.css
│   │   └── Archivo que invoca TailwindCSS y estilos globales del proyecto.
│   │
│   └── main.jsx
│       └── Archivo principal que crea el root de React.OR ROOT)
