import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { OptionCard } from '@/components/ui/option-card';
import { StepProgress } from '@/components/ui/step-progress';
import type { PersonType } from '@/features/people/types';

const TOTAL_STEPS = 5;

export default function NewPersonScreen() {
  const [type, setType] = useState<PersonType | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-6 p-4">
        <StepProgress current={1} total={TOTAL_STEPS} label="Tipo de cadastro" />

        <View className="gap-2">
          <Text className="text-xl font-bold text-neutral-900">Quem você vai cadastrar?</Text>
          <Text className="text-sm text-neutral-500">
            O tipo define quais dados e documentos serão pedidos nas próximas etapas.
          </Text>
        </View>

        <View className="gap-3">
          <OptionCard
            title="Pessoa física"
            description="Locador, locatário ou fiador com CPF"
            selected={type === 'PF'}
            onPress={() => setType('PF')}
          />
          <OptionCard
            title="Pessoa jurídica"
            description="Empresa com CNPJ e representante legal"
            selected={type === 'PJ'}
            onPress={() => setType('PJ')}
          />
        </View>
      </ScrollView>

      <View className="border-t border-neutral-200 bg-white p-4">
        <Button label="Continuar" disabled={type === null} onPress={() => undefined} />
      </View>
    </SafeAreaView>
  );
}
