#!/bin/sh
set -e

echo "⏳ Aplicando migraciones..."
python manage.py migrate --noinput

echo "🌱 Cargando datos de prueba..."
python manage.py seed_db

echo "👤 Creando superusuario admin (si no existe)..."
python manage.py createsuperuser --noinput \
  --username "${DJANGO_SUPERUSER_USERNAME:-admin}" \
  --email "${DJANGO_SUPERUSER_EMAIL:-admin@warhammer.galaxy}" \
  2>/dev/null || echo "ℹ️  El superusuario ya existe, omitiendo."

echo "🚀 Iniciando servidor Django en :8000"
exec python manage.py runserver 0.0.0.0:8000
