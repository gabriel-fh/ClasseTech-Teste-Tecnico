import { View } from 'react-native';

import { FormSelectField } from '@/components/form/form-select-field';
import { FormTextField } from '@/components/form/form-text-field';
import { maskCpf, maskDate } from '@/lib/masks';

import { FIELD_LIMITS, type PersonFormValues } from '../schema';
import { MARITAL_STATUSES, MARITAL_STATUS_LABELS } from '../types';
import type { PersonFormApi } from '../use-person-form';

const MARITAL_STATUS_OPTIONS = MARITAL_STATUSES.map((value) => ({
  value,
  label: MARITAL_STATUS_LABELS[value],
}));

export function IndividualDetailsStep({ control }: { control: PersonFormApi['control'] }) {
  return (
    <View className="gap-4">
      <FormTextField<PersonFormValues>
        control={control}
        name="name"
        label="Nome completo"
        placeholder="Maria Souza"
        autoCapitalize="words"
        autoComplete="name"
        maxLength={FIELD_LIMITS.name}
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="cpf"
        label="CPF"
        placeholder="000.000.000-00"
        keyboardType="number-pad"
        maxLength={14}
        mask={maskCpf}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormTextField<PersonFormValues>
            control={control}
            name="rg"
            label="RG"
            placeholder="12.345.678-9"
            maxLength={FIELD_LIMITS.document}
          />
        </View>
        <View className="flex-1">
          <FormTextField<PersonFormValues>
            control={control}
            name="rgIssuer"
            label="Órgão emissor"
            placeholder="SSP/RJ"
            autoCapitalize="characters"
            maxLength={FIELD_LIMITS.document}
          />
        </View>
      </View>

      <FormTextField<PersonFormValues>
        control={control}
        name="birthDate"
        label="Data de nascimento"
        placeholder="00/00/0000"
        keyboardType="number-pad"
        maxLength={10}
        mask={maskDate}
        hint="O cadastro exige maior de 18 anos"
      />

      <FormSelectField<PersonFormValues, (typeof MARITAL_STATUSES)[number]>
        control={control}
        name="maritalStatus"
        label="Estado civil"
        options={MARITAL_STATUS_OPTIONS}
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="occupation"
        label="Profissão"
        placeholder="Arquiteta"
        maxLength={FIELD_LIMITS.text}
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="nationality"
        label="Nacionalidade"
        placeholder="Brasileira"
        maxLength={FIELD_LIMITS.text}
      />
    </View>
  );
}
