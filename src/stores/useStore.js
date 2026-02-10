import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // Navigation state
  currentView: 'galaxy', // 'galaxy' | 'planet' | 'gallery'
  selectedPlanet: null,
  selectedImage: null,

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
}));
