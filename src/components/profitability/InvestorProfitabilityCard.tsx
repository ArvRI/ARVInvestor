import React from "react";
import {
  TrendingUp,
  ShieldCheck,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Info,
  Building,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Contract } from "../../types";

interface InvestorProfitabilityCardProps {
  contractId?: string;
  contract?: Contract;
  compact?: boolean;
}

export const InvestorProfitabilityCard: React.FC<InvestorProfitabilityCardProps> = ({
  contractId,
  contract: propContract,
  compact = false,
}) => {
  const { contracts, spes, getComparisonForContract } = useApp();

  const targetContract =
    propContract ||
    (contractId ? contracts.find((c) => c.id === contractId) : contracts[0]);

  if (!targetContract) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        Nenhum contrato selecionado para análise de rentabilidade.
      </div>
    );
  }

  const comparisonResult = getComparisonForContract(targetContract.id);
  const spe = spes.find((s) => s.id === targetContract.speId);

  if (!comparisonResult) return null;

  const { simulation, comparison } = comparisonResult;
  const isBeatingCDI = comparison.realEstateVsCdiPercentagePoints >= 0;
  const isBeatingIPCA = comparison.realEstateVsIpcaPercentagePoints >= 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatPercent = (val: number, showSign = false) => {
    const formatted = val.toFixed(2).replace(".", ",") + "%";
    if (showSign && val > 0) return `+${formatted}`;
    return formatted;
  };

  if (compact) {
    return (
      <div
        id={`investor-roi-card-${targetContract.id}`}
        className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Rentabilidade vs Mercado
              </div>
              <div className="text-[10px] text-slate-400">
                Desde {targetContract.purchaseDate} ({simulation.horizonMonths}m)
              </div>
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isBeatingCDI
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isBeatingCDI ? "Supera CDI" : "Acompanha Mercado"}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl">
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
              Imóvel ARV
            </div>
            <div className="font-bold text-blue-900 dark:text-blue-100">
              {formatPercent(comparison.realEstateReturnPercentage, true)}
            </div>
          </div>
          <div className="p-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              CDI Período
            </div>
            <div className="font-bold text-amber-900 dark:text-amber-100">
              {formatPercent(comparison.cdiReturnPercentageSamePeriod, true)}
            </div>
          </div>
          <div className="p-2 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl">
            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
              IPCA (Inflação)
            </div>
            <div className="font-bold text-rose-900 dark:text-rose-100">
              {formatPercent(comparison.ipcaReturnPercentageSamePeriod, true)}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Ganho Real (acima da inflação):</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatPercent(comparison.realGainAboveInflationPercentage, true)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`investor-profitability-detailed-${targetContract.id}`}
      className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Comparativo de Desempenho Imobiliário vs Mercado Financeiro
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>Contrato: <strong>{targetContract.contractNumber}</strong> ({spe?.name})</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Adquirido em {targetContract.purchaseDate} ({simulation.horizonMonths} meses de histórico)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              isBeatingCDI
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            {isBeatingCDI ? "Superando o CDI em " + comparison.realEstateVsCdiPercentagePoints.toFixed(1) + " p.p." : "Acompanhando o CDI"}
          </span>
        </div>
      </div>

      {/* Main Comparative Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Imóvel */}
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
          <div className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center justify-between">
            <span>Seu Investimento Imobiliário</span>
            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">ARV</span>
          </div>
          <div className="text-2xl font-bold text-blue-950 dark:text-blue-100 mt-2">
            {formatPercent(comparison.realEstateReturnPercentage, true)}
          </div>
          <div className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1">
            Taxa Anualizada: <strong>{formatPercent(comparison.realEstateAnnualizedPercentage)} a.a.</strong>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/40">
            Patrimônio Projetado: {formatCurrency(targetContract.investedAmount * (1 + comparison.realEstateReturnPercentage / 100))}
          </div>
        </div>

        {/* CDI */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
          <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between">
            <span>Se estivesse no CDI (Renda Fixa)</span>
            <Zap className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-950 dark:text-amber-100 mt-2">
            {formatPercent(comparison.cdiReturnPercentageSamePeriod, true)}
          </div>
          <div className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
            Taxa Anualizada: <strong>{formatPercent(comparison.cdiAnnualizedPercentage || 0)} a.a.</strong>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
            Patrimônio Equivalente: {formatCurrency(targetContract.investedAmount * (1 + comparison.cdiReturnPercentageSamePeriod / 100))}
          </div>
        </div>

        {/* IPCA */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
          <div className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>Inflação IPCA (Perda Monetária)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-950 dark:text-rose-100 mt-2">
            {formatPercent(comparison.ipcaReturnPercentageSamePeriod, true)}
          </div>
          <div className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
            Taxa Anualizada: <strong>{formatPercent(comparison.ipcaAnnualizedPercentage || 0)} a.a.</strong>
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-800/40">
            Ganho Real Acima da Inflação: <strong>{formatPercent(comparison.realGainAboveInflationPercentage, true)}</strong>
          </div>
        </div>
      </div>

      {/* Visual Progress Spread Bars */}
      <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mb-1">
          Comparação Visual de Retornos no Período ({simulation.horizonMonths} meses)
        </div>

        {/* Bar 1: Imóvel */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Imóvel ARV ({spe?.name})
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {formatPercent(comparison.realEstateReturnPercentage, true)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    10,
                    (comparison.realEstateReturnPercentage /
                      Math.max(
                        comparison.realEstateReturnPercentage,
                        comparison.cdiReturnPercentageSamePeriod,
                        1
                      )) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Bar 2: CDI */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Referência CDI (Renda Fixa 100%)
            </span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {formatPercent(comparison.cdiReturnPercentageSamePeriod, true)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    10,
                    (comparison.cdiReturnPercentageSamePeriod /
                      Math.max(
                        comparison.realEstateReturnPercentage,
                        comparison.cdiReturnPercentageSamePeriod,
                        1
                      )) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Bar 3: IPCA */}
        <div className="space-y-1">
          <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Inflação IPCA Oficial
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              {formatPercent(comparison.ipcaReturnPercentageSamePeriod, true)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    10,
                    (comparison.ipcaReturnPercentageSamePeriod /
                      Math.max(
                        comparison.realEstateReturnPercentage,
                        comparison.cdiReturnPercentageSamePeriod,
                        1
                      )) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Explanatory Footer Pill */}
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong>Preservação & Multiplicação Patrimonial:</strong> Seu investimento no contrato{" "}
          <strong>{targetContract.contractNumber}</strong> está proporcionando um retorno real líquido de{" "}
          <strong>{formatPercent(comparison.realGainAboveInflationPercentage, true)}</strong> acima da inflação,
          protegendo seu capital contra a desvalorização da moeda e superando os indexadores tradicionais de mercado.
        </div>
      </div>
    </div>
  );
};
