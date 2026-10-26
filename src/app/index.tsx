import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { TextField } from '@/components/ui/text-field';
import { PersonCard } from '@/features/people/components/person-card';
import { listPeople, type PersonFilters } from '@/features/people/repository';
import type { PersonType } from '@/features/people/types';

export default function HomeScreen() {
  const db = useSQLiteContext();

  const [search, setSearch] = useState('');
  const [type, setType] = useState<PersonType | null>(null);
  const [onlyPending, setOnlyPending] = useState(false);

  const filters: PersonFilters = { search, type, onlyPending };

  const query = useQuery({
    queryKey: ['people', search, type, onlyPending],
    queryFn: () => listPeople(db, filters),
  });

  const { refetch } = query;

  // A lista é relida ao voltar do wizard, do detalhe e da edição.
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const people = query.data ?? [];
  const filtering = search.trim().length > 0 || type !== null || onlyPending;

  function toggleType(next: PersonType) {
    setType((current) => (current === next ? null : next));
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <View className="gap-3 border-b border-neutral-200 px-4 pb-3 pt-2">
        <TextField
          label="Buscar"
          value={search}
          onChangeText={setSearch}
          placeholder="Nome, razão social, CPF ou CNPJ"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View className="flex-row flex-wrap gap-2">
          <Chip label="Pessoa física" selected={type === 'PF'} onPress={() => toggleType('PF')} />
          <Chip label="Pessoa jurídica" selected={type === 'PJ'} onPress={() => toggleType('PJ')} />
          <Chip
            label="Documentação pendente"
            selected={onlyPending}
            onPress={() => setOnlyPending((current) => !current)}
          />
        </View>
      </View>

      {query.isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : query.isError ? (
        <EmptyState
          title="Não foi possível carregar"
          message="Houve um erro ao ler os cadastros no aparelho."
          actionLabel="Tentar de novo"
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={people}
          keyExtractor={(person) => person.id}
          contentContainerClassName="gap-3 p-4 pb-28"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <PersonCard
              person={item}
              onPress={() => router.push({ pathname: '/person/[id]', params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            filtering ? (
              <EmptyState
                title="Nenhum resultado"
                message="Nenhum cadastro bate com a busca e os filtros escolhidos."
              />
            ) : (
              <EmptyState
                title="Nenhum cadastro ainda"
                message="Cadastre locadores, locatários e fiadores, pessoa física ou jurídica."
                actionLabel="Criar o primeiro"
                onAction={() => router.push('/person/new')}
              />
            )
          }
          ListFooterComponent={
            people.length > 0 ? (
              <Text className="pt-2 text-center text-xs text-neutral-400">
                {people.length} {people.length === 1 ? 'cadastro' : 'cadastros'}
              </Text>
            ) : undefined
          }
        />
      )}

      <View className="absolute inset-x-0 bottom-0 border-t border-neutral-200 bg-white p-4">
        <Button label="Novo cadastro" onPress={() => router.push('/person/new')} />
      </View>
    </SafeAreaView>
  );
}
