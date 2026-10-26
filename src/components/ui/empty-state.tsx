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
    <View className="items-center gap-3 px-8 py-20">
      <View className="h-px w-10 bg-paper-300" />
      <Text className="text-center font-display text-xl text-ink-900">{title}</Text>
      <Text className="text-center font-body text-sm leading-5 text-ink-400">{message}</Text>

      {actionLabel && onAction ? (
        <View className="pt-3">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
