import type { JSX } from 'react';
import type { SourceTreeNode, SourceTreeProps } from '../../@types';
import { SourceTreeRow } from './SourceTreeRow';

/** The parsed sample as a nested list; segments get a little air between them. */
export function SourceTree({
  nodes,
  expandedRefs,
  forceExpanded,
  mappedRefs,
  selectedRef,
  onToggle,
  onSelect,
  editingRef,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemoveField,
}: SourceTreeProps): JSX.Element {
  const renderNodes = (items: SourceTreeNode[], depth: number): JSX.Element => (
    <ul className={depth === 0 ? 'space-y-2' : undefined}>
      {items.map((node) => {
        const isExpanded = forceExpanded || expandedRefs.has(node.ref);
        return (
          <li key={node.ref}>
            <SourceTreeRow
              node={node}
              depth={depth}
              isExpanded={isExpanded}
              isMapped={mappedRefs.has(node.ref)}
              isSelected={selectedRef === node.ref}
              onToggle={onToggle}
              onSelect={onSelect}
              isEditing={editingRef === node.ref}
              onStartEdit={onStartEdit}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onRemoveField={onRemoveField}
            />
            {node.children &&
              isExpanded &&
              renderNodes(node.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return renderNodes(nodes, 0);
}
