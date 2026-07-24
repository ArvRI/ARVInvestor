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
  calculateScoreBreakdown,
} from "../data/initialData";

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>("ADMIN");
  const [currentInvestorId, setCurrentInvestorId] = useState<string>("inv-01");
  const [darkMode, setDarkMode] = useState<boolean>(false);
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

  // Persist key state
  useEffect(() => {
    localStorage.setItem("arv_investors", JSON.stringify(investors));
  }, [investors]);

  useEffect(() => {
    localStorage.setItem("arv_spes", JSON.stringify(spes));
  }, [spes]);

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

  // Handle Dark mode class toggle on <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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
