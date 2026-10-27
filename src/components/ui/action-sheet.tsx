import { Modal, Pressable, Text, View } from 'react-native';

export interface ActionSheetOption {
  label: string;
  description?: string;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  title: string;
  options: ActionSheetOption[];
  onClose: () => void;
}

export function ActionSheet({ visible, title, options, onClose }: ActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-ink-900/50" onPress={onClose}>
        <Pressable className="rounded-t-card border-t border-paper-300 bg-paper-50 pb-7 pt-2">
          <View className="items-center py-2">
            <View className="h-1 w-9 rounded-full bg-paper-300" />
          </View>

          <Text className="px-5 pb-1 font-display-medium text-base text-ink-900">{title}</Text>

          {options.map((option) => (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                option.onPress();
              }}
              className="gap-0.5 border-t border-paper-200 px-5 py-4 active:bg-paper-100"
            >
              <Text className="font-body-medium text-base text-ink-900">{option.label}</Text>
              {option.description ? (
                <Text className="font-body text-sm text-ink-400">{option.description}</Text>
              ) : null}
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
