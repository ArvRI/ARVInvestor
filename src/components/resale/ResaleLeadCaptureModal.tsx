import React, { useState } from "react";
import {
  X,
  Send,
  Building2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Calculator,
  User,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { ResaleListing, ResalePricing, ResalePaymentCondition, ResaleLeadSource } from "../../types";

interface ResaleLeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ResaleListing | null;
  pricing?: ResalePricing;
  conditions?: ResalePaymentCondition[];
  speName?: string;
  onSubmitLead: (data: {
    name: string;
    email: string;
    phone: string;
    message?: string;
    source: ResaleLeadSource;
    preferredConditionId?: string;
    proposedValue?: number;
  }) => void;
}

export const ResaleLeadCaptureModal: React.FC<ResaleLeadCaptureModalProps> = ({
  isOpen,
  onClose,
  listing,
  pricing,
  conditions = [],
  speName,
  onSubmitLead,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedConditionId, setSelectedConditionId] = useState<string>(
    conditions[0]?.id || ""
  );
  const [customProposedValue, setCustomProposedValue] = useState<number>(
    pricing?.resalePrice || 0
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !listing) return null;

  const activePricing = pricing || {
    resalePrice: 0,
    originalTablePrice: 0,
    discountPercentageVsTable: 0,
  };

  const selectedCondition = conditions.find((c) => c.id === selectedConditionId);

  // Cálculo das parcelas conforme a condição selecionada
  const downPayment = selectedCondition
    ? (customProposedValue * selectedCondition.downPaymentPercentage) / 100
    : 0;
  const balance = customProposedValue - downPayment;
  const installmentValue =
    selectedCondition && selectedCondition.numberOfInstallments > 0
      ? balance / selectedCondition.numberOfInstallments
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Por favor, informe seu nome completo.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Por favor, informe um e-mail válido.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Por favor, informe seu telefone / WhatsApp de contato.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      onSubmitLead({
        name,
        email,
        phone,
        message: `${message ? `${message}\n` : ""}Condição: ${
          selectedCondition?.name || "Padrão"
        } | Proposta: R$ ${customProposedValue.toLocaleString("pt-BR")}`,
        source: "Site Público",
        preferredConditionId: selectedConditionId,
        proposedValue: customProposedValue,
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      }, 2000);
    }, 400);
  };

  return (
    <div
      id="modal-resale-lead"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {speName || "Empreendimento ARV"}
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              Manifestar Interesse na Unidade
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Unit Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                  {listing.listingTitle}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Unidade: <strong className="text-slate-700 dark:text-slate-300">{listing.unitId}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Preço de Revenda</span>
                <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                  R$ {activePricing.resalePrice.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            {activePricing.discountPercentageVsTable > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>
                  Desconto de {activePricing.discountPercentageVsTable.toFixed(1)}% em relação à tabela original
                </span>
              </div>
            )}
          </div>

          {/* Condition Simulator */}
          {conditions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-blue-500" />
                Selecione a Condição de Pagamento Desejada:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conditions.map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setSelectedConditionId(cond.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedConditionId === cond.id
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-1 ring-blue-600"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{cond.name}</span>
                      {cond.specialDiscountPercentage > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 px-1.5 py-0.5 rounded">
                          +{cond.specialDiscountPercentage}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {cond.description || `${cond.downPaymentPercentage}% de entrada + ${cond.numberOfInstallments}x (${cond.indexer})`}
                    </p>
                  </button>
                ))}
              </div>

              {/* Simulation Result */}
              {selectedCondition && (
                <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/60 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">Entrada ({selectedCondition.downPaymentPercentage}%)</span>
                    <strong className="text-slate-900 dark:text-white">
                      R$ {downPayment.toLocaleString("pt-BR")}
                    </strong>
                  </div>
                  {selectedCondition.numberOfInstallments > 0 ? (
                    <div className="text-right">
                      <span className="text-slate-500 dark:text-slate-400 block">
                        {selectedCondition.numberOfInstallments}x de ({selectedCondition.indexer})
                      </span>
                      <strong className="text-blue-600 dark:text-blue-400">
                        R$ {Math.round(installmentValue).toLocaleString("pt-BR")}/mês
                      </strong>
                    </div>
                  ) : (
                    <div className="text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      Pagamento Único à Vista
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silveira"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="carlos@exemplo.com.br"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Telefone / WhatsApp *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(48) 99999-0000"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Mensagem ou Proposta Adicional (Opcional)
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Gostaria de agendar uma visita e negociar proposta para pagamento em 12 parcelas..."
                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  isSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md"
                }`}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proposta Enviada com Sucesso!</span>
                  </>
                ) : isSubmitting ? (
                  <span>Registrando Interesse...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Proposta / Falar com Consultor</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Seus dados serão tratados com sigilo e você receberá contato do time ARV em minutos.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
