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
      <View className="flex-1 items-center justify-center bg-black/40 p-6">
        <View className="w-full gap-4 rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-neutral-900">{title}</Text>
          <Text className="text-base text-neutral-600">{message}</Text>

          <View className="gap-2">
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
