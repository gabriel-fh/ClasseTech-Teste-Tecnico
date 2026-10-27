import '@/global.css';

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { ToastHost } from '@/components/ui/toast';
import { DATABASE_NAME, migrateDatabase } from '@/lib/db';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-paper-50">
      <ActivityIndicator color="#163a5c" />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase} useSuspense>
          <KeyboardProvider>
            <Stack
              screenOptions={{
                headerShadowVisible: false,
                headerStyle: { backgroundColor: '#fcfbf8' },
                headerTintColor: '#163a5c',
                headerTitleStyle: { fontFamily: 'Montserrat_600SemiBold', fontSize: 18 },
                contentStyle: { backgroundColor: '#fcfbf8' },
              }}
            >
              <Stack.Screen name="index" options={{ title: 'Cadastros' }} />
              <Stack.Screen name="person/new" options={{ title: 'Novo cadastro' }} />
              <Stack.Screen name="person/[id]" options={{ title: 'Ficha' }} />
              <Stack.Screen name="person/edit/[id]" options={{ title: 'Editar cadastro' }} />
              <Stack.Screen name="person/documents/[id]" options={{ title: 'Documentos' }} />
            </Stack>
          </KeyboardProvider>
          <ToastHost />
        </SQLiteProvider>
      </QueryClientProvider>
    </Suspense>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-paper-50 p-8">
      <Text className="text-center font-display text-xl text-ink-900">Algo deu errado</Text>
      <Text className="text-center font-body text-sm leading-5 text-ink-400">
        {error.message || 'O app encontrou um erro inesperado.'}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void retry()}
        className="h-12 items-center justify-center rounded-field bg-accent-700 px-5 active:bg-accent-800"
      >
        <Text className="font-body-semibold text-[15px] text-paper-50">Tentar de novo</Text>
      </Pressable>
    </View>
  );
}
