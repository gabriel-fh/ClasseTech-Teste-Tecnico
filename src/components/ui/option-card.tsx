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
      className={`flex-row items-center gap-4 rounded-2xl border-2 p-4 active:bg-neutral-50 ${
        selected ? 'border-primary-600 bg-primary-50' : 'border-neutral-200 bg-white'
      }`}
    >
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary-600' : 'border-neutral-300'
        }`}
      >
        {selected ? <View className="h-3 w-3 rounded-full bg-primary-600" /> : null}
      </View>

      <View className="flex-1 gap-1">
        <Text className="text-base font-semibold text-neutral-900">{title}</Text>
        <Text className="text-sm text-neutral-500">{description}</Text>
      </View>
    </Pressable>
  );
}
