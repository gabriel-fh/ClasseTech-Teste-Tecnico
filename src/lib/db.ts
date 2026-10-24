import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'classetech.db';

const DATABASE_VERSION = 1;

const SCHEMA_V1 = `
CREATE TABLE pessoas (
  id TEXT PRIMARY KEY NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('PF', 'PJ')),
  nome TEXT,
  cpf TEXT UNIQUE,
  rg TEXT,
  orgao_emissor TEXT,
  data_nascimento TEXT,
  estado_civil TEXT,
  profissao TEXT,
  nacionalidade TEXT,
  razao_social TEXT,
  nome_fantasia TEXT,
  cnpj TEXT UNIQUE,
  inscricao_estadual TEXT,
  data_abertura TEXT,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cep TEXT NOT NULL,
  logradouro TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  uf TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE representantes (
  id TEXT PRIMARY KEY NOT NULL,
  pessoa_id TEXT NOT NULL UNIQUE REFERENCES pessoas (id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  cargo TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL
);

CREATE TABLE documentos (
  id TEXT PRIMARY KEY NOT NULL,
  pessoa_id TEXT NOT NULL REFERENCES pessoas (id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  uri TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  tamanho INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX documentos_pessoa_id_idx ON documentos (pessoa_id);
CREATE INDEX pessoas_created_at_idx ON pessoas (created_at DESC);
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
