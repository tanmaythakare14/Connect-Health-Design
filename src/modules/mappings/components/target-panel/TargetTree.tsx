import type { JSX } from 'react';
import type { TargetTreeNode, TargetTreeProps } from '../../@types';
import { TargetTreeRow } from './TargetTreeRow';

/** Lines a form up with the rows of the level it adds to. */
const FORM_INDENT_PX = 20;
const LEVEL_INDENT_PX = 16;

/** The target sample's fields as a nested list. */
export function TargetTree({
  nodes,
  expandedPaths,
  forceExpanded,
  selectedPath,
  onToggle,
  onSelect,
  onEditValue,
  onEditRules,
  onDeleteField,
  onAddField,
  renderAddForm,
}: TargetTreeProps): JSX.Element {
  const renderNodes = (items: TargetTreeNode[], depth: number): JSX.Element => (
    <ul className="space-y-1">
      {items.map((node) => {
        const isExpanded = forceExpanded || expandedPaths.has(node.path);
        return (
          <li key={node.path}>
            <TargetTreeRow
              node={node}
              depth={depth}
              isExpanded={isExpanded}
              isSelected={selectedPath === node.path}
              onToggle={onToggle}
              onSelect={onSelect}
              onEditValue={onEditValue}
              onEditRules={onEditRules}
              onDeleteField={onDeleteField}
              onAddField={onAddField}
            />
            {node.children && isExpanded && (
              <div className="mt-1 space-y-1">
                {/* An open add form sits first, right under its branch. */}
                {renderAddForm(node) && (
                  <div
                    className="pr-1.5"
                    style={{
                      paddingLeft:
                        FORM_INDENT_PX + (depth + 1) * LEVEL_INDENT_PX,
                    }}
                  >
                    {renderAddForm(node)}
                  </div>
                )}
                {node.children.length > 0 &&
                  renderNodes(node.children, depth + 1)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return renderNodes(nodes, 0);
}
