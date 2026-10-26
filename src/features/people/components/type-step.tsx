import { Text, View } from 'react-native';

import { OptionCard } from '@/components/ui/option-card';

import type { PersonType } from '../types';

interface TypeStepProps {
  value: PersonType | null;
  onChange: (type: PersonType) => void;
}

export function TypeStep({ value, onChange }: TypeStepProps) {
  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="font-display text-xl text-ink-900">Quem você vai cadastrar?</Text>
        <Text className="font-body text-sm leading-5 text-ink-400">
          O tipo define quais dados e documentos serão pedidos nas próximas etapas.
        </Text>
      </View>

      <View className="gap-3">
        <OptionCard
          title="Pessoa física"
          description="Locador, locatário ou fiador com CPF"
          selected={value === 'PF'}
          onPress={() => onChange('PF')}
        />
        <OptionCard
          title="Pessoa jurídica"
          description="Empresa com CNPJ e representante legal"
          selected={value === 'PJ'}
          onPress={() => onChange('PJ')}
        />
      </View>
    </View>
  );
}
