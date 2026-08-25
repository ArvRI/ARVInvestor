import React, { useState, useEffect } from "react";
import {
  X,
  Calculator,
  Share2,
  Printer,
  Copy,
  Check,
  Building,
  DollarSign,
  Calendar,
  Sparkles,
  User,
  Phone,
  FileText,
  Save,
} from "lucide-react";
import {
  PricingUnit,
  PriceTable,
  PaymentConditionTemplate,
  SimulatedInstallment,
  CommercialProposal,
} from "../../types/pricing";
import { CUBService, CURRENT_DEFAULT_CUB_SC } from "../../services/pricing/CUBService";

interface SimulateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: PricingUnit | null;
  table: PriceTable;
  onSaveProposal: (proposal: CommercialProposal) => void;
}

export const SimulateProposalModal: React.FC<SimulateProposalModalProps> = ({
  isOpen,
  onClose,
  unit,
  table,
  onSaveProposal,
}) => {
  if (!isOpen || !unit) return null;

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    table.paymentTemplates[0]?.id || "template-padrao-obra"
  );
  const [clientName, setClientName] = useState("Investidor Interessado");
  const [clientPhone, setClientPhone] = useState("(48) 99999-0000");
  const [clientEmail, setClientEmail] = useState("");
  const [brokerName, setBrokerName] = useState("Equipe de Vendas ARV");
  const [realtorAgency, setRealtorAgency] = useState("ARV Incorporadora & Parceiros");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [copiedToClipboard, setCopiedToClipboard] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Custom Condition Overrides
  const activeTemplate =
    table.paymentTemplates.find((t) => t.id === selectedTemplateId) ||
    table.paymentTemplates[0] || {
      id: "custom",
      name: "Personalizada",
      description: "Fluxo customizado",
      isDefault: false,
      downPaymentPercent: 20,
      downPaymentInstallments: 2,
      monthlyInstallmentsCount: 36,
      monthlyInstallmentsPercent: 40,
      balloonInstallmentsCount: 6,
      balloonInstallmentsPercent: 20,
      keysPaymentPercent: 20,
      correctionIndex: "CUB/SC" as const,
      discountForCashPayment: 8,
    };

  const [customDownPercent, setCustomDownPercent] = useState(activeTemplate.downPaymentPercent);
  const [customDownCount, setCustomDownCount] = useState(activeTemplate.downPaymentInstallments);
  const [customMonthlyPercent, setCustomMonthlyPercent] = useState(activeTemplate.monthlyInstallmentsPercent);
  const [customMonthlyCount, setCustomMonthlyCount] = useState(activeTemplate.monthlyInstallmentsCount);
  const [customBalloonPercent, setCustomBalloonPercent] = useState(activeTemplate.balloonInstallmentsPercent);
  const [customBalloonCount, setCustomBalloonCount] = useState(activeTemplate.balloonInstallmentsCount);
  const [customKeysPercent, setCustomKeysPercent] = useState(activeTemplate.keysPaymentPercent);

  useEffect(() => {
    setCustomDownPercent(activeTemplate.downPaymentPercent);
    setCustomDownCount(activeTemplate.downPaymentInstallments);
    setCustomMonthlyPercent(activeTemplate.monthlyInstallmentsPercent);
    setCustomMonthlyCount(activeTemplate.monthlyInstallmentsCount);
    setCustomBalloonPercent(activeTemplate.balloonInstallmentsPercent);
    setCustomBalloonCount(activeTemplate.balloonInstallmentsCount);
    setCustomKeysPercent(activeTemplate.keysPaymentPercent);
  }, [selectedTemplateId]);

  const currentTemplateEffective: PaymentConditionTemplate = {
    ...activeTemplate,
    downPaymentPercent: customDownPercent,
    downPaymentInstallments: customDownCount,
    monthlyInstallmentsPercent: customMonthlyPercent,
    monthlyInstallmentsCount: customMonthlyCount,
    balloonInstallmentsPercent: customBalloonPercent,
    balloonInstallmentsCount: customBalloonCount,
    keysPaymentPercent: customKeysPercent,
  };

  const simulated = CUBService.simulatePaymentSchedule(
    unit.basePrice,
    currentTemplateEffective,
    table.cubReferenceValue,
    discountPercent
  );

  const totalPercentConfigured =
    customDownPercent + customMonthlyPercent + customBalloonPercent + customKeysPercent;

  const handleCopyWhatsApp = () => {
    const text = CUBService.generateWhatsAppProposalText(
      unit,
      table.speName,
      activeTemplate.name,
      simulated,
      clientName,
      table.cubReferenceValue
    );
    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const proposal: CommercialProposal = {
      id: `prop-${Date.now()}`,
      tableId: table.id,
      speId: table.speId,
      speName: table.speName,
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      unitType: unit.type,
      privateAreaM2: unit.privateAreaM2,
      clientName,
      clientPhone,
      clientEmail,
      brokerName,
      realtorAgency,
      cubBaseValue: table.cubReferenceValue,
      totalValueBrl: unit.basePrice,
      totalValueCubs: unit.cubPrice,
      discountAppliedPercent: discountPercent,
      finalValueBrl: simulated.finalPriceBrl,
      finalValueCubs: simulated.finalPriceCubs,
      conditionTemplateName: activeTemplate.name,
      downPaymentValue: simulated.downPaymentValue,
      monthlyCount: customMonthlyCount,
      monthlyValue: simulated.monthlyValue,
      balloonCount: customBalloonCount,
      balloonValue: simulated.balloonValue,
      keysValue: simulated.keysValue,
      installments: simulated.installments,
      validUntil: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      status: "Enviada",
    };

    onSaveProposal(proposal);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const formatBrl = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Simulador de Fluxo Comercial & Proposta de Venda
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {unit.unitNumber} • {unit.type}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {table.speName} • CUB/SC Ref: {formatBrl(table.cubReferenceValue)} / m²
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Imprimir Espelho de Venda"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Top Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white border border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Valor Tabela
              </span>
              <span className="text-base font-black text-white font-mono">{formatBrl(unit.basePrice)}</span>
              <span className="text-[10px] text-slate-300 block">{unit.cubPrice.toFixed(2)} CUBs</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Desconto Aplicado
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <input
                  type="number"
                  step="0.5"
                  max={unit.discountMaxPercent || 10}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs font-bold text-amber-300 text-center"
                />
                <span className="text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Máx autorizado: {unit.discountMaxPercent}%
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Valor Final com Desconto
              </span>
              <span className="text-base font-black text-emerald-300 font-mono">
                {formatBrl(simulated.finalPriceBrl)}
              </span>
              <span className="text-[10px] text-emerald-200/70 block">
                {simulated.finalPriceCubs.toFixed(2)} CUBs / SC
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Preço / m² Efetivo
              </span>
              <span className="text-base font-black text-blue-300 font-mono">
                {formatBrl(simulated.finalPriceBrl / unit.privateAreaM2)}
              </span>
              <span className="text-[10px] text-slate-300 block">
                {unit.privateAreaM2} m² privativos
              </span>
            </div>
          </div>

          {/* Condition Templates Tabs */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              Modelo de Condição de Pagamento
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {table.paymentTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedTemplateId === t.id
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 dark:border-blue-400 text-blue-900 dark:text-blue-200 shadow-xs ring-2 ring-blue-500/20"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="font-bold text-xs line-clamp-1">{t.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {t.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Percentage Adjusters */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider">
                Composição das Parcelas do Fluxo
              </h4>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  totalPercentConfigured === 100
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                }`}
              >
                Soma: {totalPercentConfigured}% {totalPercentConfigured !== 100 && "(Ajuste para 100%)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Down Payment */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-600 dark:text-slate-400 block text-[11px]">
                  Sinal / Entrada ({customDownCount}x)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={customDownPercent}
                    onChange={(e) => setCustomDownPercent(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-center"
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
                <div className="font-bold text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                  {formatBrl(simulated.downPaymentValue)}
                </div>
              </div>

              {/* Monthly */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-600 dark:text-slate-400 block text-[11px]">
                  Mensais ({customMonthlyCount}x)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={customMonthlyPercent}
                    onChange={(e) => setCustomMonthlyPercent(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-center"
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
                <div className="font-bold text-purple-600 dark:text-purple-400 font-mono text-[11px]">
                  {customMonthlyCount}x {formatBrl(simulated.monthlyValue)}
                </div>
              </div>

              {/* Balloons */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-600 dark:text-slate-400 block text-[11px]">
                  Reforços Semestrais ({customBalloonCount}x)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={customBalloonPercent}
                    onChange={(e) => setCustomBalloonPercent(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-center"
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
                <div className="font-bold text-amber-600 dark:text-amber-400 font-mono text-[11px]">
                  {customBalloonCount}x {formatBrl(simulated.balloonValue)}
                </div>
              </div>

              {/* Keys */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-600 dark:text-slate-400 block text-[11px]">
                  Chaves / Saldo Final
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={customKeysPercent}
                    onChange={(e) => setCustomKeysPercent(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded font-bold text-center"
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                  {formatBrl(simulated.keysValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Client & Broker Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Cliente / Investidor
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome completo"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(48) 99999-9999"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Corretor / Imobiliária
              </label>
              <input
                type="text"
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                placeholder="Nome do corretor responsável"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* Simulated Installments Table */}
          <div className="space-y-2">
            <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Cronograma Detalhado de Vencimentos & Indexação CUB
            </h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl max-h-56">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5">Tipo de Parcela</th>
                    <th className="p-2.5">Vencimento</th>
                    <th className="p-2.5 text-right">Valor em R$</th>
                    <th className="p-2.5 text-right">Valor em CUBs</th>
                    <th className="p-2.5 text-right">%</th>
                    <th className="p-2.5">Regra de Correção</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {simulated.installments.map((inst) => (
                    <tr key={inst.number} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                      <td className="p-2.5 font-mono text-slate-400">#{inst.number}</td>
                      <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                        {inst.type}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">
                        {new Date(inst.dueDate).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-2.5 text-right font-black font-mono text-slate-900 dark:text-white">
                        {formatBrl(inst.valueBrl)}
                      </td>
                      <td className="p-2.5 text-right font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {inst.valueCubs.toFixed(2)} CUBs
                      </td>
                      <td className="p-2.5 text-right font-mono text-slate-500">
                        {inst.percentageOfTotal.toFixed(1)}%
                      </td>
                      <td className="p-2.5 text-[11px] text-slate-500">{inst.correctionNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> Proposta salva com sucesso!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                copiedToClipboard
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
              }`}
            >
              {copiedToClipboard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedToClipboard ? "Copiado para o WhatsApp!" : "Copiar Proposta WhatsApp"}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" /> Salvar Proposta Oficial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
