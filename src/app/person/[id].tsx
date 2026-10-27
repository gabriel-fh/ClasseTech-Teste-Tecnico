import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { showToast } from '@/components/ui/toast';
import { listDocuments } from '@/features/documents/repository';
import { calculateDocumentationStatus } from '@/features/documents/types';
import { removeFiles, removePersonFolder } from '@/features/documents/files';
import { deletePerson, getPerson } from '@/features/people/repository';
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

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const { refetch } = query;

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  async function remove() {
    setDeleting(true);

    try {
      const files = await deletePerson(db, id);

      removeFiles(files);
      removePersonFolder(id);
      setConfirming(false);
      showToast('Cadastro excluído.');
      router.back();
    } catch (error) {
      setConfirming(false);
      Alert.alert('Não foi possível excluir', String(error));
    } finally {
      setDeleting(false);
    }
  }

  if (query.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-paper-50">
        <ActivityIndicator color="#163a5c" />
      </View>
    );
  }

  if (query.isError || !query.data) {
    return (
      <SafeAreaView className="flex-1 bg-paper-50" edges={['bottom']}>
        <EmptyState
          title="Cadastro não encontrado"
          message="Ele pode ter sido excluído neste aparelho."
        />
      </SafeAreaView>
    );
  }

  const { person, status } = query.data;

  return (
    <SafeAreaView className="flex-1 bg-paper-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
        <View className="gap-2">
          <Text className="font-display text-2xl text-ink-900">{personDisplayName(person)}</Text>
          <View className="flex-row flex-wrap gap-2">
            <Badge label={PERSON_TYPE_LABELS[person.type]} />
            <Badge
              label={`Documentação: ${status.label}`}
              tone={status.complete ? 'success' : 'warning'}
            />
          </View>
        </View>

        {sectionsFor(person).map((section) => (
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
      </ScrollView>

      <View className="gap-2 border-t border-paper-200 bg-paper-50 p-4">
        <Button
          label="Documentos"
          onPress={() => router.push({ pathname: '/person/documents/[id]', params: { id } })}
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button label="Excluir" variant="danger" onPress={() => setConfirming(true)} />
          </View>
          <View className="flex-[2]">
            <Button
              label="Editar"
              variant="secondary"
              onPress={() => router.push({ pathname: '/person/edit/[id]', params: { id } })}
            />
          </View>
        </View>
      </View>

      <ConfirmDialog
        visible={confirming}
        title="Excluir este cadastro?"
        message={`${personDisplayName(person)} e os documentos anexados saem do aparelho. Não dá para desfazer.`}
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
        cancelLabel="Cancelar"
        destructive
        onConfirm={() => void remove()}
        onCancel={() => setConfirming(false)}
      />
    </SafeAreaView>
  );
}
