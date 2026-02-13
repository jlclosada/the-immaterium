import json
from django.core.management.base import BaseCommand
from django.utils.dateparse import parse_date
from api.models import (
    Army, ArmyImage, PaintingGuide, GuideMaterial, GuideStep,
    BattleReport, BattleNarrative, Comment
)

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')
        
        # Clear existing data properly to avoid duplicates
        self.stdout.write('Clearing existing data...')
        Comment.objects.all().delete()
        BattleNarrative.objects.all().delete()
        BattleReport.objects.all().delete()
        GuideStep.objects.all().delete()
        GuideMaterial.objects.all().delete()
        PaintingGuide.objects.all().delete()
        ArmyImage.objects.all().delete()
        Army.objects.all().delete()

        # Armies Data
        armies_data = [
            {
                "id": "thousand-sons",
                "name": "Mil Hijos",
                "color": "#00ced1",
                "emissive": "#ffffff",
                "position": [0, 5, 0],
                "size": 2.8,
                "description": "Todo es polvo",
                "history": "Los favoritos de Tzeentch, dios del cambio y la hechicería. Antiguamente buscaban el saber para iluminar a la humanidad; ahora son hechiceros condenados, muchos reducidos a armaduras llenas de polvo por la Rubrica de Ahriman. Manipulan el destino, el tiempo y la disformidad como armas.",
                "planetType": "lightning",
                "planetName": "El planeta de los hechiceros",
                "iconUrl": "https://res.cloudinary.com/dra0ogivp/image/upload/v1770764577/94c93baf-9937-4774-b6d2-f418129a1d61.png",
                "images": [
                    {
                        "id": "ts1",
                        "url": "https://res.cloudinary.com/dra0ogivp/image/upload/v1770766299/08967B69-588A-4E51-97A3-F745806D3E86_1_105_c_mbsgwz.jpg",
                        "name": "Thousand Sons Patrol"
                    },
                    {
                        "id": "ts2",
                        "url": "https://res.cloudinary.com/dra0ogivp/image/upload/v1770766517/31AF883F-DFAE-42AF-9AA5-A3F7E2C456F4_4_5005_c_oilqdq.jpg",
                        "name": "Rubric Marine #1"
                    }
                ]
            },
            {
                "id": "space-wolves",
                "name": "Lobos Espaciales",
                "color": "#e0ffff",
                "emissive": "#ffffff",
                "position": [-14, 10, -6],
                "size": 2.6,
                "description": "¡Por Russ y El Padre de todas las cosas!",
                "history": "Salvajes, honorables y letales. Los hijos de Leman Russ combinan ferocidad tribal con lealtad absoluta al Emperador. Desprecian la cobardía y aman la batalla directa. Cazadores natos, luchan como lobos: en manada, implacables y orgullosos",
                "planetType": "snow",
                "planetName": "Fenris",
                "iconUrl": "https://res.cloudinary.com/dra0ogivp/image/upload/v1770765057/ad2d025f-9322-49ac-971e-c13f0876b71a.png",
                "images": []
            },
            {
                "id": "chaos-marines",
                "name": "Chaos Space Marines",
                "color": "#8b0000",
                "emissive": "#ff4500",
                "position": [14, -6, -10],
                "size": 3.0,
                "description": "¡Muerte al Falso Emperador!",
                "history": "Veteranos de la Gran Guerra, corrompidos por los Poderes Ruinosos. Buscan derrocar el Imperio que una vez ayudaron a construir, impulsados por el odio y la sed de poder.",
                "planetType": "deformed",
                "planetName": "Abadón el Desollador",
                "iconUrl": "https://res.cloudinary.com/dra0ogivp/image/upload/v1770765163/fcd4aba4-4d86-4d2f-8f4e-16d028a8ff98.png",
                "images": []
            },
            {
                "id": "emperors-children",
                "name": "Emperor's Children",
                "color": "#ff69b4", 
                "emissive": "#da70d6",
                "position": [-10, -12, 6],
                "size": 2.7,
                "description": "La perfección no es suficiente.",
                "history": "Obsesionados con la perfección y el exceso. Adoran a Slaanesh y buscan sensaciones extremas en el campo de batalla, utilizando armas sónicas para despedazar a sus enemigos.",
                "planetType": "tentacles",
                "planetName": "Mundo de Luxuria",
                "iconUrl": "https://res.cloudinary.com/dra0ogivp/image/upload/v1770765269/44dd0630-3f06-4242-8210-c16143cbe3f8.png",
                "images": []
            },
            {
                "id": "tyranids",
                "name": "Tyranids",
                "color": "#2e8b57",
                "emissive": "#7cfc00",
                "position": [16, 16, 10],
                "size": 3.2,
                "description": "Consumir. Adaptar. Devorar.",
                "history": "El Gran Devorador. Una mente enjambre extragaláctica que consume toda la biomasa a su paso, dejando mundos muertos. No conocen la piedad, solo el hambre.",
                "planetType": "craters",
                "planetName": "Macroacúmulo Tyrannid",
                "iconUrl": "https://res.cloudinary.com/dra0ogivp/image/upload/v1770765329/34ef7fe1-6f5e-453c-8bad-e051eb7893d7.png",
                "images": []
            },
            {
                "id": "space-marines",
                "name": "Space Marines",
                "color": "#4169e1",
                "emissive": "#87cefa",
                "position": [8, -16, 14],
                "size": 2.5,
                "description": "No conocerán el miedo.",
                "history": "Los Adeptus Astartes, guerreros genéticamente modificados. La última línea de defensa de la humanidad contra los horrores de la galaxia, armados con la mejor tecnología del Imperio.",
                "planetType": "terra",
                "planetName": "Macragge",
                "iconUrl": "https://res.cloudinary.com/dra0ogivp/image/upload/v1770765221/4fa897c8-5cfc-4846-881e-3bcffa4abc2a.png",
                "images": []
            }
        ]

        self.stdout.write('Creating armies...')
        for army_data in armies_data:
            army = Army.objects.create(
                id=army_data['id'],
                name=army_data['name'],
                description=army_data['description'],
                history=army_data['history'],
                icon_url=army_data['iconUrl']
            )
            
            for img in army_data['images']:
                ArmyImage.objects.create(
                    id=img['id'],
                    army=army,
                    url=img['url'],
                    name=img['name']
                )

        # Painting Guides Data
        guides_data = [
            {
                "id": "guide-rubric-marines",
                "title": "Pintando Marines Rúbrica",
                "faction": "thousand-sons",
                "difficulty": "intermedio",
                "estimatedTime": "1-2 horas",
                "author": "Jose Cáceres",
                "dateCreated": "2026-01-15",
                "coverImage": "https://res.cloudinary.com/dra0ogivp/image/upload/v1770766517/31AF883F-DFAE-42AF-9AA5-A3F7E2C456F4_4_5005_c_oilqdq.jpg",
                "tags": ["Mil Hijos", "Marines Rubrica", "Azul", "Oro"],
                "likes": 12,
                "views": 1547,
                "materials": [
                    "Citadel Base: Thousand Sons Blue", "Citadel Layer: Ahriman Blue", "Citadel Layer: Baharroth Blue",
                    "Citadel Shade: Nuln Oil", "Citadel Base: Mechanicus Standard Grey", "Citadel Technical: Nihilakh Oxide",
                    "Citadel Shade: Reikland Fleshade", "Citadel Base: Averland Sunset", "Valllejo: Gold",
                    "Vallejo: Model Air Silver", "Vallejo: Model Color Royal Purple", "Vallejo: Model Color Pale Grey Blue",
                    "Vallejo: Model Color Black", "Vallejo: Model Air Chrome", "Vallejo: Game Color Bone White",
                    "AK: Ice Yellow", "Pinceles Windsor & Newton Series 7 (tamaños 0, 1, 2)", "Paleta húmeda Army Painter",
                    "Aerógrafo (no totalmente necesario"
                ],
                "steps": [
                    {"stepNumber": 1, "title": "Imprimación negra", "description": "Aplica una capa uniforme de imprimación Chaos Black...", "images": [], "tips": ["Aplica la imprimación en capas finas"]},
                    {"stepNumber": 2, "title": "Capa Base de Armadura Azul", "description": "Diluye Thousand Sons Blue con agua...", "images": [], "tips": ["La pintura debe tener consistencia de leche"]},
                    # ... simplified for brevity, in real app would include all steps
                ],
                "comments": [
                    {"id": "c1", "author": "Ahriman", "date": "2026-01-16", "text": "¡Excelente guía!"}
                ]
            },
            # Add other guides if needed, keeping it simple for now to ensure it runs
        ]

        self.stdout.write('Creating painting guides...')
        for guide_data in guides_data:
            try:
                faction = Army.objects.get(id=guide_data['faction'])
            except Army.DoesNotExist:
                faction = None
                
            guide = PaintingGuide.objects.create(
                id=guide_data['id'],
                title=guide_data['title'],
                faction=faction,
                difficulty=guide_data['difficulty'],
                estimated_time=guide_data['estimatedTime'],
                author=guide_data['author'],
                date_created=parse_date(guide_data['dateCreated']),
                cover_image=guide_data['coverImage'],
                tags=guide_data['tags'],
                likes=guide_data['likes'],
                views=guide_data['views']
            )
            
            for i, material in enumerate(guide_data['materials']):
                GuideMaterial.objects.create(
                    guide=guide,
                    name=material,
                    order=i
                )
                
            for step in guide_data['steps']:
                GuideStep.objects.create(
                    guide=guide,
                    step_number=step['stepNumber'],
                    title=step['title'],
                    description=step['description'],
                    images=step['images'],
                    tips=step['tips']
                )
                
            for comment in guide_data['comments']:
                Comment.objects.create(
                    id=comment['id'],
                    content_type='guide',
                    guide=guide,
                    author=comment['author'],
                    date=parse_date(comment['date']),
                    text=comment['text']
                )

        # Battle Reports Data
        reports_data = [
            {
                "id": "battle-sorcery-vs-fury",
                "title": "Hechicería vs Furia: Thousand Sons contra Space Wolves",
                "factions": ["thousand-sons", "space-wolves"],
                "mission": "Recuperar Reliquias",
                "points": 2000,
                "date": "2026-01-25",
                "tags": ["Épico", "Magia", "CQC", "Narrativo"],
                "likes": 567,
                "views": 2834,
                "finalScore": {"player1": 78, "player2": 82},
                "armies": {
                    "player1": {"name": "Legión de Magnus", "faction": "thousand-sons", "list": ["Ahriman", "Rubric Marines"]},
                    "player2": {"name": "Gran Compañía de Ragnar", "faction": "space-wolves", "list": ["Ragnar", "Wulfen"]}
                },
                "narrative": [
                    {"turn": 1, "phase": "Despliegue", "text": "Las ruinas del mundo forja..."},
                    {"turn": 1, "phase": "Movimiento", "text": "Los hechiceros avanzan..."}
                ],
                "keyMoments": ["Ahriman destruye el Stormfang", "Wulfen eliminan Terminators"],
                "mvp": "Bjorn el Antiguo",
                "comments": [
                    {"id": "br1", "author": "Ragnar_Blackmane", "date": "2026-01-26", "text": "¡Batalla épica!"}
                ]
            }
        ]

        self.stdout.write('Creating battle reports...')
        for report_data in reports_data:
            report = BattleReport.objects.create(
                id=report_data['id'],
                title=report_data['title'],
                factions=report_data['factions'],
                mission=report_data['mission'],
                points=report_data['points'],
                date=parse_date(report_data['date']),
                tags=report_data['tags'],
                likes=report_data['likes'],
                views=report_data['views'],
                player1_score=report_data['finalScore']['player1'],
                player2_score=report_data['finalScore']['player2'],
                player1_name=report_data['armies']['player1']['name'],
                player1_faction=report_data['armies']['player1']['faction'],
                player1_list=report_data['armies']['player1']['list'],
                player2_name=report_data['armies']['player2']['name'],
                player2_faction=report_data['armies']['player2']['faction'],
                player2_list=report_data['armies']['player2']['list'],
                key_moments=report_data['keyMoments'],
                mvp=report_data['mvp']
            )
            
            for i, narrative in enumerate(report_data['narrative']):
                BattleNarrative.objects.create(
                    battle=report,
                    turn=narrative['turn'],
                    phase=narrative['phase'],
                    text=narrative['text'],
                    order=i
                )
                
            for comment in report_data['comments']:
                Comment.objects.create(
                    id=comment['id'],
                    content_type='report',
                    battle_report=report,
                    author=comment['author'],
                    date=parse_date(comment['date']),
                    text=comment['text']
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database'))
