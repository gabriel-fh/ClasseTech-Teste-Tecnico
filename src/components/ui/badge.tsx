import { Text, View } from 'react-native';

export type BadgeTone = 'success' | 'warning' | 'neutral';

const CONTAINER: Record<BadgeTone, string> = {
  success: 'bg-moss-100',
  warning: 'bg-ochre-100',
  neutral: 'bg-paper-200',
};

const LABEL: Record<BadgeTone, string> = {
  success: 'text-moss-700',
  warning: 'text-ochre-700',
  neutral: 'text-ink-500',
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${CONTAINER[tone]}`}>
      <Text className={`font-body-medium text-[11px] uppercase tracking-[0.8px] ${LABEL[tone]}`}>
        {label}
      </Text>
    </View>
  );
}
