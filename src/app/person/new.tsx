import { router, usePreventRemove } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { get, type FieldErrors } from 'react-hook-form';
import { Alert, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { StepProgress } from '@/components/ui/step-progress';
import { showToast } from '@/components/ui/toast';
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
  emptyPersonFormValues,
  INDIVIDUAL_DETAIL_FIELDS,
  REPRESENTATIVE_FIELDS,
  toPersonInput,
  type PersonFormValues,
} from '@/features/people/schema';
import type { PersonType } from '@/features/people/types';
import { usePersonForm } from '@/features/people/use-person-form';

type StepId = 'type' | 'details' | 'address' | 'representative' | 'review';

// Folga entre o campo com foco e o topo do teclado.
const FOCUS_GAP = 24;

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
  const [hasContent, setHasContent] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [exitRequest, setExitRequest] = useState<(() => void) | null>(null);
  const [typeSwitch, setTypeSwitch] = useState<PersonType | null>(null);

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
      const draft: PersonDraft = { values: values as PersonFormValues, step: index, savedAt: '' };

      writeDraft(draft.values, index);
      setHasContent(draftHasContent(draft));
    });

    return () => subscription.unsubscribe();
  }, [form, index, ready]);

  // A seta do header e o botão físico do Android saem da tela sem passar pelo `goBack` daqui.
  const allowExit = usePreventRemove(hasContent && !leaving, ({ repeat }) => {
    setExitRequest(() => repeat);
  });

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
      setHasContent(true);
    }

    setPendingDraft(null);
    setReady(true);
  }

  function discardDraft() {
    clearDraft();
    setPendingDraft(null);
    setReady(true);
  }

  function confirmExit() {
    const repeat = exitRequest;

    setLeaving(true);
    setExitRequest(null);
    repeat?.();
  }

  // Na revisão os erros caem em campos de etapas anteriores, que a tela não mostra: sem isto o
  // botão "Salvar cadastro" não daria sinal nenhum.
  function reportInvalid(errors: FieldErrors<PersonFormValues>) {
    const target = steps.findIndex((id) =>
      fieldsOf(id, type).some((field) => get(errors, field) !== undefined),
    );

    if (target >= 0) {
      setIndex(target);
    }

    showToast('Revise os campos marcados em vermelho.');
  }

  // Cada tipo pede campos diferentes, então trocar o tipo é começar outro cadastro. Sem o reset,
  // contato e endereço do tipo anterior ficavam no formulário.
  function applyType(next: PersonType) {
    form.reset(emptyPersonFormValues(next));
    setIndex(0);
    setTypeChosen(true);
    setHasContent(false);
    setTypeSwitch(null);
  }

  function chooseType(next: PersonType) {
    if (typeChosen && next === type) {
      return;
    }

    if (typeChosen && hasContent) {
      setTypeSwitch(next);

      return;
    }

    applyType(next);
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

      const personId = await createPerson(db, input);

      clearDraft();
      setLeaving(true);
      allowExit();
      showToast('Cadastro salvo. Agora anexe os documentos.');
      router.replace(`/person/documents/${personId}?novo=1`);
    } catch (error) {
      Alert.alert('Não foi possível salvar', String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-paper-50" edges={['bottom']}>
      {/* O `KeyboardAvoidingView` do React Native não faz nada no Android em edge-to-edge, que é o
          padrão do SDK 58. Este ScrollView rola até o campo com foco e reserva embaixo a altura do
          teclado, então dá para rolar o que fica atrás dele. A barra de botões não se mexe. */}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={FOCUS_GAP}
      >
        <View className="gap-6 p-4 pb-8">
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
        </View>
      </KeyboardAwareScrollView>

      <View className="flex-row gap-3 border-t border-paper-200 bg-paper-50 p-4">
        <View className="flex-1">
          <Button label="Voltar" variant="secondary" onPress={goBack} disabled={saving} />
        </View>
        <View className="flex-[2]">
          {isReview ? (
            <Button
              label="Salvar cadastro"
              loading={saving}
              onPress={() => void form.handleSubmit(save, reportInvalid)()}
              accessibilityHint="Grava o cadastro no aparelho"
            />
          ) : (
            <Button label="Continuar" disabled={step === 'type' && !typeChosen} onPress={goNext} />
          )}
        </View>
      </View>

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

      <ConfirmDialog
        visible={typeSwitch !== null}
        title={typeSwitch === 'PF' ? 'Trocar para pessoa física?' : 'Trocar para pessoa jurídica?'}
        message="Os dois tipos pedem campos diferentes, então o que você preencheu até aqui será descartado."
        confirmLabel="Trocar"
        cancelLabel="Manter como está"
        destructive
        onConfirm={() => typeSwitch && applyType(typeSwitch)}
        onCancel={() => setTypeSwitch(null)}
      />

      <ConfirmDialog
        visible={exitRequest !== null}
        title="Sair do cadastro?"
        message="O que você preencheu fica guardado como rascunho e volta quando você abrir um novo cadastro."
        confirmLabel="Sair"
        cancelLabel="Continuar preenchendo"
        onConfirm={confirmExit}
        onCancel={() => setExitRequest(null)}
      />
    </SafeAreaView>
  );
}
