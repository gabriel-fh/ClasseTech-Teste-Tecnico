import {
  buildChecklist,
  calculateDocumentationStatus,
  REQUIRED_DOCUMENTS,
  type DocumentType,
  type PersonDocument,
} from '../types';

function makeDocument(type: DocumentType, id: string = type): PersonDocument {
  return {
    id,
    personId: 'person-1',
    type,
    fileName: `${id}.jpg`,
    uri: `file:///docs/${id}.jpg`,
    mimeType: 'image/jpeg',
    size: 1024,
    createdAt: '2026-10-24T12:00:00.000Z',
  };
}

describe('calculateDocumentationStatus', () => {
  it('starts pending with nothing attached', () => {
    const status = calculateDocumentationStatus('PF', []);

    expect(status.complete).toBe(false);
    expect(status.attached).toBe(0);
    expect(status.required).toBe(3);
    expect(status.label).toBe('Pendente (0 de 3)');
  });

  it('counts only the required types', () => {
    const status = calculateDocumentationStatus('PF', ['identity', 'cnpj_card']);

    expect(status.attached).toBe(1);
    expect(status.label).toBe('Pendente (1 de 3)');
    expect(status.missing).toEqual(['proof_of_address', 'proof_of_income']);
  });

  it('ignores repeated types', () => {
    const status = calculateDocumentationStatus('PF', ['identity', 'identity']);

    expect(status.attached).toBe(1);
  });

  it('turns complete when every required type is attached', () => {
    const status = calculateDocumentationStatus(
      'PJ',
      REQUIRED_DOCUMENTS.PJ.map((item) => item.type),
    );

    expect(status.complete).toBe(true);
    expect(status.missing).toEqual([]);
    expect(status.label).toBe('Completa');
  });

  it('requires four documents for a company', () => {
    expect(calculateDocumentationStatus('PJ', []).required).toBe(4);
  });
});

describe('buildChecklist', () => {
  it('groups the attachments under each required document', () => {
    const checklist = buildChecklist('PF', [
      makeDocument('identity', 'rg'),
      makeDocument('identity', 'cnh'),
      makeDocument('cnpj_card'),
    ]);

    expect(checklist).toHaveLength(3);
    expect(checklist[0].type).toBe('identity');
    expect(checklist[0].attachments.map((item) => item.id)).toEqual(['rg', 'cnh']);
    expect(checklist[0].fulfilled).toBe(true);
    expect(checklist[1].fulfilled).toBe(false);
    expect(checklist[1].attachments).toEqual([]);
  });
});
