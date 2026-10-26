import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { SelectField, type SelectOption } from '@/components/ui/select-field';

interface FormSelectFieldProps<T extends FieldValues, V extends string> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: readonly SelectOption<V>[];
  placeholder?: string;
}

export function FormSelectField<T extends FieldValues, V extends string>({
  control,
  name,
  label,
  options,
  placeholder,
}: FormSelectFieldProps<T, V>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <SelectField
          label={label}
          options={options}
          placeholder={placeholder}
          value={typeof field.value === 'string' ? (field.value as V) : ''}
          onChange={field.onChange}
          onClose={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
