/**
 * Warhammer 40K army list parser
 * Supports two formats:
 *   Format 1 – BattleScribe / official app (bullet points, ALL-CAPS categories)
 *   Format 2 – Plus-box format (++++ delimiters, "+ FIELD: value" headers)
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const parsePts = (str) =>
  parseInt((str || '').replace(/[.,\s]/g, '').match(/\d+/)?.[0] || '0', 10);

// ---------------------------------------------------------------------------
// Format 1 – BattleScribe / official app
// ---------------------------------------------------------------------------

const LIST_SIZE_KEYWORDS = [
  'Strike Force', 'Incursion', 'Combat Patrol',
  'Onslaught', 'Spearhead', 'Boarding Action',
];

const KNOWN_CATEGORIES = new Set([
  'CHARACTERS', 'BATTLELINE', 'DEDICATED TRANSPORTS', 'OTHER DATASHEETS',
  'ALLIED UNITS', 'FORTIFICATIONS', 'ENHANCEMENTS', 'EPIC HEROES',
  'MOUNTED', 'INFANTRY', 'VEHICLE', 'MONSTER', 'WARLORD',
]);

const isCategory = (line) => {
  const t = line.trim();
  if (KNOWN_CATEGORIES.has(t)) return true;
  // Fall back: all uppercase, letters + spaces, no digits, length > 3
  return t.length > 3 && t === t.toUpperCase() && /^[A-ZÁÉÍÓÚ\s]+$/.test(t);
};

const isUnit = (line) => {
  const t = line.trim();
  return /^.+\s*\(\s*\d+\s*Points?\s*\)$/i.test(t) &&
    !t.startsWith('•') && !t.startsWith('◦') && !isCategory(t);
};

const isBullet = (line) => {
  const t = line.trim();
  return t.startsWith('•') || t.startsWith('◦');
};

const processUnitBullets = (bullets) => {
  const hasSubItems = bullets.some((l) => l.trim().startsWith('◦'));

  if (!hasSubItems) {
    // Single-model unit: all • are equipment/enhancement
    const equipment = [];
    const enhancements = [];
    for (const l of bullets) {
      if (!l.trim().startsWith('•')) continue;
      const content = l.trim().replace(/^•\s*/, '');
      if (content.startsWith('Enhancements:')) {
        enhancements.push(content.replace('Enhancements:', '').trim());
      } else {
        equipment.push(content);
      }
    }
    return { models: [{ name: null, count: 1, equipment, enhancements }], unitEnhancements: [] };
  }

  // Multi-model unit: • introduces a model, ◦ is its equipment
  const models = [];
  let cur = null;
  const unitEnhancements = [];

  for (const l of bullets) {
    const t = l.trim();
    if (t.startsWith('•')) {
      if (cur) models.push(cur);
      const content = t.replace(/^•\s*/, '');
      if (content.startsWith('Enhancements:')) {
        if (cur) cur.enhancements.push(content.replace('Enhancements:', '').trim());
        else unitEnhancements.push(content.replace('Enhancements:', '').trim());
        cur = null;
      } else {
        const cm = content.match(/^(\d+)x\s+(.+)$/);
        cur = {
          count: cm ? parseInt(cm[1], 10) : 1,
          name: cm ? cm[2] : content,
          equipment: [],
          enhancements: [],
        };
      }
    } else if (t.startsWith('◦') && cur) {
      const content = t.replace(/^◦\s*/, '');
      if (content.startsWith('Enhancements:')) {
        cur.enhancements.push(content.replace('Enhancements:', '').trim());
      } else {
        cur.equipment.push(content);
      }
    }
  }
  if (cur) models.push(cur);
  return { models, unitEnhancements };
};

const parseArmyListFormat1 = (text) => {
  const lines = text.split('\n').map((l) => l.trimEnd()).filter((l) => l.trim());
  if (lines.length < 2) return null;

  // Locate list-size line
  let listSizeIdx = -1;
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    if (LIST_SIZE_KEYWORDS.some((kw) => lines[i].includes(kw))) {
      listSizeIdx = i;
      break;
    }
  }

  let armyName = '', detachment = '', listSizeLabel = '', totalPoints = 0;

  if (listSizeIdx >= 2) {
    armyName = lines[listSizeIdx - 2].trim();
    detachment = lines[listSizeIdx - 1].trim();
    listSizeLabel = lines[listSizeIdx].trim();
  } else if (listSizeIdx === 1) {
    armyName = lines[0].trim();
    listSizeLabel = lines[1].trim();
  } else {
    armyName = lines[0].trim();
    detachment = lines.length > 1 ? lines[1].trim() : '';
    listSizeLabel = lines.length > 2 ? lines[2].trim() : '';
    listSizeIdx = 2;
  }

  // Extract points
  const ptsLine = listSizeLabel || lines[0];
  const ptsMatch = ptsLine.match(/(\d[\d.,]*)\s*Points?/i);
  if (ptsMatch) totalPoints = parsePts(ptsMatch[1]);

  // Parse units from content after the header block
  const startIdx = listSizeIdx >= 0 ? listSizeIdx + 1 : 3;
  const categories = [];
  let currentCat = null;
  let currentUnit = null;
  let unitBullets = [];

  const finalizeUnit = () => {
    if (!currentUnit) return;
    const { models, unitEnhancements } = processUnitBullets(unitBullets);
    currentUnit.models = models;
    currentUnit.unitEnhancements = unitEnhancements || [];
    if (currentCat) currentCat.units.push(currentUnit);
    currentUnit = null;
    unitBullets = [];
  };

  for (let i = startIdx; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (isCategory(trimmed)) {
      finalizeUnit();
      currentCat = { name: trimmed, units: [] };
      categories.push(currentCat);
      continue;
    }

    if (isUnit(trimmed)) {
      finalizeUnit();
      if (!currentCat) {
        currentCat = { name: 'UNITS', units: [] };
        categories.push(currentCat);
      }
      const um = trimmed.match(/^(.+?)\s*\(\s*(\d+)\s*Points?\s*\)$/i);
      currentUnit = {
        name: um ? um[1].trim() : trimmed,
        points: um ? parseInt(um[2], 10) : 0,
        models: [],
        unitEnhancements: [],
      };
      unitBullets = [];
      continue;
    }

    if (isBullet(trimmed)) {
      unitBullets.push(trimmed);
    }
  }
  finalizeUnit();

  return {
    armyName,
    detachment,
    listSize: listSizeLabel.replace(/\s*\(.*$/, '').trim(),
    points: totalPoints,
    categories: categories.filter((c) => c.units.length > 0),
  };
};

// ---------------------------------------------------------------------------
// Format 2 – Plus-box format
// Lines of ++++++, "+ FIELD: value" headers, then plain unit lines
// ---------------------------------------------------------------------------

const isFormat2 = (text) => /^\+{3,}/m.test(text);

/**
 * Parse a single unit line from Format 2.
 * Forms:
 *   Char1: Nx UnitName (X pts): eq1, eq2
 *   Nx UnitName (X pts): eq1, eq2
 *   Char1: UnitName (X pts): eq1, eq2
 *   UnitName (X pts): eq1, eq2
 *
 * Returns null if the line doesn't look like a unit.
 */
const parseFormat2UnitLine = (line) => {
  const t = line.trim();
  if (!t || t.startsWith('+')) return null;

  // Strip optional "CharN: " prefix (character/warlord marker)
  const isChar = /^Char\d+:\s*/i.test(t);
  const stripped = isChar ? t.replace(/^Char\d+:\s*/i, '') : t;

  // Match: [Nx ]UnitName (X pts)[: equipment…]
  const m = stripped.match(/^(\d+x\s+)?(.+?)\s*\(\s*(\d+)\s*pts?\s*\)(?:\s*:\s*(.*))?$/i);
  if (!m) return null;

  const count = m[1] ? parseInt(m[1], 10) : 1;
  const name = m[2].trim();
  const points = parseInt(m[3], 10);
  const eqRaw = (m[4] || '').trim();
  const equipment = eqRaw ? eqRaw.split(',').map((e) => e.trim()).filter(Boolean) : [];

  return {
    name,
    points,
    isChar,
    models: [{ name: null, count, equipment, enhancements: [] }],
    unitEnhancements: [],
  };
};

const parseArmyListFormat2 = (text) => {
  const lines = text.split('\n').map((l) => l.trimEnd());

  // List name: first non-empty, non-plus line
  let armyListName = '';
  for (const l of lines) {
    const t = l.trim();
    if (t && !t.startsWith('+')) { armyListName = t; break; }
  }

  let armyName = '';
  let detachment = '';
  let points = 0;
  let listSize = '';

  // Extract header fields from "+ FIELD: value" lines
  for (const l of lines) {
    const t = l.trim();
    if (!t.startsWith('+ ')) continue;
    const inner = t.replace(/^\+\s*/, '');
    const colonIdx = inner.indexOf(':');
    if (colonIdx === -1) continue;
    const key = inner.slice(0, colonIdx).trim().toUpperCase();
    const value = inner.slice(colonIdx + 1).trim();

    if (key === 'FACTION KEYWORD') armyName = value;
    else if (key === 'DETACHMENT') detachment = value.replace(/\s*\(.*\)$/, '').trim();
    else if (key === 'TOTAL ARMY POINTS') {
      const pm = value.match(/(\d[\d.,]*)/);
      if (pm) points = parsePts(pm[1]);
    } else if (key.includes('BATTLE SIZE') || key === 'ARMY SIZE') {
      listSize = value;
    }
  }

  // Fallback: use the list title as army name if no faction keyword found
  if (!armyName) armyName = armyListName;

  // Units appear after the last ++++ delimiter block
  let unitStartIdx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^\+{3,}/.test(lines[i].trim())) unitStartIdx = i + 1;
  }

  const characters = [];
  const regularUnits = [];

  for (let i = unitStartIdx; i < lines.length; i++) {
    const unit = parseFormat2UnitLine(lines[i]);
    if (!unit) continue;
    if (unit.isChar) characters.push(unit);
    else regularUnits.push(unit);
  }

  const categories = [];
  if (characters.length > 0) categories.push({ name: 'CHARACTERS', units: characters });
  if (regularUnits.length > 0) categories.push({ name: 'UNITS', units: regularUnits });

  return {
    armyName,
    detachment,
    listSize: listSize || 'Army List',
    points,
    categories,
  };
};

// ---------------------------------------------------------------------------
// Public API – auto-detects format
// ---------------------------------------------------------------------------

export const parseArmyList = (text) => {
  if (!text || !text.trim()) return null;
  if (isFormat2(text)) return parseArmyListFormat2(text);
  return parseArmyListFormat1(text);
};

export default parseArmyList;
