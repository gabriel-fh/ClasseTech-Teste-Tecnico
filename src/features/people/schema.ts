import { z } from 'zod';

import { maskCep, maskCnpj, maskCpf, maskPhone } from '@/lib/masks';
import {
  brazilianDateToIso,
  isAdult,
  isNotFutureDate,
  isPlausibleAge,
  isValidBrazilianDate,
  isValidCep,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidPhone,
  isoToBrazilianDate,
  isValidUf,
  normalizeCnpj,
  onlyDigits,
} from '@/lib/validators';

import {
  MARITAL_STATUSES,
  type CompanyInput,
  type IndividualInput,
  type MaritalStatus,
  type Person,
  type PersonInput,
  type PersonType,
} from './types';

// O `maxLength` do input corta na digitação; o limite aqui barra o que chega colado ou de um
// rascunho antigo. Os dois leem esta tabela para não divergir.
export const FIELD_LIMITS = {
  name: 120,
  legalName: 150,
  email: 120,
  text: 60,
  line: 120,
  document: 20,
  number: 10,
  date: 10,
  uf: 2,
} as const;

const tooLong = (max: number) => `Use no máximo ${max} caracteres`;

const requiredText = (message: string, max: number = FIELD_LIMITS.text) =>
  z.string().trim().min(1, message).max(max, tooLong(max));

const optionalCapped = (max: number) => z.string().trim().max(max, tooLong(max));

const fullName = (message: string) =>
  requiredText(message, FIELD_LIMITS.name).refine(
    (value) => value.includes(' '),
    'Informe o nome e o sobrenome',
  );

export const contactAddressSchema = z.object({
  email: requiredText('Informe o e-mail', FIELD_LIMITS.email).refine(
    isValidEmail,
    'E-mail inválido',
  ),
  phone: requiredText('Informe o telefone', FIELD_LIMITS.document).refine(
    isValidPhone,
    'Telefone inválido',
  ),
  cep: requiredText('Informe o CEP', FIELD_LIMITS.document).refine(isValidCep, 'CEP inválido'),
  street: requiredText('Informe o logradouro', FIELD_LIMITS.line),
  number: requiredText('Informe o número', FIELD_LIMITS.number),
  complement: optionalCapped(FIELD_LIMITS.text),
  district: requiredText('Informe o bairro'),
  city: requiredText('Informe a cidade'),
  uf: requiredText('Informe a UF', FIELD_LIMITS.uf).refine(isValidUf, 'UF inválida'),
});

export const individualDetailsSchema = z.object({
  name: fullName('Informe o nome completo'),
  cpf: requiredText('Informe o CPF', FIELD_LIMITS.document).refine(isValidCpf, 'CPF inválido'),
  rg: requiredText('Informe o RG', FIELD_LIMITS.document).min(5, 'RG incompleto'),
  rgIssuer: requiredText('Informe o órgão emissor', FIELD_LIMITS.document),
  birthDate: requiredText('Informe a data de nascimento', FIELD_LIMITS.date)
    .refine(isValidBrazilianDate, 'Data inválida')
    .refine((value) => isAdult(value), 'O cadastro exige maior de 18 anos')
    .refine((value) => isPlausibleAge(value), 'Confira o ano de nascimento'),
  maritalStatus: z.enum(MARITAL_STATUSES, { error: 'Selecione o estado civil' }),
  occupation: requiredText('Informe a profissão'),
  nationality: requiredText('Informe a nacionalidade'),
});

export const companyDetailsSchema = z.object({
  legalName: requiredText('Informe a razão social', FIELD_LIMITS.legalName),
  tradeName: optionalCapped(FIELD_LIMITS.line),
  cnpj: requiredText('Informe o CNPJ', FIELD_LIMITS.document).refine(isValidCnpj, 'CNPJ inválido'),
  stateRegistration: optionalCapped(FIELD_LIMITS.document),
  foundationDate: requiredText('Informe a data de abertura', FIELD_LIMITS.date)
    .refine(isValidBrazilianDate, 'Data inválida')
    .refine((value) => isNotFutureDate(value), 'A data de abertura não pode ser futura'),
});

export const representativeSchema = z.object({
  name: fullName('Informe o nome do representante'),
  cpf: requiredText('Informe o CPF do representante', FIELD_LIMITS.document).refine(
    isValidCpf,
    'CPF inválido',
  ),
  role: requiredText('Informe o cargo'),
  email: requiredText('Informe o e-mail', FIELD_LIMITS.email).refine(
    isValidEmail,
    'E-mail inválido',
  ),
  phone: requiredText('Informe o telefone', FIELD_LIMITS.document).refine(
    isValidPhone,
    'Telefone inválido',
  ),
});

export const individualFormSchema = z.object({
  type: z.literal('PF'),
  ...individualDetailsSchema.shape,
  ...contactAddressSchema.shape,
});

export const companyFormSchema = z.object({
  type: z.literal('PJ'),
  ...companyDetailsSchema.shape,
  ...contactAddressSchema.shape,
  representative: representativeSchema,
});

export function personFormSchemaFor(type: PersonType) {
  return type === 'PF' ? individualFormSchema : companyFormSchema;
}

export type ContactAddressForm = z.infer<typeof contactAddressSchema>;
export type RepresentativeForm = z.infer<typeof representativeSchema>;

// Objeto plano com os campos dos dois tipos. `z.object` descarta o que sobra do outro tipo.
export interface PersonFormValues extends ContactAddressForm {
  type: PersonType;

  name: string;
  cpf: string;
  rg: string;
  rgIssuer: string;
  birthDate: string;
  maritalStatus: MaritalStatus;
  occupation: string;
  nationality: string;

  legalName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  foundationDate: string;
  representative: RepresentativeForm;
}

export const INDIVIDUAL_DETAIL_FIELDS = [
  'name',
  'cpf',
  'rg',
  'rgIssuer',
  'birthDate',
  'maritalStatus',
  'occupation',
  'nationality',
] as const satisfies readonly (keyof PersonFormValues)[];

export const COMPANY_DETAIL_FIELDS = [
  'legalName',
  'tradeName',
  'cnpj',
  'stateRegistration',
  'foundationDate',
] as const satisfies readonly (keyof PersonFormValues)[];

export const CONTACT_ADDRESS_FIELDS = [
  'email',
  'phone',
  'cep',
  'street',
  'number',
  'complement',
  'district',
  'city',
  'uf',
] as const satisfies readonly (keyof PersonFormValues)[];

export const REPRESENTATIVE_FIELDS = [
  'representative.name',
  'representative.cpf',
  'representative.role',
  'representative.email',
  'representative.phone',
] as const;

export function emptyPersonFormValues(type: PersonType): PersonFormValues {
  return {
    type,

    name: '',
    cpf: '',
    rg: '',
    rgIssuer: '',
    birthDate: '',
    maritalStatus: 'single',
    occupation: '',
    nationality: 'Brasileira',

    legalName: '',
    tradeName: '',
    cnpj: '',
    stateRegistration: '',
    foundationDate: '',
    representative: { name: '', cpf: '', role: '', email: '', phone: '' },

    email: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    uf: '',
  };
}

function optionalText(value: string): string | null {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function toPersonInput(form: PersonFormValues): PersonInput {
  const common = {
    email: form.email.trim(),
    phone: onlyDigits(form.phone),
    cep: onlyDigits(form.cep),
    street: form.street.trim(),
    number: form.number.trim(),
    complement: optionalText(form.complement),
    district: form.district.trim(),
    city: form.city.trim(),
    uf: form.uf.trim().toUpperCase() as IndividualInput['uf'],
  };

  if (form.type === 'PF') {
    const individual: IndividualInput = {
      ...common,
      type: 'PF',
      name: form.name.trim(),
      cpf: onlyDigits(form.cpf),
      rg: form.rg.trim(),
      rgIssuer: form.rgIssuer.trim(),
      birthDate: brazilianDateToIso(form.birthDate) ?? '',
      maritalStatus: form.maritalStatus,
      occupation: form.occupation.trim(),
      nationality: form.nationality.trim(),
    };

    return individual;
  }

  const company: CompanyInput = {
    ...common,
    type: 'PJ',
    legalName: form.legalName.trim(),
    tradeName: optionalText(form.tradeName),
    cnpj: normalizeCnpj(form.cnpj),
    stateRegistration: optionalText(form.stateRegistration),
    foundationDate: brazilianDateToIso(form.foundationDate) ?? '',
    representative: {
      name: form.representative.name.trim(),
      cpf: onlyDigits(form.representative.cpf),
      role: form.representative.role.trim(),
      email: form.representative.email.trim(),
      phone: onlyDigits(form.representative.phone),
    },
  };

  return company;
}

export function toPersonFormValues(person: Person): PersonFormValues {
  const base = emptyPersonFormValues(person.type);

  const common = {
    email: person.email,
    phone: maskPhone(person.phone),
    cep: maskCep(person.cep),
    street: person.street,
    number: person.number,
    complement: person.complement ?? '',
    district: person.district,
    city: person.city,
    uf: person.uf,
  };

  if (person.type === 'PF') {
    return {
      ...base,
      ...common,
      type: 'PF',
      name: person.name,
      cpf: maskCpf(person.cpf),
      rg: person.rg,
      rgIssuer: person.rgIssuer,
      birthDate: isoToBrazilianDate(person.birthDate),
      maritalStatus: person.maritalStatus,
      occupation: person.occupation,
      nationality: person.nationality,
    };
  }

  return {
    ...base,
    ...common,
    type: 'PJ',
    legalName: person.legalName,
    tradeName: person.tradeName ?? '',
    cnpj: maskCnpj(person.cnpj),
    stateRegistration: person.stateRegistration ?? '',
    foundationDate: isoToBrazilianDate(person.foundationDate),
    representative: person.representative
      ? {
          name: person.representative.name,
          cpf: maskCpf(person.representative.cpf),
          role: person.representative.role,
          email: person.representative.email,
          phone: maskPhone(person.representative.phone),
        }
      : base.representative,
  };
}
