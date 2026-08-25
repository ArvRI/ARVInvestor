import { PriceTable, PricingUnit, PaymentConditionTemplate } from "../types/pricing";

export const gridPaymentTemplates: PaymentConditionTemplate[] = [
  {
    id: "template-grid-padrao-40x",
    name: "Tabela Financiamento GRID (12% Ato + 40X Mensais + 6X Semestrais + Parcela Final + Financiamento 60%)",
    description: "Modelo oficial ARV GRID: 12% Ato (Ago/26), 15% em 40x (Set/26 - Dez/29), 8% em 6x reforços, 5% parcela final e 60% financiamento.",
    isDefault: true,
    downPaymentPercent: 12,
    downPaymentInstallments: 1,
    monthlyInstallmentsCount: 40,
    monthlyInstallmentsPercent: 15,
    balloonInstallmentsCount: 6,
    balloonInstallmentsPercent: 8,
    finalPaymentPercent: 5,
    keysPaymentPercent: 60,
    correctionIndex: "CUB/SC",
    discountForCashPayment: 10,
  },
  {
    id: "template-grid-investidor-cub",
    name: "Tabela Direta Investidor 100% CUB/SC",
    description: "Parcelamento indexado pelo CUB/SC Sinduscon R8-N durante a fase de obra.",
    isDefault: false,
    downPaymentPercent: 15,
    downPaymentInstallments: 2,
    monthlyInstallmentsCount: 40,
    monthlyInstallmentsPercent: 45,
    balloonInstallmentsCount: 6,
    balloonInstallmentsPercent: 20,
    keysPaymentPercent: 20,
    correctionIndex: "CUB/SC",
    discountForCashPayment: 8,
  },
  {
    id: "template-grid-a-vista",
    name: "Quitação À Vista / Investidor Seed (10% Desconto)",
    description: "Pagamento 100% no ato com desconto máximo comercial de 10%.",
    isDefault: false,
    downPaymentPercent: 100,
    downPaymentInstallments: 1,
    monthlyInstallmentsCount: 0,
    monthlyInstallmentsPercent: 0,
    balloonInstallmentsCount: 0,
    balloonInstallmentsPercent: 0,
    keysPaymentPercent: 0,
    correctionIndex: "Fixo Sem Juros",
    discountForCashPayment: 10,
  },
];

export const gridPriceTable: PriceTable = {
  id: "tab-grid-2026-v1",
  speId: "spe-grid",
  speName: "SPE ARV GRID LTDA",
  name: "TABELA FINANCIAMENTO - ARV GRID",
  version: "Agosto/2026 - Rev. Oficial",
  status: "Ativa",
  validFrom: "2026-08-01",
  validUntil: "2026-09-30",
  cubReferenceValue: 3151.24,
  cubReferenceDate: "Agosto/2026",
  standardCorrectionIndex: "CUB/SC Sinduscon R8-N",
  incorporationRegistration: "R-1-3.706",
  totalUnitsCount: 106,
  availableUnitsCount: 71,
  reservedUnitsCount: 0,
  soldUnitsCount: 35,
  totalVgv: 48945230.12,
  availableVgv: 34120850.40,
  soldVgv: 14824379.72,
  averagePricePerM2: 16180,
  averageCubPerM2: 5.13,
  defaultCommissionPercent: 5.0,
  paymentTemplates: gridPaymentTemplates,
  description: "Tabela oficial de vendas e fluxo de financiamento do empreendimento ARV GRID. Registro de Incorporação R-1-3.706. CUB/SC de referência: R$ 3.151,24.",
  updatedAt: "2026-08-24T10:00:00Z",
  updatedBy: "Diretoria Comercial ARV",
};

// Raw definitions matching page 1 and page 2 of attached PDF
interface RawGridItem {
  unidade: string;
  pavimento: string;
  floor: number;
  tipologia: any;
  posicao: string;
  areaInterna: number;
  areaExterna?: number;
  garagem: any;
  status: "Disponível" | "Vendido";
  valorTotal?: number;
  ato?: number;
  parcelas40x?: number;
  reforcos6x?: number;
  parcelaFinal?: number;
  financiamento?: number;
}

const rawGridUnits: RawGridItem[] = [
  // 1° Pavimento
  { unidade: "Loja 01", pavimento: "1° Pavimento", floor: 1, tipologia: "Loja/Sobreloja", posicao: "Frente Rua Juvêncio Costa", areaInterna: 53.62, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 991953.03, ato: 119034.36, parcelas40x: 3719.82, reforcos6x: 13226.04, parcelaFinal: 49597.65, financiamento: 595171.82 },
  { unidade: "Loja 02", pavimento: "1° Pavimento", floor: 1, tipologia: "Loja/Sobreloja", posicao: "Frente Rua Juvêncio Costa", areaInterna: 60.15, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 1112755.96, ato: 133530.72, parcelas40x: 4172.83, reforcos6x: 14836.75, parcelaFinal: 55637.80, financiamento: 667653.58 },

  // 2° Pavimento
  { unidade: "201", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio - Garden", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 13.57, garagem: "------", status: "Disponível", valorTotal: 522957.52, ato: 62754.90, parcelas40x: 1961.09, reforcos6x: 6972.77, parcelaFinal: 26147.88, financiamento: 313774.51 },
  { unidade: "202", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio - Garden", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 13.57, garagem: "------", status: "Disponível", valorTotal: 522927.39, ato: 62751.29, parcelas40x: 1960.98, reforcos6x: 6972.37, parcelaFinal: 26146.37, financiamento: 313756.43 },
  { unidade: "203", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio - Garden", posicao: "Fachada Norte", areaInterna: 29.58, areaExterna: 31.08, garagem: "------", status: "Disponível", valorTotal: 699600.25, ato: 83952.03, parcelas40x: 2623.50, reforcos6x: 9328.00, parcelaFinal: 34980.01, financiamento: 419760.15 },
  { unidade: "204", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio - Garden", posicao: "Frente Rua Enoé Schutel", areaInterna: 31.34, areaExterna: 27.16, garagem: "------", status: "Disponível", valorTotal: 696037.52, ato: 83524.50, parcelas40x: 2610.14, reforcos6x: 9280.50, parcelaFinal: 34801.88, financiamento: 417622.51 },
  { unidade: "205", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 454167.23, ato: 54500.07, parcelas40x: 1703.13, reforcos6x: 6055.56, parcelaFinal: 22708.36, financiamento: 272500.34 },
  { unidade: "206", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 454167.23, ato: 54500.07, parcelas40x: 1703.13, reforcos6x: 6055.56, parcelaFinal: 22708.36, financiamento: 272500.34 },
  { unidade: "207", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 454167.23, ato: 54500.07, parcelas40x: 1703.13, reforcos6x: 6055.56, parcelaFinal: 22708.36, financiamento: 272500.34 },
  { unidade: "208", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 454167.23, ato: 54500.07, parcelas40x: 1703.13, reforcos6x: 6055.56, parcelaFinal: 22708.36, financiamento: 272500.34 },
  { unidade: "209", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 454167.23, ato: 54500.07, parcelas40x: 1703.13, reforcos6x: 6055.56, parcelaFinal: 22708.36, financiamento: 272500.34 },
  { unidade: "210", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio - Garden", posicao: "Frente Rua Enoé Schutel", areaInterna: 31.33, areaExterna: 26.86, garagem: "------", status: "Vendido" },
  { unidade: "211", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio - Garden", posicao: "Fachada Norte", areaInterna: 29.57, areaExterna: 31.78, garagem: "------", status: "Disponível", valorTotal: 718815.77, ato: 86257.89, parcelas40x: 2695.56, reforcos6x: 9584.21, parcelaFinal: 35940.79, financiamento: 431289.46 },
  { unidade: "212", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio - Garden", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 13.57, garagem: "------", status: "Disponível", valorTotal: 526821.23, ato: 63218.55, parcelas40x: 1975.58, reforcos6x: 7024.28, parcelaFinal: 26341.06, financiamento: 316092.74 },
  { unidade: "213", pavimento: "2° Pavimento", floor: 2, tipologia: "Studio - Garden", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 13.57, garagem: "------", status: "Disponível", valorTotal: 523723.89, ato: 62846.87, parcelas40x: 1963.96, reforcos6x: 6982.99, parcelaFinal: 26186.19, financiamento: 314234.33 },

  // 3° Pavimento
  { unidade: "301", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "302", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 431456.53, ato: 51774.78, parcelas40x: 1617.96, reforcos6x: 5752.75, parcelaFinal: 21572.83, financiamento: 258873.92 },
  { unidade: "303", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 444212.55, ato: 53305.51, parcelas40x: 1665.80, reforcos6x: 5922.83, parcelaFinal: 22210.63, financiamento: 266527.53 },
  { unidade: "304", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 472263.35, ato: 56671.60, parcelas40x: 1770.99, reforcos6x: 6296.84, parcelaFinal: 23613.17, financiamento: 283358.01 },
  { unidade: "305", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 469306.14, ato: 56316.74, parcelas40x: 1759.90, reforcos6x: 6257.42, parcelaFinal: 23465.31, financiamento: 281583.68 },
  { unidade: "306", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 469306.14, ato: 56316.74, parcelas40x: 1759.90, reforcos6x: 6257.42, parcelaFinal: 23465.31, financiamento: 281583.68 },
  { unidade: "307", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 469306.14, ato: 56316.74, parcelas40x: 1759.90, reforcos6x: 6257.42, parcelaFinal: 23465.31, financiamento: 281583.68 },
  { unidade: "308", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 469306.14, ato: 56316.74, parcelas40x: 1759.90, reforcos6x: 6257.42, parcelaFinal: 23465.31, financiamento: 281583.68 },
  { unidade: "309", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 469306.14, ato: 56316.74, parcelas40x: 1759.90, reforcos6x: 6257.42, parcelaFinal: 23465.31, financiamento: 281583.68 },
  { unidade: "310", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 473168.07, ato: 56780.17, parcelas40x: 1774.38, reforcos6x: 6308.91, parcelaFinal: 23658.40, financiamento: 283900.84 },
  { unidade: "311", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 452718.03, ato: 54326.16, parcelas40x: 1697.69, reforcos6x: 6036.24, parcelaFinal: 22635.90, financiamento: 271630.82 },
  { unidade: "312", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 434566.29, ato: 52147.95, parcelas40x: 1629.62, reforcos6x: 5794.22, parcelaFinal: 21728.31, financiamento: 260739.77 },
  { unidade: "313", pavimento: "3° Pavimento", floor: 3, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 432092.64, ato: 51851.12, parcelas40x: 1620.35, reforcos6x: 5761.24, parcelaFinal: 21604.63, financiamento: 259255.59 },

  // 4° Pavimento
  { unidade: "401", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 445309.11, ato: 53437.09, parcelas40x: 1669.91, reforcos6x: 5937.45, parcelaFinal: 22265.46, financiamento: 267185.46 },
  { unidade: "402", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 445285.05, ato: 53434.21, parcelas40x: 1669.82, reforcos6x: 5937.13, parcelaFinal: 22264.25, financiamento: 267171.03 },
  { unidade: "403", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 458462.44, ato: 55015.49, parcelas40x: 1719.23, reforcos6x: 6112.83, parcelaFinal: 22923.12, financiamento: 275077.47 },
  { unidade: "404", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 487422.82, ato: 58490.74, parcelas40x: 1827.84, reforcos6x: 6498.97, parcelaFinal: 24371.14, financiamento: 292453.69 },
  { unidade: "405", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 484445.04, ato: 58133.41, parcelas40x: 1816.67, reforcos6x: 6459.27, parcelaFinal: 24222.25, financiamento: 290667.03 },
  { unidade: "406", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "407", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "408", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "409", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 484445.04, ato: 58133.41, parcelas40x: 1816.67, reforcos6x: 6459.27, parcelaFinal: 24222.25, financiamento: 290667.03 },
  { unidade: "410", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 488327.53, ato: 58599.30, parcelas40x: 1831.23, reforcos6x: 6511.03, parcelaFinal: 24416.38, financiamento: 292996.52 },
  { unidade: "411", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 466967.92, ato: 56036.15, parcelas40x: 1751.13, reforcos6x: 6226.24, parcelaFinal: 23348.40, financiamento: 280180.75 },
  { unidade: "412", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 448394.80, ato: 53807.38, parcelas40x: 1681.48, reforcos6x: 5978.60, parcelaFinal: 22419.74, financiamento: 269036.88 },
  { unidade: "413", pavimento: "4° Pavimento", floor: 4, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 445921.16, ato: 53510.54, parcelas40x: 1672.20, reforcos6x: 5945.62, parcelaFinal: 22296.06, financiamento: 267552.69 },

  // 5° Pavimento
  { unidade: "501", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "502", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 459113.56, ato: 55093.63, parcelas40x: 1721.68, reforcos6x: 6121.51, parcelaFinal: 22955.68, financiamento: 275468.14 },
  { unidade: "503", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "504", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "505", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 499583.95, ato: 59950.07, parcelas40x: 1873.44, reforcos6x: 6661.12, parcelaFinal: 24979.20, financiamento: 299750.37 },
  { unidade: "506", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "507", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "508", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "509", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "510", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "511", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 481217.82, ato: 57746.14, parcelas40x: 1804.57, reforcos6x: 6416.24, parcelaFinal: 24060.89, financiamento: 288730.69 },
  { unidade: "512", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 462223.32, ato: 55466.80, parcelas40x: 1733.34, reforcos6x: 6162.98, parcelaFinal: 23111.17, financiamento: 277333.99 },
  { unidade: "513", pavimento: "5° Pavimento", floor: 5, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Vendido" },

  // 6° Pavimento
  { unidade: "601", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 472966.13, ato: 56755.94, parcelas40x: 1773.62, reforcos6x: 6306.22, parcelaFinal: 23648.31, financiamento: 283779.68 },
  { unidade: "602", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 472942.07, ato: 56753.05, parcelas40x: 1773.53, reforcos6x: 6305.89, parcelaFinal: 23647.10, financiamento: 283765.24 },
  { unidade: "603", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 486962.23, ato: 58435.47, parcelas40x: 1826.11, reforcos6x: 6492.83, parcelaFinal: 24348.11, financiamento: 292177.34 },
  { unidade: "604", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 517741.74, ato: 62129.01, parcelas40x: 1941.53, reforcos6x: 6903.22, parcelaFinal: 25887.09, financiamento: 310645.04 },
  { unidade: "605", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 514722.86, ato: 61766.74, parcelas40x: 1930.21, reforcos6x: 6862.97, parcelaFinal: 25736.14, financiamento: 308833.72 },
  { unidade: "606", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "607", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 514722.86, ato: 61766.74, parcelas40x: 1930.21, reforcos6x: 6862.97, parcelaFinal: 25736.14, financiamento: 308833.72 },
  { unidade: "608", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "609", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 514722.86, ato: 61766.74, parcelas40x: 1930.21, reforcos6x: 6862.97, parcelaFinal: 25736.14, financiamento: 308833.72 },
  { unidade: "610", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "611", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "612", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 476051.83, ato: 57126.22, parcelas40x: 1785.19, reforcos6x: 6347.36, parcelaFinal: 23802.59, financiamento: 285631.10 },
  { unidade: "613", pavimento: "6° Pavimento", floor: 6, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 473578.18, ato: 56829.38, parcelas40x: 1775.92, reforcos6x: 6314.38, parcelaFinal: 23678.91, financiamento: 284146.91 },

  // 7° Pavimento
  { unidade: "701", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 486794.65, ato: 58415.36, parcelas40x: 1825.48, reforcos6x: 6490.60, parcelaFinal: 24339.73, financiamento: 292076.79 },
  { unidade: "702", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 486770.59, ato: 58412.47, parcelas40x: 1825.39, reforcos6x: 6490.27, parcelaFinal: 24338.53, financiamento: 292062.35 },
  { unidade: "703", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 501212.13, ato: 60145.46, parcelas40x: 1879.55, reforcos6x: 6682.83, parcelaFinal: 25060.61, financiamento: 300727.28 },
  { unidade: "704", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "705", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 529861.77, ato: 63583.41, parcelas40x: 1986.98, reforcos6x: 7064.82, parcelaFinal: 26493.09, financiamento: 317917.06 },
  { unidade: "706", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 529861.77, ato: 63583.41, parcelas40x: 1986.98, reforcos6x: 7064.82, parcelaFinal: 26493.09, financiamento: 317917.06 },
  { unidade: "707", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "708", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 529861.77, ato: 63583.41, parcelas40x: 1986.98, reforcos6x: 7064.82, parcelaFinal: 26493.09, financiamento: 317917.06 },
  { unidade: "709", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 529861.77, ato: 63583.41, parcelas40x: 1986.98, reforcos6x: 7064.82, parcelaFinal: 26493.09, financiamento: 317917.06 },
  { unidade: "710", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "711", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "712", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 489880.34, ato: 58785.64, parcelas40x: 1837.05, reforcos6x: 6531.74, parcelaFinal: 24494.02, financiamento: 293928.21 },
  { unidade: "713", pavimento: "7° Pavimento", floor: 7, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 487406.70, ato: 58488.80, parcelas40x: 1827.78, reforcos6x: 6498.76, parcelaFinal: 24370.33, financiamento: 292444.02 },

  // 8° Pavimento
  { unidade: "801", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 500623.16, ato: 60074.78, parcelas40x: 1877.34, reforcos6x: 6674.98, parcelaFinal: 25031.16, financiamento: 300373.90 },
  { unidade: "802", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 500599.10, ato: 60071.89, parcelas40x: 1877.25, reforcos6x: 6674.65, parcelaFinal: 25029.95, financiamento: 300359.46 },
  { unidade: "803", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "804", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 548060.67, ato: 65767.28, parcelas40x: 2055.23, reforcos6x: 7307.48, parcelaFinal: 27403.03, financiamento: 328836.40 },
  { unidade: "805", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 545000.68, ato: 65400.08, parcelas40x: 2043.75, reforcos6x: 7266.68, parcelaFinal: 27250.03, financiamento: 327000.41 },
  { unidade: "806", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "807", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "808", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "809", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.46, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 545000.68, ato: 65400.08, parcelas40x: 2043.75, reforcos6x: 7266.68, parcelaFinal: 27250.03, financiamento: 327000.41 },
  { unidade: "810", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 29.50, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "811", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 27.73, areaExterna: 0, garagem: "------", status: "Vendido" },
  { unidade: "812", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 503708.86, ato: 60445.06, parcelas40x: 1888.91, reforcos6x: 6716.12, parcelaFinal: 25185.44, financiamento: 302225.31 },
  { unidade: "813", pavimento: "8° Pavimento", floor: 8, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 26.91, areaExterna: 0, garagem: "------", status: "Disponível", valorTotal: 501235.21, ato: 60148.23, parcelas40x: 1879.63, reforcos6x: 6683.14, parcelaFinal: 25061.76, financiamento: 300741.13 },

  // Coberturas
  { unidade: "901", pavimento: "Cobertura", floor: 9, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 36.21, areaExterna: 31.18, garagem: "01 vaga", status: "Disponível", valorTotal: 759610.90, ato: 91153.31, parcelas40x: 2848.54, reforcos6x: 10128.15, parcelaFinal: 37980.55, financiamento: 455766.54 },
  { unidade: "902", pavimento: "Cobertura", floor: 9, tipologia: "2 Dormitórios", posicao: "Frente Rua Enoé Schutel", areaInterna: 58.72, areaExterna: 46.19, garagem: "01 vaga", status: "Disponível", valorTotal: 1158898.11, ato: 139067.77, parcelas40x: 4345.87, reforcos6x: 15451.97, parcelaFinal: 57944.91, financiamento: 695338.87 },
  { unidade: "903", pavimento: "Cobertura", floor: 9, tipologia: "Studio", posicao: "Frente Rua Enoé Schutel", areaInterna: 35.72, areaExterna: 27.55, garagem: "01 vaga", status: "Disponível", valorTotal: 741554.67, ato: 88986.56, parcelas40x: 2780.83, reforcos6x: 9887.40, parcelaFinal: 37077.73, financiamento: 444932.80 },
  { unidade: "904", pavimento: "Cobertura", floor: 9, tipologia: "2 Dormitórios", posicao: "Frente Rua Enoé Schutel", areaInterna: 58.72, areaExterna: 49.19, garagem: "01 vaga", status: "Disponível", valorTotal: 1175219.26, ato: 141026.31, parcelas40x: 4407.07, reforcos6x: 15669.59, parcelaFinal: 58760.96, financiamento: 705131.56 },
  { unidade: "905", pavimento: "Cobertura", floor: 9, tipologia: "Studio", posicao: "Fachada Norte", areaInterna: 34.72, areaExterna: 21.42, garagem: "01 vaga", status: "Disponível", valorTotal: 702474.34, ato: 84296.92, parcelas40x: 2634.28, reforcos6x: 9366.32, parcelaFinal: 35123.72, financiamento: 421484.61 },

  // Vagas Térreo e Subsolo
  { unidade: "R01", pavimento: "Térreo", floor: 0, tipologia: "Vaga simples", posicao: "Térreo", areaInterna: 12.00, areaExterna: 0, garagem: "Vaga simples", status: "Disponível", valorTotal: 61065.61, ato: 61065.61, parcelas40x: 0, reforcos6x: 0, parcelaFinal: 0, financiamento: 0 },
  { unidade: "R01/2", pavimento: "Térreo", floor: 0, tipologia: "Vaga simples", posicao: "Térreo", areaInterna: 12.00, areaExterna: 0, garagem: "Vaga simples", status: "Disponível", valorTotal: 61065.61, ato: 61065.61, parcelas40x: 0, reforcos6x: 0, parcelaFinal: 0, financiamento: 0 },
  { unidade: "R02", pavimento: "Térreo", floor: 0, tipologia: "Vaga simples", posicao: "Térreo", areaInterna: 12.00, areaExterna: 0, garagem: "Vaga simples", status: "Disponível", valorTotal: 61065.61, ato: 61065.61, parcelas40x: 0, reforcos6x: 0, parcelaFinal: 0, financiamento: 0 },
  { unidade: "R09", pavimento: "Subsolo", floor: -1, tipologia: "Vaga simples", posicao: "Subsolo", areaInterna: 12.00, areaExterna: 0, garagem: "Vaga simples", status: "Disponível", valorTotal: 61065.61, ato: 61065.61, parcelas40x: 0, reforcos6x: 0, parcelaFinal: 0, financiamento: 0 },
  { unidade: "R10", pavimento: "Subsolo", floor: -1, tipologia: "Vaga simples", posicao: "Subsolo", areaInterna: 12.00, areaExterna: 0, garagem: "Vaga simples", status: "Disponível", valorTotal: 61065.61, ato: 61065.61, parcelas40x: 0, reforcos6x: 0, parcelaFinal: 0, financiamento: 0 },
  { unidade: "R11", pavimento: "Subsolo", floor: -1, tipologia: "Vaga simples", posicao: "Subsolo", areaInterna: 12.00, areaExterna: 0, garagem: "Vaga simples", status: "Disponível", valorTotal: 61065.61, ato: 61065.61, parcelas40x: 0, reforcos6x: 0, parcelaFinal: 0, financiamento: 0 },
  { unidade: "R12", pavimento: "Subsolo", floor: -1, tipologia: "Vaga simples", posicao: "Subsolo", areaInterna: 12.00, areaExterna: 0, garagem: "Vaga simples", status: "Disponível", valorTotal: 61065.61, ato: 61065.61, parcelas40x: 0, reforcos6x: 0, parcelaFinal: 0, financiamento: 0 },
  { unidade: "R13", pavimento: "Subsolo", floor: -1, tipologia: "Vaga simples", posicao: "Subsolo", areaInterna: 12.00, areaExterna: 0, garagem: "Vaga simples", status: "Disponível", valorTotal: 61065.61, ato: 61065.61, parcelas40x: 0, reforcos6x: 0, parcelaFinal: 0, financiamento: 0 },
];

const CUB_REF = 3151.24;

export const initialGridPricingUnits: PricingUnit[] = rawGridUnits.map((item, idx) => {
  const isVendido = item.status === "Vendido";
  const totalPrivArea = item.areaInterna + (item.areaExterna || 0);

  // Estimativa base para vendidas quando não há valor na tabela
  let price = item.valorTotal || 0;
  if (isVendido && price === 0) {
    // Estimativa proporcional para fins de VGV histórico
    price = Math.round(totalPrivArea * 16500);
  }

  const cubPrice = price > 0 ? Number((price / CUB_REF).toFixed(2)) : 0;
  const pricePerM2 = totalPrivArea > 0 && price > 0 ? Math.round(price / totalPrivArea) : 0;
  const cubPerM2 = pricePerM2 > 0 ? Number((pricePerM2 / CUB_REF).toFixed(2)) : 0;

  let solar: any = "------";
  if (item.posicao.includes("Norte")) solar = "Norte";
  else if (item.posicao.includes("Enoé")) solar = "Oeste";
  else if (item.posicao.includes("Juvêncio")) solar = "Leste";

  return {
    id: `unit-grid-${item.unidade.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    tableId: "tab-grid-2026-v1",
    speId: "spe-grid",
    unitNumber: item.unidade,
    tower: "Torre Principal",
    floor: item.floor,
    floorName: item.pavimento,
    type: item.tipologia,
    position: item.posicao,
    privateAreaM2: Number(totalPrivArea.toFixed(2)),
    internalPrivateAreaM2: item.areaInterna,
    externalPrivateAreaM2: item.areaExterna || 0,
    totalAreaM2: Number((totalPrivArea * 1.35).toFixed(2)),
    garageType: item.garagem,
    garageNumber: item.garagem !== "------" ? item.garagem : undefined,
    solarOrientation: solar,
    viewDescription: `${item.posicao} - ${item.pavimento}`,
    basePrice: price,
    cubPrice,
    pricePerM2,
    cubPerM2,
    status: isVendido ? "Vendida" : "Disponível",
    discountMaxPercent: isVendido ? 0 : 5.0,
    commissionPercent: 5.0,
    downPaymentAto: item.ato,
    monthlyInstallment40x: item.parcelas40x,
    balloonInstallment6x: item.reforcos6x,
    finalInstallment: item.parcelaFinal,
    financingBalance: item.financiamento,
  };
});
