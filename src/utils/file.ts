/** 512 → "512 B", 2048 → "2.0 KB", 5_242_880 → "5.0 MB" */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** True when the file's name ends with one of `extensions` (e.g. ['.json']). */
export function hasFileExtension(file: File, extensions: string[]): boolean {
  const name = file.name.toLowerCase();
  return extensions.some((extension) => name.endsWith(extension.toLowerCase()));
}
