import { View } from 'react-native';

import { FormSelectField } from '@/components/form/form-select-field';
import { FormTextField } from '@/components/form/form-text-field';
import { maskCep, maskPhone } from '@/lib/masks';
import { UFS, type Uf } from '@/lib/validators';

import type { PersonFormValues } from '../schema';
import type { PersonFormApi } from '../use-person-form';

const UF_OPTIONS = UFS.map((value) => ({ value, label: value }));

export function ContactAddressStep({ control }: { control: PersonFormApi['control'] }) {
  return (
    <View className="gap-4">
      <FormTextField<PersonFormValues>
        control={control}
        name="email"
        label="E-mail"
        placeholder="contato@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="phone"
        label="Telefone"
        placeholder="(00) 00000-0000"
        keyboardType="phone-pad"
        maxLength={15}
        mask={maskPhone}
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="cep"
        label="CEP"
        placeholder="00000-000"
        keyboardType="number-pad"
        maxLength={9}
        mask={maskCep}
      />

      <FormTextField<PersonFormValues>
        control={control}
        name="street"
        label="Logradouro"
        placeholder="Rua São João"
        autoCapitalize="words"
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FormTextField<PersonFormValues>
            control={control}
            name="number"
            label="Número"
            placeholder="120"
            keyboardType="number-pad"
          />
        </View>
        <View className="flex-[2]">
          <FormTextField<PersonFormValues>
            control={control}
            name="complement"
            label="Complemento"
            placeholder="Apto 302"
            hint="Opcional"
          />
        </View>
      </View>

      <FormTextField<PersonFormValues>
        control={control}
        name="district"
        label="Bairro"
        placeholder="Icaraí"
        autoCapitalize="words"
      />

      <View className="flex-row gap-3">
        <View className="flex-[2]">
          <FormTextField<PersonFormValues>
            control={control}
            name="city"
            label="Cidade"
            placeholder="Niterói"
            autoCapitalize="words"
          />
        </View>
        <View className="flex-1">
          <FormSelectField<PersonFormValues, Uf>
            control={control}
            name="uf"
            label="UF"
            options={UF_OPTIONS}
            placeholder="UF"
          />
        </View>
      </View>
    </View>
  );
}
