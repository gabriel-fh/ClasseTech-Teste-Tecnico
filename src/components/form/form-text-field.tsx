import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { TextField, type TextFieldProps } from '@/components/ui/text-field';

interface FormTextFieldProps<T extends FieldValues> extends Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> {
  control: Control<T>;
  name: FieldPath<T>;
  mask?: (value: string) => string;
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  mask,
  ...props
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          value={typeof field.value === 'string' ? field.value : ''}
          onChangeText={(text) => field.onChange(mask ? mask(text) : text)}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          {...props}
        />
      )}
    />
  );
}
