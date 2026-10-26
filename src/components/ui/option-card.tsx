import { Pressable, Text, View } from 'react-native';

interface OptionCardProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ title, description, selected, onPress }: OptionCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`flex-row items-center gap-4 rounded-card border p-4 ${
        selected ? 'border-accent-700 bg-accent-50' : 'border-paper-300 bg-paper-50'
      }`}
    >
      <View
        className={`h-5 w-5 items-center justify-center rounded-full border ${
          selected ? 'border-accent-700' : 'border-ink-300'
        }`}
      >
        {selected ? <View className="h-2.5 w-2.5 rounded-full bg-accent-700" /> : null}
      </View>

      <View className="flex-1 gap-1">
        <Text className="font-display-medium text-base text-ink-900">{title}</Text>
        <Text className="font-body text-sm text-ink-400">{description}</Text>
      </View>
    </Pressable>
  );
}
