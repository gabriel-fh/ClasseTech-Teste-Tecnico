import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string> {
  label: string;
  value: T | '';
  options: readonly SelectOption<T>[];
  placeholder?: string;
  error?: string;
  onChange: (value: T) => void;
  onClose?: () => void;
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  placeholder = 'Selecione',
  error,
  onChange,
  onClose,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  function close() {
    setOpen(false);
    onClose?.();
  }

  return (
    <View className="gap-1.5">
      <Text className="font-body-medium text-xs uppercase tracking-[1.2px] text-ink-500">
        {label}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        className={`h-12 flex-row items-center justify-between rounded-field border bg-paper-50 px-3.5 active:bg-paper-100 ${
          error ? 'border-brick-700' : 'border-paper-300'
        }`}
      >
        <Text className={`font-body text-base ${selected ? 'text-ink-900' : 'text-ink-300'}`}>
          {selected?.label ?? placeholder}
        </Text>
        <Text className="font-body text-[10px] text-ink-400">▼</Text>
      </Pressable>

      {error ? <Text className="font-body text-sm text-brick-700">{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable className="flex-1 justify-end bg-ink-900/50" onPress={close}>
          <Pressable className="max-h-[60%] rounded-t-card border-t border-paper-300 bg-paper-50 pb-6 pt-2">
            <View className="items-center py-2">
              <View className="h-1 w-9 rounded-full bg-paper-300" />
            </View>

            <Text className="px-5 pb-2 font-display-medium text-base text-ink-900">{label}</Text>

            <FlatList
              data={options}
              keyExtractor={(option) => option.value}
              ItemSeparatorComponent={() => <View className="mx-5 h-px bg-paper-200" />}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(item.value);
                    close();
                  }}
                  className="flex-row items-center justify-between px-5 py-3.5 active:bg-paper-100"
                >
                  <Text className="font-body text-base text-ink-900">{item.label}</Text>
                  {item.value === value ? (
                    <Text className="font-body-semibold text-base text-accent-700">✓</Text>
                  ) : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
