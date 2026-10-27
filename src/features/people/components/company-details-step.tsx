import { ActivityIndicator, Text, View } from 'react-native';

import { FormTextField } from '@/components/form/form-text-field';
import { maskCnpj, maskDate } from '@/lib/masks';

import { FIELD_LIMITS, type PersonFormValues } from '../schema';
import { useCnpjAutofill } from '../use-autofill';
import type { PersonFormApi } from '../use-person-form';

// O CNPJ abre a etapa porque é ele que preenche o resto: a consulta traz razão social, nome
// fantasia, data de abertura, telefone e endereço quando a Receita tem o dado.
export function CompanyDetailsStep({
  form,
  editing = false,
}: {
  form: PersonFormApi;
  editing?: boolean;
}) {
  const control = form.control;
  const cnpj = useCnpjAutofill(form, editing);

  return (
    <View className="gap-4">
      <View className="gap-1.5">
        <FormTextField<PersonFormValues>
          control={control}
          name="cnpj"
          label="CNPJ"
          placeholder="00.000.000/0000-00"
          autoCapitalize="characters"
          maxLength={18}
          mask={maskCnpj}
          hint="Preenche os campos abaixo com o que a Receita tiver"
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
        name="legalName"
        label="Razão social"
        placeholder="Imobiliária Exemplo Ltda"
        autoCapitalize="words"
        maxLength={FIELD_LIMITS.legalName}
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="tradeName"
        label="Nome fantasia"
        placeholder="Exemplo Imóveis"
        autoCapitalize="words"
        maxLength={FIELD_LIMITS.line}
        hint="Opcional. A Receita nem sempre tem este campo."
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="stateRegistration"
        label="Inscrição estadual"
        placeholder="000000000000"
        autoCapitalize="characters"
        maxLength={FIELD_LIMITS.document}
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
