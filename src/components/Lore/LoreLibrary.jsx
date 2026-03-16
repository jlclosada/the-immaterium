import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';
import { useState } from 'react';

export default function LoreLibrary() {
    const { armies, setCurrentView } = useStore();
    const [selectedFaction, setSelectedFaction] = useState(null);

    const loreEntries = [
        {
            id: 'thousand-sons-lore',
            faction: 'thousand-sons',
            title: 'Los Thousand Sons: Hijos de Magnus',
            subtitle: 'La Caída de los Hechiceros',
            content: `Los Thousand Sons fueron una vez la XV Legión de los Space Marines, liderados por el Primarca Magnus el Rojo. Eran maestros de las artes psíquicas, buscadores de conocimiento arcano en toda la galaxia.

Durante la Gran Cruzada, Magnus intentó advertir al Emperador sobre la traición de Horus, pero al hacerlo, rompió las barreras psíquicas del Palacio Imperial. El Emperador, enfurecido, ordenó a Leman Russ destruir Prospero, el mundo natal de los Thousand Sons.

En la desesperación, Magnus hizo un pacto con Tzeentch, el Dios del Caos del cambio y la hechicería. Aunque salvó a su legión, el precio fue terrible: la Rubric de Ahriman, un hechizo destinado a detener las mutaciones del Caos, convirtió a la mayoría de los Thousand Sons en autómatas sin alma - los Rubric Marines.

Ahora, los Thousand Sons sirven a Tzeentch desde el Planeta de los Hechiceros en el Ojo del Terror, buscando venganza contra el Imperio que los traicionó y conocimiento prohibido para deshacer su maldición.`,
            keyFigures: [
                'Magnus el Rojo - Primarca Demonio',
                'Ahriman - Archihechicero y creador de la Rubric',
                'Los Exaltados - Hechiceros que mantienen su consciencia',
                'Rubric Marines - Guerreros autómatas sin alma'
            ],
            quote: '"Todo es polvo." - Ahriman'
        },
        {
            id: 'space-wolves-lore',
            faction: 'space-wolves',
            title: 'Los Space Wolves: Lobos de Fenris',
            subtitle: 'Los Ejecutores del Emperador',
            content: `Los Space Wolves, la VI Legión, son los guerreros más feroces del Emperador. Reclutados de las tribus salvajes de Fenris, un mundo de hielo mortal, estos Marines combinan tecnología avanzada con instintos primordiales.

Liderados por Leman Russ, el Lobo Primarca, los Space Wolves fueron conocidos como los "Ejecutores del Emperador" - la legión enviada cuando otras legiones fallaban o traicionaban. Fueron ellos quienes destruyeron Prospero y dispersaron a los Thousand Sons.

A diferencia de otras legiones, los Space Wolves abrazan su naturaleza salvaje. Sus guerreros más feroces, los Wulfen, sucumben parcialmente a la Maldición del Wulfen, transformándose en criaturas semi-lupinas de furia imparable.

Organizados en Grandes Compañías en lugar de compañías estándar, cada una liderada por un Señor Lobo, los Space Wolves mantienen sus propias tradiciones y rechazan el Codex Astartes. Son leales solo al Emperador y a Russ, y luchan con honor salvaje contra todos los enemigos de la humanidad.`,
            keyFigures: [
                'Leman Russ - Primarca desaparecido',
                'Logan Grimnar - Gran Lobo actual',
                'Bjorn el Antiguo - Dreadnought de 10,000 años',
                'Ragnar Blackmane - Joven Señor Lobo legendario'
            ],
            quote: '"Por Russ y el Allfather!" - Grito de guerra de los Space Wolves'
        },
        {
            id: 'tyranids-lore',
            faction: 'tyranids',
            title: 'Los Tyranids: La Gran Devorador',
            subtitle: 'Hambre Infinita del Vacío',
            content: `Los Tyranids son una amenaza extragaláctica sin precedentes. No son una raza, sino un super-organismo - billones de criaturas controladas por una única Mente Colmena de inteligencia incomprensible.

Llegaron a la galaxia en flotas enjambre masivas, cada una capaz de consumir mundos enteros. Los Tyranids no conquistan - devoran. Cada planeta que invaden es despojado de toda biomasa, desde el organismo más grande hasta la bacteria más pequeña.

La Mente Colmena aprende de cada batalla, adaptando sus bioformas para contrarrestar las tácticas enemigas. Crean criaturas especializadas para cada propósito: Hormagaunts para asaltos rápidos, Carnifex como tanques vivientes, Hive Tyrants como comandantes sinápticos.

Tres grandes Flotas Enjambre han invadido la galaxia: Behemoth, Kraken y Leviatán. Cada una más grande y adaptada que la anterior. Los xeno-biólogos imperiales temen que estas sean solo la vanguardia - que la verdadera Flota Enjambre aún está por llegar.`,
            keyFigures: [
                'La Mente Colmena - Inteligencia colectiva',
                'Hive Tyrants - Comandantes sinápticos',
                'Swarmlord - Bioforma táctica suprema',
                'Norn Queens - Creadoras de bioformas'
            ],
            quote: '"No negocian. No se rinden. Solo consumen." - Inquisidor Kryptman'
        },
        {
            id: 'chaos-lore',
            faction: 'chaos-marines',
            title: 'Los Marines del Caos: Traidores Caídos',
            subtitle: 'La Herejía de Horus',
            content: `Hace 10,000 años, la mitad de las legiones de Space Marines se volvieron contra el Emperador en la Herejía de Horus, la mayor traición en la historia de la humanidad. Liderados por Horus Lupercal, el hijo favorito del Emperador, estos Marines cayeron bajo la influencia de los Dioses del Caos.

Los Marines del Caos son veteranos de la Larga Guerra, guerreros que han luchado durante milenios en el Ojo del Terror, donde el tiempo fluye diferente. Algunos recuerdan personalmente la Gran Cruzada y el asedio de Terra.

Divididos en legiones y warbands, cada uno sirve a diferentes aspectos del Caos:
- Los World Eaters de Khorne buscan solo sangre y cráneos
- Los Emperor's Children de Slaanesh persiguen sensaciones extremas
- Los Death Guard de Nurgle esparcen plaga y desesperación
- Los Thousand Sons de Tzeentch buscan conocimiento prohibido

Corrompidos por el Warp, muchos han mutado más allá del reconocimiento. Pero bajo la armadura retorcida, siguen siendo Space Marines - guerreros genéticamente mejorados con 10,000 años de experiencia en guerra.`,
            keyFigures: [
                'Abaddon el Saqueador - Señor de la Guerra del Caos',
                'Los Primarcas Demonio - Magnus, Mortarion, Fulgrim, Angron',
                'Señores del Caos - Comandantes de warbands',
                'Campeones del Caos - Guerreros bendecidos por los dioses'
            ],
            quote: '"¡Muerte al Falso Emperador!" - Grito de guerra del Caos'
        },
        {
            id: 'space-marines-lore',
            faction: 'space-marines',
            title: 'Los Space Marines: Ángeles de la Muerte',
            subtitle: 'Los Mejores Guerreros de la Humanidad',
            content: `Los Adeptus Astartes, conocidos como Space Marines, son los guerreros de élite del Imperio de la Humanidad. Creados por el Emperador mediante ingeniería genética avanzada, cada Marine es un superhombre - más fuerte, rápido y resistente que cualquier humano normal.

El proceso de creación es brutal. Solo uno de cada mil aspirantes sobrevive las pruebas y la implantación de los 19 órganos especiales que los transforman. Aquellos que lo logran se convierten en armas vivientes, capaces de luchar sin dormir durante semanas y sobrevivir heridas que matarían a cualquier otro.

Organizados en Capítulos de 1,000 Marines, cada uno con su propia cultura y especialización, los Space Marines son la primera línea de defensa contra las amenazas más terribles de la galaxia: invasiones alienígenas, incursiones del Caos, y herejes traidores.

Los Ultramarines, descendientes de Roboute Guilliman, son considerados el Capítulo modelo. Siguen el Codex Astartes al pie de la letra, un tratado de táctica militar escrito por su Primarca. Otros capítulos, como los Space Wolves o Blood Angels, mantienen sus propias tradiciones.`,
            keyFigures: [
                'Roboute Guilliman - Primarca de los Ultramarines, Lord Comandante Imperial',
                'Marneus Calgar - Señor del Capítulo de los Ultramarines',
                'Capitanes de Compañía - Líderes tácticos',
                'Bibliotecarios - Psíquicos entrenados'
            ],
            quote: '"No conocerán el miedo." - Mantra de los Space Marines'
        },
        {
            id: 'emperors-children-lore',
            faction: 'emperors-children',
            title: 'Los Emperor\'s Children: Perfección Corrompida',
            subtitle: 'Esclavos de Slaanesh',
            content: `Los Emperor's Children fueron una vez la III Legión, obsesionados con la perfección en todas sus formas. Bajo el Primarca Fulgrim, buscaban la excelencia en combate, arte y cultura. Eran los guerreros más refinados del Emperador.

Pero su búsqueda de perfección los llevó a la ruina. Fulgrim fue corrompido por una espada demoníaca, y lentamente, toda la legión cayó bajo el hechizo de Slaanesh, el Dios del Caos del exceso y la sensación.

Durante la Herejía, los Emperor's Children se transformaron de guerreros nobles en depravados buscadores de sensaciones extremas. Modificaron sus cuerpos y armaduras para experimentar cada sensación posible, sin importar cuán retorcida.

Ahora, los Emperor's Children son una pesadilla viviente. Luchan no por estrategia o conquista, sino por la pura experiencia del combate. Usan armas sónicas que destrozan cuerpos y mentes. Sus Noise Marines tocan sinfonías de destrucción que matan con sonido puro.

Liderados por el Primarca Demonio Fulgrim, buscan sensaciones cada vez más extremas en un ciclo sin fin de exceso y depravación.`,
            keyFigures: [
                'Fulgrim - Primarca Demonio de Slaanesh',
                'Lucius el Eterno - Campeón inmortal',
                'Noise Marines - Guerreros sónicos',
                'Señores del Caos Slaaneshi - Buscadores de perfección retorcida'
            ],
            quote: '"¡Hijos del Emperador! ¡Muerte a sus enemigos!" - Grito de guerra corrupto'
        }
    ];

    const filteredEntries = selectedFaction
        ? loreEntries.filter(entry => entry.faction === selectedFaction)
        : loreEntries;

    const handleFactionFilter = (factionId) => {
        setSelectedFaction(selectedFaction === factionId ? null : factionId);
    };

    return (
        <motion.div
            className="lore-library"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: '6rem 2rem 2rem',
                overflowY: 'auto',
                background: 'linear-gradient(180deg, rgba(10,10,20,0.95) 0%, rgba(5,5,15,0.98) 100%)',
                zIndex: 100
            }}
        >
            {/* Close Button */}
            <motion.button
                onClick={() => setCurrentView('galaxy')}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    top: '1.5rem',
                    right: '1.5rem',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: '#fff',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(10px)'
                }}
            >
                ✕
            </motion.button>

            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ marginBottom: '3rem', textAlign: 'center' }}
            >
                <h1 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '3rem',
                    background: 'linear-gradient(90deg, #ffd700, #ff6600, #8b0000)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    BIBLIOTECA DE LORE
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
                    Historia y trasfondo de las facciones del universo Warhammer 40,000
                </p>
            </motion.div>

            {/* Faction Filters */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginBottom: '3rem'
                }}
            >
                {armies.map(army => (
                    <motion.button
                        key={army.id}
                        className="glass-panel"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleFactionFilter(army.id)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            cursor: 'pointer',
                            border: selectedFaction === army.id ? `2px solid ${army.color}` : '1px solid rgba(255,255,255,0.1)',
                            background: selectedFaction === army.id ? `${army.color}22` : 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                        }}
                    >
                        <img
                            src={army.iconUrl}
                            alt={army.name}
                            style={{
                                width: '30px',
                                height: '30px',
                                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                            }}
                        />
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{army.name}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Lore Entries */}
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                display: 'grid',
                gap: '2rem'
            }}>
                {filteredEntries.map((entry, index) => {
                    const army = armies.find(a => a.id === entry.faction);

                    return (
                        <motion.div
                            key={entry.id}
                            className="glass-panel"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            style={{
                                padding: '2rem',
                                borderLeft: `4px solid ${army?.color || '#fff'}`
                            }}
                        >
                            {/* Header with Icon */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                <img
                                    src={army?.iconUrl}
                                    alt={army?.name}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        filter: `drop-shadow(0 0 12px ${army?.color})`
                                    }}
                                />
                                <div>
                                    <h2 style={{
                                        fontSize: '2rem',
                                        color: army?.color || '#fff',
                                        marginBottom: '0.3rem'
                                    }}>
                                        {entry.title}
                                    </h2>
                                    <p style={{
                                        fontSize: '1.1rem',
                                        color: '#aaa',
                                        fontStyle: 'italic'
                                    }}>
                                        {entry.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{
                                color: '#ccc',
                                lineHeight: '1.8',
                                marginBottom: '2rem',
                                whiteSpace: 'pre-line'
                            }}>
                                {entry.content}
                            </div>

                            {/* Key Figures */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{
                                    fontSize: '1.3rem',
                                    color: '#fff',
                                    marginBottom: '1rem'
                                }}>
                                    Figuras Clave:
                                </h3>
                                <ul style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    display: 'grid',
                                    gap: '0.5rem'
                                }}>
                                    {entry.keyFigures.map((figure, i) => (
                                        <li key={i} style={{
                                            color: '#aaa',
                                            paddingLeft: '1.5rem',
                                            position: 'relative'
                                        }}>
                                            <span style={{
                                                position: 'absolute',
                                                left: 0,
                                                color: army?.color
                                            }}>·</span>
                                            {figure}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Quote */}
                            <div style={{
                                borderLeft: `3px solid ${army?.color}`,
                                paddingLeft: '1.5rem',
                                fontStyle: 'italic',
                                color: '#888',
                                fontSize: '1.1rem'
                            }}>
                                {entry.quote}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filteredEntries.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '4rem 2rem',
                        color: '#888'
                    }}
                >
                    <p style={{ fontSize: '1.2rem' }}>No hay entradas de lore para esta facción</p>
                </motion.div>
            )}
        </motion.div>
    );
}
