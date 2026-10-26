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
      <Text className="text-sm font-medium text-neutral-700">{label}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        className={`h-12 flex-row items-center justify-between rounded-xl border bg-white px-4 active:bg-neutral-50 ${
          error ? 'border-red-500' : 'border-neutral-300'
        }`}
      >
        <Text className={`text-base ${selected ? 'text-neutral-900' : 'text-neutral-400'}`}>
          {selected?.label ?? placeholder}
        </Text>
        <Text className="text-xs text-neutral-500">▼</Text>
      </Pressable>

      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={close}>
          <Pressable className="max-h-[60%] rounded-t-3xl bg-white pb-6 pt-2">
            <View className="items-center py-2">
              <View className="h-1 w-10 rounded-full bg-neutral-300" />
            </View>

            <Text className="px-5 pb-2 text-base font-semibold text-neutral-900">{label}</Text>

            <FlatList
              data={options}
              keyExtractor={(option) => option.value}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(item.value);
                    close();
                  }}
                  className="flex-row items-center justify-between px-5 py-4 active:bg-neutral-100"
                >
                  <Text className="text-base text-neutral-900">{item.label}</Text>
                  {item.value === value ? (
                    <Text className="text-base font-bold text-primary-600">✓</Text>
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
