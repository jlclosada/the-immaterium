# THE IMMATERIUM - Resumen de Cambios y Credenciales

## 📋 Credenciales de Acceso

### Panel de Administración
- **URL**: `https://tu-dominio.com/admin` o `http://localhost:5173/login`
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Base de Datos (Neon PostgreSQL)
- **Host**: ep-patient-credit-agjdrh9e-pooler.c-2.eu-central-1.aws.neon.tech
- **Database**: neondb
- **User**: neondb_owner
- **Password**: npg_BZ7lLHqAdK2Y
- **Port**: 5432

---

## ✅ Cambios Realizados

### 1. **Eliminación de Sección de Galaxia**
- ❌ Eliminada ruta `/galaxy` de `App.jsx`
- ❌ Eliminada tarjeta "GALAXIA" del menú principal en `LandingPage.jsx`
- ❌ Eliminado enlace "Galaxia" del footer

### 2. **Featured Intel con Datos Reales**
- ✅ La sección "Contenido Destacado" ahora carga datos reales del backend
- ✅ Muestra el primer ejército, guía y reporte de batalla de la base de datos
- ✅ Enlaces dinámicos a las páginas de detalle correspondientes

### 3. **Footer Mejorado**
- ❌ Eliminados enlaces a Discord y Foro
- ✅ Agregado enlace a "Biblioteca de Lore"
- ✅ Agregado enlace externo a Warhammer Community
- ✅ Secciones reorganizadas: "NAVEGACIÓN" y "RECURSOS"

### 4. **Página de Detalle de Ejércitos Mejorada**
- ❌ **Eliminadas** secciones de "Tipo" y "Color" (no son relevantes)
- ✅ **Agregada** barra de búsqueda para filtrar imágenes por nombre
- ✅ **Agregado** contador de imágenes
- ✅ **Implementado** ordenamiento: imágenes favoritas primero
- ✅ **Agregado** modal de imagen en tamaño completo al hacer clic
- ✅ **Mejorada** sección de Historia con mejor diseño
- ✅ **Responsive** completo para móviles

### 5. **Sistema de Imágenes Favoritas**
- ✅ El admin puede marcar imágenes como favoritas desde Django Admin
- ✅ Las imágenes favoritas se muestran primero en la galería
- ✅ Indicador visual (⭐) para imágenes favoritas
- ✅ Campo `is_favorite` añadido al modelo `ArmyImage`

### 6. **Iconos de Facciones Corregidos**
- ✅ Los iconos en la página de guías ahora usan `object-fit: contain`
- ✅ Tamaño aumentado de 14px a 18px para mejor visibilidad
- ✅ No se deforman ni se achat an

### 7. **Nueva Funcionalidad: Biblioteca de Lore**
#### Backend:
- ✅ Nuevo modelo `LoreEntry` en `models.py`
- ✅ Serializer `LoreEntrySerializer` 
- ✅ ViewSet `LoreEntryViewSet` con operaciones CRUD
- ✅ Endpoint `/api/lore/` registrado
- ✅ Admin de Django configurado para gestionar Lore

#### Frontend:
- ✅ Nueva página `/lore` - `LorePage.jsx`
- ✅ Componente admin `LoreManager.jsx` para crear/editar entradas
- ✅ API methods en `api.js`:
  - `getLoreEntries()`
  - `getLoreEntry(id)`
  - `createLoreEntry(data, token)`
  - `updateLoreEntry(id, data, token)`
  - `deleteLoreEntry(id, token)`
- ✅ Filtrado por categoría y búsqueda
- ✅ Sistema de etiquetas (tags)
- ✅ Entradas destacadas
- ✅ Relación con facciones

#### Categorías de Lore:
- Historia
- Facción
- Evento
- Personaje
- Lugar
- Tecnología
- Otro

### 8. **Mejoras de Responsividad Móvil**
- ✅ Media queries en `index.css` para 768px, 480px y 640px
- ✅ `clamp()` para tamaños de fuente adaptativos
- ✅ Grids que se convierten en columna única en móviles
- ✅ Touch targets mínimos de 44px
- ✅ Glass panels más compactos en móvil
- ✅ Mejor padding y espaciado responsivo

---

## 🗂️ Estructura de Modelos

### ArmyImage (actualizado)
```python
- id: CharField (PK)
- army: ForeignKey(Army)
- url: URLField
- name: CharField
- is_favorite: BooleanField  # ⭐ NUEVO
- created_at: DateTimeField
```

### LoreEntry (nuevo)
```python
- id: CharField (PK)
- title: CharField
- category: CharField (choices)
- content: TextField
- excerpt: CharField
- related_faction: ForeignKey(Army, null=True)
- tags: ArrayField
- author: CharField
- date_created: DateField
- is_featured: BooleanField
- views: IntegerField
- created_at: DateTimeField
- updated_at: DateTimeField
```

---

## 📂 Archivos Modificados

### Backend:
1. `/backend/api/models.py` - Agregado `LoreEntry`
2. `/backend/api/serializers.py` - Agregado `LoreEntrySerializer`, actualizado `ArmyImageSerializer`
3. `/backend/api/views.py` - Agregado `LoreEntryViewSet`
4. `/backend/api/urls.py` - Registrado router de lore
5. `/backend/api/admin.py` - Agregado admin para `LoreEntry` y actualizado `ArmyImageInline`
6. `/backend/api/migrations/0007_loreentry.py` - Nueva migración

### Frontend:
1. `/src/App.jsx` - Agregadas rutas de Lore
2. `/src/pages/LandingPage.jsx` - Featured Intel dinámico, sin galaxia
3. `/src/pages/ArmyDetailPage.jsx` - Búsqueda, contador, modal, favoritas
4. `/src/pages/LorePage.jsx` - **NUEVO**
5. `/src/pages/GuidesPage.jsx` - Iconos corregidos
6. `/src/components/UI/Footer.jsx` - Enlaces actualizados
7. `/src/components/Admin/LoreManager.jsx` - **NUEVO**
8. `/src/layouts/AdminLayout.jsx` - Agregado enlace a Lore
9. `/src/services/api.js` - Agregados métodos de Lore
10. `/src/styles/index.css` - Media queries para móviles

---

## 🚀 Próximos Pasos para Despliegue

### 1. Aplicar Migraciones en Producción
```bash
cd backend
python manage.py migrate
```

### 2. Crear Superusuario (si no existe)
```bash
python manage.py shell
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
```

### 3. Compilar Frontend
```bash
npm run build
```

### 4. Variables de Entorno (Render/Netlify)
Asegúrate de que estas variables estén configuradas:
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`
- `SECRET_KEY`
- `DEBUG=False`

---

## 📱 Funcionalidades para Admin

### Panel de Administración (`/admin`)
1. **Armies**: Gestionar ejércitos y marcar imágenes como favoritas
2. **Guides**: Crear/editar guías de pintura
3. **Reports**: Gestionar reportes de batalla
4. **Lore**: ⭐ **NUEVO** - Crear fragmentos de historia

### Marcar Imágenes como Favoritas
1. Ir a Django Admin `/admin`
2. Seleccionar Army > Ver ejército
3. En la sección de imágenes inline, marcar checkbox "is_favorite"
4. Las imágenes favoritas aparecerán primero en la galería pública

---

## 🎨 Características de UX

### Página de Ejércitos
- ✅ Modal de imagen a tamaño completo
- ✅ Búsqueda en tiempo real
- ✅ Contador de imágenes
- ✅ Favoritas destacadas con ⭐
- ✅ Historia con formato mejorado

### Biblioteca de Lore
- ✅ Filtrado por 7 categorías
- ✅ Búsqueda en título y contenido
- ✅ Entradas destacadas
- ✅ Relación con facciones
- ✅ Sistema de etiquetas
- ✅ Contador de vistas

---

## ✨ Notas Adicionales

- Todas las traducciones están en español
- El diseño es completamente responsive
- Las credenciales por defecto son `admin`/`admin123` - **cambiarlas en producción**
- La migración 0007 debe aplicarse antes de usar la funcionalidad de Lore
- Los iconos de facciones ahora se ven correctamente sin deformarse

---

**Fecha de actualización**: 18 de Febrero de 2026
**Versión**: 2.3

