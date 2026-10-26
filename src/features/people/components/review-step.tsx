import { Text, View } from 'react-native';

import type { PersonFormValues } from '../schema';
import { MARITAL_STATUS_LABELS, PERSON_TYPE_LABELS } from '../types';

interface ReviewRow {
  label: string;
  value: string;
}

function rowsFor(values: PersonFormValues): { title: string; rows: ReviewRow[] }[] {
  const address: ReviewRow[] = [
    { label: 'E-mail', value: values.email },
    { label: 'Telefone', value: values.phone },
    { label: 'CEP', value: values.cep },
    {
      label: 'Endereço',
      value: [values.street, values.number, values.complement].filter(Boolean).join(', '),
    },
    { label: 'Bairro', value: values.district },
    { label: 'Cidade', value: `${values.city} - ${values.uf}` },
  ];

  if (values.type === 'PF') {
    return [
      {
        title: 'Dados pessoais',
        rows: [
          { label: 'Nome', value: values.name },
          { label: 'CPF', value: values.cpf },
          { label: 'RG', value: `${values.rg} ${values.rgIssuer}`.trim() },
          { label: 'Nascimento', value: values.birthDate },
          { label: 'Estado civil', value: MARITAL_STATUS_LABELS[values.maritalStatus] },
          { label: 'Profissão', value: values.occupation },
          { label: 'Nacionalidade', value: values.nationality },
        ],
      },
      { title: 'Contato e endereço', rows: address },
    ];
  }

  return [
    {
      title: 'Dados da empresa',
      rows: [
        { label: 'Razão social', value: values.legalName },
        { label: 'Nome fantasia', value: values.tradeName || 'Não informado' },
        { label: 'CNPJ', value: values.cnpj },
        { label: 'Inscrição estadual', value: values.stateRegistration || 'Não informada' },
        { label: 'Abertura', value: values.foundationDate },
      ],
    },
    { title: 'Contato e endereço', rows: address },
    {
      title: 'Representante legal',
      rows: [
        { label: 'Nome', value: values.representative.name },
        { label: 'CPF', value: values.representative.cpf },
        { label: 'Cargo', value: values.representative.role },
        { label: 'E-mail', value: values.representative.email },
        { label: 'Telefone', value: values.representative.phone },
      ],
    },
  ];
}

export function ReviewStep({ values }: { values: PersonFormValues }) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-xl font-bold text-neutral-900">Confira antes de salvar</Text>
        <Text className="text-sm text-neutral-500">
          Cadastro de {PERSON_TYPE_LABELS[values.type].toLowerCase()}. Volte para corrigir qualquer
          etapa.
        </Text>
      </View>

      {rowsFor(values).map((section) => (
        <View key={section.title} className="gap-3 rounded-2xl border border-neutral-200 p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {section.title}
          </Text>

          {section.rows.map((row) => (
            <View key={row.label} className="gap-0.5">
              <Text className="text-xs text-neutral-500">{row.label}</Text>
              <Text className="text-base text-neutral-900">{row.value || 'Não informado'}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
