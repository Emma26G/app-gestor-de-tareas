# Ejercicio Gestor de Tareas 

Sistema de gestión de tareas construida con Next.js, MongoDB y TailwindCSS.

## Tecnologias

- **Next.js 14** 
- **Node.js 20.12.2**
- **MongoDB** 
- **TailwindCSS** 
- **TypeScript**

## 📋 Requisitos Previos

- Node.js v20.12.2
- MongoDB 

## 🔧 Instalación

### Paso 1: Clonar e instalar dependencias

```bash
# Instalar dependencias
npm install
```

### Paso 2: Configurar MongoDB con Docker

**⚠️ IMPORTANTE:**  tener Docker instalado.

Ejecuta el siguiente comando para iniciar MongoDB en un contenedor Docker:

```bash
docker run -d --name mongo_db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  -p 27017:27017 \
  -v mongodata:/data/db \
  mongo:7
```


### Paso 3: Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
MONGODB_URI=mongodb://admin:admin123@localhost:27017/gestor-tareas?authSource=admin
```

### Paso 4: Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Verificar que MongoDB está corriendo

```bash
docker ps
```

**Identificación de Usuario:**
La API identifica al usuario mediante el header `x-user-id` con el ObjectId del usuario.

## Sistema de Usuarios

Los usuarios se almacenan en MongoDB. Para inicializar los usuarios base, ejecuta:

```bash
curl -X POST http://localhost:3000/api/users/init
```
Si da conflictos, usar postman o thunder client
## 📁 Estructura del Proyecto

```
gestor-de-tareas-bap/
├── app/
│   ├── api/
│   │   └── tasks/        # API Routes
│   ├── components/        # Componentes reutilizables
│   ├── lib/              # Utilidades y configuración
│   └── page.tsx          # Página principal
├── components/           # Componentes globales
└── models/              # Modelos de Mongoose
```

## API Endpoints

**Endpoints :**
- `GET /api/tasks` - Lista todas las tareas del usuario
- `GET /api/tasks/:id` - Obtiene el detalle de una tarea
- `POST /api/tasks` - Crea una nueva tarea
- `PUT /api/tasks/:id` - Actualiza una tarea
- `DELETE /api/tasks/:id` - Elimina una tarea


### Campos de Tarea

Cada tarea incluye:
- **Título** (obligatorio)
- **Descripción** (obligatorio)
- **Estatus de progreso** (obligatorio): pendiente, en-progreso, completada
- **Fecha de Entrega** (obligatorio)
- **Comentarios** (opcional)
- **Responsable** (opcional)
- **Tags** (opcional): array de strings
- **Usuario** (automático): referencia ObjectId al usuario propietario

## 🏗️ Estructura del Proyecto

```
gestor-de-tareas-bap/
├── app/
│   ├── api/
│   │   └── tasks/              # API Routes (REST endpoints)
│   │       ├── route.ts        # GET /api/tasks, POST /api/tasks
│   │       └── [id]/
│   │           └── route.ts    # GET/PUT/DELETE /api/tasks/:id
│   ├── components/             # Componentes React reutilizables
│   │   ├── TaskCard.tsx        # Card para mostrar tareas
│   │   ├── TaskForm.tsx        # Formulario de creación/edición
│   │   └── UserSelector.tsx    # Selector de usuario simulado
│   ├── tasks/                 # Páginas de tareas
│   │   ├── new/               # Crear nueva tarea
│   │   └── [id]/              # Ver/editar tarea específica
│   ├── globals.css            # Estilos globales con TailwindCSS
│   ├── layout.tsx             # Layout principal
│   └── page.tsx               # Página principal (lista de tareas)
├── lib/                       # Utilidades y configuración
│   ├── api.ts                 # Cliente API para llamadas HTTP
│   ├── utils.ts               # Funciones utilitarias
│   └── mongodb.ts             # Configuración de conexión MongoDB
├── models/                    # Modelos de Mongoose
│   ├── Task.ts                # Modelo de Tarea
│   └── User.ts                # Modelo de Usuario
└── README.md                  # Este archivo
```

## 📦 Tecnologías Utilizadas

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **TailwindCSS** - Framework de CSS utility-first
- **Docker** - Contenedorización de MongoDB
