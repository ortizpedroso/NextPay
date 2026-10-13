import React, { useState, useEffect } from 'react';
import { ProductItem, PaymentLink } from '../data/mockData';

interface CheckoutViewProps {
  selectedItem?: ProductItem | PaymentLink | null;
  onBackToDashboard: () => void;
  onShowToast: (msg: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  selectedItem,
  onBackToDashboard,
  onShowToast,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardBrand, setCardBrand] = useState('Visa/Master/Elo');
  const [installments, setInstallments] = useState('12');
  const [cpf, setCpf] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 15-minute countdown timer
  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Item details fallback to original screen item
  const itemTitle = selectedItem?.title || 'Identidade Visual Completa + Manual de Marca';
  const itemDescription =
    (selectedItem as any)?.description ||
    (selectedItem as any)?.subtitle ||
    'Desenvolvimento de branding completo, tipografia proprietária, guia de paleta de cores, arquivos em alta resolução para web/print e transfer de propriedade intelectual.';

  const basePrice = (selectedItem as any)?.unitPrice || (selectedItem as any)?.price || 1800.0;
  const pixDiscount = basePrice * 0.05;
  const pixTotal = basePrice - pixDiscount;

  const currentTotal = selectedMethod === 'pix' ? pixTotal : basePrice;

  // Pix code
  const pixCode =
    '00020126580014br.gov.bcb.pix0136e92bca71-9f93-4a11-a831-285627db86f552040000530398654071710.005802BR5921ESTUDIO SILVA BRAND6009SAO PAULO62070503***6304D1B8';

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    onShowToast('Código Pix Copia e Cola copiado para a área de transferência!');
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = val.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted.slice(0, 19));

    if (val.startsWith('4')) {
      setCardBrand('VISA');
    } else if (val.startsWith('5')) {
      setCardBrand('MASTERCARD');
    } else if (val.startsWith('6')) {
      setCardBrand('ELO');
    } else {
      setCardBrand('Visa/Master/Elo');
    }
  };

  const handlePayCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      onShowToast('Preencha os dados do cartão de crédito.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onShowToast('Pagamento com cartão de crédito aprovado via antifraude 3DS!');
    }, 1200);
  };

  const handleGenerateBoleto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpf || !whatsapp) {
      onShowToast('Informe seu CPF/CNPJ e WhatsApp para receber o boleto.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      onShowToast(`Boleto registrado emitido com sucesso e enviado para ${whatsapp}!`);
    }, 1000);
  };

  const handleSimulatePixPaid = () => {
    setIsSuccess(true);
    onShowToast('Recebimento Pix identificado em tempo real pelo Banco Central!');
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col items-center justify-center p-3 sm:p-space-md">
      {/* Top Banner to return to Admin */}
      <div className="w-full max-w-6xl flex items-center justify-between py-2 mb-2">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors font-label-md text-xs font-semibold shadow-xs border border-surface-container"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Voltar ao Painel NextPay</span>
        </button>

        <span className="font-label-sm text-xs text-outline hidden sm:inline-block">
          Simulação de Checkout Transparente (Visão do Pagador)
        </span>
      </div>

      <div className="flex flex-col w-full max-w-6xl mx-auto py-2 sm:py-6">
        {isSuccess ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 sm:p-12 shadow-sm border border-surface-container text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary-container/50 text-secondary mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              Pagamento Confirmado!
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Seu acerto de{' '}
              <strong className="text-on-surface">
                R$ {currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </strong>{' '}
              para o <strong>Estúdio Silva</strong> foi processado com sucesso via infraestrutura
              NextPay Gateway Seguro.
            </p>
            <div className="p-4 bg-surface-container-low rounded-xl text-left text-body-sm space-y-2 border border-surface-container/60">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Protocolo:</span>
                <span className="font-mono text-on-surface font-semibold">#NP-PAY-2025-9812</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Item:</span>
                <span className="text-on-surface font-medium">{itemTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status da Liquidação:</span>
                <span className="text-secondary font-semibold">Efetivada D+0</span>
              </div>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  onShowToast('Comprovante enviado para o seu e-mail');
                }}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-body-md hover:bg-primary-container transition-all"
              >
                Fazer Novo Pagamento de Teste
              </button>
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-semibold text-body-md transition-all"
              >
                Retornar ao Painel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Order Summary & Guarantee */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-surface-container-lowest rounded-xl p-6 lg:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden border border-surface-container/60">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container"></div>

                {/* Merchant Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shadow-sm font-headline-md text-headline-md font-bold">
                      S
                    </div>
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Estúdio Silva
                      </h2>
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-sm text-secondary">
                          verified
                        </span>
                        Verificado • NextPay Secure
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm flex items-center gap-1.5 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    Checkout Seguro
                  </span>
                </div>

                {/* Service Details Card */}
                <div className="bg-surface-container-low rounded-xl p-5 flex flex-col gap-3 border border-surface-container/60">
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                    Detalhes do Serviço
                  </span>
                  <h1 className="font-headline-md text-headline-md text-on-surface font-bold leading-snug">
                    {itemTitle}
                  </h1>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {itemDescription}
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Subtotal do Pacote
                    </span>
                    <span className="font-numeric-md text-numeric-md text-on-surface font-medium">
                      R$ {basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 text-secondary">
                    <span className="font-body-md text-body-md flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-sm">savings</span>
                      Desconto à vista Pix (5%)
                    </span>
                    <span className="font-numeric-md text-numeric-md font-semibold">
                      - R$ {pixDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="h-px bg-surface-container-high my-1"></div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block font-semibold">
                        Total a Pagar
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        ou em até 12x de R$ {(basePrice / 10).toFixed(2)} no cartão
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-numeric-lg text-numeric-lg text-primary block font-bold">
                        R$ {currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {selectedMethod === 'pix' && (
                        <span className="font-label-sm text-label-sm text-secondary font-medium">
                          Economia de R${' '}
                          {pixDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trust and Custody Guarantees */}
                <div className="flex flex-col gap-3.5 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-surface-container text-primary">
                      <span className="material-symbols-outlined text-base">verified_user</span>
                    </div>
                    <div>
                      <span className="font-title-md text-title-md text-on-surface block font-semibold">
                        Garantia de Entrega e Qualidade
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Revisões ilimitadas na etapa de briefing e cronograma com acompanhamento
                        direto.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-lg bg-surface-container text-primary">
                      <span className="material-symbols-outlined text-base">lock</span>
                    </div>
                    <div>
                      <span className="font-title-md text-title-md text-on-surface block font-semibold">
                        Custódia Segura NextPay
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Seus dados financeiros não são armazenados nos servidores do prestador.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Studio Mockup Photo */}
                <div className="rounded-xl overflow-hidden shadow-sm relative group">
                  <img
                    className="w-full h-32 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVhn1CRChbVdt8wKuP0QuaZQdpZRhsjKUfUgrO9wJoCPERqW3_agAF-1UKNt4O4gqUXpdoCzNOcXEoiO-ZEEr9v7ElLh2DsZyGLnyShLygp6ELwqN2k-CJl2uNK-VZkYw4wmg1tfWCmTjumoL9Hs5g8cnEIcjGWnJ3ZKcURFrO5bgc5nvLP5_HwxNsTGlIz5PBeoyFy-RAPCmrvvnEOzFnh5p7QG2dm1zepuP60OsNgKJaGkybWD0"
                    alt="Mockup do projeto"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-white font-body-sm text-body-sm font-medium">
                      Projeto com início imediato após confirmação
                    </span>
                  </div>
                </div>
              </div>

              {/* Support Banner */}
              <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between text-on-surface-variant border border-surface-container/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    support_agent
                  </span>
                  <span className="font-label-md text-label-md font-medium">
                    Dúvidas? Fale com o Estúdio
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    window.open('https://api.whatsapp.com', '_blank');
                    onShowToast('Abrindo canal direto no WhatsApp do Estúdio');
                  }}
                  className="font-label-md text-label-md text-primary font-semibold hover:underline"
                >
                  Conversar no WhatsApp
                </button>
              </div>
            </div>

            {/* Right Column: Payment Form Tabs */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-surface-container-lowest rounded-xl p-6 lg:p-8 shadow-sm flex flex-col gap-6 border border-surface-container/60">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant block mb-1 font-semibold">
                    Passo Único
                  </span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    Selecione o Método de Pagamento
                  </h2>
                </div>

                {/* 3 Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-surface-container-low rounded-xl border border-surface-container">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('pix')}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all text-center ${
                      selectedMethod === 'pix'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-lg">qr_code_2</span>
                      <span className="font-title-md text-title-md">Pix</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-bold mt-0.5">
                      5% OFF
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all text-center ${
                      selectedMethod === 'card'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-lg">credit_card</span>
                      <span className="font-title-md text-title-md">Cartão</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                      Até 12x
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('boleto')}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all text-center ${
                      selectedMethod === 'boleto'
                        ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-lg">receipt_long</span>
                      <span className="font-title-md text-title-md">Boleto</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                      3 dias úteis
                    </span>
                  </button>
                </div>

                {/* PIX TAB CONTENT */}
                {selectedMethod === 'pix' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between border border-surface-container">
                      <div className="flex items-center gap-2 text-on-surface">
                        <span className="material-symbols-outlined text-secondary">bolt</span>
                        <div>
                          <span className="font-title-md text-title-md block font-semibold">
                            Aprovação Instantânea 24/7
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Compensação em segundos sem burocracia
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm border border-surface-container">
                        <span className="material-symbols-outlined text-sm text-error">timer</span>
                        <span className="font-numeric-md text-numeric-md font-bold text-on-surface">
                          {formattedCountdown}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-surface-container-low p-6 rounded-xl border border-surface-container">
                      <div className="w-44 h-44 bg-surface-container-lowest p-3 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 border border-surface-container">
                        <svg
                          className="w-full h-full text-on-surface"
                          fill="currentColor"
                          viewBox="0 0 100 100"
                        >
                          <rect
                            fill="currentColor"
                            height="28"
                            rx="2"
                            width="28"
                            x="0"
                            y="0"
                          ></rect>
                          <rect fill="#FFFFFF" height="20" rx="1" width="20" x="4" y="4"></rect>
                          <rect
                            fill="currentColor"
                            height="12"
                            rx="0.5"
                            width="12"
                            x="8"
                            y="8"
                          ></rect>
                          <rect
                            fill="currentColor"
                            height="28"
                            rx="2"
                            width="28"
                            x="72"
                            y="0"
                          ></rect>
                          <rect fill="#FFFFFF" height="20" rx="1" width="20" x="76" y="4"></rect>
                          <rect
                            fill="currentColor"
                            height="12"
                            rx="0.5"
                            width="12"
                            x="80"
                            y="8"
                          ></rect>
                          <rect
                            fill="currentColor"
                            height="28"
                            rx="2"
                            width="28"
                            x="0"
                            y="72"
                          ></rect>
                          <rect fill="#FFFFFF" height="20" rx="1" width="20" x="4" y="76"></rect>
                          <rect
                            fill="currentColor"
                            height="12"
                            rx="0.5"
                            width="12"
                            x="8"
                            y="80"
                          ></rect>
                          <rect height="6" width="6" x="34" y="4"></rect>
                          <rect height="6" width="8" x="44" y="4"></rect>
                          <rect height="6" width="8" x="56" y="4"></rect>
                          <rect height="6" width="16" x="34" y="14"></rect>
                          <rect height="6" width="10" x="54" y="14"></rect>
                          <rect height="8" width="8" x="36" y="24"></rect>
                          <rect height="8" width="16" x="48" y="24"></rect>
                          <rect height="8" width="8" x="4" y="34"></rect>
                          <rect height="8" width="14" x="16" y="34"></rect>
                          <rect height="12" width="12" x="4" y="46"></rect>
                          <rect height="6" width="8" x="20" y="46"></rect>
                          <rect height="6" width="20" x="4" y="62"></rect>
                          <rect height="10" width="10" x="34" y="36"></rect>
                          <rect height="6" width="14" x="48" y="36"></rect>
                          <rect height="12" width="6" x="48" y="46"></rect>
                          <rect height="10" width="10" x="58" y="46"></rect>
                          <rect height="8" width="10" x="34" y="50"></rect>
                          <rect height="14" width="8" x="72" y="34"></rect>
                          <rect height="8" width="12" x="84" y="34"></rect>
                          <rect height="12" width="12" x="84" y="46"></rect>
                          <rect height="6" width="8" x="72" y="52"></rect>
                          <rect height="12" width="6" x="34" y="72"></rect>
                          <rect height="8" width="14" x="44" y="72"></rect>
                          <rect height="6" width="14" x="62" y="72"></rect>
                          <rect height="12" width="16" x="80" y="72"></rect>
                          <rect height="8" width="16" x="34" y="88"></rect>
                          <rect height="12" width="8" x="54" y="84"></rect>
                          <rect height="8" width="12" x="66" y="82"></rect>
                          <rect height="8" width="14" x="82" y="88"></rect>
                        </svg>
                      </div>

                      <div className="flex flex-col gap-3 flex-1 w-full">
                        <span className="font-title-md text-title-md text-on-surface font-semibold">
                          Escaneie pelo aplicativo do seu banco
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Abra o app da sua instituição financeira, escolha pagar com Pix e aponte a
                          câmera para o QR Code ao lado.
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-surface-container-lowest rounded-lg shadow-sm border border-surface-container">
                          <span className="material-symbols-outlined text-secondary text-base">
                            check_circle
                          </span>
                          <span className="font-label-md text-label-md text-on-surface">
                            Valor líquido com 5% de desconto:{' '}
                            <strong>
                              R$ {pixTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between">
                        <span>Pix Copia e Cola</span>
                        <span className="text-on-surface-variant font-label-sm text-label-sm">
                          Código válido por 15 minutos
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-surface-container-low rounded-lg p-3 overflow-hidden text-ellipsis whitespace-nowrap font-numeric-md text-numeric-md text-on-surface-variant border border-surface-container">
                          {pixCode}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className={`h-12 px-5 rounded-lg text-on-primary font-title-md text-title-md flex items-center gap-2 shadow-sm transition-all flex-shrink-0 ${
                            copiedPix ? 'bg-secondary' : 'bg-primary hover:bg-primary-container'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {copiedPix ? 'check' : 'content_copy'}
                          </span>
                          <span>{copiedPix ? 'Copiado!' : 'Copiar Código'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-surface-container-low text-on-surface-variant border border-surface-container">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm animate-pulse text-secondary">
                          lock_clock
                        </span>
                        <span className="font-label-sm text-label-sm">
                          Aguardando confirmação do pagamento pelo Banco Central...
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSimulatePixPaid}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        [Simular Confirmação]
                      </button>
                    </div>
                  </div>
                )}

                {/* CARD TAB CONTENT */}
                {selectedMethod === 'card' && (
                  <form onSubmit={handlePayCard} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium">
                        Número do Cartão
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="0000 0000 0000 0000"
                          className="w-full h-11 px-3 bg-surface-container-low rounded-lg font-numeric-md text-numeric-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-surface-container"
                        />
                        <div className="absolute right-3 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm font-bold">
                            {cardBrand}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium">
                        Nome impresso no Cartão
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Como consta no cartão"
                        className="w-full h-11 px-3 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-surface-container"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium">
                          Validade
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/AA"
                          className="w-full h-11 px-3 bg-surface-container-low rounded-lg font-numeric-md text-numeric-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-center border border-surface-container"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium flex items-center justify-between">
                          <span>CVV</span>
                          <span
                            className="material-symbols-outlined text-sm text-on-surface-variant cursor-pointer"
                            title="3 dígitos no verso do cartão"
                          >
                            help
                          </span>
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          className="w-full h-11 px-3 bg-surface-container-low rounded-lg font-numeric-md text-numeric-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-center border border-surface-container"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-medium">
                        Opções de Parcelamento
                      </label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value)}
                        className="w-full h-11 px-3 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-surface-container"
                      >
                        <option value="1">1x de R$ {basePrice.toFixed(2)} (Sem juros)</option>
                        <option value="2">2x de R$ {(basePrice / 2).toFixed(2)} (Sem juros)</option>
                        <option value="3">3x de R$ {(basePrice / 3).toFixed(2)} (Sem juros)</option>
                        <option value="6">6x de R$ {(basePrice / 6).toFixed(2)} (Sem juros)</option>
                        <option value="12">12x de R$ {(basePrice / 10.1).toFixed(2)}</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full h-12 bg-primary text-on-primary font-headline-sm text-headline-sm rounded-lg shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2 font-semibold disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <span className="material-symbols-outlined text-lg animate-spin">
                            refresh
                          </span>
                          <span>Processando Cartão com Antifraude...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">lock</span>
                          <span>
                            Pagar R${' '}
                            {basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com
                            Cartão
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* BOLETO TAB CONTENT */}
                {selectedMethod === 'boleto' && (
                  <form onSubmit={handleGenerateBoleto} className="flex flex-col gap-5">
                    <div className="bg-surface-container-low p-5 rounded-xl flex flex-col gap-4 border border-surface-container">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-surface-container text-primary">
                          <span className="material-symbols-outlined text-xl">event_available</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-title-md text-title-md text-on-surface font-semibold">
                            Vencimento em 3 dias úteis
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Após a emissão, você terá até 3 dias úteis para realizar o pagamento em
                            qualquer banco, lotérica ou internet banking.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-surface-container text-primary">
                          <span className="material-symbols-outlined text-xl">send_to_mobile</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-title-md text-title-md text-on-surface font-semibold">
                            Envio Automático por WhatsApp e E-mail
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            O código de barras digitável e a 2ª via em PDF serão disparados
                            imediatamente para o seu contato.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium">
                          CPF ou CNPJ para registro
                        </label>
                        <input
                          type="text"
                          required
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full h-11 px-3 bg-surface-container-low rounded-lg font-numeric-md text-numeric-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-surface-container"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-medium">
                          WhatsApp para envio do PDF
                        </label>
                        <input
                          type="text"
                          required
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="(11) 90000-0000"
                          className="w-full h-11 px-3 bg-surface-container-low rounded-lg font-numeric-md text-numeric-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary border border-surface-container"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full h-12 bg-primary text-on-primary font-headline-sm text-headline-sm rounded-lg shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <span className="material-symbols-outlined text-lg animate-spin">
                            refresh
                          </span>
                          <span>Registrando Boleto na CIP...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-lg">receipt</span>
                          <span>
                            Gerar Boleto Registrado (R${' '}
                            {basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer security trust badges */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2 border-t border-surface-container/60">
                  <div className="flex items-center gap-4 text-on-surface-variant flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        verified_user
                      </span>
                      <span className="font-label-sm text-label-sm">SSL 256 bits</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-secondary">
                        security
                      </span>
                      <span className="font-label-sm text-label-sm">PCI-DSS Level 1</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">sync</span>
                      <span className="font-label-sm text-label-sm">Liquidação D+0</span>
                    </div>
                  </div>

                  <div className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                    <span>Processado com tecnologia</span>
                    <strong className="text-on-surface">NextPay Secure Gateway</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
