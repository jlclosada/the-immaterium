#!/usr/bin/env python3
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'warhammer_backend.settings')
django.setup()

from django.core.management import call_command

print("🔄 Ejecutando migraciones...")
try:
    call_command('migrate', verbosity=2)
    print("✅ Migraciones aplicadas exitosamente!")
except Exception as e:
    print(f"❌ Error al aplicar migraciones: {e}")
    import traceback
    traceback.print_exc()

