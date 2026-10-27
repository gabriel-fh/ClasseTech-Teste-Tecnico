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
import { ActivityIndicator, View } from 'react-native';

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
        </SQLiteProvider>
      </QueryClientProvider>
    </Suspense>
  );
}
