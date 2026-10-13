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
 * Expressão regular estrita para validação completa de valores monetários em BRL.
 *
 * Prefixo opcional:
 *   - '-'
 *   - '-R$' ou '- R$'
 *   - 'R$'
 *   - 'R$-' ou 'R$ -'
 *
 * Parte inteira (reais):
 *   - Com separadores de milhar válidos: grupos de 1 a 3 dígitos seguidos obrigatoriamente de grupos de exatamente 3 dígitos (ex: 1.500, 12.345, 1.234.567)
 *   - Sem separadores de milhar: apenas dígitos contínuos (ex: 0, 50, 1500)
 *
 * Parte decimal (centavos) opcional:
 *   - Vírgula seguida de exatamente 1 ou 2 dígitos (ex: ,5 ou ,50 ou ,05). Mais de 2 casas decimais são rejeitadas.
 */
const BRL_STRICT_REGEX =
  /^(?:(-)?\s*R\$\s*|R\$\s*(-)?\s*|(-)\s*)?(?:(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?)$/;

/**
 * Converte uma string formatada em BRL para inteiro em centavos.
 *
 * Lança erro (nunca corrige em silêncio) quando:
 * - houver mais de 2 casas decimais ("0,555", "1.500,999");
 * - houver letras ou símbolos fora do prefixo "R$" ("1R2,00", "12a");
 * - o sinal "-" aparecer em posição diferente do início ou logo após "R$" ("1-2", "--5");
 * - pontos de milhar estiverem fora de grupos de 3 dígitos ("12.34.5", "1.50").
 */
export function parseBRLToCents(input: string): number {
  if (typeof input !== 'string') {
    throw new TypeError('A entrada deve ser uma string.');
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('A entrada não pode ser vazia.');
  }

  const match = trimmed.match(BRL_STRICT_REGEX);
  if (!match) {
    throw new Error(`Formato monetário BRL inválido: "${input}".`);
  }

  const isNegative = Boolean(match[1] || match[2] || match[3]);
  const reaisPart = match[4].replace(/\./g, '');
  const centsPart = match[5] ?? '0';

  const reais = parseInt(reaisPart, 10);
  const cents = centsPart.length === 1 ? parseInt(centsPart, 10) * 10 : parseInt(centsPart, 10);

  const totalCents = reais * 100 + cents;
  if (totalCents === 0) {
    return 0;
  }

  return isNegative ? -totalCents : totalCents;
}
