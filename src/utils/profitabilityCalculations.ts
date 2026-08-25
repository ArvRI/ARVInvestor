import {
  MarketBenchmarkEntry,
  MarketIndicator,
  ProfitabilitySimulation,
  BenchmarkComparisonResult,
  AppreciationScenario,
  ProfitabilityCosts,
  SimulationMonthlyPoint,
} from "../types";

/**
 * Converte retorno total acumulado de um período em taxa anualizada (juros compostos)
 * Fórmula: (1 + totalReturn)^(12 / months) - 1
 */
export function calculateAnnualizedReturn(
  totalReturnPercentage: number,
  months: number
): number {
  if (months <= 0) return 0;
  const totalFactor = 1 + totalReturnPercentage / 100;
  if (totalFactor <= 0) return -100;
  const annualizedFactor = Math.pow(totalFactor, 12 / months);
  return (annualizedFactor - 1) * 100;
}

/**
 * Retorno Real descontando inflação (Equação de Fisher)
 * Fórmula: ((1 + nominal) / (1 + inflação)) - 1
 */
export function calculateRealReturn(
  nominalReturnPercentage: number,
  ipcaReturnPercentageSamePeriod: number
): number {
  const nominalFactor = 1 + nominalReturnPercentage / 100;
  const ipcaFactor = 1 + ipcaReturnPercentageSamePeriod / 100;
  if (ipcaFactor <= 0) return nominalReturnPercentage;
  return ((nominalFactor / ipcaFactor) - 1) * 100;
}

/**
 * Gera lista de meses ("AAAA-MM") entre duas datas ou a partir de um mês e horizonte
 */
export function generateMonthRange(startMonth: string, horizonMonths: number): string[] {
  const months: string[] = [];
  const [yearStr, monthStr] = startMonth.split("-");
  let y = parseInt(yearStr, 10) || 2024;
  let m = parseInt(monthStr, 10) || 1;

  for (let i = 0; i <= horizonMonths; i++) {
    const formattedMonth = `${y}-${m.toString().padStart(2, "0")}`;
    months.push(formattedMonth);
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }
  return months;
}

/**
 * Capitaliza as taxas mensais de um indicador (CDI / IPCA / SELIC) no período informado.
 * Para meses futuros fora da base histórica, projeta usando a média dos últimos 12 meses registrados.
 */
export function calculateCompoundIndicatorReturn(
  benchmarkHistory: MarketBenchmarkEntry[],
  indicator: MarketIndicator,
  startMonth: string, // "AAAA-MM"
  horizonMonths: number
): { totalReturnPercentage: number; monthlyRates: number[] } {
  if (horizonMonths <= 0) return { totalReturnPercentage: 0, monthlyRates: [] };

  // Filtrar histórico do indicador e ordenar cronologicamente
  const entries = benchmarkHistory
    .filter((b) => b.indicator === indicator)
    .sort((a, b) => a.referenceMonth.localeCompare(b.referenceMonth));

  // Mapa de taxas conhecidas
  const rateMap = new Map<string, number>();
  entries.forEach((e) => rateMap.set(e.referenceMonth, e.monthlyRatePercentage));

  // Calcular média dos últimos 12 meses conhecidos como fallback de projeção futura
  const recentEntries = entries.slice(-12);
  const avgMonthlyRate =
    recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.monthlyRatePercentage, 0) /
        recentEntries.length
      : indicator === "CDI"
      ? 0.92 // ~11.5% a.a.
      : 0.38; // ~4.6% a.a. para IPCA

  const monthRange = generateMonthRange(startMonth, horizonMonths);
  let compoundFactor = 1.0;
  const monthlyRates: number[] = [];

  // Pular o mês 0 (início) e acumular os próximos N meses
  for (let i = 1; i <= horizonMonths; i++) {
    const monthKey = monthRange[i];
    const rate = rateMap.has(monthKey) ? rateMap.get(monthKey)! : avgMonthlyRate;
    monthlyRates.push(rate);
    compoundFactor *= 1 + rate / 100;
  }

  const totalReturnPercentage = (compoundFactor - 1) * 100;
  return { totalReturnPercentage, monthlyRates };
}

export interface ProfitabilitySimulationInput {
  id?: string;
  contractId?: string;
  unitId?: string;
  speId?: string;
  investorName?: string;
  title?: string;
  simulatedInvestedAmount?: number;
  purchasePrice: number;
  entryDate: string; // "AAAA-MM-DD"
  horizonMonths: number;
  appreciationScenario: AppreciationScenario;
  customAnnualAppreciationRate?: number; // % ao ano customizado (opcional)
  customCdiAnnualRate?: number; // % ao ano customizado para CDI (opcional)
  customIpcaAnnualRate?: number; // % ao ano customizado para IPCA (opcional)
  customScenarioRates?: {
    Conservador?: number;
    Moderado?: number;
    Otimista?: number;
  };
  costs?: Partial<ProfitabilityCosts>;
}

export const DEFAULT_SIMULATION_COSTS: ProfitabilityCosts = {
  corretagemPercentage: 4.0, // 4% de corretagem na venda
  itbiPercentage: 2.0, // 2% de ITBI na aquisição
  registroAmount: 3500, // R$ 3.500 de custas de cartório/registro
  impostoRendaPercentage: 15.0, // 15% sobre ganho de capital líquido
};

export const SCENARIO_ANNUAL_RATES: Record<AppreciationScenario, number> = {
  Conservador: 11.5, // 11.5% a.a. (CUB + inflação básica da construção)
  Moderado: 17.0, // 17.0% a.a. (Média histórica empreendimentos ARV com maturação de obra)
  Otimista: 23.5, // 23.5% a.a. (Empreendimentos de alto padrão em valorização acelerada)
};

/**
 * Executa simulação completa de rentabilidade comparando com CDI e IPCA
 */
export function runProfitabilitySimulation(
  input: ProfitabilitySimulationInput,
  benchmarkHistory: MarketBenchmarkEntry[]
): {
  simulation: ProfitabilitySimulation;
  comparison: BenchmarkComparisonResult;
} {
  const simulationId =
    input.id ||
    `sim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const purchasePrice = Math.max(1000, input.purchasePrice);
  const horizonMonths = Math.max(1, input.horizonMonths);
  const entryDate = input.entryDate || new Date().toISOString().split("T")[0];

  // Calcular Data de Saída
  const [entryYear, entryMonth, entryDay] = entryDate.split("-").map(Number);
  const exitDateObj = new Date(entryYear, entryMonth - 1 + horizonMonths, entryDay || 1);
  const exitDate = exitDateObj.toISOString().split("T")[0];

  // Taxa de valorização anual baseada no cenário ou customizada
  const activeScenarioRates = {
    ...SCENARIO_ANNUAL_RATES,
    ...(input.customScenarioRates || {}),
  };

  const annualAppreciationRate =
    input.customAnnualAppreciationRate !== undefined
      ? input.customAnnualAppreciationRate
      : activeScenarioRates[input.appreciationScenario] || 17.0;

  // Valorização bruta total no horizonte de meses: (1 + taxa_anual)^(meses/12) - 1
  const grossAppreciationFactor = Math.pow(
    1 + annualAppreciationRate / 100,
    horizonMonths / 12
  );
  const appreciationPercentageTotal = (grossAppreciationFactor - 1) * 100;
  const projectedSalePrice = purchasePrice * grossAppreciationFactor;

  // Custos considerados
  const costs: ProfitabilityCosts = {
    ...DEFAULT_SIMULATION_COSTS,
    ...input.costs,
  };

  const corretagemAmount = (costs.corretagemPercentage / 100) * projectedSalePrice;
  const itbiAmount = (costs.itbiPercentage / 100) * purchasePrice;
  const registroAmount = costs.registroAmount;

  // Ganho bruto antes de IR
  const grossGain = projectedSalePrice - purchasePrice - corretagemAmount - itbiAmount - registroAmount;

  // Imposto de Renda sobre ganho de capital (se lucro > 0)
  const taxableGain = Math.max(0, grossGain);
  const irAmount = (costs.impostoRendaPercentage / 100) * taxableGain;

  // Lucro líquido final
  const totalDeductions = corretagemAmount + itbiAmount + registroAmount + irAmount;
  const netProfitAmount = projectedSalePrice - purchasePrice - totalDeductions;
  const netProfitPercentage = (netProfitAmount / purchasePrice) * 100;

  // Retorno Anualizado do Imóvel
  const annualizedReturnPercentage = calculateAnnualizedReturn(
    netProfitPercentage,
    horizonMonths
  );

  const startMonth = entryDate.substring(0, 7); // "AAAA-MM"

  // Capitalização de CDI e IPCA para o mesmo período (com suporte a taxas customizadas)
  let cdiReturnPercentageSamePeriod: number;
  let cdiAnnualizedPercentage: number;
  let cdiMonthlyRates: number[] = [];

  if (input.customCdiAnnualRate !== undefined && input.customCdiAnnualRate >= 0) {
    const cdiMonthlyFactor = Math.pow(1 + input.customCdiAnnualRate / 100, 1 / 12);
    const cdiTotalFactor = Math.pow(cdiMonthlyFactor, horizonMonths);
    cdiReturnPercentageSamePeriod = (cdiTotalFactor - 1) * 100;
    cdiAnnualizedPercentage = input.customCdiAnnualRate;
    cdiMonthlyRates = Array(horizonMonths).fill((cdiMonthlyFactor - 1) * 100);
  } else {
    const cdiResult = calculateCompoundIndicatorReturn(
      benchmarkHistory,
      "CDI",
      startMonth,
      horizonMonths
    );
    cdiReturnPercentageSamePeriod = cdiResult.totalReturnPercentage;
    cdiAnnualizedPercentage = calculateAnnualizedReturn(
      cdiReturnPercentageSamePeriod,
      horizonMonths
    );
    cdiMonthlyRates = cdiResult.monthlyRates;
  }

  let ipcaReturnPercentageSamePeriod: number;
  let ipcaAnnualizedPercentage: number;
  let ipcaMonthlyRates: number[] = [];

  if (input.customIpcaAnnualRate !== undefined && input.customIpcaAnnualRate >= 0) {
    const ipcaMonthlyFactor = Math.pow(1 + input.customIpcaAnnualRate / 100, 1 / 12);
    const ipcaTotalFactor = Math.pow(ipcaMonthlyFactor, horizonMonths);
    ipcaReturnPercentageSamePeriod = (ipcaTotalFactor - 1) * 100;
    ipcaAnnualizedPercentage = input.customIpcaAnnualRate;
    ipcaMonthlyRates = Array(horizonMonths).fill((ipcaMonthlyFactor - 1) * 100);
  } else {
    const ipcaResult = calculateCompoundIndicatorReturn(
      benchmarkHistory,
      "IPCA",
      startMonth,
      horizonMonths
    );
    ipcaReturnPercentageSamePeriod = ipcaResult.totalReturnPercentage;
    ipcaAnnualizedPercentage = calculateAnnualizedReturn(
      ipcaReturnPercentageSamePeriod,
      horizonMonths
    );
    ipcaMonthlyRates = ipcaResult.monthlyRates;
  }

  // Spreads / Comparações
  const realEstateVsCdiPercentagePoints =
    netProfitPercentage - cdiReturnPercentageSamePeriod;
  const realEstateVsIpcaPercentagePoints =
    netProfitPercentage - ipcaReturnPercentageSamePeriod;

  // Retorno Real descontado da inflação (IPCA)
  const realGainAboveInflationPercentage = calculateRealReturn(
    netProfitPercentage,
    ipcaReturnPercentageSamePeriod
  );

  // Vencedor
  let winnerIndicator: "Imóvel" | "CDI" | "IPCA" = "Imóvel";
  if (netProfitPercentage < ipcaReturnPercentageSamePeriod) {
    winnerIndicator = "IPCA";
  } else if (netProfitPercentage < cdiReturnPercentageSamePeriod) {
    winnerIndicator = "CDI";
  }

  // Curva de evolução mensal (normalizada para R$ 1.000 de base para visualização limpa)
  const monthlyEvolution: SimulationMonthlyPoint[] = [];
  const baseValue = 1000;

  let currentRealEstateVal = baseValue;
  let currentCdiVal = baseValue;
  let currentIpcaVal = baseValue;

  const monthRange = generateMonthRange(startMonth, horizonMonths);

  monthlyEvolution.push({
    monthIndex: 0,
    monthLabel: monthRange[0] || "Início",
    realEstateValue: baseValue,
    cdiValue: baseValue,
    ipcaValue: baseValue,
  });

  const monthlyRealEstateRate =
    Math.pow(1 + netProfitPercentage / 100, 1 / horizonMonths) - 1;

  for (let m = 1; m <= horizonMonths; m++) {
    currentRealEstateVal = baseValue * Math.pow(1 + monthlyRealEstateRate, m);

    const cdiRateThisMonth = cdiMonthlyRates[m - 1] || 0.9;
    currentCdiVal *= 1 + cdiRateThisMonth / 100;

    const ipcaRateThisMonth = ipcaMonthlyRates[m - 1] || 0.4;
    currentIpcaVal *= 1 + ipcaRateThisMonth / 100;

    monthlyEvolution.push({
      monthIndex: m,
      monthLabel: monthRange[m] || `Mês ${m}`,
      realEstateValue: Math.round(currentRealEstateVal * 100) / 100,
      cdiValue: Math.round(currentCdiVal * 100) / 100,
      ipcaValue: Math.round(currentIpcaVal * 100) / 100,
    });
  }

  const simulation: ProfitabilitySimulation = {
    id: simulationId,
    contractId: input.contractId,
    unitId: input.unitId,
    speId: input.speId,
    investorName: input.investorName,
    title: input.title || `Simulação ${input.appreciationScenario} (${horizonMonths}m)`,
    simulatedInvestedAmount: input.simulatedInvestedAmount || purchasePrice,
    entryDate,
    exitDate,
    horizonMonths,
    purchasePrice,
    projectedSalePrice,
    appreciationScenario: input.appreciationScenario,
    appreciationPercentageTotal,
    netProfitAmount,
    netProfitPercentage,
    annualizedReturnPercentage,
    customAnnualAppreciationRate: input.customAnnualAppreciationRate,
    customCdiAnnualRate: input.customCdiAnnualRate,
    customIpcaAnnualRate: input.customIpcaAnnualRate,
    costsConsidered: costs,
    createdAt: new Date().toISOString().split("T")[0],
  };

  const comparison: BenchmarkComparisonResult = {
    simulationId,
    realEstateReturnPercentage: netProfitPercentage,
    realEstateAnnualizedPercentage: annualizedReturnPercentage,
    cdiReturnPercentageSamePeriod,
    cdiAnnualizedPercentage,
    ipcaReturnPercentageSamePeriod,
    ipcaAnnualizedPercentage,
    realEstateVsCdiPercentagePoints,
    realEstateVsIpcaPercentagePoints,
    realGainAboveInflationPercentage,
    winnerIndicator,
    monthlyEvolution,
    usedCustomIndicators:
      input.customCdiAnnualRate !== undefined ||
      input.customIpcaAnnualRate !== undefined ||
      input.customAnnualAppreciationRate !== undefined,
  };

  return { simulation, comparison };
}
