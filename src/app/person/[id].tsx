import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { listDocuments } from '@/features/documents/repository';
import { calculateDocumentationStatus } from '@/features/documents/types';
import { getPerson } from '@/features/people/repository';
import {
  MARITAL_STATUS_LABELS,
  PERSON_TYPE_LABELS,
  personDisplayName,
  type Person,
} from '@/features/people/types';
import { maskCep, maskCnpj, maskCpf, maskPhone } from '@/lib/masks';
import { isoToBrazilianDate } from '@/lib/validators';

interface Row {
  label: string;
  value: string;
}

function sectionsFor(person: Person): { title: string; rows: Row[] }[] {
  const address: Row[] = [
    { label: 'E-mail', value: person.email },
    { label: 'Telefone', value: maskPhone(person.phone) },
    { label: 'CEP', value: maskCep(person.cep) },
    {
      label: 'Endereço',
      value: [person.street, person.number, person.complement].filter(Boolean).join(', '),
    },
    { label: 'Bairro', value: person.district },
    { label: 'Cidade', value: `${person.city} - ${person.uf}` },
  ];

  if (person.type === 'PF') {
    return [
      {
        title: 'Dados pessoais',
        rows: [
          { label: 'CPF', value: maskCpf(person.cpf) },
          { label: 'RG', value: `${person.rg} ${person.rgIssuer}`.trim() },
          { label: 'Nascimento', value: isoToBrazilianDate(person.birthDate) },
          { label: 'Estado civil', value: MARITAL_STATUS_LABELS[person.maritalStatus] },
          { label: 'Profissão', value: person.occupation },
          { label: 'Nacionalidade', value: person.nationality },
        ],
      },
      { title: 'Contato e endereço', rows: address },
    ];
  }

  const sections = [
    {
      title: 'Dados da empresa',
      rows: [
        { label: 'CNPJ', value: maskCnpj(person.cnpj) },
        { label: 'Nome fantasia', value: person.tradeName ?? 'Não informado' },
        { label: 'Inscrição estadual', value: person.stateRegistration ?? 'Não informada' },
        { label: 'Abertura', value: isoToBrazilianDate(person.foundationDate) },
      ],
    },
    { title: 'Contato e endereço', rows: address },
  ];

  if (person.representative) {
    sections.push({
      title: 'Representante legal',
      rows: [
        { label: 'Nome', value: person.representative.name },
        { label: 'CPF', value: maskCpf(person.representative.cpf) },
        { label: 'Cargo', value: person.representative.role },
        { label: 'E-mail', value: person.representative.email },
        { label: 'Telefone', value: maskPhone(person.representative.phone) },
      ],
    });
  }

  return sections;
}

export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();

  const query = useQuery({
    queryKey: ['person', id],
    queryFn: async () => {
      const person = await getPerson(db, id);

      if (!person) {
        return null;
      }

      const documents = await listDocuments(db, id);
      const status = calculateDocumentationStatus(
        person.type,
        documents.map((document) => document.type),
      );

      return { person, status };
    },
  });

  if (query.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (query.isError || !query.data) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
        <EmptyState
          title="Cadastro não encontrado"
          message="Ele pode ter sido excluído neste aparelho."
        />
      </SafeAreaView>
    );
  }

  const { person, status } = query.data;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-neutral-900">{personDisplayName(person)}</Text>
          <View className="flex-row flex-wrap gap-2">
            <Badge label={PERSON_TYPE_LABELS[person.type]} />
            <Badge
              label={`Documentação: ${status.label}`}
              tone={status.complete ? 'success' : 'warning'}
            />
          </View>
        </View>

        {sectionsFor(person).map((section) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}
