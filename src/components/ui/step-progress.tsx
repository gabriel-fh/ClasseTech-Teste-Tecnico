import { Text, View } from 'react-native';

interface StepProgressProps {
  current: number;
  total: number;
  label: string;
}

export function StepProgress({ current, total, label }: StepProgressProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-sm font-semibold text-neutral-900">{label}</Text>
        <Text className="text-xs text-neutral-500">
          Etapa {current} de {total}
        </Text>
      </View>

      <View className="h-2 flex-row gap-1">
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            className={`h-2 flex-1 rounded-full ${
              index < current ? 'bg-primary-600' : 'bg-neutral-200'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
