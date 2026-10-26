import { mapCepResponse, mapCnpjResponse } from '../api';

describe('mapCepResponse', () => {
  it('monta o endereço a partir da resposta do ViaCEP', () => {
    expect(
      mapCepResponse({
        logradouro: 'Rua São João',
        complemento: 'até 500',
        bairro: 'Icaraí',
        localidade: 'Niterói',
        uf: 'rj',
      }),
    ).toEqual({
      street: 'Rua São João',
      complement: 'até 500',
      district: 'Icaraí',
      city: 'Niterói',
      uf: 'RJ',
    });
  });

  it('devolve null quando o ViaCEP marca erro', () => {
    expect(mapCepResponse({ erro: true })).toBeNull();
    expect(mapCepResponse({ erro: 'true' })).toBeNull();
  });

  it('devolve null quando a resposta vem sem cidade', () => {
    expect(mapCepResponse({ logradouro: 'Rua São João' })).toBeNull();
  });
});

describe('mapCnpjResponse', () => {
  it('monta os dados da empresa a partir da resposta da BrasilAPI', () => {
    expect(
      mapCnpjResponse({
        razao_social: 'Imobiliária Exemplo Ltda',
        nome_fantasia: 'Exemplo Imóveis',
        data_inicio_atividade: '2015-02-01',
        ddd_telefone_1: '2133334444',
        cep: '24220000',
        descricao_tipo_de_logradouro: 'Avenida',
        logradouro: 'Central',
        numero: '500',
        complemento: 'sala 12',
        bairro: 'Centro',
        municipio: 'NITEROI',
        uf: 'RJ',
      }),
    ).toEqual({
      legalName: 'Imobiliária Exemplo Ltda',
      tradeName: 'Exemplo Imóveis',
      foundationDate: '01/02/2015',
      phone: '2133334444',
      cep: '24220000',
      street: 'Avenida Central',
      number: '500',
      complement: 'sala 12',
      district: 'Centro',
      city: 'NITEROI',
      uf: 'RJ',
    });
  });

  it('devolve null quando não vem razão social', () => {
    expect(mapCnpjResponse({ nome_fantasia: 'Exemplo' })).toBeNull();
  });

  it('não duplica o tipo de logradouro quando ele não vem', () => {
    const result = mapCnpjResponse({ razao_social: 'Exemplo Ltda', logradouro: 'Rua das Flores' });

    expect(result?.street).toBe('Rua das Flores');
  });
});
