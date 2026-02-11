import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Navigation state
  currentView: 'galaxy', // 'galaxy' | 'planet' | 'gallery'
  selectedPlanet: null,
  selectedImage: null,
  selectedGuide: null,
  selectedBattleReport: null,

  // Camera state
  cameraTarget: [0, 0, 0],
  cameraPosition: [0, 0, 50],
  isTransitioning: false,

  // UI state
  showUI: true,
  menuOpen: false,

  // Armies data
  armies: [
    {
      id: 'thousand-sons',
      name: 'Thousand Sons',
      color: '#00ced1', // Turquoise
      emissive: '#ffffff', // White lightning
      position: [0, 5, 0],
      size: 2.8,
      description: 'Los Hechiceros de Tzeentch',
      history: 'Los remanentes de la XV Legión, condenados por la Rúbrica de Ahriman. Son cascarones vacíos de armadura animada, liderados por poderosos hechiceros que sirven al Dios del Cambio.',
      planetType: 'lightning',
      planetName: 'El planeta de los hechiceros',
      iconUrl: 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770764577/94c93baf-9937-4774-b6d2-f418129a1d61.png',
      images: [
        {
          id: 'ts1',
          url: 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770766299/08967B69-588A-4E51-97A3-F745806D3E86_1_105_c_mbsgwz.jpg',
          name: 'Thousand Sons Patrol'
        },
        {
          id: 'ts2',
          url: 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770766517/31AF883F-DFAE-42AF-9AA5-A3F7E2C456F4_4_5005_c_oilqdq.jpg',
          name: 'Rubric Marine #1'
        }
      ]
    },
    {
      id: 'space-wolves',
      name: 'Space Wolves',
      color: '#e0ffff', // Light Cyan/White
      emissive: '#ffffff',
      position: [-14, 10, -6],
      size: 2.6,
      description: 'Los Ejecutores del Emperador',
      history: 'Los hijos de Leman Russ, salvajes y leales. Cazadores feroces que combinan tecnología avanzada con tradiciones bárbaras de Fenris, odiados rivales de los Mil Hijos.',
      planetType: 'snow',
      planetName: 'Fenris',
      iconUrl: 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765057/ad2d025f-9322-49ac-971e-c13f0876b71a.png',
      images: []
    },
    {
      id: 'chaos-marines',
      name: 'Chaos Space Marines',
      color: '#8b0000', // Dark Red
      emissive: '#ff4500', // Orange-Red aura
      position: [14, -6, -10],
      size: 3.0,
      description: 'Muerte al Falso Emperador',
      history: 'Veteranos de la Gran Guerra, corrompidos por los Poderes Ruinosos. Buscan derrocar el Imperio que una vez ayudaron a construir, impulsados por el odio y la sed de poder.',
      planetType: 'deformed',
      planetName: 'Abadón el Desollador',
      iconUrl: 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765163/fcd4aba4-4d86-4d2f-8f4e-16d028a8ff98.png',
      images: []
    },
    {
      id: 'emperors-children',
      name: "Emperor's Children",
      color: '#ff69b4', // Hot Pink
      emissive: '#da70d6', // Orchid
      position: [-10, -12, 6],
      size: 2.7,
      description: 'Perfección en el Exceso',
      history: 'Obsesionados con la perfección y el exceso. Adoran a Slaanesh y buscan sensaciones extremas en el campo de batalla, utilizando armas sónicas para despedazar a sus enemigos.',
      planetType: 'tentacles',
      planetName: 'Mundo de Luxuria',
      iconUrl: 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765269/44dd0630-3f06-4242-8210-c16143cbe3f8.png',
      images: []
    },
    {
      id: 'tyranids',
      name: 'Tyranids',
      color: '#2e8b57', // Sea Green
      emissive: '#7cfc00', // Lawn Green
      position: [16, 16, 10],
      size: 3.2,
      description: 'La Mente Colmena',
      history: 'El Gran Devorador. Una mente enjambre extragaláctica que consume toda la biomasa a su paso, dejando mundos muertos. No conocen la piedad, solo el hambre.',
      planetType: 'craters',
      planetName: 'Macroacúmulo Tyrannid',
      iconUrl: 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765329/34ef7fe1-6f5e-453c-8bad-e051eb7893d7.png',
      images: []
    },
    {
      id: 'space-marines',
      name: 'Space Marines',
      color: '#4169e1', // Royal Blue
      emissive: '#87cefa', // Light Sky Blue
      position: [8, -16, 14],
      size: 2.5,
      description: 'Por el Emperador!',
      history: 'Los Adeptus Astartes, guerreros genéticamente modificados. La última línea de defensa de la humanidad contra los horrores de la galaxia, armados con la mejor tecnología del Imperio.',
      planetType: 'terra',
      planetName: 'Macragge',
      iconUrl: 'https://res.cloudinary.com/dra0ogivp/image/upload/v1770765221/4fa897c8-5cfc-4846-881e-3bcffa4abc2a.png',
      images: []
    }
  ],

  // Painting Guides Data
  paintingGuides: [
    {
      id: 'guide-rubric-marines',
      title: 'Pintando Rubric Marines de los Thousand Sons',
      faction: 'thousand-sons',
      difficulty: 'intermedio',
      estimatedTime: '3-4 horas',
      author: 'Magnus el Rojo',
      dateCreated: '2026-01-15',
      coverImage: 'https://res.cloudinary.com/dra0ogivp/image/upload/v1769532419/IMG_2445_jhabjv.jpg',
      tags: ['Thousand Sons', 'Rubric Marines', 'Azul', 'Oro', 'NMM'],
      likes: 342,
      views: 1547,
      materials: [
        'Citadel Base: Thousand Sons Blue',
        'Citadel Layer: Ahriman Blue',
        'Citadel Shade: Nuln Oil',
        'Citadel Layer: Baharroth Blue',
        'Retributor Armour (oro)',
        'Liberator Gold',
        'Auric Armour Gold',
        'Pinceles Windsor & Newton Series 7 (tamaños 0, 1, 2)',
        'Paleta húmeda'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Preparación y Imprimación',
          description: 'Limpia las miniaturas con agua tibia y jabón para eliminar residuos de molde. Seca completamente. Aplica una capa uniforme de imprimación Chaos Black en spray, manteniendo 20-30cm de distancia. Deja secar 24 horas en un lugar ventilado.',
          images: [],
          tips: [
            'Usa un cepillo de dientes suave para limpiar detalles difíciles',
            'Aplica la imprimación en capas finas, mejor varias capas ligeras que una gruesa',
            'La temperatura ideal para imprimar es 15-25°C con baja humedad'
          ]
        },
        {
          stepNumber: 2,
          title: 'Capa Base de Armadura Azul',
          description: 'Diluye Thousand Sons Blue con agua (proporción 1:1) y aplica dos capas finas sobre toda la armadura. Asegúrate de cubrir completamente el negro de la imprimación. Deja secar entre capas (15-20 minutos).',
          images: [],
          tips: [
            'La pintura debe tener consistencia de leche',
            'Usa trazos largos y uniformes siguiendo la dirección de las placas de armadura',
            'No te preocupes si la primera capa se ve translúcida, es normal'
          ]
        },
        {
          stepNumber: 3,
          title: 'Sombreado con Lavado',
          description: 'Aplica Nuln Oil generosamente en todas las recesos de la armadura azul. Deja que el lavado fluya naturalmente hacia las grietas y hendiduras. Limpia cualquier exceso con un pincel húmedo antes de que seque.',
          images: [],
          tips: [
            'Inclina la miniatura para guiar el lavado hacia los recesos',
            'Un pincel limpio y húmedo puede corregir errores antes del secado',
            'Deja secar completamente (30-45 minutos) antes del siguiente paso'
          ]
        },
        {
          stepNumber: 4,
          title: 'Iluminación de Armadura',
          description: 'Con Ahriman Blue, pinta las áreas elevadas de la armadura dejando el sombreado en los recesos. Luego, añade toques finales de Baharroth Blue en los bordes más prominentes para crear contraste máximo.',
          images: [],
          tips: [
            'Usa la técnica de "edge highlighting" con el lateral del pincel',
            'Menos es más: solo ilumina los bordes superiores y más expuestos',
            'Mantén el pincel casi seco para mayor control'
          ]
        },
        {
          stepNumber: 5,
          title: 'Detalles Dorados - Capa Base',
          description: 'Pinta todos los detalles dorados (adornos, símbolos, bordes de hombreras) con Retributor Armour. Aplica dos capas finas para cobertura completa. Sé preciso y evita manchar el azul.',
          images: [],
          tips: [
            'Usa un pincel de punta fina (tamaño 0 o 1) para detalles pequeños',
            'Apoya la mano en la mesa para mayor estabilidad',
            'Si manchas el azul, corrige inmediatamente con el color base'
          ]
        },
        {
          stepNumber: 6,
          title: 'Sombreado de Oro',
          description: 'Aplica Agrax Earthshade o Reikland Fleshshade diluido (1:1 con medium) sobre todos los detalles dorados. Esto añade profundidad y realismo al metal.',
          images: [],
          tips: [
            'Diluir el lavado evita que se acumule en exceso',
            'Aplica con cuidado para no manchar la armadura azul',
            'Deja secar completamente antes de iluminar'
          ]
        },
        {
          stepNumber: 7,
          title: 'Iluminación de Oro (NMM)',
          description: 'Ilumina los bordes dorados con Liberator Gold, seguido de toques finales de Auric Armour Gold en los puntos más altos. Esto simula reflejos metálicos y añade dimensión.',
          images: [],
          tips: [
            'Imagina una fuente de luz desde arriba',
            'Los reflejos más brillantes van en esquinas y bordes superiores',
            'Usa trazos muy finos y controlados'
          ]
        },
        {
          stepNumber: 8,
          title: 'Detalles Finales y Base',
          description: 'Pinta los lentes del casco con Mephiston Red, añade un punto de Wild Rider Red para brillo. Pinta el bolter con Abaddon Black y Eshin Grey para iluminación. Termina la base con textura Astrogranite y un borde de Abaddon Black.',
          images: [],
          tips: [
            'Los puntos de luz en lentes deben ir en la misma dirección',
            'Sella la miniatura con barniz mate para protección',
            'Un toque de barniz brillante en lentes añade realismo'
          ]
        }
      ],
      comments: [
        {
          id: 'c1',
          author: 'Ahriman',
          date: '2026-01-16',
          text: '¡Excelente guía! Los Rubric Marines me quedaron increíbles siguiendo estos pasos. El truco del lavado diluido para el oro es oro puro (sin juego de palabras).'
        },
        {
          id: 'c2',
          author: 'Tzeentch_Fan_99',
          date: '2026-01-18',
          text: '¿Alguien ha probado con Talassar Blue Contrast en lugar del método tradicional? Me pregunto si funcionaría igual de bien.'
        }
      ]
    },
    {
      id: 'guide-space-wolves',
      title: 'Guerreros de Fenris: Guía Completa de Space Wolves',
      faction: 'space-wolves',
      difficulty: 'avanzado',
      estimatedTime: '5-6 horas',
      author: 'Leman Russ',
      dateCreated: '2026-01-20',
      coverImage: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
      tags: ['Space Wolves', 'Gris', 'Pieles', 'Runas', 'Weathering'],
      likes: 289,
      views: 1203,
      materials: [
        'The Fang (gris base)',
        'Fenrisian Grey',
        'Blue Horror',
        'White Scar',
        'Rhinox Hide (pieles)',
        'Mournfang Brown',
        'Ushabti Bone',
        'Nuln Oil',
        'Agrax Earthshade',
        'Typhus Corrosion (weathering)',
        'Ryza Rust (óxido)',
        'Pinceles de detalle fino'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Imprimación y Capa Base Gris',
          description: 'Imprime con Mechanicus Standard Grey spray. Aplica The Fang como capa base en toda la armadura, diluyendo 1:1 con agua. Dos capas finas aseguran cobertura uniforme.',
          images: [],
          tips: [
            'El gris medio de imprimación facilita tanto sombras como luces',
            'Mantén la consistencia fluida pero no acuosa',
            'Cubre completamente, incluyendo recesos profundos'
          ]
        },
        {
          stepNumber: 2,
          title: 'Sombreado Profundo',
          description: 'Aplica Nuln Oil en todos los recesos de la armadura. Para un efecto más dramático, mezcla Nuln Oil con Drakenhof Nightshade (70:30) en las zonas más profundas.',
          images: [],
          tips: [
            'El toque de azul en las sombras complementa el gris frío',
            'Usa un pincel grande para áreas amplias',
            'Controla el flujo inclinando la miniatura'
          ]
        },
        {
          stepNumber: 3,
          title: 'Construcción de Luces',
          description: 'Ilumina con Fenrisian Grey en superficies planas y bordes. Añade Blue Horror mezclado con Fenrisian Grey (50:50) en bordes superiores. Toques finales de Blue Horror puro en esquinas.',
          images: [],
          tips: [
            'Construye las luces gradualmente en 3-4 capas',
            'Cada capa debe cubrir menos área que la anterior',
            'Mantén transiciones suaves entre tonos'
          ]
        },
        {
          stepNumber: 4,
          title: 'Pieles y Pelajes',
          description: 'Pinta pieles con Rhinox Hide como base. Sombrea con Agrax Earthshade. Ilumina con Mournfang Brown en áreas elevadas, seguido de Ushabti Bone en los pelos más prominentes para simular textura.',
          images: [],
          tips: [
            'Usa trazos finos y direccionales para simular pelo',
            'Varía la dirección de los trazos para naturalidad',
            'Añade algunos pelos blancos con White Scar para variedad'
          ]
        },
        {
          stepNumber: 5,
          title: 'Runas y Símbolos Místicos',
          description: 'Pinta runas con Thousand Sons Blue como base. Ilumina con Temple Guard Blue y añade un toque final de White Scar en el centro. Esto crea un efecto de energía mágica brillante.',
          images: [],
          tips: [
            'Las runas deben parecer luminosas, como si brillaran',
            'Usa un pincel muy fino (000 o 0000)',
            'Practica el diseño en papel primero'
          ]
        },
        {
          stepNumber: 6,
          title: 'Weathering y Desgaste',
          description: 'Aplica Typhus Corrosion diluido en bordes de armadura y zonas de desgaste. Añade Ryza Rust con esponja en áreas metálicas. Esto simula el duro ambiente de Fenris.',
          images: [],
          tips: [
            'Menos es más: el weathering debe ser sutil',
            'Concentra el desgaste en bordes y zonas de contacto',
            'Usa una esponja de espuma para textura realista'
          ]
        },
        {
          stepNumber: 7,
          title: 'Detalles Finales: Ojos y Lentes',
          description: 'Pinta ojos con Mephiston Red, ilumina con Evil Sunz Scarlet y añade punto de luz con Fire Dragon Bright. Los lentes del casco siguen el mismo proceso.',
          images: [],
          tips: [
            'Los ojos deben verse feroces y brillantes',
            'El punto de luz va siempre en la misma posición',
            'Un toque de barniz brillante realza el efecto'
          ]
        },
        {
          stepNumber: 8,
          title: 'Base Temática de Fenris',
          description: 'Crea una base nevada con Astrogranite Debris, seguido de Valhallan Blizzard. Añade tufts de hierba invernal y pequeñas rocas. Pinta el borde con Administratum Grey.',
          images: [],
          tips: [
            'La nieve debe parecer natural, no uniforme',
            'Añade algunos cristales de hielo con barniz brillante',
            'Pequeños detalles (cráneos, casquillos) añaden narrativa'
          ]
        }
      ],
      comments: [
        {
          id: 'c3',
          author: 'Bjorn_el_Antiguo',
          date: '2026-01-22',
          text: 'Por Russ! Esta guía es digna de los Vlka Fenryka. Las técnicas de weathering son especialmente útiles.'
        }
      ]
    },
    {
      id: 'guide-tyranids',
      title: 'Enjambre Devorador: Esquema de Tyranids Behemoth',
      faction: 'tyranids',
      difficulty: 'principiante',
      estimatedTime: '2-3 horas',
      author: 'Hive_Mind_Collective',
      dateCreated: '2026-02-01',
      coverImage: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',
      tags: ['Tyranids', 'Behemoth', 'Rojo', 'Negro', 'Caparazón', 'Contraste'],
      likes: 421,
      views: 2103,
      materials: [
        'Citadel Contrast: Blood Angels Red',
        'Citadel Contrast: Black Templar',
        'Wraithbone Spray (imprimación)',
        'Mephiston Red',
        'Evil Sunz Scarlet',
        'Abaddon Black',
        'Eshin Grey',
        'Screaming Skull',
        'Carroburg Crimson',
        'Ardcoat (barniz brillante para caparazón)'
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Imprimación Clara y Planificación',
          description: 'Imprime con Wraithbone spray para una base clara que hará brillar los Contrast. Identifica las zonas: piel (roja), caparazón (negro), garras/dientes (hueso).',
          images: [],
          tips: [
            'La imprimación clara es esencial para Contrast paints',
            'Planifica qué zonas serán de cada color antes de empezar',
            'Mantén la imprimación uniforme y no muy gruesa'
          ]
        },
        {
          stepNumber: 2,
          title: 'Piel Roja con Contrast',
          description: 'Aplica Blood Angels Red Contrast generosamente sobre toda la piel y músculos. El Contrast fluirá hacia los recesos automáticamente, creando sombras naturales. Una sola capa suele ser suficiente.',
          images: [],
          tips: [
            'Carga bien el pincel pero sin exceso que gotee',
            'Trabaja en secciones para evitar marcas de secado',
            'Deja que el Contrast haga su magia, no lo manipules mucho'
          ]
        },
        {
          stepNumber: 3,
          title: 'Caparazón Negro Brillante',
          description: 'Aplica Black Templar Contrast en todo el caparazón. Después de secar, añade una segunda capa para profundidad. Finalmente, aplica Ardcoat barniz brillante para efecto quitinoso.',
          images: [],
          tips: [
            'El caparazón debe verse duro y brillante como insecto',
            'Dos capas de Black Templar dan un negro profundo',
            'El barniz brillante es crucial para el efecto final'
          ]
        },
        {
          stepNumber: 4,
          title: 'Garras y Dientes de Hueso',
          description: 'Pinta garras y dientes con Screaming Skull. Sombrea con Agrax Earthshade diluido. Ilumina las puntas con White Scar para hacerlas afiladas y amenazantes.',
          images: [],
          tips: [
            'Las garras deben verse afiladas y letales',
            'Concentra las luces en las puntas y bordes',
            'Un toque de Blood for the Blood God en las puntas simula sangre fresca'
          ]
        },
        {
          stepNumber: 5,
          title: 'Iluminación de Piel Roja',
          description: 'Ilumina los músculos más prominentes con Evil Sunz Scarlet. Añade toques finales de Fire Dragon Bright en los puntos más altos para simular piel tensa y brillante.',
          images: [],
          tips: [
            'Imagina la luz golpeando músculos tensos',
            'Menos es más: solo ilumina áreas muy elevadas',
            'Mantén transiciones suaves con el rojo base'
          ]
        },
        {
          stepNumber: 6,
          title: 'Detalles Bioluminiscentes',
          description: 'Pinta órganos internos y venas con Moot Green. Añade White Scar en el centro para efecto de brillo. Esto añade interés visual y aspecto alienígena.',
          images: [],
          tips: [
            'Los detalles bioluminiscentes deben parecer brillar desde dentro',
            'Usa verde o morado para contraste con el rojo',
            'Aplica barniz brillante en estas áreas para realzar el efecto'
          ]
        },
        {
          stepNumber: 7,
          title: 'Base Orgánica',
          description: 'Crea una base con Astrogranite, añade Nurgle\'s Rot para charcos tóxicos. Esparce algunos restos de armadura imperial para narrativa. Pinta el borde con Abaddon Black.',
          images: [],
          tips: [
            'La base debe contar una historia de invasión',
            'Los charcos tóxicos añaden color y contraste',
            'Pequeños detalles (cascos, armas rotas) enriquecen la escena'
          ]
        }
      ],
      comments: [
        {
          id: 'c4',
          author: 'Norn_Queen_Alpha',
          date: '2026-02-02',
          text: 'Esquema perfecto para pintar enjambres rápidamente. Los Contrast paints son un salvavidas para hordas de Tyranids.'
        },
        {
          id: 'c5',
          author: 'Imperial_Guard_Survivor',
          date: '2026-02-03',
          text: 'Excelente guía. Ahora puedo pintar la pesadilla que destruyó mi regimiento... *solloza en esquina*'
        }
      ]
    }
  ],

  // Battle Reports Data
  battleReports: [
    {
      id: 'battle-sorcery-vs-fury',
      title: 'Hechicería vs Furia: Thousand Sons contra Space Wolves',
      factions: ['thousand-sons', 'space-wolves'],
      mission: 'Recuperar Reliquias',
      points: 2000,
      date: '2026-01-25',
      tags: ['Épico', 'Magia', 'CQC', 'Narrativo'],
      likes: 567,
      views: 2834,
      finalScore: {
        player1: 78,
        player2: 82
      },
      armies: {
        player1: {
          name: 'Legión de Magnus',
          faction: 'thousand-sons',
          list: [
            'Ahriman en Disco de Tzeentch (HQ)',
            '2x Exaltado en Disco (HQ)',
            '20x Rubric Marines con Warpflamers',
            '10x Rubric Marines con Inferno Boltguns',
            '10x Scarab Occult Terminators',
            '3x Spawn de Chaos',
            'Helbrute con Twin Lascannon',
            'Mutalith Vortex Beast'
          ]
        },
        player2: {
          name: 'Gran Compañía de Ragnar',
          faction: 'space-wolves',
          list: [
            'Ragnar Blackmane (HQ)',
            'Rune Priest en Armadura Terminator (HQ)',
            '10x Blood Claws',
            '10x Grey Hunters',
            '5x Wolf Guard Terminators',
            '10x Wulfen',
            '6x Thunderwolf Cavalry',
            'Stormfang Gunship',
            'Venerable Dreadnought Bjorn'
          ]
        }
      },
      narrative: [
        {
          turn: 1,
          phase: 'Despliegue',
          text: 'Las ruinas del mundo forja Prospero Secundus se extienden ante ambos ejércitos. Los Thousand Sons despliegan sus líneas con precisión matemática, mientras que los Space Wolves avanzan con furia apenas contenida. Ahriman levita sobre su disco, sus ojos brillando con poder arcano, mientras Ragnar Blackmane aúlla órdenes a sus guerreros.'
        },
        {
          turn: 1,
          phase: 'Movimiento Thousand Sons',
          text: 'Los hechiceros avanzan con confianza sobrenatural. Los Rubric Marines marchan en formación perfecta, sus armaduras azules brillando con energía del Warp. El Mutalith Vortex Beast se materializa en el flanco izquierdo, sus tentáculos retorciéndose con anticipación.'
        },
        {
          turn: 1,
          phase: 'Fase Psíquica',
          text: '¡El aire se rasga con poder arcano! Ahriman canaliza Doombolt, destruyendo instantáneamente a 4 Grey Hunters. Un Exaltado lanza Temporal Surge, teletransportando a los Scarab Occult Terminators directamente sobre un objetivo. El Rune Priest intenta negar pero falla - los dados de Tzeentch favorecen a sus hijos.'
        },
        {
          turn: 1,
          phase: 'Disparo Thousand Sons',
          text: 'Las Warpflamers abren fuego, bañando a los Blood Claws en llamas azules inmateriales. 6 Marines caen, sus armaduras derretidas. Los Inferno Boltguns de los Rubric Marines disparan con precisión sobrenatural, eliminando a 3 Grey Hunters más. El Helbrute destruye el Stormfang con un disparo crítico de lascannon.'
        },
        {
          turn: 1,
          phase: 'Contraataque Space Wolves',
          text: 'Ragnar no espera. "¡POR RUSS Y EL ALLFATHER!" Los Wulfen son desatados, cargando a través del campo de batalla con velocidad inhumana. Los Thunderwolf Cavalry galopan por el flanco derecho. Bjorn avanza implacablemente, su Assault Cannon rugiendo.'
        },
        {
          turn: 2,
          phase: 'Carga de los Wulfen',
          text: '¡Los Wulfen impactan contra los Scarab Occult Terminators con furia primordial! Garras rasgan armadura de Terminator. 3 Terminators caen, pero los supervivientes responden con Khopesh encantados. La batalla se vuelve brutal y sangrienta. El suelo tiembla con cada golpe.'
        },
        {
          turn: 2,
          phase: 'Ragnar Entra en Combate',
          text: 'Ragnar Blackmane salta sobre las ruinas, su espada Frostfang brillando. Carga directamente contra Ahriman. El duelo de campeones comienza - espada contra magia. Ragnar esquiva un rayo de Warp por centímetros, su espada cortando el disco de Ahriman. El hechicero cae pero se levita antes de tocar el suelo.'
        },
        {
          turn: 3,
          phase: 'Thunderwolf Cavalry',
          text: 'Los Thunderwolf Cavalry impactan el flanco de los Rubric Marines. Colmillos y garras desgarran armadura encantada. Pero los Rubric Marines no sienten miedo ni dolor - continúan disparando incluso mientras son desmembrados. 4 Cavalry caen ante el fuego concentrado de Warpflamer.'
        },
        {
          turn: 3,
          phase: 'Momento Crítico',
          text: 'Ahriman, herido pero no derrotado, canaliza todo su poder. Lanza Infernal Gateway, abriendo un portal al Warp. Demonios menores intentan emerger, pero el Rune Priest finalmente logra un Deny exitoso, cerrando el portal con runas de poder. La explosión psíquica resultante hiere a ambos hechiceros.'
        },
        {
          turn: 4,
          phase: 'Bjorn el Implacable',
          text: 'Bjorn alcanza el centro del campo de batalla. Su Assault Cannon destroza a los Spawn de Chaos. Con su Trueclaw, destroza al Mutalith Vortex Beast en combate cuerpo a cuerpo. "He luchado por 10,000 años," ruge, "¡y seguiré luchando!" Su presencia inspira a los Space Wolves cercanos.'
        },
        {
          turn: 5,
          phase: 'Lucha por los Objetivos',
          text: 'Ambos bandos luchan desesperadamente por las reliquias. Los últimos Rubric Marines defienden un objetivo con disciplina inhumana. Los Wolf Guard Terminators se teletransportan sobre otro objetivo. La batalla se ha convertido en un sangriento punto muerto.'
        },
        {
          turn: 5,
          phase: 'Conclusión',
          text: 'Cuando el humo se disipa, los Space Wolves controlan 3 objetivos por 2. Victoria táctica para los hijos de Russ, pero a un costo terrible. Ragnar mira el campo de batalla sembrado de cadáveres de ambos bandos. "Victoria," gruñe, "pero sin honor en masacrar autómatas sin alma." Ahriman se retira, ya planeando su venganza.'
        }
      ],
      keyMoments: [
        'Ahriman destruye el Stormfang en el turno 1 con Doombolt',
        'Los Wulfen eliminan a los Scarab Occult Terminators en combate brutal',
        'Ragnar hiere gravemente a Ahriman en duelo de campeones',
        'Bjorn destruye al Mutalith Vortex Beast en combate épico',
        'El Rune Priest niega Infernal Gateway, salvando a su ejército'
      ],
      mvp: 'Bjorn el Antiguo - Destruyó 3 unidades enemigas y controló 2 objetivos',
      comments: [
        {
          id: 'br1',
          author: 'Ragnar_Blackmane',
          date: '2026-01-26',
          text: '¡Batalla épica! Aunque ganamos, esos hechiceros son peligrosos. Perdí demasiados hermanos. La próxima vez, más Wulfen.'
        },
        {
          id: 'br2',
          author: 'Magnus_Did_Nothing_Wrong',
          date: '2026-01-26',
          text: 'Los lobos tuvieron suerte. Si Ahriman no hubiera fallado ese Infernal Gateway, la historia sería diferente. ¡Venganza pronto!'
        },
        {
          id: 'br3',
          author: 'Tzeentch_Enjoyer',
          date: '2026-01-27',
          text: 'Just as planned... o no. Los dados de Tzeentch son misteriosos. Gran narrativa, me encantó el duelo Ragnar vs Ahriman.'
        }
      ]
    },
    {
      id: 'battle-hive-invasion',
      title: 'Invasión del Enjambre: Tyranids vs Space Marines',
      factions: ['tyranids', 'space-marines'],
      mission: 'Muerte Eterna',
      points: 1500,
      date: '2026-02-05',
      tags: ['Horda', 'Defensiva', 'Heroico', 'Último Bastión'],
      likes: 892,
      views: 3421,
      finalScore: {
        player1: 45,
        player2: 51
      },
      armies: {
        player1: {
          name: 'Flota Enjambre Leviatán',
          faction: 'tyranids',
          list: [
            'Hive Tyrant con Wings y Devourers',
            'Neurothrope',
            '30x Termagants',
            '30x Hormagaunts',
            '3x Tyranid Warriors',
            '6x Genestealers',
            'Carnifex con Crushing Claws',
            'Trygon Prime',
            '3x Ripper Swarms'
          ]
        },
        player2: {
          name: '3ª Compañía Ultramarines',
          faction: 'space-marines',
          list: [
            'Capitán en Armadura Gravis',
            'Primaris Librarian',
            '10x Intercessors',
            '5x Hellblasters',
            '5x Assault Intercessors',
            '3x Aggressors',
            'Redemptor Dreadnought',
            'Impulsor',
            '5x Infiltrators'
          ]
        }
      },
      narrative: [
        {
          turn: 1,
          phase: 'Sombra en el Warp',
          text: 'El mundo de Ultramar Quintus está bajo asedio. La Sombra en el Warp bloquea todas las comunicaciones. El Capitán Titus de la 3ª Compañía observa el horizonte - una marea viviente de quitina y garras se aproxima. "Hermanos," voxea, "hoy defendemos no solo este mundo, sino el honor de Guilliman. ¡Por el Emperador!"'
        },
        {
          turn: 1,
          phase: 'La Marea Avanza',
          text: 'El enjambre avanza como una ola imparable. 30 Hormagaunts saltan sobre las ruinas, sus garras chasqueando con hambre. 30 Termagants los siguen, sus Fleshborers listos. El Hive Tyrant planea sobre ellos, sus alas membranosas bloqueando el sol. La sinápsis de la Mente Colmena pulsa con intención asesina.'
        },
        {
          turn: 1,
          phase: 'Fuego Disciplinado',
          text: 'Los Ultramarines responden con disciplina táctica perfecta. Los Hellblasters abren fuego - 5 rayos de plasma sobrecalentado vaporizan a 10 Hormagaunts instantáneamente. Los Intercessors disparan en ráfagas controladas, cada boltgun encontrando su objetivo. 15 Termagants caen, pero el enjambre no se detiene.'
        },
        {
          turn: 2,
          phase: 'Desde Abajo',
          text: '¡El suelo explota! El Trygon Prime emerge directamente detrás de las líneas Ultramarines, sus mandíbulas goteando ácido. Los Infiltrators intentan reaccionar pero son demasiado lentos. 3 caen antes de poder disparar. El túnel que dejó el Trygon permite que los Genestealers emerjan también.'
        },
        {
          turn: 2,
          phase: 'Contraataque Heroico',
          text: 'El Capitán Titus no duda. "¡COURAGE AND HONOUR!" Carga directamente contra el Trygon con sus Assault Intercessors. Su Power Sword corta carne alienígena. El Trygon ruge, sus garras perforando la armadura Gravis, pero Titus no cede. El Redemptor Dreadnought se une al combate, su Onslaught Gatling Cannon rugiendo.'
        },
        {
          turn: 3,
          phase: 'Genestealers Desatados',
          text: 'Los Genestealers cargan contra los Hellblasters. Sus garras rasgan armadura Primaris como papel. 3 Hellblasters caen en segundos. Los supervivientes disparan a quemarropa - un Genestealer explota en gore alienígena, pero los otros continúan. El combate cuerpo a cuerpo es brutal y rápido.'
        },
        {
          turn: 3,
          phase: 'Poder Psíquico',
          text: 'El Librarian Primaris canaliza el poder del Emperador. Lanza Smite contra el Neurothrope - energía psíquica choca contra energía psíquica. La batalla de voluntades es feroz. Finalmente, el Librarian prevalece, hiriendo gravemente al Neurothrope. Pero el esfuerzo lo deja vulnerable.'
        },
        {
          turn: 4,
          phase: 'El Carnifex Embiste',
          text: 'El Carnifex carga a través de las ruinas como un tanque viviente. Sus Crushing Claws destrozan el Impulsor, el vehículo explota en llamas. Los Aggressors disparan sus Flamestorm Gauntlets, bañando al Carnifex en promethium ardiente. La criatura ruge de dolor pero continúa avanzando, imparable.'
        },
        {
          turn: 4,
          phase: 'Último Bastión',
          text: 'Los Ultramarines se reagrupan alrededor del objetivo central. Solo quedan 12 Marines de los 30 originales. El Capitán Titus, herido pero desafiante, planta el estandarte de la compañía. "¡Aquí nos quedamos! ¡Aquí luchamos! ¡Aquí GANAMOS!" Los Marines restantes forman un círculo defensivo.'
        },
        {
          turn: 5,
          phase: 'Asalto Final',
          text: 'El enjambre lanza su asalto final. Hormagaunts, Termagants, y Tyranid Warriors convergen en el círculo Ultramarine. El fuego de boltgun nunca cesa. El Redemptor Dreadnought lucha rodeado de cadáveres alienígenas. Cada Marine vende cara su vida.'
        },
        {
          turn: 5,
          phase: 'Victoria Pírrica',
          text: 'Cuando el último Tyranid cae, solo 5 Ultramarines permanecen en pie. El Capitán Titus, el Librarian, y 3 Intercessors. El campo de batalla está cubierto de cadáveres de ambos bandos. "Victoria," dice Titus, mirando a sus hermanos caídos. "Pero a qué costo." En la distancia, más bioformas se aproximan. La guerra continúa.'
        }
      ],
      keyMoments: [
        'Trygon Prime emerge detrás de las líneas enemigas',
        'Capitán Titus mata al Trygon en combate épico',
        'Genestealers eliminan a los Hellblasters',
        'Carnifex destruye el Impulsor',
        'Último bastión: 5 Marines vs 20+ Tyranids'
      ],
      mvp: 'Capitán Titus - Mató al Trygon Prime y mantuvo el objetivo central',
      comments: [
        {
          id: 'br4',
          author: 'Calgar_Approved',
          date: '2026-02-06',
          text: 'Titus honra el legado de Guilliman. Táctica perfecta bajo presión. Esos 5 Marines merecen servos de cráneo de oro.'
        },
        {
          id: 'br5',
          author: 'Hive_Fleet_Player',
          date: '2026-02-06',
          text: 'Casi los tenía. Si el Carnifex hubiera llegado un turno antes... La próxima vez, más sinápsis.'
        },
        {
          id: 'br6',
          author: 'Xenos_Hunter_40k',
          date: '2026-02-07',
          text: '¡Épica batalla! Me encanta cómo los Marines mantuvieron la posición. Esa es la diferencia entre Marines y Guardias - disciplina bajo fuego.'
        }
      ]
    }
  ],

  // Social Features State
  userLikes: [],
  userFavorites: [],

  // Actions
  setCurrentView: (view) => set({ currentView: view }),

  selectPlanet: (planetId) => {
    const army = get().armies.find(a => a.id === planetId);
    if (army) {
      set({
        selectedPlanet: army,
        isTransitioning: true,
        cameraTarget: army.position,
      });
    }
  },

  enterPlanet: () => {
    set({
      currentView: 'planet',
      isTransitioning: false
    });
  },

  returnToGalaxy: () => {
    set({
      currentView: 'galaxy',
      selectedPlanet: null,
      isTransitioning: true,
      cameraTarget: [0, 0, 0],
      cameraPosition: [0, 0, 50]
    });
    setTimeout(() => set({ isTransitioning: false }), 2000);
  },

  selectImage: (image) => set({ selectedImage: image }),
  clearSelectedImage: () => set({ selectedImage: null }),

  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),

  addImageToArmy: (armyId, imageData) => {
    set((state) => ({
      armies: state.armies.map(army =>
        army.id === armyId
          ? { ...army, images: [...army.images, imageData] }
          : army
      )
    }));
  },

  removeImageFromArmy: (armyId, imageId) => {
    set((state) => ({
      armies: state.armies.map(army =>
        army.id === armyId
          ? { ...army, images: army.images.filter(img => img.id !== imageId) }
          : army
      )
    }));
  },

  finishTransition: () => set({ isTransitioning: false }),

  // Painting Guide Actions
  selectGuide: (guideId) => set({ selectedGuide: get().paintingGuides.find(g => g.id === guideId) }),
  clearSelectedGuide: () => set({ selectedGuide: null }),

  // Battle Report Actions
  selectBattleReport: (reportId) => set({ selectedBattleReport: get().battleReports.find(r => r.id === reportId) }),
  clearSelectedBattleReport: () => set({ selectedBattleReport: null }),

  // Social Actions
  toggleLike: (contentId, contentType) => {
    const userLikes = get().userLikes;
    const isLiked = userLikes.includes(contentId);

    if (isLiked) {
      // Unlike
      set({ userLikes: userLikes.filter(id => id !== contentId) });

      // Decrement like count
      if (contentType === 'guide') {
        set({
          paintingGuides: get().paintingGuides.map(g =>
            g.id === contentId ? { ...g, likes: g.likes - 1 } : g
          )
        });
      } else if (contentType === 'report') {
        set({
          battleReports: get().battleReports.map(r =>
            r.id === contentId ? { ...r, likes: r.likes - 1 } : r
          )
        });
      }
    } else {
      // Like
      set({ userLikes: [...userLikes, contentId] });

      // Increment like count
      if (contentType === 'guide') {
        set({
          paintingGuides: get().paintingGuides.map(g =>
            g.id === contentId ? { ...g, likes: g.likes + 1 } : g
          )
        });
      } else if (contentType === 'report') {
        set({
          battleReports: get().battleReports.map(r =>
            r.id === contentId ? { ...r, likes: r.likes + 1 } : r
          )
        });
      }
    }
  },

  toggleFavorite: (contentId) => {
    const userFavorites = get().userFavorites;
    const isFavorited = userFavorites.includes(contentId);

    if (isFavorited) {
      set({ userFavorites: userFavorites.filter(id => id !== contentId) });
    } else {
      set({ userFavorites: [...userFavorites, contentId] });
    }
  },

  addComment: (contentId, contentType, commentText, author = 'Usuario') => {
    const newComment = {
      id: `comment-${Date.now()}`,
      author,
      text: commentText,
      date: new Date().toISOString(),
      likes: 0
    };

    if (contentType === 'guide') {
      set({
        paintingGuides: get().paintingGuides.map(g =>
          g.id === contentId ? { ...g, comments: [...g.comments, newComment] } : g
        )
      });
    } else if (contentType === 'report') {
      set({
        battleReports: get().battleReports.map(r =>
          r.id === contentId ? { ...r, comments: [...r.comments, newComment] } : r
        )
      });
    }
  },

  incrementViews: (contentId, contentType) => {
    if (contentType === 'guide') {
      set({
        paintingGuides: get().paintingGuides.map(g =>
          g.id === contentId ? { ...g, views: g.views + 1 } : g
        )
      });
    } else if (contentType === 'report') {
      set({
        battleReports: get().battleReports.map(r =>
          r.id === contentId ? { ...r, views: r.views + 1 } : r
        )
      });
    }
  },
}));
