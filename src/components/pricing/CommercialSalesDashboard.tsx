import React, { useState, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Layers,
  BarChart3,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Printer,
  Sparkles,
  Calculator,
  ChevronRight,
  Zap,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Loader2,
  Tag,
} from "lucide-react";
import * as XLSX from "xlsx";
import { PriceTable, PricingUnit, UnitStatus, CommercialProposal } from "../../types/pricing";
import { CUBService, CURRENT_DEFAULT_CUB_SC } from "../../services/pricing/CUBService";
import { CommercialPdfExportService } from "../../services/pricing/commercialPdfExportService";
import { CommercialEmpreendimentoSelector } from "./dashboard/CommercialEmpreendimentoSelector";
import { CommercialChartControls, ChartViewTab, ChartMetric } from "./dashboard/CommercialChartControls";
import { CommercialChartsSection } from "./dashboard/CommercialChartsSection";

interface CommercialSalesDashboardProps {
  tables: PriceTable[];
  units: PricingUnit[];
  proposals?: CommercialProposal[];
  currentTableId?: string;
  onSelectTable?: (tableId: string) => void;
  onNavigateToTable?: (tableId: string) => void;
  onSimulateUnit?: (unit: PricingUnit) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Disponível: "#10b981", // emerald-500
  Vendida: "#6366f1", // indigo-500
  Reservada: "#f59e0b", // amber-500
  Bloqueada: "#ef4444", // rose-500
  Permuta: "#8b5cf6", // purple-500
};

export const CommercialSalesDashboard: React.FC<CommercialSalesDashboardProps> = ({
  tables,
  units,
  proposals = [],
  currentTableId,
  onSelectTable,
  onNavigateToTable,
  onSimulateUnit,
}) => {
  // Selection State: array of selected table IDs (e.g. ["ALL"], or ["tab-grid-2026-v1", "tab-meridiem-2026-v2"])
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>(
    currentTableId ? [currentTableId] : ["ALL"]
  );
  const [isMultiSelect, setIsMultiSelect] = useState<boolean>(false);

  // Chart Controls State
  const [activeChartTab, setActiveChartTab] = useState<ChartViewTab>("geral");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("vgv");
  const [selectedStatuses, setSelectedStatuses] = useState<UnitStatus[]>([
    "Disponível",
    "Vendida",
    "Reservada",
    "Bloqueada",
  ]);
  const [selectedTipologies, setSelectedTipologies] = useState<string[]>([]);

  // Simulation & Export State
  const [cubSimVariation, setCubSimVariation] = useState<number>(0);
  const [showSimulatorPanel, setShowSimulatorPanel] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Synchronize when currentTableId changes externally if not in ALL mode
  React.useEffect(() => {
    if (currentTableId && !selectedTableIds.includes("ALL") && !selectedTableIds.includes(currentTableId)) {
      setSelectedTableIds([currentTableId]);
    }
  }, [currentTableId]);

  // Is Consolidated View (either "ALL" is selected, or all individual tables are selected)
  const isConsolidated =
    selectedTableIds.includes("ALL") ||
    selectedTableIds.length === 0 ||
    selectedTableIds.length === tables.length;

  // Active single table (if exactly 1 table is selected and not consolidated)
  const activeTable = useMemo(() => {
    if (isConsolidated || selectedTableIds.length !== 1) return null;
    return tables.find((t) => t.id === selectedTableIds[0]) || null;
  }, [tables, selectedTableIds, isConsolidated]);

  // Relevant Units for Selected Empreendimento(s)
  const relevantUnits = useMemo(() => {
    if (isConsolidated) return units;
    return units.filter((u) => selectedTableIds.includes(u.tableId));
  }, [units, selectedTableIds, isConsolidated]);

  // Available Tipologies for Selected Empreendimentos
  const availableTipologies = useMemo(() => {
    const set = new Set<string>();
    relevantUnits.forEach((u) => {
      if (u.type) set.add(u.type);
    });
    return Array.from(set);
  }, [relevantUnits]);

  // Effective CUB calculation
  const baseCub = activeTable?.cubReferenceValue || CURRENT_DEFAULT_CUB_SC;
  const simulatedCub = baseCub * (1 + cubSimVariation / 100);
  const cubMultiplier = simulatedCub / baseCub;

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatShortCurrency = (val: number) => {
    if (val >= 1000000) {
      return `R$ ${(val / 1000000).toFixed(2)}M`;
    }
    if (val >= 1000) {
      return `R$ ${(val / 1000).toFixed(0)}k`;
    }
    return formatCurrency(val);
  };

  // Selection handlers
  const handleSelectSingleTable = (tableId: string) => {
    setSelectedTableIds([tableId]);
    if (tableId !== "ALL" && onSelectTable) {
      onSelectTable(tableId);
    }
  };

  const handleToggleTableSelection = (tableId: string) => {
    if (selectedTableIds.includes("ALL")) {
      setSelectedTableIds([tableId]);
      return;
    }

    if (selectedTableIds.includes(tableId)) {
      const remaining = selectedTableIds.filter((id) => id !== tableId);
      setSelectedTableIds(remaining.length === 0 ? ["ALL"] : remaining);
    } else {
      setSelectedTableIds([...selectedTableIds, tableId]);
    }
  };

  const handleSelectAllTables = () => {
    if (isConsolidated) {
      setSelectedTableIds(tables.length > 0 ? [tables[0].id] : ["ALL"]);
    } else {
      setSelectedTableIds(["ALL"]);
    }
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelect(!isMultiSelect);
    if (!isMultiSelect && selectedTableIds.includes("ALL")) {
      setSelectedTableIds(tables.map((t) => t.id));
    }
  };

  // Status & Tipology filter handlers
  const handleToggleStatus = (status: UnitStatus) => {
    if (selectedStatuses.includes(status)) {
      if (selectedStatuses.length > 1) {
        setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
      }
    } else {
      setSelectedStatuses([...selectedStatuses, status]);
    }
  };

  const handleToggleTipology = (type: string) => {
    if (selectedTipologies.includes(type)) {
      setSelectedTipologies(selectedTipologies.filter((t) => t !== type));
    } else {
      setSelectedTipologies([...selectedTipologies, type]);
    }
  };

  const handleSelectAllTipologies = () => {
    setSelectedTipologies([]);
  };

  // =========================================================================
  // 1. HIGH LEVEL COMMERCIAL KPIS
  // =========================================================================
  const kpis = useMemo(() => {
    const totalUnits = relevantUnits.length;
    const soldUnits = relevantUnits.filter((u) => u.status === "Vendida");
    const availableUnits = relevantUnits.filter((u) => u.status === "Disponível");
    const reservedUnits = relevantUnits.filter((u) => u.status === "Reservada");
    const blockedUnits = relevantUnits.filter((u) => u.status === "Bloqueada" || u.status === "Permuta");

    const totalVgv = relevantUnits.reduce(
      (sum, u) => sum + u.basePrice * (u.status === "Disponível" ? cubMultiplier : 1),
      0
    );
    const soldVgv = soldUnits.reduce((sum, u) => sum + u.basePrice, 0);
    const availableVgv = availableUnits.reduce((sum, u) => sum + u.basePrice * cubMultiplier, 0);
    const reservedVgv = reservedUnits.reduce((sum, u) => sum + u.basePrice * cubMultiplier, 0);

    const vsoUnitsPercent = totalUnits > 0 ? (soldUnits.length / totalUnits) * 100 : 0;
    const vsoVgvPercent = totalVgv > 0 ? (soldVgv / totalVgv) * 100 : 0;

    const totalArea = relevantUnits.reduce((sum, u) => sum + (u.privateAreaM2 || 0), 0);
    const soldArea = soldUnits.reduce((sum, u) => sum + (u.privateAreaM2 || 0), 0);
    const availableArea = availableUnits.reduce((sum, u) => sum + (u.privateAreaM2 || 0), 0);

    const avgPriceM2 = totalArea > 0 ? totalVgv / totalArea : 0;
    const avgSoldPriceM2 = soldArea > 0 ? soldVgv / soldArea : 0;
    const avgAvailablePriceM2 = availableArea > 0 ? availableVgv / availableArea : 0;

    const avgCubM2 = simulatedCub > 0 ? avgPriceM2 / simulatedCub : 0;

    const ticketMedio = totalUnits > 0 ? totalVgv / totalUnits : 0;
    const ticketMedioVendido = soldUnits.length > 0 ? soldVgv / soldUnits.length : 0;
    const ticketMedioDisponivel = availableUnits.length > 0 ? availableVgv / availableUnits.length : 0;

    // Projected Cash Flow Structure (Receivables)
    const atoReceivables = relevantUnits.reduce((sum, u) => {
      const p = u.basePrice * (u.status === "Disponível" ? cubMultiplier : 1);
      return sum + (u.downPaymentAto ? u.downPaymentAto * cubMultiplier : p * 0.12);
    }, 0);

    const monthlyReceivables = relevantUnits.reduce((sum, u) => {
      const p = u.basePrice * (u.status === "Disponível" ? cubMultiplier : 1);
      return sum + (u.monthlyInstallment40x ? u.monthlyInstallment40x * 40 * cubMultiplier : p * 0.15);
    }, 0);

    const balloonReceivables = relevantUnits.reduce((sum, u) => {
      const p = u.basePrice * (u.status === "Disponível" ? cubMultiplier : 1);
      return sum + (u.balloonInstallment6x ? u.balloonInstallment6x * 6 * cubMultiplier : p * 0.08);
    }, 0);

    const finalInstallmentReceivables = relevantUnits.reduce((sum, u) => {
      const p = u.basePrice * (u.status === "Disponível" ? cubMultiplier : 1);
      return sum + (u.finalInstallment ? u.finalInstallment * cubMultiplier : p * 0.05);
    }, 0);

    const financingReceivables = relevantUnits.reduce((sum, u) => {
      const p = u.basePrice * (u.status === "Disponível" ? cubMultiplier : 1);
      return sum + (u.financingBalance ? u.financingBalance * cubMultiplier : p * 0.60);
    }, 0);

    const obraReceivables =
      atoReceivables + monthlyReceivables + balloonReceivables + finalInstallmentReceivables;

    return {
      totalUnits,
      soldCount: soldUnits.length,
      availableCount: availableUnits.length,
      reservedCount: reservedUnits.length,
      blockedCount: blockedUnits.length,
      totalVgv,
      soldVgv,
      availableVgv,
      reservedVgv,
      vsoUnitsPercent,
      vsoVgvPercent,
      totalArea,
      soldArea,
      availableArea,
      avgPriceM2,
      avgSoldPriceM2,
      avgAvailablePriceM2,
      avgCubM2,
      ticketMedio,
      ticketMedioVendido,
      ticketMedioDisponivel,
      atoReceivables,
      monthlyReceivables,
      balloonReceivables,
      finalInstallmentReceivables,
      financingReceivables,
      obraReceivables,
    };
  }, [relevantUnits, simulatedCub, cubMultiplier]);

  // =========================================================================
  // 2. CHART FILTERED UNITS (Filtered by Status & Tipology)
  // =========================================================================
  const chartFilteredUnits = useMemo(() => {
    return relevantUnits.filter((u) => {
      const matchStatus = selectedStatuses.includes(u.status);
      const matchTipology =
        selectedTipologies.length === 0 || selectedTipologies.includes(u.type || "Outro");
      return matchStatus && matchTipology;
    });
  }, [relevantUnits, selectedStatuses, selectedTipologies]);

  // =========================================================================
  // 3. BREAKDOWN POR STATUS (DONUT CHART)
  // =========================================================================
  const statusChartData = useMemo(() => {
    const map: Record<string, { count: number; vgv: number }> = {
      Disponível: { count: 0, vgv: 0 },
      Vendida: { count: 0, vgv: 0 },
      Reservada: { count: 0, vgv: 0 },
      Bloqueada: { count: 0, vgv: 0 },
    };

    chartFilteredUnits.forEach((u) => {
      const st = u.status === "Permuta" ? "Bloqueada" : u.status;
      if (!map[st]) map[st] = { count: 0, vgv: 0 };
      map[st].count += 1;
      map[st].vgv += u.basePrice * (u.status === "Disponível" ? cubMultiplier : 1);
    });

    const totalFilteredVgv = Object.values(map).reduce((sum, item) => sum + item.vgv, 0);

    return Object.keys(map)
      .filter((k) => map[k].count > 0)
      .map((k) => ({
        name: k,
        value: map[k].vgv,
        count: map[k].count,
        percent: totalFilteredVgv > 0 ? (map[k].vgv / totalFilteredVgv) * 100 : 0,
        color: STATUS_COLORS[k] || "#94a3b8",
      }));
  }, [chartFilteredUnits, cubMultiplier]);

  // =========================================================================
  // 4. BREAKDOWN POR TIPOLOGIA (BAR & COMPARISON)
  // =========================================================================
  const tipologySummary = useMemo(() => {
    const map: Record<
      string,
      {
        type: string;
        totalUnits: number;
        soldUnits: number;
        availableUnits: number;
        reservedUnits: number;
        totalVgv: number;
        soldVgv: number;
        availableVgv: number;
        totalArea: number;
        soldArea: number;
        availableArea: number;
      }
    > = {};

    chartFilteredUnits.forEach((u) => {
      const t = u.type || "Outro";
      if (!map[t]) {
        map[t] = {
          type: t,
          totalUnits: 0,
          soldUnits: 0,
          availableUnits: 0,
          reservedUnits: 0,
          totalVgv: 0,
          soldVgv: 0,
          availableVgv: 0,
          totalArea: 0,
          soldArea: 0,
          availableArea: 0,
        };
      }
      map[t].totalUnits += 1;
      map[t].totalArea += u.privateAreaM2 || 0;
      const price = u.basePrice * (u.status === "Disponível" ? cubMultiplier : 1);
      map[t].totalVgv += price;

      if (u.status === "Vendida") {
        map[t].soldUnits += 1;
        map[t].soldVgv += u.basePrice;
        map[t].soldArea += u.privateAreaM2 || 0;
      } else if (u.status === "Disponível") {
        map[t].availableUnits += 1;
        map[t].availableVgv += price;
        map[t].availableArea += u.privateAreaM2 || 0;
      } else if (u.status === "Reservada") {
        map[t].reservedUnits += 1;
      }
    });

    return Object.values(map)
      .map((item) => {
        const vsoPercent = item.totalUnits > 0 ? (item.soldUnits / item.totalUnits) * 100 : 0;
        const avgPriceM2 = item.totalArea > 0 ? item.totalVgv / item.totalArea : 0;
        const avgTicket = item.totalUnits > 0 ? item.totalVgv / item.totalUnits : 0;
        const avgArea = item.totalUnits > 0 ? item.totalArea / item.totalUnits : 0;
        const avgCubM2 = simulatedCub > 0 ? avgPriceM2 / simulatedCub : 0;

        return {
          ...item,
          vsoPercent,
          avgPriceM2,
          avgTicket,
          avgArea,
          avgCubM2,
        };
      })
      .sort((a, b) => b.totalVgv - a.totalVgv);
  }, [chartFilteredUnits, cubMultiplier, simulatedCub]);

  // =========================================================================
  // 5. BREAKDOWN POR PAVIMENTO / ANDAR
  // =========================================================================
  const floorSummary = useMemo(() => {
    const map: Record<
      string,
      {
        floorName: string;
        floorNum: number;
        totalUnits: number;
        soldUnits: number;
        availableUnits: number;
        totalVgv: number;
        soldVgv: number;
        availableVgv: number;
      }
    > = {};

    chartFilteredUnits.forEach((u) => {
      const fName = u.floorName || `${u.floor}° Pavimento`;
      const fNum = u.floor || 0;
      if (!map[fName]) {
        map[fName] = {
          floorName: fName,
          floorNum: fNum,
          totalUnits: 0,
          soldUnits: 0,
          availableUnits: 0,
          totalVgv: 0,
          soldVgv: 0,
          availableVgv: 0,
        };
      }
      map[fName].totalUnits += 1;
      const price = u.basePrice * (u.status === "Disponível" ? cubMultiplier : 1);
      map[fName].totalVgv += price;

      if (u.status === "Vendida") {
        map[fName].soldUnits += 1;
        map[fName].soldVgv += u.basePrice;
      } else if (u.status === "Disponível") {
        map[fName].availableUnits += 1;
        map[fName].availableVgv += price;
      }
    });

    return Object.values(map).sort((a, b) => a.floorNum - b.floorNum);
  }, [chartFilteredUnits, cubMultiplier]);

  // =========================================================================
  // 6. COMPARATIVO CONSOLIDADO ENTRE EMPREENDIMENTOS (SPEs)
  // =========================================================================
  const speComparisonData = useMemo(() => {
    const activeTables = isConsolidated
      ? tables
      : tables.filter((t) => selectedTableIds.includes(t.id));

    return activeTables.map((t) => {
      const tableUnits = units.filter((u) => u.tableId === t.id);
      const totalUnits = tableUnits.length || t.totalUnitsCount;
      const soldUnits = tableUnits.filter((u) => u.status === "Vendida").length || t.soldUnitsCount;
      const availableUnits =
        tableUnits.filter((u) => u.status === "Disponível").length || t.availableUnitsCount;
      const reservedUnits =
        tableUnits.filter((u) => u.status === "Reservada").length || t.reservedUnitsCount;

      const totalVgv =
        tableUnits.length > 0 ? tableUnits.reduce((acc, u) => acc + u.basePrice, 0) : t.totalVgv;
      const soldVgv =
        tableUnits.length > 0
          ? tableUnits.filter((u) => u.status === "Vendida").reduce((acc, u) => acc + u.basePrice, 0)
          : t.soldVgv;
      const availableVgv =
        tableUnits.length > 0
          ? tableUnits.filter((u) => u.status === "Disponível").reduce((acc, u) => acc + u.basePrice, 0)
          : t.availableVgv;

      const vsoPercent = totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0;
      const totalArea = tableUnits.reduce((acc, u) => acc + u.privateAreaM2, 0);
      const avgPriceM2 = totalArea > 0 ? totalVgv / totalArea : t.averagePricePerM2;
      const ticketMedio = totalUnits > 0 ? totalVgv / totalUnits : 0;

      return {
        tableId: t.id,
        speId: t.speId,
        speName: t.speName,
        tableName: t.name,
        totalUnits,
        soldUnits,
        availableUnits,
        reservedUnits,
        totalVgv,
        soldVgv,
        availableVgv,
        vsoPercent,
        avgPriceM2,
        ticketMedio,
        cubReference: t.cubReferenceValue,
        validUntil: t.validUntil,
        status: t.status,
      };
    });
  }, [tables, units, selectedTableIds, isConsolidated]);

  // =========================================================================
  // 7. EXPORTAÇÃO EXCEL DO RESUMO COMERCIAL
  // =========================================================================
  const handleExportCommercialExcel = () => {
    const wb = XLSX.utils.book_new();

    const titleStr = isConsolidated
      ? "Portfólio Consolidado (Todos)"
      : selectedTableIds.length > 1
      ? `${selectedTableIds.length} Empreendimentos Selecionados`
      : activeTable?.name || "Empreendimento";

    // Sheet 1: KPIs Gerais
    const kpiData = [
      { Métrica: "Empreendimento / Escopo", Valor: titleStr },
      { Métrica: "VGV Total da Tabela", Valor: kpis.totalVgv },
      { Métrica: "VGV Vendido (Realizado)", Valor: kpis.soldVgv },
      { Métrica: "VGV Disponível (Estoque)", Valor: kpis.availableVgv },
      { Métrica: "VGV Reservado (Propostas)", Valor: kpis.reservedVgv },
      { Métrica: "Velocidade de Vendas (VSO %)", Valor: `${kpis.vsoUnitsPercent.toFixed(1)}%` },
      { Métrica: "Total de Unidades", Valor: kpis.totalUnits },
      { Métrica: "Unidades Vendidas", Valor: kpis.soldCount },
      { Métrica: "Unidades Disponíveis", Valor: kpis.availableCount },
      { Métrica: "Preço Médio por m²", Valor: Math.round(kpis.avgPriceM2) },
      { Métrica: "Ticket Médio", Valor: Math.round(kpis.ticketMedio) },
      { Métrica: "Fluxo Obra (40%)", Valor: kpis.obraReceivables },
      { Métrica: "Financiamento (60%)", Valor: kpis.financingReceivables },
    ];
    const wsKpi = XLSX.utils.json_to_sheet(kpiData);
    XLSX.utils.book_append_sheet(wb, wsKpi, "KPIs Comerciais");

    // Sheet 2: Tipologias
    const tipologyData = tipologySummary.map((t) => ({
      Tipologia: t.type,
      "Total Unidades": t.totalUnits,
      Vendidas: t.soldUnits,
      Estoque: t.availableUnits,
      "VSO (%)": `${t.vsoPercent.toFixed(1)}%`,
      "Área Média (m²)": Number(t.avgArea.toFixed(2)),
      "Preço Médio / m²": Math.round(t.avgPriceM2),
      "Ticket Médio": Math.round(t.avgTicket),
      "VGV Total (R$)": t.totalVgv,
      "VGV Vendido (R$)": t.soldVgv,
      "VGV Disponível (R$)": t.availableVgv,
    }));
    const wsTip = XLSX.utils.json_to_sheet(tipologyData);
    XLSX.utils.book_append_sheet(wb, wsTip, "Tipologias");

    // Sheet 3: Comparativo SPEs
    const speData = speComparisonData.map((s) => ({
      Empreendimento: s.tableName,
      SPE: s.speName,
      Unidades: s.totalUnits,
      Vendidas: s.soldUnits,
      Estoque: s.availableUnits,
      "VSO (%)": `${s.vsoPercent.toFixed(1)}%`,
      "VGV Total (R$)": s.totalVgv,
      "VGV Vendido (R$)": s.soldVgv,
      "VGV Disponível (R$)": s.availableVgv,
      "Preço Médio / m²": Math.round(s.avgPriceM2),
      "Ticket Médio": Math.round(s.ticketMedio),
      "CUB Referência (R$)": s.cubReference,
    }));
    const wsSpe = XLSX.utils.json_to_sheet(speData);
    XLSX.utils.book_append_sheet(wb, wsSpe, "Comparativo Empreendimentos");

    XLSX.writeFile(
      wb,
      `DASHBOARD_COMERCIAL_ARV_${isConsolidated ? "CONSOLIDADO" : "SELECAO"}_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // =========================================================================
  // 8. EXPORTAÇÃO PDF DO DASHBOARD COMERCIAL (EXECUTIVE PDF)
  // =========================================================================
  const handleExportCommercialPDF = async (mode: "vector" | "snapshot" = "vector") => {
    try {
      setIsExportingPdf(true);
      const spePrefix = isConsolidated
        ? "CONSOLIDADO_TODOS_EMPREENDIMENTOS"
        : (activeTable?.speName || activeTable?.name || "SELECAO_EMPREENDIMENTOS").replace(
            /[^a-zA-Z0-9]/g,
            "_"
          );
      const fileName = `RELATORIO_COMERCIAL_ARV_${spePrefix}_${new Date().toISOString().slice(0, 10)}.pdf`;

      const reportData: any = {
        isConsolidated,
        activeTable,
        tables: isConsolidated
          ? tables
          : tables.filter((t) => selectedTableIds.includes(t.id)),
        units: relevantUnits,
        proposals,
        simulatedCub,
        cubSimVariation,
        kpis,
        tipologySummary,
        floorSummary,
        speComparisonData,
      };

      if (mode === "vector") {
        CommercialPdfExportService.generateStructuredExecutivePDF(reportData, {
          fileName,
          title: isConsolidated
            ? "Relatório Comercial Consolidado"
            : `Relatório Comercial • ${activeTable?.name || "Seleção de Empreendimentos"}`,
          speName: isConsolidated
            ? "Portfólio Geral ARV"
            : activeTable?.speName || "ARV Empreendimentos",
        });
      } else {
        const dashboardElement = document.getElementById("commercial-sales-dashboard");
        if (!dashboardElement) throw new Error("Elemento do dashboard não encontrado");
        await CommercialPdfExportService.exportElementToPDF(dashboardElement, { fileName }, reportData);
      }

      setExportSuccessMsg("Relatório Comercial em PDF gerado e baixado com sucesso!");
      setTimeout(() => setExportSuccessMsg(null), 4500);
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      alert("Ocorreu um erro ao gerar o PDF. Você também pode utilizar a opção de impressão.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  // =========================================================================
  // 8.1 EXPORTAÇÃO PDF DO ESPELHO DE ESTOQUE PARA CORRETORES
  // =========================================================================
  const handleExportBrokerPDF = () => {
    try {
      setIsExportingPdf(true);
      const spePrefix = isConsolidated
        ? "CONSOLIDADO_TODOS_EMPREENDIMENTOS"
        : (activeTable?.speName || activeTable?.name || "SELECAO_EMPREENDIMENTOS").replace(
            /[^a-zA-Z0-9]/g,
            "_"
          );
      const fileName = `ESPELHO_ESTOQUE_CORRETORES_ARV_${spePrefix}_${new Date().toISOString().slice(0, 10)}.pdf`;

      const reportData: any = {
        isConsolidated,
        activeTable,
        tables: isConsolidated
          ? tables
          : tables.filter((t) => selectedTableIds.includes(t.id)),
        units: relevantUnits,
        proposals,
        simulatedCub,
        cubSimVariation,
        kpis,
        tipologySummary,
        floorSummary,
        speComparisonData,
      };

      CommercialPdfExportService.generateBrokerAvailabilityMirrorPDF(reportData, {
        fileName,
      });

      setExportSuccessMsg("Espelho de Estoque para Corretores em PDF gerado com sucesso!");
      setTimeout(() => setExportSuccessMsg(null), 4500);
    } catch (err) {
      console.error("Erro ao exportar PDF de corretores:", err);
      alert("Ocorreu um erro ao gerar o PDF de corretores.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportSpecificSpePDF = (speTableId: string) => {
    try {
      setIsExportingPdf(true);
      const targetTable = tables.find((t) => t.id === speTableId);
      if (!targetTable) return;

      const speUnits = units.filter((u) => u.tableId === speTableId);
      const tableBaseCub = targetTable.cubReferenceValue || CURRENT_DEFAULT_CUB_SC;
      const tableSimCub = tableBaseCub * (1 + cubSimVariation / 100);
      const tableCubMult = tableSimCub / tableBaseCub;

      const totalUnits = speUnits.length;
      const soldUnits = speUnits.filter((u) => u.status === "Vendida");
      const availableUnits = speUnits.filter((u) => u.status === "Disponível");
      const reservedUnits = speUnits.filter((u) => u.status === "Reservada");
      const blockedUnits = speUnits.filter(
        (u) => u.status === "Bloqueada" || u.status === "Permuta"
      );

      const totalVgv = speUnits.reduce(
        (sum, u) => sum + u.basePrice * (u.status === "Disponível" ? tableCubMult : 1),
        0
      );
      const soldVgv = soldUnits.reduce((sum, u) => sum + u.basePrice, 0);
      const availableVgv = availableUnits.reduce((sum, u) => sum + u.basePrice * tableCubMult, 0);
      const reservedVgv = reservedUnits.reduce((sum, u) => sum + u.basePrice * tableCubMult, 0);

      const totalArea = speUnits.reduce((sum, u) => sum + (u.privateAreaM2 || 0), 0);
      const soldArea = soldUnits.reduce((sum, u) => sum + (u.privateAreaM2 || 0), 0);
      const availableArea = availableUnits.reduce((sum, u) => sum + (u.privateAreaM2 || 0), 0);

      const avgPriceM2 = totalArea > 0 ? totalVgv / totalArea : 0;
      const avgSoldPriceM2 = soldArea > 0 ? soldVgv / soldArea : 0;
      const avgAvailablePriceM2 = availableArea > 0 ? availableVgv / availableArea : 0;
      const avgCubM2 = tableSimCub > 0 && avgPriceM2 > 0 ? avgPriceM2 / tableSimCub : 0;

      const ticketMedio = totalUnits > 0 ? totalVgv / totalUnits : 0;
      const ticketMedioVendido = soldUnits.length > 0 ? soldVgv / soldUnits.length : 0;
      const ticketMedioDisponivel = availableUnits.length > 0 ? availableVgv / availableUnits.length : 0;

      const atoReceivables = speUnits.reduce((sum, u) => {
        const p = u.basePrice * (u.status === "Disponível" ? tableCubMult : 1);
        return sum + (u.downPaymentAto ? u.downPaymentAto * tableCubMult : p * 0.12);
      }, 0);

      const monthlyReceivables = speUnits.reduce((sum, u) => {
        const p = u.basePrice * (u.status === "Disponível" ? tableCubMult : 1);
        return sum + (u.monthlyInstallment40x ? u.monthlyInstallment40x * 40 * tableCubMult : p * 0.15);
      }, 0);

      const balloonReceivables = speUnits.reduce((sum, u) => {
        const p = u.basePrice * (u.status === "Disponível" ? tableCubMult : 1);
        return sum + (u.balloonInstallment6x ? u.balloonInstallment6x * 6 * tableCubMult : p * 0.08);
      }, 0);

      const finalInstallmentReceivables = speUnits.reduce((sum, u) => {
        const p = u.basePrice * (u.status === "Disponível" ? tableCubMult : 1);
        return sum + (u.finalInstallment ? u.finalInstallment * tableCubMult : p * 0.05);
      }, 0);

      const financingReceivables = speUnits.reduce((sum, u) => {
        const p = u.basePrice * (u.status === "Disponível" ? tableCubMult : 1);
        return sum + (u.financingBalance ? u.financingBalance * tableCubMult : p * 0.60);
      }, 0);

      const obraReceivables =
        atoReceivables + monthlyReceivables + balloonReceivables + finalInstallmentReceivables;

      const typeGroups: Record<string, PricingUnit[]> = {};
      speUnits.forEach((u) => {
        const t = u.type || "Outro";
        if (!typeGroups[t]) typeGroups[t] = [];
        typeGroups[t].push(u);
      });

      const specificTipologySummary = Object.entries(typeGroups).map(([type, typeUnits]) => {
        const sold = typeUnits.filter((u) => u.status === "Vendida");
        const avail = typeUnits.filter((u) => u.status === "Disponível");
        const reserv = typeUnits.filter((u) => u.status === "Reservada");
        const tVgv = typeUnits.reduce(
          (sum, u) => sum + u.basePrice * (u.status === "Disponível" ? tableCubMult : 1),
          0
        );
        const sVgv = sold.reduce((sum, u) => sum + u.basePrice, 0);
        const aVgv = avail.reduce((sum, u) => sum + u.basePrice * tableCubMult, 0);
        const tArea = typeUnits.reduce((sum, u) => sum + (u.privateAreaM2 || 0), 0);
        const sArea = sold.reduce((sum, u) => sum + (u.privateAreaM2 || 0), 0);
        const aArea = avail.reduce((sum, u) => sum + (u.privateAreaM2 || 0), 0);

        return {
          type,
          totalUnits: typeUnits.length,
          soldUnits: sold.length,
          availableUnits: avail.length,
          reservedUnits: reserv.length,
          totalVgv: tVgv,
          soldVgv: sVgv,
          availableVgv: aVgv,
          totalArea: tArea,
          soldArea: sArea,
          availableArea: aArea,
          vsoPercent: typeUnits.length > 0 ? (sold.length / typeUnits.length) * 100 : 0,
          avgPriceM2: tArea > 0 ? tVgv / tArea : 0,
          avgTicket: typeUnits.length > 0 ? tVgv / typeUnits.length : 0,
          avgArea: typeUnits.length > 0 ? tArea / typeUnits.length : 0,
          avgCubM2: tableSimCub > 0 && tArea > 0 ? tVgv / tArea / tableSimCub : 0,
        };
      });

      const spePrefix = (targetTable.speName || targetTable.name).replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `RELATORIO_COMERCIAL_ARV_${spePrefix}_${new Date().toISOString().slice(0, 10)}.pdf`;

      CommercialPdfExportService.generateStructuredExecutivePDF(
        {
          isConsolidated: false,
          activeTable: targetTable,
          tables,
          units: speUnits,
          proposals,
          simulatedCub: tableSimCub,
          cubSimVariation,
          kpis: {
            totalUnits,
            soldCount: soldUnits.length,
            availableCount: availableUnits.length,
            reservedCount: reservedUnits.length,
            blockedCount: blockedUnits.length,
            totalVgv,
            soldVgv,
            availableVgv,
            reservedVgv,
            vsoUnitsPercent: totalUnits > 0 ? (soldUnits.length / totalUnits) * 100 : 0,
            vsoVgvPercent: totalVgv > 0 ? (soldVgv / totalVgv) * 100 : 0,
            totalArea,
            soldArea,
            availableArea,
            avgPriceM2,
            avgSoldPriceM2,
            avgAvailablePriceM2,
            avgCubM2,
            ticketMedio,
            ticketMedioVendido,
            ticketMedioDisponivel,
            atoReceivables,
            monthlyReceivables,
            balloonReceivables,
            finalInstallmentReceivables,
            financingReceivables,
            obraReceivables,
          },
          tipologySummary: specificTipologySummary,
          floorSummary: [],
          speComparisonData,
        },
        { fileName }
      );

      setExportSuccessMsg(`Relatório em PDF de ${targetTable.name} gerado com sucesso!`);
      setTimeout(() => setExportSuccessMsg(null), 4500);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Ocorreu um erro ao gerar o PDF.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportSpecificSpeBrokerPDF = (speTableId: string) => {
    try {
      setIsExportingPdf(true);
      const targetTable = tables.find((t) => t.id === speTableId);
      if (!targetTable) return;

      const speUnits = units.filter((u) => u.tableId === speTableId);
      const tableBaseCub = targetTable.cubReferenceValue || CURRENT_DEFAULT_CUB_SC;
      const tableSimCub = tableBaseCub * (1 + cubSimVariation / 100);

      const reportData: any = {
        isConsolidated: false,
        activeTable: targetTable,
        tables: [targetTable],
        units: speUnits,
        proposals: proposals.filter((p) => speUnits.some((u) => u.id === p.unitId)),
        simulatedCub: tableSimCub,
        cubSimVariation,
        kpis,
        tipologySummary,
        floorSummary,
        speComparisonData,
      };

      CommercialPdfExportService.generateBrokerAvailabilityMirrorPDF(reportData, {
        fileName: `ESPELHO_ESTOQUE_CORRETORES_${targetTable.name.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`,
      });

      setExportSuccessMsg(`Espelho de Estoque de ${targetTable.name} gerado com sucesso!`);
      setTimeout(() => setExportSuccessMsg(null), 4500);
    } catch (err) {
      console.error("Erro ao gerar PDF de corretores:", err);
      alert("Ocorreu um erro ao gerar o PDF de corretores.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div id="commercial-sales-dashboard" className="space-y-6">
      {/* Toast Notification */}
      {exportSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{exportSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner: Header & Action Tools */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Inteligência Comercial & Vendas
              </span>
              <span className="text-slate-300 text-xs font-medium">
                {isConsolidated
                  ? "Visão Multi-Empreendimento"
                  : selectedTableIds.length === 1 && activeTable
                  ? `Vigência: ${activeTable.validUntil || "2026-09-30"}`
                  : `${selectedTableIds.length} Empreendimentos Selecionados`}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-amber-400" />
              {isConsolidated
                ? "DASHBOARD COMERCIAL CONSOLIDADO"
                : selectedTableIds.length === 1 && activeTable
                ? `DASHBOARD COMERCIAL • ${activeTable.speName || activeTable.name}`
                : `DASHBOARD COMERCIAL • ${selectedTableIds.length} EMPREENDIMENTOS`}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {isConsolidated
                ? "Resumo executivo consolidado de VGV, velocidade de vendas (VSO), absorção por tipologia e estoque de todos os empreendimentos da ARV."
                : selectedTableIds.length === 1 && activeTable
                ? activeTable.description ||
                  "Análise comercial completa de precificação, absorção por pavimento, composição de carteira e metas comerciais."
                : "Análise comparativa e agrupada dos empreendimentos selecionados, com gráficos dinâmicos de VGV, tipologias e fluxo financeiro."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* CUB Simulator Toggle */}
            <button
              id="btn-toggle-cub-simulator"
              onClick={() => setShowSimulatorPanel(!showSimulatorPanel)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                showSimulatorPanel
                  ? "bg-amber-500 text-slate-950 font-black shadow-amber-500/20"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600"
              }`}
            >
              <Calculator className="w-4 h-4" />
              {showSimulatorPanel ? "Simulador Ativo" : "Simular CUB / Cenários"}
            </button>

            {/* Espelho de Estoque Corretores Shortcut */}
            <button
              id="btn-broker-stock-mirror"
              onClick={() => {
                setActiveChartTab("espelho_corretores");
                const el = document.getElementById("commercial-charts-container");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="Acessar Espelho de Estoque & Gráficos para Corretores"
            >
              <Building2 className="w-4 h-4 text-emerald-200" /> Espelho Corretores
            </button>

            {/* Export PDF Executivo */}
            <button
              id="btn-export-commercial-pdf"
              onClick={() => handleExportCommercialPDF("vector")}
              disabled={isExportingPdf}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                isExportingPdf
                  ? "bg-rose-800 text-white cursor-wait opacity-80"
                  : "bg-rose-600 hover:bg-rose-500 text-white"
              }`}
              title="Exportar Relatório em PDF Executivo Oficial"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Gerando PDF...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Exportar PDF Executivo
                </>
              )}
            </button>

            {/* Export Excel */}
            <button
              id="btn-export-commercial-excel"
              onClick={handleExportCommercialExcel}
              className="px-3.5 py-2.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              title="Exportar Resumo Comercial em Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exportar .XLSX
            </button>

            {/* Print button */}
            <button
              id="btn-print-commercial-dashboard"
              onClick={() => CommercialPdfExportService.printDashboard()}
              className="p-2.5 rounded-xl text-xs font-black bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-all shadow-md flex items-center justify-center cursor-pointer"
              title="Imprimir / Salvar PDF pelo Navegador"
            >
              <Printer className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Dynamic CUB Simulator Bar */}
        {showSimulatorPanel && (
          <div className="mt-5 p-4 bg-slate-950/80 rounded-2xl border border-indigo-500/40 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Simulação de Impacto Comercial em Tempo Real
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ajuste a variação do CUB/SC para recalcular instantaneamente o VGV disponível e o fluxo dos gráficos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400">Variação CUB:</span>
                  <input
                    type="range"
                    min="-15"
                    max="25"
                    step="0.5"
                    value={cubSimVariation}
                    onChange={(e) => setCubSimVariation(parseFloat(e.target.value))}
                    className="w-28 accent-amber-400 cursor-pointer"
                  />
                  <span
                    className={`font-mono text-xs font-bold ${
                      cubSimVariation > 0
                        ? "text-emerald-400"
                        : cubSimVariation < 0
                        ? "text-rose-400"
                        : "text-slate-300"
                    }`}
                  >
                    {cubSimVariation > 0 ? `+${cubSimVariation}%` : `${cubSimVariation}%`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">CUB Simulado:</span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {CUBService.formatCurrency(simulatedCub)}
                  </span>
                </div>

                {cubSimVariation !== 0 && (
                  <button
                    onClick={() => setCubSimVariation(0)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Restaurar CUB Base"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. SELETOR INTERATIVO DE EMPREENDIMENTOS PARA OS GRÁFICOS                */}
      {/* ========================================================================= */}
      <CommercialEmpreendimentoSelector
        tables={tables}
        units={units}
        selectedTableIds={selectedTableIds}
        isMultiSelect={isMultiSelect}
        onToggleMultiSelect={handleToggleMultiSelect}
        onSelectSingleTable={handleSelectSingleTable}
        onToggleTableSelection={handleToggleTableSelection}
        onSelectAllTables={handleSelectAllTables}
        formatCurrency={formatCurrency}
        formatShortCurrency={formatShortCurrency}
      />

      {/* ========================================================================= */}
      {/* 2. KPI METRIC CARDS (6 CARDS DE ALTO VALOR)                              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: VGV Total */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>VGV Total</span>
            <Building2 className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg font-black text-slate-900 dark:text-white mt-1 font-mono tracking-tight">
            {formatShortCurrency(kpis.totalVgv)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>{kpis.totalUnits} unidades</span>
            <span>{formatShortCurrency(kpis.ticketMedio)}/un</span>
          </div>
        </div>

        {/* Card 2: VGV Vendido */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <span>VGV Vendido</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono tracking-tight">
            {formatShortCurrency(kpis.soldVgv)}
          </div>
          <div className="text-[11px] text-indigo-500/80 mt-1 flex items-center justify-between">
            <span>{kpis.soldCount} vendidas</span>
            <span>{kpis.vsoUnitsPercent.toFixed(1)}% VSO</span>
          </div>
        </div>

        {/* Card 3: VGV Disponível (Estoque) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>VGV Estoque</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono tracking-tight">
            {formatShortCurrency(kpis.availableVgv)}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1 flex items-center justify-between">
            <span>{kpis.availableCount} disponíveis</span>
            <span>{(100 - kpis.vsoUnitsPercent).toFixed(1)}% estoque</span>
          </div>
        </div>

        {/* Card 4: % Comercializado (VSO) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>Velocidade (VSO)</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1 font-mono tracking-tight">
            {kpis.vsoUnitsPercent.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${kpis.vsoUnitsPercent}%` }}
            />
          </div>
        </div>

        {/* Card 5: Preço Médio por m² */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
            <span>Preço Médio / m²</span>
            <Tag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1 font-mono tracking-tight">
            {formatCurrency(kpis.avgPriceM2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {kpis.avgCubM2.toFixed(2)} CUBs / m²
          </div>
        </div>

        {/* Card 6: Fluxo Obra (40%) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-medium">
            <span>Fluxo Obra (40%)</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-black text-purple-600 dark:text-purple-400 mt-1 font-mono tracking-tight">
            {formatShortCurrency(kpis.obraReceivables)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Financ: {formatShortCurrency(kpis.financingReceivables)} (60%)
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BARRA DE CONTROLE DE DADOS & ABAS DOS GRÁFICOS                         */}
      {/* ========================================================================= */}
      <CommercialChartControls
        activeTab={activeChartTab}
        onChangeTab={setActiveChartTab}
        metric={chartMetric}
        onChangeMetric={setChartMetric}
        selectedStatuses={selectedStatuses}
        onToggleStatus={handleToggleStatus}
        availableTipologies={availableTipologies}
        selectedTipologies={selectedTipologies}
        onToggleTipology={handleToggleTipology}
        onSelectAllTipologies={handleSelectAllTipologies}
      />

      {/* ========================================================================= */}
      {/* 4. SEÇÃO PRINCIPAL DE GRÁFICOS DINÂMICOS                                  */}
      {/* ========================================================================= */}
      <div id="commercial-charts-container">
        <CommercialChartsSection
          activeTab={activeChartTab}
          metric={chartMetric}
          statusChartData={statusChartData}
          tipologyChartData={tipologySummary}
          speComparisonData={speComparisonData}
          floorChartData={floorSummary}
          kpis={kpis}
          formatCurrency={formatCurrency}
          formatShortCurrency={formatShortCurrency}
          tables={tables}
          activeTable={activeTable}
          isConsolidated={isConsolidated}
          units={relevantUnits}
          simulatedCub={simulatedCub}
          cubSimVariation={cubSimVariation}
          reportData={{
            isConsolidated,
            activeTable,
            tables: isConsolidated ? tables : tables.filter((t) => selectedTableIds.includes(t.id)),
            units: relevantUnits,
            proposals,
            simulatedCub,
            cubSimVariation,
            kpis,
            tipologySummary,
            floorSummary,
            speComparisonData,
          }}
          onSimulateUnit={onSimulateUnit}
        />
      </div>

      {/* ========================================================================= */}
      {/* 5. TABELA COMPARATIVA DE EMPREENDIMENTOS                                  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Desempenho Comercial Comparativo por Empreendimento (SPE)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clique em "Ver Gráficos deste Projeto" para isolar os gráficos e relatórios deste empreendimento:
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl border border-indigo-200 dark:border-indigo-800">
            {speComparisonData.length} Empreendimentos em Análise
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">Empreendimento / Tabela</th>
                <th className="p-3 text-center">Unidades</th>
                <th className="p-3 text-center">Vendidas</th>
                <th className="p-3 text-center">Estoque</th>
                <th className="p-3 text-center">VSO (%)</th>
                <th className="p-3 text-right">Preço Médio / m²</th>
                <th className="p-3 text-right">Ticket Médio</th>
                <th className="p-3 text-right font-bold text-slate-900 dark:text-white">VGV Total</th>
                <th className="p-3 text-right text-indigo-600 dark:text-indigo-400">VGV Vendido</th>
                <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">VGV Disponível</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {speComparisonData.map((s) => (
                <tr key={s.tableId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    <div className="flex flex-col">
                      <span>{s.tableName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{s.speName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold">{s.totalUnits}</td>
                  <td className="p-3 text-center text-indigo-600 font-bold">{s.soldUnits}</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">{s.availableUnits}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {s.vsoPercent.toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">{formatCurrency(s.avgPriceM2)}</td>
                  <td className="p-3 text-right font-mono">{formatShortCurrency(s.ticketMedio)}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(s.totalVgv)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(s.soldVgv)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(s.availableVgv)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleSelectSingleTable(s.tableId)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Isolar Gráficos deste Empreendimento"
                      >
                        Gráficos <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleExportSpecificSpeBrokerPDF(s.tableId)}
                        disabled={isExportingPdf}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title={`Exportar Espelho de Estoque para Corretores de ${s.tableName}`}
                      >
                        <Building2 className="w-3 h-3 text-emerald-200" /> Espelho
                      </button>
                      <button
                        onClick={() => handleExportSpecificSpePDF(s.tableId)}
                        disabled={isExportingPdf}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title={`Exportar Relatório PDF Executivo de ${s.tableName}`}
                      >
                        <FileText className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. MATRIZ COMERCIAL DETALHADA POR TIPOLOGIA                               */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Matriz Comercial Detalhada por Tipologia
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Valores médios, áreas, estoque, VSO e precificação m² / CUB por tipologia de produto
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Índice de Base:{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              CUB/SC {CUBService.formatCurrency(simulatedCub)}
            </strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">Tipologia</th>
                <th className="p-3 text-center">Unidades</th>
                <th className="p-3 text-center">Vendidas</th>
                <th className="p-3 text-center">Estoque</th>
                <th className="p-3 text-center">VSO (%)</th>
                <th className="p-3 text-right">Área Média</th>
                <th className="p-3 text-right">Preço / m²</th>
                <th className="p-3 text-right">CUB / m²</th>
                <th className="p-3 text-right">Ticket Médio</th>
                <th className="p-3 text-right font-bold text-slate-900 dark:text-white">VGV Total</th>
                <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">VGV Estoque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {tipologySummary.map((t) => (
                <tr key={t.type} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{t.type}</td>
                  <td className="p-3 text-center font-bold">{t.totalUnits}</td>
                  <td className="p-3 text-center text-indigo-600 font-bold">{t.soldUnits}</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">{t.availableUnits}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {t.vsoPercent.toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono">{t.avgArea.toFixed(1)} m²</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(t.avgPriceM2)}</td>
                  <td className="p-3 text-right font-mono text-slate-500">{t.avgCubM2.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(t.avgTicket)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(t.totalVgv)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(t.availableVgv)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. DESTAQUES DE ESTOQUE & OPORTUNIDADES COMERCIAIS                       */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Destaques de Estoque & Oportunidades Comerciais
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unidades disponíveis prontas para abordagem comercial imediata
            </p>
          </div>

          <span className="text-xs text-slate-400">
            {kpis.availableCount} unidades prontas para proposta
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {relevantUnits
            .filter((u) => u.status === "Disponível")
            .slice(0, 4)
            .map((u) => {
              const price = u.basePrice * cubMultiplier;
              const ato = u.downPaymentAto ? u.downPaymentAto * cubMultiplier : price * 0.12;
              const parcela = u.monthlyInstallment40x
                ? u.monthlyInstallment40x * cubMultiplier
                : (price * 0.15) / 40;

              return (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-indigo-500 transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {u.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{u.floorName || `${u.floor}° Pav.`}</span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 dark:text-white mt-2">
                      {u.unitNumber} • {u.type}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {u.position || u.viewDescription || "Excelente insolação"}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Área Privativa:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{u.privateAreaM2} m²</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valor Total:</span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        {formatCurrency(price)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ato (12%):</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                        {formatCurrency(ato)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">40x Mensais:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {formatCurrency(parcela)}/mês
                      </strong>
                    </div>
                  </div>

                  {onSimulateUnit && (
                    <button
                      onClick={() => onSimulateUnit(u)}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" /> Simular Proposta
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
