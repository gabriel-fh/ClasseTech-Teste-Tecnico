import {
  maskCep,
  maskCnpj,
  maskCpf,
  maskDate,
  maskPhone,
  obfuscateCnpj,
  obfuscateCpf,
} from '../masks';

describe('maskCpf', () => {
  it('formata conforme o usuario digita', () => {
    expect(maskCpf('529')).toBe('529');
    expect(maskCpf('5299')).toBe('529.9');
    expect(maskCpf('52998224')).toBe('529.982.24');
    expect(maskCpf('52998224725')).toBe('529.982.247-25');
  });

  it('descarta caracteres invalidos e o excesso', () => {
    expect(maskCpf('529.982.247-25')).toBe('529.982.247-25');
    expect(maskCpf('529abc98224725999')).toBe('529.982.247-25');
  });
});

describe('maskCnpj', () => {
  it('formata o CNPJ numerico', () => {
    expect(maskCnpj('11222333000181')).toBe('11.222.333/0001-81');
    expect(maskCnpj('11222')).toBe('11.222');
  });

  it('formata o CNPJ alfanumerico em maiusculo', () => {
    expect(maskCnpj('12abc34501de35')).toBe('12.ABC.345/01DE-35');
  });
});

describe('maskPhone', () => {
  it('alterna entre fixo e celular', () => {
    expect(maskPhone('2122223333')).toBe('(21) 2222-3333');
    expect(maskPhone('21998765432')).toBe('(21) 99876-5432');
  });

  it('formata parcialmente', () => {
    expect(maskPhone('21')).toBe('(21');
    expect(maskPhone('219')).toBe('(21) 9');
  });
});

describe('maskCep e maskDate', () => {
  it('formata CEP', () => {
    expect(maskCep('24220000')).toBe('24220-000');
    expect(maskCep('242')).toBe('242');
  });

  it('formata data', () => {
    expect(maskDate('15031990')).toBe('15/03/1990');
    expect(maskDate('1503')).toBe('15/03');
  });
});

describe('ocultacao para exibicao', () => {
  it('esconde o meio do CPF', () => {
    expect(obfuscateCpf('52998224725')).toBe('529.***.***-25');
  });

  it('esconde o meio do CNPJ mantendo filial e verificadores', () => {
    expect(obfuscateCnpj('11222333000181')).toBe('11.***.***/0001-81');
    expect(obfuscateCnpj('12ABC34501DE35')).toBe('12.***.***/01DE-35');
  });

  it('cai para a mascara comum quando o documento esta incompleto', () => {
    expect(obfuscateCpf('52998')).toBe('529.98');
    expect(obfuscateCnpj('11222')).toBe('11.222');
  });
});
