import { ActivityIndicator, Text, View } from 'react-native';

import { FormTextField } from '@/components/form/form-text-field';
import { maskCnpj, maskDate } from '@/lib/masks';

import type { PersonFormValues } from '../schema';
import { useCnpjAutofill } from '../use-autofill';
import type { PersonFormApi } from '../use-person-form';

export function CompanyDetailsStep({ form }: { form: PersonFormApi }) {
  const control = form.control;
  const cnpj = useCnpjAutofill(form);

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

      <View className="gap-1.5">
        <FormTextField<PersonFormValues>
          control={control}
          name="cnpj"
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          autoCapitalize="characters"
          maxLength={18}
          mask={maskCnpj}
        />

        {cnpj.loading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#8c8373" />
            <Text className="font-body text-sm leading-5 text-ink-400">
              Buscando dados na Receita...
            </Text>
          </View>
        ) : null}

        {cnpj.notFound ? (
          <Text className="text-sm text-ochre-700">
            Não achamos este CNPJ. Preencha os dados manualmente.
          </Text>
        ) : null}
      </View>

      <FormTextField<PersonFormValues>
        control={control}
        name="stateRegistration"
        label="Inscrição estadual"
        placeholder="000000000000"
        autoCapitalize="characters"
        maxLength={20}
        hint="Opcional. O formato muda conforme o estado; escreva ISENTO quando não houver."
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
