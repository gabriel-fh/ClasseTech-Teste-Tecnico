import { normalizeCnpj, onlyDigits } from './validators';

const CPF_PATTERN = '###.###.###-##';
const CNPJ_PATTERN = '##.###.###/####-##';
const CEP_PATTERN = '#####-###';
const DATE_PATTERN = '##/##/####';
const LANDLINE_PATTERN = '(##) ####-####';
const MOBILE_PATTERN = '(##) #####-####';

function applyPattern(value: string, pattern: string): string {
  let result = '';
  let cursor = 0;

  for (const symbol of pattern) {
    if (cursor >= value.length) {
      break;
    }

    if (symbol === '#') {
      result += value[cursor];
      cursor += 1;
    } else {
      result += symbol;
    }
  }

  return result;
}

export function maskCpf(value: string): string {
  return applyPattern(onlyDigits(value).slice(0, 11), CPF_PATTERN);
}

export function maskCnpj(value: string): string {
  return applyPattern(normalizeCnpj(value).slice(0, 14), CNPJ_PATTERN);
}

export function maskCep(value: string): string {
  return applyPattern(onlyDigits(value).slice(0, 8), CEP_PATTERN);
}

export function maskDate(value: string): string {
  return applyPattern(onlyDigits(value).slice(0, 8), DATE_PATTERN);
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  return applyPattern(digits, digits.length > 10 ? MOBILE_PATTERN : LANDLINE_PATTERN);
}

export function obfuscateCpf(value: string): string {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11) {
    return maskCpf(value);
  }

  return `${cpf.slice(0, 3)}.***.***-${cpf.slice(9)}`;
}

export function obfuscateCnpj(value: string): string {
  const cnpj = normalizeCnpj(value);

  if (cnpj.length !== 14) {
    return maskCnpj(value);
  }

  return `${cnpj.slice(0, 2)}.***.***/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}
