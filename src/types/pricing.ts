export type UnitStatus = "Disponível" | "Reservada" | "Vendida" | "Bloqueada" | "Permuta";

export type UnitType =
  | "Studio"
  | "Studio - Garden"
  | "1 Suíte + 1 Quarto"
  | "2 Quartos"
  | "2 Dormitórios"
  | "2 Suítes"
  | "3 Suítes"
  | "Cobertura Duplex"
  | "Cobertura Linear"
  | "Garden"
  | "Sala Comercial"
  | "Loja Térrea"
  | "Loja/Sobreloja"
  | "Vaga simples";

export type SolarOrientation = "Norte" | "Sul" | "Leste" | "Oeste" | "Nordeste" | "Noroeste" | "Sudeste" | "Sudoeste" | "------";

export type GarageType = "Simples Coberta" | "Dupla Coberta" | "Dupla Descoberta" | "Vaga + Hobby Box" | "Sem Vaga" | "01 vaga" | "------" | "Vaga simples";

export interface PricingUnit {
  id: string;
  tableId: string;
  speId: string;
  unitNumber: string; // Ex: "Loja 01", "201", "301", "901", "R01"
  tower: string;
  floor: number;
  floorName?: string; // Ex: "1° Pavimento", "2° Pavimento", "Cobertura", "Térreo", "Subsolo"
  type: UnitType;
  position?: string; // Ex: "Frente Rua Juvêncio Costa", "Fachada Norte", "Frente Rua Enoé Schutel"
  privateAreaM2: number; // Área privativa total (interna + externa)
  internalPrivateAreaM2?: number; // Área privativa interna (m²)
  externalPrivateAreaM2?: number; // Área privativa externa (m²)
  totalAreaM2: number;
  garageType: GarageType;
  garageNumber?: string;
  solarOrientation: SolarOrientation;
  viewDescription: string;
  basePrice: number; // Preço em R$ (Valor Total)
  cubPrice: number; // Preço expresso em CUBs
  pricePerM2: number; // R$ / m²
  cubPerM2: number; // CUBs / m²
  status: UnitStatus;
  discountMaxPercent: number; // Desconto máximo autorizado para gerência
  commissionPercent: number; // % comissão imobiliária padrão

  // Fluxo de Financiamento Padrão ARV GRID
  downPaymentAto?: number; // Ato (ex: 12% - agosto/26)
  monthlyInstallment40x?: number; // Parcelas (40X) Set/2026 - Dez/29 (ex: 15% / 40)
  balloonInstallment6x?: number; // Reforços semestrais (6X) (ex: 8% / 6)
  finalInstallment?: number; // Parcela final (ex: 5%)
  financingBalance?: number; // Financiamento (ex: 60%)

  reservedBy?: string;
  reservedUntil?: string;
  buyerName?: string;
  notes?: string;
}

export interface PaymentConditionTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  downPaymentPercent: number; // Sinal / Entrada (% do total)
  downPaymentInstallments: number; // Em quantas vezes o sinal pode ser dividido (ex: 1, 2, 3)
  monthlyInstallmentsCount: number; // Qtd de parcelas mensais (ex: 36, 40, 48, 60)
  monthlyInstallmentsPercent: number; // % do valor financiado em parcelas mensais
  balloonInstallmentsCount: number; // Qtd de reforços semestrais/anuais (ex: 4, 6)
  balloonInstallmentsPercent: number; // % total dos reforços
  keysPaymentPercent: number; // % na entrega das chaves / financiamento bancário
  finalPaymentPercent?: number; // Parcela final intermediária
  correctionIndex: "CUB/SC" | "INCC-M" | "IPCA + 0.5%" | "IGP-M" | "Fixo Sem Juros";
  discountForCashPayment: number; // % desconto para pagamento 100% à vista
}

export interface PriceTable {
  id: string;
  speId: string;
  speName: string;
  name: string;
  version: string;
  status: "Ativa" | "Rascunho" | "Histórica" | "Suspensa";
  validFrom: string;
  validUntil: string;
  cubReferenceValue: number; // Valor do CUB/SC de referência em R$ (ex: 3151.24)
  cubReferenceDate: string; // Ex: "Agosto/2026"
  standardCorrectionIndex: string;
  incorporationRegistration?: string; // Ex: "R-1-3.706"
  totalUnitsCount: number;
  availableUnitsCount: number;
  reservedUnitsCount: number;
  soldUnitsCount: number;
  totalVgv: number;
  availableVgv: number;
  soldVgv: number;
  averagePricePerM2: number;
  averageCubPerM2: number;
  defaultCommissionPercent: number;
  paymentTemplates: PaymentConditionTemplate[];
  description?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SimulatedInstallment {
  number: number;
  type: "Sinal" | "Entrada Parcelada" | "Mensal" | "Reforço Semestral" | "Reforço Anual" | "Chaves / Financiamento";
  dueDate: string;
  valueBrl: number;
  valueCubs: number;
  percentageOfTotal: number;
  correctionNote: string;
}

export interface CommercialProposal {
  id: string;
  tableId: string;
  speId: string;
  speName: string;
  unitId: string;
  unitNumber: string;
  unitType: string;
  privateAreaM2: number;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  brokerName: string;
  realtorAgency: string;
  cubBaseValue: number;
  totalValueBrl: number;
  totalValueCubs: number;
  discountAppliedPercent: number;
  finalValueBrl: number;
  finalValueCubs: number;
  conditionTemplateName: string;
  downPaymentValue: number;
  monthlyCount: number;
  monthlyValue: number;
  balloonCount: number;
  balloonValue: number;
  keysValue: number;
  installments: SimulatedInstallment[];
  validUntil: string;
  createdAt: string;
  status: "Rascunho" | "Enviada" | "Aprovada" | "Recusada" | "Expirada";
  notes?: string;
}

export interface CUBMonthlyRecord {
  monthYear: string; // "2026-08"
  displayMonth: string; // "Agosto/2026"
  state: "SC" | "CE" | "PR" | "SP";
  projectStandard: "R8-N (Residencial Padrão Normal)" | "R16-A (Residencial Padrão Alto)" | "CSL-8 (Comercial)";
  valueBrl: number;
  monthlyVariationPercent: number;
  accumulated12mPercent: number;
  accumulatedYearPercent: number;
}
