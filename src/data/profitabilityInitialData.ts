import {
  MarketBenchmarkEntry,
  UnitPriceComparison,
  ProfitabilitySimulation,
} from "../types";
import { runProfitabilitySimulation } from "../utils/profitabilityCalculations";

// Histórico mensal dos últimos 24 meses de CDI e IPCA (Set/2024 até Ago/2026)
export const initialMarketBenchmarkHistory: MarketBenchmarkEntry[] = [
  // 2024
  { id: "cdi-2024-09", referenceMonth: "2024-09", indicator: "CDI", monthlyRatePercentage: 0.84, accumulated12MonthsPercentage: 11.20, source: "BACEN / Cetip" },
  { id: "ipca-2024-09", referenceMonth: "2024-09", indicator: "IPCA", monthlyRatePercentage: 0.44, accumulated12MonthsPercentage: 4.42, source: "IBGE" },

  { id: "cdi-2024-10", referenceMonth: "2024-10", indicator: "CDI", monthlyRatePercentage: 0.93, accumulated12MonthsPercentage: 11.15, source: "BACEN / Cetip" },
  { id: "ipca-2024-10", referenceMonth: "2024-10", indicator: "IPCA", monthlyRatePercentage: 0.56, accumulated12MonthsPercentage: 4.76, source: "IBGE" },

  { id: "cdi-2024-11", referenceMonth: "2024-11", indicator: "CDI", monthlyRatePercentage: 0.83, accumulated12MonthsPercentage: 11.02, source: "BACEN / Cetip" },
  { id: "ipca-2024-11", referenceMonth: "2024-11", indicator: "IPCA", monthlyRatePercentage: 0.36, accumulated12MonthsPercentage: 4.87, source: "IBGE" },

  { id: "cdi-2024-12", referenceMonth: "2024-12", indicator: "CDI", monthlyRatePercentage: 0.89, accumulated12MonthsPercentage: 10.90, source: "BACEN / Cetip" },
  { id: "ipca-2024-12", referenceMonth: "2024-12", indicator: "IPCA", monthlyRatePercentage: 0.52, accumulated12MonthsPercentage: 4.83, source: "IBGE" },

  // 2025
  { id: "cdi-2025-01", referenceMonth: "2025-01", indicator: "CDI", monthlyRatePercentage: 0.98, accumulated12MonthsPercentage: 11.05, source: "BACEN / Cetip" },
  { id: "ipca-2025-01", referenceMonth: "2025-01", indicator: "IPCA", monthlyRatePercentage: 0.42, accumulated12MonthsPercentage: 4.51, source: "IBGE" },

  { id: "cdi-2025-02", referenceMonth: "2025-02", indicator: "CDI", monthlyRatePercentage: 0.88, accumulated12MonthsPercentage: 11.18, source: "BACEN / Cetip" },
  { id: "ipca-2025-02", referenceMonth: "2025-02", indicator: "IPCA", monthlyRatePercentage: 0.83, accumulated12MonthsPercentage: 4.60, source: "IBGE" },

  { id: "cdi-2025-03", referenceMonth: "2025-03", indicator: "CDI", monthlyRatePercentage: 0.95, accumulated12MonthsPercentage: 11.35, source: "BACEN / Cetip" },
  { id: "ipca-2025-03", referenceMonth: "2025-03", indicator: "IPCA", monthlyRatePercentage: 0.28, accumulated12MonthsPercentage: 4.45, source: "IBGE" },

  { id: "cdi-2025-04", referenceMonth: "2025-04", indicator: "CDI", monthlyRatePercentage: 0.92, accumulated12MonthsPercentage: 11.42, source: "BACEN / Cetip" },
  { id: "ipca-2025-04", referenceMonth: "2025-04", indicator: "IPCA", monthlyRatePercentage: 0.38, accumulated12MonthsPercentage: 4.30, source: "IBGE" },

  { id: "cdi-2025-05", referenceMonth: "2025-05", indicator: "CDI", monthlyRatePercentage: 0.96, accumulated12MonthsPercentage: 11.55, source: "BACEN / Cetip" },
  { id: "ipca-2025-05", referenceMonth: "2025-05", indicator: "IPCA", monthlyRatePercentage: 0.46, accumulated12MonthsPercentage: 4.25, source: "IBGE" },

  { id: "cdi-2025-06", referenceMonth: "2025-06", indicator: "CDI", monthlyRatePercentage: 0.91, accumulated12MonthsPercentage: 11.60, source: "BACEN / Cetip" },
  { id: "ipca-2025-06", referenceMonth: "2025-06", indicator: "IPCA", monthlyRatePercentage: 0.21, accumulated12MonthsPercentage: 4.15, source: "IBGE" },

  { id: "cdi-2025-07", referenceMonth: "2025-07", indicator: "CDI", monthlyRatePercentage: 1.02, accumulated12MonthsPercentage: 11.75, source: "BACEN / Cetip" },
  { id: "ipca-2025-07", referenceMonth: "2025-07", indicator: "IPCA", monthlyRatePercentage: 0.38, accumulated12MonthsPercentage: 4.35, source: "IBGE" },

  { id: "cdi-2025-08", referenceMonth: "2025-08", indicator: "CDI", monthlyRatePercentage: 0.94, accumulated12MonthsPercentage: 11.80, source: "BACEN / Cetip" },
  { id: "ipca-2025-08", referenceMonth: "2025-08", indicator: "IPCA", monthlyRatePercentage: -0.02, accumulated12MonthsPercentage: 4.24, source: "IBGE" },

  { id: "cdi-2025-09", referenceMonth: "2025-09", indicator: "CDI", monthlyRatePercentage: 0.95, accumulated12MonthsPercentage: 11.95, source: "BACEN / Cetip" },
  { id: "ipca-2025-09", referenceMonth: "2025-09", indicator: "IPCA", monthlyRatePercentage: 0.44, accumulated12MonthsPercentage: 4.42, source: "IBGE" },

  { id: "cdi-2025-10", referenceMonth: "2025-10", indicator: "CDI", monthlyRatePercentage: 1.05, accumulated12MonthsPercentage: 12.10, source: "BACEN / Cetip" },
  { id: "ipca-2025-10", referenceMonth: "2025-10", indicator: "IPCA", monthlyRatePercentage: 0.56, accumulated12MonthsPercentage: 4.60, source: "IBGE" },

  { id: "cdi-2025-11", referenceMonth: "2025-11", indicator: "CDI", monthlyRatePercentage: 0.98, accumulated12MonthsPercentage: 12.25, source: "BACEN / Cetip" },
  { id: "ipca-2025-11", referenceMonth: "2025-11", indicator: "IPCA", monthlyRatePercentage: 0.36, accumulated12MonthsPercentage: 4.70, source: "IBGE" },

  { id: "cdi-2025-12", referenceMonth: "2025-12", indicator: "CDI", monthlyRatePercentage: 1.04, accumulated12MonthsPercentage: 12.40, source: "BACEN / Cetip" },
  { id: "ipca-2025-12", referenceMonth: "2025-12", indicator: "IPCA", monthlyRatePercentage: 0.52, accumulated12MonthsPercentage: 4.82, source: "IBGE" },

  // 2026
  { id: "cdi-2026-01", referenceMonth: "2026-01", indicator: "CDI", monthlyRatePercentage: 1.02, accumulated12MonthsPercentage: 12.35, source: "BACEN / Cetip" },
  { id: "ipca-2026-01", referenceMonth: "2026-01", indicator: "IPCA", monthlyRatePercentage: 0.42, accumulated12MonthsPercentage: 4.72, source: "IBGE" },

  { id: "cdi-2026-02", referenceMonth: "2026-02", indicator: "CDI", monthlyRatePercentage: 0.95, accumulated12MonthsPercentage: 12.20, source: "BACEN / Cetip" },
  { id: "ipca-2026-02", referenceMonth: "2026-02", indicator: "IPCA", monthlyRatePercentage: 0.65, accumulated12MonthsPercentage: 4.55, source: "IBGE" },

  { id: "cdi-2026-03", referenceMonth: "2026-03", indicator: "CDI", monthlyRatePercentage: 0.98, accumulated12MonthsPercentage: 12.05, source: "BACEN / Cetip" },
  { id: "ipca-2026-03", referenceMonth: "2026-03", indicator: "IPCA", monthlyRatePercentage: 0.32, accumulated12MonthsPercentage: 4.40, source: "IBGE" },

  { id: "cdi-2026-04", referenceMonth: "2026-04", indicator: "CDI", monthlyRatePercentage: 0.94, accumulated12MonthsPercentage: 11.90, source: "BACEN / Cetip" },
  { id: "ipca-2026-04", referenceMonth: "2026-04", indicator: "IPCA", monthlyRatePercentage: 0.38, accumulated12MonthsPercentage: 4.35, source: "IBGE" },

  { id: "cdi-2026-05", referenceMonth: "2026-05", indicator: "CDI", monthlyRatePercentage: 0.96, accumulated12MonthsPercentage: 11.85, source: "BACEN / Cetip" },
  { id: "ipca-2026-05", referenceMonth: "2026-05", indicator: "IPCA", monthlyRatePercentage: 0.44, accumulated12MonthsPercentage: 4.30, source: "IBGE" },

  { id: "cdi-2026-06", referenceMonth: "2026-06", indicator: "CDI", monthlyRatePercentage: 0.92, accumulated12MonthsPercentage: 11.75, source: "BACEN / Cetip" },
  { id: "ipca-2026-06", referenceMonth: "2026-06", indicator: "IPCA", monthlyRatePercentage: 0.25, accumulated12MonthsPercentage: 4.28, source: "IBGE" },

  { id: "cdi-2026-07", referenceMonth: "2026-07", indicator: "CDI", monthlyRatePercentage: 0.95, accumulated12MonthsPercentage: 11.65, source: "BACEN / Cetip" },
  { id: "ipca-2026-07", referenceMonth: "2026-07", indicator: "IPCA", monthlyRatePercentage: 0.34, accumulated12MonthsPercentage: 4.22, source: "IBGE" },

  { id: "cdi-2026-08", referenceMonth: "2026-08", indicator: "CDI", monthlyRatePercentage: 0.93, accumulated12MonthsPercentage: 11.55, source: "BACEN / Cetip" },
  { id: "ipca-2026-08", referenceMonth: "2026-08", indicator: "IPCA", monthlyRatePercentage: 0.30, accumulated12MonthsPercentage: 4.18, source: "IBGE" },
];

// Comparativo de Preço por m² entre Unidades / Empreendimentos ARV vs Benchmark de Mercado Regional
export const initialUnitPriceComparisons: UnitPriceComparison[] = [
  {
    id: "upc-grid-01",
    unitId: "unit-grid-201",
    speId: "spe-grid",
    speName: "SPE ARV GRID LTDA",
    unitNumber: "Studio 201 (Tipo)",
    type: "Studio",
    areaM2: 28.5,
    price: 445000,
    pricePerM2: 15614,
    region: "Trindade - Florianópolis / SC",
    buildingStandard: "Médio",
    benchmarkAveragePricePerM2Region: 13800,
    positioningPercentage: 13.14,
    referenceDate: "2026-08",
  },
  {
    id: "upc-grid-02",
    unitId: "unit-grid-101",
    speId: "spe-grid",
    speName: "SPE ARV GRID LTDA",
    unitNumber: "Studio Garden 101",
    type: "Studio Garden",
    areaM2: 46.8,
    price: 685000,
    pricePerM2: 14636,
    region: "Trindade - Florianópolis / SC",
    buildingStandard: "Médio",
    benchmarkAveragePricePerM2Region: 13800,
    positioningPercentage: 6.06,
    referenceDate: "2026-08",
  },
  {
    id: "upc-grid-03",
    unitId: "unit-grid-601",
    speId: "spe-grid",
    speName: "SPE ARV GRID LTDA",
    unitNumber: "Cobertura Duplex 601",
    type: "Cobertura Duplex",
    areaM2: 78.4,
    price: 1280000,
    pricePerM2: 16326,
    region: "Trindade - Florianópolis / SC",
    buildingStandard: "Alto Padrão",
    benchmarkAveragePricePerM2Region: 14500,
    positioningPercentage: 12.59,
    referenceDate: "2026-08",
  },
  {
    id: "upc-grid-04",
    unitId: "unit-grid-com01",
    speId: "spe-grid",
    speName: "SPE ARV GRID LTDA",
    unitNumber: "Loja Comercial 01",
    type: "Loja Comercial",
    areaM2: 62.0,
    price: 960000,
    pricePerM2: 15483,
    region: "Trindade - Florianópolis / SC",
    buildingStandard: "Médio",
    benchmarkAveragePricePerM2Region: 14000,
    positioningPercentage: 10.59,
    referenceDate: "2026-08",
  },
  {
    id: "upc-01",
    unitId: "unit-t58-01",
    speId: "spe-t58",
    speName: "SPE 13 - T58 SPOT SPE LTDA",
    unitNumber: "Studio 201",
    type: "Studio",
    areaM2: 32.5,
    price: 438750,
    pricePerM2: 13500,
    region: "Trindade - Florianópolis / SC",
    buildingStandard: "Médio",
    benchmarkAveragePricePerM2Region: 12400,
    positioningPercentage: 8.87, // +8.87% acima da média regional
    referenceDate: "2026-08",
  },
  {
    id: "upc-02",
    unitId: "unit-t58-02",
    speId: "spe-t58",
    speName: "SPE 13 - T58 SPOT SPE LTDA",
    unitNumber: "Studio Garden 102",
    type: "Studio Garden",
    areaM2: 45.0,
    price: 639000,
    pricePerM2: 14200,
    region: "Trindade - Florianópolis / SC",
    buildingStandard: "Médio",
    benchmarkAveragePricePerM2Region: 12400,
    positioningPercentage: 14.52,
    referenceDate: "2026-08",
  },
  {
    id: "upc-03",
    unitId: "unit-01",
    speId: "spe-01",
    speName: "SPE ARV Vista Mar Residence",
    unitNumber: "Apto 1201",
    type: "3 Suítes",
    areaM2: 165.0,
    price: 2970000,
    pricePerM2: 18000,
    region: "Meireles - Fortaleza / CE",
    buildingStandard: "Alto Padrão",
    benchmarkAveragePricePerM2Region: 16200,
    positioningPercentage: 11.11,
    referenceDate: "2026-08",
  },
  {
    id: "upc-04",
    unitId: "unit-02",
    speId: "spe-01",
    speName: "SPE ARV Vista Mar Residence",
    unitNumber: "Cobertura 1801",
    type: "Cobertura Duplex",
    areaM2: 240.0,
    price: 4800000,
    pricePerM2: 20000,
    region: "Meireles - Fortaleza / CE",
    buildingStandard: "Alto Padrão",
    benchmarkAveragePricePerM2Region: 17500,
    positioningPercentage: 14.29,
    referenceDate: "2026-08",
  },
  {
    id: "upc-05",
    unitId: "unit-03",
    speId: "spe-02",
    speName: "SPE ARV Parque Cocó Vista",
    unitNumber: "Apto 804",
    type: "2 Suítes",
    areaM2: 88.0,
    price: 1012000,
    pricePerM2: 11500,
    region: "Cocó - Fortaleza / CE",
    buildingStandard: "Médio",
    benchmarkAveragePricePerM2Region: 10800,
    positioningPercentage: 6.48,
    referenceDate: "2026-08",
  },
  {
    id: "upc-06",
    unitId: "unit-04",
    speId: "spe-03",
    speName: "SPE ARV Corporate Santos Dumont",
    unitNumber: "Sala Corp 1402",
    type: "Sala Comercial",
    areaM2: 55.0,
    price: 880000,
    pricePerM2: 16000,
    region: "Aldeota - Fortaleza / CE",
    buildingStandard: "Alto Padrão",
    benchmarkAveragePricePerM2Region: 14500,
    positioningPercentage: 10.34,
    referenceDate: "2026-08",
  },
  {
    id: "upc-07",
    unitId: "unit-05",
    speId: "spe-04",
    speName: "SPE ARV Grand Bay Resort",
    unitNumber: "Bangalô 10",
    type: "Resort Pé na Areia",
    areaM2: 120.0,
    price: 1800000,
    pricePerM2: 15000,
    region: "Porto das Dunas - Aquiraz / CE",
    buildingStandard: "Alto Padrão",
    benchmarkAveragePricePerM2Region: 13800,
    positioningPercentage: 8.70,
    referenceDate: "2026-08",
  },
  {
    id: "upc-08",
    unitId: "unit-06",
    speId: "spe-05",
    speName: "SPE ARV Eco Residence",
    unitNumber: "Apto 502",
    type: "2 Quartos",
    areaM2: 72.0,
    price: 936000,
    pricePerM2: 13000,
    region: "Meireles - Fortaleza / CE",
    buildingStandard: "Médio",
    benchmarkAveragePricePerM2Region: 13500,
    positioningPercentage: -3.70, // Oportunidade com preço abaixo da média da região
    referenceDate: "2026-08",
  },
];

// Exemplos iniciais de Simulações de Rentabilidade vinculadas a contratos
export const initialProfitabilitySimulations: ProfitabilitySimulation[] = [
  // Simulação SPE GRID 1: Studio 201 - ARV GRID Trindade (36 meses)
  runProfitabilitySimulation(
    {
      id: "sim-grid-01",
      contractId: "ctr-grid-01",
      speId: "spe-grid",
      unitId: "unit-grid-201",
      investorName: "HGLM Administração Patrimonial LTDA",
      title: "SPE ARV GRID • Studio 201 (Cenário Moderado 36m)",
      purchasePrice: 445000,
      entryDate: "2026-06-15",
      horizonMonths: 36,
      appreciationScenario: "Moderado",
      customAnnualAppreciationRate: 19.2,
      costs: {
        corretagemPercentage: 4.0,
        itbiPercentage: 2.0,
        registroAmount: 3500,
        impostoRendaPercentage: 15.0,
      },
    },
    initialMarketBenchmarkHistory
  ).simulation,

  // Simulação SPE GRID 2: Studio Garden 101 - ARV GRID Trindade (48 meses)
  runProfitabilitySimulation(
    {
      id: "sim-grid-02",
      contractId: "ctr-grid-02",
      speId: "spe-grid",
      unitId: "unit-grid-101",
      investorName: "Marcelo Moreira Ferraz",
      title: "SPE ARV GRID • Studio Garden 101 (Cenário Otimista 48m)",
      purchasePrice: 685000,
      entryDate: "2026-07-02",
      horizonMonths: 48,
      appreciationScenario: "Otimista",
      customAnnualAppreciationRate: 21.0,
      costs: {
        corretagemPercentage: 4.0,
        itbiPercentage: 2.0,
        registroAmount: 4200,
        impostoRendaPercentage: 15.0,
      },
    },
    initialMarketBenchmarkHistory
  ).simulation,

  // Simulação 1: HGLM Patrimonial - T58 Spot (36 meses)
  runProfitabilitySimulation(
    {
      id: "sim-t58-01",
      contractId: "ctr-t58-01",
      unitId: "unit-t58-01",
      investorName: "HGLM Administração Patrimonial LTDA",
      title: "SPE 13 T58 Spot - Studio 201 (Cenário Moderado)",
      purchasePrice: 420000,
      entryDate: "2024-03-15",
      horizonMonths: 36,
      appreciationScenario: "Moderado",
      costs: {
        corretagemPercentage: 4.0,
        itbiPercentage: 2.0,
        registroAmount: 3500,
        impostoRendaPercentage: 15.0,
      },
    },
    initialMarketBenchmarkHistory
  ).simulation,

  // Simulação 2: Alfredo Magalhães - T58 Spot (24 meses)
  runProfitabilitySimulation(
    {
      id: "sim-t58-02",
      contractId: "ctr-t58-02",
      unitId: "unit-t58-02",
      investorName: "Alfredo Gilberto Lima de Magalhaes",
      title: "SPE 13 T58 Spot - Studio 102 (Cenário Otimista)",
      purchasePrice: 639000,
      entryDate: "2024-06-10",
      horizonMonths: 24,
      appreciationScenario: "Otimista",
      costs: {
        corretagemPercentage: 4.0,
        itbiPercentage: 2.0,
        registroAmount: 3800,
        impostoRendaPercentage: 15.0,
      },
    },
    initialMarketBenchmarkHistory
  ).simulation,

  // Simulação 3: Janice Messias - Aporte Residencial Meireles (48 meses)
  runProfitabilitySimulation(
    {
      id: "sim-t58-03",
      contractId: "ctr-t58-15",
      unitId: "unit-01",
      investorName: "Janice Messias Pesalacia",
      title: "SPE ARV Vista Mar - 3 Suítes (Cenário Conservador)",
      purchasePrice: 1250000,
      entryDate: "2024-01-10",
      horizonMonths: 48,
      appreciationScenario: "Conservador",
      costs: {
        corretagemPercentage: 4.0,
        itbiPercentage: 2.0,
        registroAmount: 5000,
        impostoRendaPercentage: 15.0,
      },
    },
    initialMarketBenchmarkHistory
  ).simulation,

  // Simulação 4: Projeção Livre de Investimento Spot (36 meses)
  runProfitabilitySimulation(
    {
      id: "sim-t58-04",
      title: "Simulação de Mercado: Investimento R$ 500k em Studio",
      simulatedInvestedAmount: 500000,
      purchasePrice: 500000,
      entryDate: "2025-01-01",
      horizonMonths: 36,
      appreciationScenario: "Moderado",
      costs: {
        corretagemPercentage: 4.0,
        itbiPercentage: 2.0,
        registroAmount: 3500,
        impostoRendaPercentage: 15.0,
      },
    },
    initialMarketBenchmarkHistory
  ).simulation,
];
