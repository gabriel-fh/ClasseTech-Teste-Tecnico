import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
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

  // Cada combinação de busca e filtro é uma chave própria no cache, e o `staleTime` padrão do app
  // é infinito. Sem isto, ligar um filtro mostrava a lista de quando aquele filtro foi usado pela
  // última vez. Ler de novo o SQLite local não custa nada.
  const query = useQuery({
    queryKey: ['people', search, type, onlyPending],
    queryFn: () => listPeople(db, filters),
    staleTime: 0,
  });

  const { refetch } = query;

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
    <SafeAreaView className="flex-1 bg-paper-50" edges={['bottom']}>
      <View className="gap-3 border-b border-paper-200 px-4 pb-4 pt-1">
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
          <ActivityIndicator color="#163a5c" />
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
              <Text className="pt-3 text-center font-body-medium text-[11px] uppercase tracking-[1.4px] text-ink-300">
                {people.length} {people.length === 1 ? 'cadastro' : 'cadastros'}
              </Text>
            ) : undefined
          }
        />
      )}

      <View className="absolute inset-x-0 bottom-0 gap-2 border-t border-paper-200 bg-paper-50 p-4">
        <Button label="Novo cadastro" onPress={() => router.push('/person/new')} />
        <Text className="text-center font-body text-[11px] text-ink-300">
          v{Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
