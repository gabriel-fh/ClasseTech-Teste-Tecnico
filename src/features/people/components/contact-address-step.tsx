import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { FormSelectField } from '@/components/form/form-select-field';
import { FormTextField } from '@/components/form/form-text-field';
import { maskCep, maskPhone } from '@/lib/masks';
import { onlyDigits, UFS, type Uf } from '@/lib/validators';

import { FIELD_LIMITS, type PersonFormValues } from '../schema';
import { useCepAutofill } from '../use-autofill';
import type { PersonFormApi } from '../use-person-form';

const UF_OPTIONS = UFS.map((value) => ({ value, label: value }));

export function ContactAddressStep({
  form,
  editing = false,
}: {
  form: PersonFormApi;
  editing?: boolean;
}) {
  const control = form.control;
  const cep = useCepAutofill(form, editing);

  // Num cadastro novo o endereço só chega pronto se veio da consulta do CNPJ ou de um rascunho
  // retomado. Dizer isso evita que ele pareça sobra de outro cadastro.
  const [prefilled] = useState(() => onlyDigits(form.getValues('cep')).length === 8);

  return (
    <View className="gap-4">
      <FormTextField<PersonFormValues>
        control={control}
        name="email"
        label="E-mail"
        placeholder="contato@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        maxLength={FIELD_LIMITS.email}
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="phone"
        label="Telefone"
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
        maxLength={15}
        mask={maskPhone}
      />

      <View className="gap-1.5">
        <FormTextField<PersonFormValues>
          control={control}
          name="cep"
          label="CEP"
          placeholder="00000-000"
          keyboardType="number-pad"
          maxLength={9}
          mask={maskCep}
        />

        {cep.loading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#8c8373" />
            <Text className="font-body text-sm leading-5 text-ink-400">Buscando endereço...</Text>
          </View>
        ) : null}

        {cep.notFound ? (
          <Text className="text-sm text-ochre-700">
            Não achamos este CEP. Preencha o endereço manualmente.
          </Text>
        ) : null}

        {prefilled && !editing && !cep.loading ? (
          <Text className="font-body text-sm leading-5 text-ink-400">
            Endereço preenchido pela consulta automática. Confira e corrija se precisar.
          </Text>
        ) : null}
      </View>

      <FormTextField<PersonFormValues>
        control={control}
        name="street"
        label="Logradouro"
        placeholder="Rua São João"
        autoCapitalize="words"
        maxLength={FIELD_LIMITS.line}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormTextField<PersonFormValues>
            control={control}
            name="number"
            label="Número"
            placeholder="120"
            autoCapitalize="characters"
            maxLength={FIELD_LIMITS.number}
            hint="S/N se não houver"
          />
        </View>
        <View className="flex-[2]">
          <FormTextField<PersonFormValues>
            control={control}
            name="complement"
            label="Complemento"
            placeholder="Apto 302"
            maxLength={FIELD_LIMITS.text}
            hint="Opcional"
          />
        </View>
      </View>

      <FormTextField<PersonFormValues>
        control={control}
        name="district"
        label="Bairro"
        placeholder="Icaraí"
        autoCapitalize="words"
        maxLength={FIELD_LIMITS.text}
      />

      <View className="flex-row gap-3">
        <View className="flex-[2]">
          <FormTextField<PersonFormValues>
            control={control}
            name="city"
            label="Cidade"
            placeholder="Niterói"
            autoCapitalize="words"
            maxLength={FIELD_LIMITS.text}
          />
        </View>
        <View className="flex-1">
          <FormSelectField<PersonFormValues, Uf>
            control={control}
            name="uf"
            label="UF"
            options={UF_OPTIONS}
            placeholder="UF"
          />
        </View>
      </View>
    </View>
  );
}
