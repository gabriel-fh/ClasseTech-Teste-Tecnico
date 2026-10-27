import type { ComponentRef, Ref } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

export interface TextFieldProps extends Omit<TextInputProps, 'className' | 'style'> {
  label: string;
  error?: string;
  hint?: string;
  // Por onde o react-hook-form leva o foco ao primeiro campo inválido.
  ref?: Ref<ComponentRef<typeof TextInput>>;
}

export function TextField({ label, error, hint, ref, ...props }: TextFieldProps) {
  const invalid = Boolean(error);

  return (
    <View className="gap-1.5">
      <Text className="font-body-medium text-xs uppercase tracking-[1.2px] text-ink-500">
        {label}
      </Text>

      <TextInput
        ref={ref}
        accessibilityLabel={label}
        placeholderTextColor="#b2a998"
        className={`h-12 rounded-field border bg-paper-50 px-3.5 font-body text-base text-ink-900 ${
          invalid ? 'border-brick-700' : 'border-paper-300'
        }`}
        {...props}
      />

      {invalid ? (
        <Text accessibilityLiveRegion="polite" className="font-body text-sm text-brick-700">
          {error}
        </Text>
      ) : hint ? (
        <Text className="font-body text-sm text-ink-400">{hint}</Text>
      ) : null}
    </View>
  );
}
