/**
 * Warhammer 40K army list parser
 * Expects the BattleScribe / official app text export format.
 */

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

const parsePts = (str) =>
  parseInt((str || '').replace(/[.,\s]/g, '').match(/\d+/)?.[0] || '0', 10);

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

export const parseArmyList = (text) => {
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

export default parseArmyList;
