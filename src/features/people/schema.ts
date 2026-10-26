import { z } from 'zod';

import { maskCep, maskCnpj, maskCpf, maskPhone } from '@/lib/masks';
import {
  brazilianDateToIso,
  isAdult,
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

const requiredText = (message: string) => z.string().trim().min(1, message);

const fullName = (message: string) =>
  requiredText(message).refine((value) => value.includes(' '), 'Informe o nome e o sobrenome');

export const contactAddressSchema = z.object({
  email: requiredText('Informe o e-mail').refine(isValidEmail, 'E-mail inválido'),
  phone: requiredText('Informe o telefone').refine(isValidPhone, 'Telefone inválido'),
  cep: requiredText('Informe o CEP').refine(isValidCep, 'CEP inválido'),
  street: requiredText('Informe o logradouro'),
  number: requiredText('Informe o número'),
  complement: z.string().trim(),
  district: requiredText('Informe o bairro'),
  city: requiredText('Informe a cidade'),
  uf: requiredText('Informe a UF').refine(isValidUf, 'UF inválida'),
});

export const individualDetailsSchema = z.object({
  name: fullName('Informe o nome completo'),
  cpf: requiredText('Informe o CPF').refine(isValidCpf, 'CPF inválido'),
  rg: requiredText('Informe o RG'),
  rgIssuer: requiredText('Informe o órgão emissor'),
  birthDate: requiredText('Informe a data de nascimento')
    .refine(isValidBrazilianDate, 'Data inválida')
    .refine((value) => isAdult(value), 'O cadastro exige maior de 18 anos'),
  maritalStatus: z.enum(MARITAL_STATUSES, { error: 'Selecione o estado civil' }),
  occupation: requiredText('Informe a profissão'),
  nationality: requiredText('Informe a nacionalidade'),
});

export const companyDetailsSchema = z.object({
  legalName: requiredText('Informe a razão social'),
  tradeName: z.string().trim(),
  cnpj: requiredText('Informe o CNPJ').refine(isValidCnpj, 'CNPJ inválido'),
  stateRegistration: z.string().trim(),
  foundationDate: requiredText('Informe a data de abertura').refine(
    isValidBrazilianDate,
    'Data inválida',
  ),
});

export const representativeSchema = z.object({
  name: fullName('Informe o nome do representante'),
  cpf: requiredText('Informe o CPF do representante').refine(isValidCpf, 'CPF inválido'),
  role: requiredText('Informe o cargo'),
  email: requiredText('Informe o e-mail').refine(isValidEmail, 'E-mail inválido'),
  phone: requiredText('Informe o telefone').refine(isValidPhone, 'Telefone inválido'),
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
