import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { parseArmyList } from '../../utils/armyListParser';

// ─── Credential helpers ──────────────────────────────────────────────────────
const CRED_KEY = 'nr-credentials';

function loadCreds() {
  try { return JSON.parse(localStorage.getItem(CRED_KEY)) || { login: '', password: '' }; }
  catch { return { login: '', password: '' }; }
}
function saveCreds(creds) {
  localStorage.setItem(CRED_KEY, JSON.stringify(creds));
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-display)',
      fontSize: '1rem',
      letterSpacing: '1.5px',
      color: 'var(--color-primary)',
      margin: '0 0 1rem',
      textTransform: 'uppercase',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    }}>
      {children}
    </h3>
  );
}

function InfoBanner({ type = 'info', children }) {
  const colors = {
    info: { bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.3)', text: '#7dd3fc' },
    success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.3)', text: '#86efac' },
    error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5' },
    warning: { bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.3)', text: '#fde047' },
  };
  const c = colors[type];
  return (
    <div style={{
      padding: '0.85rem 1rem',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '10px',
      color: c.text,
      fontSize: '0.85rem',
      lineHeight: 1.6,
    }}>
      {children}
    </div>
  );
}

// ─── Parsed list preview ─────────────────────────────────────────────────────

function ParsedListPreview({ parsed }) {
  if (!parsed) return null;
  return (
    <div style={{
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      padding: '1rem 1.25rem',
      fontSize: '0.82rem',
    }}>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {parsed.armyName && (
          <div>
            <span style={{ color: '#666', display: 'block', fontSize: '0.7rem', marginBottom: '2px' }}>EJÉRCITO</span>
            <span style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{parsed.armyName}</span>
          </div>
        )}
        {parsed.detachment && (
          <div>
            <span style={{ color: '#666', display: 'block', fontSize: '0.7rem', marginBottom: '2px' }}>DESTACAMENTO</span>
            <span style={{ color: '#fff' }}>{parsed.detachment}</span>
          </div>
        )}
        {parsed.totalPoints > 0 && (
          <div>
            <span style={{ color: '#666', display: 'block', fontSize: '0.7rem', marginBottom: '2px' }}>PUNTOS</span>
            <span style={{ color: '#f97316', fontFamily: 'var(--font-display)' }}>{parsed.totalPoints} pts</span>
          </div>
        )}
      </div>
      {parsed.categories?.map(cat => (
        cat.units.length > 0 && (
          <div key={cat.name} style={{ marginBottom: '0.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
              {cat.name} ({cat.units.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {cat.units.map((unit, i) => (
                <span key={i} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  padding: '0.2rem 0.5rem',
                  color: '#ccc',
                  fontSize: '0.75rem',
                }}>
                  {unit.name} {unit.pts > 0 && <span style={{ color: '#f97316' }}>({unit.pts} pts)</span>}
                </span>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NewRecruitManager() {
  const [tab, setTab] = useState('import');
  const [creds, setCreds] = useState(loadCreds());
  const [credsVisible, setCredsVisible] = useState(false);
  const [credsSaved, setCredsSaved] = useState(false);

  // Import state
  const [importText, setImportText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [parseError, setParseError] = useState(null);

  // Export state
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [exportStatus, setExportStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [exportMsg, setExportMsg] = useState('');
  const [exportHistory, setExportHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nr-export-history')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    api.getBattleReports().then(setReports).catch(() => {});
  }, []);

  const handleSaveCreds = () => {
    saveCreds(creds);
    setCredsSaved(true);
    setTimeout(() => setCredsSaved(false), 2500);
  };

  const handleParse = () => {
    if (!importText.trim()) return;
    try {
      const result = parseArmyList(importText);
      setParsed(result);
      setParseError(null);
    } catch (e) {
      setParseError(e.message);
      setParsed(null);
    }
  };

  const handleExport = async () => {
    if (!selectedReport) return;
    if (!creds.login || !creds.password) {
      setExportStatus('error');
      setExportMsg('Introduce tus credenciales de New Recruit primero.');
      return;
    }

    setExportStatus('loading');
    setExportMsg('');

    try {
      const result = await api.newRecruitExport({
        report: selectedReport,
        login: creds.login,
        password: creds.password,
      });

      const entry = {
        id: Date.now(),
        reportTitle: selectedReport.title,
        date: new Date().toISOString(),
        status: 'success',
        nrId: result?.id || null,
      };
      const updated = [entry, ...exportHistory].slice(0, 10);
      setExportHistory(updated);
      localStorage.setItem('nr-export-history', JSON.stringify(updated));

      setExportStatus('success');
      setExportMsg(result?.message || `Informe enviado correctamente a New Recruit${result?.id ? ` (ID: ${result.id})` : ''}.`);
    } catch (e) {
      const entry = {
        id: Date.now(),
        reportTitle: selectedReport.title,
        date: new Date().toISOString(),
        status: 'error',
        error: e.message,
      };
      const updated = [entry, ...exportHistory].slice(0, 10);
      setExportHistory(updated);
      localStorage.setItem('nr-export-history', JSON.stringify(updated));

      setExportStatus('error');
      setExportMsg(e.message || 'Error al conectar con New Recruit.');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', margin: 0, color: '#fff', letterSpacing: '2px' }}>
              NEW RECRUIT
            </h1>
            <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>
              Integración con <a href="https://www.newrecruit.eu" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>newrecruit.eu</a> — importa listas y exporta torneos
            </p>
          </div>
        </div>
      </motion.div>

      {/* Credentials section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setCredsVisible(!credsVisible)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '1px',
            width: '100%', justifyContent: 'space-between',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={creds.login ? '#22c55e' : '#888'} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ color: creds.login ? '#22c55e' : '#888' }}>
              {creds.login ? `Conectado como ${creds.login}` : 'Credenciales New Recruit (no configuradas)'}
            </span>
          </span>
          <span style={{ color: '#555', fontSize: '0.8rem' }}>{credsVisible ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {credsVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <InfoBanner type="info">
                  Las credenciales se guardan <strong>solo en tu navegador</strong> (localStorage). Nunca se envían a nuestro servidor — solo se usan para autenticar directamente con New Recruit.
                </InfoBanner>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '0.4rem', letterSpacing: '1px' }}>NR EMAIL / LOGIN</label>
                    <input
                      type="email"
                      value={creds.login}
                      onChange={e => setCreds(c => ({ ...c, login: e.target.value }))}
                      placeholder="tu@email.com"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '0.4rem', letterSpacing: '1px' }}>NR PASSWORD</label>
                    <input
                      type="password"
                      value={creds.password}
                      onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
                      placeholder="••••••••"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={handleSaveCreds} style={btnPrimary}>
                    {credsSaved ? '✓ Guardadas' : 'Guardar credenciales'}
                  </button>
                  <a
                    href="https://www.newrecruit.eu"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...btnGhost, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    Crear cuenta en NR →
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'import', label: 'Importar lista', icon: '↓' },
          { id: 'export', label: 'Exportar torneo', icon: '↑' },
          { id: 'history', label: 'Historial', icon: '🕐' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              border: `1px solid ${tab === t.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
              background: tab === t.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
              color: tab === t.id ? 'var(--color-primary)' : '#888',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>{t.icon}</span> {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Tab: Import ─────────────────────────────────────────────────────── */}
      {tab === 'import' && (
        <motion.div key="import" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={card}>
            <SectionTitle>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Pegar lista de New Recruit
            </SectionTitle>

            <InfoBanner type="info" style={{ marginBottom: '1rem' }}>
              Pega aquí el texto de tu lista exportada desde New Recruit (formato ++++) o BattleScribe. El parser detecta automáticamente el formato.
            </InfoBanner>

            <textarea
              value={importText}
              onChange={e => { setImportText(e.target.value); setParsed(null); setParseError(null); }}
              placeholder={`++ Battalion Detachment 0CP (Imperium - Space Marines) [1000pts] ++\n\n+ HQ +\n\nCaptain: Bolt rifle, Chainsword\n\n+ Troops +\n\nIntercessors [100pts]\n· Bolt rifle x5\n\n...`}
              rows={10}
              style={{
                ...inputStyle,
                width: '100%',
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                marginBottom: '1rem',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={handleParse} disabled={!importText.trim()} style={btnPrimary}>
                Parsear lista
              </button>
              <button
                onClick={() => { setImportText(''); setParsed(null); setParseError(null); }}
                style={btnGhost}
              >
                Limpiar
              </button>
            </div>

            {parseError && (
              <div style={{ marginTop: '1rem' }}>
                <InfoBanner type="error">Error al parsear: {parseError}</InfoBanner>
              </div>
            )}

            {parsed && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#22c55e', fontSize: '1rem' }}>✓</span>
                  <span style={{ color: '#22c55e', fontSize: '0.85rem', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
                    LISTA PARSEADA CORRECTAMENTE
                  </span>
                </div>
                <ParsedListPreview parsed={parsed} />

                <div style={{ marginTop: '1rem' }}>
                  <InfoBanner type="success">
                    Lista parseada con éxito. Puedes copiar este resultado o usar el botón <strong>"Exportar torneo"</strong> para enviarla a New Recruit junto a un informe de batalla.
                  </InfoBanner>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Tab: Export ─────────────────────────────────────────────────────── */}
      {tab === 'export' && (
        <motion.div key="export" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={card}>
            <SectionTitle>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Exportar informe de batalla a New Recruit
            </SectionTitle>

            {!creds.login && (
              <div style={{ marginBottom: '1rem' }}>
                <InfoBanner type="warning">
                  ⚠️ Configura tus credenciales de New Recruit arriba antes de exportar.
                </InfoBanner>
              </div>
            )}

            <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem', letterSpacing: '1px' }}>
              SELECCIONAR INFORME DE BATALLA
            </label>
            <select
              value={selectedReport?.id || ''}
              onChange={e => setSelectedReport(reports.find(r => r.id === e.target.value) || null)}
              style={{ ...inputStyle, width: '100%', marginBottom: '1.25rem', cursor: 'pointer' }}
            >
              <option value="">— Selecciona un informe —</option>
              {reports.map(r => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.player1Name || r.player1_name} vs {r.player2Name || r.player2_name})
                </option>
              ))}
            </select>

            {selectedReport && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    ['Título', selectedReport.title],
                    ['Misión', selectedReport.mission],
                    ['Jugador 1', `${selectedReport.player1Name || selectedReport.player1_name} (${selectedReport.player1Faction || selectedReport.player1_faction})`],
                    ['Jugador 2', `${selectedReport.player2Name || selectedReport.player2_name} (${selectedReport.player2Faction || selectedReport.player2_faction})`],
                    ['Resultado', `${selectedReport.player1Score ?? selectedReport.player1_score} – ${selectedReport.player2Score ?? selectedReport.player2_score}`],
                    ['Fecha', selectedReport.date],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span style={{ color: '#555', fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>{label.toUpperCase()}</span>
                      <span style={{ color: '#ddd' }}>{val || '—'}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <button
              onClick={handleExport}
              disabled={!selectedReport || exportStatus === 'loading'}
              style={{
                ...btnPrimary,
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                opacity: (!selectedReport || exportStatus === 'loading') ? 0.5 : 1,
                cursor: (!selectedReport || exportStatus === 'loading') ? 'not-allowed' : 'pointer',
              }}
            >
              {exportStatus === 'loading' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>⟳</motion.span>
                  Enviando...
                </span>
              ) : 'Enviar a New Recruit'}
            </button>

            {exportStatus === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '1rem' }}>
                <InfoBanner type="success">✓ {exportMsg}</InfoBanner>
              </motion.div>
            )}
            {exportStatus === 'error' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '1rem' }}>
                <InfoBanner type="error">✗ {exportMsg}</InfoBanner>
              </motion.div>
            )}
          </div>

          {/* What gets sent */}
          <div style={{ ...card, marginTop: '1rem' }}>
            <SectionTitle>¿Qué datos se envían a New Recruit?</SectionTitle>
            <div style={{ fontSize: '0.83rem', color: '#999', lineHeight: 1.8 }}>
              <p>New Recruit recibe el informe de batalla en el formato estándar de su API:</p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
                <li>Nombre de los jugadores y facciones</li>
                <li>Resultado de la partida (puntuación final)</li>
                <li>Misión jugada y puntos totales</li>
                <li>Listas de ejército de ambos jugadores (si están disponibles)</li>
                <li>Fecha de la partida</li>
              </ul>
              <p style={{ marginTop: '0.75rem', color: '#666', fontSize: '0.78rem' }}>
                La petición se realiza a través del backend de la app como proxy para evitar errores CORS. Tus credenciales se incluyen en los headers <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>NR-Login</code> y <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>NR-Password</code>.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Tab: History ─────────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div style={card}>
            <SectionTitle>Historial de exportaciones</SectionTitle>

            {exportHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#555' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.3 }}>📋</div>
                <p>No hay exportaciones registradas aún.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {exportHistory.map(entry => (
                  <div key={entry.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${entry.status === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    borderRadius: '8px',
                    fontSize: '0.83rem',
                  }}>
                    <span style={{ fontSize: '1rem' }}>{entry.status === 'success' ? '✅' : '❌'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff' }}>{entry.reportTitle}</div>
                      {entry.nrId && <div style={{ color: '#888', fontSize: '0.75rem' }}>NR ID: {entry.nrId}</div>}
                      {entry.error && <div style={{ color: '#f87171', fontSize: '0.75rem' }}>{entry.error}</div>}
                    </div>
                    <span style={{ color: '#555', fontSize: '0.75rem', flexShrink: 0 }}>
                      {new Date(entry.date).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => { setExportHistory([]); localStorage.removeItem('nr-export-history'); }}
                  style={{ ...btnGhost, marginTop: '0.5rem', fontSize: '0.78rem' }}
                >
                  Limpiar historial
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Shared inline styles ──────────────────────────────────────────────────────

const inputStyle = {
  padding: '0.65rem 0.9rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.9rem',
  outline: 'none',
  fontFamily: 'var(--font-body)',
};

const btnPrimary = {
  padding: '0.65rem 1.4rem',
  background: 'var(--color-primary)',
  border: 'none',
  borderRadius: '8px',
  color: '#000',
  fontFamily: 'var(--font-display)',
  fontSize: '0.8rem',
  letterSpacing: '1px',
  cursor: 'pointer',
  fontWeight: 'bold',
  transition: 'opacity 0.2s',
};

const btnGhost = {
  padding: '0.65rem 1.2rem',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '8px',
  color: '#aaa',
  fontFamily: 'var(--font-display)',
  fontSize: '0.8rem',
  letterSpacing: '1px',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const card = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '14px',
  padding: '1.5rem',
};
