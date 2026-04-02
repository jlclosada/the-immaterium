/**
 * Estimates reading time for a given text/markdown content.
 * Assumes ~200 words per minute (average Spanish reader).
 * Returns a formatted string: "X min de lectura" or "< 1 min de lectura"
 */
export function estimateReadTime(content = '', wordsPerMinute = 200) {
  if (!content) return null;

  // Strip markdown/HTML tags and count words
  const stripped = content
    .replace(/<[^>]*>/g, ' ')         // remove HTML tags
    .replace(/[#*_`~\[\]()>!|]/g, ' ') // remove markdown syntax
    .replace(/https?:\/\/\S+/g, ' ')   // remove URLs
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = stripped.split(' ').filter(Boolean).length;
  const minutes = Math.round(wordCount / wordsPerMinute);

  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
}
