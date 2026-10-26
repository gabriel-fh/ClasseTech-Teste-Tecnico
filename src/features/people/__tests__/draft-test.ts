import { draftHasContent, type PersonDraft } from '../draft';
import { emptyPersonFormValues } from '../schema';
import type { PersonType } from '../types';

function draft(type: PersonType, values: Partial<PersonDraft['values']> = {}): PersonDraft {
  return {
    step: 1,
    savedAt: '2026-10-25T12:00:00.000Z',
    values: { ...emptyPersonFormValues(type), ...values },
  };
}

describe('draftHasContent', () => {
  it('ignora o rascunho que só tem o tipo escolhido', () => {
    expect(draftHasContent(draft('PF'))).toBe(false);
    expect(draftHasContent(draft('PJ'))).toBe(false);
  });

  it('reconhece um campo preenchido', () => {
    expect(draftHasContent(draft('PF', { name: 'Maria' }))).toBe(true);
  });

  it('reconhece alteração dentro do representante', () => {
    const base = emptyPersonFormValues('PJ');
    const changed = draft('PJ', {
      representative: { ...base.representative, name: 'João Lima' },
    });

    expect(draftHasContent(changed)).toBe(true);
  });

  it('reconhece quando um padrão é apagado', () => {
    expect(draftHasContent(draft('PF', { nationality: '' }))).toBe(true);
  });
});
