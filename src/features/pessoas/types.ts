import type { Uf } from '@/lib/validators';

export type PersonType = 'PF' | 'PJ';

export const MARITAL_STATUSES = [
  'single',
  'married',
  'civil_union',
  'separated',
  'divorced',
  'widowed',
] as const;

export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: 'Solteiro(a)',
  married: 'Casado(a)',
  civil_union: 'União estável',
  separated: 'Separado(a)',
  divorced: 'Divorciado(a)',
  widowed: 'Viúvo(a)',
};

export const PERSON_TYPE_LABELS: Record<PersonType, string> = {
  PF: 'Pessoa física',
  PJ: 'Pessoa jurídica',
};

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  uf: Uf;
}

export interface LegalRepresentative {
  id: string;
  personId: string;
  name: string;
  cpf: string;
  role: string;
  email: string;
  phone: string;
}

export type LegalRepresentativeInput = Omit<LegalRepresentative, 'id' | 'personId'>;

interface PersonCommon extends Address {
  id: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Individual extends PersonCommon {
  type: 'PF';
  name: string;
  cpf: string;
  rg: string;
  rgIssuer: string;
  birthDate: string;
  maritalStatus: MaritalStatus;
  occupation: string;
  nationality: string;
}

export interface Company extends PersonCommon {
  type: 'PJ';
  legalName: string;
  tradeName: string | null;
  cnpj: string;
  stateRegistration: string | null;
  foundationDate: string;
  representative: LegalRepresentative | null;
}

export type Person = Individual | Company;

export type IndividualInput = Omit<Individual, 'id' | 'createdAt' | 'updatedAt'>;

export type CompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'representative'> & {
  representative: LegalRepresentativeInput | null;
};

export type PersonInput = IndividualInput | CompanyInput;

export function personDisplayName(person: Person): string {
  return person.type === 'PJ' ? person.legalName : person.name;
}

export function personDocument(person: Person): string {
  return person.type === 'PJ' ? person.cnpj : person.cpf;
}
