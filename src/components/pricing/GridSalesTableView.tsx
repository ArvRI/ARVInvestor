import React, { useState, useMemo, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  Layers,
  Building2,
  TrendingUp,
  Share2,
  CheckCircle,
  Copy,
  Calculator,
  RefreshCw,
  Info,
  ChevronDown,
  Sparkles,
  Sliders,
  DollarSign,
  ArrowUpDown,
  Edit3,
  Save,
  Plus,
  Trash2,
  X,
  Upload,
  CheckSquare,
  Square,
  Percent,
  Check,
  AlertTriangle,
  FileCheck
} from "lucide-react";
import * as XLSX from "xlsx";
import { PriceTable, PricingUnit, UnitType, UnitStatus, SolarOrientation, GarageType } from "../../types/pricing";
import { CUBService, CURRENT_DEFAULT_CUB_SC, HISTORICAL_CUB_RECORDS } from "../../services/pricing/CUBService";
import { ExcelImportModal } from "./ExcelImportModal";

interface GridSalesTableViewProps {
  table: PriceTable;
  units: PricingUnit[];
  onSimulateProposal: (unit: PricingUnit) => void;
  onUpdateUnit?: (unit: PricingUnit) => void;
  onUpdateUnitsBatch?: (units: PricingUnit[]) => void;
  onAddUnit?: (unit: PricingUnit) => void;
  onDeleteUnit?: (unitId: string) => void;
  onDeleteUnitsBatch?: (unitIds: string[]) => void;
  onImportUnits?: (units: PricingUnit[], mode: "merge" | "replace") => void;
}

export const GridSalesTableView: React.FC<GridSalesTableViewProps> = ({
  table,
  units,
  onSimulateProposal,
  onUpdateUnit,
  onUpdateUnitsBatch,
  onAddUnit,
  onDeleteUnit,
  onDeleteUnitsBatch,
  onImportUnits,
}) => {
  // Local state for filters and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Disponível" | "Vendida" | "Reservada">("ALL");
  const [floorFilter, setFloorFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [customCubValue, setCustomCubValue] = useState<number>(table.cubReferenceValue || CURRENT_DEFAULT_CUB_SC);
  const [showCubSimulator, setShowCubSimulator] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"unitNumber" | "floor" | "basePrice" | "privateAreaM2">("floor");
  const [sortAsc, setSortAsc] = useState(true);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedUnitsMap, setEditedUnitsMap] = useState<Record<string, PricingUnit>>({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingModalUnit, setEditingModalUnit] = useState<PricingUnit | null>(null);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);

  // Multi-selection state for batch actions
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [isBatchReajusteOpen, setIsBatchReajusteOpen] = useState(false);
  const [batchPercentChange, setBatchPercentChange] = useState<number>(5);

  // Synchronize custom CUB when table changes
  useEffect(() => {
    if (table.cubReferenceValue) {
      setCustomCubValue(table.cubReferenceValue);
    }
  }, [table.cubReferenceValue]);

  // Track edits
  const handleCellChange = (unitId: string, field: keyof PricingUnit, value: any) => {
    const original = editedUnitsMap[unitId] || units.find((u) => u.id === unitId);
    if (!original) return;

    let updated = { ...original, [field]: value };

    // Auto recalculate dependent fields if price or area changes
    if (field === "basePrice" || field === "privateAreaM2" || field === "internalPrivateAreaM2" || field === "externalPrivateAreaM2") {
      const internal = Number(updated.internalPrivateAreaM2 || 0);
      const external = Number(updated.externalPrivateAreaM2 || 0);
      const priv = field === "privateAreaM2" ? Number(value) : (internal + external || updated.privateAreaM2);
      
      updated.privateAreaM2 = priv;
      const price = Number(updated.basePrice || 0);
      
      updated.pricePerM2 = priv > 0 ? Math.round(price / priv) : 0;
      updated.cubPrice = customCubValue > 0 ? Number((price / customCubValue).toFixed(2)) : 0;
      updated.cubPerM2 = priv > 0 && customCubValue > 0 ? Number((updated.cubPrice / priv).toFixed(2)) : 0;
      
      // Auto standard flow
      updated.downPaymentAto = Math.round(price * 0.12);
      updated.monthlyInstallment40x = Math.round((price * 0.15) / 40);
      updated.balloonInstallment6x = Math.round((price * 0.08) / 6);
      updated.finalInstallment = Math.round(price * 0.05);
      updated.financingBalance = Math.round(price * 0.60);
    }

    setEditedUnitsMap((prev) => ({
      ...prev,
      [unitId]: updated,
    }));
  };

  // Save all inline edits
  const handleSaveAllEdits = () => {
    const modifiedUnits = Object.values(editedUnitsMap);
    if (modifiedUnits.length > 0 && onUpdateUnitsBatch) {
      onUpdateUnitsBatch(modifiedUnits);
    } else if (modifiedUnits.length > 0 && onUpdateUnit) {
      modifiedUnits.forEach((u) => onUpdateUnit(u));
    }
    setEditedUnitsMap({});
    setIsEditMode(false);
    showToast(`${modifiedUnits.length} unidade(s) atualizada(s) com sucesso!`);
  };

  // Discard edits
  const handleDiscardEdits = () => {
    setEditedUnitsMap({});
    setIsEditMode(false);
  };

  // Show Toast
  const showToast = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3500);
  };

  // Quick helper for current working units (blends original with pending edits)
  const currentWorkingUnits = useMemo(() => {
    return units.map((u) => editedUnitsMap[u.id] || u);
  }, [units, editedUnitsMap]);

  // Group floors for select
  const floorOptions = useMemo(() => {
    const floors = new Set<string>();
    currentWorkingUnits.forEach((u) => {
      if (u.floorName) floors.add(u.floorName);
    });
    return Array.from(floors);
  }, [currentWorkingUnits]);

  // Group types for select
  const typeOptions = useMemo(() => {
    const types = new Set<string>();
    currentWorkingUnits.forEach((u) => {
      types.add(u.type);
    });
    return Array.from(types);
  }, [currentWorkingUnits]);

  // Recalculate dynamic prices if CUB value was adjusted
  const cubRatio = customCubValue / (table.cubReferenceValue || CURRENT_DEFAULT_CUB_SC);

  // Filtered & Sorted Units
  const filteredUnits = useMemo(() => {
    return currentWorkingUnits
      .filter((u) => {
        if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
        if (floorFilter !== "ALL" && u.floorName !== floorFilter) return false;
        if (typeFilter !== "ALL" && u.type !== typeFilter) return false;
        if (searchTerm) {
          const s = searchTerm.toLowerCase();
          const matchUnit = u.unitNumber.toLowerCase().includes(s);
          const matchPos = u.position?.toLowerCase().includes(s) || false;
          const matchType = u.type.toLowerCase().includes(s);
          const matchFloor = u.floorName?.toLowerCase().includes(s) || false;
          if (!matchUnit && !matchPos && !matchType && !matchFloor) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === "unitNumber") cmp = a.unitNumber.localeCompare(b.unitNumber, undefined, { numeric: true });
        else if (sortField === "floor") cmp = a.floor - b.floor;
        else if (sortField === "basePrice") cmp = a.basePrice - b.basePrice;
        else if (sortField === "privateAreaM2") cmp = a.privateAreaM2 - b.privateAreaM2;
        return sortAsc ? cmp : -cmp;
      });
  }, [currentWorkingUnits, statusFilter, floorFilter, typeFilter, searchTerm, sortField, sortAsc]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const totalUnits = currentWorkingUnits.length;
    const availableUnits = currentWorkingUnits.filter((u) => u.status === "Disponível").length;
    const soldUnits = currentWorkingUnits.filter((u) => u.status === "Vendida").length;
    const reservedUnits = currentWorkingUnits.filter((u) => u.status === "Reservada").length;
    const totalVgv = currentWorkingUnits.reduce((acc, u) => acc + (u.basePrice * (u.status === "Disponível" ? cubRatio : 1)), 0);
    const availableVgv = currentWorkingUnits
      .filter((u) => u.status === "Disponível")
      .reduce((acc, u) => acc + (u.basePrice * cubRatio), 0);
    const soldVgv = currentWorkingUnits
      .filter((u) => u.status === "Vendida")
      .reduce((acc, u) => acc + u.basePrice, 0);

    const percentSold = totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0;
    const availableList = currentWorkingUnits.filter(u => u.status === "Disponível");
    const totalAvailArea = availableList.reduce((acc, u) => acc + u.privateAreaM2, 0);
    const avgM2 = totalAvailArea > 0 ? availableVgv / totalAvailArea : 16180;

    return {
      totalUnits,
      availableUnits,
      soldUnits,
      reservedUnits,
      totalVgv,
      availableVgv,
      soldVgv,
      percentSold,
      avgM2,
    };
  }, [currentWorkingUnits, cubRatio]);

  // Helper calculation for dynamic flow per unit
  const getDynamicUnitFlow = (u: PricingUnit) => {
    if (u.status === "Vendida") {
      return {
        total: 0,
        ato: 0,
        parcela40x: 0,
        reforco6x: 0,
        parcelaFinal: 0,
        financiamento: 0,
        isVendido: true,
      };
    }

    const total = u.basePrice * cubRatio;
    const ato = u.downPaymentAto ? u.downPaymentAto * cubRatio : total * 0.12;
    const parcela40x = u.monthlyInstallment40x ? u.monthlyInstallment40x * cubRatio : (total * 0.15) / 40;
    const reforco6x = u.balloonInstallment6x ? u.balloonInstallment6x * cubRatio : (total * 0.08) / 6;
    const parcelaFinal = u.finalInstallment ? u.finalInstallment * cubRatio : total * 0.05;
    const financiamento = u.financingBalance ? u.financingBalance * cubRatio : total * 0.60;

    return {
      total,
      ato,
      parcela40x,
      reforco6x,
      parcelaFinal,
      financiamento,
      isVendido: false,
    };
  };

  const copyUnitDetails = (u: PricingUnit) => {
    const flow = getDynamicUnitFlow(u);
    const text = `🏢 *ARV GRID - Tabela Oficial de Vendas*
📌 *Unidade:* ${u.unitNumber} (${u.type})
📍 *Pavimento:* ${u.floorName || `${u.floor}° Pavimento`} | *Posição:* ${u.position || "N/A"}
📐 *Área Interna:* ${u.internalPrivateAreaM2 ? `${u.internalPrivateAreaM2} m²` : `${u.privateAreaM2} m²`}${u.externalPrivateAreaM2 ? ` + ${u.externalPrivateAreaM2} m² externa` : ""}
🚗 *Garagem:* ${u.garageType}
📊 *Status:* ${u.status}

💰 *FLUXO DE FINANCIAMENTO (CUB/SC: ${CUBService.formatCurrency(customCubValue)}):*
• *Valor Total:* ${CUBService.formatCurrency(flow.total)}
• *Ato (Ago/26 - 12%):* ${CUBService.formatCurrency(flow.ato)}
• *40X Mensais (Set/26 a Dez/29):* ${CUBService.formatCurrency(flow.parcela40x)} / mês
• *6X Reforços Semestrais:* ${CUBService.formatCurrency(flow.reforco6x)} / reforço
• *Parcela Final (5%):* ${CUBService.formatCurrency(flow.parcelaFinal)}
• *Financiamento Bancário (60%):* ${CUBService.formatCurrency(flow.financiamento)}

ℹ️ _Registro de Incorporação: R-1-3.706 | ARV Empreendimentos_`;

    navigator.clipboard.writeText(text);
    showToast(`Unidade ${u.unitNumber} copiada para o WhatsApp!`);
  };

  // Export to Real Excel (.xlsx)
  const handleExportXLSX = () => {
    const exportData = filteredUnits.map((u) => {
      const flow = getDynamicUnitFlow(u);
      return {
        "Unidade": u.unitNumber,
        "Pavimento": u.floorName || `${u.floor}° Pavimento`,
        "Tipologia": u.type,
        "Posição": u.position || "------",
        "Área Privativa Interna (m²)": u.internalPrivateAreaM2 || u.privateAreaM2,
        "Área Privativa Externa (m²)": u.externalPrivateAreaM2 || 0,
        "Área Total Privativa (m²)": u.privateAreaM2,
        "Garagem": u.garageType,
        "Status": u.status,
        "Valor Total (R$)": flow.isVendido ? 0 : flow.total,
        "Ato (Agosto/26 - 12%)": flow.isVendido ? 0 : flow.ato,
        "Parcelas 40X Mensais (15%)": flow.isVendido ? 0 : flow.parcela40x,
        "Reforços 6X Semestrais (8%)": flow.isVendido ? 0 : flow.reforco6x,
        "Parcela Final (5%)": flow.isVendido ? 0 : flow.parcelaFinal,
        "Financiamento Bancário (60%)": flow.isVendido ? 0 : flow.financiamento,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tabela Financiamento");

    // Formatting columns
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 22 },
      { wch: 18 },
      { wch: 26 },
      { wch: 22 },
      { wch: 22 },
      { wch: 20 },
      { wch: 18 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
      { wch: 18 },
      { wch: 22 },
    ];

    XLSX.writeFile(workbook, `TABELA_FINANCIAMENTO_ARV_GRID_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast("Tabela exportada com sucesso em Excel (.xlsx)!");
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Unidade",
      "Pavimento",
      "Tipologia",
      "Posicao",
      "Area_Privativa_Interna_m2",
      "Area_Privativa_Externa_m2",
      "Garagem",
      "Status",
      "Valor_Total_Brl",
      "Ato_Ago26_Brl",
      "Parcelas_40X_Brl",
      "Reforcos_6X_Brl",
      "Parcela_Final_Brl",
      "Financiamento_60_Brl",
    ];

    const rows = filteredUnits.map((u) => {
      const flow = getDynamicUnitFlow(u);
      return [
        `"${u.unitNumber}"`,
        `"${u.floorName || ""}"`,
        `"${u.type}"`,
        `"${u.position || ""}"`,
        u.internalPrivateAreaM2 || u.privateAreaM2,
        u.externalPrivateAreaM2 || 0,
        `"${u.garageType}"`,
        `"${u.status}"`,
        flow.isVendido ? 0 : flow.total.toFixed(2),
        flow.isVendido ? 0 : flow.ato.toFixed(2),
        flow.isVendido ? 0 : flow.parcela40x.toFixed(2),
        flow.isVendido ? 0 : flow.reforco6x.toFixed(2),
        flow.isVendido ? 0 : flow.parcelaFinal.toFixed(2),
        flow.isVendido ? 0 : flow.financiamento.toFixed(2),
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TABELA_FINANCIAMENTO_GRID_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Arquivo CSV baixado com sucesso!");
  };

  const handlePrint = () => {
    window.print();
  };

  // Multi-select handlers
  const handleToggleSelectAll = () => {
    if (selectedUnitIds.length === filteredUnits.length) {
      setSelectedUnitIds([]);
    } else {
      setSelectedUnitIds(filteredUnits.map((u) => u.id));
    }
  };

  const handleToggleSelectUnit = (unitId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  // Bulk status update
  const handleBulkStatusChange = (newStatus: UnitStatus) => {
    if (selectedUnitIds.length === 0) return;
    const updated = currentWorkingUnits
      .filter((u) => selectedUnitIds.includes(u.id))
      .map((u) => ({ ...u, status: newStatus }));

    if (onUpdateUnitsBatch) {
      onUpdateUnitsBatch(updated);
    } else if (onUpdateUnit) {
      updated.forEach((u) => onUpdateUnit(u));
    }
    setSelectedUnitIds([]);
    showToast(`${updated.length} unidade(s) alterada(s) para status "${newStatus}"!`);
  };

  // Bulk price adjustment (% increase or decrease)
  const handleApplyBatchPriceChange = () => {
    if (selectedUnitIds.length === 0) return;
    const factor = 1 + batchPercentChange / 100;
    const updated = currentWorkingUnits
      .filter((u) => selectedUnitIds.includes(u.id))
      .map((u) => {
        const newPrice = Math.round(u.basePrice * factor);
        const newCub = Number((newPrice / customCubValue).toFixed(2));
        const newPriceM2 = u.privateAreaM2 > 0 ? Math.round(newPrice / u.privateAreaM2) : 0;
        return {
          ...u,
          basePrice: newPrice,
          cubPrice: newCub,
          pricePerM2: newPriceM2,
          downPaymentAto: Math.round(newPrice * 0.12),
          monthlyInstallment40x: Math.round((newPrice * 0.15) / 40),
          balloonInstallment6x: Math.round((newPrice * 0.08) / 6),
          finalInstallment: Math.round(newPrice * 0.05),
          financingBalance: Math.round(newPrice * 0.60),
        };
      });

    if (onUpdateUnitsBatch) {
      onUpdateUnitsBatch(updated);
    } else if (onUpdateUnit) {
      updated.forEach((u) => onUpdateUnit(u));
    }
    setIsBatchReajusteOpen(false);
    setSelectedUnitIds([]);
    showToast(`Reajuste de ${batchPercentChange > 0 ? `+${batchPercentChange}%` : `${batchPercentChange}%`} aplicado em ${updated.length} unidades!`);
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedUnitIds.length === 0) return;
    if (confirm(`Deseja realmente remover as ${selectedUnitIds.length} unidades selecionadas?`)) {
      if (onDeleteUnitsBatch) {
        onDeleteUnitsBatch(selectedUnitIds);
      } else if (onDeleteUnit) {
        selectedUnitIds.forEach((id) => onDeleteUnit(id));
      }
      setSelectedUnitIds([]);
      showToast(`${selectedUnitIds.length} unidade(s) removida(s).`);
    }
  };

  // Single unit delete
  const handleDeleteSingle = (unit: PricingUnit) => {
    if (confirm(`Tem certeza que deseja remover a unidade ${unit.unitNumber}?`)) {
      if (onDeleteUnit) {
        onDeleteUnit(unit.id);
        showToast(`Unidade ${unit.unitNumber} removida.`);
      }
    }
  };

  // Quick Add Unit
  const handleCreateNewUnit = () => {
    const nextNum = units.length + 1;
    const newUnit: PricingUnit = {
      id: `unit-${table.id}-manual-${Date.now()}`,
      tableId: table.id,
      speId: table.speId,
      unitNumber: `Studio ${nextNum}01`,
      tower: "Torre Principal",
      floor: 3,
      floorName: "3° Pavimento",
      type: "Studio",
      position: "Fachada Norte",
      privateAreaM2: 36.5,
      internalPrivateAreaM2: 36.5,
      externalPrivateAreaM2: 0,
      totalAreaM2: 52.9,
      garageType: "Sem Vaga",
      solarOrientation: "Norte",
      viewDescription: "Fachada Norte",
      basePrice: Math.round(16200 * 36.5),
      cubPrice: Number(((16200 * 36.5) / customCubValue).toFixed(2)),
      pricePerM2: 16200,
      cubPerM2: Number((16200 / customCubValue).toFixed(2)),
      status: "Disponível",
      discountMaxPercent: 5.0,
      commissionPercent: 5.0,
      downPaymentAto: Math.round(16200 * 36.5 * 0.12),
      monthlyInstallment40x: Math.round((16200 * 36.5 * 0.15) / 40),
      balloonInstallment6x: Math.round((16200 * 36.5 * 0.08) / 6),
      finalInstallment: Math.round(16200 * 36.5 * 0.05),
      financingBalance: Math.round(16200 * 36.5 * 0.60),
    };

    if (onAddUnit) {
      onAddUnit(newUnit);
      showToast(`Nova unidade ${newUnit.unitNumber} adicionada!`);
      // Open inline edit for this unit
      setIsEditMode(true);
      setEditedUnitsMap((prev) => ({ ...prev, [newUnit.id]: newUnit }));
    }
  };

  const pendingEditsCount = Object.keys(editedUnitsMap).length;

  return (
    <div id="grid-sales-table-view" className="space-y-6">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{copiedNotification}</span>
        </div>
      )}

      {/* Official Header Banner matching Attached Model */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
                Tabela Oficial de Financiamento
              </span>
              <span className="text-slate-300 text-xs font-medium">
                Reg. Incorporação: <strong className="text-white">{table.incorporationRegistration || "R-1-3.706"}</strong>
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-amber-400" />
              TABELA FINANCIAMENTO - ARV GRID
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Empreendimento Residencial & Comercial • Rua Juvêncio Costa, Trindade - Florianópolis/SC • Entrega: Dezembro/2029
            </p>
          </div>

          {/* Action Tools & Integration Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Import from Excel button */}
            <button
              id="btn-import-excel"
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> Importar Excel / CSV
            </button>

            {/* Quick Edit Mode Toggle */}
            <button
              id="btn-toggle-edit-mode"
              onClick={() => {
                if (isEditMode) {
                  if (pendingEditsCount > 0) {
                    if (confirm("Deseja salvar as alterações antes de sair do modo de edição?")) {
                      handleSaveAllEdits();
                      return;
                    }
                  }
                  setIsEditMode(false);
                } else {
                  setIsEditMode(true);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md ${
                isEditMode
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-black animate-pulse"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              {isEditMode ? `Modo Edição Ativo (${pendingEditsCount})` : "Editar Tabela"}
            </button>

            {/* Quick Add Unit */}
            <button
              id="btn-add-unit"
              onClick={handleCreateNewUnit}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 transition-colors flex items-center gap-1.5"
              title="Adicionar nova unidade"
            >
              <Plus className="w-3.5 h-3.5" /> Nova Unidade
            </button>

            {/* Export XLSX Button */}
            <button
              id="btn-export-grid-xlsx"
              onClick={handleExportXLSX}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-600 transition-colors flex items-center gap-1.5"
              title="Exportar Planilha Excel Real (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Exportar .XLSX
            </button>

            {/* Export CSV Button */}
            <button
              id="btn-export-grid-csv"
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-100 border border-slate-600 transition-colors flex items-center gap-1.5"
              title="Exportar dados CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" /> CSV
            </button>

            {/* Print Button */}
            <button
              id="btn-print-grid-table"
              onClick={handlePrint}
              className="p-2 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
              title="Imprimir Tabela"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Reference CUB Info & Simulator */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <div>
              Mês de Referência da Tabela: <strong className="text-white">Agosto/2026</strong>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              CUB/SC Padrão (R8-N): <strong className="text-amber-400">{CUBService.formatCurrency(customCubValue)}</strong>
            </div>
            {customCubValue !== (table.cubReferenceValue || CURRENT_DEFAULT_CUB_SC) && (
              <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-[11px]">
                Simulação Ativa ({(cubRatio * 100 - 100 > 0 ? `+${(cubRatio * 100 - 100).toFixed(1)}%` : `${(cubRatio * 100 - 100).toFixed(1)}%`)})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCubSimulator(!showCubSimulator)}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Calculator className="w-3.5 h-3.5" />
              {showCubSimulator ? "Ocultar Simulador CUB" : "Simular Novo CUB/SC"}
            </button>
            {customCubValue !== (table.cubReferenceValue || CURRENT_DEFAULT_CUB_SC) && (
              <button
                onClick={() => setCustomCubValue(table.cubReferenceValue || CURRENT_DEFAULT_CUB_SC)}
                className="px-2.5 py-1 text-slate-400 hover:text-white text-xs flex items-center gap-1"
                title="Restaurar valor padrão da tabela"
              >
                <RefreshCw className="w-3 h-3" /> Restaurar
              </button>
            )}
          </div>
        </div>

        {/* Dynamic CUB Simulator Bar */}
        {showCubSimulator && (
          <div className="mt-4 p-4 bg-slate-950/60 rounded-2xl border border-indigo-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Simulador Dinâmico de Correção CUB/SC
                </h4>
                <p className="text-[11px] text-slate-400">
                  Ajuste o valor do CUB/SC para recalcular instantaneamente todas as parcelas e VGV da tabela:
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-xs">R$</span>
                  <input
                    type="number"
                    step="10"
                    value={customCubValue}
                    onChange={(e) => setCustomCubValue(Number(e.target.value))}
                    className="w-28 bg-transparent text-white font-bold text-xs focus:outline-hidden"
                  />
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCustomCubValue(Number((customCubValue * 1.03).toFixed(2)))}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                  >
                    +3%
                  </button>
                  <button
                    onClick={() => setCustomCubValue(Number((customCubValue * 1.05).toFixed(2)))}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                  >
                    +5%
                  </button>
                  <button
                    onClick={() => setCustomCubValue(Number((customCubValue * 1.10).toFixed(2)))}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                  >
                    +10%
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Mode Sticky Bar (when active) */}
      {isEditMode && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                Modo de Edição Rápida da Tabela
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                  {pendingEditsCount} alteração(ões) pendente(s)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Altere valores, áreas, tipologias e status diretamente nas células da tabela. O recálculo das parcelas é automático.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscardEdits}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Descartar
            </button>
            <button
              onClick={handleSaveAllEdits}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">VGV Total</div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1">
            {CUBService.formatCurrency(metrics.totalVgv)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {metrics.totalUnits} unidades cadastradas
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">VGV Disponível</div>
          <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {CUBService.formatCurrency(metrics.availableVgv)}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">
            {metrics.availableUnits} unidades disponíveis
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">VGV Vendido</div>
          <div className="text-base font-black text-slate-700 dark:text-slate-300 mt-1">
            {CUBService.formatCurrency(metrics.soldVgv)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {metrics.soldUnits} unidades ({metrics.percentSold.toFixed(0)}%)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">% Comercializado</div>
          <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-1">
            {metrics.percentSold.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${metrics.percentSold}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Preço Médio / m²</div>
          <div className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {CUBService.formatCurrency(metrics.avgM2)}
          </div>
          <div className="text-[11px] text-indigo-500/80 mt-0.5">
            {(metrics.avgM2 / customCubValue).toFixed(2)} CUB/m²
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Condição Padrão</div>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
            12% Ato + 40X + 6X
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            60% Financiamento
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-grid-units"
              type="text"
              placeholder="Buscar unidade (ex: 201, Cobertura, Loja, Norte, Enoé)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status filter */}
          <select
            id="select-grid-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">Status: Todos ({currentWorkingUnits.length})</option>
            <option value="Disponível">Disponíveis ({metrics.availableUnits})</option>
            <option value="Vendida">Vendidas ({metrics.soldUnits})</option>
            <option value="Reservada">Reservadas ({metrics.reservedUnits})</option>
          </select>

          {/* Floor filter */}
          <select
            id="select-grid-floor"
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">Pavimento: Todos</option>
            {floorOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          {/* Tipology filter */}
          <select
            id="select-grid-tipology"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">Tipologia: Todas</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Exibindo <strong>{filteredUnits.length}</strong> de {currentWorkingUnits.length} unidades</span>
        </div>
      </div>

      {/* Floating Multi-Selection Batch Actions Bar */}
      {selectedUnitIds.length > 0 && (
        <div className="p-4 bg-indigo-900 text-white rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-black text-sm">{selectedUnitIds.length} unidade(s) selecionada(s)</span>
              <span className="text-xs text-indigo-200 ml-2">Escolha uma ação em lote:</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange("Disponível")}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Marcar Disponível
            </button>
            <button
              onClick={() => handleBulkStatusChange("Vendida")}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Marcar Vendida
            </button>
            <button
              onClick={() => handleBulkStatusChange("Reservada")}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Marcar Reservada
            </button>

            <button
              onClick={() => setIsBatchReajusteOpen(true)}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Percent className="w-3.5 h-3.5" /> Reajustar Preço %
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>

            <button
              onClick={() => setSelectedUnitIds([])}
              className="px-2 py-1.5 text-indigo-300 hover:text-white text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Main Official Sales Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              ARV GRID - Espelho Oficial de Vendas & Fluxo
            </h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Índice de Correção: <strong className="text-slate-700 dark:text-slate-300">CUB/SC Médio Sinduscon</strong></span>
            {isEditMode && (
              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                Edição em Célula Habilitada
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* Super Header */}
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700">
                <th className="p-3 text-center w-10">
                  <button
                    onClick={handleToggleSelectAll}
                    title="Selecionar Todos"
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  >
                    {selectedUnitIds.length > 0 && selectedUnitIds.length === filteredUnits.length ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th colSpan={7} className="p-3 text-center uppercase tracking-wider border-r border-slate-300 dark:border-slate-700 bg-slate-200/70 dark:bg-slate-800">
                  Dados da Unidade
                </th>
                <th colSpan={6} className="p-3 text-center uppercase tracking-wider bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border-r border-slate-300 dark:border-slate-700">
                  FLUXO FINANCIAMENTO
                </th>
                <th className="p-3 text-center uppercase tracking-wider">Ações</th>
              </tr>

              {/* Detailed Header Columns */}
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 text-center">#</th>
                <th className="p-3 whitespace-nowrap">
                  <button
                    onClick={() => {
                      if (sortField === "unitNumber") setSortAsc(!sortAsc);
                      else { setSortField("unitNumber"); setSortAsc(true); }
                    }}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white font-bold"
                  >
                    Unidade <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3 whitespace-nowrap">Pavimento</th>
                <th className="p-3 whitespace-nowrap">Tipologia</th>
                <th className="p-3 whitespace-nowrap">Posição</th>
                <th className="p-3 text-right whitespace-nowrap">Área Interna</th>
                <th className="p-3 text-right whitespace-nowrap">Área Externa</th>
                <th className="p-3 text-center whitespace-nowrap">Garagem</th>
                <th className="p-3 text-center whitespace-nowrap border-r border-slate-200 dark:border-slate-700">Status</th>

                {/* Fluxo Financiamento Columns */}
                <th className="p-3 text-right font-bold text-slate-900 dark:text-white bg-indigo-50/40 dark:bg-indigo-950/20 whitespace-nowrap">
                  <button
                    onClick={() => {
                      if (sortField === "basePrice") setSortAsc(!sortAsc);
                      else { setSortField("basePrice"); setSortAsc(true); }
                    }}
                    className="flex items-center justify-end gap-1 ml-auto hover:text-indigo-600 font-bold"
                  >
                    Valor total (R$) <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3 text-right bg-indigo-50/40 dark:bg-indigo-950/20 whitespace-nowrap">
                  Ato (agosto/26) [12%]
                </th>
                <th className="p-3 text-right bg-indigo-50/40 dark:bg-indigo-950/20 whitespace-nowrap">
                  Parcelas (40X)
                  <span className="block text-[10px] font-normal text-slate-500">Set/26 - Dez/29</span>
                </th>
                <th className="p-3 text-right bg-indigo-50/40 dark:bg-indigo-950/20 whitespace-nowrap">
                  Reforços (6X)
                  <span className="block text-[10px] font-normal text-slate-500">Semestrais [8%]</span>
                </th>
                <th className="p-3 text-right bg-indigo-50/40 dark:bg-indigo-950/20 whitespace-nowrap">
                  Parcela final [5%]
                </th>
                <th className="p-3 text-right bg-indigo-50/40 dark:bg-indigo-950/20 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  Financiamento [60%]
                </th>
                <th className="p-3 text-center whitespace-nowrap">Operações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={16} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma unidade encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u) => {
                  const flow = getDynamicUnitFlow(u);
                  const isVendido = u.status === "Vendida";
                  const isSelected = selectedUnitIds.includes(u.id);
                  const isEdited = !!editedUnitsMap[u.id];

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        isSelected ? "bg-indigo-50/70 dark:bg-indigo-950/40" : ""
                      } ${isEdited ? "bg-amber-50/40 dark:bg-amber-950/20" : ""} ${
                        isVendido && !isSelected ? "bg-slate-50/60 dark:bg-slate-900/40 opacity-75" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectUnit(u.id)}
                          className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Unidade */}
                      <td className="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={u.unitNumber}
                            onChange={(e) => handleCellChange(u.id, "unitNumber", e.target.value)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg w-24 font-bold text-slate-900 dark:text-white"
                          />
                        ) : (
                          u.unitNumber
                        )}
                      </td>

                      {/* Pavimento */}
                      <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={u.floorName || `${u.floor}° Pavimento`}
                            onChange={(e) => handleCellChange(u.id, "floorName", e.target.value)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg w-28 text-slate-900 dark:text-white"
                          />
                        ) : (
                          u.floorName || `${u.floor}° Pavimento`
                        )}
                      </td>

                      {/* Tipologia */}
                      <td className="p-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {isEditMode ? (
                          <select
                            value={u.type}
                            onChange={(e) => handleCellChange(u.id, "type", e.target.value)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                          >
                            <option value="Studio">Studio</option>
                            <option value="Studio - Garden">Studio - Garden</option>
                            <option value="2 Dormitórios">2 Dormitórios</option>
                            <option value="2 Suítes">2 Suítes</option>
                            <option value="Cobertura Linear">Cobertura Linear</option>
                            <option value="Loja/Sobreloja">Loja/Sobreloja</option>
                            <option value="Vaga simples">Vaga simples</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              u.type.includes("Garden")
                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40"
                                : u.type.includes("Cobertura") || u.type.includes("2 Dormitórios")
                                ? "bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-300/40"
                                : u.type.includes("Loja")
                                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/40"
                                : u.type.includes("Vaga")
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                : "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            }`}
                          >
                            {u.type}
                          </span>
                        )}
                      </td>

                      {/* Posição */}
                      <td className="p-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={u.position || ""}
                            onChange={(e) => handleCellChange(u.id, "position", e.target.value)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg w-28 text-slate-900 dark:text-white"
                          />
                        ) : (
                          u.position || "------"
                        )}
                      </td>

                      {/* Área Privativa Interna */}
                      <td className="p-3 text-right font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {isEditMode ? (
                          <input
                            type="number"
                            step="0.01"
                            value={u.internalPrivateAreaM2 || u.privateAreaM2}
                            onChange={(e) => handleCellChange(u.id, "internalPrivateAreaM2", Number(e.target.value))}
                            className="px-2 py-1 text-xs text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg w-20 font-medium text-slate-900 dark:text-white"
                          />
                        ) : (
                          u.internalPrivateAreaM2 ? `${u.internalPrivateAreaM2.toFixed(2)} m²` : `${u.privateAreaM2.toFixed(2)} m²`
                        )}
                      </td>

                      {/* Área Privativa Externa */}
                      <td className="p-3 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {isEditMode ? (
                          <input
                            type="number"
                            step="0.01"
                            value={u.externalPrivateAreaM2 || 0}
                            onChange={(e) => handleCellChange(u.id, "externalPrivateAreaM2", Number(e.target.value))}
                            className="px-2 py-1 text-xs text-right bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg w-20 text-slate-900 dark:text-white"
                          />
                        ) : u.externalPrivateAreaM2 && u.externalPrivateAreaM2 > 0 ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {u.externalPrivateAreaM2.toFixed(2)} m²
                          </span>
                        ) : (
                          <span className="text-slate-400">0,00</span>
                        )}
                      </td>

                      {/* Garagem */}
                      <td className="p-3 text-center text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {isEditMode ? (
                          <select
                            value={u.garageType}
                            onChange={(e) => handleCellChange(u.id, "garageType", e.target.value)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                          >
                            <option value="Sem Vaga">Sem Vaga</option>
                            <option value="Simples Coberta">Simples Coberta</option>
                            <option value="Dupla Coberta">Dupla Coberta</option>
                            <option value="01 vaga">01 vaga</option>
                            <option value="Vaga simples">Vaga simples</option>
                          </select>
                        ) : (
                          u.garageType
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        {isEditMode ? (
                          <select
                            value={u.status}
                            onChange={(e) => handleCellChange(u.id, "status", e.target.value)}
                            className="px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-slate-900 dark:text-white"
                          >
                            <option value="Disponível">Disponível</option>
                            <option value="Vendida">Vendida</option>
                            <option value="Reservada">Reservada</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              u.status === "Vendida"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                                : u.status === "Reservada"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            {u.status}
                          </span>
                        )}
                      </td>

                      {/* Fluxo: Valor Total */}
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white bg-indigo-50/20 dark:bg-indigo-950/10 whitespace-nowrap">
                        {isEditMode ? (
                          <input
                            type="number"
                            step="1000"
                            value={u.basePrice}
                            onChange={(e) => handleCellChange(u.id, "basePrice", Number(e.target.value))}
                            className="px-2 py-1 text-xs text-right bg-white dark:bg-slate-800 border border-indigo-400 rounded-lg w-28 font-bold text-indigo-700 dark:text-indigo-300"
                          />
                        ) : isVendido ? (
                          <span className="text-rose-500 font-semibold italic">VENDIDO</span>
                        ) : (
                          CUBService.formatCurrency(flow.total)
                        )}
                      </td>

                      {/* Fluxo: Ato */}
                      <td className="p-3 text-right text-slate-700 dark:text-slate-300 bg-indigo-50/20 dark:bg-indigo-950/10 whitespace-nowrap">
                        {isVendido ? <span className="text-slate-400">-</span> : CUBService.formatCurrency(flow.ato)}
                      </td>

                      {/* Fluxo: 40X Mensais */}
                      <td className="p-3 text-right font-medium text-slate-800 dark:text-slate-200 bg-indigo-50/20 dark:bg-indigo-950/10 whitespace-nowrap">
                        {isVendido ? <span className="text-slate-400">-</span> : CUBService.formatCurrency(flow.parcela40x)}
                      </td>

                      {/* Fluxo: 6X Reforços */}
                      <td className="p-3 text-right text-slate-700 dark:text-slate-300 bg-indigo-50/20 dark:bg-indigo-950/10 whitespace-nowrap">
                        {isVendido ? <span className="text-slate-400">-</span> : CUBService.formatCurrency(flow.reforco6x)}
                      </td>

                      {/* Fluxo: Parcela Final */}
                      <td className="p-3 text-right text-slate-700 dark:text-slate-300 bg-indigo-50/20 dark:bg-indigo-950/10 whitespace-nowrap">
                        {isVendido ? <span className="text-slate-400">-</span> : CUBService.formatCurrency(flow.parcelaFinal)}
                      </td>

                      {/* Fluxo: Financiamento */}
                      <td className="p-3 text-right font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/20 dark:bg-indigo-950/10 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                        {isVendido ? <span className="text-slate-400">-</span> : CUBService.formatCurrency(flow.financiamento)}
                      </td>

                      {/* Ações */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Edit Details Button */}
                          <button
                            id={`btn-edit-${u.unitNumber}`}
                            onClick={() => setEditingModalUnit(u)}
                            title="Editar todos os detalhes da unidade"
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Simulation Button */}
                          {!isVendido && (
                            <button
                              id={`btn-simulate-${u.unitNumber}`}
                              onClick={() => onSimulateProposal(u)}
                              title="Gerar Proposta Comercial / Simulação de Fluxo"
                              className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Copy WhatsApp */}
                          <button
                            id={`btn-copy-${u.unitNumber}`}
                            onClick={() => copyUnitDetails(u)}
                            title="Copiar dados formatados para WhatsApp"
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Unit */}
                          <button
                            id={`btn-delete-${u.unitNumber}`}
                            onClick={() => handleDeleteSingle(u)}
                            title="Remover Unidade"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Notes matching PDF */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Observações Oficiais:</strong> Todas as parcelas vencíveis até a entrega das chaves serão corrigidas mensal e cumulativamente pela variação do CUB/SC.
            </span>
          </div>
          <div>
            Empreendimento ARV GRID • Registro de Incorporação: <strong>R-1-3.706</strong>
          </div>
        </div>
      </div>

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        tableId={table.id}
        speId={table.speId}
        cubReferenceValue={customCubValue}
        currentUnitsCount={units.length}
        onImport={(importedUnits, mode) => {
          if (onImportUnits) {
            onImportUnits(importedUnits, mode);
            showToast(`${importedUnits.length} unidade(s) importada(s) do Excel com sucesso!`);
          }
        }}
      />

      {/* Batch Price Adjustment Modal */}
      {isBatchReajusteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Percent className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Reajuste em Lote ({selectedUnitIds.length} unidades)
                </h3>
              </div>
              <button
                onClick={() => setIsBatchReajusteOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Informe a porcentagem de aumento ou redução para aplicar nas unidades selecionadas:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Variação Percentual (%):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={batchPercentChange}
                    onChange={(e) => setBatchPercentChange(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setBatchPercentChange(3)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium"
                >
                  +3%
                </button>
                <button
                  onClick={() => setBatchPercentChange(5)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium"
                >
                  +5%
                </button>
                <button
                  onClick={() => setBatchPercentChange(8)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium"
                >
                  +8%
                </button>
                <button
                  onClick={() => setBatchPercentChange(10)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium"
                >
                  +10%
                </button>
                <button
                  onClick={() => setBatchPercentChange(-5)}
                  className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-lg text-xs font-medium"
                >
                  -5%
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsBatchReajusteOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyBatchPriceChange}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Aplicar Reajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Modal Unit Editor */}
      {editingModalUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Editar Unidade {editingModalUnit.unitNumber}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingModalUnit.floorName || `${editingModalUnit.floor}° Pavimento`} • {editingModalUnit.type}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingModalUnit(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Número / Identificador da Unidade:
                  </label>
                  <input
                    type="text"
                    value={editingModalUnit.unitNumber}
                    onChange={(e) => setEditingModalUnit({ ...editingModalUnit, unitNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pavimento / Andar:
                  </label>
                  <input
                    type="text"
                    value={editingModalUnit.floorName || `${editingModalUnit.floor}° Pavimento`}
                    onChange={(e) => setEditingModalUnit({ ...editingModalUnit, floorName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipologia:
                  </label>
                  <select
                    value={editingModalUnit.type}
                    onChange={(e) => setEditingModalUnit({ ...editingModalUnit, type: e.target.value as UnitType })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Studio">Studio</option>
                    <option value="Studio - Garden">Studio - Garden</option>
                    <option value="2 Dormitórios">2 Dormitórios</option>
                    <option value="2 Suítes">2 Suítes</option>
                    <option value="Cobertura Linear">Cobertura Linear</option>
                    <option value="Loja/Sobreloja">Loja/Sobreloja</option>
                    <option value="Vaga simples">Vaga simples</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Posição / Fachada:
                  </label>
                  <input
                    type="text"
                    value={editingModalUnit.position || ""}
                    onChange={(e) => setEditingModalUnit({ ...editingModalUnit, position: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Área Privativa Interna (m²):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingModalUnit.internalPrivateAreaM2 || editingModalUnit.privateAreaM2}
                    onChange={(e) => {
                      const internal = Number(e.target.value);
                      const totalPriv = internal + (editingModalUnit.externalPrivateAreaM2 || 0);
                      setEditingModalUnit({
                        ...editingModalUnit,
                        internalPrivateAreaM2: internal,
                        privateAreaM2: totalPriv,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Área Privativa Externa (m²):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingModalUnit.externalPrivateAreaM2 || 0}
                    onChange={(e) => {
                      const ext = Number(e.target.value);
                      const totalPriv = (editingModalUnit.internalPrivateAreaM2 || editingModalUnit.privateAreaM2) + ext;
                      setEditingModalUnit({
                        ...editingModalUnit,
                        externalPrivateAreaM2: ext,
                        privateAreaM2: totalPriv,
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Garagem:
                  </label>
                  <select
                    value={editingModalUnit.garageType}
                    onChange={(e) => setEditingModalUnit({ ...editingModalUnit, garageType: e.target.value as GarageType })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Sem Vaga">Sem Vaga</option>
                    <option value="Simples Coberta">Simples Coberta</option>
                    <option value="Dupla Coberta">Dupla Coberta</option>
                    <option value="01 vaga">01 vaga</option>
                    <option value="Vaga simples">Vaga simples</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status:
                  </label>
                  <select
                    value={editingModalUnit.status}
                    onChange={(e) => setEditingModalUnit({ ...editingModalUnit, status: e.target.value as UnitStatus })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  >
                    <option value="Disponível">Disponível</option>
                    <option value="Vendida">Vendida</option>
                    <option value="Reservada">Reservada</option>
                  </select>
                </div>
              </div>

              {/* Valor e Fluxo */}
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Valor Total da Tabela (R$):
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {editingModalUnit.privateAreaM2 > 0 ? `${CUBService.formatCurrency(editingModalUnit.basePrice / editingModalUnit.privateAreaM2)} / m²` : ""}
                  </span>
                </div>

                <input
                  type="number"
                  step="1000"
                  value={editingModalUnit.basePrice}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    const priv = editingModalUnit.privateAreaM2 || 35;
                    setEditingModalUnit({
                      ...editingModalUnit,
                      basePrice: price,
                      pricePerM2: Math.round(price / priv),
                      cubPrice: Number((price / customCubValue).toFixed(2)),
                      downPaymentAto: Math.round(price * 0.12),
                      monthlyInstallment40x: Math.round((price * 0.15) / 40),
                      balloonInstallment6x: Math.round((price * 0.08) / 6),
                      finalInstallment: Math.round(price * 0.05),
                      financingBalance: Math.round(price * 0.60),
                    });
                  }}
                  className="w-full px-4 py-2.5 text-base font-black bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-xl text-indigo-900 dark:text-indigo-100"
                />

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 text-slate-600 dark:text-slate-300">
                  <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg">
                    Ato (12%): <strong>{CUBService.formatCurrency(editingModalUnit.basePrice * 0.12)}</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg">
                    40X Mensais: <strong>{CUBService.formatCurrency((editingModalUnit.basePrice * 0.15) / 40)}</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg">
                    6X Semestrais: <strong>{CUBService.formatCurrency((editingModalUnit.basePrice * 0.08) / 6)}</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg">
                    Parcela Final (5%): <strong>{CUBService.formatCurrency(editingModalUnit.basePrice * 0.05)}</strong>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-800/80 rounded-lg col-span-2">
                    Financiamento (60%): <strong>{CUBService.formatCurrency(editingModalUnit.basePrice * 0.60)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
              <button
                onClick={() => setEditingModalUnit(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onUpdateUnit) {
                    onUpdateUnit(editingModalUnit);
                    showToast(`Unidade ${editingModalUnit.unitNumber} salva!`);
                  }
                  setEditingModalUnit(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" /> Salvar Unidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
