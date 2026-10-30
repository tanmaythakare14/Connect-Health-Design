import type { ComponentProps, ReactNode } from 'react';
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

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: 'default' | 'destructive';
}
