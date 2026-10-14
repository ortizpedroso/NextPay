/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { ProductsView } from './views/ProductsView';
import { PaymentLinksView } from './views/PaymentLinksView';
import { CheckoutView } from './views/CheckoutView';
import { RatesAndIntegrationsView } from './views/RatesAndIntegrationsView';
import { SubscriptionsView } from './views/SubscriptionsView';
import { ClientsView } from './views/ClientsView';
import { ProductDrawer } from './components/ProductDrawer';
import { QrPixModal } from './components/modals/QrPixModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { NewChargeModal } from './components/modals/NewChargeModal';
import { api, DEFAULT_ACCOUNT, ProductData, PaymentLinkData, ChargeData } from './api/client';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active account data from API
  const { data: account } = useQuery({
    queryKey: ['account'],
    queryFn: () => api.getAccount(),
    initialData: DEFAULT_ACCOUNT,
  });
  const availableBalance = account.balanceCents / 100;

  // Active item for checkout simulation
  const [checkoutItem, setCheckoutItem] = useState<ProductData | PaymentLinkData | null>(null);

  // Modals & Drawers
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isNewChargeModalOpen, setIsNewChargeModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Pix QR Modal
  const [pixModalData, setPixModalData] = useState<{
    isOpen: boolean;
    title: string;
    price: string;
  }>({
    isOpen: false,
    title: '',
    price: '',
  });

  // Receipt Modal
  const [receiptModalData, setReceiptModalData] = useState<{
    isOpen: boolean;
    charge?: ChargeData;
  }>({
    isOpen: false,
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2800);
  };

  const handleCreateCharge = async (charge: {
    clientName: string;
    description: string;
    amount: number;
    method: 'Pix' | 'Cartão' | 'Boleto';
  }) => {
    try {
      const methodEnum =
        charge.method === 'Pix' ? 'PIX' : charge.method === 'Boleto' ? 'BOLETO' : 'CREDIT_CARD';

      await api.createCharge({
        description: charge.description,
        amountCents: Math.round(charge.amount * 100),
        method: methodEnum,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      });
      showToast('Cobrança gerada com sucesso no sistema!');
      setIsNewChargeModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao criar cobrança';
      showToast(`Erro ao criar cobrança: ${msg}`);
    }
  };

  const handleConfirmWithdraw = (amount: number) => {
    showToast(`Solicitação de saque de R$ ${amount.toFixed(2)} registrada!`);
    setIsWithdrawModalOpen(false);
  };

  const handleSaveProduct = async (newProduct: Partial<ProductData>) => {
    try {
      await api.createProduct(newProduct);
      showToast('Produto cadastrado com sucesso!');
      setIsProductDrawerOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao cadastrar produto';
      showToast(`Erro ao salvar produto: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col">
      {/* Toast Notification Container */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-2xl transition-all duration-300 border border-slate-700/50 ${
          toastMessage
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
          check_circle
        </span>
        <span className="font-body-md text-body-md font-medium">{toastMessage}</span>
      </div>

      {/* Mode Switcher: Full Screen Checkout vs Backoffice */}
      {currentView === 'checkout' ? (
        <CheckoutView
          selectedItem={checkoutItem}
          onBackToDashboard={() => setCurrentView('dashboard')}
          onShowToast={showToast}
        />
      ) : (
        <>
          {/* Main App Layout: Sidebar + Top Header + Main Content */}
          <Sidebar
            currentView={currentView}
            onNavigate={(viewId) => setCurrentView(viewId)}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            availableBalance={availableBalance}
          />

          <div className="lg:pl-64 flex flex-col min-h-screen">
            <Header
              onOpenNewCharge={() => setIsNewChargeModalOpen(true)}
              onOpenNewLink={() => setCurrentView('cobrancas-e-links')}
              onOpenSimulator={() => {}}
              onOpenCheckoutPreview={() => {
                setCheckoutItem(null);
                setCurrentView('checkout');
              }}
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              onShowToast={showToast}
            />

            <main className="w-full pt-16 bg-surface min-h-screen flex-1">
              {currentView === 'dashboard' && (
                <DashboardView
                  onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
                  onOpenReceipt={(charge) =>
                    setReceiptModalData({
                      isOpen: true,
                      charge,
                    })
                  }
                  onOpenQrPix={(title, price) =>
                    setPixModalData({
                      isOpen: true,
                      title,
                      price,
                    })
                  }
                  onNavigate={(viewId) => setCurrentView(viewId)}
                  onShowToast={showToast}
                />
              )}

              {currentView === 'clientes' && (
                <ClientsView
                  onShowToast={showToast}
                  onOpenNewChargeForClient={(_clientName) => {
                    setIsNewChargeModalOpen(true);
                  }}
                />
              )}

              {(currentView === 'cobrancas-e-links' ||
                currentView === 'links-pagamento' ||
                currentView === 'pix') && (
                <PaymentLinksView
                  onOpenQrPix={(title, price) =>
                    setPixModalData({
                      isOpen: true,
                      title,
                      price,
                    })
                  }
                  onOpenCheckoutWithLink={(link) => {
                    setCheckoutItem(link);
                    setCurrentView('checkout');
                  }}
                  onShowToast={showToast}
                />
              )}

              {currentView === 'produtos-e-servicos' && (
                <ProductsView
                  onOpenCheckoutWithProduct={(prod) => {
                    setCheckoutItem(prod);
                    setCurrentView('checkout');
                  }}
                  onShowToast={showToast}
                />
              )}

              {currentView === 'assinaturas' && (
                <SubscriptionsView
                  onShowToast={showToast}
                  onNavigate={(viewId) => setCurrentView(viewId)}
                />
              )}

              {(currentView === 'integracoes-e-api' ||
                currentView === 'configuracoes-de-taxas') && (
                <RatesAndIntegrationsView onShowToast={showToast} />
              )}
            </main>
          </div>
        </>
      )}

      {/* Slide-over Drawer for Product Creation with Live Client Preview */}
      <ProductDrawer
        isOpen={isProductDrawerOpen}
        onClose={() => setIsProductDrawerOpen(false)}
        onSaveProduct={handleSaveProduct}
        onShowToast={showToast}
      />

      {/* Modals */}
      <QrPixModal
        isOpen={pixModalData.isOpen}
        onClose={() => setPixModalData({ isOpen: false, title: '', price: '' })}
        title={pixModalData.title}
        price={pixModalData.price}
        onShowToast={showToast}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availableBalance={availableBalance}
        onConfirmWithdraw={handleConfirmWithdraw}
        onShowToast={showToast}
      />

      <ReceiptModal
        isOpen={receiptModalData.isOpen}
        onClose={() => setReceiptModalData({ isOpen: false })}
        clientName={receiptModalData.charge?.description || 'Liquidação NextPay'}
        amount={
          receiptModalData.charge
            ? (receiptModalData.charge.amountCents / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            : 'R$ 4.250,00'
        }
        method={
          receiptModalData.charge?.method === 'PIX'
            ? 'Pix D+0 Instantâneo'
            : receiptModalData.charge?.method === 'BOLETO'
              ? 'Boleto Bancário CIP'
              : 'Cartão de Crédito'
        }
        code={
          receiptModalData.charge?.id
            ? `#PAY-${receiptModalData.charge.id.slice(-6).toUpperCase()}`
            : '#NEXTPAY-LIQ-9842109'
        }
        onShowToast={showToast}
      />

      <NewChargeModal
        isOpen={isNewChargeModalOpen}
        onClose={() => setIsNewChargeModalOpen(false)}
        onChargeCreated={handleCreateCharge}
        onShowToast={showToast}
      />
    </div>
  );
}
