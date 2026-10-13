import { describe, it, expect } from 'vitest';
import { formatBRL, parseBRLToCents } from './format';

describe('formatBRL', () => {
  it('formata valor zero corretamente', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('formata centavos corretamente', () => {
    expect(formatBRL(5)).toBe('R$ 0,05');
    expect(formatBRL(50)).toBe('R$ 0,50');
    expect(formatBRL(99)).toBe('R$ 0,99');
  });

  it('formata milhares e valores altos corretamente', () => {
    expect(formatBRL(150000)).toBe('R$ 1.500,00');
    expect(formatBRL(1000000)).toBe('R$ 10.000,00');
    expect(formatBRL(123456789)).toBe('R$ 1.234.567,89');
  });

  it('formata valores negativos corretamente', () => {
    expect(formatBRL(-5000)).toBe('-R$ 50,00');
    expect(formatBRL(-150000)).toBe('-R$ 1.500,00');
    expect(formatBRL(-5)).toBe('-R$ 0,05');
  });

  it('lança erro em entradas inválidas (NaN, Infinity, tipos errados)', () => {
    expect(() => formatBRL(NaN)).toThrow(TypeError);
    expect(() => formatBRL(Infinity)).toThrow(TypeError);
    expect(() => formatBRL(-Infinity)).toThrow(TypeError);
    expect(() => formatBRL('100' as unknown as number)).toThrow(TypeError);
  });
});

describe('parseBRLToCents', () => {
  it('converte zero e representações de zero', () => {
    expect(parseBRLToCents('0')).toBe(0);
    expect(parseBRLToCents('0,00')).toBe(0);
    expect(parseBRLToCents('R$ 0,00')).toBe(0);
  });

  it('converte centavos corretamente', () => {
    expect(parseBRLToCents('0,05')).toBe(5);
    expect(parseBRLToCents('0,50')).toBe(50);
    expect(parseBRLToCents('R$ 0,99')).toBe(99);
  });

  it('converte milhares e formatações com R$', () => {
    expect(parseBRLToCents('1.500,00')).toBe(150000);
    expect(parseBRLToCents('R$ 1.500,00')).toBe(150000);
    expect(parseBRLToCents('12.345,67')).toBe(1234567);
    expect(parseBRLToCents('1500')).toBe(150000);
    expect(parseBRLToCents('1.500')).toBe(150000);
  });

  it('converte valores negativos', () => {
    expect(parseBRLToCents('-1.500,00')).toBe(-150000);
    expect(parseBRLToCents('-R$ 50,00')).toBe(-5000);
    expect(parseBRLToCents('R$ -1.500,00')).toBe(-150000);
    expect(parseBRLToCents('-0,05')).toBe(-5);
  });

  it('lança erro para entradas inválidas', () => {
    expect(() => parseBRLToCents('')).toThrow('A entrada não pode ser vazia');
    expect(() => parseBRLToCents('   ')).toThrow('A entrada não pode ser vazia');
    expect(() => parseBRLToCents('abc')).toThrow('O valor contém caracteres não numéricos');
    expect(() => parseBRLToCents('1.2.3,45,67')).toThrow(
      'Formato monetário inválido: múltiplas vírgulas',
    );
    expect(() => parseBRLToCents(null as unknown as string)).toThrow(TypeError);
    expect(() => parseBRLToCents(undefined as unknown as string)).toThrow(TypeError);
    expect(() => parseBRLToCents(123 as unknown as string)).toThrow(TypeError);
  });
});
