import { Text, View } from 'react-native';

interface StepProgressProps {
  current: number;
  total: number;
  label: string;
}

export function StepProgress({ current, total, label }: StepProgressProps) {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-baseline justify-between">
        <Text className="font-display-medium text-base text-ink-900">{label}</Text>
        <Text className="font-body-medium text-[11px] uppercase tracking-[1px] text-ink-400">
          {current} de {total}
        </Text>
      </View>

      <View className="flex-row gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            className={`h-0.5 flex-1 ${index < current ? 'bg-accent-700' : 'bg-paper-300'}`}
          />
        ))}
      </View>
    </View>
  );
}
