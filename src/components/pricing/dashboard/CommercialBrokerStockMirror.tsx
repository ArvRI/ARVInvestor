import React, { useState, useMemo } from "react";
import {
  Building2,
  Download,
  Share2,
  Copy,
  Check,
  Search,
  Filter,
  DollarSign,
  Layers,
  Sparkles,
  PhoneCall,
  FileSpreadsheet,
  FileText,
  Compass,
  Car,
  Maximize2,
  Calendar,
  Send,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";
import { PriceTable, PricingUnit } from "../../../types/pricing";
import { CommercialPdfExportService, CommercialReportData } from "../../../services/pricing/commercialPdfExportService";

interface CommercialBrokerStockMirrorProps {
  tables: PriceTable[];
  activeTable: PriceTable | null;
  isConsolidated: boolean;
  units: PricingUnit[];
  simulatedCub: number;
  cubSimVariation: number;
  reportData: CommercialReportData;
  formatCurrency: (val: number) => string;
  formatShortCurrency: (val: number) => string;
  onSimulateUnit?: (unit: PricingUnit) => void;
}

export const CommercialBrokerStockMirror: React.FC<CommercialBrokerStockMirrorProps> = ({
  tables,
  activeTable,
  isConsolidated,
  units,
  simulatedCub,
  cubSimVariation,
  reportData,
  formatCurrency,
  formatShortCurrency,
  onSimulateUnit,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipology, setSelectedTipology] = useState<string>("ALL");
  const [selectedFloorRange, setSelectedFloorRange] = useState<string>("ALL");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "area_asc" | "area_desc" | "floor_asc" | "floor_desc">("price_asc");
  const [copiedUnitId, setCopiedUnitId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isExportingBrokerPdf, setIsExportingBrokerPdf] = useState(false);

  // Filter ONLY available units
  const availableUnits = useMemo(() => {
    return units.filter((u) => u.status === "Disponível");
  }, [units]);

  // Tipology options
  const tipologyOptions = useMemo(() => {
    const set = new Set<string>();
    availableUnits.forEach((u) => {
      if (u.type) set.add(u.type);
    });
    return Array.from(set);
  }, [availableUnits]);

  // Filtered and sorted units
  const filteredUnits = useMemo(() => {
    let list = [...availableUnits];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (u) =>
          u.unitNumber.toLowerCase().includes(q) ||
          (u.type && u.type.toLowerCase().includes(q)) ||
          (u.floorName && u.floorName.toLowerCase().includes(q)) ||
          (u.solarOrientation && u.solarOrientation.toLowerCase().includes(q))
      );
    }

    if (selectedTipology !== "ALL") {
      list = list.filter((u) => u.type === selectedTipology);
    }

    if (selectedFloorRange !== "ALL") {
      if (selectedFloorRange === "baixo") {
        list = list.filter((u) => (u.floor || 0) <= 5);
      } else if (selectedFloorRange === "medio") {
        list = list.filter((u) => (u.floor || 0) > 5 && (u.floor || 0) <= 12);
      } else if (selectedFloorRange === "alto") {
        list = list.filter((u) => (u.floor || 0) > 12);
      }
    }

    if (selectedPriceRange !== "ALL") {
      if (selectedPriceRange === "ate_800k") {
        list = list.filter((u) => u.basePrice <= 800000);
      } else if (selectedPriceRange === "800k_1200k") {
        list = list.filter((u) => u.basePrice > 800000 && u.basePrice <= 1200000);
      } else if (selectedPriceRange === "1200k_1800k") {
        list = list.filter((u) => u.basePrice > 1200000 && u.basePrice <= 1800000);
      } else if (selectedPriceRange === "acima_1800k") {
        list = list.filter((u) => u.basePrice > 1800000);
      }
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "price_asc") return a.basePrice - b.basePrice;
      if (sortBy === "price_desc") return b.basePrice - a.basePrice;
      if (sortBy === "area_asc") return (a.privateAreaM2 || 0) - (b.privateAreaM2 || 0);
      if (sortBy === "area_desc") return (b.privateAreaM2 || 0) - (a.privateAreaM2 || 0);
      if (sortBy === "floor_asc") return (a.floor || 0) - (b.floor || 0);
      if (sortBy === "floor_desc") return (b.floor || 0) - (a.floor || 0);
      return 0;
    });

    return list;
  }, [availableUnits, searchTerm, selectedTipology, selectedFloorRange, selectedPriceRange, sortBy]);

  // Statistics for brokers
  const totalStockVgv = availableUnits.reduce((acc, u) => acc + u.basePrice, 0);
  const minPrice = availableUnits.length > 0 ? Math.min(...availableUnits.map((u) => u.basePrice)) : 0;
  const maxPrice = availableUnits.length > 0 ? Math.max(...availableUnits.map((u) => u.basePrice)) : 0;
  const avgStockPriceM2 = useMemo(() => {
    const totalArea = availableUnits.reduce((acc, u) => acc + (u.privateAreaM2 || 0), 0);
    return totalArea > 0 ? totalStockVgv / totalArea : 0;
  }, [availableUnits, totalStockVgv]);

  const minAto = availableUnits.length > 0
    ? Math.min(...availableUnits.map((u) => u.downPaymentAto || u.basePrice * 0.12))
    : 0;
  const minMonthly = availableUnits.length > 0
    ? Math.min(...availableUnits.map((u) => u.monthlyInstallment40x || (u.basePrice * 0.15) / 40))
    : 0;

  // Chart 1: Available Units by Typology
  const chartByTipology = useMemo(() => {
    const map: Record<string, { type: string; count: number; vgv: number; minPrice: number; avgArea: number }> = {};
    availableUnits.forEach((u) => {
      const t = u.type || "Outros";
      if (!map[t]) {
        map[t] = { type: t, count: 0, vgv: 0, minPrice: u.basePrice, avgArea: 0 };
      }
      map[t].count += 1;
      map[t].vgv += u.basePrice;
      map[t].minPrice = Math.min(map[t].minPrice, u.basePrice);
      map[t].avgArea += u.privateAreaM2 || 0;
    });

    return Object.values(map).map((item) => ({
      ...item,
      avgTicket: item.count > 0 ? item.vgv / item.count : 0,
      avgArea: item.count > 0 ? item.avgArea / item.count : 0,
    }));
  }, [availableUnits]);

  // Chart 2: Price Range Distribution
  const chartPriceRanges = useMemo(() => {
    const brackets = [
      { name: "Até R$ 800k", min: 0, max: 800000, count: 0, color: "#10b981" },
      { name: "R$ 800k - 1.2M", min: 800000, max: 1200000, count: 0, color: "#6366f1" },
      { name: "R$ 1.2M - 1.8M", min: 1200000, max: 1800000, count: 0, color: "#f59e0b" },
      { name: "Acima R$ 1.8M", min: 1800000, max: Infinity, count: 0, color: "#8b5cf6" },
    ];

    availableUnits.forEach((u) => {
      for (const b of brackets) {
        if (u.basePrice > b.min && u.basePrice <= b.max) {
          b.count += 1;
          break;
        }
      }
    });

    return brackets.filter((b) => b.count > 0);
  }, [availableUnits]);

  // Chart 3: Stock by Floor
  const chartByFloor = useMemo(() => {
    const floorMap: Record<number, { floor: number; floorName: string; count: number; vgv: number }> = {};
    availableUnits.forEach((u) => {
      const f = u.floor || 1;
      if (!floorMap[f]) {
        floorMap[f] = { floor: f, floorName: u.floorName || `${f}° Andar`, count: 0, vgv: 0 };
      }
      floorMap[f].count += 1;
      floorMap[f].vgv += u.basePrice;
    });

    return Object.values(floorMap).sort((a, b) => a.floor - b.floor);
  }, [availableUnits]);

  // Copy unit summary to clipboard for WhatsApp
  const handleCopyUnitWhatsApp = (unit: PricingUnit) => {
    const price = unit.basePrice;
    const ato = unit.downPaymentAto || price * 0.12;
    const monthly = unit.monthlyInstallment40x || (price * 0.15) / 40;
    const balloon = unit.balloonInstallment6x || (price * 0.08) / 6;
    const keys = unit.finalInstallment || price * 0.05;
    const financing = unit.financingBalance || price * 0.60;
    const priceM2 = unit.privateAreaM2 > 0 ? price / unit.privateAreaM2 : 0;
    const projectName = isConsolidated ? "ARV Empreendimentos" : (activeTable?.name || "ARV Inc.");

    const text = `🏢 *${projectName} - UNIDADE ${unit.unitNumber} DISPONÍVEL*
📍 *Pavimento:* ${unit.floorName || `${unit.floor}° Andar`}
📐 *Área Privativa:* ${(unit.privateAreaM2 || 0).toFixed(2)} m²
🛋️ *Tipologia:* ${unit.type || "Padrão"}
🚗 *Vaga de Garagem:* ${unit.garageType || "1 Vaga"}
☀️ *Posição Solar / Vista:* ${unit.solarOrientation || unit.position || "Excelente Posição"}

💰 *VALOR DE TABELA:* ${formatCurrency(price)}
🏷️ *Valor/m²:* ${formatCurrency(priceM2)}

📋 *CONDIÇÃO FACILITADA DE PAGAMENTO:*
• *Sinal / Ato (12%):* ${formatCurrency(ato)}
• *40x Mensais:* ${formatCurrency(monthly)} / mês (durante a obra)
• *6x Balões Semestrais:* ${formatCurrency(balloon)}
• *Chaves (5%):* ${formatCurrency(keys)}
• *Saldo Financiamento (60%):* ${formatCurrency(financing)}

_Correção monetária CUB/SC durante a obra. Sujeito a disponibilidade._
📞 *Solicite sua proposta com a ARV Empreendimentos!*`;

    navigator.clipboard.writeText(text);
    setCopiedUnitId(unit.id);
    setTimeout(() => setCopiedUnitId(null), 3000);
  };

  // Copy general stock overview to WhatsApp
  const handleCopyGeneralStockWhatsApp = () => {
    const projectName = isConsolidated ? "PORTFÓLIO GERAL ARV" : (activeTable?.name || "ARV Inc.");
    const dateStr = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date());

    let text = `🌟 *ESPELHO DE ESTOQUE DISPONÍVEL • ${projectName}* 🌟
📅 *Atualizado em:* ${dateStr}
📊 *Total de Unidades Disponíveis:* ${availableUnits.length} un.
💎 *Valores a partir de:* ${formatCurrency(minPrice)}
🔑 *Entrada (Ato 12%) a partir de:* ${formatCurrency(minAto)}
🏗️ *40x Mensais da Obra a partir de:* ${formatCurrency(minMonthly)}

📋 *DESTAQUES DE DISPONIBILIDADE POR TIPOLOGIA:*\n`;

    chartByTipology.forEach((t) => {
      text += `• *${t.type}:* ${t.count} un. disponíveis | A partir de ${formatCurrency(t.minPrice)}\n`;
    });

    text += `\n📲 *Consulte as plantas, fluxo detalhado e simulações personalizadas no sistema ARV!*`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Export Broker PDF
  const handleExportBrokerPDF = () => {
    setIsExportingBrokerPdf(true);
    try {
      CommercialPdfExportService.generateBrokerAvailabilityMirrorPDF(reportData, {
        fileName: `ESPELHO_ESTOQUE_CORRETORES_${isConsolidated ? "GERAL" : (activeTable?.speName || "ARV").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
      });
    } catch (e) {
      console.error("Error generating broker PDF:", e);
    } finally {
      setIsExportingBrokerPdf(false);
    }
  };

  // Export Broker XLSX
  const handleExportBrokerXLSX = () => {
    const dataRows = availableUnits.map((u) => {
      const price = u.basePrice;
      return {
        "Empreendimento": isConsolidated ? (tables.find((t) => t.id === u.tableId)?.name || "ARV") : (activeTable?.name || "ARV"),
        "Unidade": u.unitNumber,
        "Pavimento": u.floorName || `${u.floor}° Pav.`,
        "Tipologia": u.type || "-",
        "Área Privativa (m²)": u.privateAreaM2 || 0,
        "Vaga Garagem": u.garageType || "Padrão",
        "Posição Solar": u.solarOrientation || u.position || "-",
        "Preço de Tabela (R$)": price,
        "Preço/m² (R$)": u.privateAreaM2 > 0 ? price / u.privateAreaM2 : 0,
        "Sinal / Ato (12%)": u.downPaymentAto || price * 0.12,
        "40x Mensais (R$)": u.monthlyInstallment40x || (price * 0.15) / 40,
        "6x Balões Semestrais (R$)": u.balloonInstallment6x || (price * 0.08) / 6,
        "Chaves (5%)": u.finalInstallment || price * 0.05,
        "Financiamento Bancário (60%)": u.financingBalance || price * 0.60,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Espelho_Estoque_Corretores");
    XLSX.writeFile(workbook, `ESPELHO_ESTOQUE_CORRETORES_${isConsolidated ? "GERAL" : (activeTable?.speName || "ARV").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner for Brokers */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 rounded-3xl border border-emerald-500/30 p-6 shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Material Oficial de Apoio Comercial
              </span>
              <span className="text-xs text-slate-400">
                {isConsolidated ? "Portfólio Geral Multi-SPE" : `SPE: ${activeTable?.speName || "ARV"}`}
              </span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Espelho de Estoque & Disponibilidade
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Tabela de vendas em tempo real para corretores e imobiliárias com fluxo de pagamento padronizado (Ato 12%, 40x Mensais, 6x Balões, 5% Chaves e 60% Financiamento).
            </p>
          </div>

          {/* Action Buttons for Brokers */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyGeneralStockWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Resumo Copiado!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Copiar Resumo WhatsApp</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExportBrokerPDF}
              disabled={isExportingBrokerPdf || availableUnits.length === 0}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{isExportingBrokerPdf ? "Gerando PDF..." : "Exportar PDF Corretores"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportBrokerXLSX}
              disabled={availableUnits.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar .XLSX</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Broker Highlight Cards (6 Key Numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Unidades em Estoque
          </span>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {availableUnits.length} <span className="text-xs font-bold text-slate-400">un.</span>
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Prontas para venda</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            VGV Disponível
          </span>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {formatShortCurrency(totalStockVgv)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">{formatCurrency(totalStockVgv)}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Menor Preço
          </span>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            {formatCurrency(minPrice)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">A partir de</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Entrada (12% Ato)
          </span>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400">
            {formatCurrency(minAto)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Ato mínimo</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            40x Mensais Obra
          </span>
          <p className="text-xl font-black text-purple-600 dark:text-purple-400">
            {formatCurrency(minMonthly)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Parcela mínima</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Preço Médio / m²
          </span>
          <p className="text-xl font-black text-sky-600 dark:text-sky-400">
            {formatCurrency(avgStockPriceM2)}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {(simulatedCub > 0 ? avgStockPriceM2 / simulatedCub : 0).toFixed(2)} CUBs/m²
          </span>
        </div>
      </div>

      {/* 3. Visual Charts for Broker Stock (2 Charts: Typology & Price Range) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Typology breakdown for brokers */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                Estoque Disponível por Tipologia
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quantidade de unidades e menor valor de entrada para apresentar ao cliente
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {availableUnits.length} un. disponíveis
            </span>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartByTipology} margin={{ top: 15, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                <XAxis
                  dataKey="type"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    if (name === "Unidades Disponíveis") return [`${val} unidades`, name];
                    return [formatCurrency(Number(val)), name];
                  }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar yAxisId="left" dataKey="count" name="Unidades Disponíveis" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {chartByTipology.map((t) => (
              <div key={t.type} className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{t.type}</span>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t.count} un.</span>
                  <span className="text-slate-500 dark:text-slate-400">A partir de {formatShortCurrency(t.minPrice)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Price Bracket Distribution */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                Faixas de Preço do Estoque
              </h3>
              <span className="text-xs text-slate-400">{availableUnits.length} un.</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribuição dos tickets para qualificação do perfil do comprador
            </p>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartPriceRanges}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {chartPriceRanges.map((entry, index) => (
                    <Cell key={`cell-bracket-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} unidades`, "Estoque"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {chartPriceRanges.map((b) => (
              <div key={b.name} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold block truncate">{b.name}</span>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white">{b.count} un. ({((b.count / (availableUnits.length || 1)) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar unidade (ex: 101, 302, 3 Quartos, Norte)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tipology select */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Tipo:</span>
              <select
                value={selectedTipology}
                onChange={(e) => setSelectedTipology(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value="ALL">Todas Tipologias</option>
                {tipologyOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Floor select */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Andar:</span>
              <select
                value={selectedFloorRange}
                onChange={(e) => setSelectedFloorRange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value="ALL">Todos Andares</option>
                <option value="baixo">Pav. Baixo (1° a 5°)</option>
                <option value="medio">Pav. Médio (6° a 12°)</option>
                <option value="alto">Pav. Alto (13°+)</option>
              </select>
            </div>

            {/* Price range */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Faixa:</span>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value="ALL">Todos os Preços</option>
                <option value="ate_800k">Até R$ 800 mil</option>
                <option value="800k_1200k">R$ 800k a R$ 1.2M</option>
                <option value="1200k_1800k">R$ 1.2M a R$ 1.8M</option>
                <option value="acima_1800k">Acima de R$ 1.8M</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
              >
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="area_asc">Menor Área (m²)</option>
                <option value="area_desc">Maior Área (m²)</option>
                <option value="floor_asc">Menor Andar</option>
                <option value="floor_desc">Maior Andar</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Exibindo <strong>{filteredUnits.length}</strong> de <strong>{availableUnits.length}</strong> unidades disponíveis</span>
          {searchTerm || selectedTipology !== "ALL" || selectedFloorRange !== "ALL" || selectedPriceRange !== "ALL" ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedTipology("ALL");
                setSelectedFloorRange("ALL");
                setSelectedPriceRange("ALL");
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>

      {/* 5. Detailed Cards Grid / List for Brokers */}
      <div className="space-y-3">
        {filteredUnits.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Nenhuma unidade disponível encontrada</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Tente ajustar seus termos de busca ou filtros de tipologia, andar e faixa de preço.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUnits.map((unit) => {
              const price = unit.basePrice;
              const ato = unit.downPaymentAto || price * 0.12;
              const monthly = unit.monthlyInstallment40x || (price * 0.15) / 40;
              const balloon = unit.balloonInstallment6x || (price * 0.08) / 6;
              const keys = unit.finalInstallment || price * 0.05;
              const financing = unit.financingBalance || price * 0.60;
              const priceM2 = unit.privateAreaM2 > 0 ? price / unit.privateAreaM2 : 0;
              const isCopied = copiedUnitId === unit.id;

              return (
                <div
                  key={unit.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Unit Number & Status Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          Unidade {unit.unitNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {unit.floorName || `${unit.floor}° Pavimento`}
                        </span>
                      </div>
                      <span className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Disponível
                      </span>
                    </div>

                    {/* Specs chips */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 mb-4">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                        {unit.type || "Padrão"}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        <Maximize2 className="w-3 h-3 text-slate-400" />
                        {(unit.privateAreaM2 || 0).toFixed(2)} m²
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        <Car className="w-3 h-3 text-slate-400" />
                        {unit.garageType || "1 Vaga"}
                      </span>
                      {unit.solarOrientation && (
                        <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          <Compass className="w-3 h-3 text-amber-500" />
                          {unit.solarOrientation}
                        </span>
                      )}
                    </div>

                    {/* Price Card */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 mb-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                          Valor de Tabela
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          {formatCurrency(priceM2)}/m²
                        </span>
                      </div>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                        {formatCurrency(price)}
                      </p>
                    </div>

                    {/* Payment breakdown */}
                    <div className="space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 mb-4">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-[11px] font-medium">• Ato / Entrada (12%):</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(ato)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-[11px] font-medium">• 40x Mensais da Obra:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(monthly)} / mês</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-[11px] font-medium">• 6x Balões Semestrais:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(balloon)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-[11px] font-medium">• Chaves (5%):</span>
                        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(keys)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span className="text-[11px] font-medium">• Financiamento (60%):</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(financing)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Broker */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleCopyUnitWhatsApp(unit)}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado p/ WhatsApp!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Copiar p/ WhatsApp</span>
                        </>
                      )}
                    </button>

                    {onSimulateUnit && (
                      <button
                        type="button"
                        onClick={() => onSimulateUnit(unit)}
                        className="py-2 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                        title="Simular Proposta Comercial"
                      >
                        Simular
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
