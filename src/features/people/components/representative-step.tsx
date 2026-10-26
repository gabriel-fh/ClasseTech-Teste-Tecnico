import { Text, View } from 'react-native';

import { FormTextField } from '@/components/form/form-text-field';
import { maskCpf, maskPhone } from '@/lib/masks';

import type { PersonFormValues } from '../schema';
import type { PersonFormApi } from '../use-person-form';

export function RepresentativeStep({ control }: { control: PersonFormApi['control'] }) {
  return (
    <View className="gap-4">
      <Text className="text-sm text-neutral-500">
        Quem assina pela empresa no contrato de locação.
      </Text>

      <FormTextField<PersonFormValues>
        control={control}
        name="representative.name"
        label="Nome completo"
        placeholder="João Lima"
        autoCapitalize="words"
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="representative.cpf"
        label="CPF"
        placeholder="000.000.000-00"
        keyboardType="number-pad"
        maxLength={14}
        mask={maskCpf}
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="representative.role"
        label="Cargo"
        placeholder="Sócio administrador"
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="representative.email"
        label="E-mail"
        placeholder="joao@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="representative.phone"
        label="Telefone"
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
        maxLength={15}
        mask={maskPhone}
      />
    </View>
  );
}
