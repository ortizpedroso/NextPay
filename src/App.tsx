/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import {
  INITIAL_PRODUCTS,
  INITIAL_PAYMENT_LINKS,
  INITIAL_TRANSACTIONS,
  ProductItem,
  PaymentLink,
  Transaction,
} from './data/mockData';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core reactive data
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>(INITIAL_PAYMENT_LINKS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [availableBalance, setAvailableBalance] = useState(48920.5);

  // Active item for checkout simulation
  const [checkoutItem, setCheckoutItem] = useState<ProductItem | PaymentLink | null>(null);

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
    tx?: Transaction;
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

  // Handlers
  const handleAddProduct = (newProd: ProductItem) => {
    setProducts([newProd, ...products]);
  };

  const handleAddPaymentLink = (newLink: PaymentLink) => {
    setPaymentLinks([newLink, ...paymentLinks]);
  };

  const handleCreateCharge = (charge: {
    clientName: string;
    description: string;
    amount: number;
    method: 'Pix' | 'Cartão' | 'Boleto';
  }) => {
    const fee =
      charge.method === 'Pix'
        ? 2.48
        : charge.method === 'Boleto'
          ? charge.amount * 0.01 + 2.48
          : charge.amount * 0.0399 + 0.98;

    const net = charge.amount - fee;
    const profit = charge.method === 'Pix' ? 0.49 : charge.amount * 0.01 + 0.49;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      clientName: charge.clientName,
      clientDoc: '***.000.000-**',
      avatarInitials: charge.clientName.slice(0, 2).toUpperCase(),
      description: charge.description,
      code: `#PAY-${Math.floor(10000 + Math.random() * 90000)}`,
      method: charge.method,
      methodDetail:
        charge.method === 'Pix'
          ? 'Pix D+0 Instantâneo'
          : charge.method === 'Cartão'
            ? 'Cartão 1x'
            : 'Boleto CIP',
      date: 'Agora',
      grossAmount: charge.amount,
      grossAmountFormatted: `R$ ${charge.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      gatewayFeeFormatted: `- R$ ${fee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      gatewayProfitFormatted: `+ R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      netAmountFormatted: `R$ ${net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      status: charge.method === 'Pix' ? 'Liquidado' : 'Aguardando',
      dueDate: 'Hoje',
    };

    setTransactions([newTx, ...transactions]);

    if (charge.method === 'Pix') {
      setAvailableBalance((prev) => prev + net);
    }
  };

  const handleConfirmWithdraw = (amount: number) => {
    setAvailableBalance((prev) => Math.max(0, prev - amount));
  };

  const handleOpenCheckoutWithProduct = (product: ProductItem) => {
    setCheckoutItem(product);
    setCurrentView('checkout');
  };

  const handleOpenCheckoutWithLink = (link: PaymentLink) => {
    setCheckoutItem(link);
    setCurrentView('checkout');
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
                  transactions={transactions}
                  availableBalance={availableBalance}
                  onOpenWithdraw={() => setIsWithdrawModalOpen(true)}
                  onOpenReceipt={(tx) =>
                    setReceiptModalData({
                      isOpen: true,
                      tx,
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
                  paymentLinks={paymentLinks}
                  transactions={transactions}
                  onAddPaymentLink={handleAddPaymentLink}
                  onOpenQrPix={(title, price) =>
                    setPixModalData({
                      isOpen: true,
                      title,
                      price,
                    })
                  }
                  onOpenReceipt={(tx) =>
                    setReceiptModalData({
                      isOpen: true,
                      tx,
                    })
                  }
                  onOpenCheckoutWithLink={handleOpenCheckoutWithLink}
                  onShowToast={showToast}
                />
              )}

              {currentView === 'produtos-e-servicos' && (
                <ProductsView
                  products={products}
                  onOpenDrawer={() => setIsProductDrawerOpen(true)}
                  onOpenCheckoutWithProduct={handleOpenCheckoutWithProduct}
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
        onSaveProduct={handleAddProduct}
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
        clientName={receiptModalData.tx?.clientName || 'Estúdio Criativo Silva'}
        amount={receiptModalData.tx?.grossAmountFormatted || 'R$ 4.250,00'}
        method={receiptModalData.tx?.methodDetail || 'Liquidação Automática Pix D+0'}
        code={receiptModalData.tx?.code || '#NEXTPAY-LIQ-9842109'}
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
