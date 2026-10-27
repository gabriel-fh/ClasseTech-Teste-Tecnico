import type { PersonType } from '@/features/people/types';

export const DOCUMENT_TYPES = [
  'identity',
  'proof_of_address',
  'proof_of_income',
  'articles_of_incorporation',
  'cnpj_card',
  'company_proof_of_address',
  'representative_identity',
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface RequiredDocument {
  type: DocumentType;
  label: string;
  description: string;
}

export const REQUIRED_DOCUMENTS: Record<PersonType, RequiredDocument[]> = {
  PF: [
    {
      type: 'identity',
      label: 'Documento de identidade',
      description: 'RG ou CNH com foto legível',
    },
    {
      type: 'proof_of_address',
      label: 'Comprovante de residência',
      description: 'Conta de luz, água ou telefone dos últimos 90 dias',
    },
    {
      type: 'proof_of_income',
      label: 'Comprovante de renda',
      description: 'Contracheque, extrato bancário ou declaração de imposto de renda',
    },
  ],
  PJ: [
    {
      type: 'articles_of_incorporation',
      label: 'Contrato social',
      description: 'Última alteração consolidada',
    },
    {
      type: 'cnpj_card',
      label: 'Cartão CNPJ',
      description: 'Comprovante de inscrição emitido pela Receita Federal',
    },
    {
      type: 'company_proof_of_address',
      label: 'Comprovante de endereço da empresa',
      description: 'Conta no nome da empresa dos últimos 90 dias',
    },
    {
      type: 'representative_identity',
      label: 'Identidade do representante',
      description: 'Documento com foto de quem assina pela empresa',
    },
  ],
};

export function documentLabel(type: DocumentType): string {
  const required = Object.values(REQUIRED_DOCUMENTS)
    .flat()
    .find((item) => item.type === type);

  return required?.label ?? 'Documento';
}

export interface PersonDocument {
  id: string;
  personId: string;
  type: DocumentType;
  fileName: string;
  uri: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export type PersonDocumentInput = Omit<PersonDocument, 'id' | 'createdAt'>;

export interface DocumentationStatus {
  complete: boolean;
  attached: number;
  required: number;
  missing: DocumentType[];
  label: string;
}

export interface ChecklistItem extends RequiredDocument {
  attachments: PersonDocument[];
  fulfilled: boolean;
}

export function buildChecklist(
  personType: PersonType,
  documents: PersonDocument[],
): ChecklistItem[] {
  return REQUIRED_DOCUMENTS[personType].map((required) => {
    const attachments = documents.filter((document) => document.type === required.type);

    return { ...required, attachments, fulfilled: attachments.length > 0 };
  });
}

export function calculateDocumentationStatus(
  personType: PersonType,
  attachedTypes: DocumentType[],
): DocumentationStatus {
  const required = REQUIRED_DOCUMENTS[personType];
  const attached = new Set(attachedTypes);
  const missing = required.filter((item) => !attached.has(item.type)).map((item) => item.type);
  const fulfilled = required.length - missing.length;

  return {
    complete: missing.length === 0,
    attached: fulfilled,
    required: required.length,
    missing,
    label: missing.length === 0 ? 'Completa' : `Pendente (${fulfilled} de ${required.length})`,
  };
}
