import { useEffect, useState } from 'react';
import { Animated, Text, View } from 'react-native';

type Listener = (message: string) => void;

let listener: Listener | null = null;

export function showToast(message: string): void {
  listener?.(message);
}

export function ToastHost() {
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    listener = setMessage;

    return () => {
      listener = null;
    };
  }, []);

  useEffect(() => {
    if (!message) {
      return;
    }

    Animated.timing(opacity, { toValue: 1, duration: 140, useNativeDriver: true }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        setMessage(null),
      );
    }, 2200);

    return () => clearTimeout(timer);
  }, [message, opacity]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={{ opacity }}
      className="absolute inset-x-4 bottom-24 items-center"
    >
      <View className="rounded-field bg-ink-900 px-4 py-3">
        <Text className="font-body-medium text-sm text-paper-50">{message}</Text>
      </View>
    </Animated.View>
  );
}
