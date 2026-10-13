/**
 * Utilitários de formatação e conversão monetária para o padrão BRL (Real brasileiro).
 * Regra: Dinheiro é armazenado e trafega como inteiro em centavos (amountCents: number).
 */

/**
 * Converte um valor em centavos para a representação monetária formatada em BRL (R$).
 * Exemplo: 150000 -> "R$ 1.500,00"
 * Exemplo: 0 -> "R$ 0,00"
 * Exemplo: -5000 -> "-R$ 50,00"
 */
export function formatBRL(cents: number): string {
  if (typeof cents !== 'number' || Number.isNaN(cents) || !Number.isFinite(cents)) {
    throw new TypeError('O valor em centavos deve ser um número finito válido.');
  }

  const rounded = Math.round(cents);
  const value = rounded / 100;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
    .format(value)
    .replace(/\u00a0/g, ' ');
}

/**
 * Converte uma string formatada em BRL para inteiro em centavos.
 * Exemplos aceitos:
 * - "1.500,00" -> 150000
 * - "R$ 1.500,00" -> 150000
 * - "0,00" -> 0
 * - "0" -> 0
 * - "0,50" -> 50
 * - "-1.500,00" -> -150000
 * - "-R$ 50,25" -> -5025
 */
export function parseBRLToCents(input: string): number {
  if (typeof input !== 'string') {
    throw new TypeError('A entrada deve ser uma string.');
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('A entrada não pode ser vazia.');
  }

  // Verifica se o valor é negativo
  const isNegative =
    trimmed.startsWith('-') ||
    trimmed.includes('-R$') ||
    trimmed.includes('R$ -') ||
    trimmed.includes('R$-');

  // Remove moeda, espaços, hífens
  const clean = trimmed.replace(/[R$\s-]/g, '').trim();

  if (!clean) {
    throw new Error('Valor monetário inválido.');
  }

  if (clean.includes(',')) {
    const parts = clean.split(',');
    if (parts.length !== 2) {
      throw new Error('Formato monetário inválido: múltiplas vírgulas.');
    }

    const [reaisPart, centsPart] = parts;
    const reaisClean = reaisPart.replace(/\./g, '');

    if (!/^\d*$/.test(reaisClean) || !/^\d+$/.test(centsPart)) {
      throw new Error('O valor contém caracteres não numéricos.');
    }

    const reais = reaisClean === '' ? 0 : parseInt(reaisClean, 10);
    // Padroniza centavos para exatamente 2 dígitos
    const centsPadded = centsPart.length === 1 ? centsPart + '0' : centsPart.slice(0, 2);
    const cents = parseInt(centsPadded, 10);

    const totalCents = reais * 100 + cents;
    return isNegative ? -totalCents : totalCents;
  }

  // Sem vírgula: pode conter separadores de milhar como "1.500" ou apenas dígitos
  const digitsOnly = clean.replace(/\./g, '');
  if (!/^\d+$/.test(digitsOnly)) {
    throw new Error('O valor contém caracteres não numéricos.');
  }

  const reais = parseInt(digitsOnly, 10);
  const totalCents = reais * 100;
  return isNegative ? -totalCents : totalCents;
}
