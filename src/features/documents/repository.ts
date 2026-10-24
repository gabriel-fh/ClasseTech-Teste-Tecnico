import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { DocumentType, PersonDocument, PersonDocumentInput } from './types';

interface DocumentRow {
  id: string;
  person_id: string;
  type: DocumentType;
  file_name: string;
  uri: string;
  mime_type: string;
  size: number;
  created_at: string;
}

function toDocument(row: DocumentRow): PersonDocument {
  return {
    id: row.id,
    personId: row.person_id,
    type: row.type,
    fileName: row.file_name,
    uri: row.uri,
    mimeType: row.mime_type,
    size: row.size,
    createdAt: row.created_at,
  };
}

export async function listDocuments(
  db: SQLiteDatabase,
  personId: string,
): Promise<PersonDocument[]> {
  const rows = await db.getAllAsync<DocumentRow>(
    'SELECT * FROM documents WHERE person_id = ? ORDER BY created_at ASC',
    personId,
  );

  return rows.map(toDocument);
}

export async function createDocument(
  db: SQLiteDatabase,
  document: PersonDocumentInput,
): Promise<string> {
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO documents (id, person_id, type, file_name, uri, mime_type, size, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    document.personId,
    document.type,
    document.fileName,
    document.uri,
    document.mimeType,
    document.size,
    new Date().toISOString(),
  );

  return id;
}

export async function deleteDocument(db: SQLiteDatabase, id: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ uri: string }>('SELECT uri FROM documents WHERE id = ?', id);

  await db.runAsync('DELETE FROM documents WHERE id = ?', id);

  return row?.uri ?? null;
}
