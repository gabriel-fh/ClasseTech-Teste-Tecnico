import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 active:bg-primary-700',
  secondary: 'border border-neutral-300 bg-white active:bg-neutral-100',
  ghost: 'active:bg-neutral-100',
  danger: 'bg-red-600 active:bg-red-700',
};

const LABEL: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-neutral-900',
  ghost: 'text-primary-700',
  danger: 'text-white',
};

const SPINNER: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: '#171717',
  ghost: '#155fc2',
  danger: '#ffffff',
};

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const blocked = disabled === true || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: loading }}
      disabled={blocked}
      className={`h-12 flex-row items-center justify-center gap-2 rounded-xl px-5 ${CONTAINER[variant]} ${
        blocked ? 'opacity-50' : ''
      }`}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color={SPINNER[variant]} /> : null}
      <Text className={`text-base font-semibold ${LABEL[variant]}`}>{label}</Text>
    </Pressable>
  );
}
