import React, { useState, useEffect, useMemo } from "react";
import {
  Calculator,
  Building,
  Sliders,
  Calendar,
  Save,
  CheckCircle2,
  TrendingUp,
  Percent,
  Settings2,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  FileDown,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import {
  AppreciationScenario,
  ProfitabilityCosts,
  ProfitabilitySimulation,
} from "../../types";
import {
  DEFAULT_SIMULATION_COSTS,
  SCENARIO_ANNUAL_RATES,
  runProfitabilitySimulation,
} from "../../utils/profitabilityCalculations";
import { ProfitabilityPdfExportService } from "../../services/profitability/profitabilityPdfExportService";
import { ProfitabilityComparisonChart } from "./ProfitabilityComparisonChart";
import { ProfitabilityPdfExportModal } from "./ProfitabilityPdfExportModal";

interface ProfitabilitySimulatorFormProps {
  initialSpeId?: string;
  initialContractId?: string;
  onSimulationSaved?: (simulation: ProfitabilitySimulation) => void;
}

export const ProfitabilitySimulatorForm: React.FC<ProfitabilitySimulatorFormProps> = ({
  initialSpeId,
  initialContractId,
  onSimulationSaved,
}) => {
  const {
    contracts,
    investors,
    spes,
    marketBenchmarkHistory,
    createProfitabilitySimulation,
  } = useApp();

  const [simulationMode, setSimulationMode] = useState<"contract" | "spe" | "custom">(
    initialSpeId ? "spe" : initialContractId ? "contract" : "contract"
  );
  const [selectedContractId, setSelectedContractId] = useState<string>(
    initialContractId || contracts[0]?.id || ""
  );
  const [selectedSpeId, setSelectedSpeId] = useState<string>(
    initialSpeId || spes[0]?.id || ""
  );

  // Form Fields
  const [simTitle, setSimTitle] = useState<string>("Simulação de Rentabilidade Imobiliária");
  const [purchasePrice, setPurchasePrice] = useState<number>(420000);
  const [entryDate, setEntryDate] = useState<string>("2024-03-15");
  const [horizonMonths, setHorizonMonths] = useState<number>(36);
  const [scenario, setScenario] = useState<AppreciationScenario>("Moderado");
  const [useCustomRate, setUseCustomRate] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<number>(18.5);

  // Custom Indicators State (CDI & IPCA)
  const [useCustomIndicators, setUseCustomIndicators] = useState<boolean>(false);
  const [customCdiRate, setCustomCdiRate] = useState<number>(11.5); // % a.a.
  const [customIpcaRate, setCustomIpcaRate] = useState<number>(4.3); // % a.a.

  // Custom Scenario Rates
  const [scenarioRates, setScenarioRates] = useState<Record<AppreciationScenario, number>>({
    ...SCENARIO_ANNUAL_RATES,
  });

  // Custos
  const [showCostsConfig, setShowCostsConfig] = useState<boolean>(false);
  const [showIndicatorsConfig, setShowIndicatorsConfig] = useState<boolean>(false);
  const [costs, setCosts] = useState<ProfitabilityCosts>(DEFAULT_SIMULATION_COSTS);

  // Estado de Sucesso ao Salvar
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Preencher quando initialSpeId mudar
  useEffect(() => {
    if (initialSpeId) {
      setSimulationMode("spe");
      setSelectedSpeId(initialSpeId);
    }
  }, [initialSpeId]);

  // Preencher quando o contrato selecionado mudar
  useEffect(() => {
    if (simulationMode === "contract" && selectedContractId) {
      const c = contracts.find((item) => item.id === selectedContractId);
      if (c) {
        const inv = investors.find((i) => i.id === c.investorId);
        const spe = spes.find((s) => s.id === c.speId);
        setPurchasePrice(c.investedAmount);
        setEntryDate(c.purchaseDate || "2024-01-15");
        setSimTitle(`${spe?.name || "SPE ARV"} • Contrato ${c.contractNumber} (${inv?.name || "Investidor"})`);
        if (c.expectedRoiPercentage) {
          setCustomRate(c.expectedRoiPercentage);
        }
      }
    } else if (simulationMode === "spe" && selectedSpeId) {
      const spe = spes.find((s) => s.id === selectedSpeId);
      if (spe) {
        // Ticket médio estimado por cota ou unidade
        const estimatedTicket = spe.totalVgv > 0 ? Math.round(spe.totalVgv / 40) : 650000;
        setPurchasePrice(estimatedTicket);
        setEntryDate("2024-06-01");
        setSimTitle(`Simulação Empreendimento ${spe.name} (VGV R$ ${(spe.totalVgv / 1000000).toFixed(1)}M)`);
        setCustomRate(19.0);
      }
    }
  }, [simulationMode, selectedContractId, selectedSpeId, contracts, investors, spes]);

  // Executar simulação em tempo real
  const currentResult = useMemo(() => {
    return runProfitabilitySimulation(
      {
        title: simTitle,
        contractId: simulationMode === "contract" ? selectedContractId : undefined,
        speId: simulationMode === "spe" ? selectedSpeId : undefined,
        purchasePrice,
        entryDate,
        horizonMonths,
        appreciationScenario: scenario,
        customAnnualAppreciationRate: useCustomRate ? customRate : undefined,
        customCdiAnnualRate: useCustomIndicators ? customCdiRate : undefined,
        customIpcaAnnualRate: useCustomIndicators ? customIpcaRate : undefined,
        customScenarioRates: scenarioRates,
        costs,
      },
      marketBenchmarkHistory
    );
  }, [
    simTitle,
    simulationMode,
    selectedContractId,
    selectedSpeId,
    purchasePrice,
    entryDate,
    horizonMonths,
    scenario,
    useCustomRate,
    customRate,
    useCustomIndicators,
    customCdiRate,
    customIpcaRate,
    scenarioRates,
    costs,
    marketBenchmarkHistory,
  ]);

  const handleResetIndicators = () => {
    setUseCustomIndicators(false);
    setCustomCdiRate(11.5);
    setCustomIpcaRate(4.3);
    setScenarioRates({ ...SCENARIO_ANNUAL_RATES });
    setCosts({ ...DEFAULT_SIMULATION_COSTS });
  };

  const handleSaveSimulation = () => {
    const res = createProfitabilitySimulation({
      title: simTitle,
      contractId: simulationMode === "contract" ? selectedContractId : undefined,
      speId: simulationMode === "spe" ? selectedSpeId : undefined,
      purchasePrice,
      entryDate,
      horizonMonths,
      appreciationScenario: scenario,
      customAnnualAppreciationRate: useCustomRate ? customRate : undefined,
      customCdiAnnualRate: useCustomIndicators ? customCdiRate : undefined,
      customIpcaAnnualRate: useCustomIndicators ? customIpcaRate : undefined,
      customScenarioRates: scenarioRates,
      costs,
    });
    setSaveSuccess(true);
    if (onSimulationSaved) {
      onSimulationSaved(res.simulation);
    }
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Form Controls Card */}
      <div
        id="simulator-form-card"
        className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
      >
        {/* Header Mode Switch */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Simulador Interativo de Rentabilidade & Comparativos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personalize indicadores financeiros (CDI e IPCA), cenários de valorização imobiliária e custos tributários.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setSimulationMode("contract")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                simulationMode === "contract"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Vincular Contrato Real
            </button>
            <button
              onClick={() => setSimulationMode("spe")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                simulationMode === "spe"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Empreendimento (SPE)
            </button>
            <button
              onClick={() => setSimulationMode("custom")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                simulationMode === "custom"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Simulação Hipotética Livre
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Contrato / SPE / Título */}
          {simulationMode === "contract" ? (
            <div className="lg:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Selecione o Contrato do Investidor:
              </label>
              <select
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {contracts.map((c) => {
                  const inv = investors.find((i) => i.id === c.investorId);
                  const spe = spes.find((s) => s.id === c.speId);
                  return (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} • {inv?.name} ({spe?.name?.split("-")[0]?.trim()}) - R$ {(c.investedAmount / 1000).toFixed(0)}k
                    </option>
                  );
                })}
              </select>
            </div>
          ) : simulationMode === "spe" ? (
            <div className="lg:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Selecione o Empreendimento (SPE):
                </label>
                {selectedSpeId === "spe-grid" && (
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    106 Unidades • R-1-3.706
                  </span>
                )}
              </div>
              <select
                value={selectedSpeId}
                onChange={(e) => setSelectedSpeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                {spes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} • {s.city} (VGV R$ {(s.totalVgv / 1000000).toFixed(1)}M - {s.status})
                  </option>
                ))}
              </select>

              {/* Typology Quick Pick for SPE GRID */}
              {selectedSpeId === "spe-grid" && (
                <div className="pt-2">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    Modelos de Unidade ARV GRID para Simulação Rápida:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPurchasePrice(445000);
                        setSimTitle("SPE ARV GRID • Studio Tipo 201 (28.5m²)");
                        setCustomRate(19.2);
                      }}
                      className="p-1.5 text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-indigo-500 transition-all cursor-pointer text-[10px]"
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">Studio Tipo</div>
                      <div className="text-slate-500">R$ 445k • 28.5m²</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPurchasePrice(685000);
                        setSimTitle("SPE ARV GRID • Studio Garden 101 (46.8m²)");
                        setCustomRate(19.5);
                      }}
                      className="p-1.5 text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-indigo-500 transition-all cursor-pointer text-[10px]"
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">Studio Garden</div>
                      <div className="text-slate-500">R$ 685k • 46.8m²</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPurchasePrice(1280000);
                        setSimTitle("SPE ARV GRID • Cobertura Duplex 601 (78.4m²)");
                        setCustomRate(20.0);
                      }}
                      className="p-1.5 text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-indigo-500 transition-all cursor-pointer text-[10px]"
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">Cobertura Duplex</div>
                      <div className="text-slate-500">R$ 1.28M • 78.4m²</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPurchasePrice(960000);
                        setSimTitle("SPE ARV GRID • Loja Comercial 01 (62.0m²)");
                        setCustomRate(19.0);
                      }}
                      className="p-1.5 text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-indigo-500 transition-all cursor-pointer text-[10px]"
                    >
                      <div className="font-bold text-slate-900 dark:text-slate-100">Loja Comercial</div>
                      <div className="text-slate-500">R$ 960k • 62.0m²</div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="lg:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Título ou Identificação da Simulação:
              </label>
              <input
                type="text"
                value={simTitle}
                onChange={(e) => setSimTitle(e.target.value)}
                placeholder="Ex: Aporte Studio 30m² em Florianópolis"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Valor de Compra / Aporte */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Valor de Aquisição / Aporte (R$):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
              <input
                type="number"
                min={10000}
                step={5000}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>

          {/* Data de Entrada */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Data de Entrada / Início:
            </label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Horizon Slider & Quick Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              Horizonte de Simulação (Meses):
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
              {horizonMonths} meses ({(horizonMonths / 12).toFixed(1)} anos)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min={6}
              max={60}
              step={6}
              value={horizonMonths}
              onChange={(e) => setHorizonMonths(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <div className="flex items-center gap-1 shrink-0">
              {[12, 24, 36, 48, 60].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setHorizonMonths(m)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    horizonMonths === m
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Cenário de Valorização do Imóvel:
            </label>
            <button
              type="button"
              onClick={() => setUseCustomRate(!useCustomRate)}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
            >
              {useCustomRate ? "Usar cenários padrão" : "Definir taxa anual manual %"}
            </button>
          </div>

          {!useCustomRate ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["Conservador", "Moderado", "Otimista"] as AppreciationScenario[]).map((sc) => {
                const isSelected = scenario === sc;
                const rate = scenarioRates[sc];
                return (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setScenario(sc)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-xs ring-2 ring-blue-500/20"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {sc}
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        +{rate}% a.a.
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {sc === "Conservador"
                        ? "Inflação de obra (CUB) + margem básica"
                        : sc === "Moderado"
                        ? "Média histórica de valorização ARV"
                        : "Lançamento em fase inicial de alta demanda"}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Taxa de Valorização Anual Customizada:
              </span>
              <div className="relative w-36">
                <input
                  type="number"
                  step={0.5}
                  value={customRate}
                  onChange={(e) => setCustomRate(Number(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Projeta valorização composta de {customRate}% ao ano no período de {horizonMonths} meses.
              </span>
            </div>
          )}
        </div>

        {/* EDITAR INDICADORES DE MERCADO (CDI & IPCA) ACCORDION */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowIndicatorsConfig(!showIndicatorsConfig)}
              className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
            >
              <Settings2 className="w-4 h-4 text-blue-600" />
              <span>
                {showIndicatorsConfig
                  ? "Ocultar Painel de Indicadores da Simulação"
                  : "Editar Indicadores Financeiros (CDI & IPCA Projetados)"}
              </span>
              {useCustomIndicators && (
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">
                  Taxas Customizadas Ativas
                </span>
              )}
            </button>

            {useCustomIndicators && (
              <button
                type="button"
                onClick={handleResetIndicators}
                className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Restaurar Padrões BACEN
              </button>
            )}
          </div>

          {showIndicatorsConfig && (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Parâmetros de Mercado para Comparação
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Altere as taxas anuais projetadas para simular cenários de queda/alta da SELIC/CDI e inflação IPCA.
                  </p>
                </div>

                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomIndicators}
                    onChange={(e) => setUseCustomIndicators(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                  <span>Aplicar Taxas Personalizadas</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* CDI Projetado */}
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-600 dark:text-amber-400">CDI Projetado (% a.a.)</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ~{(Math.pow(1 + customCdiRate / 100, 1 / 12) - 1 * 100).toFixed(2)}% a.m.
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.25}
                      disabled={!useCustomIndicators}
                      value={customCdiRate}
                      onChange={(e) => setCustomCdiRate(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-slate-100 disabled:opacity-60"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <div className="flex gap-1 pt-1">
                    {[9.5, 10.5, 11.5, 12.5, 13.5].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        disabled={!useCustomIndicators}
                        onClick={() => setCustomCdiRate(rate)}
                        className={`px-1.5 py-0.5 text-[10px] rounded font-semibold transition-colors ${
                          customCdiRate === rate
                            ? "bg-amber-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        } disabled:opacity-40`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* IPCA Projetado */}
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-600 dark:text-rose-400">IPCA Inflação (% a.a.)</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ~{(Math.pow(1 + customIpcaRate / 100, 1 / 12) - 1 * 100).toFixed(2)}% a.m.
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.25}
                      disabled={!useCustomIndicators}
                      value={customIpcaRate}
                      onChange={(e) => setCustomIpcaRate(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 disabled:opacity-60"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <div className="flex gap-1 pt-1">
                    {[3.5, 4.0, 4.5, 5.0, 6.0].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        disabled={!useCustomIndicators}
                        onClick={() => setCustomIpcaRate(rate)}
                        className={`px-1.5 py-0.5 text-[10px] rounded font-semibold transition-colors ${
                          customIpcaRate === rate
                            ? "bg-rose-500 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        } disabled:opacity-40`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cenário Conservador Custom */}
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Cenário Conservador (% a.a.)</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.5}
                      value={scenarioRates.Conservador}
                      onChange={(e) =>
                        setScenarioRates({
                          ...scenarioRates,
                          Conservador: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Padrão: 11.5% a.a. (CUB + inflação)</span>
                </div>

                {/* Cenário Otimista Custom */}
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Cenário Otimista (% a.a.)</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.5}
                      value={scenarioRates.Otimista}
                      onChange={(e) =>
                        setScenarioRates({
                          ...scenarioRates,
                          Otimista: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Padrão: 23.5% a.a. (Alta valorização)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Costs Configuration Accordion */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowCostsConfig(!showCostsConfig)}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            {showCostsConfig ? "Ocultar Parâmetros de Custos & Tributos" : "Ajustar Parâmetros de Custos & Tributos (Corretagem, ITBI, IR)"}
          </button>

          {showCostsConfig && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs animate-in fade-in duration-200">
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  Corretagem na Venda (%):
                </label>
                <input
                  type="number"
                  step={0.5}
                  value={costs.corretagemPercentage}
                  onChange={(e) =>
                    setCosts({ ...costs, corretagemPercentage: Number(e.target.value) || 0 })
                  }
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  ITBI Aquisição (%):
                </label>
                <input
                  type="number"
                  step={0.5}
                  value={costs.itbiPercentage}
                  onChange={(e) =>
                    setCosts({ ...costs, itbiPercentage: Number(e.target.value) || 0 })
                  }
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  Custas Cartório / Registro (R$):
                </label>
                <input
                  type="number"
                  step={500}
                  value={costs.registroAmount}
                  onChange={(e) =>
                    setCosts({ ...costs, registroAmount: Number(e.target.value) || 0 })
                  }
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  IR Ganho de Capital (% s/ lucro):
                </label>
                <input
                  type="number"
                  step={1}
                  value={costs.impostoRendaPercentage}
                  onChange={(e) =>
                    setCosts({ ...costs, impostoRendaPercentage: Number(e.target.value) || 0 })
                  }
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Cálculo recalculado instantaneamente com indicadores ativos (CDI / IPCA / ARV).</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const currentInv = simulationMode === "contract"
                  ? investors.find((i) => i.id === contracts.find((c) => c.id === selectedContractId)?.investorId)?.name
                  : undefined;

                ProfitabilityPdfExportService.generateSimulationPDF(
                  currentResult.simulation,
                  currentResult.comparison,
                  {
                    clientName: currentInv,
                    includeCharts: true,
                    includeEvolutionChart: true,
                    includeComparisonBarChart: true,
                    includeCostBreakdownChart: true,
                    notes: `Simulação de rentabilidade calculada pelo Simulador Interativo ARV.`,
                  }
                );
              }}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Baixar PDF com Gráficos Imediatamente"
            >
              <FileDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              PDF com Gráficos
            </button>

            <button
              type="button"
              onClick={() => setShowPdfModal(true)}
              className="px-3 py-2.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
              title="Personalizar quais gráficos e tabelas incluir no relatório"
            >
              <Sliders className="w-3.5 h-3.5" />
              Personalizar Relatório
            </button>

            <button
              type="button"
              onClick={handleSaveSimulation}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Simulação Salva!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar no Histórico
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Live Calculated Chart Output */}
      <ProfitabilityComparisonChart
        simulation={currentResult.simulation}
        comparison={currentResult.comparison}
      />

      {/* PDF Customization Modal */}
      {showPdfModal && (
        <ProfitabilityPdfExportModal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          simulation={currentResult.simulation}
          comparison={currentResult.comparison}
          initialClientName={
            simulationMode === "contract"
              ? investors.find((i) => i.id === contracts.find((c) => c.id === selectedContractId)?.investorId)?.name
              : undefined
          }
        />
      )}
    </div>
  );
};
