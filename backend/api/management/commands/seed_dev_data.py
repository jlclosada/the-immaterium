"""
Management command: seed_dev_data
Crea datos de ejemplo para desarrollo local.

Uso:
    cd backend && python manage.py seed_dev_data
    python manage.py seed_dev_data --reset  # borra antes de crear
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from api.models import UserProfile, PaintingGuide, Army


class Command(BaseCommand):
    help = 'Crea usuarios y datos de ejemplo para desarrollo local'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Elimina usuarios de prueba antes de crear')

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write('🗑  Eliminando datos de prueba...')
            User.objects.filter(email__endswith='@test.local').delete()

        self.stdout.write('\n🔧 Creando usuarios de desarrollo...\n')

        users_data = [
            {
                'username': 'admin_dev',
                'email': 'admin@test.local',
                'password': 'admin1234',
                'first_name': 'Admin',
                'last_name': 'Dev',
                'is_staff': True,
                'is_superuser': True,
                'profile': {
                    'bio': 'Administrador del sistema.',
                    'favorite_faction': 'imperial_guard',
                    'is_premium': True,
                },
            },
            {
                'username': 'usuario_normal',
                'email': 'user@test.local',
                'password': 'user1234',
                'first_name': 'José',
                'last_name': 'Cáceres',
                'is_staff': False,
                'profile': {
                    'bio': 'Fan de los Space Marines desde 2010. Pintor aficionado.',
                    'favorite_faction': 'space_marines',
                    'player_types': 'painter,gamer',
                    'avatar_url': 'https://api.dicebear.com/8.x/bottts/svg?seed=marine&backgroundColor=1a1a2e',
                },
            },
            {
                'username': 'premium_user',
                'email': 'premium@test.local',
                'password': 'premium1234',
                'first_name': 'María',
                'last_name': 'García',
                'is_staff': False,
                'profile': {
                    'bio': 'Pintora profesional. Especialista en Necrones y Tau.',
                    'favorite_faction': 'necrons',
                    'player_types': 'painter,collector,lore',
                    'is_premium': True,
                    'avatar_url': 'https://api.dicebear.com/8.x/bottts/svg?seed=necron&backgroundColor=001a0d',
                },
            },
        ]

        created = []
        for ud in users_data:
            profile_data = ud.pop('profile', {})
            email = ud['email']

            if User.objects.filter(email=email).exists():
                self.stdout.write(f'  ⚠  Usuario {email} ya existe, omitiendo.')
                continue

            user = User.objects.create_user(**ud)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            for k, v in profile_data.items():
                setattr(profile, k, v)
            profile.save()

            token, _ = Token.objects.get_or_create(user=user)
            created.append((user, token))

            role = '👑 ADMIN' if user.is_superuser else ('⭐ Premium' if profile.is_premium else '👤 Normal')
            self.stdout.write(f'  ✅  {role} {email} / {ud["password"]}')
            self.stdout.write(f'      Token: {token.key[:20]}...\n')

        self.stdout.write('\n' + '─' * 55)
        self.stdout.write('📋  RESUMEN DE CREDENCIALES DE DESARROLLO:\n')
        self.stdout.write('  Admin:   admin@test.local    / admin1234')
        self.stdout.write('  Usuario: user@test.local     / user1234')
        self.stdout.write('  Premium: premium@test.local  / premium1234')
        self.stdout.write('─' * 55)
        self.stdout.write('\n✨  ¡Datos de desarrollo listos!\n')
