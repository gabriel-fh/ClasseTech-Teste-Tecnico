import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { obfuscateCnpj, obfuscateCpf } from '@/lib/masks';

import type { PersonSummary } from '../repository';
import { PERSON_TYPE_LABELS } from '../types';

interface PersonCardProps {
  person: PersonSummary;
  onPress: () => void;
}

export function PersonCard({ person, onPress }: PersonCardProps) {
  const document =
    person.type === 'PJ' ? obfuscateCnpj(person.document) : obfuscateCpf(person.document);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="gap-2 rounded-2xl border border-neutral-200 bg-white p-4 active:bg-neutral-50"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-base font-semibold text-neutral-900" numberOfLines={2}>
          {person.name}
        </Text>
        <Badge label={PERSON_TYPE_LABELS[person.type]} />
      </View>

      <Text className="text-sm text-neutral-600">{document}</Text>

      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-sm text-neutral-500" numberOfLines={1}>
          {person.city} - {person.uf}
        </Text>
        <Badge label={person.status.label} tone={person.status.complete ? 'success' : 'warning'} />
      </View>
    </Pressable>
  );
}
