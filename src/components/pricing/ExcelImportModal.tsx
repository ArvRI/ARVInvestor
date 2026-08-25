import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  HelpCircle,
  Table as TableIcon,
  RefreshCw,
  Sparkles,
  Clipboard,
  Check,
  ChevronRight,
  Filter
} from "lucide-react";
import * as XLSX from "xlsx";
import { PricingUnit, UnitType, UnitStatus, SolarOrientation, GarageType } from "../../types/pricing";
import { CUBService, CURRENT_DEFAULT_CUB_SC } from "../../services/pricing/CUBService";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  speId: string;
  cubReferenceValue: number;
  currentUnitsCount: number;
  onImport: (units: PricingUnit[], mode: "merge" | "replace") => void;
}

interface ColumnMapping {
  unitNumber: string;
  floor: string;
  floorName: string;
  type: string;
  position: string;
  internalPrivateAreaM2: string;
  externalPrivateAreaM2: string;
  privateAreaM2: string;
  garageType: string;
  status: string;
  basePrice: string;
  downPaymentAto: string;
  monthlyInstallment40x: string;
  balloonInstallment6x: string;
  finalInstallment: string;
  financingBalance: string;
}

const DEFAULT_MAPPING: ColumnMapping = {
  unitNumber: "",
  floor: "",
  floorName: "",
  type: "",
  position: "",
  internalPrivateAreaM2: "",
  externalPrivateAreaM2: "",
  privateAreaM2: "",
  garageType: "",
  status: "",
  basePrice: "",
  downPaymentAto: "",
  monthlyInstallment40x: "",
  balloonInstallment6x: "",
  finalInstallment: "",
  financingBalance: "",
};

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  tableId,
  speId,
  cubReferenceValue,
  currentUnitsCount,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(DEFAULT_MAPPING);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUnits, setPreviewUnits] = useState<PricingUnit[]>([]);
  const [importStep, setImportStep] = useState<"upload" | "mapping" | "preview">("upload");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clean and parse numbers (handles "R$ 1.250.000,50", "38,50 m²", "1250000", etc.)
  const parseNumeric = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    let s = String(val).trim();
    if (!s) return 0;
    // Remove "R$", "m²", spaces
    s = s.replace(/R\$|\$|m²|m2|\s/gi, "");
    // If format is Brazilian "1.250.000,50" -> remove dot, replace comma with dot
    if (s.includes(",") && s.includes(".")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else if (s.includes(",")) {
      s = s.replace(",", ".");
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
  };

  // Smart header auto-detection
  const autoDetectColumns = (headers: string[]): ColumnMapping => {
    const mapping: ColumnMapping = { ...DEFAULT_MAPPING };
    const normalize = (h: string) =>
      h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    headers.forEach((h) => {
      const norm = normalize(h);
      if (!mapping.unitNumber && (norm.includes("unidade") || norm.includes("apto") || norm.includes("unid") || norm === "numero" || norm === "n")) {
        mapping.unitNumber = h;
      } else if (!mapping.floor && (norm === "andar" || norm === "piso" || norm === "pavimento")) {
        mapping.floor = h;
      } else if (!mapping.floorName && (norm.includes("pavimento") || norm.includes("andar"))) {
        mapping.floorName = h;
      } else if (!mapping.type && (norm.includes("tipo") || norm.includes("tipologia") || norm.includes("planta"))) {
        mapping.type = h;
      } else if (!mapping.position && (norm.includes("posicao") || norm.includes("orientacao") || norm.includes("face") || norm.includes("frente"))) {
        mapping.position = h;
      } else if (!mapping.internalPrivateAreaM2 && (norm.includes("interna") || norm.includes("privativa interna") || norm.includes("area interna"))) {
        mapping.internalPrivateAreaM2 = h;
      } else if (!mapping.externalPrivateAreaM2 && (norm.includes("externa") || norm.includes("terraco") || norm.includes("area externa") || norm.includes("privativa externa"))) {
        mapping.externalPrivateAreaM2 = h;
      } else if (!mapping.privateAreaM2 && (norm.includes("privativa") || norm.includes("area total privativa") || norm.includes("area priv") || norm === "area" || norm === "m2")) {
        mapping.privateAreaM2 = h;
      } else if (!mapping.garageType && (norm.includes("garagem") || norm.includes("vaga") || norm.includes("box"))) {
        mapping.garageType = h;
      } else if (!mapping.status && (norm.includes("status") || norm.includes("situacao") || norm.includes("disponibilidade"))) {
        mapping.status = h;
      } else if (!mapping.basePrice && (norm.includes("valor total") || norm.includes("preco") || norm.includes("tabela") || norm.includes("valor tabela") || norm.includes("valor r$") || norm === "total")) {
        mapping.basePrice = h;
      } else if (!mapping.downPaymentAto && (norm.includes("ato") || norm.includes("sinal") || norm.includes("entrada"))) {
        mapping.downPaymentAto = h;
      } else if (!mapping.monthlyInstallment40x && (norm.includes("40x") || norm.includes("mensais") || norm.includes("parcelas") || norm.includes("mensal"))) {
        mapping.monthlyInstallment40x = h;
      } else if (!mapping.balloonInstallment6x && (norm.includes("6x") || norm.includes("reforco") || norm.includes("semestral") || norm.includes("baloes"))) {
        mapping.balloonInstallment6x = h;
      } else if (!mapping.finalInstallment && (norm.includes("parcela final") || norm.includes("final") || norm.includes("chaves"))) {
        mapping.finalInstallment = h;
      } else if (!mapping.financingBalance && (norm.includes("financiamento") || norm.includes("bancario") || norm.includes("saldo devedor") || norm.includes("60%"))) {
        mapping.financingBalance = h;
      }
    });

    return mapping;
  };

  // Process uploaded Excel/CSV file
  const handleFileUpload = async (uploadedFile: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!data || data.length < 2) {
        throw new Error("A planilha não possui dados ou linhas suficientes.");
      }

      // Find header row (skip empty rows if any)
      let headerRowIndex = 0;
      for (let i = 0; i < Math.min(5, data.length); i++) {
        if (data[i] && data[i].some((cell: any) => cell !== undefined && cell !== null && String(cell).trim().length > 0)) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = data[headerRowIndex].map((h: any, idx: number) =>
        h !== undefined && h !== null ? String(h).trim() : `Coluna_${idx + 1}`
      );

      const rawRows = data.slice(headerRowIndex + 1).filter((r: any[]) =>
        r.some((cell) => cell !== undefined && cell !== null && String(cell).trim().length > 0)
      );

      const formattedRows = rawRows.map((row) => {
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx];
        });
        return obj;
      });

      setFile(uploadedFile);
      setParsedHeaders(headers);
      setParsedRows(formattedRows);

      const detected = autoDetectColumns(headers);
      setColumnMapping(detected);
      setImportStep("mapping");
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao processar o arquivo Excel.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Process text pasted from Excel / Google Sheets
  const handlePastedTextProcess = () => {
    setErrorMessage(null);
    if (!rawText.trim()) {
      setErrorMessage("Por favor, cole os dados copiados do Excel ou Google Sheets.");
      return;
    }

    try {
      const lines = rawText.trim().split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error("Cole pelo menos 2 linhas (cabeçalho + 1 linha de dados).");
      }

      // Detect separator: Tab (\t), Semicolon (;), or Comma (,)
      const firstLine = lines[0];
      let delimiter = "\t";
      if (firstLine.includes("\t")) delimiter = "\t";
      else if (firstLine.includes(";")) delimiter = ";";
      else if (firstLine.includes(",")) delimiter = ",";

      const headers = firstLine.split(delimiter).map((h, idx) => h.trim() || `Coluna_${idx + 1}`);

      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cells = line.split(delimiter);
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = cells[idx] !== undefined ? cells[idx].trim() : "";
        });
        rows.push(rowObj);
      }

      setParsedHeaders(headers);
      setParsedRows(rows);

      const detected = autoDetectColumns(headers);
      setColumnMapping(detected);
      setImportStep("mapping");
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao interpretar texto colado.");
    }
  };

  // Convert parsed rows to PricingUnit based on mapping
  const generatePreview = () => {
    setErrorMessage(null);
    if (!columnMapping.unitNumber && !parsedHeaders.length) {
      setErrorMessage("A coluna de Unidade é obrigatória.");
      return;
    }

    const generated: PricingUnit[] = [];

    parsedRows.forEach((row, idx) => {
      const unitNumRaw = columnMapping.unitNumber ? String(row[columnMapping.unitNumber] || "").trim() : `Unid ${idx + 1}`;
      if (!unitNumRaw) return;

      const rawFloor = columnMapping.floor ? row[columnMapping.floor] : "";
      const rawFloorName = columnMapping.floorName ? String(row[columnMapping.floorName] || "").trim() : "";
      
      let floor = parseNumeric(rawFloor);
      if (!floor) {
        // Try to extract floor number from unitNumber (e.g. 201 -> floor 2, 901 -> floor 9)
        const match = unitNumRaw.match(/\b([1-9])\d{2}\b/);
        if (match) {
          floor = parseInt(match[1], 10);
        } else if (unitNumRaw.toLowerCase().includes("loja") || unitNumRaw.toLowerCase().includes("térreo")) {
          floor = 1;
        } else if (unitNumRaw.toLowerCase().includes("r0") || unitNumRaw.toLowerCase().includes("vaga")) {
          floor = 0;
        } else {
          floor = 1;
        }
      }

      let floorName = rawFloorName;
      if (!floorName) {
        if (floor === 0) floorName = "Térreo / Garagens";
        else if (floor === 1) floorName = "1° Pavimento";
        else if (floor >= 9) floorName = "9° Pavimento - Cobertura";
        else floorName = `${floor}° Pavimento`;
      }

      const rawType = columnMapping.type ? String(row[columnMapping.type] || "").trim() : "";
      let type: UnitType = "Studio";
      if (rawType.toLowerCase().includes("garden")) type = "Studio - Garden";
      else if (rawType.toLowerCase().includes("2 dorm") || rawType.toLowerCase().includes("2 quartos")) type = "2 Dormitórios";
      else if (rawType.toLowerCase().includes("2 suíte")) type = "2 Suítes";
      else if (rawType.toLowerCase().includes("cobertura")) type = "Cobertura Linear";
      else if (rawType.toLowerCase().includes("loja")) type = "Loja/Sobreloja";
      else if (rawType.toLowerCase().includes("vaga")) type = "Vaga simples";
      else if (rawType) type = rawType as UnitType;

      const position = columnMapping.position ? String(row[columnMapping.position] || "").trim() : "------";

      const internalArea = columnMapping.internalPrivateAreaM2 ? parseNumeric(row[columnMapping.internalPrivateAreaM2]) : 0;
      const externalArea = columnMapping.externalPrivateAreaM2 ? parseNumeric(row[columnMapping.externalPrivateAreaM2]) : 0;
      let privArea = columnMapping.privateAreaM2 ? parseNumeric(row[columnMapping.privateAreaM2]) : 0;
      if (!privArea) {
        privArea = internalArea + externalArea;
      }
      if (!privArea) privArea = 35.0; // fallback

      const rawGarage = columnMapping.garageType ? String(row[columnMapping.garageType] || "").trim() : "";
      let garageType: GarageType = "Sem Vaga";
      if (rawGarage.toLowerCase().includes("simples") || rawGarage.toLowerCase().includes("01 vaga") || rawGarage.toLowerCase().includes("coberta")) {
        garageType = "Simples Coberta";
      } else if (rawGarage.toLowerCase().includes("dupla")) {
        garageType = "Dupla Coberta";
      } else if (rawGarage) {
        garageType = rawGarage as GarageType;
      }

      const rawStatus = columnMapping.status ? String(row[columnMapping.status] || "").trim() : "";
      let status: UnitStatus = "Disponível";
      if (rawStatus.toLowerCase().includes("vendid")) status = "Vendida";
      else if (rawStatus.toLowerCase().includes("reserv")) status = "Reservada";
      else if (rawStatus.toLowerCase().includes("bloq")) status = "Bloqueada";

      const basePrice = columnMapping.basePrice ? parseNumeric(row[columnMapping.basePrice]) : 0;
      const downPaymentAto = columnMapping.downPaymentAto ? parseNumeric(row[columnMapping.downPaymentAto]) : (basePrice ? basePrice * 0.12 : 0);
      const monthlyInstallment40x = columnMapping.monthlyInstallment40x ? parseNumeric(row[columnMapping.monthlyInstallment40x]) : (basePrice ? (basePrice * 0.15) / 40 : 0);
      const balloonInstallment6x = columnMapping.balloonInstallment6x ? parseNumeric(row[columnMapping.balloonInstallment6x]) : (basePrice ? (basePrice * 0.08) / 6 : 0);
      const finalInstallment = columnMapping.finalInstallment ? parseNumeric(row[columnMapping.finalInstallment]) : (basePrice ? basePrice * 0.05 : 0);
      const financingBalance = columnMapping.financingBalance ? parseNumeric(row[columnMapping.financingBalance]) : (basePrice ? basePrice * 0.60 : 0);

      const cubPrice = cubReferenceValue > 0 ? Number((basePrice / cubReferenceValue).toFixed(2)) : 0;
      const pricePerM2 = privArea > 0 ? Math.round(basePrice / privArea) : 0;
      const cubPerM2 = privArea > 0 && cubReferenceValue > 0 ? Number((cubPrice / privArea).toFixed(2)) : 0;

      // Safe clean ID
      const safeId = `unit-${tableId}-${unitNumRaw.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}-${idx}`;

      generated.push({
        id: safeId,
        tableId,
        speId,
        unitNumber: unitNumRaw,
        tower: "Torre Principal",
        floor,
        floorName,
        type,
        position,
        privateAreaM2: privArea,
        internalPrivateAreaM2: internalArea || privArea,
        externalPrivateAreaM2: externalArea,
        totalAreaM2: Number((privArea * 1.45).toFixed(2)),
        garageType,
        solarOrientation: "Norte" as SolarOrientation,
        viewDescription: position || "Vista urbana",
        basePrice,
        cubPrice,
        pricePerM2,
        cubPerM2,
        status,
        discountMaxPercent: 5.0,
        commissionPercent: 5.0,
        downPaymentAto,
        monthlyInstallment40x,
        balloonInstallment6x,
        finalInstallment,
        financingBalance,
      });
    });

    if (generated.length === 0) {
      setErrorMessage("Nenhuma unidade válida pôde ser gerada a partir do mapeamento fornecido.");
      return;
    }

    setPreviewUnits(generated);
    setImportStep("preview");
  };

  // Finalize import
  const handleConfirmImport = () => {
    if (previewUnits.length === 0) return;
    onImport(previewUnits, importMode);
    onClose();
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleRows = [
      {
        "Unidade": "Studio 201",
        "Pavimento": "2° Pavimento",
        "Tipologia": "Studio - Garden",
        "Posição": "Fachada Norte",
        "Área Privativa Interna (m²)": 36.50,
        "Área Privativa Externa (m²)": 12.30,
        "Garagem": "Sem Vaga",
        "Status": "Disponível",
        "Valor Total (R$)": 620000.00,
        "Ato (12%)": 74400.00,
        "40X Mensais (15%)": 2325.00,
        "6X Semestrais (8%)": 8266.67,
        "Parcela Final (5%)": 31000.00,
        "Financiamento (60%)": 372000.00
      },
      {
        "Unidade": "Studio 301",
        "Pavimento": "3° Pavimento",
        "Tipologia": "Studio",
        "Posição": "Fachada Norte",
        "Área Privativa Interna (m²)": 36.50,
        "Área Privativa Externa (m²)": 0.00,
        "Garagem": "Sem Vaga",
        "Status": "Disponível",
        "Valor Total (R$)": 590000.00,
        "Ato (12%)": 70800.00,
        "40X Mensais (15%)": 2212.50,
        "6X Semestrais (8%)": 7866.67,
        "Parcela Final (5%)": 29500.00,
        "Financiamento (60%)": 354000.00
      },
      {
        "Unidade": "Apto 901",
        "Pavimento": "9° Pavimento - Cobertura",
        "Tipologia": "2 Dormitórios",
        "Posição": "Frente Rua Juvêncio Costa",
        "Área Privativa Interna (m²)": 74.20,
        "Área Privativa Externa (m²)": 38.50,
        "Garagem": "Simples Coberta",
        "Status": "Disponível",
        "Valor Total (R$)": 1850000.00,
        "Ato (12%)": 222000.00,
        "40X Mensais (15%)": 6937.50,
        "6X Semestrais (8%)": 24666.67,
        "Parcela Final (5%)": 92500.00,
        "Financiamento (60%)": 1110000.00
      },
      {
        "Unidade": "Loja 01",
        "Pavimento": "1° Pavimento",
        "Tipologia": "Loja/Sobreloja",
        "Posição": "Frente Rua Juvêncio Costa",
        "Área Privativa Interna (m²)": 95.80,
        "Área Privativa Externa (m²)": 0.00,
        "Garagem": "Simples Coberta",
        "Status": "Vendida",
        "Valor Total (R$)": 2100000.00,
        "Ato (12%)": 0.00,
        "40X Mensais (15%)": 0.00,
        "6X Semestrais (8%)": 0.00,
        "Parcela Final (5%)": 0.00,
        "Financiamento (60%)": 0.00
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo Tabela Vendas");

    // Auto-size columns
    const colWidths = [
      { wch: 15 },
      { wch: 22 },
      { wch: 18 },
      { wch: 26 },
      { wch: 22 },
      { wch: 22 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 20 },
    ];
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, "Modelo_Importacao_Tabela_Financiamento_ARV_GRID.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Importar Dados da Tabela de Financiamento
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Importe planilhas do Excel (.xlsx, .xls, .csv) ou cole diretamente linhas copiadas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="px-6 py-3 bg-slate-100/70 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 ${importStep === "upload" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importStep === "upload" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>1</span>
            Origem dos Dados
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-1.5 ${importStep === "mapping" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importStep === "mapping" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>2</span>
            Mapeamento de Colunas
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-1.5 ${importStep === "preview" ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${importStep === "preview" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"}`}>3</span>
            Pré-visualização ({previewUnits.length} unidades)
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD OR PASTE */}
          {importStep === "upload" && (
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
                <button
                  onClick={() => setActiveTab("file")}
                  className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === "file"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Upload className="w-4 h-4" /> Arquivo Excel / CSV
                </button>
                <button
                  onClick={() => setActiveTab("paste")}
                  className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === "paste"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Clipboard className="w-4 h-4" /> Colar Direto do Excel (Ctrl+V)
                </button>
              </div>

              {activeTab === "file" ? (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-3xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/20 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files[0]) {
                          handleFileUpload(files[0]);
                        }
                      }}
                    />
                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                      Clique para selecionar ou arraste seu arquivo aqui
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Suporta planilhas do Excel (.xlsx, .xls) e arquivos (.csv)
                    </p>
                  </div>

                  {/* Download Template Box */}
                  <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Precisa de um modelo padrão de planilha?
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Baixe nosso modelo Excel (.xlsx) já com todas as colunas e fórmulas do ARV GRID
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadTemplate}
                      className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-emerald-100/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar Modelo .XLSX
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Copie e cole as células da sua planilha aqui:
                    </label>
                    <textarea
                      rows={8}
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder={`Cole aqui linhas copiadas do Excel ou Google Sheets (exemplo):\nUnidade\tPavimento\tTipologia\tÁrea Privativa\tValor Total\n201\t2° Pavimento\tStudio Garden\t36.50\t620000\n301\t3° Pavimento\tStudio\t36.50\t590000`}
                      className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handlePastedTextProcess}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" /> Processar Dados Colados
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {importStep === "mapping" && (
            <div className="space-y-6">
              <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 p-4 rounded-2xl text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                <div>
                  <strong>{parsedRows.length} linhas detectadas.</strong> Verifique a correspondência automática das colunas abaixo:
                </div>
                <button
                  onClick={() => setColumnMapping(autoDetectColumns(parsedHeaders))}
                  className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Re-detectar Colunas
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unidade */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Coluna Unidade / Apto *
                  </label>
                  <select
                    value={columnMapping.unitNumber}
                    onChange={(e) => setColumnMapping({ ...columnMapping, unitNumber: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">-- Selecione a Coluna --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pavimento */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Coluna Pavimento / Andar
                  </label>
                  <select
                    value={columnMapping.floorName || columnMapping.floor}
                    onChange={(e) => setColumnMapping({ ...columnMapping, floorName: e.target.value, floor: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">-- Selecione ou Auto-inferir do Apto --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipologia */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Coluna Tipologia
                  </label>
                  <select
                    value={columnMapping.type}
                    onChange={(e) => setColumnMapping({ ...columnMapping, type: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">-- Selecione a Coluna --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Posição / Orientação */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Coluna Posição / Fachada
                  </label>
                  <select
                    value={columnMapping.position}
                    onChange={(e) => setColumnMapping({ ...columnMapping, position: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">-- Selecione a Coluna --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Área Privativa Interna */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Coluna Área Privativa (m²)
                  </label>
                  <select
                    value={columnMapping.internalPrivateAreaM2 || columnMapping.privateAreaM2}
                    onChange={(e) => setColumnMapping({ ...columnMapping, internalPrivateAreaM2: e.target.value, privateAreaM2: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">-- Selecione a Coluna --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Área Privativa Externa */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Coluna Área Externa / Terraço (m²)
                  </label>
                  <select
                    value={columnMapping.externalPrivateAreaM2}
                    onChange={(e) => setColumnMapping({ ...columnMapping, externalPrivateAreaM2: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">-- Opcional (se houver) --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valor Total / Tabela */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Coluna Valor Total de Tabela (R$) *
                  </label>
                  <select
                    value={columnMapping.basePrice}
                    onChange={(e) => setColumnMapping({ ...columnMapping, basePrice: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">-- Selecione a Coluna --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Garagem */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Coluna Garagem
                  </label>
                  <select
                    value={columnMapping.garageType}
                    onChange={(e) => setColumnMapping({ ...columnMapping, garageType: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">-- Opcional (Padrão: Sem Vaga) --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Coluna Status (Disponível / Vendida)
                  </label>
                  <select
                    value={columnMapping.status}
                    onChange={(e) => setColumnMapping({ ...columnMapping, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
                  >
                    <option value="">-- Opcional (Padrão: Disponível) --</option>
                    {parsedHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & IMPORT OPTIONS */}
          {importStep === "preview" && (
            <div className="space-y-6">
              {/* Mode Selector */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Modo de Importação:
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      importMode === "merge"
                        ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === "merge"}
                      onChange={() => setImportMode("merge")}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Atualizar & Mesclar Unidades
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Atualiza valores e dados das unidades existentes e adiciona as novas da planilha.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      importMode === "replace"
                        ? "border-rose-600 bg-rose-50/60 dark:bg-rose-950/40"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Substituir Tabela Inteira
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Substitui todas as {currentUnitsCount} unidades atuais pelas {previewUnits.length} unidades da planilha.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Prévia das primeiras unidades ({previewUnits.length} total)</span>
                  <span className="text-slate-500 font-normal">
                    VGV Total: <strong>{CUBService.formatCurrency(previewUnits.reduce((acc, u) => acc + u.basePrice, 0))}</strong>
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 sticky top-0">
                      <tr>
                        <th className="p-2.5">Unidade</th>
                        <th className="p-2.5">Pavimento</th>
                        <th className="p-2.5">Tipologia</th>
                        <th className="p-2.5">Posição</th>
                        <th className="p-2.5 text-right">Área Interna</th>
                        <th className="p-2.5 text-right">Valor Total (R$)</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {previewUnits.slice(0, 15).map((u, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{u.unitNumber}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-300">{u.floorName}</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">{u.type}</td>
                          <td className="p-2.5 text-slate-600 dark:text-slate-400">{u.position}</td>
                          <td className="p-2.5 text-right font-medium">{u.internalPrivateAreaM2?.toFixed(2)} m²</td>
                          <td className="p-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                            {CUBService.formatCurrency(u.basePrice)}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.status === "Vendida"
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            }`}>
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div>
            {importStep !== "upload" && (
              <button
                onClick={() => {
                  if (importStep === "preview") setImportStep("mapping");
                  else if (importStep === "mapping") setImportStep("upload");
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Voltar
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>

            {importStep === "mapping" && (
              <button
                onClick={generatePreview}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                Avançar para Pré-visualização <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {importStep === "preview" && (
              <button
                onClick={handleConfirmImport}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Check className="w-4 h-4" /> Concluir Importação ({previewUnits.length} unidades)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
