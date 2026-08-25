export type UserRole =
  | "ADMIN"
  | "RI_MANAGER"
  | "COMERCIAL"
  | "FINANCEIRO"
  | "ENGENHARIA"
  | "MARKETING"
  | "INVESTOR";

export type InvestorTier = "Essencial" | "Select" | "Prime" | "Private" | "Institucional";

export type ConstructionStage =
  | "Fundação"
  | "Estrutura"
  | "Alvenaria"
  | "Cobertura"
  | "Acabamentos"
  | "Entrega";

export interface ScoreBreakdown {
  volume: number; // 0-20
  numInvestments: number; // 0-15
  assemblyAttendance: number; // 0-15
  portalAccess: number; // 0-10
  clientTenure: number; // 0-10
  satisfaction: number; // 0-10
  reinvestments: number; // 0-10
  referrals: number; // 0-10
  totalScore: number; // 0-100
  tier: InvestorTier;
}

export interface Investor {
  id: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  profession: string;
  createdAt: string;
  consultant: string;
  notes: string;
  score: number;
  tier: InvestorTier;
  scoreBreakdown: ScoreBreakdown;
  satisfactionScore: number; // 1-10
  npsCategory: "Promotor" | "Neutro" | "Detrator";
  active: boolean;
  avatarUrl?: string;
}

export interface SPE {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  city: string;
  manager: string;
  status: "Em Captação" | "Em Obras" | "Concluído" | "Planejamento";
  deadline: string;
  totalVgv: number;
  totalCaptação: number;
  percentSold: number;
  progressPercentage: number;
  description: string;
  bannerImage: string;
  mapCoordinates?: string;
}

export interface Development {
  id: string;
  speId: string;
  name: string;
  type: "Residencial Premium" | "Comercial Corporate" | "Misto Multi-Family";
  totalUnits: number;
  unitsAvailable: number;
  address: string;
  coverImage: string;
  description: string;
}

export interface Unit {
  id: string;
  developmentId: string;
  speId: string;
  unitNumber: string;
  block: string;
  type: string;
  areaM2: number;
  price: number;
  status: "Disponível" | "Reservada" | "Vendida";
}

export interface Contract {
  id: string;
  investorId: string;
  speId: string;
  developmentId: string;
  unitId: string;
  contractNumber: string;
  purchaseDate: string;
  investedAmount: number;
  speSharePercentage: number;
  expectedRoiPercentage: number;
  status: "Ativo" | "Concluído" | "Em Negociação" | "Distratado";
  documentUrl: string;
}

export interface StageProgress {
  stage: ConstructionStage;
  percentage: number;
  targetDate: string;
  status: "Concluído" | "Em Andamento" | "A Iniciar";
}

export interface WeeklyWorkItem {
  category: "ELÉTRICA" | "ALVENARIA" | "REBOCO" | "CONTRAMARCOS" | string;
  service: string;
  currentPercentage: number;
  dailyChecklist: {
    segunda?: number;
    terca?: number;
    quarta?: number;
    quinta?: number;
    sexta?: number;
    sabado?: number;
  };
  forecastPercentage: number;
  observations?: string;
}

export interface LaborTeamItem {
  functionName: string;
  quantity: number;
  company: string;
  observation?: string;
}

export interface WeeklyConstructionReport {
  id: string;
  speId: string;
  obraName: string;
  location: string;
  engineer: string;
  referenceWeek: string;
  plannedServices: WeeklyWorkItem[];
  laborTeam: LaborTeamItem[];
  totalWorkers: number;
}

export interface ConstructionProgress {
  id: string;
  speId: string;
  overallPercentage: number;
  stages: StageProgress[];
  lastUpdateDate: string;
  description: string;
  photos: string[];
  videos: string[];
  droneUrl?: string;
  reportUrl?: string;
  weeklyReport?: WeeklyConstructionReport;
}

export interface Payment {
  id: string;
  investorId: string;
  contractId: string;
  speId: string;
  type: "Aporte Inicial" | "Parcela Obra" | "Dividendo Trimestral" | "Rendimento Bruto";
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "Pago" | "Pendente" | "Atrasado";
  receiptUrl?: string;
}

export interface TimelineInteraction {
  id: string;
  investorId: string;
  type: "Email" | "WhatsApp" | "Telefone" | "Reunião" | "Visita" | "Ocorrência" | "Solicitação";
  date: string;
  author: string;
  title: string;
  notes: string;
  status?: "Concluído" | "Pendente" | "Em Acompanhamento";
}

export interface DocumentItem {
  id: string;
  title: string;
  category:
    | "Contrato"
    | "Aditivo"
    | "Prestação de Contas"
    | "Ata"
    | "Licença"
    | "Relatório"
    | "Boletim"
    | "Projeto"
    | "Matrícula";
  speId?: string;
  investorId?: string;
  uploadDate: string;
  fileSize: string;
  fileUrl: string;
}

export interface SupplierContract {
  id: string;
  speId: string;
  supplierName: string;
  serviceCategory: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: "Ativo" | "Em Homologação" | "Encerrado";
  contractUrl: string;
}

export interface Assembly {
  id: string;
  speId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  virtualLink?: string;
  status: "Agendada" | "Em Andamento" | "Realizada";
  description: string;
  rsvpStatus: Record<string, "Confirmado" | "Recusado" | "Pendente">;
  minutesDocumentUrl?: string;
}

export interface CommunicationCampaign {
  id: string;
  title: string;
  type: "Newsletter" | "Comunicado" | "Aviso" | "Campanha" | "Convite";
  speId?: string;
  targetSegment: string;
  subject: string;
  bodyHtml: string;
  sentAt?: string;
  status: "Rascunho" | "Agendado" | "Enviado";
  stats?: {
    sent: number;
    opened: number;
    clicked: number;
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success";
}

export interface AIRecommendation {
  id: string;
  investorId: string;
  investorName: string;
  category: "Reinvestimento" | "Risco de Churn" | "Upgrade VIP" | "Contato Pendente";
  confidenceScore: number; // 0-100
  title: string;
  reasoning: string;
  suggestedAction: string;
}

export type LeadFunnelStage =
  | "Novo Lead"
  | "Primeiro Contato"
  | "Atendimento"
  | "Visita Agendada"
  | "Proposta"
  | "Reserva"
  | "Contrato"
  | "Pagamento"
  | "Venda Concluída"
  | "Onboarding"
  | "Portal Liberado";

export interface MarketingLead {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  originCampaign: string;
  adSet: string;
  adName: string;
  landingPage: string;
  utmSource: string;
  utmCampaign: string;
  utmMedium: string;
  conversionDate: string;
  assignedBroker: string;
  speOfInterest: string;
  stage: LeadFunnelStage;
  dealValue: number;
  notes?: string;
  // Cadastro estendido para Onboarding / Central de Documentos / Corretor
  cpfCnpj?: string;
  rg?: string;
  birthDate?: string;
  civilStatus?: string;
  nationality?: string;
  profession?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  bankInfo?: {
    bank: string;
    agency: string;
    account: string;
    pix: string;
    income: number;
  };
  uploadedDocs?: {
    rg?: string;
    cpf?: string;
    residence?: string;
    marriageCert?: string;
    birthCert?: string;
    powerOfAttorney?: string;
  };
  validationStatus?: {
    mandatoryFieldsValid: boolean;
    cpfValid: boolean;
    emailValid: boolean;
    docsComplete: boolean;
    duplicatesCheck: boolean;
  };
  electronicSignatureStatus?: "Pendente" | "Enviado" | "Assinado" | "Recusado";
  electronicSignatureProvider?: "Clicksign" | "DocuSign" | "ZapSign";
  electronicSignatureUrl?: string;
  // Campos de Integração RD Station API / Webhook
  rdStationId?: string;
  rdConversionIdentifier?: string;
  rdLeadUrl?: string;
  rdSyncStatus?: "Sincronizado via Webhook" | "Sincronizado via API" | "Manual";
  rdSyncTimestamp?: string;
}

export interface CustomerOnboardingProgress {
  id: string;
  investorId: string;
  investorName: string;
  contractId: string;
  speId: string;
  speName: string;
  unitNumber: string;
  currentStep: number; // 1 to 6
  startDate: string;
  welcomeSent: boolean;
  specsDelivered: boolean;
  portalAccessCreated: boolean;
  docsAvailable: boolean;
  teamIntroduced: boolean;
  checklist: {
    contractSigned: boolean;
    docsUploaded: boolean;
    registrationApproved: boolean;
    portalReleased: boolean;
    firstAccessDone: boolean;
    paymentConfigured: boolean;
  };
}

export type NewsletterFrequency = "Semanal" | "Quinzenal" | "Mensal" | "Sob demanda";
export type NewsletterChannel = "EMAIL" | "WHATSAPP" | "PORTAL" | "PUSH";
export type NewsletterScheduleStatus = "no_prazo" | "atencao" | "atrasado";

export interface GalleryMediaItem {
  id: string;
  title: string;
  type: "foto" | "video" | "drone" | "comparativo";
  url: string;
  date: string;
  description?: string;
}

export interface CommercialNewsItem {
  id: string;
  title: string;
  description: string;
  image: string;
  badge?: string;
  ctaText: string;
  ctaUrl: string;
}

export interface InstitutionalAnnouncement {
  id: string;
  type: "Assembleia" | "Prestação de Contas" | "Cronograma" | "Jurídico" | "Financeiro" | "Parceiros";
  title: string;
  content: string;
  date: string;
}

export interface UpcomingEventItem {
  id: string;
  type: "Assembleia" | "Reunião" | "Live" | "Visita à Obra" | "Entrega Documentos" | "Evento Investidores";
  title: string;
  date: string;
  time: string;
  location: string;
  linkUrl?: string;
}

export interface TimelineStepItem {
  id: string;
  stage: string;
  status: "completed" | "in_progress" | "planned" | "future";
  estimatedDate: string;
  notes?: string;
}

export interface NewsletterFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface SmartNewsletter {
  id: string;
  editionName: string;
  editionDate: string;
  frequency: NewsletterFrequency;
  speId: string;
  speName: string;
  developmentName: string;
  coverImage: string;
  status: "Rascunho" | "Em Revisao" | "Aprovado" | "Publicado" | "Enviado";
  channels: NewsletterChannel[];
  aiSummary: string; // Institutional summary generated by AI / Gemini

  // Card 1: Resumo Executivo SPE
  card1Resumo: {
    speName: string;
    developmentName: string;
    city: string;
    neighborhood: string;
    engineerLead: string;
    startDate: string;
    estimatedCompletion: string;
    executedPercentage: number;
    investorsCount: number;
    totalRaised: number;
    scheduleStatus: NewsletterScheduleStatus;
  };

  // Card 2: Evolucao da Obra
  card2Evolucao: {
    executedPercentage: number;
    plannedPercentage: number;
    completedStages: string[];
    inProgressStages: string[];
    nextStages: string[];
    monthlyHighlightText: string;
    previousMonthPhoto: string;
    currentMonthPhoto: string;
    videoUrl?: string;
  };

  // Card 3: Galeria de Fotos
  card3Galeria: GalleryMediaItem[];

  // Card 4: Indicadores da Obra
  card4Indicadores: {
    physicalProgress: number;
    scheduleAdherencePct: number;
    safetyDaysNoAccidents: number;
    licensesStatus: string;
    documentationStatus: string;
    investmentRealized: number;
    nextMilestone: string;
  };

  // Card 5: Novidades Comerciais
  card5NovidadesComerciais: CommercialNewsItem[];

  // Card 6: Comunicados ARV
  card6Comunicados: InstitutionalAnnouncement[];

  // Card 7: Proximos Eventos
  card7Eventos: UpcomingEventItem[];

  // Card 8: Proximas Etapas da Obra (Timeline)
  card8Timeline: TimelineStepItem[];

  // Card 9: FAQs
  card9Faqs: NewsletterFaqItem[];

  // Card 10: Portal do Investidor Integration
  card10Portal: {
    newDocsCount: number;
    newPhotosCount: number;
    unreadMessagesCount: number;
    upcomingPaymentsCount: number;
    notificationsCount: number;
    ctaUrl: string;
  };

  // Card 11: Contato do Gerente
  card11Gerente: {
    name: string;
    role: string;
    avatarUrl: string;
    phone: string;
    whatsapp: string;
    email: string;
  };

  // Painel de Resultados Analytics
  stats: {
    sentCount: number;
    deliveryRate: number; // e.g. 98.5%
    openRate: number; // e.g. 84.2%
    clicksPerSection: Record<string, number>;
    docDownloads: number;
    photoViews: number;
    portalVisitsGenerated: number;
    mostAccessedSPE: string;
    engagementByInvestor: Array<{
      investorId: string;
      investorName: string;
      opensCount: number;
      clicksCount: number;
      lastAccessDate: string;
    }>;
  };
}

// =========================================================================
// MÓDULO: COMPARATIVO DE PREÇOS & SIMULAÇÃO DE RENTABILIDADE (CDI/IPCA)
// =========================================================================

export type MarketIndicator = "CDI" | "IPCA" | "SELIC" | "Poupança";

export interface MarketBenchmarkEntry {
  id: string;
  referenceMonth: string; // Formato: "AAAA-MM", ex: "2026-07"
  indicator: MarketIndicator;
  monthlyRatePercentage: number; // Ex: 0.95 para 0.95% no mês
  accumulated12MonthsPercentage: number; // Ex: 10.85% nos últimos 12 meses
  source: string; // Ex: "BACEN", "IBGE", "ANBIMA"
}

export type BuildingStandard = "Econômico" | "Médio" | "Alto Padrão";

export interface UnitPriceComparison {
  id: string;
  unitId: string;
  speId: string;
  speName?: string;
  unitNumber?: string;
  type?: string;
  areaM2: number;
  price: number;
  pricePerM2: number;
  region: string; // Ex: "Trindade - Florianópolis / SC"
  buildingStandard: BuildingStandard;
  benchmarkAveragePricePerM2Region?: number; // Preço médio de mercado na região para referência externa
  positioningPercentage: number; // % quanto acima (+) ou abaixo (-) da média regional
  referenceDate: string; // Ex: "2026-08"
}

export type AppreciationScenario = "Conservador" | "Moderado" | "Otimista";

export interface ProfitabilityCosts {
  corretagemPercentage: number; // Ex: 4.0%
  itbiPercentage: number; // Ex: 2.0%
  registroAmount: number; // Ex: R$ 3500
  impostoRendaPercentage: number; // Ex: 15.0% sobre ganho de capital líquido
}

export interface ProfitabilitySimulation {
  id: string;
  contractId?: string; // Se vinculada a um contrato real de investidor
  unitId?: string;
  speId?: string;
  investorName?: string;
  title?: string;
  simulatedInvestedAmount?: number;
  entryDate: string; // "AAAA-MM-DD"
  exitDate: string; // "AAAA-MM-DD"
  horizonMonths: number;
  purchasePrice: number;
  projectedSalePrice: number;
  appreciationScenario: AppreciationScenario;
  appreciationPercentageTotal: number;
  netProfitAmount: number;
  netProfitPercentage: number;
  annualizedReturnPercentage: number; // Retorno anualizado do período
  customAnnualAppreciationRate?: number;
  customCdiAnnualRate?: number; // % ao ano customizado do CDI na simulação
  customIpcaAnnualRate?: number; // % ao ano customizado do IPCA na simulação
  costsConsidered: ProfitabilityCosts;
  createdAt: string;
}

export interface SimulationMonthlyPoint {
  monthIndex: number;
  monthLabel: string; // Ex: "Mês 1", "Jan/25"
  realEstateValue: number;
  cdiValue: number;
  ipcaValue: number;
}

export interface BenchmarkComparisonResult {
  simulationId: string;
  realEstateReturnPercentage: number;
  realEstateAnnualizedPercentage: number;
  cdiReturnPercentageSamePeriod: number;
  cdiAnnualizedPercentage?: number;
  ipcaReturnPercentageSamePeriod: number;
  ipcaAnnualizedPercentage?: number;
  realEstateVsCdiPercentagePoints: number; // Retorno Imóvel - Retorno CDI
  realEstateVsIpcaPercentagePoints: number; // Retorno Imóvel - Retorno IPCA
  realGainAboveInflationPercentage: number; // Retorno Real descontado IPCA
  winnerIndicator: "Imóvel" | "CDI" | "IPCA";
  monthlyEvolution: SimulationMonthlyPoint[];
  usedCustomIndicators?: boolean;
}

