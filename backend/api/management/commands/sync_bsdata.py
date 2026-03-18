"""
sync_bsdata.py
==============
Downloads the latest BSData wh40k-10e community data and populates
the Army Builder database.

Usage:
  python manage.py sync_bsdata                          # Download & sync all factions
  python manage.py sync_bsdata --faction "Space Marines"  # Only one faction
  python manage.py sync_bsdata --source /path/to/dir    # Use local .cat/.gst files
  python manage.py sync_bsdata --clear                  # Clear before sync
  python manage.py sync_bsdata --list-factions          # Show available factions
"""

import os
import re
import json
import zipfile
import tempfile
import logging
import urllib.request
import urllib.error
from pathlib import Path
from xml.etree import ElementTree as ET

from django.core.management.base import BaseCommand, CommandError
from api.models import BuilderFaction, BuilderDatasheet

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────────────────

BSDATA_ZIP = 'https://github.com/BSData/wh40k-10e/archive/refs/heads/main.zip'
GITHUB_API = 'https://api.github.com/repos/BSData/wh40k-10e/releases/latest'

# Faction name → Imperium / Chaos / Xenos
FACTION_ALIGN = {
    'Space Marines':        'Imperium',
    'Blood Angels':         'Imperium',
    'Dark Angels':          'Imperium',
    'Space Wolves':         'Imperium',
    'Deathwatch':           'Imperium',
    'Grey Knights':         'Imperium',
    'Adepta Sororitas':     'Imperium',
    'Adeptus Custodes':     'Imperium',
    'Adeptus Mechanicus':   'Imperium',
    'Astra Militarum':      'Imperium',
    'Imperial Knights':     'Imperium',
    'Leagues of Votann':    'Imperium',
    'Imperial Agents':      'Imperium',
    'Chaos Space Marines':  'Chaos',
    'Death Guard':          'Chaos',
    "Thousand Sons":        'Chaos',
    'World Eaters':         'Chaos',
    'Chaos Daemons':        'Chaos',
    'Chaos Knights':        'Chaos',
    'Necrons':              'Xenos',
    'Orks':                 'Xenos',
    "T'au Empire":          'Xenos',
    'Tyranids':             'Xenos',
    'Genestealer Cults':    'Xenos',
    'Aeldari':              'Xenos',
    'Drukhari':             'Xenos',
    'Leagues of Votann':    'Xenos',
}

FACTION_COLOR = {
    'Space Marines':        '#1a6bb5',
    'Blood Angels':         '#8b0000',
    'Dark Angels':          '#1a5c2a',
    'Space Wolves':         '#4a6a8a',
    'Deathwatch':           '#2a2a3a',
    'Grey Knights':         '#c0c0c0',
    'Adepta Sororitas':     '#8b1a1a',
    'Adeptus Custodes':     '#ffd700',
    'Adeptus Mechanicus':   '#cc2222',
    'Astra Militarum':      '#556b2f',
    'Imperial Knights':     '#a0522d',
    'Leagues of Votann':    '#8b7355',
    'Chaos Space Marines':  '#8b0000',
    'Death Guard':          '#4a5a2a',
    "Thousand Sons":        '#1a4a8b',
    'World Eaters':         '#cc2200',
    'Chaos Daemons':        '#6a1a6a',
    'Chaos Knights':        '#4a1a4a',
    'Necrons':              '#00cc66',
    'Orks':                 '#4a7a1e',
    "T'au Empire":          '#4bbcff',
    'Tyranids':             '#9b30ff',
    'Genestealer Cults':    '#cc44cc',
    'Aeldari':              '#4488ff',
    'Drukhari':             '#880044',
}

FACTION_SHORT = {
    'Space Marines':        'SM',
    'Blood Angels':         'BA',
    'Dark Angels':          'DA',
    'Space Wolves':         'SW',
    'Deathwatch':           'DW',
    'Grey Knights':         'GK',
    'Adepta Sororitas':     'SoB',
    'Adeptus Custodes':     'CUST',
    'Adeptus Mechanicus':   'AdMech',
    'Astra Militarum':      'AM',
    'Imperial Knights':     'IK',
    'Leagues of Votann':    'LoV',
    'Chaos Space Marines':  'CSM',
    'Death Guard':          'DG',
    "Thousand Sons":        'TS',
    'World Eaters':         'WE',
    'Chaos Daemons':        'CD',
    'Chaos Knights':        'CK',
    'Necrons':              'NEC',
    'Orks':                 'ORK',
    "T'au Empire":          "T'AU",
    'Tyranids':             'TYR',
    'Genestealer Cults':    'GSC',
    'Aeldari':              'AEL',
    'Drukhari':             'DRU',
}

CATEGORY_ROLE = {
    # 10th edition categories (primary/keyword based)
    'battleline':               'Battleline',
    'character':                'Character',
    'epic hero':                'Epic Hero',
    'vehicle':                  'Vehicle',
    'monster':                  'Monster',
    'mounted':                  'Mounted',
    'infantry':                 'Infantry',
    'swarms':                   'Infantry',
    'beast':                    'Infantry',
    'dedicated transport':      'Dedicated Transport',
    'aircraft':                 'Flyer',
    # Note: 'fly' is a movement keyword, NOT an aircraft role - do NOT include it
    'fortification':            'Fortification',
    # Legacy / fallback (9th ed catalogues)
    'hq':                       'Character',
    'troops':                   'Battleline',
    'elite':                    'Infantry',
    'elites':                   'Infantry',
    'fast attack':              'Mounted',
    'heavy support':            'Vehicle',
    'flyer':                    'Flyer',
    'flyers':                   'Flyer',
    'lord of war':              'Monster',
}

# Priority order for role resolution (higher index = lower priority)
ROLE_PRIORITY = [
    'Epic Hero', 'Character', 'Battleline', 'Dedicated Transport', 'Flyer',
    'Fortification', 'Monster', 'Vehicle', 'Mounted', 'Infantry',
]

FACTION_KEYWORDS = {
    'Adeptus Astartes', 'Heretic Astartes', 'Necrons', 'Orks', "T'au Empire",
    'Tyranids', 'Aeldari', 'Drukhari', 'Adeptus Mechanicus', 'Astra Militarum',
    'Adeptus Custodes', 'Adepta Sororitas', 'Imperial Knights', 'Chaos Knights',
    'Death Guard', "Thousand Sons", 'World Eaters', 'Chaos Daemons',
    'Leagues of Votann', 'Genestealer Cults', 'Space Marines',
    'Blood Angels', 'Dark Angels', 'Space Wolves', 'Deathwatch', 'Grey Knights',
}

# Non-faction catalogues to skip
SKIP_CATALOGUES = {
    'common keywords', 'compulsory unit types', 'rulebook stratagems',
    'matched play', 'open play', 'narrative play', 'core rules', 'rules',
    'age of darkness', 'boarding actions',
}


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def slugify(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def _ns(root):
    """Detect XML namespace prefix from root element tag."""
    m = re.match(r'\{(.+?)\}', root.tag)
    return '{' + m.group(1) + '}' if m else ''


def _text(element):
    return (element.text or '').strip()


def _int(value, default=0):
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


# ──────────────────────────────────────────────────────────────────────────────
# Parser
# ──────────────────────────────────────────────────────────────────────────────

class BSDataParser:
    """
    Two-pass XML parser for BSData catalogues.

    Pass 1: Build registries of shared profiles, selection entries, rules.
    Pass 2: Extract unit datasheets, resolving references into the registries.
    """

    def __init__(self):
        # Populated from .gst game system file
        self.gst_profiles = {}   # id → ET.Element
        self.gst_rules    = {}   # id → ET.Element
        self.gst_cats     = {}   # id → name string (role categories)

    # ── GST ──────────────────────────────────────────────────────────────────

    def load_gst(self, filepath):
        """Parse the .gst game system file for shared definitions."""
        self._log(f'Loading game system: {Path(filepath).name}')
        try:
            tree = ET.parse(filepath)
            root = tree.getroot()
            ns   = _ns(root)
            self._collect_shared(root, ns,
                                  self.gst_profiles, {}, {}, self.gst_rules)
            for ce in root.findall(f'.//{ns}categoryEntries/{ns}categoryEntry'):
                self.gst_cats[ce.get('id', '')] = ce.get('name', '')
        except Exception as e:
            logger.warning(f'Failed to load GST: {e}')

    # ── Catalogue ─────────────────────────────────────────────────────────────

    def parse_cat(self, filepath):
        """
        Parse a single .cat file.
        Returns a dict  { id, name, category, color, short_name, units, detachments }
        or None if the file should be skipped.
        """
        raw_stem     = Path(filepath).stem.strip()
        faction_name = raw_stem

        # Skip known non-faction files
        if faction_name.lower() in SKIP_CATALOGUES:
            return None

        # BSData uses prefixed filenames: "Chaos - Chaos Space Marines",
        # "Imperium - Adepta Sororitas", "Aeldari - Drukhari", etc.
        # Strategy: try progressively shorter suffixes after " - "
        if faction_name not in FACTION_ALIGN:
            resolved = None
            parts = faction_name.split(' - ')
            # Try suffix first (most specific): "Chaos Space Marines"
            for i in range(1, len(parts)):
                candidate = ' - '.join(parts[i:]).strip()
                if candidate in FACTION_ALIGN:
                    resolved = candidate
                    break
            # Also try just the last part
            if resolved is None and parts[-1].strip() in FACTION_ALIGN:
                resolved = parts[-1].strip()
            # Also check if any known faction name is contained in the stem
            if resolved is None:
                for known in sorted(FACTION_ALIGN.keys(), key=len, reverse=True):
                    if known in faction_name:
                        resolved = known
                        break
            if resolved is None:
                return None
            faction_name = resolved

        try:
            tree = ET.parse(filepath)
            root = tree.getroot()
        except ET.ParseError as e:
            logger.warning(f'XML parse error in {filepath}: {e}')
            return None

        ns = _ns(root)

        # Per-catalogue registries
        shared_entries  = {}
        shared_groups   = {}
        shared_profiles = dict(self.gst_profiles)   # start with GST shared
        shared_rules    = dict(self.gst_rules)

        self._collect_shared(root, ns, shared_profiles, shared_entries,
                             shared_groups, shared_rules)

        ctx = {
            'ns': ns,
            'shared_entries':  shared_entries,
            'shared_groups':   shared_groups,
            'shared_profiles': shared_profiles,
            'shared_rules':    shared_rules,
        }

        units = []
        seen  = set()

        def _collect_unit(entry):
            eid = entry.get('id', '')
            if eid in seen or entry.get('type') != 'unit':
                return
            seen.add(eid)
            try:
                unit = self._parse_unit(entry, ctx)
                if unit:
                    units.append(unit)
            except Exception as e:
                logger.debug(f'  skip unit {entry.get("name", "?")} – {e}')

        # 1. Top-level selectionEntries
        for entry in root.findall(f'{ns}selectionEntries/{ns}selectionEntry'):
            _collect_unit(entry)

        # 2. sharedSelectionEntries (most 10th ed catalogues put units here)
        for entry in root.findall(
                f'{ns}sharedSelectionEntries/{ns}selectionEntry'):
            _collect_unit(entry)

        # 3. Follow top-level entryLinks → sharedSelectionEntries
        for el in root.findall(f'{ns}entryLinks/{ns}entryLink'):
            tid = el.get('targetId', '')
            entry = shared_entries.get(tid)
            if entry is not None:
                _collect_unit(entry)

        # 4. Deeply nested: selectionEntryGroups at root level
        for seg in root.findall(
                f'{ns}selectionEntryGroups/{ns}selectionEntryGroup'):
            for entry in seg.findall(f'.//{ns}selectionEntry'):
                _collect_unit(entry)

        if not units:
            return None

        detachments = self._extract_detachments(root, ns, ctx)

        return {
            'id':          slugify(faction_name),
            'name':        faction_name,
            'category':    FACTION_ALIGN.get(faction_name, 'Unknown'),
            'color':       FACTION_COLOR.get(faction_name, '#888888'),
            'short_name':  FACTION_SHORT.get(faction_name, ''),
            'units':       units,
            'detachments': detachments,
        }

    # ── Shared registry ───────────────────────────────────────────────────────

    def _collect_shared(self, root, ns,
                        profiles, entries, groups, rules):
        for p in root.findall(f'.//{ns}sharedProfiles/{ns}profile'):
            profiles[p.get('id', '')] = p
        for e in root.findall(
                f'.//{ns}sharedSelectionEntries/{ns}selectionEntry'):
            entries[e.get('id', '')] = e
        for g in root.findall(
                f'.//{ns}sharedSelectionEntryGroups/{ns}selectionEntryGroup'):
            groups[g.get('id', '')] = g
        for r in root.findall(f'.//{ns}sharedRules/{ns}rule'):
            rules[r.get('id', '')] = r

    # ── Unit parsing ──────────────────────────────────────────────────────────

    def _parse_unit(self, entry, ctx):
        name = entry.get('name', '').strip()
        if not name:
            return None

        eid = entry.get('id') or slugify(name)
        ns  = ctx['ns']

        stats       = self._unit_stats(entry, ctx)
        base_pts    = self._unit_points(entry, ns)
        ppm         = self._points_per_model(entry, ns)
        role        = self._unit_role(entry, ns)
        min_c, max_c = self._model_count(entry, ns)
        keywords    = self._keywords(entry, ns)
        weapons     = self._weapons(entry, ctx)
        abilities   = self._abilities(entry, ctx)
        wargear     = self._wargear_groups(entry, ctx)

        is_char     = any(k.lower() in ('character', 'epic hero') for k in keywords)
        is_epic     = 'epic hero' in [k.lower() for k in keywords]
        fkws        = [k for k in keywords if k in FACTION_KEYWORDS]
        ukws        = [k for k in keywords if k not in FACTION_KEYWORDS]

        return {
            'id':               eid,
            'name':             name,
            'role':             role,
            'base_points':      base_pts,
            'points_per_model': ppm,
            'stats':            stats,
            'keywords':         ukws[:30],
            'faction_keywords': fkws[:10],
            'is_character':     is_char,
            'is_epic_hero':     is_epic,
            'weapons':          weapons[:20],
            'abilities':        abilities[:15],
            'wargear_options':  wargear[:12],
            'model_count_min':  min_c,
            'model_count_max':  max_c,
        }

    # ── Stats ─────────────────────────────────────────────────────────────────

    def _unit_stats(self, entry, ctx):
        for p in self._all_profiles(entry, ctx):
            if p.get('typeName') in ('Unit', 'unit', 'Model'):
                stats = {}
                for c in p.findall(f'{ctx["ns"]}characteristics/'
                                   f'{ctx["ns"]}characteristic'):
                    stats[c.get('name', '')] = _text(c)
                if stats:
                    return stats
        return {}

    # ── Points ────────────────────────────────────────────────────────────────

    def _unit_points(self, entry, ns):
        for cost in entry.findall(f'{ns}costs/{ns}cost'):
            if cost.get('name', '').lower() in ('pts', 'points'):
                return _int(cost.get('value', 0))
        return 0

    def _points_per_model(self, entry, ns):
        """
        Detect per-model cost by looking at child model entries.
        Returns the cost of the cheapest additional model (above min), or 0.
        """
        model_costs = []
        for child in entry.findall(
                f'{ns}selectionEntries/{ns}selectionEntry[@type="model"]'):
            min_v = 0
            max_v = 0
            for con in child.findall(f'{ns}constraints/{ns}constraint'):
                if con.get('field') == 'selections':
                    v = _int(con.get('value', 0))
                    if con.get('type') == 'min':
                        min_v = v
                    elif con.get('type') == 'max':
                        max_v = v
            if max_v > min_v:
                c = self._unit_points(child, ns)
                if c > 0:
                    model_costs.append(c)
        return min(model_costs) if model_costs else 0

    # ── Role ──────────────────────────────────────────────────────────────────

    def _unit_role(self, entry, ns):
        """
        Determine the unit role from categoryLinks.
        In 10th edition BSData, units use keyword-style categories:
          Battleline, Character, Epic Hero, Infantry, Vehicle, Monster, etc.
        We collect ALL matched roles and return the highest-priority one.
        """
        def _resolve_name(name):
            return CATEGORY_ROLE.get(name.strip().lower())

        def _resolve_cl(cl):
            role = _resolve_name(cl.get('name', ''))
            if role:
                return role
            cat_name = self.gst_cats.get(cl.get('targetId', ''), '')
            return _resolve_name(cat_name)

        # Collect all roles from all category links
        all_roles = []
        primary_role = None
        for cl in entry.findall(f'{ns}categoryLinks/{ns}categoryLink'):
            role = _resolve_cl(cl)
            if role:
                all_roles.append(role)
                if cl.get('primary') in ('true', 'True', '1') and not primary_role:
                    primary_role = role

        if not all_roles:
            return 'Infantry'   # default in 10th ed (no force org)

        # If primary is meaningful (not just a generic type), use it
        if primary_role and primary_role in ('Battleline', 'Epic Hero',
                                              'Character', 'Dedicated Transport'):
            return primary_role

        # Otherwise return highest-priority role found
        for role in ROLE_PRIORITY:
            if role in all_roles:
                return role

        return all_roles[0]

    # ── Model count ───────────────────────────────────────────────────────────

    def _model_count(self, entry, ns):
        models = entry.findall(
            f'{ns}selectionEntries/{ns}selectionEntry[@type="model"]')
        if models:
            total_min = total_max = 0
            for m in models:
                m_min = m_max = 1
                for con in m.findall(f'{ns}constraints/{ns}constraint'):
                    if con.get('field') == 'selections':
                        v = _int(con.get('value', 1))
                        if con.get('type') == 'min':
                            m_min = max(0, v)
                        elif con.get('type') == 'max':
                            m_max = max(0, v)
                total_min += m_min
                total_max += m_max
            return max(1, total_min), max(1, total_max)

        # Fall back to unit-level constraints
        u_min = u_max = 1
        for con in entry.findall(f'{ns}constraints/{ns}constraint'):
            if con.get('field') == 'selections':
                v = _int(con.get('value', 1))
                if con.get('type') == 'min':
                    u_min = max(1, v)
                elif con.get('type') == 'max':
                    u_max = max(1, v)
        return u_min, max(u_min, u_max)

    # ── Keywords ──────────────────────────────────────────────────────────────

    def _keywords(self, entry, ns):
        kws = []
        for kw in entry.findall(f'.//{ns}keywords/{ns}keyword'):
            val = kw.get('name') or _text(kw)
            if val:
                kws.append(val)
        return list(dict.fromkeys(kws))  # deduplicate preserving order

    # ── Profiles (local + resolved via infoLinks) ─────────────────────────────

    def _all_profiles(self, element, ctx, depth=0):
        if depth > 4:
            return []
        ns      = ctx['ns']
        sprofs  = ctx['shared_profiles']
        result  = list(element.findall(f'{ns}profiles/{ns}profile'))

        for il in element.findall(f'{ns}infoLinks/{ns}infoLink'):
            if il.get('type') == 'profile':
                tid = il.get('targetId', '')
                p   = sprofs.get(tid)
                if p is not None:
                    result.append(p)

        # recurse into child model entries for weapon profiles
        if depth == 0:
            for child in element.findall(
                    f'{ns}selectionEntries/{ns}selectionEntry[@type="model"]'):
                result.extend(self._all_profiles(child, ctx, depth + 1))

        return result

    # ── Weapons ───────────────────────────────────────────────────────────────

    WEAPON_TYPES = {
        'Ranged Weapons', 'Melee Weapons', 'Ranged', 'Melee',
        'Weapon', 'ranged weapons', 'melee weapons',
    }

    def _profile_to_weapon(self, p, ns):
        """Convert a profile element to a weapon dict. Returns None if not a weapon."""
        if p.get('typeName') not in self.WEAPON_TYPES:
            return None
        w = {'name': p.get('name', 'Unknown')}
        for c in p.findall(f'{ns}characteristics/{ns}characteristic'):
            cname = c.get('name', '')
            cval  = _text(c)
            if not cval or cval == '-':
                continue
            if cname == 'Range':
                w['range'] = cval
            elif cname in ('A', 'Attacks'):
                w['attacks'] = cval
            elif cname in ('BS', 'WS', 'Skill', 'To Hit'):
                w['skill'] = cval
            elif cname in ('S', 'Strength'):
                w['strength'] = cval
            elif cname == 'AP':
                w['ap'] = cval
            elif cname in ('D', 'Damage'):
                w['damage'] = cval
            elif cname in ('Keywords', 'Abilities', 'Special'):
                if cval:
                    w['keywords'] = [k.strip() for k in cval.split(',') if k.strip()]
        if w.get('name') and (w.get('attacks') or w.get('damage') or w.get('strength')):
            return w
        return None

    def _entry_weapons(self, entry, ctx, depth=0):
        """Extract all weapons from a selectionEntry (upgrade, model, etc.)."""
        if depth > 4:
            return []
        ns    = ctx['ns']
        sents = ctx['shared_entries']
        sprof = ctx['shared_profiles']
        out   = []

        # Direct profiles
        for p in entry.findall(f'{ns}profiles/{ns}profile'):
            w = self._profile_to_weapon(p, ns)
            if w:
                out.append(w)

        # infoLinks to shared profiles
        for il in entry.findall(f'{ns}infoLinks/{ns}infoLink'):
            if il.get('type') == 'profile':
                p = sprof.get(il.get('targetId', ''))
                if p is not None:
                    w = self._profile_to_weapon(p, ns)
                    if w:
                        out.append(w)

        # Nested entryLinks
        for el in entry.findall(f'{ns}entryLinks/{ns}entryLink'):
            t = sents.get(el.get('targetId', ''))
            if t is not None:
                out.extend(self._entry_weapons(t, ctx, depth + 1))

        return out

    def _weapons(self, entry, ctx, depth=0):
        """
        Extract weapons from a unit entry.
        In 10th ed BSData, weapons live in selectionEntryGroups → entryLinks
        pointing to sharedSelectionEntries with weapon profiles.
        """
        if depth > 3:
            return []
        ns    = ctx['ns']
        sents = ctx['shared_entries']
        sgrps = ctx['shared_groups']
        weapons = []

        # 1. Direct profiles on the unit entry itself
        for p in self._all_profiles(entry, ctx):
            w = self._profile_to_weapon(p, ns)
            if w:
                weapons.append(w)

        # 2. Weapons inside selectionEntryGroups (10th ed pattern)
        #    Each group is a loadout slot; collect ALL options as the unit's weapons
        def _collect_group_weapons(seg):
            default_id = seg.get('defaultSelectionEntryId', '')
            local = []
            # Direct selectionEntries in the group
            for se in seg.findall(f'{ns}selectionEntries/{ns}selectionEntry'):
                ws = self._entry_weapons(se, ctx)
                is_default = (se.get('id') == default_id)
                local.extend((is_default, w) for w in ws)
            # entryLinks in the group → shared entries
            for el in seg.findall(f'{ns}entryLinks/{ns}entryLink'):
                if el.get('type') == 'selectionEntryGroup':
                    grp = sgrps.get(el.get('targetId', ''))
                    if grp is not None:
                        _collect_group_weapons(grp)
                    continue
                tid = el.get('targetId', '')
                t   = sents.get(tid)
                if t is not None:
                    ws = self._entry_weapons(t, ctx)
                    is_default = (tid == default_id or el.get('id') == default_id)
                    local.extend((is_default, w) for w in ws)
            # Sort: defaults first
            for _, w in sorted(local, key=lambda x: not x[0]):
                weapons.append(w)

        for seg in entry.findall(
                f'{ns}selectionEntryGroups/{ns}selectionEntryGroup'):
            _collect_group_weapons(seg)

        # 3. entryLinks directly on the unit
        for el in entry.findall(f'{ns}entryLinks/{ns}entryLink'):
            t = sents.get(el.get('targetId', ''))
            if t is not None:
                weapons.extend(self._entry_weapons(t, ctx))

        # 4. Child model entries (depth==0 only to avoid loops)
        if depth == 0:
            for child in entry.findall(
                    f'{ns}selectionEntries/{ns}selectionEntry[@type="model"]'):
                weapons.extend(self._weapons(child, ctx, depth + 1))

        # Deduplicate by name, preserve order
        seen = set()
        out  = []
        for w in weapons:
            if w['name'] not in seen:
                seen.add(w['name'])
                out.append(w)
        return out

    # ── Abilities ─────────────────────────────────────────────────────────────

    ABILITY_TYPES = {
        'Abilities', 'Ability', 'abilities',
        'Special Rules', 'Special Rule',
    }

    def _abilities(self, entry, ctx, depth=0):
        if depth > 3:
            return []
        ns      = ctx['ns']
        srules  = ctx['shared_rules']
        sprofs  = ctx['shared_profiles']
        result  = []

        for p in self._all_profiles(entry, ctx):
            if p.get('typeName') in self.ABILITY_TYPES:
                text = ''
                for c in p.findall(f'{ns}characteristics/{ns}characteristic'):
                    if c.get('name') in ('Description', 'Rules', 'Effect',
                                         'Ability', 'Details'):
                        text = _text(c)
                if p.get('name') and text:
                    result.append({'name': p.get('name'), 'text': text})

        # Rules as abilities
        for r in entry.findall(f'{ns}rules/{ns}rule'):
            name = r.get('name', '')
            desc = r.find(f'{ns}description')
            text = _text(desc) if desc is not None else ''
            if name and text:
                result.append({'name': name, 'text': text})

        for il in entry.findall(f'{ns}infoLinks/{ns}infoLink'):
            if il.get('type') == 'rule':
                tid = il.get('targetId', '')
                r   = srules.get(tid)
                if r is not None:
                    name = r.get('name', '')
                    desc = r.find(f'{ns}description')
                    text = _text(desc) if desc is not None else ''
                    if name and text:
                        result.append({'name': name, 'text': text})

        # Deduplicate by name
        seen = set()
        out  = []
        for a in result:
            if a['name'] not in seen:
                seen.add(a['name'])
                out.append(a)
        return out

    # ── Wargear groups ────────────────────────────────────────────────────────

    def _wargear_groups(self, entry, ctx, depth=0):
        if depth > 3:
            return []
        ns     = ctx['ns']
        sents  = ctx['shared_entries']
        sgrps  = ctx['shared_groups']
        result = []

        for seg in entry.findall(
                f'{ns}selectionEntryGroups/{ns}selectionEntryGroup'):
            group = self._parse_group(seg, ctx, depth)
            if group:
                result.append(group)

        # Recurse into child models
        if depth == 0:
            for child in entry.findall(
                    f'{ns}selectionEntries/{ns}selectionEntry[@type="model"]'):
                result.extend(self._wargear_groups(child, ctx, depth + 1))

        return result

    def _parse_group(self, seg, ctx, depth):
        ns     = ctx['ns']
        sents  = ctx['shared_entries']
        sgrps  = ctx['shared_groups']

        name    = seg.get('name', 'Options')
        min_sel = 0
        max_sel = 1

        for con in seg.findall(f'{ns}constraints/{ns}constraint'):
            if con.get('field') == 'selections':
                v = _int(con.get('value', 0))
                if con.get('type') == 'min':
                    min_sel = v
                elif con.get('type') == 'max':
                    max_sel = max(1, v)

        options = []

        # Direct entries
        for se in seg.findall(f'{ns}selectionEntries/{ns}selectionEntry'):
            opt = {'name': se.get('name', ''), 'points': 0}
            for cost in se.findall(f'{ns}costs/{ns}cost'):
                if cost.get('name', '').lower() in ('pts', 'points'):
                    opt['points'] = _int(cost.get('value', 0))
            if opt['name']:
                options.append(opt)

        # Entry links
        for el in seg.findall(f'{ns}entryLinks/{ns}entryLink'):
            if el.get('type') == 'selectionEntryGroup':
                # Linked group - recurse
                tid = el.get('targetId', '')
                tgt = sgrps.get(tid)
                if tgt is not None and depth < 3:
                    sub = self._parse_group(tgt, ctx, depth + 1)
                    if sub:
                        options.extend(sub.get('options', []))
                continue
            tid  = el.get('targetId', '')
            tgt  = sents.get(tid)
            oname = (el.get('name')
                     or (tgt.get('name') if tgt is not None else None)
                     or 'Unknown')
            opt  = {'name': oname, 'points': 0}
            if tgt is not None:
                for cost in tgt.findall(f'{ns}costs/{ns}cost'):
                    if cost.get('name', '').lower() in ('pts', 'points'):
                        opt['points'] = _int(cost.get('value', 0))
            if opt['name'] and opt['name'] != 'Unknown':
                options.append(opt)

        if not options:
            return None
        return {'name': name, 'min': min_sel, 'max': max_sel, 'options': options}

    # ── Detachments ───────────────────────────────────────────────────────────

    def _extract_detachments(self, root, ns, ctx):
        """
        Try to find detachment names and abilities from the catalogue.
        Detachments in wh40k-10e BSData appear as special selectionEntries
        with category 'Detachment' or as rules with certain naming patterns.
        """
        detachments = []
        seen = set()

        # Strategy 1: Look for selectionEntry with type='upgrade' or 'unit'
        # whose name looks like a detachment
        detachment_markers = {'detachment', 'formation'}
        for entry in root.findall(f'.//{ns}selectionEntry'):
            for cl in entry.findall(f'{ns}categoryLinks/{ns}categoryLink'):
                if cl.get('name', '').lower() in detachment_markers:
                    dname = entry.get('name', '').strip()
                    if dname and dname not in seen:
                        seen.add(dname)
                        ability = self._detachment_ability(entry, ctx)
                        detachments.append({
                            'name':         dname,
                            'ability_name': ability.get('name', 'Detachment Ability'),
                            'ability_text': ability.get('text', ''),
                        })

        # Strategy 2: Look for rules in the root whose name ends with
        # known detachment keywords
        if not detachments:
            for rule in root.findall(f'.//{ns}rule'):
                rname = rule.get('name', '').strip()
                desc  = rule.find(f'{ns}description')
                text  = _text(desc) if desc is not None else ''
                # Heuristic: long descriptions in root-level rules often are
                # detachment abilities
                if text and len(text) > 40 and rname not in seen:
                    seen.add(rname)
                    detachments.append({
                        'name':         rname,
                        'ability_name': rname,
                        'ability_text': text,
                    })
                    if len(detachments) >= 4:
                        break

        return detachments[:6]

    def _detachment_ability(self, entry, ctx):
        abilities = self._abilities(entry, ctx)
        if abilities:
            return abilities[0]
        return {}

    def _log(self, msg):
        pass   # overridden by Command


# ──────────────────────────────────────────────────────────────────────────────
# Download helpers
# ──────────────────────────────────────────────────────────────────────────────

def _download_file(url, dest_path, stdout=None):
    def _reporthook(block, block_size, total):
        if stdout and total > 0:
            pct = min(100, block * block_size * 100 // total)
            stdout.write(f'\r  Descargando… {pct}%', ending='')
            stdout.flush()

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'warhammer-galaxy-builder/1.0'})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
        with open(dest_path, 'wb') as f:
            f.write(data)
        if stdout:
            stdout.write('')
        return True
    except Exception as e:
        if stdout:
            stdout.write(f'\n  Error descargando: {e}')
        return False


def _get_latest_zip_url():
    """Try GitHub API first; fall back to branch ZIP."""
    try:
        req = urllib.request.Request(
            GITHUB_API,
            headers={'User-Agent': 'warhammer-galaxy-builder/1.0',
                     'Accept': 'application/vnd.github.v3+json'}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            release = json.loads(resp.read())
            url = release.get('zipball_url')
            tag = release.get('tag_name', 'latest')
            if url:
                return url, tag
    except Exception:
        pass
    return BSDATA_ZIP, 'main'


def _extract_cat_files(zip_path, dest_dir):
    """Extract .cat and .gst files from downloaded ZIP."""
    cat_files = []
    gst_file  = None
    with zipfile.ZipFile(zip_path) as zf:
        for name in zf.namelist():
            if name.endswith('.gst'):
                target = dest_dir / 'game.gst'
                with zf.open(name) as src, open(target, 'wb') as dst:
                    dst.write(src.read())
                gst_file = target
            elif name.endswith('.cat'):
                stem   = Path(name).stem
                target = dest_dir / f'{stem}.cat'
                with zf.open(name) as src, open(target, 'wb') as dst:
                    dst.write(src.read())
                cat_files.append(target)
    return gst_file, cat_files


# ──────────────────────────────────────────────────────────────────────────────
# Django management command
# ──────────────────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = 'Sync Army Builder data from BSData wh40k-10e community catalogues'

    def add_arguments(self, parser):
        parser.add_argument(
            '--source', metavar='DIR',
            help='Use local directory containing .cat / .gst files instead of downloading',
        )
        parser.add_argument(
            '--faction', metavar='NAME',
            help='Only sync this faction (e.g. "Space Marines")',
        )
        parser.add_argument(
            '--clear', action='store_true',
            help='Clear all existing builder data before syncing',
        )
        parser.add_argument(
            '--list-factions', action='store_true',
            help='List available factions and exit',
        )
        parser.add_argument(
            '--dry-run', action='store_true',
            help='Parse only, do not write to database',
        )

    # ── handle ────────────────────────────────────────────────────────────────

    def handle(self, *args, **options):
        if options['list_factions']:
            self.stdout.write('Facciones soportadas:')
            for name, align in sorted(FACTION_ALIGN.items()):
                self.stdout.write(f'  [{align:10}] {name}')
            return

        source_dir = options.get('source')

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)

            # ── Obtain .cat files ─────────────────────────────────────────
            if source_dir:
                cat_dir  = Path(source_dir)
                gst_file = next(cat_dir.glob('*.gst'), None)
                cat_files = list(cat_dir.glob('*.cat'))
                self.stdout.write(
                    f'Usando directorio local: {cat_dir} '
                    f'({len(cat_files)} catálogos)')
            else:
                self.stdout.write('Obteniendo URL de la última versión de BSData…')
                zip_url, tag = _get_latest_zip_url()
                self.stdout.write(f'  Versión: {tag}')
                self.stdout.write(f'  URL: {zip_url}')

                zip_path = tmp / 'bsdata.zip'
                self.stdout.write('Descargando…')
                ok = _download_file(zip_url, zip_path, self.stdout)
                if not ok or not zip_path.exists():
                    raise CommandError('No se pudo descargar el archivo de BSData.')

                self.stdout.write('\nExtrayendo archivos…')
                extract_dir = tmp / 'extracted'
                extract_dir.mkdir()
                gst_file, cat_files = _extract_cat_files(zip_path, extract_dir)
                self.stdout.write(
                    f'  {len(cat_files)} catálogos encontrados')

            # ── Init parser ───────────────────────────────────────────────
            parser = BSDataParser()
            if gst_file and gst_file.exists():
                parser.load_gst(gst_file)

            # ── Filter ────────────────────────────────────────────────────
            target_faction = options.get('faction')
            if target_faction:
                cat_files = [
                    f for f in cat_files
                    if target_faction.lower() in f.stem.lower()
                ]
                self.stdout.write(
                    f'Filtrando: {len(cat_files)} catálogo(s) para "{target_faction}"')

            # ── Clear ─────────────────────────────────────────────────────
            if options['clear'] and not options['dry_run']:
                self.stdout.write('Limpiando datos anteriores…')
                BuilderDatasheet.objects.all().delete()
                BuilderFaction.objects.all().delete()

            # ── Parse & save ──────────────────────────────────────────────
            total_factions = total_units = 0
            updated_f = updated_u = 0

            for cat_file in sorted(cat_files):
                self.stdout.write(f'\nParsing: {cat_file.stem}…')
                try:
                    faction_data = parser.parse_cat(cat_file)
                except Exception as e:
                    self.stdout.write(f'  ⚠ Error: {e}')
                    continue

                if not faction_data:
                    self.stdout.write('  → omitido (no es una facción jugable)')
                    continue

                units_data   = faction_data.pop('units')
                detachments  = faction_data.pop('detachments', [])

                self.stdout.write(
                    f'  ✓ {faction_data["name"]} → '
                    f'{len(units_data)} unidades, '
                    f'{len(detachments)} destacamentos')

                if options['dry_run']:
                    continue

                # ── Upsert faction ────────────────────────────────────────
                faction_data['detachments'] = detachments
                faction, created = BuilderFaction.objects.update_or_create(
                    id=faction_data['id'],
                    defaults=faction_data,
                )
                if created:
                    total_factions += 1
                else:
                    updated_f += 1

                # ── Upsert units ──────────────────────────────────────────
                seen_unit_ids = []
                for unit_data in units_data:
                    uid = unit_data.pop('id')
                    unit_data['faction'] = faction
                    seen_unit_ids.append(uid)
                    _, ucreated = BuilderDatasheet.objects.update_or_create(
                        id=uid,
                        defaults=unit_data,
                    )
                    if ucreated:
                        total_units += 1
                    else:
                        updated_u += 1

                # Remove stale units for this faction
                stale = BuilderDatasheet.objects.filter(
                    faction=faction
                ).exclude(id__in=seen_unit_ids)
                stale_count = stale.count()
                if stale_count:
                    stale.delete()
                    self.stdout.write(
                        f'  🗑 {stale_count} unidades obsoletas eliminadas')

            # ── Summary ───────────────────────────────────────────────────
            if not options['dry_run']:
                self.stdout.write('\n' + self.style.SUCCESS(
                    f'Sincronización completada:\n'
                    f'  Facciones: {total_factions} nuevas, {updated_f} actualizadas\n'
                    f'  Unidades:  {total_units} nuevas, {updated_u} actualizadas\n'
                    f'  Total BD:  {BuilderFaction.objects.count()} facciones, '
                    f'{BuilderDatasheet.objects.count()} unidades'
                ))
            else:
                self.stdout.write('\n' + self.style.WARNING('Dry run — nada escrito en BD'))
