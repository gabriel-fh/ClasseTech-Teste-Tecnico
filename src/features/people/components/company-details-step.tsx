import { View } from 'react-native';

import { FormTextField } from '@/components/form/form-text-field';
import { maskCnpj, maskDate } from '@/lib/masks';

import type { PersonFormValues } from '../schema';
import type { PersonFormApi } from '../use-person-form';

export function CompanyDetailsStep({ control }: { control: PersonFormApi['control'] }) {
  return (
    <View className="gap-4">
      <FormTextField<PersonFormValues>
        control={control}
        name="legalName"
        label="Razão social"
        placeholder="Imobiliária Exemplo Ltda"
        autoCapitalize="words"
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="tradeName"
        label="Nome fantasia"
        placeholder="Exemplo Imóveis"
        autoCapitalize="words"
        hint="Opcional"
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="cnpj"
        label="CNPJ"
        placeholder="00.000.000/0000-00"
        autoCapitalize="characters"
        maxLength={18}
        mask={maskCnpj}
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="stateRegistration"
        label="Inscrição estadual"
        placeholder="000.000.000.000"
        hint="Opcional"
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="foundationDate"
        label="Data de abertura"
        placeholder="00/00/0000"
        keyboardType="number-pad"
        maxLength={10}
        mask={maskDate}
      />
    </View>
  );
}
