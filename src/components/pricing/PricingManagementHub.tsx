import React, { useState, useMemo } from "react";
import {
  Table,
  Building2,
  DollarSign,
  TrendingUp,
  Percent,
  Search,
  Filter,
  Plus,
  Layers,
  Calculator,
  Compass,
  Car,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Printer,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  PriceTable,
  PricingUnit,
  CommercialProposal,
  UnitStatus,
  UnitType,
} from "../../types/pricing";
import {
  initialPriceTables,
  initialPricingUnits,
  initialCommercialProposals,
} from "../../data/pricingInitialData";
import {
  HISTORICAL_CUB_RECORDS,
  CURRENT_DEFAULT_CUB_SC,
  CUBService,
} from "../../services/pricing/CUBService";
import { NewPriceTableModal } from "./NewPriceTableModal";
import { UnitDetailModal } from "./UnitDetailModal";
import { SimulateProposalModal } from "./SimulateProposalModal";
import { BulkPriceAdjustmentModal } from "./BulkPriceAdjustmentModal";
import { GridSalesTableView } from "./GridSalesTableView";
import { CommercialSalesDashboard } from "./CommercialSalesDashboard";
import { BarChart3 } from "lucide-react";

export const PricingManagementHub: React.FC = () => {
  const { spes } = useApp();

  // State
  const [tables, setTables] = useState<PriceTable[]>(initialPriceTables);
  const [units, setUnits] = useState<PricingUnit[]>(initialPricingUnits);
  const [proposals, setProposals] = useState<CommercialProposal[]>(initialCommercialProposals);

  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || "");
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "grid-official" | "mirror" | "tables" | "simulator" | "cub" | "proposals"
  >("dashboard");

  // Filters for units
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [floorFilter, setFloorFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "matrix" | "list">("table");

  // Modals state
  const [isNewTableOpen, setIsNewTableOpen] = useState(false);
  const [tableToClone, setTableToClone] = useState<PriceTable | null>(null);
  const [selectedUnitForDetail, setSelectedUnitForDetail] = useState<PricingUnit | null>(null);
  const [selectedUnitForSimulate, setSelectedUnitForSimulate] = useState<PricingUnit | null>(null);
  const [isBulkAdjustOpen, setIsBulkAdjustOpen] = useState(false);

  // Selected Table Object
  const currentTable = useMemo(() => {
    return tables.find((t) => t.id === selectedTableId) || tables[0] || null;
  }, [tables, selectedTableId]);

  // Filtered Units for current table
  const tableUnits = useMemo(() => {
    if (!currentTable) return [];
    return units.filter((u) => u.tableId === currentTable.id);
  }, [units, currentTable]);

  const filteredUnits = useMemo(() => {
    return tableUnits.filter((u) => {
      const matchSearch =
        u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.viewDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.buyerName && u.buyerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.reservedBy && u.reservedBy.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
      const matchType = typeFilter === "ALL" || u.type === typeFilter;
      const matchFloor = floorFilter === "ALL" || u.floor.toString() === floorFilter;

      return matchSearch && matchStatus && matchType && matchFloor;
    });
  }, [tableUnits, searchTerm, statusFilter, typeFilter, floorFilter]);

  // Aggregate Metrics for Current Table
  const tableStats = useMemo(() => {
    if (!currentTable) {
      return {
        totalUnits: 0,
        availableUnits: 0,
        reservedUnits: 0,
        soldUnits: 0,
        totalVgv: 0,
        availableVgv: 0,
        soldVgv: 0,
        avgPriceM2: 0,
        avgCubM2: 0,
        percentSold: 0,
      };
    }

    const totalUnits = tableUnits.length;
    const availableUnits = tableUnits.filter((u) => u.status === "Disponível").length;
    const reservedUnits = tableUnits.filter((u) => u.status === "Reservada").length;
    const soldUnits = tableUnits.filter((u) => u.status === "Vendida").length;

    const totalVgv = tableUnits.reduce((acc, u) => acc + u.basePrice, 0);
    const availableVgv = tableUnits
      .filter((u) => u.status === "Disponível" || u.status === "Reservada")
      .reduce((acc, u) => acc + u.basePrice, 0);
    const soldVgv = tableUnits
      .filter((u) => u.status === "Vendida")
      .reduce((acc, u) => acc + u.basePrice, 0);

    const totalPrivArea = tableUnits.reduce((acc, u) => acc + u.privateAreaM2, 0);
    const avgPriceM2 = totalPrivArea > 0 ? totalVgv / totalPrivArea : 0;
    const avgCubM2 = avgPriceM2 / currentTable.cubReferenceValue;
    const percentSold = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;

    return {
      totalUnits,
      availableUnits,
      reservedUnits,
      soldUnits,
      totalVgv,
      availableVgv,
      soldVgv,
      avgPriceM2,
      avgCubM2,
      percentSold,
    };
  }, [tableUnits, currentTable]);

  // Unique floors for matrix
  const distinctFloors = useMemo(() => {
    const floors = Array.from(new Set(tableUnits.map((u) => u.floor))).sort((a, b) => b - a);
    return floors;
  }, [tableUnits]);

  // Handlers
  const handleSaveNewTable = (newTable: PriceTable) => {
    setTables((prev) => [newTable, ...prev]);
    setSelectedTableId(newTable.id);

    // If cloning or generating units, generate initial units for the table
    const generatedUnits: PricingUnit[] = [
      {
        id: `unit-${newTable.id}-101`,
        tableId: newTable.id,
        speId: newTable.speId,
        unitNumber: "Apto 101",
        tower: "Torre Principal",
        floor: 1,
        type: "Studio",
        privateAreaM2: 36.0,
        totalAreaM2: 52.0,
        garageType: "Simples Coberta",
        solarOrientation: "Norte",
        viewDescription: "Sol da manhã e sacada",
        basePrice: Math.round(newTable.averagePricePerM2 * 36.0),
        cubPrice: Number(((newTable.averagePricePerM2 * 36.0) / newTable.cubReferenceValue).toFixed(2)),
        pricePerM2: newTable.averagePricePerM2,
        cubPerM2: Number((newTable.averagePricePerM2 / newTable.cubReferenceValue).toFixed(2)),
        status: "Disponível",
        discountMaxPercent: 5.0,
        commissionPercent: newTable.defaultCommissionPercent,
      },
      {
        id: `unit-${newTable.id}-201`,
        tableId: newTable.id,
        speId: newTable.speId,
        unitNumber: "Apto 201",
        tower: "Torre Principal",
        floor: 2,
        type: "2 Suítes",
        privateAreaM2: 72.0,
        totalAreaM2: 104.0,
        garageType: "Dupla Coberta",
        solarOrientation: "Nordeste",
        viewDescription: "Vista aberta e sacada com churrasqueira",
        basePrice: Math.round(newTable.averagePricePerM2 * 72.0),
        cubPrice: Number(((newTable.averagePricePerM2 * 72.0) / newTable.cubReferenceValue).toFixed(2)),
        pricePerM2: newTable.averagePricePerM2,
        cubPerM2: Number((newTable.averagePricePerM2 / newTable.cubReferenceValue).toFixed(2)),
        status: "Disponível",
        discountMaxPercent: 5.0,
        commissionPercent: newTable.defaultCommissionPercent,
      },
    ];

    setUnits((prev) => [...prev, ...generatedUnits]);
  };

  const handleUpdateUnit = (updatedUnit: PricingUnit) => {
    setUnits((prev) => prev.map((u) => (u.id === updatedUnit.id ? updatedUnit : u)));
  };

  const handleUpdateUnitsBatch = (updatedUnits: PricingUnit[]) => {
    const updatedMap = new Map(updatedUnits.map((u) => [u.id, u]));
    setUnits((prev) => prev.map((u) => updatedMap.get(u.id) || u));
  };

  const handleAddUnit = (newUnit: PricingUnit) => {
    setUnits((prev) => [newUnit, ...prev]);
  };

  const handleDeleteUnit = (unitId: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== unitId));
  };

  const handleDeleteUnitsBatch = (unitIds: string[]) => {
    const idsSet = new Set(unitIds);
    setUnits((prev) => prev.filter((u) => !idsSet.has(u.id)));
  };

  const handleImportUnits = (importedUnits: PricingUnit[], mode: "merge" | "replace") => {
    if (!currentTable) return;
    if (mode === "replace") {
      setUnits((prev) => [
        ...prev.filter((u) => u.tableId !== currentTable.id),
        ...importedUnits,
      ]);
    } else {
      setUnits((prev) => {
        const otherUnits = prev.filter((u) => u.tableId !== currentTable.id);
        const thisTableUnits = [...prev.filter((u) => u.tableId === currentTable.id)];

        importedUnits.forEach((imp) => {
          const idx = thisTableUnits.findIndex(
            (u) => u.unitNumber.trim().toLowerCase() === imp.unitNumber.trim().toLowerCase()
          );
          if (idx >= 0) {
            thisTableUnits[idx] = {
              ...thisTableUnits[idx],
              ...imp,
              id: thisTableUnits[idx].id,
            };
          } else {
            thisTableUnits.push(imp);
          }
        });

        return [...otherUnits, ...thisTableUnits];
      });
    }
  };

  const handleApplyBulkAdjustment = (
    adjustedUnits: PricingUnit[],
    updatedTable: PriceTable
  ) => {
    setUnits(adjustedUnits);
    setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)));
  };

  const handleSaveProposal = (proposal: CommercialProposal) => {
    setProposals((prev) => [proposal, ...prev]);
  };

  const formatBrl = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Table Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
            <Table className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Gestão de Preços & Tabelas de Venda
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Indexação CUB/SC
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Controle de preços de venda por unidade, condições de pagamento, espelho de vendas e
              correção monetária pelo CUB.
            </p>
          </div>
        </div>

        {/* Table Selector & Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-1.5">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden pr-2 cursor-pointer max-w-xs truncate"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id} className="dark:bg-slate-900">
                  {t.speName} • {t.version}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsBulkAdjustOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" /> Reajuste em Lote CUB
          </button>

          <button
            onClick={() => {
              setTableToClone(null);
              setIsNewTableOpen(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Tabela
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* VGV Total */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            VGV Total da Tabela
          </span>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">
            {formatBrl(tableStats.totalVgv)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {tableStats.totalUnits} unidades totais
          </span>
        </div>

        {/* Estoque Disponível */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Estoque Disponível
          </span>
          <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {formatBrl(tableStats.availableVgv)}
          </div>
          <span className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 block mt-0.5">
            {tableStats.availableUnits} unid. à venda
          </span>
        </div>

        {/* VGV Vendido */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
            VGV Vendido / Contratado
          </span>
          <div className="text-base font-black text-purple-600 dark:text-purple-400 mt-1 font-mono">
            {formatBrl(tableStats.soldVgv)}
          </div>
          <span className="text-[10px] text-purple-700/70 dark:text-purple-400/70 block mt-0.5">
            {tableStats.percentSold}% comercializado
          </span>
        </div>

        {/* Preço Médio m² */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Preço Médio / m²
          </span>
          <div className="text-base font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
            {formatBrl(tableStats.avgPriceM2)} / m²
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {tableStats.avgCubM2.toFixed(2)} CUBs / m²
          </span>
        </div>

        {/* CUB Vigente */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            CUB/SC de Referência
          </span>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1 font-mono">
            {formatBrl(currentTable?.cubReferenceValue || CURRENT_DEFAULT_CUB_SC)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {currentTable?.cubReferenceDate || "Agosto/2026"} (R8-N)
          </span>
        </div>

        {/* Reservas & Propostas */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Reservadas / Propostas
          </span>
          <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {tableStats.reservedUnits} unidades
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {proposals.length} propostas emitidas
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`pb-3 px-4 text-xs font-black transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "dashboard"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-indigo-500" /> Dashboard Comercial
        </button>

        <button
          onClick={() => setActiveTab("grid-official")}
          className={`pb-3 px-4 text-xs font-black transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "grid-official"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-500" /> Tabela Financiamento GRID (Oficial)
        </button>

        <button
          onClick={() => setActiveTab("mirror")}
          className={`pb-3 px-4 text-xs font-black transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "mirror"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" /> Espelho de Vendas & Unidades ({tableUnits.length})
        </button>

        <button
          onClick={() => setActiveTab("tables")}
          className={`pb-3 px-4 text-xs font-black transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "tables"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Table className="w-4 h-4" /> Tabelas & Vigências ({tables.length})
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`pb-3 px-4 text-xs font-black transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "simulator"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Calculator className="w-4 h-4" /> Simulador de Fluxo & Condições
        </button>

        <button
          onClick={() => setActiveTab("cub")}
          className={`pb-3 px-4 text-xs font-black transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "cub"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Painel CUB & Correção Monetária
        </button>

        <button
          onClick={() => setActiveTab("proposals")}
          className={`pb-3 px-4 text-xs font-black transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === "proposals"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" /> Propostas Comerciais ({proposals.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB: DASHBOARD COMERCIAL (RESUMO POR EMPREENDIMENTO)     */}
      {/* ======================================================== */}
      {activeTab === "dashboard" && (
        <CommercialSalesDashboard
          tables={tables}
          units={units}
          proposals={proposals}
          currentTableId={selectedTableId}
          onSelectTable={(tableId) => {
            setSelectedTableId(tableId);
          }}
          onNavigateToTable={(tableId) => {
            setSelectedTableId(tableId);
            setActiveTab(tableId === "tab-grid-2026-v1" ? "grid-official" : "mirror");
          }}
          onSimulateUnit={(unit) => setSelectedUnitForSimulate(unit)}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 0: TABELA FINANCIAMENTO ARV GRID (OFICIAL)           */}
      {/* ======================================================== */}
      {activeTab === "grid-official" && currentTable && (
        <GridSalesTableView
          table={currentTable}
          units={tableUnits.length > 0 ? tableUnits : units.filter(u => u.speId === "spe-grid")}
          onSimulateProposal={(unit) => setSelectedUnitForSimulate(unit)}
          onUpdateUnit={handleUpdateUnit}
          onUpdateUnitsBatch={handleUpdateUnitsBatch}
          onAddUnit={handleAddUnit}
          onDeleteUnit={handleDeleteUnit}
          onDeleteUnitsBatch={handleDeleteUnitsBatch}
          onImportUnits={handleImportUnits}
        />
      )}

      {/* ======================================================== */}
      {/* TAB 1: ESPELHO DE VENDAS & GESTÃO DE UNIDADES            */}
      {/* ======================================================== */}
      {activeTab === "mirror" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar unidade, tipologia, comprador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="Disponível">Disponível ({tableStats.availableUnits})</option>
                  <option value="Reservada">Reservada ({tableStats.reservedUnits})</option>
                  <option value="Vendida">Vendida ({tableStats.soldUnits})</option>
                  <option value="Bloqueada">Bloqueada</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400">Tipologia:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="ALL">Todas as Tipologias</option>
                  <option value="Studio">Studio</option>
                  <option value="1 Suíte + 1 Quarto">1 Suíte + 1 Quarto</option>
                  <option value="2 Suítes">2 Suítes</option>
                  <option value="3 Suítes">3 Suítes</option>
                  <option value="Garden">Garden</option>
                  <option value="Cobertura Duplex">Cobertura Duplex</option>
                  <option value="Loja Térrea">Loja Térrea</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle & Legend */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Disponível
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reservada
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Vendida
                </span>
              </div>

              <div className="flex p-0.5 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === "table"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Tabela Oficial
                </button>
                <button
                  onClick={() => setViewMode("matrix")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === "matrix"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Espelho / Andares
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Lista Completa
                </button>
              </div>
            </div>
          </div>

          {/* VIEW 0: OFFICIAL TABLE VIEW */}
          {viewMode === "table" && currentTable && (
            <GridSalesTableView
              table={currentTable}
              units={tableUnits}
              onSimulateProposal={(unit) => setSelectedUnitForSimulate(unit)}
              onUpdateUnit={handleUpdateUnit}
              onUpdateUnitsBatch={handleUpdateUnitsBatch}
              onAddUnit={handleAddUnit}
              onDeleteUnit={handleDeleteUnit}
              onDeleteUnitsBatch={handleDeleteUnitsBatch}
              onImportUnits={handleImportUnits}
            />
          )}

          {/* VIEW 1: MATRIX / FLOOR PLAN */}
          {viewMode === "matrix" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Mapa de Andares & Espelho de Vendas Interativo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Clique em qualquer unidade para ver a ficha técnica, simular condições ou emitir
                    proposta comercial.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-400">
                  {filteredUnits.length} unidades encontradas
                </div>
              </div>

              <div className="space-y-4">
                {distinctFloors.map((floorNum) => {
                  const floorUnits = filteredUnits.filter((u) => u.floor === floorNum);
                  if (floorUnits.length === 0) return null;

                  return (
                    <div
                      key={floorNum}
                      className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800"
                    >
                      {/* Floor Indicator Badge */}
                      <div className="w-28 shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-mono font-black text-xs">
                          {floorNum === 0 ? "T" : `${floorNum}º`}
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                            {floorNum === 0 ? "Pav. Térreo" : `${floorNum}º Pavimento`}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {floorUnits.length} unidade(s)
                          </span>
                        </div>
                      </div>

                      {/* Units Cards Grid in this floor */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full">
                        {floorUnits.map((unit) => {
                          const isAvailable = unit.status === "Disponível";
                          const isReserved = unit.status === "Reservada";
                          const isSold = unit.status === "Vendida";

                          return (
                            <div
                              key={unit.id}
                              onClick={() => setSelectedUnitForDetail(unit)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group hover:scale-[1.02] hover:shadow-md ${
                                isAvailable
                                  ? "bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500"
                                  : isReserved
                                  ? "bg-amber-50/50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80 hover:border-amber-500"
                                  : "bg-slate-100 dark:bg-slate-950/80 border-slate-300 dark:border-slate-800 opacity-85"
                              }`}
                            >
                              {/* Top Bar inside unit card */}
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-black text-sm text-slate-900 dark:text-white">
                                  {unit.unitNumber}
                                </span>
                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    isAvailable
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : isReserved
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                      : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                  }`}
                                >
                                  {unit.status}
                                </span>
                              </div>

                              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 line-clamp-1">
                                {unit.type} • {unit.privateAreaM2} m²
                              </div>

                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                {unit.solarOrientation} • {unit.garageType}
                              </div>

                              {/* Price */}
                              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                                <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                                  {formatBrl(unit.basePrice)}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400">
                                  {unit.cubPrice.toFixed(1)} CUBs
                                </span>
                              </div>

                              {/* Hover Action Bar */}
                              <div className="mt-2 flex items-center justify-between gap-1 pt-1 opacity-90">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedUnitForSimulate(unit);
                                  }}
                                  className="w-full py-1 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                                >
                                  <Calculator className="w-3 h-3" /> Simular Fluxo
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: DETAILED LIST TABLE */}
          {viewMode === "list" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Unidade</th>
                      <th className="p-3">Tipologia</th>
                      <th className="p-3">Andar</th>
                      <th className="p-3 text-right">Área Priv. (m²)</th>
                      <th className="p-3">Orientação Solar</th>
                      <th className="p-3">Garagem</th>
                      <th className="p-3 text-right">Valor Venda (R$)</th>
                      <th className="p-3 text-right">Valor em CUBs</th>
                      <th className="p-3 text-right">R$ / m²</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredUnits.map((unit) => (
                      <tr
                        key={unit.id}
                        onClick={() => setSelectedUnitForDetail(unit)}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-950/60 cursor-pointer transition-colors"
                      >
                        <td className="p-3 font-black text-slate-900 dark:text-white">
                          {unit.unitNumber}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-bold">
                          {unit.type}
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          {unit.floor === 0 ? "Térreo" : `${unit.floor}º`}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                          {unit.privateAreaM2} m²
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {unit.solarOrientation}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {unit.garageType}
                        </td>
                        <td className="p-3 text-right font-black font-mono text-slate-900 dark:text-white">
                          {formatBrl(unit.basePrice)}
                        </td>
                        <td className="p-3 text-right font-bold font-mono text-blue-600 dark:text-blue-400">
                          {unit.cubPrice.toFixed(2)} CUBs
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          {formatBrl(unit.pricePerM2)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              unit.status === "Disponível"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : unit.status === "Reservada"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                            }`}
                          >
                            {unit.status}
                          </span>
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedUnitForSimulate(unit)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-xs flex items-center gap-1 mx-auto transition-all"
                          >
                            <Calculator className="w-3 h-3" /> Simular
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TABELAS DE VENDAS & VIGÊNCIAS                     */}
      {/* ======================================================== */}
      {activeTab === "tables" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Tabelas de Vendas Cadastradas por Empreendimento
              </h3>
              <p className="text-xs text-slate-500">
                Gerencie versões, datas de vigência, reajustes e parâmetros de comissão.
              </p>
            </div>
            <button
              onClick={() => {
                setTableToClone(null);
                setIsNewTableOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" /> Criar Nova Tabela
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((tbl) => {
              const isSelected = tbl.id === selectedTableId;

              return (
                <div
                  key={tbl.id}
                  className={`p-5 rounded-3xl border transition-all ${
                    isSelected
                      ? "bg-blue-50/40 dark:bg-blue-950/20 border-blue-500 dark:border-blue-500 shadow-md"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 block">
                        {tbl.speName}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {tbl.name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {tbl.version}
                    </span>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Vigência:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {new Date(tbl.validFrom).toLocaleDateString("pt-BR")} até{" "}
                        {new Date(tbl.validUntil).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">CUB Ref:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {formatBrl(tbl.cubReferenceValue)} / m²
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">VGV Total:</span>
                      <span className="font-mono font-black text-slate-900 dark:text-white">
                        {formatBrl(tbl.totalVgv)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Comissão Padrão:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {tbl.defaultCommissionPercent}%
                      </span>
                    </div>
                  </div>

                  {tbl.description && (
                    <p className="text-[11px] text-slate-500 mt-3 line-clamp-2">{tbl.description}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedTableId(tbl.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {isSelected ? "Tabela Selecionada" : "Selecionar Tabela"}
                    </button>

                    <button
                      onClick={() => {
                        setTableToClone(tbl);
                        setIsNewTableOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 flex items-center gap-1 transition-all"
                    >
                      <Copy className="w-3 h-3" /> Clonar Revisão
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SIMULADOR DE CONDIÇÕES DE PAGAMENTO INTEGRADO     */}
      {/* ======================================================== */}
      {activeTab === "simulator" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Simulador de Fluxo Comercial em Tempo Real
                </h3>
                <p className="text-xs text-slate-500">
                  Selecione qualquer unidade do estoque para projetar o cronograma financeiro e
                  gerar propostas instantâneas para o WhatsApp do investidor.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {tableUnits
                .filter((u) => u.status === "Disponível" || u.status === "Reservada")
                .map((unit) => (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnitForSimulate(unit)}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-950/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        {unit.unitNumber} - {unit.type}
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                        {unit.cubPrice.toFixed(1)} CUBs
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {unit.privateAreaM2} m² • {unit.solarOrientation} • {unit.garageType}
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                        {formatBrl(unit.basePrice)}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Calculator className="w-3.5 h-3.5" /> Abrir Simulador
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PAINEL CUB & CORREÇÃO MONETÁRIA                   */}
      {/* ======================================================== */}
      {activeTab === "cub" && (
        <div className="space-y-6">
          {/* CUB Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block">
                CUB/SC Oficial Vigente
              </span>
              <div className="text-3xl font-black mt-2 font-mono">
                {formatBrl(CURRENT_DEFAULT_CUB_SC)}
              </div>
              <p className="text-xs text-blue-100 mt-2">
                Padrão R8-N (Residencial Padrão Normal) divulgado pelo Sinduscon Santa Catarina.
              </p>
              <div className="mt-4 pt-3 border-t border-blue-400/30 flex justify-between text-xs font-bold">
                <span>Variação Mensal: +0,42%</span>
                <span>Acumulado 12m: +4,85%</span>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Regra Contratual de Correção
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Indexação 100% CUB durante o Período de Obras
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Todas as parcelas de entrada, mensais e balões semestrais são vinculadas ao CUB da
                data base do contrato, garantindo equilíbrio econômico-financeiro para o investidor
                e para a construtora.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Segurança Jurídica & Repasse
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                Lei Federal 4.591/64
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                O CUB é o índice oficial do setor imobiliário brasileiro para reajuste monetário de
                contratos de promessa de compra e venda até a expedição do Habite-se.
              </p>
            </div>
          </div>

          {/* Historical CUB Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Série Histórica do CUB/SC (Sinduscon)
                </h3>
                <p className="text-xs text-slate-500">
                  Valores mensais por m² e índices de reajuste acumulados para aplicação nas tabelas.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Mês / Ano</th>
                    <th className="p-3">Estado / Região</th>
                    <th className="p-3">Padrão da Obra</th>
                    <th className="p-3 text-right">Valor CUB (R$/m²)</th>
                    <th className="p-3 text-right">Var. Mensal (%)</th>
                    <th className="p-3 text-right">Acumulado Ano (%)</th>
                    <th className="p-3 text-right">Acumulado 12 Meses (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {HISTORICAL_CUB_RECORDS.map((rec) => (
                    <tr key={rec.monthYear} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">
                        {rec.displayMonth}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {rec.state} (Santa Catarina)
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {rec.projectStandard}
                      </td>
                      <td className="p-3 text-right font-black font-mono text-blue-600 dark:text-blue-400">
                        {formatBrl(rec.valueBrl)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{rec.monthlyVariationPercent}%
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        +{rec.accumulatedYearPercent}%
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        +{rec.accumulated12mPercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: PROPOSTAS COMERCIAIS & RESERVAS                   */}
      {/* ======================================================== */}
      {activeTab === "proposals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Histórico de Propostas Comerciais Emitidas
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhe o status das propostas geradas para investidores e corretores parceiros.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Cliente / Investidor</th>
                    <th className="p-3">Empreendimento / Unidade</th>
                    <th className="p-3">Corretor / Imobiliária</th>
                    <th className="p-3 text-right">Valor Final (R$)</th>
                    <th className="p-3 text-right">Valor em CUBs</th>
                    <th className="p-3">Condição</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Data Emissão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {proposals.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40">
                      <td className="p-3 font-mono font-bold text-slate-400">{prop.id}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{prop.clientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{prop.clientPhone}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{prop.speName}</div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                          {prop.unitNumber} ({prop.unitType})
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        <div>{prop.brokerName}</div>
                        <div className="text-[10px] text-slate-400">{prop.realtorAgency}</div>
                      </td>
                      <td className="p-3 text-right font-black font-mono text-slate-900 dark:text-white">
                        {formatBrl(prop.finalValueBrl)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                        {prop.finalValueCubs.toFixed(2)} CUBs
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 text-[11px]">
                        {prop.conditionTemplateName}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          {prop.status}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500">
                        {new Date(prop.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <NewPriceTableModal
        isOpen={isNewTableOpen}
        onClose={() => setIsNewTableOpen(false)}
        spes={spes}
        onSave={handleSaveNewTable}
        baseTableToClone={tableToClone}
      />

      <UnitDetailModal
        isOpen={!!selectedUnitForDetail}
        onClose={() => setSelectedUnitForDetail(null)}
        unit={selectedUnitForDetail}
        table={currentTable!}
        onSaveUnit={handleUpdateUnit}
        onOpenSimulator={(u) => setSelectedUnitForSimulate(u)}
      />

      <SimulateProposalModal
        isOpen={!!selectedUnitForSimulate}
        onClose={() => setSelectedUnitForSimulate(null)}
        unit={selectedUnitForSimulate}
        table={currentTable!}
        onSaveProposal={handleSaveProposal}
      />

      {currentTable && (
        <BulkPriceAdjustmentModal
          isOpen={isBulkAdjustOpen}
          onClose={() => setIsBulkAdjustOpen(false)}
          table={currentTable}
          units={units}
          onApplyAdjustment={handleApplyBulkAdjustment}
        />
      )}
    </div>
  );
};
