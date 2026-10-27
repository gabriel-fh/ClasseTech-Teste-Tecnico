import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { showToast } from '@/components/ui/toast';
import { CompanyDetailsStep } from '@/features/people/components/company-details-step';
import { ContactAddressStep } from '@/features/people/components/contact-address-step';
import { IndividualDetailsStep } from '@/features/people/components/individual-details-step';
import { RepresentativeStep } from '@/features/people/components/representative-step';
import { getPerson, isDocumentTaken, updatePerson } from '@/features/people/repository';
import { toPersonFormValues, toPersonInput, type PersonFormValues } from '@/features/people/schema';
import type { Person } from '@/features/people/types';
import { usePersonForm } from '@/features/people/use-person-form';

// Altura da barra de botões. O scroll do campo com foco precisa parar acima dela, e a barra
// sobe junto com o teclado levando a área segura do gesto.
const FOOTER_HEIGHT = 80;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-4">
      <Text className="font-body-semibold text-[11px] uppercase tracking-[1.4px] text-ink-400">
        {title}
      </Text>
      {children}
    </View>
  );
}

function EditForm({ id, person }: { id: string; person: Person }) {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const form = usePersonForm(toPersonFormValues(person));
  const [saving, setSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);

  function reportInvalid() {
    showToast('Revise os campos marcados em vermelho.');
  }

  async function save(values: PersonFormValues) {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const input = toPersonInput(values);
      const document = input.type === 'PF' ? input.cpf : input.cnpj;

      if (await isDocumentTaken(db, document, input.type, id)) {
        const field = input.type === 'PF' ? 'cpf' : 'cnpj';

        form.setError(field, { message: `Já existe um cadastro com este ${field.toUpperCase()}` });
        form.setFocus(field);

        return;
      }

      await updatePerson(db, id, input);
      showToast('Alterações salvas.');
      router.back();
    } catch (error) {
      Alert.alert('Não foi possível salvar', String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bottomOffset={FOOTER_HEIGHT + insets.bottom}
      >
        <View className="gap-7 p-4 pb-8">
          <Section title={person.type === 'PF' ? 'Dados pessoais' : 'Dados da empresa'}>
            {person.type === 'PF' ? (
              <IndividualDetailsStep control={form.control} />
            ) : (
              <CompanyDetailsStep form={form} editing />
            )}
          </Section>

          <Section title="Contato e endereço">
            <ContactAddressStep form={form} editing />
          </Section>

          {person.type === 'PJ' ? (
            <Section title="Representante legal">
              <RepresentativeStep control={form.control} />
            </Section>
          ) : null}
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView>
        <View className="flex-row gap-3 border-t border-paper-200 bg-paper-50 p-4">
          <View className="flex-1">
            <Button
              label="Cancelar"
              variant="secondary"
              onPress={() => (form.formState.isDirty ? setLeaving(true) : router.back())}
              disabled={saving}
            />
          </View>
          <View className="flex-[2]">
            <Button
              label="Salvar alterações"
              loading={saving}
              onPress={() => void form.handleSubmit(save, reportInvalid)()}
            />
          </View>
        </View>
      </KeyboardStickyView>

      <ConfirmDialog
        visible={leaving}
        title="Descartar as alterações?"
        message="O que você mudou nesta ficha não foi salvo."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        destructive
        onConfirm={() => {
          setLeaving(false);
          router.back();
        }}
        onCancel={() => setLeaving(false)}
      />
    </>
  );
}

export default function EditPersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();

  // `gcTime: 0` joga fora o cache ao sair da tela. Sem isso, salvar e entrar de novo na edição
  // mostrava o valor antigo, porque o cache do React Query não sabe da gravação no SQLite.
  const query = useQuery({
    queryKey: ['person-form', id],
    queryFn: () => getPerson(db, id),
    staleTime: 0,
    gcTime: 0,
  });

  if (query.isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-paper-50">
        <ActivityIndicator color="#163a5c" />
      </View>
    );
  }

  if (!query.data) {
    return (
      <SafeAreaView className="flex-1 bg-paper-50" edges={['bottom']}>
        <EmptyState
          title="Cadastro não encontrado"
          message="Ele pode ter sido excluído neste aparelho."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-paper-50" edges={['bottom']}>
      <EditForm id={id} person={query.data} />
    </SafeAreaView>
  );
}
