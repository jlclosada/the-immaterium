/**
 * CommentsSection — reusable component for guides, battle-reports, news, lore
 * Uses TanStack Query for caching + optimistic updates
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComments, useAddComment } from '../../hooks/queries';
import { useStore } from '../../stores/useStore';
import { useTheme } from '../../hooks/useTheme';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

const AVATAR_COLORS = [
  '#00d4ff', '#7b2fff', '#ff6464', '#10b981', '#f59e0b',
  '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6',
];
function avatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

/* ── Single Comment ──────────────────────────────────────────────────────── */
function CommentItem({ comment, isLight }) {
  const color = avatarColor(comment.author);
  const ago = timeAgo(comment.createdAt || comment.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        gap: '0.85rem',
        padding: '1rem 0',
        borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      {/* Avatar */}
      {comment.authorAvatar ? (
        <img
          src={comment.authorAvatar}
          alt={comment.author}
          style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: `${color}22`, border: `1.5px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 700,
          color: color,
        }}>
          {getInitials(comment.author)}
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 700,
            color: isLight ? 'var(--text-primary)' : '#fff',
          }}>
            {comment.author}
          </span>
          <span style={{
            fontSize: '0.68rem',
            color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.3)',
          }}>
            {ago}
          </span>
        </div>
        <p style={{
          margin: 0, lineHeight: 1.7, fontSize: '0.88rem',
          color: isLight ? 'var(--text-secondary)' : 'rgba(255,255,255,0.7)',
          wordBreak: 'break-word',
        }}>
          {comment.text}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Add Comment Form ────────────────────────────────────────────────────── */
function AddCommentForm({ contentType, contentId, isLight, userDisplayName, userAvatar }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState(userDisplayName || '');
  const [submitted, setSubmitted] = useState(false);
  const addComment = useAddComment(contentType, contentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !author.trim()) return;
    try {
      await addComment.mutateAsync({
        author: author.trim(),
        author_avatar: userAvatar || '',
        authorAvatar: userAvatar || '',
        text: text.trim(),
        date: new Date().toISOString().split('T')[0],
      });
      setText('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.9rem',
    background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
    border: isLight ? '1px solid rgba(0,120,200,0.22)' : '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: isLight ? 'var(--text-primary)' : '#fff',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      style={{ marginTop: '1.5rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {!userDisplayName && (
          <input
            type="text"
            placeholder="Tu nombre o alias..."
            value={author}
            onChange={e => setAuthor(e.target.value)}
            maxLength={80}
            required
            style={inputStyle}
          />
        )}
        <textarea
          placeholder="Escribe tu comentario..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          maxLength={1000}
          required
          style={inputStyle}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.3)' }}>
            {text.length}/1000
          </span>
          <button
            type="submit"
            disabled={addComment.isPending || !text.trim() || !author.trim()}
            style={{
              padding: '0.55rem 1.4rem',
              borderRadius: '20px',
              border: 'none',
              cursor: addComment.isPending ? 'wait' : 'pointer',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              opacity: (addComment.isPending || !text.trim() || !author.trim()) ? 0.5 : 1,
              transition: 'opacity 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { if (!addComment.isPending) e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {addComment.isPending ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ¡Comentario publicado!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}

/* ── Main CommentsSection ────────────────────────────────────────────────── */
export default function CommentsSection({ contentType, contentId, accentColor }) {
  const { isLight } = useTheme();
  const user = useStore(s => s.user);
  const [expanded, setExpanded] = useState(true);

  const { data: comments = [], isLoading } = useComments(contentType, contentId);

  const accent = accentColor || 'var(--color-primary)';
  const userDisplayName = user?.username || user?.first_name || '';
  const userAvatar = user?.avatar_url || '';

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        marginTop: '2.5rem',
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.025)',
        border: isLight ? '1px solid rgba(0,120,200,0.1)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: 'none', border: 'none', cursor: 'pointer',
          width: '100%', textAlign: 'left', padding: 0,
          marginBottom: expanded ? '1.25rem' : 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
          letterSpacing: '1.5px', textTransform: 'uppercase',
          color: isLight ? 'var(--text-primary)' : '#fff',
        }}>
          Comentarios
        </span>
        {comments.length > 0 && (
          <span style={{
            background: `${accent}22`, border: `1px solid ${accent}44`,
            color: accent, borderRadius: '20px', padding: '1px 8px',
            fontSize: '0.72rem', fontFamily: 'var(--font-display)', fontWeight: 700,
          }}>
            {comments.length}
          </span>
        )}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ marginLeft: 'auto', opacity: 0.4, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {/* Comment list */}
            {isLoading ? (
              <div style={{ padding: '1rem 0' }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ display: 'flex', gap: '0.85rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', animation: 'skeleton-pulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.06)', width: '30%', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
                      <div style={{ height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.04)', width: '80%', animation: 'skeleton-pulse 1.6s ease-in-out infinite' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.3)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '0.5rem' }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p style={{ fontSize: '0.85rem', margin: 0 }}>Sé el primero en comentar</p>
              </div>
            ) : (
              <div>
                {comments.map(comment => (
                  <CommentItem key={comment.id} comment={comment} isLight={isLight} />
                ))}
              </div>
            )}

            {/* Add comment form */}
            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: '0.72rem', letterSpacing: '2px',
                textTransform: 'uppercase', color: isLight ? 'var(--text-dim)' : 'rgba(255,255,255,0.35)',
                marginBottom: '0.75rem',
              }}>
                {userDisplayName ? `Comentar como ${userDisplayName}` : 'Dejar un comentario'}
              </p>
              <AddCommentForm
                contentType={contentType}
                contentId={contentId}
                isLight={isLight}
                userDisplayName={userDisplayName}
                userAvatar={userAvatar}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
