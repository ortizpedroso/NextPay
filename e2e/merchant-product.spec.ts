import { expect, test } from '@playwright/test';

test('demo mode: cadastra produto no painel (sem checkout)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Produtos & Serviços' }).click();
  await page.getByRole('button', { name: 'Novo Produto ou Serviço' }).click();

  await page.getByPlaceholder('Ex: Sessão Estratégica de Marketing').fill('Produto E2E Playwright');
  await page
    .getByPlaceholder('Explique os entregáveis, formato de execução ou bônus inclusos...')
    .fill('Criado em teste automatizado');
  await page.getByRole('button', { name: 'Salvar e Gerar Link' }).click();

  await expect(
    page.getByRole('heading', { name: 'Produto E2E Playwright' }),
  ).toBeVisible({ timeout: 15_000 });
});
