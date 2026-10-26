import { Pressable, Text } from 'react-native';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-full border px-3.5 py-1.5 ${
        selected ? 'border-accent-700 bg-accent-700' : 'border-paper-300 bg-paper-50'
      }`}
    >
      <Text
        className={`font-body-medium text-[13px] ${selected ? 'text-paper-50' : 'text-ink-500'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
