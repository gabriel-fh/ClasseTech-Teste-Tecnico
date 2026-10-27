import {
  brazilianDateToIso,
  calculateAge,
  isAdult,
  isNotFutureDate,
  isPlausibleAge,
  isValidBrazilianDate,
  isValidCep,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidPhone,
  isValidUf,
  isoToBrazilianDate,
  normalizeCnpj,
  onlyDigits,
} from '../validators';

describe('isValidCpf', () => {
  it('aceita CPF valido com e sem mascara', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true);
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('111.444.777-35')).toBe(true);
  });

  it('rejeita digito verificador errado', () => {
    expect(isValidCpf('529.982.247-24')).toBe(false);
    expect(isValidCpf('12345678900')).toBe(false);
  });

  it('rejeita sequencia de digitos repetidos', () => {
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('00000000000')).toBe(false);
  });

  it('rejeita tamanho diferente de 11 digitos', () => {
    expect(isValidCpf('')).toBe(false);
    expect(isValidCpf('5299822472')).toBe(false);
    expect(isValidCpf('529982247250')).toBe(false);
  });
});

describe('isValidCnpj', () => {
  it('aceita CNPJ numerico valido com e sem mascara', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
    expect(isValidCnpj('11222333000181')).toBe(true);
  });

  it('aceita o formato alfanumerico da Receita', () => {
    expect(isValidCnpj('12.ABC.345/01DE-35')).toBe(true);
    expect(isValidCnpj('12ABC34501DE35')).toBe(true);
    expect(isValidCnpj('12abc34501de35')).toBe(true);
  });

  it('rejeita digito verificador errado', () => {
    expect(isValidCnpj('11.222.333/0001-80')).toBe(false);
    expect(isValidCnpj('12ABC34501DE34')).toBe(false);
  });

  it('rejeita letra na posicao dos digitos verificadores', () => {
    expect(isValidCnpj('12ABC34501DEAB')).toBe(false);
  });

  it('rejeita base repetida e tamanho invalido', () => {
    expect(isValidCnpj('00000000000000')).toBe(false);
    expect(isValidCnpj('1122233300018')).toBe(false);
    expect(isValidCnpj('')).toBe(false);
  });
});

describe('normalizacao', () => {
  it('onlyDigits remove tudo que nao for digito', () => {
    expect(onlyDigits('(21) 99876-5432')).toBe('21998765432');
  });

  it('normalizeCnpj mantem letras em maiusculo', () => {
    expect(normalizeCnpj('12.abc.345/01de-35')).toBe('12ABC34501DE35');
  });
});

describe('contato e endereco', () => {
  it('valida email', () => {
    expect(isValidEmail('locador@imobiliaria.com.br')).toBe(true);
    expect(isValidEmail('locador@imobiliaria')).toBe(false);
    expect(isValidEmail('locador.imobiliaria.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('valida telefone fixo e celular', () => {
    expect(isValidPhone('(21) 2222-3333')).toBe(true);
    expect(isValidPhone('(21) 99876-5432')).toBe(true);
    expect(isValidPhone('(21) 9987-543')).toBe(false);
  });

  it('valida CEP de 8 digitos', () => {
    expect(isValidCep('24220-000')).toBe(true);
    expect(isValidCep('2422000')).toBe(false);
  });

  it('valida UF', () => {
    expect(isValidUf('RJ')).toBe(true);
    expect(isValidUf('rj')).toBe(true);
    expect(isValidUf('XX')).toBe(false);
  });
});

describe('datas', () => {
  it('valida data real no formato brasileiro', () => {
    expect(isValidBrazilianDate('29/02/2024')).toBe(true);
    expect(isValidBrazilianDate('29/02/2023')).toBe(false);
    expect(isValidBrazilianDate('31/04/2024')).toBe(false);
    expect(isValidBrazilianDate('1/1/2024')).toBe(false);
  });

  it('converte entre formato brasileiro e ISO', () => {
    expect(brazilianDateToIso('15/03/1990')).toBe('1990-03-15');
    expect(brazilianDateToIso('31/02/1990')).toBeNull();
    expect(isoToBrazilianDate('1990-03-15')).toBe('15/03/1990');
    expect(isoToBrazilianDate('')).toBe('');
  });

  it('calcula idade considerando o aniversario', () => {
    const reference = new Date(2026, 9, 24);

    expect(calculateAge('24/10/2008', reference)).toBe(18);
    expect(calculateAge('25/10/2008', reference)).toBe(17);
    expect(calculateAge('data invalida', reference)).toBeNull();
  });

  it('exige maioridade', () => {
    const reference = new Date(2026, 9, 24);

    expect(isAdult('24/10/2008', reference)).toBe(true);
    expect(isAdult('25/10/2008', reference)).toBe(false);
  });
});

describe('isPlausibleAge', () => {
  const reference = new Date(2026, 9, 27);

  it('aceita uma data de nascimento normal', () => {
    expect(isPlausibleAge('10/03/1990', reference)).toBe(true);
  });

  it('rejeita ano fora do alcance de uma vida', () => {
    expect(isPlausibleAge('01/01/1850', reference)).toBe(false);
  });

  it('rejeita data que nao existe', () => {
    expect(isPlausibleAge('31/02/1990', reference)).toBe(false);
  });
});

describe('isNotFutureDate', () => {
  const reference = new Date(2026, 9, 27);

  it('aceita o dia de hoje', () => {
    expect(isNotFutureDate('27/10/2026', reference)).toBe(true);
  });

  it('aceita data passada', () => {
    expect(isNotFutureDate('01/02/2015', reference)).toBe(true);
  });

  it('rejeita o dia seguinte', () => {
    expect(isNotFutureDate('28/10/2026', reference)).toBe(false);
  });

  it('rejeita entrada invalida', () => {
    expect(isNotFutureDate('', reference)).toBe(false);
  });
});
