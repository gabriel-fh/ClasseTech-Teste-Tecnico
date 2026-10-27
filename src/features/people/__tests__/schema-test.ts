import {
  companyFormSchema,
  emptyPersonFormValues,
  FIELD_LIMITS,
  individualFormSchema,
  toPersonInput,
  type PersonFormValues,
} from '../schema';

function validIndividual(overrides: Partial<PersonFormValues> = {}): PersonFormValues {
  return {
    ...emptyPersonFormValues('PF'),
    name: 'Maria Souza',
    cpf: '529.982.247-25',
    rg: '12.345.678-9',
    rgIssuer: 'SSP/SP',
    birthDate: '10/03/1990',
    occupation: 'Arquiteta',
    email: 'maria@exemplo.com',
    phone: '(21) 98888-7777',
    cep: '24220-000',
    street: 'Rua São João',
    number: '120',
    district: 'Icaraí',
    city: 'Niterói',
    uf: 'RJ',
    ...overrides,
  };
}

function validCompany(overrides: Partial<PersonFormValues> = {}): PersonFormValues {
  const base = emptyPersonFormValues('PJ');

  return {
    ...base,
    legalName: 'Imobiliária Exemplo Ltda',
    tradeName: 'Exemplo Imóveis',
    cnpj: '11.222.333/0001-81',
    stateRegistration: '',
    foundationDate: '01/02/2015',
    email: 'contato@exemplo.com',
    phone: '(21) 3333-4444',
    cep: '24220-000',
    street: 'Avenida Central',
    number: '500',
    district: 'Centro',
    city: 'Niterói',
    uf: 'rj',
    representative: {
      name: 'João Lima',
      cpf: '529.982.247-25',
      role: 'Sócio administrador',
      email: 'joao@exemplo.com',
      phone: '(21) 97777-6666',
    },
    ...overrides,
  };
}

describe('individualFormSchema', () => {
  it('aceita uma pessoa física completa', () => {
    expect(individualFormSchema.safeParse(validIndividual()).success).toBe(true);
  });

  it('rejeita CPF inválido', () => {
    const result = individualFormSchema.safeParse(validIndividual({ cpf: '111.111.111-11' }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('CPF inválido');
  });

  it('rejeita menor de 18 anos', () => {
    const result = individualFormSchema.safeParse(validIndividual({ birthDate: '10/03/2020' }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('O cadastro exige maior de 18 anos');
  });

  it('rejeita data inexistente', () => {
    const result = individualFormSchema.safeParse(validIndividual({ birthDate: '31/02/1990' }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Data inválida');
  });

  it('exige nome e sobrenome', () => {
    const result = individualFormSchema.safeParse(validIndividual({ name: 'Maria' }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Informe o nome e o sobrenome');
  });

  it('rejeita UF fora da lista', () => {
    expect(individualFormSchema.safeParse(validIndividual({ uf: 'XX' })).success).toBe(false);
  });

  it('acusa todos os campos vazios de uma vez', () => {
    const result = individualFormSchema.safeParse(emptyPersonFormValues('PF'));

    expect(result.success).toBe(false);
    expect(result.error?.issues.length).toBeGreaterThan(5);
  });

  it('trata campo so com espacos como vazio', () => {
    const result = individualFormSchema.safeParse(validIndividual({ city: '   ' }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Informe a cidade');
  });

  it('rejeita texto acima do limite do campo', () => {
    const result = individualFormSchema.safeParse(
      validIndividual({ occupation: 'a'.repeat(FIELD_LIMITS.text + 1) }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(`Use no máximo ${FIELD_LIMITS.text} caracteres`);
  });

  it('rejeita RG curto demais', () => {
    const result = individualFormSchema.safeParse(validIndividual({ rg: '123' }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('RG incompleto');
  });

  it('rejeita ano de nascimento implausivel', () => {
    const result = individualFormSchema.safeParse(validIndividual({ birthDate: '01/01/1850' }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Confira o ano de nascimento');
  });
});

describe('companyFormSchema', () => {
  it('aceita uma pessoa jurídica completa', () => {
    expect(companyFormSchema.safeParse(validCompany()).success).toBe(true);
  });

  it('rejeita CNPJ inválido', () => {
    const result = companyFormSchema.safeParse(validCompany({ cnpj: '11.222.333/0001-00' }));

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('CNPJ inválido');
  });

  it('rejeita data de abertura no futuro', () => {
    const nextYear = new Date().getFullYear() + 1;
    const result = companyFormSchema.safeParse(
      validCompany({ foundationDate: `01/02/${nextYear}` }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('A data de abertura não pode ser futura');
  });

  it('rejeita razao social acima do limite', () => {
    const result = companyFormSchema.safeParse(
      validCompany({ legalName: 'a'.repeat(FIELD_LIMITS.legalName + 1) }),
    );

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(
      `Use no máximo ${FIELD_LIMITS.legalName} caracteres`,
    );
  });

  it('exige o representante legal', () => {
    const result = companyFormSchema.safeParse(
      validCompany({
        representative: { name: '', cpf: '', role: '', email: '', phone: '' },
      }),
    );

    expect(result.success).toBe(false);
  });
});

describe('toPersonInput', () => {
  it('normaliza documentos, telefone, CEP e data da pessoa física', () => {
    const input = toPersonInput(validIndividual());

    expect(input).toMatchObject({
      type: 'PF',
      cpf: '52998224725',
      phone: '21988887777',
      cep: '24220000',
      birthDate: '1990-03-10',
      uf: 'RJ',
    });
  });

  it('transforma campo opcional vazio em null', () => {
    const input = toPersonInput(validIndividual({ complement: '   ' }));

    expect(input.complement).toBeNull();
  });

  it('normaliza a pessoa jurídica e o representante', () => {
    const input = toPersonInput(validCompany());

    expect(input).toMatchObject({
      type: 'PJ',
      cnpj: '11222333000181',
      foundationDate: '2015-02-01',
      uf: 'RJ',
      stateRegistration: null,
    });

    expect(input.type === 'PJ' && input.representative).toMatchObject({
      cpf: '52998224725',
      phone: '21977776666',
    });
  });
});
