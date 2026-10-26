import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-accent-700 active:bg-accent-800',
  secondary: 'border border-paper-300 bg-paper-50 active:bg-paper-100',
  ghost: 'active:bg-paper-100',
  danger: 'bg-brick-700 active:bg-brick-700/90',
};

const LABEL: Record<ButtonVariant, string> = {
  primary: 'text-paper-50',
  secondary: 'text-ink-900',
  ghost: 'text-accent-700',
  danger: 'text-paper-50',
};

const SPINNER: Record<ButtonVariant, string> = {
  primary: '#fcfbf8',
  secondary: '#171310',
  ghost: '#163a5c',
  danger: '#fcfbf8',
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
      className={`h-12 flex-row items-center justify-center gap-2 rounded-field px-5 ${CONTAINER[variant]} ${
        blocked ? 'opacity-40' : ''
      }`}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color={SPINNER[variant]} /> : null}
      <Text className={`font-body-semibold text-[15px] tracking-wide ${LABEL[variant]}`}>
        {label}
      </Text>
    </Pressable>
  );
}
