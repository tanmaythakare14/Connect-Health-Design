import { useState, type JSX } from 'react';
import { LoaderCircle } from 'lucide-react';
import { FileDropzone } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { hasFileExtension } from '@/utils/file';
import { logger } from '@/utils/logger';
import type {
  ImportMappingProjectDialogProps,
  MappingProjectDefinition,
} from '../../@types';
import {
  IMPORT_FILE_ACCEPT,
  IMPORT_FILE_EXTENSIONS,
  IMPORT_FILE_MAX_BYTES,
  IMPORT_FILE_MAX_LABEL,
} from '../../constants';
import { parseMappingProjectDefinition } from '../../utils';

const OVERWRITE_CHECKBOX_ID = 'import-mapping-project-overwrite';

/** Upload a mapping project's JSON export — the workflow import, minus the library. */
export function ImportMappingProjectDialog({
  open,
  onOpenChange,
  onImport,
}: ImportMappingProjectDialogProps): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [definition, setDefinition] = useState<MappingProjectDefinition | null>(
    null,
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCheckingFile, setIsCheckingFile] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Import stays disabled until there's a valid file to import.
  const canImport = !isImporting && file !== null && definition !== null;

  const resetState = (): void => {
    setFile(null);
    setDefinition(null);
    setFileError(null);
    setOverwrite(false);
    setSubmitError(null);
  };

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isImporting) {
      return; // don't drop an in-flight import
    }
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const clearFile = (): void => {
    setFile(null);
    setDefinition(null);
  };

  const handleFileSelect = async (picked: File): Promise<void> => {
    setFileError(null);
    setSubmitError(null);
    clearFile();

    if (!hasFileExtension(picked, IMPORT_FILE_EXTENSIONS)) {
      setFileError('Choose a .json file exported from ConnectHealth.');
      return;
    }
    if (picked.size > IMPORT_FILE_MAX_BYTES) {
      setFileError(`This file is larger than ${IMPORT_FILE_MAX_LABEL}.`);
      return;
    }

    setIsCheckingFile(true);
    try {
      const parsed = parseMappingProjectDefinition(await picked.text());
      if (!parsed) {
        setFileError('This file isn’t valid mapping project JSON.');
        return;
      }
      setFile(picked);
      setDefinition(parsed);
    } catch (error) {
      logger.warn('Reading mapping project file failed', { error });
      setFileError('We couldn’t read this file. Please try another.');
    } finally {
      setIsCheckingFile(false);
    }
  };

  const handleImport = async (): Promise<void> => {
    if (!file || !definition) {
      return;
    }

    setIsImporting(true);
    setSubmitError(null);
    try {
      const result = await onImport({
        fileName: file.name,
        definition,
        overwrite,
      });
      if (result.status === 'conflict') {
        setSubmitError(
          `A project named “${result.name}” already exists. Tick “Overwrite” to replace it.`,
        );
        return;
      }
      resetState();
    } catch (error) {
      logger.error('Importing mapping project failed', { error });
      setSubmitError('We couldn’t import the project. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import project</DialogTitle>
          <DialogDescription>
            Upload a mapping project JSON export to add it with its templates.
          </DialogDescription>
        </DialogHeader>

        <FileDropzone
          accept={IMPORT_FILE_ACCEPT}
          file={file}
          onFileSelect={(picked) => void handleFileSelect(picked)}
          onRemove={clearFile}
          title="Drag and drop your project JSON file here"
          hint={`JSON up to ${IMPORT_FILE_MAX_LABEL}`}
          error={fileError}
          isProcessing={isCheckingFile}
          disabled={isImporting}
        />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={OVERWRITE_CHECKBOX_ID}
              checked={overwrite}
              onCheckedChange={(checked) => {
                setOverwrite(checked === true);
                setSubmitError(null);
              }}
              disabled={isImporting}
            />
            <Label
              htmlFor={OVERWRITE_CHECKBOX_ID}
              className="cursor-pointer font-normal"
            >
              Overwrite existing project with the same name
            </Label>
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleImport()}
            disabled={!canImport}
          >
            {isImporting ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden />
                Importing…
              </>
            ) : (
              'Import project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
