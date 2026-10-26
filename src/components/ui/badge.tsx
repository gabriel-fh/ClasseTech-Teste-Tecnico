import { Text, View } from 'react-native';

export type BadgeTone = 'success' | 'warning' | 'neutral';

const CONTAINER: Record<BadgeTone, string> = {
  success: 'bg-emerald-100',
  warning: 'bg-amber-100',
  neutral: 'bg-neutral-100',
};

const LABEL: Record<BadgeTone, string> = {
  success: 'text-emerald-700',
  warning: 'text-amber-700',
  neutral: 'text-neutral-600',
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${CONTAINER[tone]}`}>
      <Text className={`text-xs font-semibold ${LABEL[tone]}`}>{label}</Text>
    </View>
  );
}
