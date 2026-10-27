import { Directory, File, Paths } from 'expo-file-system';

export const MAX_FILE_BYTES = 10 * 1024 * 1024;

function folderFor(personId: string): Directory {
  const folder = new Directory(Paths.document, 'documents', personId);

  if (!folder.exists) {
    folder.create({ intermediates: true });
  }

  return folder;
}

function safeName(name: string): string {
  const cleaned = name.replace(/[^\w.\-]+/g, '_').slice(-80);

  return `${Date.now()}-${cleaned || 'arquivo'}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function saveAttachment(personId: string, sourceUri: string, fileName: string): string {
  const source = new File(sourceUri);
  const destination = new File(folderFor(personId), safeName(fileName));

  source.copy(destination);

  return destination.uri;
}

// `File.size` volta vazio logo depois do copy, entao o tamanho vem de quem escolheu o arquivo.
export function measure(sourceUri: string): number {
  return new File(sourceUri).size ?? 0;
}

export function removeFile(uri: string): void {
  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }
  } catch {
    // Arquivo já sumiu do disco: o registro no banco sai do mesmo jeito.
  }
}

export function removeFiles(uris: string[]): void {
  uris.forEach(removeFile);
}

export function removePersonFolder(personId: string): void {
  try {
    const folder = new Directory(Paths.document, 'documents', personId);

    if (folder.exists) {
      folder.delete();
    }
  } catch {
    // Mesma coisa: pasta ausente não impede a exclusão do cadastro.
  }
}
