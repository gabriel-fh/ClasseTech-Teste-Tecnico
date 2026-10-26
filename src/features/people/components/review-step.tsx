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
        <Text className="font-display text-xl text-ink-900">Confira antes de salvar</Text>
        <Text className="font-body text-sm leading-5 text-ink-400">
          Cadastro de {PERSON_TYPE_LABELS[values.type].toLowerCase()}. Volte para corrigir qualquer
          etapa.
        </Text>
      </View>

      {rowsFor(values).map((section) => (
        <View
          key={section.title}
          className="gap-3 rounded-card border border-paper-300 bg-paper-50 p-4"
        >
          <Text className="font-body-semibold text-[11px] uppercase tracking-[1.4px] text-ink-400">
            {section.title}
          </Text>

          {section.rows.map((row) => (
            <View key={row.label} className="gap-0.5">
              <Text className="font-body-medium text-[11px] uppercase tracking-[1px] text-ink-400">
                {row.label}
              </Text>
              <Text className="font-body text-base text-ink-900">
                {row.value || 'Não informado'}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
