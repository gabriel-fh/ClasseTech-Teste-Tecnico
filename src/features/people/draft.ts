import { readJson, removeKey, StorageKey, writeJson } from '@/lib/storage';

import { emptyPersonFormValues, type PersonFormValues } from './schema';
import { PERSON_TYPE_LABELS, type PersonType } from './types';

export interface PersonDraft {
  values: PersonFormValues;
  step: number;
  savedAt: string;
}

/**
 * O rascunho fica no MMKV, fora do React, para sobreviver ao app ser fechado no meio do
 * cadastro. Só vale para o cadastro novo: a edição de um cadastro existente não grava rascunho.
 */
export function readDraft(): PersonDraft | null {
  const draft = readJson<PersonDraft>(StorageKey.personDraft);

  if (!draft || typeof draft.step !== 'number' || !draft.values) {
    return null;
  }

  const type = draft.values.type;

  if (type !== 'PF' && type !== 'PJ') {
    return null;
  }

  // Preenche o que faltar, para um rascunho gravado por uma versão anterior não quebrar a tela.
  return {
    step: draft.step,
    savedAt: typeof draft.savedAt === 'string' ? draft.savedAt : '',
    values: { ...emptyPersonFormValues(type), ...draft.values },
  };
}

export function writeDraft(values: PersonFormValues, step: number): void {
  writeJson(StorageKey.personDraft, {
    values,
    step,
    savedAt: new Date().toISOString(),
  } satisfies PersonDraft);
}

export function clearDraft(): void {
  removeKey(StorageKey.personDraft);
}

/** O rascunho só interessa quando tem algo digitado além do tipo e dos padrões. */
export function draftHasContent(draft: PersonDraft): boolean {
  const empty = emptyPersonFormValues(draft.values.type);
  const ignoreType = (values: PersonFormValues) => JSON.stringify({ ...values, type: '' });

  return ignoreType({ ...empty, ...draft.values }) !== ignoreType(empty);
}

export function describeDraft(type: PersonType): string {
  return PERSON_TYPE_LABELS[type].toLowerCase();
}
