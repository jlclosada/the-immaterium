/**
 * Lightweight Markdown → HTML renderer (no external dependencies).
 *
 * Supported syntax:
 *   # ## ### #### heading levels
 *   **bold**, *italic*, ***bold+italic***
 *   `inline code`
 *   ``` code blocks ```
 *   - / * / + unordered lists
 *   1. 2. ordered lists
 *   > blockquotes
 *   [text](url) links
 *   --- horizontal rule
 *   double-blank-line → new paragraph
 *   single newline inside paragraph → <br/>
 */
export function renderMarkdown(md) {
  if (!md) return '';

  // Inline formatting (applied to text inside block elements)
  const inline = (text) =>
    text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
      .replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>'
      );

  const lines = md.split('\n');
  let html = '';
  let inUL = false;
  let inOL = false;
  let inCodeBlock = false;
  let codeAccum = '';
  let inParagraph = false;

  const closeUL   = () => { if (inUL)        { html += '</ul>';  inUL        = false; } };
  const closeOL   = () => { if (inOL)        { html += '</ol>';  inOL        = false; } };
  const closePara = () => { if (inParagraph) { html += '</p>';   inParagraph = false; } };
  const closeLists = () => { closeUL(); closeOL(); };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ── Code fence ────────────────────────────────────────────────────────────
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        closePara();
        closeLists();
        inCodeBlock = true;
        codeAccum   = '';
      } else {
        html        += `<pre class="md-pre"><code>${codeAccum}</code></pre>`;
        inCodeBlock  = false;
      }
      continue;
    }
    if (inCodeBlock) {
      codeAccum += (codeAccum ? '\n' : '') + line;
      continue;
    }

    // ── Empty line ─────────────────────────────────────────────────────────────
    if (line.trim() === '') {
      closePara();
      closeLists();
      continue;
    }

    // ── Heading ───────────────────────────────────────────────────────────────
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      closePara();
      closeLists();
      const n = hMatch[1].length;
      html += `<h${n} class="md-h md-h${n}">${inline(hMatch[2])}</h${n}>`;
      continue;
    }

    // ── Horizontal rule ───────────────────────────────────────────────────────
    if (/^[-*_]{3,}$/.test(line.trim())) {
      closePara();
      closeLists();
      html += '<hr class="md-hr"/>';
      continue;
    }

    // ── Blockquote ────────────────────────────────────────────────────────────
    if (line.startsWith('> ')) {
      closePara();
      closeLists();
      html += `<blockquote class="md-blockquote">${inline(line.slice(2))}</blockquote>`;
      continue;
    }

    // ── Unordered list ────────────────────────────────────────────────────────
    const ulMatch = line.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      closePara();
      if (!inUL) { closeOL(); html += '<ul class="md-ul">'; inUL = true; }
      html += `<li>${inline(ulMatch[1])}</li>`;
      continue;
    }

    // ── Ordered list ──────────────────────────────────────────────────────────
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      closePara();
      if (!inOL) { closeUL(); html += '<ol class="md-ol">'; inOL = true; }
      html += `<li>${inline(olMatch[1])}</li>`;
      continue;
    }

    // ── Paragraph text ────────────────────────────────────────────────────────
    closeLists();
    if (!inParagraph) {
      html += '<p class="md-p">';
      inParagraph = true;
    } else {
      html += '<br/>';
    }
    html += inline(line);
  }

  // Close any still-open elements
  closePara();
  closeLists();

  return html;
}
