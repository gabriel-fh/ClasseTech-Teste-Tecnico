import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StepProgress } from '@/components/ui/step-progress';
import { CompanyDetailsStep } from '@/features/people/components/company-details-step';
import { ContactAddressStep } from '@/features/people/components/contact-address-step';
import { IndividualDetailsStep } from '@/features/people/components/individual-details-step';
import { RepresentativeStep } from '@/features/people/components/representative-step';
import { ReviewStep } from '@/features/people/components/review-step';
import { TypeStep } from '@/features/people/components/type-step';
import {
  clearDraft,
  describeDraft,
  draftHasContent,
  readDraft,
  writeDraft,
  type PersonDraft,
} from '@/features/people/draft';
import { createPerson, isDocumentTaken } from '@/features/people/repository';
import {
  COMPANY_DETAIL_FIELDS,
  CONTACT_ADDRESS_FIELDS,
  INDIVIDUAL_DETAIL_FIELDS,
  REPRESENTATIVE_FIELDS,
  toPersonInput,
  type PersonFormValues,
} from '@/features/people/schema';
import type { PersonType } from '@/features/people/types';
import { usePersonForm } from '@/features/people/use-person-form';

type StepId = 'type' | 'details' | 'address' | 'representative' | 'review';

const STEPS: Record<PersonType, StepId[]> = {
  PF: ['type', 'details', 'address', 'review'],
  PJ: ['type', 'details', 'address', 'representative', 'review'],
};

const TITLES: Record<StepId, string> = {
  type: 'Tipo de cadastro',
  details: 'Dados principais',
  address: 'Contato e endereço',
  representative: 'Representante legal',
  review: 'Revisão',
};

function fieldsOf(step: StepId, type: PersonType): readonly string[] {
  switch (step) {
    case 'details':
      return type === 'PF' ? INDIVIDUAL_DETAIL_FIELDS : COMPANY_DETAIL_FIELDS;
    case 'address':
      return CONTACT_ADDRESS_FIELDS;
    case 'representative':
      return REPRESENTATIVE_FIELDS;
    default:
      return [];
  }
}

export default function NewPersonScreen() {
  const db = useSQLiteContext();
  const form = usePersonForm();

  const [index, setIndex] = useState(0);
  const [typeChosen, setTypeChosen] = useState(false);
  const [saving, setSaving] = useState(false);

  // `ready` segura a gravação até o usuário responder, para não sobrescrever o rascunho salvo.
  const [savedDraft] = useState<PersonDraft | null>(() => {
    const draft = readDraft();

    if (draft && draftHasContent(draft)) {
      return draft;
    }

    clearDraft();

    return null;
  });
  const [pendingDraft, setPendingDraft] = useState<PersonDraft | null>(savedDraft);
  const [ready, setReady] = useState(savedDraft === null);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const subscription = form.watch((values) => {
      writeDraft(values as PersonFormValues, index);
    });

    return () => subscription.unsubscribe();
  }, [form, index, ready]);

  const type = form.watch('type');
  const steps = STEPS[type];
  const step = steps[index] ?? 'type';
  const isReview = step === 'review';

  function resumeDraft() {
    if (pendingDraft) {
      const draftSteps = STEPS[pendingDraft.values.type];

      form.reset(pendingDraft.values);
      setIndex(Math.min(Math.max(pendingDraft.step, 0), draftSteps.length - 1));
      setTypeChosen(true);
    }

    setPendingDraft(null);
    setReady(true);
  }

  function discardDraft() {
    clearDraft();
    setPendingDraft(null);
    setReady(true);
  }

  function chooseType(next: PersonType) {
    form.setValue('type', next);
    setTypeChosen(true);
  }

  async function goNext() {
    const fields = fieldsOf(step, type);
    const valid =
      fields.length === 0 ||
      (await form.trigger(fields as Parameters<typeof form.trigger>[0], { shouldFocus: true }));

    if (valid) {
      setIndex((current) => Math.min(current + 1, steps.length - 1));
    }
  }

  function goBack() {
    if (index === 0) {
      router.back();

      return;
    }

    setIndex((current) => current - 1);
  }

  async function save(values: PersonFormValues) {
    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const input = toPersonInput(values);
      const document = input.type === 'PF' ? input.cpf : input.cnpj;

      if (await isDocumentTaken(db, document, input.type)) {
        form.setError(input.type === 'PF' ? 'cpf' : 'cnpj', {
          message: `Já existe um cadastro com este ${input.type === 'PF' ? 'CPF' : 'CNPJ'}`,
        });
        setIndex(steps.indexOf('details'));

        return;
      }

      await createPerson(db, input);
      clearDraft();
      router.replace('/');
    } catch (error) {
      Alert.alert('Não foi possível salvar', String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-paper-50" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="gap-6 p-4 pb-8"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <StepProgress current={index + 1} total={steps.length} label={TITLES[step]} />

          {step === 'type' ? (
            <TypeStep value={typeChosen ? type : null} onChange={chooseType} />
          ) : null}

          {step === 'details' && type === 'PF' ? (
            <IndividualDetailsStep control={form.control} />
          ) : null}

          {step === 'details' && type === 'PJ' ? <CompanyDetailsStep form={form} /> : null}

          {step === 'address' ? <ContactAddressStep form={form} /> : null}

          {step === 'representative' ? <RepresentativeStep control={form.control} /> : null}

          {step === 'review' ? <ReviewStep values={form.watch()} /> : null}
        </ScrollView>

        <View className="flex-row gap-3 border-t border-paper-200 bg-paper-50 p-4">
          <View className="flex-1">
            <Button label="Voltar" variant="secondary" onPress={goBack} disabled={saving} />
          </View>
          <View className="flex-[2]">
            {isReview ? (
              <Button
                label="Salvar cadastro"
                loading={saving}
                onPress={() => void form.handleSubmit(save)()}
                accessibilityHint="Grava o cadastro no aparelho"
              />
            ) : (
              <Button
                label="Continuar"
                disabled={step === 'type' && !typeChosen}
                onPress={goNext}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={pendingDraft !== null}
        title="Continuar de onde parou?"
        message={
          pendingDraft
            ? `Você tinha um cadastro de ${describeDraft(pendingDraft.values.type)} em andamento.`
            : ''
        }
        confirmLabel="Continuar"
        cancelLabel="Descartar"
        onConfirm={resumeDraft}
        onCancel={discardDraft}
      />
    </SafeAreaView>
  );
}
