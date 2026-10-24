import '@/global.css';

import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { DATABASE_NAME, migrateDatabase } from '@/lib/db';

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-neutral-950">
      <ActivityIndicator />
    </View>
  );
}

export default function RootLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDatabase} useSuspense>
        <Stack />
      </SQLiteProvider>
    </Suspense>
  );
}
