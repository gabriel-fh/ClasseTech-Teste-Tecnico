import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <View className="flex-1 items-center justify-center gap-3 p-6">
        <Text className="text-center text-xl font-bold text-neutral-900">
          Nenhum cadastro ainda
        </Text>
        <Text className="text-center text-sm text-neutral-500">
          Cadastre locadores, locatários e fiadores, pessoa física ou jurídica.
        </Text>
      </View>

      <View className="border-t border-neutral-200 p-4">
        <Button label="Novo cadastro" onPress={() => router.push('/person/new')} />
      </View>
    </SafeAreaView>
  );
}
