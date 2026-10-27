import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useWatch } from 'react-hook-form';

import { fetchAddressByCep, fetchCompanyByCnpj } from '@/lib/api';
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

// `editing` marca a tela que abre com um cadastro salvo. Só lá o valor que já está no formulário
// entra como aplicado, para a consulta não trocar o que foi corrigido à mão. No cadastro novo a
// busca precisa rodar mesmo quando o CEP chega pronto da consulta de CNPJ.
export function useCepAutofill(form: PersonFormApi, editing = false): AutofillState {
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
  const applied = useRef<string | null>(editing && enabled ? digits : null);

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

export function useCnpjAutofill(form: PersonFormApi, editing = false): AutofillState {
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

  // Mesma regra do CEP: abrir a edição de uma empresa já salva não pode trocar o que está na
  // ficha pelo que a Receita devolve agora.
  const company = query.data ?? null;
  const applied = useRef<string | null>(editing && enabled ? normalized : null);

  useEffect(() => {
    if (!company || applied.current === normalized) {
      return;
    }

    applied.current = normalized;

    const fill = filler(form);

    // Só os dados da empresa. Contato e endereço ficam de fora de propósito: um cadastro novo tem
    // que chegar nessa etapa com tudo vazio, e o endereço entra pelo CEP, como na pessoa física.
    fill('legalName', company.legalName);
    fill('tradeName', company.tradeName);
    fill('foundationDate', company.foundationDate);
  }, [company, normalized, form]);

  return {
    loading: enabled && query.isFetching,
    notFound: enabled && !query.isFetching && query.isFetched && company === null,
  };
}
