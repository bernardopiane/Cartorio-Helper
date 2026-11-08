import { describe, expect, it } from 'vitest';
import { maskCpf } from './cpf.js';

describe('maskCpf', () => {
  it('formats the full digit run', () => {
    expect(maskCpf('12345678901')).toBe('123.456.789-01');
  });

  it('formats partial typing', () => {
    expect(maskCpf('123')).toBe('123');
    expect(maskCpf('1234')).toBe('123.4');
    expect(maskCpf('1234567')).toBe('123.456.7');
    expect(maskCpf('1234567890')).toBe('123.456.789-0');
  });

  it('strips whatever junk the paste brings', () => {
    expect(maskCpf('123.456.789-01')).toBe('123.456.789-01');
    expect(maskCpf(' 1-2-3 456 a 789 01 ')).toBe('123.456.789-01');
    expect(maskCpf('123456789012345')).toBe('123.456.789-01'); // caps at 11 digits
  });

  it('is empty for empty input', () => {
    expect(maskCpf('')).toBe('');
    expect(maskCpf(null)).toBe('');
    expect(maskCpf('abc')).toBe('');
  });
});
