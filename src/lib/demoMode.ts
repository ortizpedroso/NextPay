/** Modo demonstração: fallbacks locais quando não há sessão de painel. Desligado em produção por padrão. */
export function isDemoMode(): boolean {
  const flag = import.meta.env.VITE_DEMO_MODE;
  if (flag === 'true' || flag === '1') {
    return true;
  }
  if (flag === 'false' || flag === '0') {
    return false;
  }
  return import.meta.env.DEV;
}
