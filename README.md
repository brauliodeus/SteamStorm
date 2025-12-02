# SteamStorm - Plataforma de Reseñas y Gestión de Videojuegos

![Estado](https://img.shields.io/badge/Estado-Finalizado-success?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-v20+-green?style=for-the-badge&logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Cloud-blue?style=for-the-badge&logo=postgresql)
![License](https://img.shields.io/badge/Licencia-MIT-orange?style=for-the-badge)

**SteamStorm** es una aplicación web Full Stack diseñada para centralizar el descubrimiento de videojuegos. Permite a los usuarios consultar datos en tiempo real, gestionar una lista de deseados (Wishlist) personalizada y compartir reseñas con la comunidad.

La aplicación cuenta con una **arquitectura híbrida resiliente**: si la API externa de Steam falla o bloquea la conexión, el sistema conmuta automáticamente a un respaldo local, garantizando que la página nunca deje de funcionar.

---

## 🚀 Características Principales

* **🔐 Autenticación Segura:** Registro e Inicio de Sesión mediante **JWT** (JSON Web Tokens) y contraseñas encriptadas con **Bcrypt**.
* **🎮 Catálogo Híbrido:** Obtención de datos vía **Steam Web API** con sistema de respaldo automático (Fallback) para evitar caídas por bloqueo de IP.
* **❤️ Lista de Deseados:** Los usuarios pueden guardar y eliminar juegos de su colección personal (Persistencia en Base de Datos).
* **💬 Sistema de Reseñas:** Comentarios y puntuaciones en tiempo real.
* **👍 Sistema de Likes:** Votación de reseñas con validación para evitar duplicados.
* **🛡️ Panel de Administración:** Rol de "Admin" con permisos especiales para moderar (eliminar) comentarios inapropiados.

---

## 🛠️ Herramientas y Tecnologías (Stack)

El proyecto utiliza una arquitectura desacoplada (Frontend separado del Backend).

### Frontend (Cliente)
* **HTML5:** Estructura semántica.
* **CSS3:** Diseño responsivo (Mobile-first), Grid y Flexbox. Estilos personalizados tipo "Dark Gaming".
* **JavaScript (Vanilla):** Lógica del cliente, manejo del DOM y consumo de API REST.

### Backend (Servidor)
* **Node.js:** Entorno de ejecución.
* **Express.js:** Framework para el servidor y manejo de rutas.
* **pg (node-postgres):** Cliente para conectar con la base de datos.
* **CORS:** Gestión de permisos de acceso entre dominios.
* **Dotenv:** Manejo de variables de entorno seguras.

### Base de Datos
* **PostgreSQL:** Base de datos relacional alojada en la nube (Render).

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para correr el proyecto en tu computadora local.

### 1. Prerrequisitos
Asegúrate de tener instalado:
* [Node.js](https://nodejs.org/) (v18 o superior).
* [Git](https://git-scm.com/).
* Un editor de código (VS Code recomendado).

### 2. Clonar el Repositorio
```bash
git clone https://github.com/brauliodeus/SteamStorm.git
cd SteamStorm
```
### 3. Instalar Dependencias del Backend
```bash
cd Backend
npm install # Esto instalará automáticamente: express,pg,cors,dotenv,bcryptjs,jsonwebtoken y node-fetch
```
### 4. Configurar Variables de Entorno (.env)
```bash
# Debes crear un archivo llamado .env dentro de la carpeta Backend/ y pegar lo siguiente:
# Puerto del servidor
PORT=3000

# Clave secreta para firmar los tokens (Inventa una larga y segura)
JWT_SECRET=clave_jwt_secreta_segura

# Conexión a la Base de Datos (Usa la URL Externa de Render si pruebas en local)
DATABASE_URL=postgres://usuario:password@host.render.com/nombre_db

# (Opcional) Tu API Key de Steam para mejorar la estabilidad
STEAM_API_KEY=api_key_de_steam_aqui
```
### Como iniciar el proyecto:
Paso 1: Encender el Backend (Servidor)
```bash
node server.js
# Deberias ver un mensaje: 🚀 Servidor listo en (port)
```
### Estructura del proyecto
```bash
SteamStorm/
├── Backend/                # Lógica del Servidor
│   ├── server.js           # Punto de entrada (API, Rutas)
│   ├── auth.js             # Rutas de Autenticación
│   ├── db.js               # Conexión a PostgreSQL
│   ├── middleware.js       # Protección de rutas Admin
│   └── package.json        # Lista de dependencias
│
├── CSS/                    # Estilos
│   ├── style_inicio.css    # Estilos principales y Grid
│   └── style_detalle.css   # Estilos para la vista de juego
│
├── Scripts/                # Lógica del Cliente
│   ├── steamgames.js       # Carga de juegos (Híbrida: API/Local)
│   ├── datos_backup.js     # Base de datos local de respaldo
│   ├── script_detalle.js   # Lógica de reseñas y wishlist
│   └── script_wishlist.js  # Lógica de la página de favoritos
│
├── User/                   # Páginas privadas (Requieren Login)
└── Guest/                  # Páginas públicas
```
### Proyecto desarrollado para la Universidad Católica de Temuco.

Luis Cerda - Desarrollador Full Stack

Braulio Palma - Desarrollador Backend

Carlos Sepúlveda - Tester y coordinador
