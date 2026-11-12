import type {
  MappingFormat,
  MappingsTab,
  MappingTemplate,
  MappingTemplateSort,
  MappingProject,
  MappingProjectDefinition,
  MappingProjectSort,
  SourceTreeNode,
  TargetFieldSource,
  TargetFilter,
  TargetTreeNode,
  TargetValueChange,
  CustomValue,
  GroupCondition,
  CustomValueType,
  Hl7Token,
  JsonToken,
  LiquidToken,
  MappingLink,
  MappingSuggestion,
} from '../@types';
import {
  MAPPING_FORMAT,
  MAPPINGS_TAB,
  MAPPING_PROJECT_SORT,
  TEMPLATE_INPUT_TYPE,
  MAPPING_TEMPLATE_SORT,
  GROUP_CONDITION_KIND,
  HL7_REF_PATTERN,
  COMPARE_OPERATOR,
  TARGET_FILTER,
  TARGET_KEY_PATTERN,
} from '../constants';

/** Case-insensitive match on the project's name or description. */
export function filterMappingProjects(
  projects: MappingProject[],
  search: string,
): MappingProject[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return projects;
  }
  return projects.filter((project) =>
    [project.name, project.description ?? ''].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );
}

/** A sorted copy; ties fall back to the name so the order is stable. */
export function sortMappingProjects(
  projects: MappingProject[],
  sort: MappingProjectSort,
): MappingProject[] {
  const byName = (a: MappingProject, b: MappingProject): number =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

  return [...projects].sort((a, b) => {
    switch (sort) {
      case MAPPING_PROJECT_SORT.NAME:
        return byName(a, b);
      case MAPPING_PROJECT_SORT.MOST_TEMPLATES:
        return b.templateCount - a.templateCount || byName(a, b);
      default:
        return b.updatedAt.localeCompare(a.updatedAt) || byName(a, b);
    }
  });
}

export function isMappingsTab(value: string): value is MappingsTab {
  return Object.values<string>(MAPPINGS_TAB).includes(value);
}

export function isMappingFormat(value: unknown): value is MappingFormat {
  return Object.values<unknown>(MAPPING_FORMAT).includes(value);
}

/** Parses an uploaded export; null unless it's valid JSON describing an object. */
export function parseMappingProjectDefinition(
  text: string,
): MappingProjectDefinition | null {
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? (parsed as MappingProjectDefinition)
      : null;
  } catch {
    return null;
  }
}

/** Case-insensitive name lookup, used for the "overwrite" check on import. */
export function findMappingProjectByName(
  projects: MappingProject[],
  name: string,
): MappingProject | undefined {
  const target = name.trim().toLowerCase();
  return projects.find(
    (project) => project.name.trim().toLowerCase() === target,
  );
}

/** Case-insensitive match on a template's name, description or message type. */
export function filterMappingTemplates(
  templates: MappingTemplate[],
  search: string,
): MappingTemplate[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return templates;
  }
  return templates.filter((template) =>
    [
      template.name,
      template.description ?? '',
      template.messageType ?? '',
      template.messageVersion ?? '',
    ].some((value) => value.toLowerCase().includes(query)),
  );
}

/** A sorted copy; ties fall back to the name so the order is stable. */
export function sortMappingTemplates(
  templates: MappingTemplate[],
  sort: MappingTemplateSort,
): MappingTemplate[] {
  const byName = (a: MappingTemplate, b: MappingTemplate): number =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

  return [...templates].sort((a, b) => {
    switch (sort) {
      case MAPPING_TEMPLATE_SORT.NAME:
        return byName(a, b);
      case MAPPING_TEMPLATE_SORT.MOST_FIELDS:
        return b.fieldCount - a.fieldCount || byName(a, b);
      default:
        return b.updatedAt.localeCompare(a.updatedAt) || byName(a, b);
    }
  });
}

/**
 * A project's badge follows its newest template's input type (Custom JSON
 * shows as JSON). Null with no templates.
 */
export function deriveProjectFormat(
  templates: MappingTemplate[],
): MappingFormat | null {
  const newest = sortMappingTemplates(
    templates,
    MAPPING_TEMPLATE_SORT.RECENTLY_UPDATED,
  )[0];
  if (!newest) {
    return null;
  }
  return newest.inputType === TEMPLATE_INPUT_TYPE.CUSTOM_JSON
    ? 'json'
    : newest.inputType;
}

// ── Source tree ─────────────────────────────────────────────────────────

/** Refs of every node that has children, i.e. everything that can expand. */
export function collectBranchRefs(nodes: SourceTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.children ? [node.ref, ...collectBranchRefs(node.children)] : [],
  );
}

/** Every ref in the tree, branches and leaves. */
export function collectSourceRefs(nodes: SourceTreeNode[]): string[] {
  return nodes.flatMap((node) => [
    node.ref,
    ...(node.children ? collectSourceRefs(node.children) : []),
  ]);
}

/** Leaf fields only — what can actually feed a target field. */
export function countSourceFields(nodes: SourceTreeNode[]): number {
  return nodes.reduce(
    (total, node) =>
      total + (node.children ? countSourceFields(node.children) : 1),
    0,
  );
}

/**
 * Keeps nodes whose name, ref or sample value matches, plus the branches
 * that lead to them. A matching branch keeps all of its children.
 */
export function filterSourceTree(
  nodes: SourceTreeNode[],
  query: string,
): SourceTreeNode[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return nodes;

  const matches = (node: SourceTreeNode): boolean =>
    [node.label, node.ref, node.value ?? ''].some((text) =>
      text.toLowerCase().includes(needle),
    );

  return nodes.flatMap((node) => {
    if (matches(node)) return [node];
    if (!node.children) return [];
    const children = filterSourceTree(node.children, needle);
    return children.length > 0 ? [{ ...node, children }] : [];
  });
}

/** The refs of the branches leading to `ref` (not `ref` itself). */
export function findSourceAncestors(
  nodes: SourceTreeNode[],
  ref: string,
  trail: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.ref === ref) return trail;
    if (node.children) {
      const found = findSourceAncestors(node.children, ref, [
        ...trail,
        node.ref,
      ]);
      if (found) return found;
    }
  }
  return null;
}

// ── Target tree ─────────────────────────────────────────────────────────

export function collectTargetBranchPaths(nodes: TargetTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.children
      ? [node.path, ...collectTargetBranchPaths(node.children)]
      : [],
  );
}

/** Leaf fields, and how many of them have a source. */
export function countTargetFields(nodes: TargetTreeNode[]): {
  total: number;
  mapped: number;
} {
  return nodes.reduce(
    (counts, node) => {
      if (node.children) {
        const inner = countTargetFields(node.children);
        return {
          total: counts.total + inner.total,
          mapped: counts.mapped + inner.mapped,
        };
      }
      return {
        total: counts.total + 1,
        mapped: counts.mapped + (hasTargetValue(node) ? 1 : 0),
      };
    },
    { total: 0, mapped: 0 },
  );
}

/**
 * Keeps fields matching the search (name, path or source) and, with the
 * Needed filter, only fields still without a source — plus the branches
 * that lead to them.
 */
export function filterTargetTree(
  nodes: TargetTreeNode[],
  query: string,
  filter: TargetFilter,
): TargetTreeNode[] {
  const needle = query.trim().toLowerCase();
  if (!needle && filter === TARGET_FILTER.ALL) return nodes;

  const matches = (node: TargetTreeNode): boolean =>
    !needle ||
    [
      node.label,
      node.path,
      node.source?.label ?? '',
      node.source?.ref ?? '',
    ].some((text) => text.toLowerCase().includes(needle));

  return nodes.flatMap((node) => {
    if (node.children) {
      // A matching branch keeps every child that passes the filter.
      const children = filterTargetTree(
        node.children,
        matches(node) ? '' : needle,
        filter,
      );
      if (children.length > 0) return [{ ...node, children }];
      // Under Needed, a repeating group stays even once every field in it
      // is mapped: it's where its loop thread lands, and its fields'
      // threads (dotted) end on it while they're hidden.
      const keepGroup =
        node.repeatSource !== undefined &&
        filter === TARGET_FILTER.NEEDED &&
        matches(node);
      return keepGroup ? [{ ...node, children: [] }] : [];
    }
    const passesFilter = filter === TARGET_FILTER.ALL || !hasTargetValue(node);
    return passesFilter && matches(node) ? [node] : [];
  });
}

// ── Output ──────────────────────────────────────────────────────────────

const JSON_TOKEN_PATTERN =
  /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],:])|(\s+|.)/g;

/** Splits one line of pretty-printed JSON into coloured pieces. */
export function tokenizeJsonLine(line: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  for (const match of line.matchAll(JSON_TOKEN_PATTERN)) {
    const [, str, colon, num, literal, punct, plain] = match;
    if (str !== undefined) {
      tokens.push({ kind: colon ? 'key' : 'string', text: str });
      if (colon) tokens.push({ kind: 'punctuation', text: colon });
    } else if (num !== undefined) tokens.push({ kind: 'number', text: num });
    else if (literal !== undefined)
      tokens.push({ kind: 'literal', text: literal });
    else if (punct !== undefined)
      tokens.push({ kind: 'punctuation', text: punct });
    else tokens.push({ kind: 'plain', text: plain ?? '' });
  }
  return tokens;
}

const JSON_KEY_PATTERN = /^"((?:[^"\\]|\\.)*)":\s*(.*)$/;

/**
 * Each line's place in pretty-printed JSON, with array positions as `[*]` so
 * the same entry in every item shares one path (`$.notes[*].text`). Closing
 * lines get null.
 */
export function jsonLinePaths(json: string): (string | null)[] {
  const stack: string[] = [];
  return json.split('\n').map((line) => {
    const text = line.trim().replace(/,$/, '');
    if (text === '}' || text === ']') {
      stack.pop();
      return null;
    }
    const parent = stack[stack.length - 1] as string | undefined;
    const isInArray = parent?.endsWith('[]') ?? false;
    const keyMatch = isInArray ? null : JSON_KEY_PATTERN.exec(text);
    const parentPath = parent?.replace(/\[\]$/, '');
    let path = '$';
    if (parentPath !== undefined) {
      path = keyMatch ? `${parentPath}.${keyMatch[1]}` : `${parentPath}[*]`;
    }
    const value = keyMatch ? keyMatch[2] : text;
    if (value === '{') stack.push(path);
    else if (value === '[') stack.push(`${path}[]`);
    return path;
  });
}

/** The tree without the node at `path` (and anything under it). */
export function removeTargetNode(
  nodes: TargetTreeNode[],
  path: string,
): TargetTreeNode[] {
  return nodes
    .filter((node) => node.path !== path)
    .map((node) =>
      node.children
        ? { ...node, children: removeTargetNode(node.children, path) }
        : node,
    );
}

/** Refs of leaf fields only (no segments or composites). */
export function collectSourceFieldRefs(nodes: SourceTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.children ? collectSourceFieldRefs(node.children) : [node.ref],
  );
}

/** The paths of the branches leading to `path` (not `path` itself). */
export function findTargetAncestors(
  nodes: TargetTreeNode[],
  path: string,
  trail: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.path === path) return trail;
    if (node.children) {
      const found = findTargetAncestors(node.children, path, [
        ...trail,
        node.path,
      ]);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Every thread to draw: a mapped field from its source field, and a
 * repeating group from the segment it loops over.
 */
export function collectMappingLinks(nodes: TargetTreeNode[]): MappingLink[] {
  return nodes.flatMap((node): MappingLink[] => {
    if (node.children) {
      const own = node.repeatSource
        ? [{ sourceRef: node.repeatSource, targetPath: node.path }]
        : [];
      return [...own, ...collectMappingLinks(node.children)];
    }
    return node.source
      ? [{ sourceRef: node.source.ref, targetPath: node.path }]
      : [];
  });
}

/** "middleName" → "Middle Name", "address_2" → "Address 2" */
export function humanizeTargetKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

/** The key a node is written under: "notes[0].text" → "text". */
export function targetKeyOf(path: string): string {
  return path.slice(path.lastIndexOf('.') + 1);
}

/** The path of `key` inside `parent` (an object, a list, or the top level). */
export function targetChildPath(
  parent: TargetTreeNode | null,
  key: string,
): string {
  if (!parent) return key;
  // An item is one element of its list already: "notes[1]" → "notes[1].x".
  if (parent.itemIndex !== undefined) return `${parent.path}.${key}`;
  const isList = parent.isList === true || parent.repeatSource !== undefined;
  return isList ? `${parent.path}[0].${key}` : `${parent.path}.${key}`;
}

export function findTargetNode(
  nodes: TargetTreeNode[],
  path: string,
): TargetTreeNode | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    const found = node.children ? findTargetNode(node.children, path) : null;
    if (found) return found;
  }
  return null;
}

/** The tree with `node` appended to the branch at `parentPath` (null: top level). */
export function insertTargetNode(
  nodes: TargetTreeNode[],
  parentPath: string | null,
  node: TargetTreeNode,
): TargetTreeNode[] {
  if (parentPath === null) return [...nodes, node];
  return nodes.map((item) => {
    if (!item.children) return item;
    if (item.path === parentPath) {
      return { ...item, children: [...item.children, node] };
    }
    return {
      ...item,
      children: insertTargetNode(item.children, parentPath, node),
    };
  });
}

/** Why `name` can't be used as a key here, or null when it can. */
export function validateTargetKey(
  name: string,
  takenNames: string[],
): string | null {
  if (!TARGET_KEY_PATTERN.test(name)) {
    return 'Use letters, numbers and _ only, starting with a letter.';
  }
  if (takenNames.includes(name)) {
    return `“${name}” is already used here.`;
  }
  return null;
}

/** The tree with the node at `path` swapped for `next`. */
export function replaceTargetNode(
  nodes: TargetTreeNode[],
  path: string,
  next: TargetTreeNode,
): TargetTreeNode[] {
  return nodes.map((node) => {
    if (node.path === path) return next;
    return node.children
      ? { ...node, children: replaceTargetNode(node.children, path, next) }
      : node;
  });
}

/** The same shape under a new path prefix, with nothing mapped yet. */
function blankTargetCopy(
  node: TargetTreeNode,
  fromPrefix: string,
  toPrefix: string,
): TargetTreeNode {
  return {
    path: toPrefix + node.path.slice(fromPrefix.length),
    label: node.label,
    valueType: node.valueType,
    isList: node.isList,
    children: node.children?.map((child) =>
      blankTargetCopy(child, fromPrefix, toPrefix),
    ),
  };
}

/**
 * Adds one more item to a list. The first time, the list's fields are
 * wrapped as "Item 1" (which keeps the loop and its mappings) and "Item 2"
 * is a blank copy; after that each new item copies Item 1's shape.
 * `path` may be the list itself or one of its items.
 */
export function addTargetListItem(
  nodes: TargetTreeNode[],
  path: string,
): TargetTreeNode[] {
  const picked = findTargetNode(nodes, path);
  if (!picked) return nodes;
  const listPath =
    picked.itemIndex !== undefined
      ? path.slice(0, path.lastIndexOf('['))
      : path;
  const list = findTargetNode(nodes, listPath);
  if (!list?.children) return nodes;

  const isItemized = list.children.some(
    (child) => child.itemIndex !== undefined,
  );
  const items: TargetTreeNode[] = isItemized
    ? list.children
    : [
        {
          path: `${listPath}[0]`,
          label: 'Item 1',
          itemIndex: 0,
          repeatSource: list.repeatSource,
          children: list.children,
        },
      ];
  const first = items[0];
  const nextIndex = Math.max(...items.map((item) => item.itemIndex ?? 0)) + 1;
  const nextPath = `${listPath}[${nextIndex}]`;
  const nextItem: TargetTreeNode = {
    path: nextPath,
    label: `Item ${nextIndex + 1}`,
    itemIndex: nextIndex,
    children: (first.children ?? []).map((child) =>
      blankTargetCopy(child, first.path, nextPath),
    ),
  };

  return replaceTargetNode(nodes, listPath, {
    ...list,
    isList: true,
    // The loop now belongs to Item 1.
    repeatSource: undefined,
    children: [...items, nextItem],
  });
}

/** The source tree with a new name for the field at `ref`. */
export function renameSourceField(
  nodes: SourceTreeNode[],
  ref: string,
  label: string,
): SourceTreeNode[] {
  return nodes.map((node) => {
    if (node.ref === ref) return { ...node, label };
    return node.children
      ? { ...node, children: renameSourceField(node.children, ref, label) }
      : node;
  });
}

// ── Custom values (same rules as mappingTargetTemplate.ts) ──────────────

/** Whether a field gets a value: from a source, a constant or an expression. */
export function hasTargetValue(node: TargetTreeNode): boolean {
  return (
    node.source !== undefined ||
    node.customValue !== undefined ||
    Boolean(node.expression?.trim())
  );
}

/** Short text for a value in the tree ("148", "final", "true", "(empty)"). */
export function describeValue(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return value === '' ? '(empty)' : value;
  if (typeof value === 'object') return Array.isArray(value) ? '[…]' : '{…}';
  return String(value);
}

export function valueTypeOf(value: unknown): CustomValueType {
  return typeof value === 'number'
    ? 'number'
    : typeof value === 'boolean'
      ? 'boolean'
      : 'text';
}

/** Turn what the author typed into a typed value, or an error to show under the field. */
export function parseCustomValue(
  type: CustomValueType,
  raw: string,
): { ok: true; value: CustomValue } | { ok: false; error: string } {
  if (type === 'boolean') {
    if (raw === 'true') return { ok: true, value: true };
    if (raw === 'false') return { ok: true, value: false };
    return { ok: false, error: 'Choose true or false' };
  }
  if (type === 'number') {
    const trimmed = raw.trim();
    const n = Number(trimmed);
    return trimmed !== '' && Number.isFinite(n)
      ? { ok: true, value: n }
      : { ok: false, error: 'Enter a number' };
  }
  // The server renders the template through Liquid, so it refuses text holding tag delimiters.
  if (raw.includes('{{') || raw.includes('{%')) {
    return { ok: false, error: 'Text can’t contain “{{” or “{%”' };
  }
  return { ok: true, value: raw };
}

/** The tree with the field at `path` given a constant, an expression, or neither. */
export function applyTargetValue(
  nodes: TargetTreeNode[],
  path: string,
  change: TargetValueChange,
): TargetTreeNode[] {
  return nodes.map((node) => {
    if (node.path === path) {
      return {
        ...node,
        customValue: change.kind === 'constant' ? change.value : undefined,
        expression:
          change.kind === 'expression' ? change.expression : undefined,
      };
    }
    return node.children
      ? { ...node, children: applyTargetValue(node.children, path, change) }
      : node;
  });
}

// ── HL7 payload ─────────────────────────────────────────────────────────

/** Splits one HL7 segment line for colouring: id, separators, values. */
export function tokenizeHl7Line(line: string): Hl7Token[] {
  const match = /^([A-Z][A-Z0-9]{2})(?=\||$)/.exec(line);
  const tokens: Hl7Token[] = match ? [{ kind: 'segment', text: match[1] }] : [];
  const rest = match ? line.slice(match[1].length) : line;
  for (const part of rest.split(/([|^~\\&])/)) {
    if (!part) continue;
    tokens.push({
      kind:
        part === '|'
          ? 'field-separator'
          : '^~\\&'.includes(part) && part.length === 1
            ? 'separator'
            : 'value',
      text: part,
    });
  }
  return tokens;
}

/** One segment per line, no blank lines, whatever line endings it came with. */
export function formatHl7Payload(payload: string): string {
  return payload
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/** Why `payload` can't be loaded as HL7, or null when it looks right. */
export function validateHl7Payload(payload: string): string | null {
  const firstLine = formatHl7Payload(payload).split('\n')[0] ?? '';
  if (!firstLine) return null; // empty is handled by the submit button
  return firstLine.startsWith('MSH')
    ? null
    : 'An HL7 message starts with its MSH segment.';
}

// ── JSON payload ────────────────────────────────────────────────────────

/** Why `payload` isn't a usable JSON sample, or null when it is (or is empty). */
export function validateJsonPayload(payload: string): string | null {
  if (!payload.trim()) return null; // empty is handled by the submit button
  try {
    const parsed: unknown = JSON.parse(payload);
    return parsed !== null &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
      ? null
      : 'The sample must be a JSON object, e.g. { "id": "" }.';
  } catch {
    return 'This isn’t valid JSON yet — check for a missing comma, quote or bracket.';
  }
}

/** Indented two spaces; left as typed when it isn't valid JSON. */
export function formatJsonPayload(payload: string): string {
  try {
    return JSON.stringify(JSON.parse(payload), null, 2);
  } catch {
    return payload;
  }
}

// ── Group conditions ────────────────────────────────────────────────────

/** A fresh, empty condition ("is present" is the most common). */
export function createGroupCondition(): GroupCondition {
  return {
    id: crypto.randomUUID(),
    kind: GROUP_CONDITION_KIND.PRESENT,
    ref: '',
    operator: COMPARE_OPERATOR.EQUALS,
    value: '',
    liquid: '',
  };
}

/** What still needs fixing in a condition, or null when it's ready to save. */
export function groupConditionProblem(condition: GroupCondition): {
  /** True when something is just missing (not shown as an error) */
  isMissing: boolean;
  message: string;
} | null {
  if (condition.kind === GROUP_CONDITION_KIND.LIQUID) {
    return condition.liquid.trim()
      ? null
      : { isMissing: true, message: 'Enter a Liquid condition.' };
  }
  const ref = condition.ref.trim();
  if (!ref) return { isMissing: true, message: 'Enter a field ref.' };
  if (!HL7_REF_PATTERN.test(ref.toUpperCase())) {
    return {
      isMissing: false,
      message: 'Use a ref like PID.8 or ORC.7.4 — segment, then field numbers.',
    };
  }
  if (
    condition.kind === GROUP_CONDITION_KIND.COMPARE &&
    !condition.value.trim()
  ) {
    return { isMissing: true, message: 'Enter a value to compare with.' };
  }
  return null;
}

/** The path a branch's conditions apply to: a list's item, else the branch. */
export function conditionsPathOf(node: TargetTreeNode): string {
  const isList = node.repeatSource !== undefined || node.isList === true;
  return isList && node.itemIndex === undefined ? `${node.path}[0]` : node.path;
}

/** The tree with the branch at `path` given these conditions (none = cleared). */
export function setTargetConditions(
  nodes: TargetTreeNode[],
  path: string,
  conditions: GroupCondition[],
): TargetTreeNode[] {
  return nodes.map((node) => {
    if (node.path === path) {
      return {
        ...node,
        conditions: conditions.length > 0 ? conditions : undefined,
      };
    }
    return node.children
      ? {
          ...node,
          children: setTargetConditions(node.children, path, conditions),
        }
      : node;
  });
}

// ── Liquid ──────────────────────────────────────────────────────────────

const LIQUID_REGION_PATTERN = /(\{%-?[\s\S]*?-?%\}|\{\{-?[\s\S]*?-?\}\})/;

const LIQUID_KEYWORDS = new Set([
  'assign',
  'capture',
  'endcapture',
  'if',
  'elsif',
  'else',
  'endif',
  'unless',
  'endunless',
  'for',
  'in',
  'endfor',
  'case',
  'when',
  'endcase',
  'and',
  'or',
  'contains',
  'break',
  'continue',
]);

/** Tokens inside one {{ … }} or {% … %}: delimiters, keywords, filters, strings. */
function tokenizeLiquidTag(tag: string): LiquidToken[] {
  const tokens: LiquidToken[] = [];
  const pattern =
    /(\{%-?|-?%\}|\{\{-?|-?\}\})|('[^']*'|"[^"]*")|(\|)(\s*)([A-Za-z_]\w*)|(-?\d+(?:\.\d+)?)|([A-Za-z_][\w.]*)|(\s+|.)/g;
  for (const m of tag.matchAll(pattern)) {
    const [, delimiter, str, pipe, gap, filter, num, word, other] = m;
    if (delimiter) tokens.push({ kind: 'delimiter', text: delimiter });
    else if (str) tokens.push({ kind: 'string', text: str });
    else if (pipe) {
      tokens.push({ kind: 'punctuation', text: pipe });
      if (gap) tokens.push({ kind: 'plain', text: gap });
      tokens.push({ kind: 'filter', text: filter ?? '' });
    } else if (num) tokens.push({ kind: 'number', text: num });
    else if (word) {
      tokens.push({
        kind: LIQUID_KEYWORDS.has(word) ? 'keyword' : 'variable',
        text: word,
      });
    } else tokens.push({ kind: 'plain', text: other ?? '' });
  }
  return tokens;
}

/** Splits one line of Liquid-in-JSON: Liquid tags, and the JSON around them. */
export function tokenizeLiquidLine(line: string): LiquidToken[] {
  return line
    .split(LIQUID_REGION_PATTERN)
    .filter(Boolean)
    .flatMap((part) =>
      LIQUID_REGION_PATTERN.test(part)
        ? tokenizeLiquidTag(part)
        : tokenizeJsonLine(part),
    );
}

/**
 * The tree without one thread: a field loses its source (and the rules on
 * it), a group stops looping over the segment.
 */
export function removeTargetLink(
  nodes: TargetTreeNode[],
  link: MappingLink,
): TargetTreeNode[] {
  return nodes.map((node) => {
    if (node.path === link.targetPath) {
      if (node.children) {
        return node.repeatSource === link.sourceRef
          ? { ...node, repeatSource: undefined }
          : node;
      }
      return node.source?.ref === link.sourceRef
        ? { ...node, source: undefined, hasRules: false }
        : node;
    }
    return node.children
      ? { ...node, children: removeTargetLink(node.children, link) }
      : node;
  });
}

/** "Date/Time of Message" → "datetimeofmessage", so names compare loosely. */
const matchKeyOf = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]/g, '');

const collectSourceLeaves = (nodes: SourceTreeNode[]): SourceTreeNode[] =>
  nodes.flatMap((node) =>
    node.children ? collectSourceLeaves(node.children) : [node],
  );

const collectOpenTargetLeaves = (nodes: TargetTreeNode[]): TargetTreeNode[] =>
  nodes.flatMap((node) => {
    if (node.children) return collectOpenTargetLeaves(node.children);
    return hasTargetValue(node) ? [] : [node];
  });

/**
 * MOCK: stands in for the real auto-mapper. Pairs each target field that has
 * no value with a source field of the same name, preferring source fields
 * that don't feed anything yet. One guess per target field.
 */
export function suggestMappings(
  sourceTree: SourceTreeNode[],
  targetTree: TargetTreeNode[],
): MappingSuggestion[] {
  const used = new Set(collectMappingLinks(targetTree).map((l) => l.sourceRef));
  const sources = collectSourceLeaves(sourceTree);
  return collectOpenTargetLeaves(targetTree).flatMap(
    (target): MappingSuggestion[] => {
      const keys = [target.label, targetKeyOf(target.path)].map(matchKeyOf);
      const matches = sources.filter((source) =>
        keys.includes(matchKeyOf(source.label)),
      );
      const best =
        matches.find((source) => !used.has(source.ref)) ?? matches[0];
      if (!best) return [];
      used.add(best.ref);
      return [
        {
          sourceRef: best.ref,
          sourceLabel: best.label,
          targetPath: target.path,
        },
      ];
    },
  );
}

/** The tree with each suggestion turned into a real mapping. */
export function applyMappingSuggestions(
  nodes: TargetTreeNode[],
  suggestions: MappingSuggestion[],
): TargetTreeNode[] {
  return nodes.map((node) => {
    if (node.children) {
      return {
        ...node,
        children: applyMappingSuggestions(node.children, suggestions),
      };
    }
    const suggestion = suggestions.find((s) => s.targetPath === node.path);
    return suggestion
      ? {
          ...node,
          source: { ref: suggestion.sourceRef, label: suggestion.sourceLabel },
        }
      : node;
  });
}

/** Suggestions whose target field still exists and still has no value. */
export function openMappingSuggestions(
  nodes: TargetTreeNode[],
  suggestions: MappingSuggestion[],
): MappingSuggestion[] {
  return suggestions.filter((suggestion) => {
    const node = findTargetNode(nodes, suggestion.targetPath);
    return node !== null && !node.children && !hasTargetValue(node);
  });
}

export function isSameMappingLink(a: MappingLink, b: MappingLink): boolean {
  return a.sourceRef === b.sourceRef && a.targetPath === b.targetPath;
}

export function findSourceNode(
  nodes: SourceTreeNode[],
  ref: string,
): SourceTreeNode | null {
  for (const node of nodes) {
    if (node.ref === ref) return node;
    const found = node.children ? findSourceNode(node.children, ref) : null;
    if (found) return found;
  }
  return null;
}

/**
 * The tree with the field at `path` filled from `source` — a thread dragged
 * onto it. A fixed value or expression it had gives way to the source.
 */
export function connectTargetField(
  nodes: TargetTreeNode[],
  path: string,
  source: TargetFieldSource,
): TargetTreeNode[] {
  const node = findTargetNode(nodes, path);
  if (!node || node.children) return nodes;
  return replaceTargetNode(nodes, path, {
    ...node,
    source,
    customValue: undefined,
    expression: undefined,
  });
}
