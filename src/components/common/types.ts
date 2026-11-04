import type { ComponentProps, FormEvent, PointerEvent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import type { TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface FileDropzoneProps {
  /** Passed to the file input, e.g. ".json,application/json" */
  accept: string;
  /** The accepted file, or null to show the empty drop target */
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  /** Main line in the empty state, e.g. "Drag and drop your file here" */
  title: string;
  /** Constraint shown after "or browse files", e.g. "JSON up to 5 MB" */
  hint: string;
  error?: string | null;
  /** True while the parent validates the picked file */
  isProcessing?: boolean;
  disabled?: boolean;
}

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** Shown on the confirm button while `onConfirm` runs, e.g. "Deleting…" */
  pendingLabel?: string;
  cancelLabel?: string;
  /** Red confirm button + warning icon, for irreversible actions */
  destructive?: boolean;
  /** May be async; the dialog stays open until it settles and closes on success. */
  onConfirm: () => void | Promise<void>;
  /** Shown inside the dialog if `onConfirm` rejects */
  errorMessage?: string;
  /** Icon before the confirm label, e.g. Trash for a delete */
  confirmIcon?: LucideIcon;
  /** Amber callout under the description spelling out the consequences */
  warning?: { title: string; description: ReactNode };
  /**
   * Type-to-confirm: the confirm button stays disabled until the user types
   * this exact text, e.g. the username being deleted.
   */
  confirmationText?: string;
}

export interface SuccessDialogAction {
  label: string;
  onClick: () => void;
}

export interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  primaryAction: SuccessDialogAction;
  /** Usually a "dismiss" option; closes the dialog after running. */
  secondaryAction?: SuccessDialogAction;
}

export type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>;

export type ReadOnlyInputProps = Omit<
  ComponentProps<'input'>,
  'readOnly' | 'onChange'
>;

export interface CopyFieldProps {
  /** The read-only value to show and copy */
  value: string;
  /** Accessible name for the field, e.g. "OAuth callback URL" */
  label: string;
  id?: string;
  /** Called after a successful copy (e.g. to mark a setup step done) */
  onCopied?: () => void;
}

export type CopyTextBlockProps = CopyFieldProps;

export type LineTabsListProps = ComponentProps<typeof TabsList>;
export type LineTabsTriggerProps = ComponentProps<typeof TabsTrigger>;

export interface TablePaginationProps {
  /** 1-based current page */
  page: number;
  pageSize: number;
  totalItems: number;
  /** Plural noun for the summary, e.g. "connections" */
  itemLabel: string;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export interface DateRangeFilterProps {
  /** The applied range; undefined means "all time" */
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  /** Trigger label when no range is applied, e.g. "All time" */
  placeholder?: string;
  disabled?: boolean;
}

export interface CopyIconButtonProps {
  /** Text copied to the clipboard */
  value: string;
  /** What's being copied, for the button's accessible name, e.g. "Customer ID" */
  label: string;
}

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** Wire to react-hook-form's handleSubmit */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  /** Shown on the submit button while submitting, e.g. "Generating…" */
  pendingLabel?: string;
  /** Leading icon on the submit button */
  submitIcon?: LucideIcon;
  cancelLabel?: string;
  isSubmitting: boolean;
  /** Submit stays disabled until the form's required fields are filled */
  canSubmit: boolean;
  /** Inline error under the fields, e.g. when the save failed */
  error?: string | null;
  /** Tailwind max-width for the dialog, e.g. "sm:max-w-lg" */
  className?: string;
  children: ReactNode;
}

/** One column of a DataTable: its header and how to render a row's cell. */
export interface DataTableColumn<TRow> {
  key: string;
  header: ReactNode;
  cell: (row: TRow) => ReactNode;
  /** Width and alignment, e.g. "w-40" or "w-24 text-right" */
  headClassName?: string;
  cellClassName?: string;
  /** Width of this column's loading placeholder, e.g. "w-24" */
  skeletonClassName?: string;
}

export interface DataTableProps<TRow> {
  columns: Array<DataTableColumn<TRow>>;
  rows: TRow[];
  getRowKey: (row: TRow) => string;
  isLoading?: boolean;
  skeletonRowCount?: number;
  /** Shown in place of rows when not loading and there are none */
  emptyState?: ReactNode;
  /** Pinned below the rows inside the card, e.g. pagination */
  footer?: ReactNode;
  /** Extra classes for one row, e.g. to highlight a new one */
  rowClassName?: (row: TRow) => string | undefined;
  /** Names the table for screen readers */
  ariaLabel?: string;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'default' | 'destructive';
}

export interface PanelResizeHandleProps {
  /** Names the two panels it sits between, e.g. "Resize source and target" */
  label: string;
  isActive: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  /** Moves the handle by this many pixels (arrow keys) */
  onResizeBy: (deltaPx: number) => void;
  /** Double-click: back to equal widths */
  onReset: () => void;
  className?: string;
}
