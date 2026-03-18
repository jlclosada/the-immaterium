"""
seed_db.py – Datos de prueba para desarrollo local.

Crea:
  · 1 juego (Warhammer 40.000)
  · 7 ejércitos con imágenes
  · 5 guías de pintura con materiales y pasos detallados
  · 6 informes de batalla con narrativa y momentos clave
  · 6 entradas de lore (varias categorías)
  · 5 artículos de noticias
  · Comentarios de ejemplo

Uso:
  python manage.py seed_db
  python manage.py seed_db --keep-superusers
"""
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_date
from django.utils import timezone
from api.models import (
    Game, Army, ArmyImage, PaintingGuide, GuideMaterial, GuideStep,
    BattleReport, BattleNarrative, Comment, NewsArticle, LoreEntry,
)


class Command(BaseCommand):
    help = 'Carga la base de datos con datos de prueba para desarrollo local'

    def add_arguments(self, parser):
        parser.add_argument(
            '--keep-superusers',
            action='store_true',
            help='No eliminar los superusuarios existentes',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🧹 Limpiando datos existentes...'))
        self._clear_data()

        self.stdout.write('🎮 Creando juegos...')
        game = self._create_game()

        self.stdout.write('⚔️  Creando ejércitos...')
        armies = self._create_armies(game)

        self.stdout.write('🎨 Creando guías de pintura...')
        self._create_guides(armies)

        self.stdout.write('🏆 Creando informes de batalla...')
        self._create_battle_reports(armies)

        self.stdout.write('📜 Creando entradas de lore...')
        self._create_lore(armies)

        self.stdout.write('📰 Creando artículos de noticias...')
        self._create_news()

        self.stdout.write(self.style.SUCCESS(
            '\n✅ Base de datos cargada con éxito.\n'
            '   Admin: http://localhost:8000/admin/\n'
            '   API:   http://localhost:8000/api/\n'
            '   App:   http://localhost:5173/\n'
        ))

    # -------------------------------------------------------------------------
    # Limpieza
    # -------------------------------------------------------------------------
    def _clear_data(self):
        Comment.objects.all().delete()
        BattleNarrative.objects.all().delete()
        BattleReport.objects.all().delete()
        GuideStep.objects.all().delete()
        GuideMaterial.objects.all().delete()
        PaintingGuide.objects.all().delete()
        LoreEntry.objects.all().delete()
        NewsArticle.objects.all().delete()
        ArmyImage.objects.all().delete()
        Army.objects.all().delete()
        Game.objects.all().delete()

    # -------------------------------------------------------------------------
    # Juego
    # -------------------------------------------------------------------------
    def _create_game(self):
        game = Game.objects.create(
            id='warhammer-40k',
            name='Warhammer 40.000',
            slug='warhammer-40k',
            description='En el oscuro futuro del siglo XLI, solo hay guerra. '
                        'Ejércitos de space marines, xenos y demonios luchan '
                        'por el control de una galaxia en llamas.',
            icon_url='https://res.cloudinary.com/dra0ogivp/image/upload/v1770764577/94c93baf-9937-4774-b6d2-f418129a1d61.png',
            accent_color='#00d4ff',
            secondary_color='#7b2fff',
            theme='sci-fi',
            order=1,
            is_active=True,
        )
        return game

    # -------------------------------------------------------------------------
    # Ejércitos
    # -------------------------------------------------------------------------
    def _create_armies(self, game):
        armies_data = [
            {
                'id': 'thousand-sons',
                'name': 'Thousand Sons',
                'name_es': 'Mil Hijos',
                'color': '#00ced1',
                'emissive': '#ffffff',
                'position': [0, 5, 0],
                'size': 2.8,
                'description': 'Todo es polvo',
                'description_es': 'Hechiceros condenados, ecos de un Imperio perdido',
                'history': (
                    'Los favoritos de Tzeentch, dios del cambio y la hechicería. '
                    'Antiguamente buscaban el saber para iluminar a la humanidad; '
                    'ahora son hechiceros condenados, muchos reducidos a armaduras '
                    'llenas de polvo por la Rubrica de Ahriman. Manipulan el destino, '
                    'el tiempo y la disformidad como armas.'
                ),
                'history_es': (
                    'Los Mil Hijos fueron la XV Legión de Astartes, campeones de la '
                    'magia y el conocimiento. La Rubrica de Ahriman, en un intento de '
                    'salvar a sus hermanos de la mutación, los transformó en polvo '
                    'animado atrapado en sus propias armaduras.'
                ),
                'planet_type': 'lightning',
                'planet_name': 'Sortiarius, el Planeta de los Hechiceros',
                'icon_url': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770764577/94c93baf-9937-4774-b6d2-f418129a1d61.png',
                'images': [
                    {'id': 'ts1', 'url': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770766299/08967B69-588A-4E51-97A3-F745806D3E86_1_105_c_mbsgwz.jpg', 'name': 'Thousand Sons Patrol'},
                    {'id': 'ts2', 'url': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770766517/31AF883F-DFAE-42AF-9AA5-A3F7E2C456F4_4_5005_c_oilqdq.jpg', 'name': 'Rubric Marine #1'},
                ],
            },
            {
                'id': 'space-wolves',
                'name': 'Space Wolves',
                'name_es': 'Lobos Espaciales',
                'color': '#e0ffff',
                'emissive': '#aaddff',
                'position': [-14, 10, -6],
                'size': 2.6,
                'description': '¡Por Russ y El Padre de todas las cosas!',
                'description_es': 'Los hijos salvajes de Leman Russ',
                'history': (
                    'Salvajes, honorables y letales. Los hijos de Leman Russ combinan '
                    'ferocidad tribal con lealtad absoluta al Emperador. Desprecian la '
                    'cobardía y aman la batalla directa. Cazadores natos, luchan como '
                    'lobos: en manada, implacables y orgullosos.'
                ),
                'history_es': (
                    'La VI Legión, conocidos como los Lobos Espaciales, son la guardia '
                    'personal del Emperador y sus inquisidores. Fenris, su hogar helado, '
                    'forja guerreros de acero y hielo.'
                ),
                'planet_type': 'snow',
                'planet_name': 'Fenris',
                'icon_url': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765057/ad2d025f-9322-49ac-971e-c13f0876b71a.png',
                'images': [],
            },
            {
                'id': 'chaos-marines',
                'name': 'Chaos Space Marines',
                'name_es': 'Marines del Caos',
                'color': '#8b0000',
                'emissive': '#ff4500',
                'position': [14, -6, -10],
                'size': 3.0,
                'description': '¡Muerte al Falso Emperador!',
                'description_es': 'Veteranos de la Gran Guerra, corrompidos por el Caos',
                'history': (
                    'Veteranos de la Gran Herejía, corrompidos por los Poderes Ruinosos. '
                    'Buscan derrocar el Imperio que una vez ayudaron a construir, '
                    'impulsados por el odio, la sed de poder y las promesas de sus dioses.'
                ),
                'history_es': (
                    'Hace diez mil años combatieron en el lado equivocado de la mayor '
                    'guerra de la historia. Ahora, marcados por la corrupción del Caos, '
                    'regresan una y otra vez para exigir su venganza.'
                ),
                'planet_type': 'deformed',
                'planet_name': 'Mundo del Caos',
                'icon_url': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765163/fcd4aba4-4d86-4d2f-8f4e-16d028a8ff98.png',
                'images': [],
            },
            {
                'id': 'emperors-children',
                'name': "Emperor's Children",
                'name_es': 'Hijos del Emperador',
                'color': '#ff69b4',
                'emissive': '#da70d6',
                'position': [-10, -12, 6],
                'size': 2.7,
                'description': 'La perfección no es suficiente.',
                'description_es': 'Obsesionados con el exceso y la perfección sónica',
                'history': (
                    'Obsesionados con la perfección y el exceso. Adoran a Slaanesh y '
                    'buscan sensaciones extremas en el campo de batalla, utilizando '
                    'armas sónicas para despedazar a sus enemigos con pura disonancia.'
                ),
                'history_es': (
                    'La III Legión alcanzó la perfección antes de caer en el exceso '
                    'más abismal. Su primarca Fulgrim les guío a la esclavitud de '
                    'Slaanesh durante la Herejía de Horus.'
                ),
                'planet_type': 'tentacles',
                'planet_name': 'Mundo de Luxuria',
                'icon_url': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765269/44dd0630-3f06-4242-8210-c16143cbe3f8.png',
                'images': [],
            },
            {
                'id': 'tyranids',
                'name': 'Tyranids',
                'name_es': 'Tiránidos',
                'color': '#2e8b57',
                'emissive': '#7cfc00',
                'position': [16, 16, 10],
                'size': 3.2,
                'description': 'Consumir. Adaptar. Devorar.',
                'description_es': 'La mente enjambre extragaláctica que todo lo devora',
                'history': (
                    'El Gran Devorador. Una mente enjambre extragaláctica que consume '
                    'toda la biomasa a su paso, dejando mundos muertos. No conocen la '
                    'piedad, solo el hambre. Cada organismo es una herramienta perfecta '
                    'de destrucción, adaptada para superar cualquier defensa.'
                ),
                'history_es': (
                    'Los Tiránidos llegaron del vacío exterior de la galaxia, atraídos '
                    'por el brillante faro psíquico del Astronomican. Desde entonces, '
                    'flotas colmena han consumido cientos de sistemas.'
                ),
                'planet_type': 'craters',
                'planet_name': 'Macroacúmulo Tyránido',
                'icon_url': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765329/34ef7fe1-6f5e-453c-8bad-e051eb7893d7.png',
                'images': [],
            },
            {
                'id': 'space-marines',
                'name': 'Space Marines',
                'name_es': 'Marines Espaciales',
                'color': '#4169e1',
                'emissive': '#87cefa',
                'position': [8, -16, 14],
                'size': 2.5,
                'description': 'No conocerán el miedo.',
                'description_es': 'La última línea de defensa de la humanidad',
                'history': (
                    'Los Adeptus Astartes, guerreros genéticamente modificados y '
                    'entrenados desde la infancia. La última línea de defensa de la '
                    'humanidad contra los horrores de la galaxia, armados con la mejor '
                    'tecnología del Imperio de la Humanidad.'
                ),
                'history_es': (
                    'Creados por el Padre de la Humanidad hace diez mil años, los '
                    'Marines Espaciales son el arma definitiva del Imperio. Sus '
                    'Capítulos guardan memorias de batallas que definen épocas.'
                ),
                'planet_type': 'terra',
                'planet_name': 'Macragge',
                'icon_url': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765221/4fa897c8-5cfc-4846-881e-3bcffa4abc2a.png',
                'images': [],
            },
            {
                'id': 'necrons',
                'name': 'Necrons',
                'name_es': 'Necrón',
                'color': '#00ff88',
                'emissive': '#00cc66',
                'position': [-8, 18, -14],
                'size': 2.9,
                'description': 'Somos eternos. El tiempo mismo se arrodilla ante nosotros.',
                'description_es': 'Máquinas inmortales que despiertan de un sueño de 60 millones de años',
                'history': (
                    'Los Necrón son seres de metal que dormían en tumbas subterráneas '
                    'durante 60 millones de años. Antes fueron la raza de los Necrontyr, '
                    'que vendieron su alma a los C\'tan para ganar la inmortalidad. '
                    'Ahora despiertan para reclamar una galaxia que una vez fue suya.'
                ),
                'history_es': (
                    'Los Señores de las Tumbas despiertan con un solo objetivo: '
                    'restaurar el Imperio Necrón que una vez dominó la galaxia. '
                    'Sus cuerpos metálicos son casi indestructibles.'
                ),
                'planet_type': 'standard',
                'planet_name': 'Solemnace',
                'icon_url': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770764577/94c93baf-9937-4774-b6d2-f418129a1d61.png',
                'images': [],
            },
        ]

        armies = {}
        for data in armies_data:
            army = Army.objects.create(
                id=data['id'],
                name=data['name'],
                name_es=data.get('name_es', ''),
                description=data['description'],
                description_es=data.get('description_es', ''),
                history=data['history'],
                history_es=data.get('history_es', ''),
                icon_url=data['icon_url'],
                position=data['position'],
                size=data['size'],
                color=data['color'],
                emissive=data['emissive'],
                planet_type=data['planet_type'],
                planet_name=data['planet_name'],
                game=game,
            )
            for img in data.get('images', []):
                ArmyImage.objects.create(
                    id=img['id'],
                    army=army,
                    url=img['url'],
                    name=img['name'],
                )
            armies[data['id']] = army
            self.stdout.write(f'  ✓ {army.name}')

        return armies

    # -------------------------------------------------------------------------
    # Guías de pintura
    # -------------------------------------------------------------------------
    def _create_guides(self, armies):
        guides_data = [
            # ------------------------------------------------------------------
            # Guía 1: Rubric Marines
            # ------------------------------------------------------------------
            {
                'id': 'guide-rubric-marines',
                'title': 'Pintando Marines Rúbrica — Azul de Mil Hijos',
                'faction': 'thousand-sons',
                'difficulty': 'intermedio',
                'estimated_time': '1-2 horas',
                'author': 'Jose Cáceres',
                'date_created': '2026-01-15',
                'cover_image': 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770766517/31AF883F-DFAE-42AF-9AA5-A3F7E2C456F4_4_5005_c_oilqdq.jpg',
                'tags': ['Mil Hijos', 'Marines Rubrica', 'Azul', 'Oro', 'Caos'],
                'likes': 47,
                'views': 1547,
                'materials': [
                    'Citadel Base: Thousand Sons Blue',
                    'Citadel Layer: Ahriman Blue',
                    'Citadel Layer: Baharroth Blue',
                    'Citadel Shade: Nuln Oil',
                    'Citadel Shade: Reikland Fleshshade',
                    'Citadel Base: Averland Sunset',
                    'Citadel Technical: Nihilakh Oxide',
                    'Citadel Base: Mechanicus Standard Grey',
                    'Vallejo Model Color: Royal Purple',
                    'Vallejo Model Air: Silver',
                    'Vallejo Game Color: Bone White',
                    'AK Interactive: Ice Yellow',
                    'Pinceles Windsor & Newton Series 7 (tamaños 0, 1, 2)',
                    'Paleta húmeda Army Painter',
                    'Aerógrafo (opcional)',
                ],
                'steps': [
                    {
                        'step_number': 1,
                        'title': 'Imprimación negra',
                        'description': (
                            'Aplica una capa uniforme de imprimación Chaos Black en spray. '
                            'Asegúrate de que todas las zonas recónditas queden cubiertas. '
                            'Deja secar al menos 30 minutos antes de continuar.'
                        ),
                        'images': [],
                        'tips': [
                            'Imprime a 25-30 cm de distancia para evitar que tape el detalle.',
                            'Los días húmedos pueden causar que la imprimación quede arenosa — espera un día seco.',
                        ],
                    },
                    {
                        'step_number': 2,
                        'title': 'Capa base de armadura azul',
                        'description': (
                            'Diluye Thousand Sons Blue con agua al 1:1 y aplica dos capas finas '
                            'sobre toda la armadura. Deja secar entre capas. Esta es la base sobre '
                            'la que construiremos el gradiente azul-cian característico de los Mil Hijos.'
                        ),
                        'images': [],
                        'tips': [
                            'La pintura debe tener consistencia de leche — si gotea es demasiado líquida.',
                            'Trabaja de mayor a menor zona para no manchar lo ya pintado.',
                        ],
                    },
                    {
                        'step_number': 3,
                        'title': 'Sombreado con Nuln Oil',
                        'description': (
                            'Aplica Nuln Oil diluido en las juntas de la armadura y los recovecos '
                            'para crear profundidad. No lo apliques en toda la superficie, solo donde '
                            'queremos sombra.'
                        ),
                        'images': [],
                        'tips': [
                            'Usa un pincel fino (000) para controlar exactamente dónde va el lavado.',
                            'Si se extiende demasiado, retira el exceso rápidamente con un pincel seco.',
                        ],
                    },
                    {
                        'step_number': 4,
                        'title': 'Luces con Ahriman Blue y Baharroth Blue',
                        'description': (
                            'Aplica Ahriman Blue en los bordes y superficies elevadas de la armadura. '
                            'Después, puntúa los bordes más extremos con Baharroth Blue para el efecto '
                            'de edge highlight final. Este paso define la forma de cada pieza.'
                        ),
                        'images': [],
                        'tips': [
                            'Los highlights de borde deben ser líneas de 0.5mm o menos.',
                            'Practica la técnica de highlight de borde en cartón antes de hacerlo en la miniatura.',
                        ],
                    },
                    {
                        'step_number': 5,
                        'title': 'Dorado de decoraciones',
                        'description': (
                            'Pinta todas las ornamentaciones egipcias y los detalles dorados con '
                            'Averland Sunset como base. Aplica una capa de Vallejo Gold encima. '
                            'Sombrea con Reikland Fleshshade y destaca con Vallejo Silver en los puntos '
                            'más elevados.'
                        ),
                        'images': [],
                        'tips': [
                            'El oro queda mejor sobre una base de naranja (Averland Sunset) que sobre negro.',
                            'El efecto NMM (Non-Metallic Metal) da un resultado más artístico que las pinturas metálicas reales.',
                        ],
                    },
                    {
                        'step_number': 6,
                        'title': 'Acabado y barnizado',
                        'description': (
                            'Aplica un barniz satinado para proteger la pintura y unificar los acabados. '
                            'Si prefieres un acabado mate, aplica un barniz mate encima. '
                            'Para las partes metálicas, deja el satinado para que brillen.'
                        ),
                        'images': [],
                        'tips': [
                            'Barniza siempre en un entorno sin humedad para evitar el efecto lechoso.',
                            'El barniz satinado antes del mate ayuda a que las lavadas fluyan mejor.',
                        ],
                    },
                ],
                'comments': [
                    {'id': 'c-ts-1', 'author': 'Ahriman_Proximo', 'date': '2026-01-16', 'text': '¡Excelente guía! El truco del Averland Sunset es un cambiazo.'},
                    {'id': 'c-ts-2', 'author': 'MagnusElRojo', 'date': '2026-01-20', 'text': 'La consistencia leche para la pintura es clave. Muchas gracias.'},
                    {'id': 'c-ts-3', 'author': 'HerejeAzul', 'date': '2026-02-01', 'text': '¿Qué tamaño de pincel usas para los highlights de borde?'},
                ],
            },
            # ------------------------------------------------------------------
            # Guía 2: Space Wolves
            # ------------------------------------------------------------------
            {
                'id': 'guide-space-wolves-grey-fur',
                'title': 'Space Wolves — Pelaje y Armadura Gris Fenrisiana',
                'faction': 'space-wolves',
                'difficulty': 'principiante',
                'estimated_time': '45-60 min',
                'author': 'Jose Cáceres',
                'date_created': '2026-02-03',
                'cover_image': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
                'tags': ['Space Wolves', 'Gris', 'Pelaje', 'Fenris', 'Orden de Batalla'],
                'likes': 31,
                'views': 890,
                'materials': [
                    'Citadel Base: The Fang',
                    'Citadel Layer: Fenrisian Grey',
                    'Citadel Layer: Blue Horror',
                    'Citadel Shade: Agrax Earthshade',
                    'Citadel Shade: Nuln Oil',
                    'Citadel Dry: Praxeti White',
                    'Vallejo Model Color: Ivory',
                    'Pinceles: tamaños 1 y 2',
                ],
                'steps': [
                    {
                        'step_number': 1,
                        'title': 'Base con The Fang',
                        'description': 'Cubre toda la armadura con The Fang. Es un azul-gris oscuro que sirve como punto de partida perfecto para la paleta de los Lobos.',
                        'images': [],
                        'tips': ['The Fang también sirve de base para las zonas de piel de lobo — facilita el proceso.'],
                    },
                    {
                        'step_number': 2,
                        'title': 'Lavado con Nuln Oil',
                        'description': 'Aplica Nuln Oil en todas las recesiones de la armadura. Para las pieles de lobo, usa Agrax Earthshade para dar un tono más cálido y orgánico.',
                        'images': [],
                        'tips': ['No mezcles los lavados en la miniatura — aplica uno primero, deja secar y luego el otro.'],
                    },
                    {
                        'step_number': 3,
                        'title': 'Highlights de Fenrisian Grey',
                        'description': 'Aplica Fenrisian Grey en los bordes y aristas de la armadura. Para el pelaje, usa trazos secos para simular el pelo.',
                        'images': [],
                        'tips': ['Para el pelaje, carga el pincel y luego retira casi toda la pintura con papel antes de aplicarlo.'],
                    },
                    {
                        'step_number': 4,
                        'title': 'Punto final con Blue Horror',
                        'description': 'Un toque muy sutil de Blue Horror en los bordes más extremos de la armadura da esa sensación helada característica de Fenris.',
                        'images': [],
                        'tips': ['Menos es más — una línea fina de 0.3mm es suficiente.'],
                    },
                ],
                'comments': [
                    {'id': 'c-sw-1', 'author': 'Ragnar_BM', 'date': '2026-02-04', 'text': '¡Al fin una guía sencilla para los Lobos! Muy bien explicado.'},
                    {'id': 'c-sw-2', 'author': 'Bjorn_Eternal', 'date': '2026-02-10', 'text': 'El truco del dry brush para el pelaje es perfecto.'},
                ],
            },
            # ------------------------------------------------------------------
            # Guía 3: Tyranids
            # ------------------------------------------------------------------
            {
                'id': 'guide-tyranids-hive-fleet-leviathan',
                'title': 'Tiránidos — Esquema Flota Colmena Leviathan',
                'faction': 'tyranids',
                'difficulty': 'avanzado',
                'estimated_time': '2-3 horas',
                'author': 'Jose Cáceres',
                'date_created': '2026-02-18',
                'cover_image': 'https://images.unsplash.com/photo-1620503374956-c942862f0372?w=800',
                'tags': ['Tiránidos', 'Leviathan', 'Blanco', 'Morado', 'OSL'],
                'likes': 62,
                'views': 2104,
                'materials': [
                    'Citadel Base: Corax White',
                    'Citadel Base: Naggaroth Night',
                    'Citadel Layer: Genestealer Purple',
                    'Citadel Layer: Warpfiend Grey',
                    'Citadel Shade: Druchii Violet',
                    'Citadel Shade: Reikland Fleshshade',
                    'Citadel Technical: Blood for the Blood God',
                    'Citadel Technical: Ardcoat',
                    'Citadel Contrast: Magos Purple',
                    'Vallejo Model Air: White',
                    'Aerógrafo (recomendado para el blanco)',
                    'Pinceles: 0, 1, 2',
                ],
                'steps': [
                    {
                        'step_number': 1,
                        'title': 'Base blanca con aerógrafo',
                        'description': 'Usa el aerógrafo para aplicar Corax White desde arriba, dejando las zonas inferiores más oscuras. Esto crea un gradiente de luz natural inmediato.',
                        'images': [],
                        'tips': [
                            'Si no tienes aerógrafo, aplica dos capas a pincel muy diluidas.',
                            'El blanco puro sobre negro nunca cubre bien — usa primero gris y luego blanco.',
                        ],
                    },
                    {
                        'step_number': 2,
                        'title': 'Caparazón morado con Naggaroth Night',
                        'description': 'Pinta las placas de caparazón con Naggaroth Night como base. Es un morado muy oscuro que dará profundidad al caparazón.',
                        'images': [],
                        'tips': ['El contraste entre el blanco de la carne y el morado oscuro del caparazón es la clave del esquema Leviathan.'],
                    },
                    {
                        'step_number': 3,
                        'title': 'Gradiente del caparazón',
                        'description': 'Aplica Genestealer Purple en las zonas medias del caparazón y Warpfiend Grey en los bordes extremos para crear un efecto de gradiente. Usa Druchii Violet como transición.',
                        'images': [],
                        'tips': [
                            'Usa capas muy diluidas para el gradiente — 5-6 capas finas mejor que 2 gruesas.',
                            'El aerógrafo aquí también ayuda enormemente para el degradado.',
                        ],
                    },
                    {
                        'step_number': 4,
                        'title': 'Carne y órganos',
                        'description': 'Para la carne entre las placas, aplica una lavada de Reikland Fleshshade sobre el blanco. Los órganos y bocas se pintan con Blood for the Blood God para dar ese aspecto visceral.',
                        'images': [],
                        'tips': ['Blood for the Blood God se aplica de último, cuando todo lo demás esté seco y barnizado.'],
                    },
                    {
                        'step_number': 5,
                        'title': 'Ojos con efecto OSL',
                        'description': 'Los ojos se pintan en amarillo vivo. Aplica un resplandor alrededor usando amarillo muy diluido para simular la bioluminiscencia característica de los Tiránidos.',
                        'images': [],
                        'tips': [
                            'El OSL (Object Source Lighting) debe ser sutil — solo un toque de color en las superficies más cercanas.',
                            'Usa Ardcoat para dar brillo a los ojos y hacerlos parecer gélatinosos.',
                        ],
                    },
                ],
                'comments': [
                    {'id': 'c-tyr-1', 'author': 'Swarmlord_Prime', 'date': '2026-02-20', 'text': 'El OSL en los ojos está increíble. ¿Qué amarillo usas exactamente?'},
                    {'id': 'c-tyr-2', 'author': 'FlotaColmena', 'date': '2026-03-01', 'text': 'La técnica del aerógrafo para el blanco es clave. No hay otra manera.'},
                ],
            },
            # ------------------------------------------------------------------
            # Guía 4: Necrons
            # ------------------------------------------------------------------
            {
                'id': 'guide-necrons-metallic',
                'title': 'Necrón — Efecto Metálico Envejecido en 30 minutos',
                'faction': 'necrons',
                'difficulty': 'principiante',
                'estimated_time': '30-45 min',
                'author': 'Jose Cáceres',
                'date_created': '2026-03-01',
                'cover_image': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                'tags': ['Necrón', 'Metálico', 'Rápido', 'Speedpaint', 'Verde'],
                'likes': 88,
                'views': 3241,
                'materials': [
                    'Citadel Base: Iron Warriors',
                    'Citadel Shade: Nuln Oil',
                    'Citadel Technical: Nihilakh Oxide',
                    'Citadel Layer: Ironbreaker',
                    'Citadel Layer: Runefang Steel',
                    'Army Painter Speedpaint: Oozing Green',
                    'Vallejo Model Air: Chrome',
                ],
                'steps': [
                    {
                        'step_number': 1,
                        'title': 'Base metálica con Iron Warriors',
                        'description': 'Cubre toda la miniatura con Iron Warriors. Esta pintura tiene partículas metálicas muy finas que dan un aspecto metálico inmediato.',
                        'images': [],
                        'tips': ['No diluyas Iron Warriors — aplícala más espesa para maximizar el efecto metálico.'],
                    },
                    {
                        'step_number': 2,
                        'title': 'Lavado total con Nuln Oil',
                        'description': 'Aplica Nuln Oil por toda la miniatura. No te cortes — los Necrón llevan millones de años muertos y deben parecer viejos y sucios.',
                        'images': [],
                        'tips': ['Puedes aplicar una segunda capa en las recesiones para mayor profundidad.'],
                    },
                    {
                        'step_number': 3,
                        'title': 'Oxidación verde con Nihilakh Oxide',
                        'description': 'Aplica Nihilakh Oxide en las recesiones y uniones para simular corrosión y oxidación verde. Este es el sello visual de los Necrón.',
                        'images': [],
                        'tips': [
                            'No lo apliques de forma uniforme — la oxidación es aleatoria en la realidad.',
                            'Las esquinas internas y los agujeros son los mejores lugares para la oxidación.',
                        ],
                    },
                    {
                        'step_number': 4,
                        'title': 'Highlights de bordes',
                        'description': 'Aplica Ironbreaker y luego Runefang Steel en los bordes y aristas de la armadura. El contraste entre el metal oscuro y los bordes brillantes es espectacular.',
                        'images': [],
                        'tips': ['El Runefang Steel es muy brillante — úsalo con moderación solo en los bordes más extremos.'],
                    },
                ],
                'comments': [
                    {'id': 'c-nec-1', 'author': 'ImmortalVoid', 'date': '2026-03-02', 'text': '¡30 minutos y queda así de bien! El Nihilakh Oxide es mágico.'},
                ],
            },
            # ------------------------------------------------------------------
            # Guía 5: Chaos Marines
            # ------------------------------------------------------------------
            {
                'id': 'guide-chaos-marines-black-legion',
                'title': 'Marines del Caos — Legión Negra de Abadón',
                'faction': 'chaos-marines',
                'difficulty': 'intermedio',
                'estimated_time': '1.5-2 horas',
                'author': 'Jose Cáceres',
                'date_created': '2026-03-10',
                'cover_image': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800',
                'tags': ['Caos', 'Legión Negra', 'Negro', 'Oro', 'Abadón', 'Khorne'],
                'likes': 55,
                'views': 1823,
                'materials': [
                    'Citadel Base: Abaddon Black',
                    'Citadel Base: Averland Sunset',
                    'Citadel Layer: Auric Armour Gold',
                    'Citadel Shade: Nuln Oil',
                    'Citadel Shade: Agrax Earthshade',
                    'Citadel Technical: Blood for the Blood God',
                    'Vallejo Model Air: Chrome',
                    'Citadel Layer: Evil Sunz Scarlet',
                    'Citadel Base: Mephiston Red',
                ],
                'steps': [
                    {
                        'step_number': 1,
                        'title': 'Armadura negra con highlights',
                        'description': 'Imprime en negro y aplica Abaddon Black en la armadura. Luego mezcla negro con Mechanicus Standard Grey y aplica highlights de borde. El negro puro es difícil de destacar — siempre añade algo de gris.',
                        'images': [],
                        'tips': [
                            'El negro puro sobre negro no se ve — siempre necesitas algo más claro para los bordes.',
                            'Una línea de luz desde arriba hacia abajo unifica la miniatura.',
                        ],
                    },
                    {
                        'step_number': 2,
                        'title': 'Decoraciones en oro caótico',
                        'description': 'Pinta todas las piezas doradas con Averland Sunset, luego Auric Armour Gold. Sombrea con Agrax Earthshade para envejecer el oro y que parezca lúgubre y amenazador.',
                        'images': [],
                        'tips': ['El oro envejecido (agrax) vs el oro brillante (auric) da una personalidad oscura perfecta para el Caos.'],
                    },
                    {
                        'step_number': 3,
                        'title': 'Detalles de sangre y símbolos del Caos',
                        'description': 'Aplica Blood for the Blood God en las armas y heridas para simular sangre. Pinta los símbolos del Caos en Mephiston Red para que destaquen contra el negro.',
                        'images': [],
                        'tips': ['Blood for the Blood God queda mejor en capas finas y superpuestas — da profundidad a la sangre.'],
                    },
                ],
                'comments': [
                    {'id': 'c-csm-1', 'author': 'AbaddonRevive', 'date': '2026-03-11', 'text': 'El truco del gris mezclado con negro para los highlights es imprescindible.'},
                    {'id': 'c-csm-2', 'author': 'WarriorChaos', 'date': '2026-03-14', 'text': '¿Barnizas con satinado o mate al final?'},
                ],
            },
        ]

        for guide_data in guides_data:
            faction = armies.get(guide_data['faction'])
            guide = PaintingGuide.objects.create(
                id=guide_data['id'],
                title=guide_data['title'],
                faction=faction,
                difficulty=guide_data['difficulty'],
                estimated_time=guide_data['estimated_time'],
                author=guide_data['author'],
                date_created=parse_date(guide_data['date_created']),
                cover_image=guide_data['cover_image'],
                tags=guide_data['tags'],
                likes=guide_data['likes'],
                views=guide_data['views'],
            )
            for i, material in enumerate(guide_data['materials']):
                GuideMaterial.objects.create(guide=guide, name=material, order=i)
            for step in guide_data['steps']:
                GuideStep.objects.create(
                    guide=guide,
                    step_number=step['step_number'],
                    title=step['title'],
                    description=step['description'],
                    images=step.get('images', []),
                    tips=step.get('tips', []),
                )
            for comment in guide_data.get('comments', []):
                Comment.objects.create(
                    id=comment['id'],
                    content_type='guide',
                    guide=guide,
                    author=comment['author'],
                    date=parse_date(comment['date']),
                    text=comment['text'],
                )
            self.stdout.write(f'  ✓ {guide.title}')

    # -------------------------------------------------------------------------
    # Informes de batalla
    # -------------------------------------------------------------------------
    def _create_battle_reports(self, armies):
        reports_data = [
            {
                'id': 'battle-sorcery-vs-fury',
                'title': 'Hechicería vs Furia: Mil Hijos contra Lobos Espaciales',
                'factions': ['thousand-sons', 'space-wolves'],
                'mission': 'Recuperar Reliquias',
                'points': 2000,
                'date': '2026-01-25',
                'tags': ['Épico', 'Magia', 'CQC', 'Narrativo', '2000pts'],
                'likes': 34,
                'views': 1248,
                'player1_name': 'Legión de Magnus',
                'player1_faction': 'thousand-sons',
                'player1_score': 78,
                'player1_list': ['Ahriman a pie', 'Rubric Marines x10', 'Tzaangor Enlightened x6', 'Terminators de Fuego Rubrica x5', 'Exalted Sorcerer en Disk'],
                'player2_name': 'Gran Compañía de Ragnar',
                'player2_faction': 'space-wolves',
                'player2_score': 82,
                'player2_list': ['Ragnar Blackmane', 'Wulfen x5', 'Grey Hunters x10', 'Long Fangs x5', 'Stormfang Gunship'],
                'key_moments': [
                    'Turno 2 — Ahriman lanza Doombolt y destruye el Stormfang de un solo disparo.',
                    'Turno 3 — Los Wulfen cargan contra los Terminators y los eliminan en combate cuerpo a cuerpo.',
                    'Turno 4 — Los Long Fangs derriban al Disco Exaltado, poniendo en jaque al ejército de los Mil Hijos.',
                    'Turno 5 — Ragnar captura el objetivo central en el último suspiro de la batalla.',
                ],
                'mvp': 'Ragnar Blackmane — capturó 2 objetivos y eliminó a un Exalted Sorcerer en combate singular.',
                'narrative': [
                    {'turn': 1, 'phase': 'Despliegue', 'text': 'Las ruinas del mundo forja Kalidar III sirven de escenario. Los Mil Hijos despliegan en formación piramidal, con Ahriman en el centro. Los Lobos se desparraman en el flanco izquierdo, Ragnar al frente.'},
                    {'turn': 1, 'phase': 'Movimiento', 'text': 'Los hechiceros avanzan metódicamente. El Stormfang despega y sobrevuela el campo de batalla. Los Wulfen aúllan y cargan hacia el flanco derecho enemigo.'},
                    {'turn': 2, 'phase': 'Psíquica', 'text': 'Ahriman canaliza el poder del Cambio y lanza un Doombolt devastador. El misil psíquico impacta en el casco del Stormfang, que explota en una llamarada azul y oro.'},
                    {'turn': 3, 'phase': 'Carga', 'text': 'Con el cielo despejado, los Wulfen cargan directamente contra los Terminators Rubrica. El choque es brutal — los lobos desgarran la armadura con sus garras y las armaduras caen hechas polvo.'},
                    {'turn': 5, 'phase': 'Objetivo', 'text': 'En el último turno, Ragnar hace un sprint hacia la reliquia central. Con una sola runa de victoria, los Lobos Espaciales ganan la batalla por 4 puntos de objetivo.'},
                ],
                'comments': [
                    {'id': 'br-c1', 'author': 'Ragnar_Blackmane', 'date': '2026-01-26', 'text': '¡Batalla épica! La explosión del Stormfang fue un momento brutal.'},
                    {'id': 'br-c2', 'author': 'AhrimanReal', 'date': '2026-01-27', 'text': 'Merecida derrota. Infravalué los Wulfen. La próxima vez llevaré más Terminators.'},
                ],
            },
            {
                'id': 'battle-devourer-vs-imperium',
                'title': 'El Gran Devorador llega a Vigilus',
                'factions': ['tyranids', 'space-marines'],
                'mission': 'Purgar y Controlar',
                'points': 1500,
                'date': '2026-02-08',
                'tags': ['Tiránidos', 'Ultramarines', 'Invasión', '1500pts', 'Narrativo'],
                'likes': 51,
                'views': 1893,
                'player1_name': 'Flota Colmena Leviathan',
                'player1_faction': 'tyranids',
                'player1_score': 65,
                'player1_list': ['Hive Tyrant alado', 'Genestealers x20', 'Termagants x30', 'Carnifex x2', 'Zoanthropes x3'],
                'player2_name': '3ª Compañía Ultramarines',
                'player2_faction': 'space-marines',
                'player2_score': 71,
                'player2_list': ['Capítulo Librarian', 'Intercessors x10', 'Hellblasters x5', 'Redemptor Dreadnought', 'Invictor Warsuit'],
                'key_moments': [
                    'Turno 1 — El Hive Tyrant alado llega en reserva y baja directamente sobre los Hellblasters.',
                    'Turno 2 — El Redemptor Dreadnought recibe una carga de 20 Genestealers y sorprendentemente sobrevive.',
                    'Turno 3 — Los Zoanthropes destruyen al Invictor Warsuit con un proyectil psíquico combinado.',
                    'Turno 4 — Los Intercessors mantienen el objetivo central pese a estar rodeados de Termagants.',
                ],
                'mvp': 'Redemptor Dreadnought — aguantó 3 rondas de combate contra los Genestealers.',
                'narrative': [
                    {'turn': 1, 'phase': 'Inicio', 'text': 'La vanguardia Tiránida emerge de las cloacas de Vigilus. Los Ultramarines, avisados por el Astropata, se despliegan en posición defensiva ante la marea de quitina.'},
                    {'turn': 2, 'phase': 'Carga masiva', 'text': 'Una oleada de Genestealers envuelve al Redemptor. Sus garras chirrían contra el ceramita mientras el Dreadnought lucha por mantenerse activo. El Capellán grita desde detrás de las líneas.'},
                    {'turn': 4, 'phase': 'Defensa', 'text': 'Los Intercessors forman un cuadrado defensivo alrededor del objetivo, disparando en todas direcciones. Los Termagants caen en oleadas pero siguen llegando más.'},
                ],
                'comments': [
                    {'id': 'br-c3', 'author': 'UltraFan', 'date': '2026-02-09', 'text': 'El Redemptor es una bestia. Merece un monumento.'},
                ],
            },
            {
                'id': 'battle-chaos-vs-necrons',
                'title': 'Acero contra Corrupción: Caos vs Necrón',
                'factions': ['chaos-marines', 'necrons'],
                'mission': 'Dominar los Puntos de Emergencia',
                'points': 2000,
                'date': '2026-02-20',
                'tags': ['Caos', 'Necrón', 'CQC', 'Legión Negra', '2000pts'],
                'likes': 27,
                'views': 967,
                'player1_name': 'Cruzada de Abadón',
                'player1_faction': 'chaos-marines',
                'player1_score': 88,
                'player1_list': ['Abadón el Desollador', 'Terminators del Caos x5', 'Predator Chaos', 'Heldrake', 'Cultistas x20'],
                'player2_name': 'Dinastía Szarekhan',
                'player2_faction': 'necrons',
                'player2_score': 72,
                'player2_list': ['Señor Supremo Szarekh', 'Lychguard x5', 'Inmortales x10', 'Wraiths x6', 'Monolith'],
                'key_moments': [
                    'Turno 1 — El Heldrake aparece en reserva y flamea a los Inmortales, destruyendo 7 en un solo barrido.',
                    'Turno 2 — Los Wraiths cargan contra los Terminators del Caos, ninguno se regenera durante 2 turnos.',
                    'Turno 3 — Abadón llega en teletransportación junto a sus Terminators y captura el objetivo central.',
                    'Turno 5 — El Monolith teleporta Inmortales para flanquear pero llega demasiado tarde.',
                ],
                'mvp': 'Heldrake — destruyó más de 400 puntos de unidades en solitario.',
                'narrative': [
                    {'turn': 1, 'phase': 'Apertura', 'text': 'El mundo muerto de Trantis IV sirve de escenario. Los esqueletos de metal de la Dinastía Szarekhan emergen de sus tumbas. En el horizonte, el rugido de los motores del Caos anuncia la llegada de la Cruzada Negra.'},
                    {'turn': 3, 'phase': 'Teletransportación', 'text': 'Un portal de disformidad se abre en el centro del tablero. Abadón el Desollador emerge entre los relámpagos caóticos, su Talon of Horus brillando con energía oscura.'},
                ],
                'comments': [],
            },
            {
                'id': 'battle-emperors-children-vs-wolves',
                'title': 'Cacofonía vs Colmillo: Hijos del Emperador vs Lobos',
                'factions': ['emperors-children', 'space-wolves'],
                'mission': 'Aniquilación',
                'points': 1000,
                'date': '2026-03-01',
                'tags': ['Hijos del Emperador', 'Lobos', 'Rápido', '1000pts', 'Beginner'],
                'likes': 18,
                'views': 654,
                'player1_name': 'III Legión Degradada',
                'player1_faction': 'emperors-children',
                'player1_score': 55,
                'player1_list': ['Noise Marines x10', 'Chaos Lord Slaanesh', 'Daemonettes x20', 'Chaos Spawn x3'],
                'player2_name': 'Manada de Ulrik',
                'player2_faction': 'space-wolves',
                'player2_score': 60,
                'player2_list': ['Ulrik el Sabio', 'Blood Claws x15', 'Sky Claws x10', 'Iron Priest'],
                'key_moments': [
                    'Turno 1 — Los Noise Marines barren a los Blood Claws con disparos sónicos antes de que lleguen a cuerpo a cuerpo.',
                    'Turno 2 — Los Sky Claws cargan a los Daemonettes y los dispersan rápidamente.',
                    'Turno 3 — Ulrik desafía al Chaos Lord en combate singular y le derrota.',
                ],
                'mvp': 'Ulrik el Sabio — venció en combate singular y mantuvo las líneas.',
                'narrative': [
                    {'turn': 1, 'phase': 'Inicio', 'text': 'En las llanuras heladas de Fenris, la música del Caos resuena. Los Noise Marines entonan su himno de destrucción mientras los Blood Claws aúllan y cargan.'},
                ],
                'comments': [
                    {'id': 'br-c4', 'author': 'NoiseFan', 'date': '2026-03-02', 'text': 'Los Noise Marines son brutales a distancia. La clave es no dejarles llegar a cuerpo a cuerpo.'},
                ],
            },
            {
                'id': 'battle-4-way-apocalypse',
                'title': 'Apocalipsis en Cadia: 4 ejércitos, 8000 puntos',
                'factions': ['thousand-sons', 'space-marines', 'tyranids', 'necrons'],
                'mission': 'Supervivencia Total — Apocalipsis',
                'points': 8000,
                'date': '2026-03-08',
                'tags': ['Apocalipsis', 'Épico', '8000pts', 'Multijugador', 'Evento'],
                'likes': 112,
                'views': 4521,
                'player1_name': 'Las Legiones de Tzeentch',
                'player1_faction': 'thousand-sons',
                'player1_score': 142,
                'player1_list': ['Magnus el Rojo', 'Ahriman en Disk', 'Rubric Marines x3 escuadras', 'Defiler', 'Mutalith Vortex Beast'],
                'player2_name': 'Fuerza de Ataque Guilliman',
                'player2_faction': 'space-marines',
                'player2_score': 155,
                'player2_list': ['Roboute Guilliman', 'Leviathan Dreadnought', 'Centurion Devastators x9', 'Repulsor Executioner x2', 'Primaris Captain'],
                'player3_name': 'Flota Colmena Kraken',
                'player3_faction': 'tyranids',
                'player3_score': 131,
                'player3_list': ['Swarmlord', 'Genestealers x40', 'Hive Tyrant x2', 'Tervigon', 'Haruspex'],
                'player4_name': 'Conclave del Faraón',
                'player4_faction': 'necrons',
                'player4_score': 118,
                'player4_list': ['C\'tan Tesseract Vault', 'Lychguard x10', 'Doomsday Ark x2', 'Triarch Stalker', 'Canoptek Spyder x3'],
                'key_moments': [
                    'Turno 1 — Magnus el Rojo vuela y lanza Infernal Gateway sobre el Tesseract Vault, reduciendo su vida a la mitad en el primer turno.',
                    'Turno 2 — Guilliman activa Ultramarines Tactics y toda su fuerza dispara dos veces — destruyendo el Mutalith y dos unidades de Genestealers.',
                    'Turno 3 — El Swarmlord lanza Mente Enjambre y ordena la carga de 40 Genestealers contra el flanco Necrón.',
                    'Turno 4 — El Leviathan Dreadnought de los Ultramarines y Magnus se enfrentan en combate directo — el Primarca Demonio gana por poco.',
                    'Turno 5 — Los Ultramarines mantienen el objetivo central con Guilliman en pie, logrando la victoria por margen mínimo.',
                ],
                'mvp': 'Roboute Guilliman — acumuló 47 puntos de victoria personal y sobrevivió todo el partido.',
                'narrative': [
                    {'turn': 1, 'phase': 'Despliegue Apocalipsis', 'text': 'La cuádruple alianza de conveniencia se rompe antes de empezar. En las ruinas de Cadia, los cuatro generales se miran con recelo mientras el árbitro da la señal de inicio. El tablero de 10x6 pies se llena de miniaturas.'},
                    {'turn': 2, 'phase': 'Maelstrom de violencia', 'text': 'Los cuatro ejércitos se atacan entre sí sin alianzas. Magnus sobrevuela el campo de batalla como un dios vengativo. Los Genestealers consumen todo lo que tocan. Los rayos Gauss del Tesseract Vault iluminan el cielo.'},
                    {'turn': 5, 'phase': 'Victoria Imperial', 'text': 'Cuando el polvo se asienta, Guilliman alza su espada Emperyan sobre las ruinas de Cadia. Los Ultramarines han ganado, no por fuerza bruta sino por disciplina táctica y control de objetivos.'},
                ],
                'comments': [
                    {'id': 'br-c5', 'author': 'CalebDarkpaw', 'date': '2026-03-09', 'text': '¡Qué partidón! Magnus vs Guilliman en turno 4 fue histórico.'},
                    {'id': 'br-c6', 'author': 'TyrFan2026', 'date': '2026-03-09', 'text': 'Los Tiránidos llegaron muy bien posicionados. Los Ultramarines solo ganaron por el control de objetivos.'},
                    {'id': 'br-c7', 'author': 'ImperialFist', 'date': '2026-03-10', 'text': '8000 puntos en una tarde, eso es dedicación. ¿Cuánto duró la partida?'},
                ],
            },
            {
                'id': 'battle-patrol-beginners',
                'title': 'Primera Batalla — Patrulla 500pts: Iniciación al hobby',
                'factions': ['space-marines', 'necrons'],
                'mission': 'Patrulla de Reconocimiento',
                'points': 500,
                'date': '2026-03-15',
                'tags': ['Iniciación', 'Patrulla', '500pts', 'Primer Partido', 'Recomendado'],
                'likes': 23,
                'views': 712,
                'player1_name': 'Escuadra Sigma',
                'player1_faction': 'space-marines',
                'player1_score': 42,
                'player1_list': ['Primaris Lieutenant', 'Intercessors x5', 'Incursor Squad x5'],
                'player2_name': 'Guardia de la Tumba',
                'player2_faction': 'necrons',
                'player2_score': 38,
                'player2_list': ['Overlord', 'Warriors x10', 'Scarab Swarms x3'],
                'key_moments': [
                    'Turno 2 — Los Warriors se regeneran gracias a la Reanimation Protocols, impresionando al jugador Imperial.',
                    'Turno 3 — Los Intercessors eliminan al Overlord con un concentrado de fuego.',
                ],
                'mvp': 'Protocolo de Reanimación — los Warriors volvieron a levantarse 3 veces durante la partida.',
                'narrative': [
                    {'turn': 1, 'phase': 'Inicio', 'text': 'Dos jugadores nuevos se sientan frente a frente por primera vez. Las reglas de Patrulla hacen que la partida sea manejable y divertida. Los dados ruedan y la aventura comienza.'},
                ],
                'comments': [
                    {'id': 'br-c8', 'author': 'NuevoJugador', 'date': '2026-03-16', 'text': 'Este formato es perfecto para aprender. ¡Ya tengo ganas de la siguiente partida!'},
                ],
            },
        ]

        for rd in reports_data:
            report = BattleReport.objects.create(
                id=rd['id'],
                title=rd['title'],
                factions=rd['factions'],
                mission=rd['mission'],
                points=rd['points'],
                date=parse_date(rd['date']),
                tags=rd['tags'],
                likes=rd['likes'],
                views=rd['views'],
                player1_name=rd['player1_name'],
                player1_faction=rd['player1_faction'],
                player1_score=rd['player1_score'],
                player1_list=rd['player1_list'],
                player2_name=rd['player2_name'],
                player2_faction=rd['player2_faction'],
                player2_score=rd['player2_score'],
                player2_list=rd['player2_list'],
                key_moments=rd['key_moments'],
                mvp=rd['mvp'],
                images=[],
            )
            for i, narr in enumerate(rd.get('narrative', [])):
                BattleNarrative.objects.create(
                    battle=report,
                    turn=narr['turn'],
                    phase=narr['phase'],
                    text=narr['text'],
                    order=i,
                )
            for comment in rd.get('comments', []):
                Comment.objects.create(
                    id=comment['id'],
                    content_type='report',
                    battle_report=report,
                    author=comment['author'],
                    date=parse_date(comment['date']),
                    text=comment['text'],
                )
            self.stdout.write(f'  ✓ {report.title[:60]}...' if len(report.title) > 60 else f'  ✓ {report.title}')

    # -------------------------------------------------------------------------
    # Lore
    # -------------------------------------------------------------------------
    def _create_lore(self, armies):
        lore_data = [
            {
                'id': 'lore-rubrica-ahriman',
                'title': 'La Rubrica de Ahriman — El Hechizo que Condenó a una Legión',
                'category': 'evento',
                'content': (
                    '## La Caída de los Mil Hijos\n\n'
                    'Hace diez mil años, en los albores de la Herejía de Horus, la XV Legión '
                    'de Astartes — los Mil Hijos — se enfrentaba a una crisis sin precedentes. '
                    'La mutación psíquica corroía los cuerpos de sus guerreros, amenazando con '
                    'disolver la Legión entera en caos orgánico.\n\n'
                    '### Ahriman y su Solución\n\n'
                    'Ahriman, el Gran Hechicero, ideó un conjuro de extraordinaria complejidad: '
                    'la Rubrica. Su objetivo era detener la mutación y salvar a sus hermanos. '
                    'El resultado fue catastrófico.\n\n'
                    'El hechizo funcionó... pero no como se esperaba. Las almas de los Marines '
                    'fueron selladas dentro de sus propias armaduras, sus cuerpos reducidos a polvo. '
                    'Solo los psíquicos más poderosos mantuvieron su consciencia; el resto se '
                    'convirtió en autómatas de metal vacíos de vida pero llenos de propósito marcial.\n\n'
                    '### El Exilio de Ahriman\n\n'
                    'Magnus el Rojo, furioso con su primer hijo por lo que había hecho, exilió '
                    'a Ahriman del Planeta de los Hechiceros. Desde entonces, el Gran Hechicero '
                    'vaga por la galaxia buscando la forma de revertir la Rubrica y restaurar '
                    'a sus hermanos... o encontrar el poder para completar lo que comenzó.'
                ),
                'related_faction': 'thousand-sons',
                'tags': ['Ahriman', 'Rubrica', 'Magnus', 'Herejía de Horus', 'Historia'],
                'author': 'Administratum',
                'is_featured': True,
            },
            {
                'id': 'lore-fenris-mundo',
                'title': 'Fenris — El Mundo de los Lobos',
                'category': 'lugar',
                'content': (
                    '## Fenris, el Mundo Helado\n\n'
                    'Fenris es un mundo que desafía toda lógica. Un planeta de extremos absolutos: '
                    'durante los meses de verano cósmico, los continentes emergen del océano global '
                    'de agua. Durante el invierno, todo se congela en un manto eterno de hielo.\n\n'
                    '### La Gente de Fenris\n\n'
                    'Los fenrisenses son guerreros natos. Viven vidas cortas y brutales, luchando '
                    'contra bestias de las nieves, tribus rivales y el propio entorno hostil. '
                    'Los más fuertes son elegidos por los Lobos Espaciales para su transformación.\n\n'
                    '### La Ciudadela del Lobo\n\n'
                    'La Ciudadela del Lobo, Fang del Lobo, se alza sobre las montañas más altas '
                    'de Fenris. Es la fortaleza-monasterio de los Space Wolves, un laberinto de '
                    'cámaras talladas en roca viva donde los escaldos cantan gestas de victoria '
                    'mientras los guerreros se preparan para la próxima batalla.\n\n'
                    '### El Lobo Fenrisense\n\n'
                    'Los lobos de Fenris son criaturas enormes, del tamaño de caballos, con '
                    'inteligencia sobrenatural. Se dice que algunos son tan antiguos que han '
                    'visto nacer y morir estrellas. Los Space Wolves los tratan como hermanos.'
                ),
                'related_faction': 'space-wolves',
                'tags': ['Fenris', 'Lobos Espaciales', 'Mundo', 'Geografía'],
                'author': 'Administratum',
                'is_featured': False,
            },
            {
                'id': 'lore-magnus-red',
                'title': 'Magnus el Rojo — Primarca de los Mil Hijos',
                'category': 'personaje',
                'content': (
                    '## Magnus el Rojo, el Maestro de los Hechiceros\n\n'
                    'Magnus fue el Primarca de la XV Legión, los Mil Hijos. Nacido en el mundo '
                    'de Prospero, era un gigante psíquico de poder inigualable, con un solo ojo '
                    'ciclópeo y una sed insaciable de conocimiento.\n\n'
                    '### El Gran Traicionador sin quererlo\n\n'
                    'Magnus intentó advertir al Emperador de la traición de Horus a través del '
                    'poder psíquico, atravesando las protecciones de Terra. El coste fue enorme: '
                    'dañó la red de escudos del Proyecto Webway Imperial, causando una brecha por '
                    'la que demonios comenzaron a filtrarse.\n\n'
                    '### El Saqueo de Prospero\n\n'
                    'Como castigo, el Emperador envió a los Space Wolves de Leman Russ a capturar '
                    'a Magnus. Russ, mal informado o guiado por Horus, atacó directamente. Prospero '
                    'ardió. Los Mil Hijos huyeron al Planeta de los Hechiceros en el Ojo del Terror.\n\n'
                    '### Magnus en el presente del M41\n\n'
                    'Hoy Magnus es un Demonio-Primarca al servicio de Tzeentch. Ha regresado al '
                    'espacio real en múltiples ocasiones, siempre con propósitos oscuros que solo '
                    'el Señor del Cambio comprende completamente.'
                ),
                'related_faction': 'thousand-sons',
                'tags': ['Magnus', 'Primarca', 'Mil Hijos', 'Prospero', 'Tzeentch'],
                'author': 'Administratum',
                'is_featured': True,
            },
            {
                'id': 'lore-gran-cruzada',
                'title': 'La Gran Cruzada — Cuando el Imperio se Forjó',
                'category': 'historia',
                'content': (
                    '## La Gran Cruzada (798.M30 – 005.M31)\n\n'
                    'La Gran Cruzada fue el periodo de expansión imperial que reunificó a la '
                    'humanidad dispersa por la galaxia bajo el liderazgo del Emperador. '
                    'Durante dos siglos, las Legiones de Astartes conquistaron mundo tras mundo.\n\n'
                    '### Los Primarcas\n\n'
                    'Durante la Gran Cruzada, los primarcas lideraron a sus legiones. Cada uno '
                    'con su estilo propio: Guilliman con táctica, Leman Russ con ferocidad, '
                    'Magnus con magia, Fulgrim con perfección...\n\n'
                    '### El fin de la Gran Cruzada\n\n'
                    'La Gran Cruzada terminó con la traición de Horus en Davin. Lo que siguió '
                    'fue la Herejía de Horus, diez años de guerra civil que casi destruyeron '
                    'todo lo que se había construido. El Imperio sobrevivió, pero nunca volvió '
                    'a ser lo mismo.'
                ),
                'related_faction': None,
                'tags': ['Gran Cruzada', 'Historia', 'Primarcas', 'M30', 'Herejía de Horus'],
                'author': 'Administratum',
                'is_featured': False,
            },
            {
                'id': 'lore-necron-biotransference',
                'title': 'La Biotransferencia — El Precio de la Inmortalidad Necrón',
                'category': 'historia',
                'content': (
                    '## Los Necrontyr y los C\'tan\n\n'
                    'Hace 60 millones de años, existía una raza llamada los Necrontyr. Cortos '
                    'de vida, consumidos por enfermedades causadas por la radiación de su sol, '
                    'envidiaban la inmortalidad de los Antiguos.\n\n'
                    '### El Pacto con los C\'tan\n\n'
                    'Los C\'tan, entidades cósmicas de pura energía estelar, ofrecieron a los '
                    'Necrontyr lo que más deseaban: cuerpos de metal impervios al tiempo. '
                    'El proceso de Biotransferencia transfirió las almas Necrontyr a cascos '
                    'mecánicos perfectos.\n\n'
                    '### El Precio\n\n'
                    'Lo que los C\'tan no dijeron es que en el proceso, las emociones, los sueños '
                    'y gran parte de lo que hacía a los Necrontyr seres vivos se perdería. '
                    'Se convirtieron en máquinas de guerra sin alma, esclavas de sus nuevos dioses '
                    'estelares.\n\n'
                    '### La Rebelión\n\n'
                    'Eventualmente, los Necrón se rebelaron contra los C\'tan, los fragmentaron '
                    'en Shard — fragmentos de su poder — y los apresaron. Luego se sumergieron '
                    'en sus tumbas para esperar el tiempo indicado para despertar.'
                ),
                'related_faction': 'necrons',
                'tags': ['Necrón', 'C\'tan', 'Biotransferencia', 'Necrontyr', 'Historia Antigua'],
                'author': 'Administratum',
                'is_featured': True,
            },
            {
                'id': 'lore-tyranid-shadow-warp',
                'title': 'La Sombra en la Disformidad — El Arma Psíquica Tiránida',
                'category': 'tecnologia',
                'content': (
                    '## La Sombra en la Disformidad\n\n'
                    'Cuando una Flota Colmena Tiránida se aproxima a un sistema, sucede algo '
                    'perturbador incluso antes de que lleguen los primeros organismos. '
                    'Una presencia psíquica oscura, la Sombra en la Disformidad, envuelve '
                    'el sistema y bloquea cualquier comunicación psíquica.\n\n'
                    '### Efectos en los Psíquicos\n\n'
                    'Los psíquicos humanos en el área de influencia Tiránida sufren pesadillas '
                    'terroríficas, parálisis y en casos extremos, muerte. Los Astropatas — '
                    'fundamentales para la comunicación imperial — quedan inutilizados.\n\n'
                    '### Implicaciones Militares\n\n'
                    'Esto significa que cuando una Flota Colmena ataca, los sistemas cercanos '
                    'no pueden pedir ayuda. Son islas de silencio rodeadas por una marea '
                    'imparable de biomasa. Para cuando el Imperio descubre la invasión, '
                    'a menudo ya es demasiado tarde.'
                ),
                'related_faction': 'tyranids',
                'tags': ['Tiránidos', 'Psíquica', 'Sombra en la Disformidad', 'Tecnología', 'Guerra Psíquica'],
                'author': 'Administratum',
                'is_featured': False,
            },
        ]

        for ld in lore_data:
            related = armies.get(ld['related_faction']) if ld.get('related_faction') else None
            entry = LoreEntry.objects.create(
                id=ld['id'],
                title=ld['title'],
                category=ld['category'],
                content=ld['content'],
                related_faction=related,
                tags=ld['tags'],
                author=ld['author'],
                is_featured=ld['is_featured'],
            )
            self.stdout.write(f'  ✓ {entry.title[:60]}')

    # -------------------------------------------------------------------------
    # Noticias
    # -------------------------------------------------------------------------
    def _create_news(self):
        news_data = [
            {
                'id': 'news-nueva-temporada-matched',
                'title': 'Nuevo Dataslate de Warhammer 40.000 — Cambios clave para la temporada 2026',
                'slug': 'nuevo-dataslate-warhammer-40000-temporada-2026',
                'content': (
                    '## El Nuevo Dataslate ha llegado\n\n'
                    'Games Workshop ha publicado el Dataslate de primavera 2026 con cambios '
                    'significativos para el juego competitivo y narrativo. A continuación '
                    'resumimos los puntos más importantes.\n\n'
                    '### Cambios en los Detachments\n\n'
                    '- Los **Mil Hijos** reciben una mejora en su Detachment de Cabal — los '
                    'hechizos ahora tienen mayor rango base.\n'
                    '- Los **Space Wolves** pierden una regla de Heroic Intervention gratuita '
                    'pero ganan acceso a un nuevo stratagem de 0CP.\n'
                    '- Los **Tiránidos** reciben varios ajustes de puntos: el Hive Tyrant baja 15pts.\n\n'
                    '### Cambios de Puntos Destacados\n\n'
                    '| Unidad | Antes | Ahora |\n'
                    '|--------|-------|-------|\n'
                    '| Hive Tyrant | 235pts | 220pts |\n'
                    '| Ahriman a pie | 115pts | 105pts |\n'
                    '| Ragnar Blackmane | 130pts | 145pts |\n\n'
                    '### Opinión del Portal\n\n'
                    'En general, los cambios son positivos para el meta competitivo. '
                    'Las facciones más dominantes del último torneo reciben ajustes '
                    'moderados que deberían equilibrar el campo de juego sin hacer '
                    'obsoletas las colecciones existentes.'
                ),
                'author': 'Jose Cáceres',
                'tags': ['Dataslate', 'Temporada 2026', 'Competitivo', 'Puntos', 'Meta'],
                'cover_image': 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800',
                'is_published': True,
            },
            {
                'id': 'news-torneo-local-marzo',
                'title': 'Resultados del Torneo Local — Marzo 2026',
                'slug': 'resultados-torneo-local-marzo-2026',
                'content': (
                    '## Torneo Local Warhammer 40.000 — Marzo 2026\n\n'
                    'El pasado fin de semana celebramos nuestro torneo mensual con '
                    '12 participantes y 3 rondas de juego competitivo.\n\n'
                    '### Clasificación Final\n\n'
                    '1. **Jose Cáceres** (Mil Hijos) — 3 victorias, 285 puntos\n'
                    '2. **Carlos R.** (Necrón) — 2 victorias, 241 puntos\n'
                    '3. **María L.** (Tiránidos) — 2 victorias, 238 puntos\n'
                    '4. **Andrés M.** (Space Wolves) — 2 victorias, 220 puntos\n\n'
                    '### Ejércitos Más Populares\n\n'
                    'Los Tiránidos fueron la facción más representada con 4 jugadores. '
                    'Los Marines Espaciales y los Necrón empataron a 2 jugadores cada uno.\n\n'
                    '### Partida del Torneo\n\n'
                    'La partida más memorable fue la semifinal entre los Mil Hijos y los Necrón. '
                    'En el último turno, con ambos jugadores a 1 punto de diferencia, una '
                    'tirada de dados determinó el ganador. ¡La tensión fue palpable!\n\n'
                    '### Próximo Torneo\n\n'
                    'El siguiente torneo será el **12 de abril de 2026**. Formato: Strike Force 2000pts. '
                    'Las inscripciones abren el 1 de abril.'
                ),
                'author': 'Jose Cáceres',
                'tags': ['Torneo', 'Resultados', 'Competitivo', 'Local', 'Marzo 2026'],
                'cover_image': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
                'is_published': True,
            },
            {
                'id': 'news-nueva-caja-combat-patrol',
                'title': 'Nueva Caja Combat Patrol — Mil Hijos 2026',
                'slug': 'nueva-caja-combat-patrol-mil-hijos-2026',
                'content': (
                    '## Games Workshop anuncia nueva Combat Patrol de Mil Hijos\n\n'
                    'Games Workshop ha anunciado oficialmente la nueva caja de Combat Patrol '
                    'para los Mil Hijos, que llegará en el segundo trimestre de 2026.\n\n'
                    '### Contenido de la Caja\n\n'
                    'La nueva Combat Patrol incluirá:\n\n'
                    '- 1x **Exalted Sorcerer** (personaje HQ)\n'
                    '- 10x **Rubric Marines** (unidad tropa revisada)\n'
                    '- 3x **Tzaangor Enlightened** (fast attack)\n'
                    '- 1x **Chaos Rhino** con actualizaciones de Mil Hijos\n\n'
                    '### Precio y Disponibilidad\n\n'
                    'El precio estimado es de 100€. Estará disponible en tiendas especializadas '
                    'y en la web oficial de Games Workshop.\n\n'
                    '### Nuestra Opinión\n\n'
                    'Esta es una excelente caja de inicio para nuevos jugadores de Mil Hijos. '
                    'El Exalted Sorcerer y los Rubric Marines son unidades versátiles que '
                    'tienen cabida en casi cualquier lista.'
                ),
                'author': 'Jose Cáceres',
                'tags': ['Combat Patrol', 'Mil Hijos', 'Nuevos Lanzamientos', 'Cajas', '2026'],
                'cover_image': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
                'is_published': True,
            },
            {
                'id': 'news-guia-iniciacion-hobby',
                'title': 'Guía de Iniciación al Hobby de Warhammer — Todo lo que necesitas saber',
                'slug': 'guia-iniciacion-hobby-warhammer-todo-lo-que-necesitas',
                'content': (
                    '## ¿Nuevo en el hobby? Empieza aquí\n\n'
                    'El hobby de Warhammer puede parecer abrumador al principio. '
                    'Miniaturas, pinturas, reglas, lore... hay mucho que asimilar. '
                    'Esta guía te ayudará a dar los primeros pasos de forma sensata.\n\n'
                    '### Paso 1: Elige tu Facción\n\n'
                    'Lo primero es elegir un ejército que te guste estéticamente. '
                    'No te preocupes por el meta competitivo al principio — pinta lo que '
                    'te emocione. Algunas opciones para empezar:\n\n'
                    '- **Space Marines**: fáciles de pintar, muchas opciones\n'
                    '- **Necrón**: diseño icónico, relativamente simples de montar\n'
                    '- **Tiránidos**: coloridos, permiten mucha creatividad\n\n'
                    '### Paso 2: La Caja de Inicio\n\n'
                    'Adquiere una caja de Combat Patrol o Starter Set. Incluyen todo '
                    'lo necesario: miniaturas, manual de reglas simplificado y a veces dados.\n\n'
                    '### Paso 3: Pinturas Básicas\n\n'
                    'No necesitas 50 pinturas para empezar. Con 10-12 colores bien elegidos '
                    'puedes pintar un ejército completo. Empieza con los colores base de tu '
                    'facción, un lavado negro y uno sepia, y un par de colores de highlight.\n\n'
                    '### Paso 4: Disfruta del proceso\n\n'
                    'El hobby es un maratón, no un sprint. Tómatelo con calma, aprende técnicas '
                    'nuevas poco a poco y sobre todo, diviértete.'
                ),
                'author': 'Administratum',
                'tags': ['Iniciación', 'Hobby', 'Guía', 'Principiantes', 'Consejos'],
                'cover_image': 'https://images.unsplash.com/photo-1560785477-d43d2b42e9b7?w=800',
                'is_published': True,
            },
            {
                'id': 'news-bienvenida-portal',
                'title': 'Bienvenidos al Portal de la Galaxia Warhammer',
                'slug': 'bienvenidos-portal-galaxia-warhammer',
                'content': (
                    '## ¡El portal está en marcha!\n\n'
                    'Bienvenidos al Portal de la Galaxia Warhammer, un espacio dedicado '
                    'a la comunidad de jugadores y aficionados al hobby de Warhammer 40.000.\n\n'
                    '### ¿Qué encontrarás aquí?\n\n'
                    'Este portal es tu cuartel general para todo lo relacionado con Warhammer:\n\n'
                    '- **Galería de Ejércitos**: Explora los ejércitos de la comunidad en '
                    'una visualización 3D interactiva de la galaxia.\n'
                    '- **Guías de Pintura**: Tutoriales paso a paso para pintar tus miniaturas.\n'
                    '- **Informes de Batalla**: Crónicas detalladas de las batallas más épicas.\n'
                    '- **Lore del Universo**: Entradas enciclopédicas sobre el universo de Warhammer.\n'
                    '- **Noticias**: Lo último del mundo del hobby.\n\n'
                    '### ¿Cómo participar?\n\n'
                    'Para añadir tu ejército, guías o informes de batalla, necesitas una cuenta '
                    'de colaborador. Contacta con los administradores del portal para solicitar acceso.\n\n'
                    '¡Que el Emperador os proteja (o Tzeentch os guíe, según la facción)!'
                ),
                'author': 'Administratum',
                'tags': ['Bienvenida', 'Portal', 'Comunidad', 'Presentación'],
                'cover_image': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
                'is_published': True,
            },
        ]

        for nd in news_data:
            article = NewsArticle.objects.create(
                id=nd['id'],
                title=nd['title'],
                slug=nd['slug'],
                content=nd['content'],
                author=nd['author'],
                tags=nd['tags'],
                cover_image=nd['cover_image'],
                is_published=nd['is_published'],
            )
            self.stdout.write(f'  ✓ {article.title[:60]}')
