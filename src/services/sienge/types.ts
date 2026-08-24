export type SiengeEnvironment = "production" | "sandbox";

export interface SiengeConfig {
  subdomain: string; // e.g. "arv-incorporadora"
  tenantId?: string;
  clientId: string;
  clientSecret: string;
  environment: SiengeEnvironment;
  autoSyncEnabled: boolean;
  autoSyncIntervalMinutes: number; // e.g. 60
  lastSyncAt: string | null;
  webhookSecret?: string;
}

export interface SiengeOAuthToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  acquiredAt: number; // timestamp in ms
  expiresAt: number; // timestamp in ms
}

export interface SiengeCustomer {
  id: string; // Sienge customer code/UUID
  siengeCode: string;
  name: string;
  personType: "F" | "J"; // Física / Jurídica
  cpfCnpj: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  profession: string;
  income: number;
  status: "Ativo" | "Inativo" | "Bloqueado";
  updatedAt: string; // ISO date
}

export interface SiengeContract {
  id: string;
  contractNumber: string;
  siengeCustomerId: string;
  customerName: string;
  customerCpfCnpj: string;
  speCode: string;
  speName: string;
  enterpriseName: string;
  unitNumber: string;
  block: string;
  contractValue: number; // VGV total
  paidValue: number;
  balanceValue: number;
  purchaseDate: string;
  status: "Ativo" | "Concluído" | "Distratado" | "Em Negociação";
  realtorName?: string;
  updatedAt: string;
}

export interface SiengeInstallment {
  id: string;
  contractId: string;
  contractNumber: string;
  installmentNumber: string;
  dueDate: string; // YYYY-MM-DD
  originalAmount: number;
  fineAmount: number; // Multa/Juros
  discountAmount: number;
  paidAmount: number;
  openAmount: number;
  status: "Aberto" | "Pago" | "Atrasado" | "Cancelado";
  paymentDate?: string;
  type: "Sinal" | "Mensal" | "Semestral" | "Chaves" | "Balão";
  updatedAt: string;
}

export interface SiengeEnterprise {
  id: string;
  siengeBuildingSiteId: string;
  code: string;
  name: string;
  speName: string;
  address: string;
  city: string;
  state: string;
  totalUnits: number;
  soldUnits: number;
  reservedUnits: number;
  availableUnits: number;
  totalVgv: number;
  physicalProgress: number; // %
  engineerInCharge: string;
  status: "Em Obras" | "Lançamento" | "Concluído" | "Planejamento";
  updatedAt: string;
}

export interface SiengeBroker {
  id: string;
  siengeRealtorId: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  email: string;
  agencyName: string;
  totalSalesCount: number;
  totalSalesVgv: number;
  status: "Ativo" | "Inativo";
  updatedAt: string;
}

export interface SiengeSyncLog {
  id: string;
  timestamp: string;
  syncType: "full" | "incremental";
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS" | "WARNING";
  recordsProcessed: {
    customers: number;
    contracts: number;
    financial: number;
    enterprises: number;
    brokers: number;
  };
  durationMs: number;
  retryAttempts: number;
  errorMessage?: string;
  details?: string;
}

export interface SiengeSyncProgress {
  status: "idle" | "syncing" | "success" | "error";
  currentStep: string;
  progressPercentage: number;
  lastSyncAt: string | null;
  error: string | null;
  syncedCounts: {
    customers: number;
    contracts: number;
    financial: number;
    enterprises: number;
    brokers: number;
  };
}

export interface SiengeAIServiceSummary {
  enterpriseCount: number;
  activeContractsCount: number;
  totalVgvSynced: number;
  totalReceivedSynced: number;
  totalReceivableSynced: number;
  delinquencyRate: number; // % inadimplência
  activeCustomersCount: number;
  activeBrokersCount: number;
  lastIncrementalSyncAt: string | null;
  highlights: string[];
  enterprisesOverview: Array<{
    name: string;
    totalVgv: number;
    unitsSold: number;
    totalUnits: number;
    progressPercentage: number;
  }>;
  recentSyncAuditLogs: SiengeSyncLog[];
}
