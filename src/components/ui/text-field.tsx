import { Text, TextInput, View, type TextInputProps } from 'react-native';

export interface TextFieldProps extends Omit<TextInputProps, 'className' | 'style'> {
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ label, error, hint, ...props }: TextFieldProps) {
  const invalid = Boolean(error);

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-neutral-700">{label}</Text>

      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#a3a3a3"
        className={`h-12 rounded-xl border bg-white px-4 text-base text-neutral-900 ${
          invalid ? 'border-red-500' : 'border-neutral-300'
        }`}
        {...props}
      />

      {invalid ? (
        <Text className="text-sm text-red-600">{error}</Text>
      ) : hint ? (
        <Text className="text-sm text-neutral-500">{hint}</Text>
      ) : null}
    </View>
  );
}
