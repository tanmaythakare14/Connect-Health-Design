import { useCallback, useEffect, useState, type JSX } from 'react';
import { CloudUpload, LibraryBig, LoaderCircle } from 'lucide-react';
import {
  FileDropzone,
  LineTabsList,
  LineTabsTrigger,
} from '@/components/common';
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
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { hasFileExtension } from '@/utils/file';
import { logger } from '@/utils/logger';
import type {
  ImportSource,
  ImportWorkflowDialogProps,
  ImportWorkflowRequest,
  WorkflowDefinition,
  WorkflowTemplateListState,
} from '../../@types';
import {
  IMPORT_FILE_ACCEPT,
  IMPORT_FILE_EXTENSIONS,
  IMPORT_FILE_MAX_BYTES,
  IMPORT_FILE_MAX_LABEL,
  IMPORT_SOURCE,
} from '../../constants';
import { apiDtoToWorkflowTemplate, listWorkflowTemplates } from '../../service';
import { isImportSource, parseWorkflowDefinition } from '../../utils';
import { WorkflowTemplateLibrary } from './WorkflowTemplateLibrary';

const OVERWRITE_CHECKBOX_ID = 'import-workflow-overwrite';

export function ImportWorkflowDialog({
  open,
  onOpenChange,
  onImport,
}: ImportWorkflowDialogProps): JSX.Element {
  const [tab, setTab] = useState<ImportSource>(IMPORT_SOURCE.FILE);

  // Upload tab
  const [file, setFile] = useState<File | null>(null);
  const [definition, setDefinition] = useState<WorkflowDefinition | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCheckingFile, setIsCheckingFile] = useState(false);

  // Library tab
  const [templatesState, setTemplatesState] =
    useState<WorkflowTemplateListState>({ status: 'loading' });
  const [search, setSearch] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  // Shared
  const [overwrite, setOverwrite] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Import stays disabled until there's something valid to import.
  const canImport =
    !isImporting &&
    (tab === IMPORT_SOURCE.FILE
      ? file !== null && definition !== null
      : selectedTemplateId !== null && templatesState.status === 'success');

  const loadTemplates = useCallback(async (): Promise<void> => {
    setTemplatesState({ status: 'loading' });
    try {
      const dtos = await listWorkflowTemplates();
      setTemplatesState({
        status: 'success',
        data: dtos.map(apiDtoToWorkflowTemplate),
      });
    } catch (error) {
      logger.error('Loading workflow templates failed', { error });
      setTemplatesState({ status: 'error' });
    }
  }, []);

  // Fetch the library lazily, the first time its tab is shown.
  useEffect(() => {
    if (
      open &&
      tab === IMPORT_SOURCE.LIBRARY &&
      templatesState.status !== 'success'
    ) {
      void loadTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to tab/open changes
  }, [open, tab]);

  const resetState = (): void => {
    setTab(IMPORT_SOURCE.FILE);
    setFile(null);
    setDefinition(null);
    setFileError(null);
    setSearch('');
    setSelectedTemplateId(null);
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

  const handleTabChange = (value: string): void => {
    if (isImportSource(value)) {
      setTab(value);
      setSubmitError(null);
    }
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
      const parsed = parseWorkflowDefinition(await picked.text());
      if (!parsed) {
        setFileError('This file isn’t valid workflow JSON.');
        return;
      }
      setFile(picked);
      setDefinition(parsed);
    } catch (error) {
      logger.warn('Reading workflow file failed', { error });
      setFileError('We couldn’t read this file. Please try another.');
    } finally {
      setIsCheckingFile(false);
    }
  };

  const handleImport = async (): Promise<void> => {
    let request: ImportWorkflowRequest;
    if (tab === IMPORT_SOURCE.FILE && file && definition) {
      request = { source: 'file', fileName: file.name, definition, overwrite };
    } else if (tab === IMPORT_SOURCE.LIBRARY && selectedTemplateId) {
      request = {
        source: 'library',
        templateId: selectedTemplateId,
        overwrite,
      };
    } else {
      return;
    }

    setIsImporting(true);
    setSubmitError(null);
    try {
      const result = await onImport(request);
      if (result.status === 'conflict') {
        setSubmitError(
          `A workflow named “${result.name}” already exists. Tick “Overwrite” to replace it.`,
        );
        return;
      }
      resetState();
    } catch (error) {
      logger.error('Importing workflow failed', { error });
      setSubmitError('We couldn’t import the workflow. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-5 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import workflow</DialogTitle>
          <DialogDescription>
            Upload a workflow JSON export, or start from a ready-made template
            in the library.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={handleTabChange} className="gap-4">
          <LineTabsList>
            <LineTabsTrigger value={IMPORT_SOURCE.FILE} disabled={isImporting}>
              <CloudUpload aria-hidden />
              Upload file
            </LineTabsTrigger>
            <LineTabsTrigger
              value={IMPORT_SOURCE.LIBRARY}
              disabled={isImporting}
            >
              <LibraryBig aria-hidden />
              Library
            </LineTabsTrigger>
          </LineTabsList>

          <TabsContent value={IMPORT_SOURCE.FILE}>
            <FileDropzone
              accept={IMPORT_FILE_ACCEPT}
              file={file}
              onFileSelect={(picked) => void handleFileSelect(picked)}
              onRemove={clearFile}
              title="Drag and drop your workflow JSON file here"
              hint={`JSON up to ${IMPORT_FILE_MAX_LABEL}`}
              error={fileError}
              isProcessing={isCheckingFile}
              disabled={isImporting}
            />
          </TabsContent>

          <TabsContent value={IMPORT_SOURCE.LIBRARY}>
            <WorkflowTemplateLibrary
              listState={templatesState}
              search={search}
              onSearchChange={setSearch}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={(templateId) => {
                setSelectedTemplateId(templateId);
                setSubmitError(null);
              }}
              onRetry={() => void loadTemplates()}
              disabled={isImporting}
            />
          </TabsContent>
        </Tabs>

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
              Overwrite existing workflow with the same name
            </Label>
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          )}
        </div>

        <DialogFooter className="border-t pt-4 sm:justify-between">
          {tab === IMPORT_SOURCE.FILE ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleTabChange(IMPORT_SOURCE.LIBRARY)}
              disabled={isImporting}
              className="text-primary hover:bg-accent hover:text-primary sm:-ml-3"
            >
              <LibraryBig aria-hidden />
              Browse library
            </Button>
          ) : (
            <span aria-hidden />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
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
                'Import workflow'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
