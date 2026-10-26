import { Modal, Text, View } from 'react-native';

import { Button } from './button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-ink-900/50 p-6">
        <View className="w-full gap-4 rounded-card border border-paper-300 bg-paper-50 p-5">
          <Text className="font-display text-lg text-ink-900">{title}</Text>
          <Text className="font-body text-[15px] leading-5 text-ink-500">{message}</Text>

          <View className="gap-2 pt-1">
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
            />
            <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
