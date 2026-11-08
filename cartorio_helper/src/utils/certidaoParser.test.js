import { describe, expect, it } from 'vitest';
import {
  extractFields,
  dateFromDMA,
  getSexoCasamento,
  parseDate,
  writtenToNumber,
} from './certidaoParser.js';

describe('writtenToNumber', () => {
  it('reads simple units', () => {
    expect(writtenToNumber('quatro')).toBe(4);
    expect(writtenToNumber('doze')).toBe(12);
    expect(writtenToNumber('quatorze')).toBe(14);
  });

  it('reads tens, hundreds and thousands', () => {
    expect(writtenToNumber('vinte e seis')).toBe(26);
    expect(writtenToNumber('duzentos')).toBe(200);
    expect(writtenToNumber('mil')).toBe(1000);
    expect(writtenToNumber('dois mil e quinze')).toBe(2015);
  });

  it('reads the year spells seen on certidões', () => {
    expect(writtenToNumber('mil e novecentos e oitenta e cinco')).toBe(1985);
    expect(writtenToNumber('mil novecentos e noventa e nove')).toBe(1999);
  });

  it('refuses blank input; unknown words add nothing (callers screen via range checks)', () => {
    expect(Number.isNaN(writtenToNumber(''))).toBe(true);
    expect(writtenToNumber('abcdefgh')).toBe(0); // parseDate's 1800-2200 guard rejects 0
  });
});

describe('parseDate', () => {
  it('normalizes numeric dates, even sloppy ones', () => {
    expect(parseDate('14/05/2025')).toBe('14/05/2025');
    expect(parseDate('5/1/2025')).toBe('05/01/2025');
    expect(parseDate('05-01-2025')).toBe('05/01/2025');
  });

  it('reads written-out dates', () => {
    expect(parseDate('quatorze de maio de mil e novecentos e oitenta e cinco'))
      .toBe('14/05/1985');
    expect(parseDate('3 de dezembro de 2024')).toBe('03/12/2024');
  });

  it('returns something for unparseable input instead of crashing', () => {
    expect(parseDate('sem data')).toBe('sem data');
    expect(parseDate('')).toBeNull();
    expect(parseDate(null)).toBeNull();
  });
});

describe('dateFromDMA', () => {
  it('reads the Dia/Mês/Ano registry block', () => {
    expect(dateFromDMA('Dia 14 Mês 5 Ano 1985')).toBe('14/05/1985');
    expect(dateFromDMA('Dia 05 M ês 12 Ano 2024')).toBeNull(); // broken label stays null
  });
});

describe('getSexoCasamento', () => {
  it('infers from the estado civil ending', () => {
    expect(getSexoCasamento('Solteira')).toBe('Feminino');
    expect(getSexoCasamento('Solteiro')).toBe('Masculino');
    expect(getSexoCasamento('Divorciada')).toBe('Feminino');
  });

  it('hands back empty for unknown input', () => {
    expect(getSexoCasamento('')).toBe('');
    expect(getSexoCasamento(null)).toBe('');
    expect(getSexoCasamento('Universal')).toBe('');
  });
});

describe('extractFields', () => {
  it('detects the tipo by which certidão appears first', () => {
    const t = 'Certidão de Nascimento ... algo';
    expect(extractFields(t).tipoRegistro).toBe('Nascimento');
  });

  it('falls back to Nascimento when nothing matches', () => {
    expect(extractFields('texto sem tipo algum').tipoRegistro).toBe('Nascimento');
  });

  it('picks the matrícula digits', () => {
    expect(extractFields('Certidão de Nascimento Matrícula 4 2164 01 56 0031 1 Data 14/05/2025').matricula)
      .toContain('2164');
  });
});
