import { buildSummaryQuery } from '../repository';

describe('buildSummaryQuery', () => {
  it('has no filter clause when nothing is given', () => {
    const { sql, params } = buildSummaryQuery();

    expect(sql).not.toMatch(/\nWHERE /);
    expect(sql).toContain('ORDER BY p.created_at DESC');
    expect(params).toEqual([]);
  });

  it('searches name and legal name', () => {
    const { sql, params } = buildSummaryQuery({ search: 'Maria' });

    expect(sql).toContain('p.name LIKE ?');
    expect(sql).toContain('p.legal_name LIKE ?');
    expect(params).toEqual(['%Maria%', '%Maria%']);
  });

  it('strips the mask before searching cpf and cnpj', () => {
    const { sql, params } = buildSummaryQuery({ search: '529.982.247-25' });

    expect(sql).toContain('p.cpf LIKE ?');
    expect(sql).toContain('p.cnpj LIKE ?');
    expect(params).toEqual([
      '%529.982.247-25%',
      '%529.982.247-25%',
      '%52998224725%',
      '%52998224725%',
    ]);
  });

  it('skips the document clauses when the search has no digits', () => {
    const { sql } = buildSummaryQuery({ search: 'Maria' });

    expect(sql).not.toContain('p.cpf LIKE ?');
  });

  it('ignores a blank search', () => {
    expect(buildSummaryQuery({ search: '   ' }).params).toEqual([]);
  });

  it('filters by person type', () => {
    const { sql, params } = buildSummaryQuery({ type: 'PJ' });

    expect(sql).toContain('p.type = ?');
    expect(params).toEqual(['PJ']);
  });

  it('combines search and type with AND', () => {
    const { sql, params } = buildSummaryQuery({ search: 'Maria', type: 'PF' });

    expect(sql).toContain('AND');
    expect(params).toEqual(['%Maria%', '%Maria%', 'PF']);
  });

  it('does not push the pending filter into sql', () => {
    expect(buildSummaryQuery({ onlyPending: true }).params).toEqual([]);
  });
});
