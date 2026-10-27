import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import { fetchAddressByCep, fetchCompanyByCnpj } from '@/lib/api';
import { maskCep, maskPhone } from '@/lib/masks';
import { isValidCnpj, normalizeCnpj, onlyDigits } from '@/lib/validators';

import type { PersonFormValues } from './schema';
import type { PersonFormApi } from './use-person-form';

export interface AutofillState {
  loading: boolean;
  notFound: boolean;
}
function filler(form: PersonFormApi) {
  return (field: keyof PersonFormValues, value: string) => {
    if (value) {
      form.setValue(field, value, { shouldValidate: true, shouldDirty: true });
    }
  };
}

export function useCepAutofill(form: PersonFormApi): AutofillState {
  // `form.watch` só re-renderiza quem chamou `useForm`; num filho, quem assina é `useWatch`.
  const cep = useWatch({ control: form.control, name: 'cep' });
  const digits = onlyDigits(cep ?? '');
  const enabled = digits.length === 8;

  const query = useQuery({
    queryKey: ['cep', digits],
    queryFn: () => fetchAddressByCep(digits),
    enabled,
    staleTime: Infinity,
    retry: false,
  });

  const address = query.data ?? null;
  // No cadastro novo o campo chega vazio; na edição ele já vem preenchido. Marcar o valor inicial
  // como aplicado evita que a consulta sobrescreva o endereço corrigido à mão.
  const applied = useRef<string | null>(enabled ? digits : null);

  useEffect(() => {
    if (!address || applied.current === digits) {
      return;
    }

    applied.current = digits;

    const fill = filler(form);

    fill('street', address.street);
    fill('district', address.district);
    fill('city', address.city);
    fill('uf', address.uf);
    fill('complement', address.complement);
  }, [address, digits, form]);

  return {
    loading: enabled && query.isFetching,
    notFound: enabled && !query.isFetching && query.isFetched && address === null,
  };
}

export function useCnpjAutofill(form: PersonFormApi): AutofillState {
  const raw = useWatch({ control: form.control, name: 'cnpj' }) ?? '';
  const normalized = normalizeCnpj(raw);
  const enabled = isValidCnpj(raw) && /^\d{14}$/.test(normalized);

  const query = useQuery({
    queryKey: ['cnpj', normalized],
    queryFn: () => fetchCompanyByCnpj(normalized),
    enabled,
    staleTime: Infinity,
    retry: false,
  });

  const company = query.data ?? null;
  // Mesma regra do CEP: abrir a edição de uma empresa já salva não pode trocar o que está na ficha
  // pelo que a Receita devolve agora.
  const applied = useRef<string | null>(enabled ? normalized : null);

  useEffect(() => {
    if (!company || applied.current === normalized) {
      return;
    }

    applied.current = normalized;

    const fill = filler(form);

    fill('legalName', company.legalName);
    fill('tradeName', company.tradeName);
    fill('foundationDate', company.foundationDate);
    fill('phone', maskPhone(company.phone));
    fill('cep', maskCep(company.cep));
    fill('street', company.street);
    fill('number', company.number);
    fill('complement', company.complement);
    fill('district', company.district);
    fill('city', company.city);
    fill('uf', company.uf);
  }, [company, normalized, form]);

  return {
    loading: enabled && query.isFetching,
    notFound: enabled && !query.isFetching && query.isFetched && company === null,
  };
}
