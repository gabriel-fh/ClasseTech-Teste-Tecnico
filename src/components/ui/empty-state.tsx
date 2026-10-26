import { Text, View } from 'react-native';

import { Button } from './button';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 px-6 py-16">
      <Text className="text-center text-lg font-bold text-neutral-900">{title}</Text>
      <Text className="text-center text-sm text-neutral-500">{message}</Text>

      {actionLabel && onAction ? (
        <View className="pt-2">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
