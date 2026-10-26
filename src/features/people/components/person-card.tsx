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
      className="gap-3 rounded-card border border-paper-300 bg-paper-50 p-4 active:bg-paper-100"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 font-display text-[17px] leading-6 text-ink-900" numberOfLines={2}>
          {person.name}
        </Text>
        <Badge label={PERSON_TYPE_LABELS[person.type]} />
      </View>

      <Text className="font-body-medium text-[15px] tracking-wide text-ink-700">{document}</Text>

      <View className="h-px bg-paper-200" />

      <View className="flex-row items-center justify-between gap-3">
        <Text className="flex-1 font-body text-sm text-ink-400" numberOfLines={1}>
          {person.city} / {person.uf}
        </Text>
        <Badge label={person.status.label} tone={person.status.complete ? 'success' : 'warning'} />
      </View>
    </Pressable>
  );
}
