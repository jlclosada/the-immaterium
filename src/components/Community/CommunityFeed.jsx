import { motion } from 'framer-motion';
import { useStore } from '../../stores/useStore';

export default function CommunityFeed() {
    const { paintingGuides, battleReports, armies, setCurrentView } = useStore();

    // Generate activity feed from guides, reports, and armies
    const generateActivityFeed = () => {
        const activities = [];

        // Add painting guides as activities
        paintingGuides.forEach(guide => {
            activities.push({
                id: `guide-${guide.id}`,
                type: 'guide',
                title: `Nueva guía de pintura: ${guide.title}`,
                author: guide.author,
                date: guide.dateCreated,
                thumbnail: guide.coverImage,
                faction: guide.faction,
                likes: guide.likes,
                views: guide.views,
                comments: guide.comments.length,
                data: guide
            });
        });

        // Add battle reports as activities
        battleReports.forEach(report => {
            activities.push({
                id: `report-${report.id}`,
                type: 'report',
                title: report.title,
                author: 'Battle Reporter',
                date: report.date,
                thumbnail: null,
                factions: report.factions,
                likes: report.likes,
                views: report.views,
                comments: report.comments.length,
                data: report
            });
        });

        // Sort by date (newest first)
        return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const activityFeed = generateActivityFeed();

    const handleActivityClick = (activity) => {
        if (activity.type === 'guide') {
            useStore.getState().selectGuide(activity.data.id);
            setCurrentView('guideDetail');
        } else if (activity.type === 'report') {
            useStore.getState().selectBattleReport(activity.data.id);
            setCurrentView('battleReportDetail');
        }
    };

    const getFactionIcon = (factionId) => {
        const army = armies.find(a => a.id === factionId);
        return army?.iconUrl || '';
    };

    const getFactionColor = (factionId) => {
        const army = armies.find(a => a.id === factionId);
        return army?.color || '#fff';
    };

    return (
        <motion.div
            className="community-feed"
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
                    background: 'linear-gradient(90deg, #00ced1, #ff6600, #ff0064)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    FEED DE LA COMUNIDAD
                </h1>
                <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
                    Últimas actividades, guías y batallas de la comunidad
                </p>
            </motion.div>

            {/* Stats Overview */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    maxWidth: '1200px',
                    margin: '0 auto 3rem'
                }}
            >
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00ced1', marginBottom: '0.5rem' }}>
                        {paintingGuides.length}
                    </div>
                    <div style={{ color: '#aaa' }}>Guías de Pintura</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff6600', marginBottom: '0.5rem' }}>
                        {battleReports.length}
                    </div>
                    <div style={{ color: '#aaa' }}>Informes de Batalla</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff0064', marginBottom: '0.5rem' }}>
                        {armies.length}
                    </div>
                    <div style={{ color: '#aaa' }}>Ejércitos Activos</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#87cefa', marginBottom: '0.5rem' }}>
                        {activityFeed.reduce((sum, a) => sum + a.views, 0)}
                    </div>
                    <div style={{ color: '#aaa' }}>Vistas Totales</div>
                </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
                style={{
                    maxWidth: '900px',
                    margin: '0 auto'
                }}
            >
                <h2 style={{
                    fontSize: '1.8rem',
                    marginBottom: '2rem',
                    color: '#fff',
                    textAlign: 'center'
                }}>
                    Actividad Reciente
                </h2>

                {activityFeed.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        className="glass-panel"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.01, x: 5 }}
                        onClick={() => handleActivityClick(activity)}
                        style={{
                            cursor: 'pointer',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            gap: '1.5rem',
                            alignItems: 'center'
                        }}
                    >
                        {/* Thumbnail or Icon */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            flexShrink: 0,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {activity.thumbnail ? (
                                <img
                                    src={activity.thumbnail}
                                    alt={activity.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    {activity.factions?.map(factionId => (
                                        <img
                                            key={factionId}
                                            src={getFactionIcon(factionId)}
                                            alt={factionId}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1 }}>
                            {/* Type Badge */}
                            <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    background: activity.type === 'guide' ? 'rgba(0,206,209,0.2)' : 'rgba(255,100,100,0.2)',
                                    color: activity.type === 'guide' ? '#00ced1' : '#ff6464',
                                    border: `1px solid ${activity.type === 'guide' ? '#00ced1' : '#ff6464'}`
                                }}>
                                    {activity.type === 'guide' ? '🎨 GUÍA' : '⚔️ BATALLA'}
                                </span>
                            </div>

                            {/* Title */}
                            <h3 style={{
                                fontSize: '1.2rem',
                                marginBottom: '0.5rem',
                                color: '#fff'
                            }}>
                                {activity.title}
                            </h3>

                            {/* Meta Info */}
                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                marginBottom: '0.8rem',
                                fontSize: '0.9rem',
                                color: '#aaa',
                                flexWrap: 'wrap'
                            }}>
                                <span>👤 {activity.author}</span>
                                <span>📅 {new Date(activity.date).toLocaleDateString('es-ES')}</span>
                                {activity.faction && (
                                    <span style={{ color: getFactionColor(activity.faction) }}>
                                        🎯 {armies.find(a => a.id === activity.faction)?.name}
                                    </span>
                                )}
                            </div>

                            {/* Social Stats */}
                            <div style={{
                                display: 'flex',
                                gap: '1.5rem',
                                fontSize: '0.9rem',
                                color: '#888'
                            }}>
                                <span>❤️ {activity.likes}</span>
                                <span>👁️ {activity.views}</span>
                                <span>💬 {activity.comments}</span>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div style={{
                            color: '#00ced1',
                            fontSize: '1.5rem'
                        }}>
                            →
                        </div>
                    </motion.div>
                ))}

                {activityFeed.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            color: '#888'
                        }}
                    >
                        <p style={{ fontSize: '1.2rem' }}>No hay actividad reciente</p>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
}
