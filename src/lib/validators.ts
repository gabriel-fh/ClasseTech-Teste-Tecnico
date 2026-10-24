export const UFS = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const;

export type Uf = (typeof UFS)[number];

const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, ...CNPJ_FIRST_WEIGHTS];

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeCnpj(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '');
}

export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split('').map(Number);

  for (let position = 9; position < 11; position += 1) {
    let sum = 0;

    for (let index = 0; index < position; index += 1) {
      sum += digits[index] * (position + 1 - index);
    }

    const expected = ((sum * 10) % 11) % 10;

    if (digits[position] !== expected) {
      return false;
    }
  }

  return true;
}

function cnpjCharValue(char: string): number {
  return char.charCodeAt(0) - 48;
}

function cnpjCheckDigit(base: string, weights: number[]): number {
  const sum = weights.reduce(
    (total, weight, index) => total + cnpjCharValue(base[index]) * weight,
    0,
  );
  const remainder = sum % 11;

  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value);

  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj)) {
    return false;
  }

  const base = cnpj.slice(0, 12);

  if (/^(.)\1{11}$/.test(base)) {
    return false;
  }

  const first = cnpjCheckDigit(base, CNPJ_FIRST_WEIGHTS);
  const second = cnpjCheckDigit(`${base}${first}`, CNPJ_SECOND_WEIGHTS);

  return cnpj.slice(12) === `${first}${second}`;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);

  return digits.length === 10 || digits.length === 11;
}

export function isValidCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

export function isValidUf(value: string): boolean {
  return (UFS as readonly string[]).includes(value.toUpperCase());
}

export function parseBrazilianDate(value: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);

  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  return isRealDate ? date : null;
}

export function isValidBrazilianDate(value: string): boolean {
  return parseBrazilianDate(value) !== null;
}

export function brazilianDateToIso(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());

  if (!match || !isValidBrazilianDate(value)) {
    return null;
  }

  const [, day, month, year] = match;

  return `${year}-${month}-${day}`;
}

export function isoToBrazilianDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  if (!match) {
    return '';
  }

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}

export function calculateAge(value: string, reference: Date = new Date()): number | null {
  const birth = parseBrazilianDate(value);

  if (!birth) {
    return null;
  }

  let age = reference.getFullYear() - birth.getFullYear();
  const monthDiff = reference.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

export function isAdult(value: string, reference: Date = new Date()): boolean {
  const age = calculateAge(value, reference);

  return age !== null && age >= 18;
}
