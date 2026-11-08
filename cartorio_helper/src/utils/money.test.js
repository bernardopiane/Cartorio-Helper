import { describe, expect, it } from 'vitest';
import { formatCurrency, parseMoney } from './money.js';

describe('parseMoney', () => {
  it('reads the XSD dot decimal that remessas actually ship', () => {
    expect(parseMoney('153.41')).toBe(153.41);
    expect(parseMoney('0.00')).toBe(0);
    expect(parseMoney('7.67')).toBe(7.67);
  });

  it('reads pt-BR comma decimals', () => {
    expect(parseMoney('153,41')).toBe(153.41);
    expect(parseMoney('0,00')).toBe(0);
  });

  it('reads pt-BR grouped values without corrupting the thousands', () => {
    expect(parseMoney('1.234,56')).toBe(1234.56);
    expect(parseMoney('12.345,67')).toBe(12345.67);
  });

  it('never invents money out of empty or garbage input', () => {
    expect(parseMoney('')).toBe(0);
    expect(parseMoney(null)).toBe(0);
    expect(parseMoney(undefined)).toBe(0);
    expect(parseMoney('n/a')).toBe(0);
    expect(parseMoney(0)).toBe(0);
  });

  it('sums like a ledger would: no float drift into the cents', () => {
    const total = ['153.41', '153.41', '153.41'].reduce((s, v) => s + parseMoney(v), 0);
    expect(total).toBeCloseTo(460.23, 10);
  });
});

describe('formatCurrency', () => {
  it('swaps the decimal dot for the comma', () => {
    expect(formatCurrency('153.41')).toBe('153,41');
    expect(formatCurrency('0.00')).toBe('0,00');
  });

  it('keeps absent values absent', () => {
    expect(formatCurrency('')).toBe('');
    expect(formatCurrency(null)).toBe('');
  });
});
