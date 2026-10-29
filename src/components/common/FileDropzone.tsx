import { useId, useRef, useState, type DragEvent, type JSX } from 'react';
import { CloudUpload, FileCheck, LoaderCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/utils/file';
import type { FileDropzoneProps } from './types';

/**
 * Drag-and-drop (or click-to-browse) single-file picker. It only hands the
 * picked file to `onFileSelect`; the parent validates it and passes back
 * `file` once accepted, or `error` if not.
 */
export function FileDropzone({
  accept,
  file,
  onFileSelect,
  onRemove,
  title,
  hint,
  error,
  isProcessing = false,
  disabled = false,
}: FileDropzoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const hintId = useId();
  const errorId = useId();
  const isInactive = disabled || isProcessing;

  const openPicker = (): void => inputRef.current?.click();

  const pickFirst = (files: FileList | null): void => {
    const picked = files?.[0];
    if (picked) {
      onFileSelect(picked);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    if (!isInactive) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLButtonElement>): void => {
    // Ignore leave events fired when moving between child elements.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    if (!isInactive) {
      pickFirst(event.dataTransfer.files);
    }
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      tabIndex={-1}
      aria-hidden
      className="sr-only"
      disabled={isInactive}
      onChange={(event) => {
        pickFirst(event.target.files);
        event.target.value = ''; // allow re-picking the same file
      }}
    />
  );

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-card p-4 animate-in fade-in-0 zoom-in-95 duration-200">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <FileCheck className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)} · Ready to import
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openPicker}
          disabled={disabled}
        >
          Replace
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={onRemove}
          disabled={disabled}
          aria-label={`Remove ${file.name}`}
        >
          <X aria-hidden />
        </Button>
        {hiddenInput}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPicker}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isInactive}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        className={cn(
          'group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ease-out outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed',
          isDragging
            ? 'border-primary bg-accent/60'
            : 'border-border hover:border-primary/50 hover:bg-accent/30',
          error && !isDragging && 'border-destructive/50',
        )}
      >
        <span
          className={cn(
            'flex size-12 items-center justify-center rounded-full bg-accent text-primary transition-transform duration-200 ease-out',
            isDragging ? '-translate-y-1' : 'group-hover:-translate-y-0.5',
          )}
        >
          {isProcessing ? (
            <LoaderCircle className="size-6 animate-spin" aria-hidden />
          ) : (
            <CloudUpload className="size-6" aria-hidden />
          )}
        </span>
        <span className="text-sm font-medium text-foreground">
          {isProcessing
            ? 'Checking file…'
            : isDragging
              ? 'Drop to upload'
              : title}
        </span>
        <span id={hintId} className="text-xs text-muted-foreground">
          or <span className="font-medium text-primary">browse files</span> ·{' '}
          {hint}
        </span>
      </button>
      {hiddenInput}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
