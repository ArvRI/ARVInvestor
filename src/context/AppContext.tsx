import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserRole,
  Investor,
  SPE,
  Development,
  Contract,
  ConstructionProgress,
  Payment,
  TimelineInteraction,
  DocumentItem,
  SupplierContract,
  Assembly,
  CommunicationCampaign,
  NotificationItem,
  AIRecommendation,
  ConstructionStage,
  MarketingLead,
  CustomerOnboardingProgress,
  LeadFunnelStage,
  SmartNewsletter,
  MarketBenchmarkEntry,
  UnitPriceComparison,
  ProfitabilitySimulation,
  BenchmarkComparisonResult,
  ReturnRecord,
  ResaleListing,
  ResalePricing,
  ResalePaymentCondition,
  ResaleLead,
} from "../types";
import {
  initialInvestors,
  initialSPEs,
  initialDevelopments,
  initialContracts,
  initialConstructionProgresses,
  initialPayments,
  initialTimelineInteractions,
  initialDocuments,
  initialSuppliers,
  initialAssemblies,
  initialCampaigns,
  initialNotifications,
  initialAIRecommendations,
  initialLeads,
  initialOnboardings,
  initialNewsletters,
  initialMarketBenchmarkHistory,
  initialUnitPriceComparisons,
  initialProfitabilitySimulations,
  calculateScoreBreakdown,
  runProfitabilitySimulation,
  initialReturnRecords,
  initialResaleListings,
  initialResalePricing,
  initialResalePaymentConditions,
  initialResaleLeads,
  calculateResaleDiscount,
  validateResalePriceFloor,
  moveUnitToResaleFlow,
} from "../data/initialData";
import { ProfitabilitySimulationInput } from "../utils/profitabilityCalculations";

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentInvestorId: string;
  setCurrentInvestorId: (id: string) => void;
  currentInvestor: Investor;
  investors: Investor[];
  spes: SPE[];
  developments: Development[];
  contracts: Contract[];
  constructionProgresses: ConstructionProgress[];
  payments: Payment[];
  timelineInteractions: TimelineInteraction[];
  documents: DocumentItem[];
  suppliers: SupplierContract[];
  assemblies: Assembly[];
  campaigns: CommunicationCampaign[];
  notifications: NotificationItem[];
  aiRecommendations: AIRecommendation[];
  leads: MarketingLead[];
  onboardings: CustomerOnboardingProgress[];
  newsletters: SmartNewsletter[];
  marketBenchmarkHistory: MarketBenchmarkEntry[];
  unitPriceComparisons: UnitPriceComparison[];
  profitabilitySimulations: ProfitabilitySimulation[];
  returnRecords: ReturnRecord[];
  resaleListings: ResaleListing[];
  resalePricing: ResalePricing[];
  resalePaymentConditions: ResalePaymentCondition[];
  resaleLeads: ResaleLead[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Actions
  addInvestor: (data: Partial<Investor>) => void;
  updateInvestor: (id: string, updates: Partial<Investor>) => void;
  recalculateScore: (id: string) => void;
  addSPE: (spe: Partial<SPE>) => void;
  updateSPE: (id: string, updates: Partial<SPE>) => void;
  addInteraction: (data: Omit<TimelineInteraction, "id">) => void;
  addContract: (data: Omit<Contract, "id">) => void;
  addAssembly: (data: Omit<Assembly, "id" | "rsvpStatus">) => void;
  updateAssemblyRsvp: (assemblyId: string, investorId: string, status: "Confirmado" | "Recusado" | "Pendente") => void;
  addCampaign: (campaign: Omit<CommunicationCampaign, "id">) => void;
  sendCampaign: (id: string) => void;
  updateStageProgress: (speId: string, stage: ConstructionStage, percentage: number) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (data: Omit<NotificationItem, "id">) => void;

  // Newsletter Actions
  addNewsletter: (newsletter: Omit<SmartNewsletter, "id">) => string;
  updateNewsletter: (id: string, updates: Partial<SmartNewsletter>) => void;
  sendNewsletter: (id: string) => void;
  deleteNewsletter: (id: string) => void;

  // Marketing & Onboarding Actions
  addLead: (lead: Partial<MarketingLead>) => void;
  updateLead: (id: string, updates: Partial<MarketingLead>) => void;
  moveLeadStage: (leadId: string, targetStage: LeadFunnelStage) => void;
  updateOnboardingStep: (onboardingId: string, step: number) => void;
  updateOnboardingChecklist: (onboardingId: string, itemKey: string, value: boolean) => void;
  triggerOnboardingForLead: (leadId: string) => void;

  // Profitability & Price Comparison Actions
  addMarketBenchmarkEntry: (data: Omit<MarketBenchmarkEntry, "id">) => void;
  updateMarketBenchmarkEntry: (id: string, updates: Partial<MarketBenchmarkEntry>) => void;
  deleteMarketBenchmarkEntry: (id: string) => void;
  addUnitPriceComparison: (data: Omit<UnitPriceComparison, "id">) => void;
  updateUnitPriceComparison: (id: string, updates: Partial<UnitPriceComparison>) => void;
  deleteUnitPriceComparison: (id: string) => void;
  createProfitabilitySimulation: (input: ProfitabilitySimulationInput) => {
    simulation: ProfitabilitySimulation;
    comparison: BenchmarkComparisonResult;
  };
  deleteProfitabilitySimulation: (id: string) => void;
  getComparisonForContract: (contractId: string) => {
    simulation: ProfitabilitySimulation;
    comparison: BenchmarkComparisonResult;
  } | null;

  // Resale & Return Actions
  addReturnRecord: (data: Omit<ReturnRecord, "id">) => string;
  registerUnitReturn: (data: {
    unitId: string;
    speId: string;
    originalContractId: string;
    originalInvestorId: string;
    returnType: ReturnRecord["returnType"];
    returnDate: string;
    originalContractAmount: number;
    amountRefundedToInvestor: number;
    retentionPercentage: number;
    penaltyClauseAmount?: number;
    legalStatus: ReturnRecord["legalStatus"];
    notes: string;
    documentUrl?: string;
    originalTablePrice?: number;
    autoStartResale?: boolean;
    defaultDiscountPercent?: number;
  }) => { returnRecordId: string; resaleListingId?: string };
  updateReturnRecord: (id: string, updates: Partial<ReturnRecord>) => void;
  startResaleFlow: (
    unitId: string,
    speId: string,
    originalContractId: string,
    originalInvestorId: string,
    originalContractAmount: number,
    originalTablePrice: number,
    defaultDiscountPercent?: number,
    unitDetails?: { unitNumber?: string; speName?: string; areaM2?: number; type?: string }
  ) => { returnRecordId: string; resaleListingId: string };
  addResaleListing: (data: Omit<ResaleListing, "id" | "viewsCount" | "leadsGeneratedCount">) => string;
  createResaleListing: (
    unitId: string,
    data: Partial<Omit<ResaleListing, "id" | "unitId" | "viewsCount" | "leadsGeneratedCount">>
  ) => string;
  updateResaleListing: (id: string, updates: Partial<ResaleListing>) => void;
  publishResaleListing: (id: string, overrideFloorCheck?: boolean) => { success: boolean; error?: string };
  pauseResaleListing: (id: string) => void;
  reserveResaleListing: (id: string, leadInfo?: Partial<ResaleLead>) => void;
  markResaleAsSold: (
    listingId: string,
    saleData: {
      investorId?: string;
      buyerName: string;
      buyerEmail?: string;
      buyerPhone?: string;
      contractAmount: number;
      purchaseDate?: string;
      speSharePercentage?: number;
    }
  ) => string;
  setResalePricing: (
    resaleListingId: string,
    data: {
      originalTablePrice: number;
      resalePrice: number;
      pricingReason: ResalePricing["pricingReason"];
      minimumAcceptablePrice: number;
      approvedBy?: string;
    }
  ) => { success: boolean; error?: string };
  updateResalePricing: (resaleListingId: string, updates: Partial<ResalePricing>) => void;
  addResalePaymentCondition: (data: Omit<ResalePaymentCondition, "id">) => string;
  updateResalePaymentCondition: (id: string, updates: Partial<ResalePaymentCondition>) => void;
  deleteResalePaymentCondition: (id: string) => void;
  addResaleLead: (data: Omit<ResaleLead, "id" | "createdAt">) => string;
  registerResaleLead: (
    resaleListingId: string,
    leadData: Omit<ResaleLead, "id" | "resaleListingId" | "createdAt">
  ) => string;
  updateResaleLead: (id: string, updates: Partial<ResaleLead>) => void;
  incrementListingView: (listingId: string) => void;
  generateListingDescriptionWithAI: (params: {
    unitNumber?: string;
    speName?: string;
    developmentName?: string;
    areaM2?: number;
    type?: string;
    floor?: string;
    solarPosition?: string;
    resalePrice?: number;
    originalTablePrice?: number;
    discountPercentage?: number;
    paymentConditions?: string[];
    highlightTags?: string[];
    isDistrato?: boolean;
    customInstructions?: string;
  }) => Promise<{ headline: string; description: string; suggestedTags: string[] }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>("ADMIN");
  const [currentInvestorId, setCurrentInvestorId] = useState<string>("inv-01");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("arv_theme");
    if (saved !== null) {
      return saved === "dark";
    }
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Entities state with persistence in localStorage if available
  const [investors, setInvestors] = useState<Investor[]>(() => {
    const saved = localStorage.getItem("arv_investors");
    return saved ? JSON.parse(saved) : initialInvestors;
  });

  const [spes, setSpes] = useState<SPE[]>(() => {
    const saved = localStorage.getItem("arv_spes");
    return saved ? JSON.parse(saved) : initialSPEs;
  });

  const [developments] = useState<Development[]>(initialDevelopments);
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem("arv_contracts");
    return saved ? JSON.parse(saved) : initialContracts;
  });

  const [constructionProgresses, setConstructionProgresses] = useState<ConstructionProgress[]>(
    initialConstructionProgresses
  );

  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  const [timelineInteractions, setTimelineInteractions] = useState<TimelineInteraction[]>(() => {
    const saved = localStorage.getItem("arv_interactions");
    return saved ? JSON.parse(saved) : initialTimelineInteractions;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [suppliers] = useState<SupplierContract[]>(initialSuppliers);
  const [assemblies, setAssemblies] = useState<Assembly[]>(initialAssemblies);
  const [campaigns, setCampaigns] = useState<CommunicationCampaign[]>(initialCampaigns);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [aiRecommendations] = useState<AIRecommendation[]>(initialAIRecommendations);

  const [leads, setLeads] = useState<MarketingLead[]>(() => {
    const saved = localStorage.getItem("arv_leads");
    return saved ? JSON.parse(saved) : initialLeads;
  });

  const [onboardings, setOnboardings] = useState<CustomerOnboardingProgress[]>(() => {
    const saved = localStorage.getItem("arv_onboardings");
    return saved ? JSON.parse(saved) : initialOnboardings;
  });

  const [newsletters, setNewsletters] = useState<SmartNewsletter[]>(() => {
    const saved = localStorage.getItem("arv_newsletters");
    return saved ? JSON.parse(saved) : initialNewsletters;
  });

  const [marketBenchmarkHistory, setMarketBenchmarkHistory] = useState<MarketBenchmarkEntry[]>(() => {
    const saved = localStorage.getItem("arv_market_benchmarks");
    return saved ? JSON.parse(saved) : initialMarketBenchmarkHistory;
  });

  const [unitPriceComparisons, setUnitPriceComparisons] = useState<UnitPriceComparison[]>(() => {
    const saved = localStorage.getItem("arv_unit_price_comparisons");
    return saved ? JSON.parse(saved) : initialUnitPriceComparisons;
  });

  const [profitabilitySimulations, setProfitabilitySimulations] = useState<ProfitabilitySimulation[]>(() => {
    const saved = localStorage.getItem("arv_profitability_sims");
    return saved ? JSON.parse(saved) : initialProfitabilitySimulations;
  });

  const [returnRecords, setReturnRecords] = useState<ReturnRecord[]>(() => {
    const saved = localStorage.getItem("arv_return_records");
    return saved ? JSON.parse(saved) : initialReturnRecords;
  });

  const [resaleListings, setResaleListings] = useState<ResaleListing[]>(() => {
    const saved = localStorage.getItem("arv_resale_listings");
    return saved ? JSON.parse(saved) : initialResaleListings;
  });

  const [resalePricing, setResalePricingList] = useState<ResalePricing[]>(() => {
    const saved = localStorage.getItem("arv_resale_pricing");
    return saved ? JSON.parse(saved) : initialResalePricing;
  });

  const [resalePaymentConditions, setResalePaymentConditions] = useState<ResalePaymentCondition[]>(() => {
    const saved = localStorage.getItem("arv_resale_conditions");
    return saved ? JSON.parse(saved) : initialResalePaymentConditions;
  });

  const [resaleLeads, setResaleLeads] = useState<ResaleLead[]>(() => {
    const saved = localStorage.getItem("arv_resale_leads");
    return saved ? JSON.parse(saved) : initialResaleLeads;
  });

  // Persist key state
  useEffect(() => {
    localStorage.setItem("arv_investors", JSON.stringify(investors));
  }, [investors]);

  useEffect(() => {
    localStorage.setItem("arv_spes", JSON.stringify(spes));
  }, [spes]);

  useEffect(() => {
    localStorage.setItem("arv_contracts", JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem("arv_interactions", JSON.stringify(timelineInteractions));
  }, [timelineInteractions]);

  useEffect(() => {
    localStorage.setItem("arv_leads", JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem("arv_onboardings", JSON.stringify(onboardings));
  }, [onboardings]);

  useEffect(() => {
    localStorage.setItem("arv_newsletters", JSON.stringify(newsletters));
  }, [newsletters]);

  useEffect(() => {
    localStorage.setItem("arv_market_benchmarks", JSON.stringify(marketBenchmarkHistory));
  }, [marketBenchmarkHistory]);

  useEffect(() => {
    localStorage.setItem("arv_unit_price_comparisons", JSON.stringify(unitPriceComparisons));
  }, [unitPriceComparisons]);

  useEffect(() => {
    localStorage.setItem("arv_profitability_sims", JSON.stringify(profitabilitySimulations));
  }, [profitabilitySimulations]);

  useEffect(() => {
    localStorage.setItem("arv_return_records", JSON.stringify(returnRecords));
  }, [returnRecords]);

  useEffect(() => {
    localStorage.setItem("arv_resale_listings", JSON.stringify(resaleListings));
  }, [resaleListings]);

  useEffect(() => {
    localStorage.setItem("arv_resale_pricing", JSON.stringify(resalePricing));
  }, [resalePricing]);

  useEffect(() => {
    localStorage.setItem("arv_resale_conditions", JSON.stringify(resalePaymentConditions));
  }, [resalePaymentConditions]);

  useEffect(() => {
    localStorage.setItem("arv_resale_leads", JSON.stringify(resaleLeads));
  }, [resaleLeads]);

  // Handle Dark mode class toggle on <html> element and persist preference
  useEffect(() => {
    localStorage.setItem("arv_theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const currentInvestor =
    investors.find((i) => i.id === currentInvestorId) || investors[0];

  // Actions implementation
  const addInvestor = (data: Partial<Investor>) => {
    const id = `inv-${(investors.length + 1).toString().padStart(2, "0")}`;
    const name = data.name || "Novo Investidor";
    const totalInvested = data.scoreBreakdown?.volume ? data.scoreBreakdown.volume * 250000 : 1000000;

    const breakdown = calculateScoreBreakdown(
      totalInvested,
      1,
      1,
      5,
      1,
      8,
      0,
      0
    );

    const newInv: Investor = {
      id,
      name,
      cpfCnpj: data.cpfCnpj || "000.000.000-00",
      phone: data.phone || "(85) 99999-0000",
      whatsapp: data.whatsapp || data.phone || "(85) 99999-0000",
      email: data.email || "investidor@arvinc.com.br",
      address: data.address || "Endereço Cadastrado",
      city: data.city || "Fortaleza - CE",
      state: data.state || "CE",
      profession: data.profession || "Investidor",
      createdAt: new Date().toISOString().split("T")[0],
      consultant: data.consultant || "Camila Vasconcelos",
      notes: data.notes || "Cadastrado via CRM ARV",
      score: breakdown.totalScore,
      tier: breakdown.tier,
      scoreBreakdown: breakdown,
      satisfactionScore: 8,
      npsCategory: "Promotor",
      active: true,
      avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
    };

    setInvestors([newInv, ...investors]);
  };

  const updateInvestor = (id: string, updates: Partial<Investor>) => {
    setInvestors((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  };

  const recalculateScore = (id: string) => {
    setInvestors((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const invContracts = contracts.filter((c) => c.investorId === id);
        const totalInvested = invContracts.reduce((acc, curr) => acc + curr.investedAmount, 0);
        const invInteractions = timelineInteractions.filter((ti) => ti.investorId === id);

        const breakdown = calculateScoreBreakdown(
          totalInvested,
          invContracts.length || 1,
          invInteractions.length || 1,
          inv.scoreBreakdown.portalAccess + 1,
          2,
          inv.satisfactionScore,
          invContracts.length > 1 ? 1 : 0,
          1
        );

        return {
          ...inv,
          score: breakdown.totalScore,
          tier: breakdown.tier,
          scoreBreakdown: breakdown,
        };
      })
    );
  };

  const addSPE = (data: Partial<SPE>) => {
    const id = `spe-${(spes.length + 1).toString().padStart(2, "0")}`;
    const newSPE: SPE = {
      id,
      name: data.name || "Nova SPE ARV",
      cnpj: data.cnpj || "00.000.000/0001-00",
      address: data.address || "Av. Santos Dumont",
      city: data.city || "Fortaleza - CE",
      manager: data.manager || "Eng. Ricardo Alencar",
      status: data.status || "Em Captação",
      deadline: data.deadline || "2028-12-31",
      totalVgv: data.totalVgv || 50000000,
      totalCaptação: data.totalCaptação || 20000000,
      percentSold: data.percentSold || 10,
      progressPercentage: data.progressPercentage || 5,
      description: data.description || "Nova SPE cadastrada no hub da ARV.",
      bannerImage: data.bannerImage || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    };

    setSpes([newSPE, ...spes]);
  };

  const updateSPE = (id: string, updates: Partial<SPE>) => {
    setSpes((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addInteraction = (data: Omit<TimelineInteraction, "id">) => {
    const newInteraction: TimelineInteraction = {
      ...data,
      id: `int-${Date.now()}`,
    };
    setTimelineInteractions([newInteraction, ...timelineInteractions]);
  };

  const addContract = (data: Omit<Contract, "id">) => {
    const newContract: Contract = {
      ...data,
      id: `ctr-${contracts.length + 1}`,
    };
    setContracts([newContract, ...contracts]);
  };

  const addAssembly = (data: Omit<Assembly, "id" | "rsvpStatus">) => {
    const newAss: Assembly = {
      ...data,
      id: `ass-${assemblies.length + 1}`,
      rsvpStatus: {},
    };
    setAssemblies([newAss, ...assemblies]);
  };

  const updateAssemblyRsvp = (
    assemblyId: string,
    investorId: string,
    status: "Confirmado" | "Recusado" | "Pendente"
  ) => {
    setAssemblies((prev) =>
      prev.map((a) => {
        if (a.id !== assemblyId) return a;
        return {
          ...a,
          rsvpStatus: {
            ...a.rsvpStatus,
            [investorId]: status,
          },
        };
      })
    );
  };

  const addCampaign = (campaign: Omit<CommunicationCampaign, "id">) => {
    const newCamp: CommunicationCampaign = {
      ...campaign,
      id: `camp-${campaigns.length + 1}`,
    };
    setCampaigns([newCamp, ...campaigns]);
  };

  const sendCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "Enviado",
              sentAt: new Date().toISOString().replace("T", " ").substring(0, 16),
              stats: { sent: 30, opened: 24, clicked: 18 },
            }
          : c
      )
    );
  };

  const updateStageProgress = (speId: string, stage: ConstructionStage, percentage: number) => {
    setConstructionProgresses((prev) =>
      prev.map((p) => {
        if (p.speId !== speId) return p;
        const newStages = p.stages.map((st) =>
          st.stage === stage
            ? {
                ...st,
                percentage,
                status: (percentage === 100
                  ? "Concluído"
                  : percentage > 0
                  ? "Em Andamento"
                  : "A Iniciar") as "Concluído" | "Em Andamento" | "A Iniciar",
              }
            : st
        );
        const overall = Math.round(
          newStages.reduce((acc, curr) => acc + curr.percentage, 0) / newStages.length
        );

        return {
          ...p,
          overallPercentage: overall,
          stages: newStages,
          lastUpdateDate: new Date().toISOString().split("T")[0],
        };
      })
    );

    // Sync SPE overall progress
    setSpes((prev) =>
      prev.map((s) => (s.id === speId ? { ...s, progressPercentage: percentage } : s))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Marketing & Onboarding Action implementations
  const addLead = (leadData: Partial<MarketingLead>) => {
    const newId = `lead-${(leads.length + 1).toString().padStart(2, "0")}`;
    const newLead: MarketingLead = {
      id: newId,
      name: leadData.name || "Novo Lead Captação",
      phone: leadData.phone || "(85) 99999-0000",
      whatsapp: leadData.whatsapp || leadData.phone || "(85) 99999-0000",
      email: leadData.email || "lead@marketing.com.br",
      originCampaign: leadData.originCampaign || "Meta Ads - Campanha Geral ARV",
      adSet: leadData.adSet || "Público Alta Renda",
      adName: leadData.adName || "Anúncio Padrão ARV",
      landingPage: leadData.landingPage || "https://arvinc.com.br/lp-investimentos",
      utmSource: leadData.utmSource || "facebook",
      utmCampaign: leadData.utmCampaign || "meta_arv_2026",
      utmMedium: leadData.utmMedium || "cpc",
      conversionDate: new Date().toISOString().split("T")[0],
      assignedBroker: leadData.assignedBroker || "Camila Vasconcelos",
      speOfInterest: leadData.speOfInterest || "SPE ARV Horizon Residence",
      stage: leadData.stage || "Novo Lead",
      dealValue: leadData.dealValue || 1000000,
      notes: leadData.notes || "Lead importado via integração Marketing Digital.",
      ...leadData,
    };
    setLeads([newLead, ...leads]);
  };

  const updateLead = (id: string, updates: Partial<MarketingLead>) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const triggerOnboardingForLead = (leadId: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    // 1. Create or find investor
    let targetInvestor = investors.find(
      (i) => i.email.toLowerCase() === targetLead.email.toLowerCase() || (i.cpfCnpj && targetLead.cpfCnpj && i.cpfCnpj === targetLead.cpfCnpj)
    );

    let invId = targetInvestor?.id;

    if (!targetInvestor) {
      invId = `inv-${(investors.length + 1).toString().padStart(2, "0")}`;
      const breakdown = calculateScoreBreakdown(
        targetLead.dealValue || 1000000,
        1,
        1,
        2,
        1,
        9,
        0,
        0
      );
      const newInv: Investor = {
        id: invId,
        name: targetLead.name,
        cpfCnpj: targetLead.cpfCnpj || "000.000.000-00",
        phone: targetLead.phone,
        whatsapp: targetLead.whatsapp,
        email: targetLead.email,
        address: targetLead.address || "Rua Desembargador Leite Alves, 400",
        city: targetLead.city || "Fortaleza",
        state: targetLead.state || "CE",
        profession: targetLead.profession || "Investidor High Net Worth",
        createdAt: new Date().toISOString().split("T")[0],
        consultant: targetLead.assignedBroker || "Camila Vasconcelos",
        notes: `Convertido do Funil de Vendas ARV (Origem: ${targetLead.originCampaign})`,
        score: breakdown.totalScore,
        tier: breakdown.tier,
        scoreBreakdown: breakdown,
        satisfactionScore: 9,
        npsCategory: "Promotor",
        active: true,
        avatarUrl: `https://i.pravatar.cc/150?u=${invId}`,
      };

      setInvestors((prev) => [newInv, ...prev]);
    }

    // 2. Find matching SPE
    const matchedSpe = spes.find((s) => s.name === targetLead.speOfInterest) || spes[0];

    // 3. Create Contract
    const newContractId = `ctr-${contracts.length + 1}`;
    const newContract: Contract = {
      id: newContractId,
      investorId: invId!,
      speId: matchedSpe.id,
      developmentId: "dev-01",
      unitId: "unit-101",
      contractNumber: `CTR-ARV-2026-${(contracts.length + 1).toString().padStart(3, "0")}`,
      purchaseDate: new Date().toISOString().split("T")[0],
      investedAmount: targetLead.dealValue || 1200000,
      speSharePercentage: 1.5,
      expectedRoiPercentage: 18.5,
      status: "Ativo",
      documentUrl: targetLead.electronicSignatureUrl || "https://arvinc.com.br/contratos/minuta.pdf",
    };
    setContracts((prev) => [newContract, ...prev]);

    // 4. Create CustomerOnboardingProgress
    const newOnbId = `onb-${(onboardings.length + 1).toString().padStart(2, "0")}`;
    const newOnb: CustomerOnboardingProgress = {
      id: newOnbId,
      investorId: invId!,
      investorName: targetLead.name,
      contractId: newContractId,
      speId: matchedSpe.id,
      speName: matchedSpe.name,
      unitNumber: "Unidade " + (100 + onboardings.length + 1),
      currentStep: 1,
      startDate: new Date().toISOString().split("T")[0],
      welcomeSent: true,
      specsDelivered: false,
      portalAccessCreated: true,
      docsAvailable: true,
      teamIntroduced: false,
      checklist: {
        contractSigned: targetLead.electronicSignatureStatus === "Assinado",
        docsUploaded: true,
        registrationApproved: true,
        portalReleased: true,
        firstAccessDone: false,
        paymentConfigured: false,
      },
    };

    setOnboardings((prev) => [newOnb, ...prev]);

    // 5. Add Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "🎉 Venda Concluída & Onboarding Iniciado!",
        message: `O cliente ${targetLead.name} teve o contrato assinado e o Onboarding Digital foi disparado automaticamente.`,
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "success",
      },
      ...prev,
    ]);
  };

  const moveLeadStage = (leadId: string, targetStage: LeadFunnelStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: targetStage } : l))
    );

    // If moved to "Venda Concluída" or "Onboarding", trigger automated onboarding!
    if (targetStage === "Venda Concluída" || targetStage === "Onboarding") {
      triggerOnboardingForLead(leadId);
    }
  };

  const updateOnboardingStep = (onboardingId: string, step: number) => {
    setOnboardings((prev) =>
      prev.map((o) => (o.id === onboardingId ? { ...o, currentStep: step } : o))
    );
  };

  const updateOnboardingChecklist = (onboardingId: string, itemKey: string, value: boolean) => {
    setOnboardings((prev) =>
      prev.map((o) => {
        if (o.id !== onboardingId) return o;
        return {
          ...o,
          checklist: {
            ...o.checklist,
            [itemKey]: value,
          },
        };
      })
    );
  };

  const addNotification = (data: Omit<NotificationItem, "id">) => {
    const newNotif: NotificationItem = {
      ...data,
      id: `notif-${Date.now()}`,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const addNewsletter = (newsletter: Omit<SmartNewsletter, "id">): string => {
    const id = `news-${(newsletters.length + 1).toString().padStart(2, "0")}`;
    const newNews: SmartNewsletter = {
      ...newsletter,
      id,
    };
    setNewsletters((prev) => [newNews, ...prev]);
    return id;
  };

  const updateNewsletter = (id: string, updates: Partial<SmartNewsletter>) => {
    setNewsletters((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const sendNewsletter = (id: string) => {
    setNewsletters((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const currentStats = item.stats || {
          sentCount: 0,
          deliveryRate: 99.2,
          openRate: 85.0,
          clicksPerSection: {},
          docDownloads: 0,
          photoViews: 0,
          portalVisitsGenerated: 0,
          mostAccessedSPE: item.speName,
          engagementByInvestor: [],
        };
        return {
          ...item,
          status: "Publicado",
          stats: {
            ...currentStats,
            sentCount: currentStats.sentCount + investors.length,
          },
        };
      })
    );

    // Automatically create a notification for investors in the system
    const news = newsletters.find((n) => n.id === id);
    if (news) {
      addNotification({
        title: news.editionName,
        message: `Nova Newsletter da ${news.speName} disponível no Portal do Investidor!`,
        date: new Date().toISOString().split("T")[0],
        read: false,
        type: "info",
      });
    }
  };

  const deleteNewsletter = (id: string) => {
    setNewsletters((prev) => prev.filter((item) => item.id !== id));
  };

  // Profitability & Price Comparison Action Handlers
  const addMarketBenchmarkEntry = (data: Omit<MarketBenchmarkEntry, "id">) => {
    const newEntry: MarketBenchmarkEntry = {
      ...data,
      id: `${data.indicator.toLowerCase()}-${data.referenceMonth}-${Date.now().toString(36)}`,
    };
    setMarketBenchmarkHistory((prev) => {
      // Substitui se já existir para o mesmo mês/indicador ou adiciona
      const filtered = prev.filter(
        (e) => !(e.indicator === newEntry.indicator && e.referenceMonth === newEntry.referenceMonth)
      );
      const updated = [...filtered, newEntry];
      return updated.sort((a, b) => a.referenceMonth.localeCompare(b.referenceMonth));
    });
  };

  const updateMarketBenchmarkEntry = (id: string, updates: Partial<MarketBenchmarkEntry>) => {
    setMarketBenchmarkHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteMarketBenchmarkEntry = (id: string) => {
    setMarketBenchmarkHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const addUnitPriceComparison = (data: Omit<UnitPriceComparison, "id">) => {
    const newId = `upc-${Date.now().toString(36)}`;
    const newEntry: UnitPriceComparison = {
      ...data,
      id: newId,
    };
    setUnitPriceComparisons((prev) => [newEntry, ...prev]);
  };

  const updateUnitPriceComparison = (id: string, updates: Partial<UnitPriceComparison>) => {
    setUnitPriceComparisons((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteUnitPriceComparison = (id: string) => {
    setUnitPriceComparisons((prev) => prev.filter((item) => item.id !== id));
  };

  const createProfitabilitySimulation = (input: ProfitabilitySimulationInput) => {
    const result = runProfitabilitySimulation(input, marketBenchmarkHistory);
    setProfitabilitySimulations((prev) => [result.simulation, ...prev]);
    return result;
  };

  const deleteProfitabilitySimulation = (id: string) => {
    setProfitabilitySimulations((prev) => prev.filter((s) => s.id !== id));
  };

  const getComparisonForContract = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return null;

    const investor = investors.find((i) => i.id === contract.investorId);
    const spe = spes.find((s) => s.id === contract.speId);

    // Calcular meses decorridos desde a data da compra até hoje (Agosto/2026 como base corrente)
    const purchaseDate = contract.purchaseDate || "2024-01-01";
    const [pYear, pMonth] = purchaseDate.split("-").map(Number);
    const now = new Date();
    // Ano base de referência da plataforma: 2026
    const currentYear = 2026;
    const currentMonth = 8;
    const elapsedMonths = Math.max(
      1,
      (currentYear - pYear) * 12 + (currentMonth - pMonth)
    );

    // Retorno anual contratual ou esperado
    const annualExpectedRate = contract.expectedRoiPercentage || 18.0;

    return runProfitabilitySimulation(
      {
        contractId: contract.id,
        unitId: contract.unitId,
        speId: contract.speId,
        investorName: investor?.name || "Investidor ARV",
        title: `${spe?.name || "SPE ARV"} • Contrato ${contract.contractNumber}`,
        purchasePrice: contract.investedAmount,
        entryDate: purchaseDate,
        horizonMonths: elapsedMonths,
        appreciationScenario: "Moderado",
        customAnnualAppreciationRate: annualExpectedRate,
      },
      marketBenchmarkHistory
    );
  };

  // ============================================================================
  // REVENDA & GESTÃO DE DISTRATOS / DEVOLUÇÕES - ACTIONS
  // ============================================================================

  const addReturnRecord = (data: Omit<ReturnRecord, "id">): string => {
    const id = `ret-${Date.now()}`;
    const newRecord: ReturnRecord = { ...data, id };
    setReturnRecords((prev) => [newRecord, ...prev]);

    // Atualiza o contrato original se existir para status Distratado
    if (data.originalContractId) {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === data.originalContractId ? { ...c, status: "Distratado" as const } : c
        )
      );
    }

    addNotification({
      title: "Distrato / Devolução Registrado",
      message: `Unidade ${data.unitId} teve devolução formalizada sob modalidade "${data.returnType}".`,
      type: "warning",
      date: new Date().toISOString(),
      read: false,
    });

    return id;
  };

  const registerUnitReturn = (data: {
    unitId: string;
    speId: string;
    originalContractId: string;
    originalInvestorId: string;
    returnType: ReturnRecord["returnType"];
    returnDate: string;
    originalContractAmount: number;
    amountRefundedToInvestor: number;
    retentionPercentage: number;
    penaltyClauseAmount?: number;
    legalStatus: ReturnRecord["legalStatus"];
    notes: string;
    documentUrl?: string;
    originalTablePrice?: number;
    autoStartResale?: boolean;
    defaultDiscountPercent?: number;
  }): { returnRecordId: string; resaleListingId?: string } => {
    const returnRecordId = `ret-${Date.now()}`;
    const returnRecord: ReturnRecord = {
      id: returnRecordId,
      unitId: data.unitId,
      speId: data.speId,
      originalContractId: data.originalContractId,
      originalInvestorId: data.originalInvestorId,
      returnType: data.returnType,
      returnDate: data.returnDate,
      originalContractAmount: data.originalContractAmount,
      amountRefundedToInvestor: data.amountRefundedToInvestor,
      retentionPercentage: data.retentionPercentage,
      penaltyClauseAmount: data.penaltyClauseAmount,
      legalStatus: data.legalStatus,
      notes: data.notes,
      documentUrl: data.documentUrl,
    };

    setReturnRecords((prev) => [returnRecord, ...prev]);

    // Atualiza contrato para Distratado
    if (data.originalContractId) {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === data.originalContractId ? { ...c, status: "Distratado" as const } : c
        )
      );
    }

    let createdResaleListingId: string | undefined = undefined;

    if (data.autoStartResale) {
      const discount = data.defaultDiscountPercent || 10;
      const basePrice = data.originalTablePrice || data.originalContractAmount * 1.15;
      const resalePrice = Math.round(basePrice * (1 - discount / 100));

      const listingId = `rsl-${Date.now()}`;
      createdResaleListingId = listingId;

      const newListing: ResaleListing = {
        id: listingId,
        unitId: data.unitId,
        returnRecordId: returnRecordId,
        status: "Em Preparação",
        listingTitle: `Oportunidade de Revenda — Unidade ${data.unitId}`,
        listingDescription: `Excelente oportunidade de aquisição com condições especiais. Imóvel pronto para transferência imediata, preço abaixo da tabela vigente.`,
        highlightTags: ["Oportunidade", "Abaixo da Tabela", "Repasse Direto"],
        photos: [
          "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
        ],
        viewsCount: 0,
        leadsGeneratedCount: 0,
      };

      setResaleListings((prev) => [newListing, ...prev]);

      const newPricing: ResalePricing = {
        id: `prc-${Date.now()}`,
        unitId: data.unitId,
        resaleListingId: listingId,
        originalTablePrice: basePrice,
        resalePrice: resalePrice,
        discountPercentageVsTable: discount,
        pricingReason: "Recuperação Rápida de Caixa",
        minimumAcceptablePrice: Math.round(basePrice * 0.85),
      };

      setResalePricingList((prev) => [newPricing, ...prev]);

      const newConditions: ResalePaymentCondition[] = [
        {
          id: `cnd-${Date.now()}-1`,
          resaleListingId: listingId,
          name: "À Vista com Desconto Especial",
          downPaymentPercentage: 100,
          numberOfInstallments: 1,
          indexer: "Sem Correção",
          specialDiscountPercentage: 3,
          allowsFinancing: false,
          description: "Pagamento integral no ato da escritura pública ou cessão.",
        },
        {
          id: `cnd-${Date.now()}-2`,
          resaleListingId: listingId,
          name: "Entrada Facilitada + Saldo em até 24x",
          downPaymentPercentage: 30,
          numberOfInstallments: 24,
          indexer: "IPCA",
          specialDiscountPercentage: 0,
          allowsFinancing: true,
          description: "Entrada de 30% e saldo em 24 parcelas corrigidas pelo IPCA.",
        },
      ];

      setResalePaymentConditions((prev) => [...newConditions, ...prev]);
    }

    addNotification({
      title: "Distrato Registrado com Sucesso",
      message: `Unidade ${data.unitId} transferida para fluxo de distrato/devolução.`,
      type: "info",
      date: new Date().toISOString(),
      read: false,
    });

    return { returnRecordId, resaleListingId: createdResaleListingId };
  };

  const updateReturnRecord = (id: string, updates: Partial<ReturnRecord>) => {
    setReturnRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const startResaleFlow = (
    unitId: string,
    speId: string,
    originalContractId: string,
    originalInvestorId: string,
    originalContractAmount: number,
    originalTablePrice: number,
    defaultDiscountPercent = 10,
    unitDetails?: { unitNumber?: string; speName?: string; areaM2?: number; type?: string }
  ) => {
    const orchestrated = moveUnitToResaleFlow(
      unitId,
      speId,
      originalContractId,
      originalInvestorId,
      originalContractAmount,
      originalTablePrice,
      defaultDiscountPercent,
      unitDetails
    );

    // Salva o distrato
    setReturnRecords((prev) => [orchestrated.returnRecord, ...prev]);

    // Marca contrato original como Distratado
    if (originalContractId) {
      setContracts((prev) =>
        prev.map((c) =>
          c.id === originalContractId ? { ...c, status: "Distratado" as const } : c
        )
      );
    }

    // Salva o anúncio de revenda em preparação
    setResaleListings((prev) => [orchestrated.resaleListing, ...prev]);

    // Salva precificação
    setResalePricingList((prev) => [orchestrated.resalePricing, ...prev]);

    // Salva condições padrão de pagamento
    setResalePaymentConditions((prev) => [...orchestrated.defaultConditions, ...prev]);

    addNotification({
      title: "Novo Fluxo de Revenda Criado",
      message: `Unidade ${unitDetails?.unitNumber || unitId} entrou em fluxo de revenda com ${defaultDiscountPercent}% de desconto vs tabela.`,
      type: "info",
      date: new Date().toISOString(),
      read: false,
    });

    return {
      returnRecordId: orchestrated.returnRecord.id,
      resaleListingId: orchestrated.resaleListing.id,
    };
  };

  const addResaleListing = (
    data: Omit<ResaleListing, "id" | "viewsCount" | "leadsGeneratedCount">
  ): string => {
    const id = `rsl-${Date.now()}`;
    const newListing: ResaleListing = {
      ...data,
      id,
      viewsCount: 0,
      leadsGeneratedCount: 0,
    };
    setResaleListings((prev) => [newListing, ...prev]);
    return id;
  };

  const createResaleListing = (
    unitId: string,
    data: Partial<Omit<ResaleListing, "id" | "unitId" | "viewsCount" | "leadsGeneratedCount">>
  ): string => {
    const id = `rsl-${Date.now()}`;
    const newListing: ResaleListing = {
      id,
      unitId,
      returnRecordId: data.returnRecordId || "ret-manual",
      status: data.status || "Em Preparação",
      listingTitle: data.listingTitle || `Oportunidade — Unidade ${unitId}`,
      listingDescription:
        data.listingDescription || "Unidade disponível para revenda com condições exclusivas.",
      highlightTags: data.highlightTags || ["Oportunidade", "Abaixo da Tabela"],
      photos: data.photos || [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
      ],
      floorPlanUrl: data.floorPlanUrl,
      viewsCount: 0,
      leadsGeneratedCount: 0,
    };
    setResaleListings((prev) => [newListing, ...prev]);
    return id;
  };

  const updateResaleListing = (id: string, updates: Partial<ResaleListing>) => {
    setResaleListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const publishResaleListing = (
    id: string,
    overrideFloorCheck = false
  ): { success: boolean; error?: string } => {
    const listing = resaleListings.find((l) => l.id === id);
    if (!listing) return { success: false, error: "Anúncio não encontrado." };

    // Validações obrigatórias para publicação:
    // 1. Descrição preenchida
    if (!listing.listingDescription || listing.listingDescription.trim().length < 20) {
      return { success: false, error: "A descrição do anúncio precisa ter pelo menos 20 caracteres antes de publicar." };
    }

    // 2. Ao menos 1 foto
    if (!listing.photos || listing.photos.length === 0) {
      return { success: false, error: "Adicione pelo menos 1 foto do imóvel antes de publicar o anúncio." };
    }

    // 3. Preço definido
    const pricing = resalePricing.find((p) => p.resaleListingId === id);
    if (!pricing || !pricing.resalePrice || pricing.resalePrice <= 0) {
      return { success: false, error: "Defina a precificação de revenda antes de publicar." };
    }

    // 4. Ao menos 1 condição de pagamento cadastrada
    const conditions = resalePaymentConditions.filter((c) => c.resaleListingId === id);
    if (conditions.length === 0) {
      return { success: false, error: "Cadastre ao menos uma condição de pagamento para a revenda." };
    }

    // 5. Validação de piso mínimo
    if (!overrideFloorCheck && !pricing.approvedBy) {
      const isValid = validateResalePriceFloor(pricing.resalePrice, pricing.minimumAcceptablePrice);
      if (!isValid) {
        return {
          success: false,
          error: `O preço de revenda (R$ ${pricing.resalePrice.toLocaleString("pt-BR")}) está abaixo do piso mínimo aceitável (R$ ${pricing.minimumAcceptablePrice.toLocaleString("pt-BR")}). Requer aprovação explícita da diretoria comercial.`,
        };
      }
    }

    setResaleListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "Publicado" as const,
              publishedAt: new Date().toISOString(),
              publishedBy: "Comitê Comercial ARV",
            }
          : l
      )
    );

    addNotification({
      title: "Anúncio Publicado na Vitrine de Revendas",
      message: `${listing.listingTitle} agora está visível e disponível para captação de leads.`,
      type: "success",
      date: new Date().toISOString(),
      read: false,
    });

    return { success: true };
  };

  const pauseResaleListing = (id: string) => {
    setResaleListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "Pausado" as const } : l))
    );
  };

  const reserveResaleListing = (id: string, leadInfo?: Partial<ResaleLead>) => {
    setResaleListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "Reservado" as const } : l))
    );

    if (leadInfo?.name) {
      const leadId = `rsl-lead-${Date.now()}`;
      setResaleLeads((prev) => [
        {
          id: leadId,
          resaleListingId: id,
          name: leadInfo.name || "Lead Interessado",
          email: leadInfo.email || "contato@investidor.com.br",
          phone: leadInfo.phone || "(48) 99999-0000",
          message: leadInfo.message || "Reserva solicitada via plataforma",
          source: leadInfo.source || "Vitrine Interna",
          createdAt: new Date().toISOString(),
          status: "Proposta Enviada",
        },
        ...prev,
      ]);
    }

    addNotification({
      title: "Unidade de Revenda Reservada",
      message: `A unidade teve reserva temporária aplicada aguardando assinatura da proposta.`,
      type: "info",
      date: new Date().toISOString(),
      read: false,
    });
  };

  const markResaleAsSold = (
    listingId: string,
    saleData: {
      investorId?: string;
      buyerName: string;
      buyerEmail?: string;
      buyerPhone?: string;
      contractAmount: number;
      purchaseDate?: string;
      speSharePercentage?: number;
    }
  ): string => {
    const listing = resaleListings.find((l) => l.id === listingId);
    const returnRec = returnRecords.find((r) => r.id === listing?.returnRecordId);

    // Marca listing como Vendido
    setResaleListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: "Vendido" as const } : l))
    );

    // Se comprador for novo, registra ou busca
    let buyerId = saleData.investorId;
    if (!buyerId) {
      buyerId = `inv-rev-${Date.now()}`;
      const newBuyer: Investor = {
        id: buyerId,
        name: saleData.buyerName,
        cpfCnpj: "000.000.000-00",
        phone: saleData.buyerPhone || "(48) 99999-9999",
        whatsapp: saleData.buyerPhone || "(48) 99999-9999",
        email: saleData.buyerEmail || "comprador@investidor.com.br",
        address: "Florianópolis - SC",
        city: "Florianópolis",
        state: "SC",
        profession: "Investidor Imobiliário",
        createdAt: new Date().toISOString().split("T")[0],
        consultant: "Comercial ARV",
        notes: `Investidor adquirente de revenda da unidade ${listing?.unitId}. Originado da listagem ${listingId}.`,
        score: 80,
        tier: "Select",
        scoreBreakdown: {
          volume: 15,
          numInvestments: 1,
          assemblyAttendance: 10,
          portalAccess: 8,
          clientTenure: 5,
          satisfaction: 9,
          reinvestments: 5,
          referrals: 5,
          totalScore: 80,
          tier: "Select",
        },
        satisfactionScore: 9,
        npsCategory: "Promotor",
        active: true,
        avatarUrl: `https://i.pravatar.cc/150?u=${buyerId}`,
      };
      setInvestors((prev) => [newBuyer, ...prev]);
    }

    // Cria novo contrato no sistema com referência rastreável resaleListingId
    const newContractId = `ctr-rev-${Date.now()}`;
    const newContract: Contract = {
      id: newContractId,
      investorId: buyerId,
      speId: returnRec?.speId || "spe-t58",
      developmentId: "dev-t58",
      unitId: listing?.unitId || "unit-rev",
      contractNumber: `REV-${Math.floor(100000 + Math.random() * 900000)}`,
      purchaseDate: saleData.purchaseDate || new Date().toISOString().split("T")[0],
      investedAmount: saleData.contractAmount,
      speSharePercentage: saleData.speSharePercentage || 1.8,
      expectedRoiPercentage: 18.0,
      status: "Ativo",
      documentUrl: "#",
      resaleListingId: listingId, // Mantém rastreabilidade de que veio do fluxo de revenda/distrato
    };

    setContracts((prev) => [newContract, ...prev]);

    // Atualiza leads associados para Convertido
    setResaleLeads((prev) =>
      prev.map((ld) =>
        ld.resaleListingId === listingId && ld.status !== "Perdido"
          ? { ...ld, status: "Convertido" as const }
          : ld
      )
    );

    addNotification({
      title: "Revenda Concluída com Sucesso! 🏆",
      message: `Unidade ${listing?.unitId} vendida por R$ ${saleData.contractAmount.toLocaleString("pt-BR")}. Contrato ${newContract.contractNumber} gerado e unidade retirada da vitrine.`,
      type: "success",
      date: new Date().toISOString(),
      read: false,
    });

    return newContractId;
  };

  const setResalePricing = (
    resaleListingId: string,
    data: {
      originalTablePrice: number;
      resalePrice: number;
      pricingReason: ResalePricing["pricingReason"];
      minimumAcceptablePrice: number;
      approvedBy?: string;
    }
  ): { success: boolean; error?: string } => {
    if (!data.approvedBy && !validateResalePriceFloor(data.resalePrice, data.minimumAcceptablePrice)) {
      return {
        success: false,
        error: `O preço de revenda (R$ ${data.resalePrice.toLocaleString("pt-BR")}) não pode ser inferior ao piso mínimo (R$ ${data.minimumAcceptablePrice.toLocaleString("pt-BR")}) sem aprovação formal da diretoria.`,
      };
    }

    const discountPercentageVsTable = calculateResaleDiscount(
      data.originalTablePrice,
      data.resalePrice
    );

    setResalePricingList((prev) => {
      const existing = prev.find((p) => p.resaleListingId === resaleListingId);
      if (existing) {
        return prev.map((p) =>
          p.resaleListingId === resaleListingId
            ? {
                ...p,
                ...data,
                discountPercentageVsTable,
                approvedAt: data.approvedBy ? new Date().toISOString() : p.approvedAt,
              }
            : p
        );
      }
      const newPricing: ResalePricing = {
        id: `prc-${Date.now()}`,
        unitId: "unit-rev",
        resaleListingId,
        ...data,
        discountPercentageVsTable,
        approvedAt: data.approvedBy ? new Date().toISOString() : undefined,
      };
      return [newPricing, ...prev];
    });

    return { success: true };
  };

  const updateResalePricing = (resaleListingId: string, updates: Partial<ResalePricing>) => {
    setResalePricingList((prev) =>
      prev.map((p) => {
        if (p.resaleListingId === resaleListingId) {
          const merged = { ...p, ...updates };
          if (updates.resalePrice !== undefined || updates.originalTablePrice !== undefined) {
            merged.discountPercentageVsTable = calculateResaleDiscount(
              merged.originalTablePrice,
              merged.resalePrice
            );
          }
          return merged;
        }
        return p;
      })
    );
  };

  const addResalePaymentCondition = (data: Omit<ResalePaymentCondition, "id">): string => {
    const id = `cnd-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newCond: ResalePaymentCondition = { ...data, id };
    setResalePaymentConditions((prev) => [newCond, ...prev]);
    return id;
  };

  const updateResalePaymentCondition = (
    id: string,
    updates: Partial<ResalePaymentCondition>
  ) => {
    setResalePaymentConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteResalePaymentCondition = (id: string) => {
    setResalePaymentConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const addResaleLead = (data: Omit<ResaleLead, "id" | "createdAt">): string => {
    const id = `rsl-lead-${Date.now()}`;
    const newLead: ResaleLead = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    setResaleLeads((prev) => [newLead, ...prev]);

    // Incrementa leadsGeneratedCount no anúncio
    setResaleListings((prev) =>
      prev.map((l) =>
        l.id === data.resaleListingId
          ? { ...l, leadsGeneratedCount: (l.leadsGeneratedCount || 0) + 1 }
          : l
      )
    );

    addNotification({
      title: "Novo Lead na Vitrine de Revenda",
      message: `${data.name} demonstrou interesse em uma unidade de revenda. Telefone: ${data.phone}`,
      type: "info",
      date: new Date().toISOString(),
      read: false,
    });

    return id;
  };

  const registerResaleLead = (
    resaleListingId: string,
    leadData: Omit<ResaleLead, "id" | "resaleListingId" | "createdAt">
  ): string => {
    return addResaleLead({
      ...leadData,
      resaleListingId,
    });
  };

  const updateResaleLead = (id: string, updates: Partial<ResaleLead>) => {
    setResaleLeads((prev) =>
      prev.map((ld) => (ld.id === id ? { ...ld, ...updates } : ld))
    );
  };

  const incrementListingView = (listingId: string) => {
    setResaleListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, viewsCount: (l.viewsCount || 0) + 1 } : l
      )
    );
  };

  const generateListingDescriptionWithAI = async (params: {
    unitNumber?: string;
    speName?: string;
    developmentName?: string;
    areaM2?: number;
    type?: string;
    floor?: string;
    solarPosition?: string;
    resalePrice?: number;
    originalTablePrice?: number;
    discountPercentage?: number;
    paymentConditions?: string[];
    highlightTags?: string[];
    isDistrato?: boolean;
    customInstructions?: string;
  }): Promise<{ headline: string; description: string; suggestedTags: string[] }> => {
    try {
      const response = await fetch("/api/resale/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Erro na chamada da API: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        headline: result.headline || `Oportunidade Exclusiva • Unidade ${params.unitNumber || ""}`,
        description: result.description || "Unidade em excelente localização e condições especiais de revenda.",
        suggestedTags: result.suggestedTags || ["Oportunidade", "Abaixo da Tabela", "Repasse Direto"],
      };
    } catch (err) {
      console.warn("Falha ao gerar descrição com IA via API, usando fallback local estruturado:", err);
      const discount = params.discountPercentage || 10;
      const formattedPrice = params.resalePrice ? `R$ ${params.resalePrice.toLocaleString("pt-BR")}` : "sob consulta";
      return {
        headline: `Oportunidade — Unidade ${params.unitNumber || "Especial"} no ${params.speName || params.developmentName || "Empreendimento ARV"}`,
        description: `Excelente oportunidade de repasse direto no ${params.speName || "empreendimento"}. Unidade ${params.type || "Apartamento"} com ${params.areaM2 || 65}m² privativos, posicionamento solar privilegiado e padrão construtivo de alto nível. Valor com ${discount}% de desconto sobre a tabela vigente: ${formattedPrice}. Condições de pagamento diferenciadas, com possibilidade de parcelamento direto ou financiamento bancário facilitado. Unidade disponível para transferência imediata de titularidade.`,
        suggestedTags: ["Oportunidade", "Repasse Direto", `${discount}% Abaixo da Tabela`, "Transferência Imediata"],
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentInvestorId,
        setCurrentInvestorId,
        currentInvestor,
        investors,
        spes,
        developments,
        contracts,
        constructionProgresses,
        payments,
        timelineInteractions,
        documents,
        suppliers,
        assemblies,
        campaigns,
        notifications,
        aiRecommendations,
        leads,
        onboardings,
        newsletters,
        marketBenchmarkHistory,
        unitPriceComparisons,
        profitabilitySimulations,
        returnRecords,
        resaleListings,
        resalePricing,
        resalePaymentConditions,
        resaleLeads,
        darkMode,
        toggleDarkMode,
        isSearchOpen,
        setIsSearchOpen,
        addInvestor,
        updateInvestor,
        recalculateScore,
        addSPE,
        updateSPE,
        addInteraction,
        addContract,
        addAssembly,
        updateAssemblyRsvp,
        addCampaign,
        sendCampaign,
        updateStageProgress,
        markNotificationRead,
        addNotification,
        addNewsletter,
        updateNewsletter,
        sendNewsletter,
        deleteNewsletter,
        addLead,
        updateLead,
        moveLeadStage,
        updateOnboardingStep,
        updateOnboardingChecklist,
        triggerOnboardingForLead,
        addMarketBenchmarkEntry,
        updateMarketBenchmarkEntry,
        deleteMarketBenchmarkEntry,
        addUnitPriceComparison,
        updateUnitPriceComparison,
        deleteUnitPriceComparison,
        createProfitabilitySimulation,
        deleteProfitabilitySimulation,
        getComparisonForContract,
        addReturnRecord,
        registerUnitReturn,
        updateReturnRecord,
        startResaleFlow,
        addResaleListing,
        createResaleListing,
        updateResaleListing,
        publishResaleListing,
        pauseResaleListing,
        reserveResaleListing,
        markResaleAsSold,
        setResalePricing,
        updateResalePricing,
        addResalePaymentCondition,
        updateResalePaymentCondition,
        deleteResalePaymentCondition,
        addResaleLead,
        registerResaleLead,
        updateResaleLead,
        incrementListingView,
        generateListingDescriptionWithAI,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
