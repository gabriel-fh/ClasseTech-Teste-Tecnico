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
      className={`rounded-full border px-3.5 py-2 ${
        selected ? 'border-primary-600 bg-primary-50' : 'border-neutral-300 bg-white'
      }`}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-primary-700' : 'text-neutral-600'}`}>
        {label}
      </Text>
    </Pressable>
  );
}
