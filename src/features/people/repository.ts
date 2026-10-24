import * as Crypto from 'expo-crypto';
import type { SQLiteBindValue, SQLiteDatabase } from 'expo-sqlite';

import {
  calculateDocumentationStatus,
  type DocumentationStatus,
  type DocumentType,
} from '@/features/documents/types';
import { onlyDigits, type Uf } from '@/lib/validators';

import type {
  Company,
  Individual,
  LegalRepresentative,
  MaritalStatus,
  Person,
  PersonInput,
  PersonType,
} from './types';

export interface PersonFilters {
  search?: string;
  type?: PersonType | null;
  onlyPending?: boolean;
}

export interface PersonSummary {
  id: string;
  type: PersonType;
  name: string;
  document: string;
  city: string;
  uf: string;
  status: DocumentationStatus;
}

interface PersonRow {
  id: string;
  type: PersonType;
  name: string | null;
  cpf: string | null;
  rg: string | null;
  rg_issuer: string | null;
  birth_date: string | null;
  marital_status: string | null;
  occupation: string | null;
  nationality: string | null;
  legal_name: string | null;
  trade_name: string | null;
  cnpj: string | null;
  state_registration: string | null;
  foundation_date: string | null;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  uf: string;
  created_at: string;
  updated_at: string;
}

interface RepresentativeRow {
  id: string;
  person_id: string;
  name: string;
  cpf: string;
  role: string;
  email: string;
  phone: string;
}

interface SummaryRow {
  id: string;
  type: PersonType;
  name: string | null;
  legal_name: string | null;
  cpf: string | null;
  cnpj: string | null;
  city: string;
  uf: string;
  attached_types: string | null;
}

const SUMMARY_SELECT = `SELECT
  p.id,
  p.type,
  p.name,
  p.legal_name,
  p.cpf,
  p.cnpj,
  p.city,
  p.uf,
  (
    SELECT group_concat(DISTINCT d.type)
    FROM documents d
    WHERE d.person_id = p.id
  ) AS attached_types
FROM people p`;

function toRepresentative(row: RepresentativeRow): LegalRepresentative {
  return {
    id: row.id,
    personId: row.person_id,
    name: row.name,
    cpf: row.cpf,
    role: row.role,
    email: row.email,
    phone: row.phone,
  };
}

function toPerson(row: PersonRow, representative: LegalRepresentative | null = null): Person {
  const common = {
    id: row.id,
    email: row.email,
    phone: row.phone,
    cep: row.cep,
    street: row.street,
    number: row.number,
    complement: row.complement,
    district: row.district,
    city: row.city,
    uf: row.uf as Uf,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.type === 'PJ') {
    const company: Company = {
      ...common,
      type: 'PJ',
      legalName: row.legal_name ?? '',
      tradeName: row.trade_name,
      cnpj: row.cnpj ?? '',
      stateRegistration: row.state_registration,
      foundationDate: row.foundation_date ?? '',
      representative,
    };

    return company;
  }

  const individual: Individual = {
    ...common,
    type: 'PF',
    name: row.name ?? '',
    cpf: row.cpf ?? '',
    rg: row.rg ?? '',
    rgIssuer: row.rg_issuer ?? '',
    birthDate: row.birth_date ?? '',
    maritalStatus: (row.marital_status ?? 'single') as MaritalStatus,
    occupation: row.occupation ?? '',
    nationality: row.nationality ?? '',
  };

  return individual;
}

type PersonColumns = Omit<PersonRow, 'id' | 'created_at' | 'updated_at'>;

function toColumns(person: PersonInput): PersonColumns {
  const common = {
    type: person.type,
    email: person.email,
    phone: person.phone,
    cep: person.cep,
    street: person.street,
    number: person.number,
    complement: person.complement,
    district: person.district,
    city: person.city,
    uf: person.uf,
  };

  if (person.type === 'PJ') {
    return {
      ...common,
      name: null,
      cpf: null,
      rg: null,
      rg_issuer: null,
      birth_date: null,
      marital_status: null,
      occupation: null,
      nationality: null,
      legal_name: person.legalName,
      trade_name: person.tradeName,
      cnpj: person.cnpj,
      state_registration: person.stateRegistration,
      foundation_date: person.foundationDate,
    };
  }

  return {
    ...common,
    name: person.name,
    cpf: person.cpf,
    rg: person.rg,
    rg_issuer: person.rgIssuer,
    birth_date: person.birthDate,
    marital_status: person.maritalStatus,
    occupation: person.occupation,
    nationality: person.nationality,
    legal_name: null,
    trade_name: null,
    cnpj: null,
    state_registration: null,
    foundation_date: null,
  };
}

function toSummary(row: SummaryRow): PersonSummary {
  const attachedTypes = (row.attached_types?.split(',') ?? []) as DocumentType[];

  return {
    id: row.id,
    type: row.type,
    name: (row.type === 'PJ' ? row.legal_name : row.name) ?? '',
    document: (row.type === 'PJ' ? row.cnpj : row.cpf) ?? '',
    city: row.city,
    uf: row.uf,
    status: calculateDocumentationStatus(row.type, attachedTypes),
  };
}

export function buildSummaryQuery(filters: PersonFilters = {}): {
  sql: string;
  params: string[];
} {
  const conditions: string[] = [];
  const params: string[] = [];
  const search = filters.search?.trim() ?? '';

  if (search.length > 0) {
    const clauses = ['p.name LIKE ?', 'p.legal_name LIKE ?'];
    params.push(`%${search}%`, `%${search}%`);

    const document = onlyDigits(search);

    if (document.length > 0) {
      clauses.push('p.cpf LIKE ?', 'p.cnpj LIKE ?');
      params.push(`%${document}%`, `%${document}%`);
    }

    conditions.push(`(${clauses.join(' OR ')})`);
  }

  if (filters.type) {
    conditions.push('p.type = ?');
    params.push(filters.type);
  }

  const where = conditions.length > 0 ? `\nWHERE ${conditions.join('\n  AND ')}` : '';

  return { sql: `${SUMMARY_SELECT}${where}\nORDER BY p.created_at DESC`, params };
}

function namedParams(columns: Record<string, SQLiteBindValue>): Record<string, SQLiteBindValue> {
  return Object.fromEntries(Object.entries(columns).map(([key, value]) => [`$${key}`, value]));
}

export async function listPeople(
  db: SQLiteDatabase,
  filters: PersonFilters = {},
): Promise<PersonSummary[]> {
  const { sql, params } = buildSummaryQuery(filters);
  const rows = await db.getAllAsync<SummaryRow>(sql, params);
  const summaries = rows.map(toSummary);

  return filters.onlyPending ? summaries.filter((summary) => !summary.status.complete) : summaries;
}

export async function getPerson(db: SQLiteDatabase, id: string): Promise<Person | null> {
  const row = await db.getFirstAsync<PersonRow>('SELECT * FROM people WHERE id = ?', id);

  if (!row) {
    return null;
  }

  if (row.type !== 'PJ') {
    return toPerson(row);
  }

  const representative = await db.getFirstAsync<RepresentativeRow>(
    'SELECT * FROM representatives WHERE person_id = ?',
    id,
  );

  return toPerson(row, representative ? toRepresentative(representative) : null);
}

export async function findIdByDocument(
  db: SQLiteDatabase,
  document: string,
  type: PersonType,
): Promise<string | null> {
  const column = type === 'PJ' ? 'cnpj' : 'cpf';
  const row = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM people WHERE ${column} = ?`,
    document,
  );

  return row?.id ?? null;
}

export async function isDocumentTaken(
  db: SQLiteDatabase,
  document: string,
  type: PersonType,
  ignoreId?: string,
): Promise<boolean> {
  const id = await findIdByDocument(db, document, type);

  return id !== null && id !== ignoreId;
}

async function saveRepresentative(
  db: SQLiteDatabase,
  personId: string,
  person: PersonInput,
): Promise<void> {
  await db.runAsync('DELETE FROM representatives WHERE person_id = ?', personId);

  if (person.type !== 'PJ' || !person.representative) {
    return;
  }

  const { name, cpf, role, email, phone } = person.representative;

  await db.runAsync(
    `INSERT INTO representatives (id, person_id, name, cpf, role, email, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    Crypto.randomUUID(),
    personId,
    name,
    cpf,
    role,
    email,
    phone,
  );
}

export async function createPerson(db: SQLiteDatabase, person: PersonInput): Promise<string> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  const columns = { id, ...toColumns(person), created_at: now, updated_at: now };
  const names = Object.keys(columns);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO people (${names.join(', ')})
       VALUES (${names.map((name) => `$${name}`).join(', ')})`,
      namedParams(columns),
    );
    await saveRepresentative(db, id, person);
  });

  return id;
}

export async function updatePerson(
  db: SQLiteDatabase,
  id: string,
  person: PersonInput,
): Promise<void> {
  const columns = { ...toColumns(person), updated_at: new Date().toISOString() };
  const assignments = Object.keys(columns).map((name) => `${name} = $${name}`);

  await db.withTransactionAsync(async () => {
    await db.runAsync(`UPDATE people SET ${assignments.join(', ')} WHERE id = $id`, {
      ...namedParams(columns),
      $id: id,
    });
    await saveRepresentative(db, id, person);
  });
}

export async function deletePerson(db: SQLiteDatabase, id: string): Promise<string[]> {
  const files = await db.getAllAsync<{ uri: string }>(
    'SELECT uri FROM documents WHERE person_id = ?',
    id,
  );

  await db.runAsync('DELETE FROM people WHERE id = ?', id);

  return files.map((file) => file.uri);
}
