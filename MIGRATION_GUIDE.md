# Instrucciones para Aplicar Migraciones

## ✅ Configuración SSL Actualizada

Ya se ha actualizado el archivo `backend/warhammer_backend/settings.py` para incluir SSL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='postgres'),
        'USER': config('DB_USER', default='admin'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'require',  # ⭐ AGREGADO
        },
    }
}
```

## 📝 Pasos para Aplicar Migraciones

### Opción 1: Comando Manual
```bash
cd backend
python3 manage.py migrate
```

### Opción 2: Usando el Script
```bash
cd backend
python3 run_migrate.py
```

## 🔍 Verificar Estado de Migraciones

Para ver qué migraciones están pendientes:
```bash
cd backend
python3 manage.py showmigrations
```

## 📋 Migraciones Incluidas

La migración `0007_loreentry.py` crea el modelo `LoreEntry` con:
- id (CharField, PK)
- title (CharField)
- category (CharField con choices)
- content (TextField)
- excerpt (CharField)
- tags (ArrayField)
- author (CharField)
- date_created (DateTimeField, auto)
- is_featured (BooleanField)
- views (IntegerField)
- created_at (DateTimeField, auto)
- updated_at (DateTimeField, auto)
- related_faction (ForeignKey a Army)

## ⚠️ Solución de Problemas

### Si obtienes error de SSL:
Asegúrate de que el archivo `.env` en `backend/` contenga:
```
DB_HOST=ep-patient-credit-agjdrh9e-pooler.c-2.eu-central-1.aws.neon.tech
DB_NAME=neondb
DB_PASSWORD=npg_BZ7lLHqAdK2Y
DB_PORT=5432
DB_USER=neondb_owner
```

### Si la migración falla:
1. Verifica que `psycopg2` esté instalado:
   ```bash
   pip3 install psycopg2-binary
   ```

2. Verifica la conexión:
   ```bash
   python3 manage.py check
   ```

3. Ver logs detallados:
   ```bash
   python3 manage.py migrate --verbosity 3
   ```

## 🚀 Después de Migrar

### Crear Superusuario (si no existe)
```bash
python3 manage.py shell
```

Luego en el shell de Python:
```python
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("✅ Superusuario creado")
else:
    print("ℹ️ Superusuario ya existe")
exit()
```

### Iniciar Servidor de Desarrollo
```bash
python3 manage.py runserver
```

### Acceder al Admin
1. Ir a `http://localhost:8000/admin`
2. Usuario: `admin`
3. Contraseña: `admin123`

## 📦 Dependencias Necesarias

Asegúrate de tener instaladas las dependencias:
```bash
pip3 install -r requirements.txt
```

Si falta algo, instala manualmente:
```bash
pip3 install django djangorestframework django-cors-headers psycopg2-binary python-decouple
```

## 🎯 Próximos Pasos

Una vez que las migraciones se apliquen exitosamente:

1. ✅ El modelo `LoreEntry` estará disponible en la base de datos
2. ✅ Podrás acceder a `/admin/api/loreentry/` en Django Admin
3. ✅ La API `/api/lore/` estará funcional
4. ✅ El frontend podrá crear/editar/eliminar entradas de Lore

## 📱 Marcar Imágenes como Favoritas

Para marcar imágenes como favoritas:
1. Ir a Django Admin: `http://localhost:8000/admin`
2. Seleccionar "Armies"
3. Editar un ejército
4. En la sección de imágenes inline (abajo), marcar el checkbox "is_favorite"
5. Guardar

Las imágenes marcadas como favoritas aparecerán primero en la galería pública.

