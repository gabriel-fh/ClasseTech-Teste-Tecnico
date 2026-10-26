import '@/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { DATABASE_NAME, migrateDatabase } from '@/lib/db';

// CEP e CNPJ não mudam, então ficam em cache pela sessão inteira e não são refeitos sozinhos.
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
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase} useSuspense>
          <Stack screenOptions={{ headerTitleStyle: { fontSize: 17 } }}>
            <Stack.Screen name="index" options={{ title: 'Cadastros' }} />
            <Stack.Screen name="person/new" options={{ title: 'Novo cadastro' }} />
            <Stack.Screen name="person/[id]" options={{ title: 'Cadastro' }} />
          </Stack>
        </SQLiteProvider>
      </QueryClientProvider>
    </Suspense>
  );
}
