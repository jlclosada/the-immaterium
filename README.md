# 🌌 Warhammer Galaxy Portal

> Portal de comunidad para jugadores de **Warhammer 40.000** con guías de pintura, informes de batalla, lore enciclopédico y noticias del hobby.

---

## 📋 Índice

1. [Características](#-características)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitectura](#-arquitectura)
4. [Inicio Rápido con Docker](#-inicio-rápido-con-docker-recomendado)
5. [Desarrollo Local sin Docker](#-desarrollo-local-sin-docker)
6. [Variables de Entorno](#-variables-de-entorno)
7. [Datos de Prueba](#-datos-de-prueba)
8. [Estructura del Proyecto](#-estructura-del-proyecto)
9. [API Reference](#-api-reference)
10. [Panel de Administración](#-panel-de-administración)
11. [Despliegue en Producción](#-despliegue-en-producción)
12. [Solución de Problemas](#-solución-de-problemas)

---

## ✨ Características

### ⚔️ Gestión de Ejércitos
- Catálogo de ejércitos con planetas y estadísticas
- Galería de imágenes por ejército
- Historial y trasfondo en español e inglés
- Relación con partidas, guías y entradas de lore

### 🎨 Guías de Pintura
- Guías paso a paso con imágenes, materiales y consejos
- Niveles de dificultad: principiante, intermedio, avanzado
- Sistema de likes y comentarios
- Contador de vistas

### 🏆 Informes de Batalla
- Crónicas narrativas turno a turno
- Puntuación detallada por jugador
- **Importador de listas** desde texto (formato BattleScribe y formato Plus-Box)
- Momentos clave y MVP de la partida

### 📜 Lore del Universo
- Enciclopedia de personajes, eventos, lugares, facciones y tecnología
- Vinculación con ejércitos y facciones
- Entradas destacadas en portada

### 📰 Noticias y Blog
- Sistema de artículos con Markdown
- Portada con últimas noticias, guías e informes
- Etiquetas y búsqueda

### 🛡️ Panel de Administración
- Dashboard con estadísticas globales
- CRUD completo para todas las entidades
- Gestión de usuarios con roles (Admin / Leader)
- Protegido por token de autenticación

---

## 🔧 Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 19 | UI framework |
| Vite | 5 | Build tool / dev server |
| Framer Motion | 12 | Animaciones de página |
| Zustand | 5 | Estado global |
| React Router | 7 | Enrutamiento SPA |

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Python | 3.12 | Runtime |
| Django | 5.0 | Framework web |
| Django REST Framework | 3.16 | API REST |
| django-cors-headers | 4.9 | CORS |
| psycopg2 | 2.9 | Driver PostgreSQL |
| WhiteNoise | 6.8 | Archivos estáticos |
| Gunicorn | 25 | WSGI server (producción) |

### Infraestructura
| Servicio | Uso |
|---------|-----|
| PostgreSQL 16 | Base de datos |
| Docker + Compose | Entorno de desarrollo |
| Render | Despliegue backend en producción |
| Neon | PostgreSQL serverless en producción |
| Cloudinary | Almacenamiento de imágenes |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                         │
│                                                              │
│  React 19 + Vite (:5173)                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │ Armies   │ │  Guides  │ │ Reports  │ │  Admin Panel │  │
│  │ + Lore   │ │  Detail  │ │  Detail  │ │   (CRUD)     │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘  │
│       └────────────┴────────────┴───────────────┘          │
│                          │ /api/* (proxy Vite)              │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                 BACKEND Django REST API (:8000)              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ViewSets: Army │ Guide │ Report │ Lore │ News │ User │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │        Serializers (camelCase ↔ snake_case)          │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────────────┐   │
│  │              Django ORM / Models                      │   │
│  └──────────────────┬───────────────────────────────────┘   │
└─────────────────────┼────────────────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────────────────┐
│  PostgreSQL 16 (Docker local) / Neon serverless (producción) │
│  Games │ Armies │ Guides │ Reports │ Lore │ News │ Users     │
└──────────────────────────────────────────────────────────────┘
```

---

## 🐳 Levantar en Local con Docker

> **Respuesta rápida a las preguntas frecuentes:**
>
> | Pregunta | Respuesta |
> |---------|-----------|
> | ¿Se crea la BD automáticamente? | ✅ Sí. PostgreSQL arranca en un contenedor vacío y Django crea todas las tablas. |
> | ¿Se aplican migraciones automáticamente? | ✅ Sí. El backend ejecuta `migrate` antes de arrancar. |
> | ¿Se pobla con datos de prueba automáticamente? | ✅ Sí. Se ejecuta `seed_db` en cada arranque (borra y recrea los datos). |
> | ¿Se crea el usuario administrador? | ✅ Sí. Usuario `admin` / contraseña `admin1234`. |
> | ¿Al hacer commit a `dev` se migra Neon? | ❌ No automáticamente — ver sección [Despliegue en Producción](#-despliegue-en-producción). |

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x
- Git

### Primera vez (o reset completo)

```bash
# 1. Clona el repositorio
git clone <url-del-repo>
cd warhammer-galaxy

# 2. Levanta todo (construye imágenes, arranca, migra, pobla)
docker compose up --build
```

Cuando veas esto en los logs, **todo está listo**:
```
wg_backend  | ✅ Base de datos cargada con éxito.
wg_backend  | 🚀 Iniciando servidor Django en :8000
wg_frontend | ➜  Local:   http://localhost:5173/
```

### Accesos

| Servicio | URL | Credenciales |
|---------|-----|-------------|
| **Aplicación web** | http://localhost:5173 | — |
| **API REST** | http://localhost:8000/api/ | — |
| **Django Admin** | http://localhost:8000/admin/ | `admin` / `admin1234` |
| **Login App** | http://localhost:5173/login | `admin` / `admin1234` |
| **PostgreSQL** | `localhost:5432` | `wg_user` / `wg_password` / BD: `warhammer_portal` |

### Uso diario (ya construido)

```bash
# Arrancar (sin reconstruir — más rápido)
docker compose up

# Parar
docker compose down
```

### Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver solo logs del backend
docker compose logs -f backend

# Reset completo: borra la BD y vuelve a empezar desde cero
docker compose down -v && docker compose up --build

# Recargar solo los datos de prueba (sin reiniciar)
docker compose exec backend python manage.py seed_db

# Crear una migración nueva (cuando cambias un modelo)
docker compose exec backend python manage.py makemigrations

# Aplicar migraciones pendientes
docker compose exec backend python manage.py migrate

# Abrir consola Django
docker compose exec backend python manage.py shell

# Acceder a la BD directamente con psql
docker compose exec db psql -U wg_user -d warhammer_portal
```

---

## 💻 Desarrollo Local sin Docker

Si prefieres no usar Docker (más rápido para iterar en el frontend, por ejemplo).

### Prerrequisitos

- Python 3.12+
- Node.js 20+
- PostgreSQL 14+ instalado y corriendo
- Git

### 1. Crear la base de datos en PostgreSQL

```sql
-- En la terminal, conéctate como superusuario
psql -U postgres

-- Crear BD y usuario
CREATE DATABASE warhammer_portal;
CREATE USER wg_dev WITH PASSWORD 'wg_dev_password';
GRANT ALL PRIVILEGES ON DATABASE warhammer_portal TO wg_dev;
\q
```

> La BD se crea vacía. Las tablas las crea Django automáticamente con `migrate`.

### 2. Arrancar el backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Edita .env: pon DB_USER=wg_dev, DB_PASSWORD=wg_dev_password, etc.

# Crear tablas en la BD (solo la primera vez, o cuando haya migraciones nuevas)
python manage.py migrate

# Poblar con datos de prueba
python manage.py seed_db

# Crear superusuario admin (solo si no usaste seed_db en Docker)
python manage.py createsuperuser

# Arrancar servidor
python manage.py runserver
# → http://localhost:8000
```

### 3. Arrancar el frontend

```bash
# En otra terminal, desde la raíz del proyecto
npm install          # solo la primera vez
npm run dev
# → http://localhost:5173
```

> **¿Por qué no necesito configurar CORS en local?**
> El `vite.config.js` incluye un proxy que redirige automáticamente todas las peticiones `/api/*` al backend en `localhost:8000`. El navegador nunca hace una petición cross-origin, así que CORS no entra en juego.

---

## 🔐 Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo local |
|---------|-------------|---------------|
| `SECRET_KEY` | Clave secreta Django | `dev-secret-key-local` |
| `DEBUG` | Modo debug | `True` |
| `DB_NAME` | Nombre de la BD | `warhammer_portal` |
| `DB_USER` | Usuario de BD | `wg_dev` |
| `DB_PASSWORD` | Contraseña de BD | `wg_dev_password` |
| `DB_HOST` | Host de BD | `localhost` |
| `DB_PORT` | Puerto de BD | `5432` |
| `DB_SSL_MODE` | SSL para BD | `disable` (local) / `require` (prod) |
| `ALLOWED_HOSTS` | Hosts permitidos | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Orígenes CORS | `http://localhost:5173` |

Copia el ejemplo y edítalo:
```bash
cp backend/.env.example backend/.env
```

---

## 🌱 Datos de Prueba

El comando `seed_db` carga una base de datos completa con contenido de ejemplo para desarrollo:

### Contenido incluido

| Tipo | Cantidad | Descripción |
|------|---------|-------------|
| Juegos | 1 | Warhammer 40.000 |
| Ejércitos | 7 | Mil Hijos, Lobos Espaciales, Marines del Caos, Hijos del Emperador, Tiránidos, Space Marines, Necrón |
| Guías de pintura | 5 | Con materiales y pasos detallados |
| Informes de batalla | 6 | Con narrativa, momentos clave y comentarios |
| Entradas de lore | 6 | Personajes, eventos, lugares, historia |
| Artículos de noticias | 5 | Torneos, lanzamientos, guías de inicio |

### Ejecución

```bash
# Con Docker
docker compose exec backend python manage.py seed_db

# Sin Docker (en el venv activado)
cd backend
python manage.py seed_db
```

> ⚠️ **Advertencia**: `seed_db` **elimina todos los datos existentes** antes de cargar los nuevos. Úsalo solo en desarrollo.

### Credenciales de administrador (Docker)

El entorno Docker crea automáticamente el superusuario:
- **Usuario**: `admin`
- **Contraseña**: `admin1234`

---

## 📁 Estructura del Proyecto

```
warhammer-galaxy/
│
├── 📄 docker-compose.yml          # Entorno de desarrollo completo
├── 📄 Dockerfile.dev              # Frontend (React + Vite) para Docker
├── 📄 package.json                # Dependencias frontend
├── 📄 vite.config.js              # Vite + proxy /api → :8000
├── 📄 index.html                  # Punto de entrada HTML
│
├── 📁 src/                        # Código fuente frontend
│   ├── 📄 App.jsx                 # Componente raíz + rutas
│   ├── 📄 main.jsx                # Punto de entrada React
│   ├── 📁 components/
│   │   ├── 📁 UI/                 # Header, Footer, Nav, etc.
│   │   ├── 📁 Planet/             # Renderizado 3D de planetas
│   │   ├── 📁 Admin/              # ArmyManager, GuideManager, etc.
│   │   ├── 📁 Gallery/            # Galería de imágenes
│   │   ├── 📁 BattleReports/      # Componentes de informes
│   │   └── 📁 Effects/            # Efectos visuales
│   ├── 📁 pages/
│   │   ├── 📄 LandingPage.jsx     # Portada con Featured Intel
│   │   ├── 📄 GalaxyPage.jsx      # Visualización 3D
│   │   ├── 📄 ArmyDetailPage.jsx  # Detalle de ejército
│   │   ├── 📄 GuideDetailPage.jsx # Guía de pintura completa
│   │   ├── 📄 BattleReportDetailPage.jsx
│   │   ├── 📄 LoreDetailPage.jsx
│   │   ├── 📄 NewsDetailPage.jsx
│   │   └── 📁 admin/
│   │       └── 📄 AdminDashboard.jsx
│   ├── 📁 services/
│   │   └── 📄 api.js              # Cliente API centralizado
│   ├── 📁 stores/
│   │   └── 📄 useStore.js         # Estado global (Zustand)
│   └── 📁 utils/
│       └── 📄 armyListParser.js   # Parser de listas de ejército
│
└── 📁 backend/                    # Código fuente backend
    ├── 📄 Dockerfile.dev          # Backend Django para Docker
    ├── 📄 .env.example            # Plantilla de variables de entorno
    ├── 📄 .env.docker             # Variables para entorno Docker
    ├── 📄 requirements.txt        # Dependencias Python
    ├── 📄 manage.py               # CLI de Django
    │
    ├── 📁 warhammer_backend/      # Configuración del proyecto
    │   ├── 📄 settings.py         # Settings (usa python-decouple)
    │   ├── 📄 urls.py             # URL raíz
    │   └── 📄 wsgi.py
    │
    └── 📁 api/                    # Aplicación principal
        ├── 📄 models.py           # Modelos de datos
        ├── 📄 serializers.py      # Serializers DRF
        ├── 📄 views.py            # ViewSets y vistas
        ├── 📄 urls.py             # Rutas de la API
        ├── 📄 admin.py            # Panel de administración
        ├── 📁 migrations/         # Migraciones de BD
        └── 📁 management/
            └── 📁 commands/
                └── 📄 seed_db.py  # Comando de datos de prueba
```

---

## 📡 API Reference

Base URL: `http://localhost:8000/api/`

### Autenticación

```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin1234"
}
```

Respuesta: `{ "token": "abc123...", "user": { "id": 1, "username": "admin", ... } }`

Para rutas protegidas, incluir el header:
```http
Authorization: Token abc123...
```

### Endpoints

#### Ejércitos
| Método | Endpoint | Descripción | Auth |
|--------|---------|-------------|------|
| `GET` | `/api/armies/` | Listar todos los ejércitos | ❌ |
| `GET` | `/api/armies/{id}/` | Detalle de ejército | ❌ |
| `POST` | `/api/armies/` | Crear ejército | ✅ |
| `PATCH` | `/api/armies/{id}/` | Actualizar ejército | ✅ |
| `DELETE` | `/api/armies/{id}/` | Eliminar ejército | ✅ |
| `DELETE` | `/api/armies/{id}/images/{imgId}/` | Eliminar imagen | ✅ |

#### Guías de Pintura
| Método | Endpoint | Descripción | Auth |
|--------|---------|-------------|------|
| `GET` | `/api/guides/` | Listar guías | ❌ |
| `GET` | `/api/guides/{id}/` | Detalle de guía | ❌ |
| `POST` | `/api/guides/` | Crear guía | ✅ |
| `PATCH` | `/api/guides/{id}/` | Actualizar guía | ✅ |
| `DELETE` | `/api/guides/{id}/` | Eliminar guía | ✅ |
| `POST` | `/api/guides/{id}/like/` | Toggle like | ❌ |
| `POST` | `/api/guides/{id}/comment/` | Añadir comentario | ❌ |
| `POST` | `/api/guides/{id}/increment_views/` | Incrementar vistas | ❌ |

#### Informes de Batalla
| Método | Endpoint | Descripción | Auth |
|--------|---------|-------------|------|
| `GET` | `/api/battle-reports/` | Listar informes | ❌ |
| `GET` | `/api/battle-reports/{id}/` | Detalle de informe | ❌ |
| `POST` | `/api/battle-reports/` | Crear informe | ✅ |
| `PATCH` | `/api/battle-reports/{id}/` | Actualizar informe | ✅ |
| `DELETE` | `/api/battle-reports/{id}/` | Eliminar informe | ✅ |
| `POST` | `/api/battle-reports/{id}/like/` | Toggle like | ❌ |
| `POST` | `/api/battle-reports/{id}/comment/` | Añadir comentario | ❌ |

#### Lore
| Método | Endpoint | Descripción | Auth |
|--------|---------|-------------|------|
| `GET` | `/api/lore/` | Listar entradas | ❌ |
| `GET` | `/api/lore/{id}/` | Detalle de entrada | ❌ |
| `POST` | `/api/lore/` | Crear entrada | ✅ |
| `PATCH` | `/api/lore/{id}/` | Actualizar entrada | ✅ |
| `DELETE` | `/api/lore/{id}/` | Eliminar entrada | ✅ |
| `POST` | `/api/lore/{id}/increment_views/` | Incrementar vistas | ❌ |

#### Noticias
| Método | Endpoint | Descripción | Auth |
|--------|---------|-------------|------|
| `GET` | `/api/news/` | Listar artículos | ❌ |
| `GET` | `/api/news/{id}/` | Detalle de artículo | ❌ |
| `POST` | `/api/news/` | Crear artículo | ✅ |
| `PATCH` | `/api/news/{id}/` | Actualizar artículo | ✅ |
| `DELETE` | `/api/news/{id}/` | Eliminar artículo | ✅ |

#### Gestión de Usuarios (solo Admin)
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| `GET` | `/api/users/` | Listar usuarios |
| `POST` | `/api/users/create/` | Crear usuario |
| `DELETE` | `/api/users/{id}/delete/` | Eliminar usuario |
| `POST` | `/api/users/{id}/toggle-active/` | Activar/desactivar |

---

## 🛡️ Panel de Administración

El panel de administración permite gestionar todo el contenido de la aplicación.

### Acceso

1. Abre http://localhost:5173/login
2. Introduce las credenciales de administrador (`admin` / `admin1234` en Docker)
3. Serás redirigido al dashboard de administración

### Secciones

| Sección | Descripción |
|---------|-------------|
| **Dashboard** | Contadores globales (ejércitos, guías, batallas, usuarios) |
| **Ejércitos** | Crear/editar ejércitos, planetas 3D, galería de imágenes |
| **Guías** | Gestionar tutoriales de pintura con pasos y materiales |
| **Informes de Batalla** | Crear crónicas de partidas con importador de listas |
| **Lore** | Enciclopedia del universo Warhammer |
| **Noticias** | Artículos y novedades del portal |
| **Usuarios** | Gestión de roles (Admin / Leader) |

### Django Admin

El admin nativo de Django está disponible en http://localhost:8000/admin/ con el mismo usuario administrador. Proporciona acceso directo a todos los modelos con interfaz más técnica.

---

## 🚀 Despliegue en Producción

El proyecto está configurado para desplegarse en **Render** (backend) + **Neon** (PostgreSQL serverless).

### ❓ ¿Al hacer commit/push a `dev` se migra Neon automáticamente?

**Sí, con condiciones.** El build command de Render incluye `python manage.py migrate --noinput`, así que **cada vez que Render hace un nuevo deploy** (= cada push a la rama conectada), ejecuta las migraciones pendientes automáticamente sobre Neon.

**El flujo completo es:**

```
commit local → push a GitHub (rama dev/main)
       ↓
Render detecta el push y lanza un nuevo deploy
       ↓
Build command: pip install + migrate + collectstatic + sync_bsdata --if-empty
       ↓  (migrate aplica sobre Neon; sync_bsdata solo corre si la BD está vacía)
Start command: gunicorn arranca el servidor
       ↓
Producción actualizada ✅
```

> ⚠️ **Excepción**: Si cambias un modelo de Django pero olvidas crear la migración (`makemigrations`), el `migrate` no tiene nada que aplicar. Siempre que cambies un modelo:
> 1. `python manage.py makemigrations` → genera el archivo de migración
> 2. Haz commit del archivo generado en `backend/api/migrations/`
> 3. Push → Render lo aplica automáticamente en Neon

### Configuración en Neon (Base de Datos)

1. Crea una cuenta en [neon.tech](https://neon.tech)
2. Crea un nuevo proyecto (región: Frankfurt para menor latencia desde Europa)
3. Copia la **connection string** del panel de Neon
4. La URL tiene el formato: `postgresql://user:pass@host/dbname?sslmode=require`

> La BD de Neon empieza vacía. Las tablas las crea Django con `migrate` en el primer deploy.

### Configuración en Render (Backend)

1. Conecta tu repositorio a [render.com](https://render.com)
2. Crea un nuevo **Web Service** con la siguiente configuración:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput && python manage.py sync_bsdata --if-empty` |
| **Start Command** | `gunicorn warhammer_backend.wsgi:application --bind 0.0.0.0:$PORT` |
| **Python Version** | `3.12` |

3. Añade las variables de entorno en el panel de Render:

```
SECRET_KEY=<clave-secreta-larga-y-aleatoria>
DEBUG=False
DB_NAME=<nombre-bd-neon>
DB_USER=<usuario-neon>
DB_PASSWORD=<contraseña-neon>
DB_HOST=<host-neon>
DB_PORT=5432
DB_SSL_MODE=require
ALLOWED_HOSTS=<tu-dominio>.onrender.com
CORS_ALLOWED_ORIGINS=https://<tu-frontend>.netlify.app
```

### Frontend (Netlify / Vercel / Render Static)

```bash
# Build de producción
npm run build

# El directorio dist/ contiene los archivos estáticos para subir
```

> **Nota**: Para que el frontend en producción apunte al backend correcto, crea un archivo `.env.production` con:
> ```
> VITE_API_URL=https://tu-backend.onrender.com
> ```
> Y actualiza `src/services/api.js` para usar `import.meta.env.VITE_API_URL`.

### Aplicar migraciones manualmente en Neon (emergencia)

Solo necesario si algo falla en el deploy automático. Ejecuta el SQL directamente en el editor SQL de Neon:

```sql
-- Ejemplo: añadir una columna que faltó
ALTER TABLE api_battlereport ADD COLUMN IF NOT EXISTS nueva_columna TEXT DEFAULT '';

-- Registrar la migración como aplicada para que Django no la re-intente
INSERT INTO django_migrations (app, name, applied)
VALUES ('api', '0013_nombre_migracion', NOW());
```

---

## 🔍 Solución de Problemas

### Error: `relation "api_xxx" does not exist`
La migración no se ha aplicado. Ejecuta:
```bash
# Docker
docker compose exec backend python manage.py migrate

# Local
python manage.py migrate
```

### Error: `CORS policy blocked`
Asegúrate de que `CORS_ALLOWED_ORIGINS` en el backend incluye el origen de tu frontend:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Error: `column xxx does not exist` en Neon
La migración no se aplicó en la BD remota. Usa el editor SQL de Neon para aplicarla manualmente (ver sección anterior).

### Los datos de prueba no cargan
```bash
# Verifica que la BD esté arriba
docker compose ps

# Ejecuta seed manualmente
docker compose exec backend python manage.py seed_db
```

### El frontend no conecta con el backend
Verifica que el proxy de Vite esté configurado en `vite.config.js`:
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```
Y que el backend esté corriendo en el puerto `8000`.

### El contenedor backend reinicia continuamente
Revisa los logs:
```bash
docker compose logs backend
```
Los errores más comunes son: BD no disponible aún (espera al healthcheck) o variable de entorno faltante.

### Limpiar todo y empezar de cero

```bash
# Para y elimina contenedores, redes y volúmenes
docker compose down -v

# Reconstruye desde cero
docker compose up --build
```

---

## 🤝 Contribuir

1. Crea una rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Haz tus cambios y comprueba que el linter pasa: `npm run lint`
3. Prueba con el entorno Docker
4. Abre un Pull Request describiendo los cambios

### Convenciones de Código

- **Frontend**: camelCase para componentes y funciones, PascalCase para componentes React
- **Backend**: snake_case para modelos y campos, camelCase en los serializers para compatibilidad con el frontend
- **Commits**: mensajes descriptivos en español o inglés, una línea de resumen + descripción opcional

---

## 📄 Licencia

Proyecto privado — uso interno de la comunidad. El lore, miniaturas y marcas de Warhammer 40.000 son propiedad de Games Workshop Ltd.

---

<div align="center">
  <strong>🌌 In the grim darkness of the far future, there is only war... and good miniature painting guides.</strong>
</div>
