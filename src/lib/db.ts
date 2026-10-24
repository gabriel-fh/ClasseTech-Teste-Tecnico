import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'classetech.db';

const DATABASE_VERSION = 1;

const SCHEMA_V1 = `
CREATE TABLE people (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PF', 'PJ')),
  name TEXT,
  cpf TEXT UNIQUE,
  rg TEXT,
  rg_issuer TEXT,
  birth_date TEXT,
  marital_status TEXT,
  occupation TEXT,
  nationality TEXT,
  legal_name TEXT,
  trade_name TEXT,
  cnpj TEXT UNIQUE,
  state_registration TEXT,
  foundation_date TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cep TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  uf TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE representatives (
  id TEXT PRIMARY KEY NOT NULL,
  person_id TEXT NOT NULL UNIQUE REFERENCES people (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY NOT NULL,
  person_id TEXT NOT NULL REFERENCES people (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uri TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX documents_person_id_idx ON documents (person_id);
CREATE INDEX people_created_at_idx ON people (created_at DESC);
`;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(SCHEMA_V1);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
