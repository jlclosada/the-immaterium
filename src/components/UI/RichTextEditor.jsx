import React, { useRef, useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';

// ─── Helper: hex color → rgb components ──────────────────────────────────────
function hexToRgb(hex) {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3
    ? cleaned.split('').map(c => c + c).join('')
    : cleaned;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const wrapperStyle = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  overflow: 'visible',
  position: 'relative',
  background: 'rgba(255,255,255,0.03)',
};

const toolbarStyle = {
  display: 'flex',
  gap: '4px',
  padding: '6px 8px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '10px 10px 0 0',
  flexWrap: 'wrap',
};

const toolbarBtnStyle = {
  padding: '4px 10px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '6px',
  color: 'var(--color-light)',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: '700',
  lineHeight: 1,
  minWidth: '30px',
  minHeight: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s',
};

const editorBaseStyle = {
  padding: '0.75rem 1rem',
  background: 'transparent',
  color: 'var(--color-light)',
  fontSize: '0.95rem',
  outline: 'none',
  lineHeight: '1.6',
  borderRadius: '0 0 10px 10px',
  wordBreak: 'break-word',
  overflowY: 'auto',
};

const dropdownStyle = {
  position: 'absolute',
  zIndex: 9999,
  background: '#1a1d2e',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '8px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  maxHeight: '280px',
  overflowY: 'auto',
  minWidth: '260px',
};

const searchInputStyle = {
  width: '100%',
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.07)',
  border: 'none',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  color: 'var(--color-light)',
  fontSize: '0.85rem',
  outline: 'none',
  borderRadius: '8px 8px 0 0',
  boxSizing: 'border-box',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Escribe aquí...',
  token,
  minHeight = '120px',
}) {
  const editorRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Track whether the innerHTML was set externally so we don't loop
  const internalChangeRef = useRef(false);

  // Paint autocomplete state
  const [paintSearchOpen, setPaintSearchOpen] = useState(false);
  const [paintQuery, setPaintQuery] = useState('');
  const [paints, setPaints] = useState([]);
  const [paintsLoading, setPaintsLoading] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  // Saved range for insertion point (where /paint was typed)
  const triggerRangeRef = useRef(null);

  // ── Sync value prop → innerHTML (mount + external changes) ─────────────────
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    // Only update if the value truly differs from what's rendered
    if (editor.innerHTML !== value) {
      internalChangeRef.current = true;
      editor.innerHTML = value || '';
    }
  }, [value]);

  // ── Fetch paints when search query changes ─────────────────────────────────
  useEffect(() => {
    if (!paintSearchOpen) return;
    let cancelled = false;
    setPaintsLoading(true);
    api.getPaints(paintQuery)
      .then(data => {
        if (!cancelled) setPaints(data);
      })
      .catch(() => {
        if (!cancelled) setPaints([]);
      })
      .finally(() => {
        if (!cancelled) setPaintsLoading(false);
      });
    return () => { cancelled = true; };
  }, [paintQuery, paintSearchOpen]);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    if (!paintSearchOpen) return;
    const handleOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        editorRef.current && !editorRef.current.contains(e.target)
      ) {
        closePaintSearch();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [paintSearchOpen]);

  // Focus the search input when dropdown opens
  useEffect(() => {
    if (paintSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [paintSearchOpen]);

  // ── Toolbar commands ───────────────────────────────────────────────────────
  const execCmd = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    notifyChange();
  };

  const insertLineBreak = () => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, '<br><br>');
    notifyChange();
  };

  const notifyChange = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // ── Detect /paint trigger ──────────────────────────────────────────────────
  const detectPaintTrigger = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const node = range.startContainer;

    if (node.nodeType !== Node.TEXT_NODE) return;

    const text = node.textContent;
    const offset = range.startOffset;
    const textBefore = text.slice(0, offset);

    if (textBefore.endsWith('/paint')) {
      // Calculate dropdown position from caret
      const rects = range.getClientRects();
      const editorRect = editorRef.current.getBoundingClientRect();

      let top, left;
      if (rects.length > 0) {
        const caretRect = rects[rects.length - 1];
        top = caretRect.bottom - editorRect.top + editorRef.current.scrollTop + 4;
        left = caretRect.left - editorRect.left;
      } else {
        top = editorRect.height + 4;
        left = 0;
      }

      // Save the range so we can replace /paint later
      triggerRangeRef.current = {
        node,
        triggerStart: offset - '/paint'.length,
        triggerEnd: offset,
      };

      setDropdownPos({ top, left });
      setPaintQuery('');
      setPaintSearchOpen(true);
    }
  }, []);

  // ── Editor event handlers ──────────────────────────────────────────────────
  const handleInput = () => {
    if (internalChangeRef.current) {
      internalChangeRef.current = false;
      return;
    }
    notifyChange();
  };

  const handleKeyUp = (e) => {
    if (paintSearchOpen) return;
    detectPaintTrigger();
  };

  const handleKeyDown = (e) => {
    if (paintSearchOpen && e.key === 'Escape') {
      e.preventDefault();
      closePaintSearch();
    }
  };

  // ── Close dropdown ─────────────────────────────────────────────────────────
  const closePaintSearch = () => {
    setPaintSearchOpen(false);
    setPaintQuery('');
    triggerRangeRef.current = null;
    editorRef.current?.focus();
  };

  // ── Insert a paint chip ────────────────────────────────────────────────────
  const insertPaintChip = (paint) => {
    const color = paint.color || '#888888';
    const { r, g, b } = hexToRgb(color);
    const label = paint.name;

    const chipHtml =
      `<span contenteditable="false" class="paint-chip" style="display:inline-flex;align-items:center;gap:4px;background:rgba(${r},${g},${b},0.15);border:1px solid ${color};border-radius:6px;padding:2px 8px;font-size:0.85em;white-space:nowrap;cursor:default;user-select:none">` +
      `<span style="width:12px;height:12px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0"></span>` +
      `${label}</span>`;

    editorRef.current?.focus();

    // Restore selection to the trigger location and delete /paint text
    const trigger = triggerRangeRef.current;
    if (trigger && trigger.node && trigger.node.isConnected) {
      const sel = window.getSelection();
      const range = document.createRange();
      try {
        range.setStart(trigger.node, trigger.triggerStart);
        range.setEnd(trigger.node, trigger.triggerEnd);
        sel.removeAllRanges();
        sel.addRange(range);
        document.execCommand('delete', false, null);
      } catch (_) {
        // If the node is stale, just insert at current position
      }
    }

    document.execCommand('insertHTML', false, chipHtml + '&nbsp;');
    notifyChange();
    closePaintSearch();
  };

  // ── Paint search input handlers ────────────────────────────────────────────
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closePaintSearch();
    }
  };

  // ── Placeholder logic ──────────────────────────────────────────────────────
  const [isEmpty, setIsEmpty] = useState(!value);

  const handleEditorInput2 = (e) => {
    setIsEmpty(editorRef.current?.innerText.trim() === '');
    handleInput();
  };

  // Sync isEmpty on mount and value changes
  useEffect(() => {
    setIsEmpty(!value || value === '' || value === '<br>');
  }, [value]);

  return (
    <div style={wrapperStyle}>
      {/* ── Toolbar ── */}
      <div style={toolbarStyle}>
        <button
          type="button"
          title="Negrita"
          style={toolbarBtnStyle}
          onMouseDown={e => { e.preventDefault(); execCmd('bold'); }}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          title="Cursiva"
          style={toolbarBtnStyle}
          onMouseDown={e => { e.preventDefault(); execCmd('italic'); }}
        >
          <em style={{ fontStyle: 'italic' }}>I</em>
        </button>
        <button
          type="button"
          title="Lista de viñetas"
          style={toolbarBtnStyle}
          onMouseDown={e => { e.preventDefault(); execCmd('insertUnorderedList'); }}
        >
          •
        </button>
        <button
          type="button"
          title="Insertar salto de línea"
          style={toolbarBtnStyle}
          onMouseDown={e => { e.preventDefault(); insertLineBreak(); }}
        >
          ↵
        </button>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.3)',
          alignSelf: 'center',
          userSelect: 'none',
        }}>
          Escribe <code style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '3px', padding: '0 4px' }}>/paint</code> para insertar un color
        </span>
      </div>

      {/* ── Editor area ── */}
      <div style={{ position: 'relative' }}>
        {/* Placeholder */}
        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              top: '0.75rem',
              left: '1rem',
              color: 'rgba(255,255,255,0.25)',
              fontSize: '0.95rem',
              pointerEvents: 'none',
              userSelect: 'none',
              lineHeight: '1.6',
            }}
          >
            {placeholder}
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          style={{ ...editorBaseStyle, minHeight }}
          onInput={handleEditorInput2}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
        />

        {/* ── Paint dropdown ── */}
        {paintSearchOpen && (
          <div
            ref={dropdownRef}
            style={{
              ...dropdownStyle,
              top: dropdownPos.top,
              left: Math.max(0, dropdownPos.left),
            }}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar pintura..."
              value={paintQuery}
              style={searchInputStyle}
              onChange={e => setPaintQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <div>
              {paintsLoading && (
                <div style={{ padding: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textAlign: 'center' }}>
                  Cargando...
                </div>
              )}
              {!paintsLoading && paints.length === 0 && (
                <div style={{ padding: '12px', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', textAlign: 'center' }}>
                  No se encontraron pinturas
                </div>
              )}
              {!paintsLoading && paints.map(paint => (
                <button
                  key={paint.id}
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    insertPaintChip(paint);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: 'var(--color-light)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: paint.color || '#888',
                    border: '1px solid rgba(255,255,255,0.2)',
                    flexShrink: 0,
                    display: 'inline-block',
                  }} />
                  <span style={{ flex: 1, overflow: 'hidden' }}>
                    <span style={{ fontWeight: 600 }}>{paint.name}</span>
                    {(paint.brand || paint.range) && (
                      <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '6px', fontSize: '0.78rem' }}>
                        {[paint.brand, paint.range].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </span>
                  {paint.code && (
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', flexShrink: 0 }}>
                      {paint.code}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
