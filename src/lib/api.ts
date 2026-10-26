import { isoToBrazilianDate, normalizeCnpj, onlyDigits } from './validators';

/**
 * CEP e CNPJ são ajuda de preenchimento, nunca bloqueio: qualquer falha de rede ou resposta
 * inesperada vira `null`, e a tela segue aceitando o preenchimento manual.
 */

const TIMEOUT_MS = 8000;

export interface CepAddress {
  street: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
}

export interface CompanyData {
  legalName: string;
  tradeName: string;
  foundationDate: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  uf: string;
}

interface ViaCepResponse {
  erro?: boolean | string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

interface BrasilApiCnpjResponse {
  razao_social?: string;
  nome_fantasia?: string;
  data_inicio_atividade?: string;
  ddd_telefone_1?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  descricao_tipo_de_logradouro?: string;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function mapCepResponse(data: ViaCepResponse): CepAddress | null {
  if (data.erro === true || data.erro === 'true' || !text(data.localidade)) {
    return null;
  }

  return {
    street: text(data.logradouro),
    complement: text(data.complemento),
    district: text(data.bairro),
    city: text(data.localidade),
    uf: text(data.uf).toUpperCase(),
  };
}

export function mapCnpjResponse(data: BrasilApiCnpjResponse): CompanyData | null {
  const legalName = text(data.razao_social);

  if (!legalName) {
    return null;
  }

  const kind = text(data.descricao_tipo_de_logradouro);
  const street = text(data.logradouro);

  return {
    legalName,
    tradeName: text(data.nome_fantasia),
    foundationDate: isoToBrazilianDate(text(data.data_inicio_atividade)),
    phone: onlyDigits(text(data.ddd_telefone_1)),
    cep: onlyDigits(text(data.cep)),
    street: kind && street ? `${kind} ${street}` : street,
    number: text(data.numero),
    complement: text(data.complemento),
    district: text(data.bairro),
    city: text(data.municipio),
    uf: text(data.uf).toUpperCase(),
  };
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchAddressByCep(cep: string): Promise<CepAddress | null> {
  const digits = onlyDigits(cep);

  if (digits.length !== 8) {
    return null;
  }

  const data = await getJson<ViaCepResponse>(`https://viacep.com.br/ws/${digits}/json/`);

  return data ? mapCepResponse(data) : null;
}

export async function fetchCompanyByCnpj(cnpj: string): Promise<CompanyData | null> {
  // A BrasilAPI ainda não atende o CNPJ alfanumérico da Receita, então só os numéricos vão.
  const digits = normalizeCnpj(cnpj);

  if (!/^\d{14}$/.test(digits)) {
    return null;
  }

  const data = await getJson<BrasilApiCnpjResponse>(
    `https://brasilapi.com.br/api/cnpj/v1/${digits}`,
  );

  return data ? mapCnpjResponse(data) : null;
}
