import {
  ReturnRecord,
  ResaleListing,
  ResalePricing,
  ResalePaymentCondition,
  ResaleLead,
} from "../types";

/**
 * Calcula o percentual de desconto do preço de revenda vs preço original de tabela
 */
export function calculateResaleDiscount(
  originalTablePrice: number,
  resalePrice: number
): number {
  if (!originalTablePrice || originalTablePrice <= 0) return 0;
  if (resalePrice >= originalTablePrice) return 0;
  const discount = ((originalTablePrice - resalePrice) / originalTablePrice) * 100;
  return Number(discount.toFixed(1));
}

/**
 * Valida se o preço de revenda respeita o piso mínimo aceitável
 */
export function validateResalePriceFloor(
  resalePrice: number,
  minimumAcceptablePrice: number
): boolean {
  if (!minimumAcceptablePrice || minimumAcceptablePrice <= 0) return true;
  return resalePrice >= minimumAcceptablePrice;
}

/**
 * Orquestra a transição de uma unidade distratada para o fluxo de revenda
 */
export function moveUnitToResaleFlow(
  unitId: string,
  speId: string,
  originalContractId: string,
  originalInvestorId: string,
  originalContractAmount: number,
  originalTablePrice: number,
  defaultDiscountPercent = 10,
  unitDetails?: { unitNumber?: string; speName?: string; areaM2?: number; type?: string }
): {
  returnRecord: ReturnRecord;
  resaleListing: ResaleListing;
  resalePricing: ResalePricing;
  defaultConditions: ResalePaymentCondition[];
} {
  const returnRecordId = `ret-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const resaleListingId = `rsl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const resalePrice = Math.round(originalTablePrice * (1 - defaultDiscountPercent / 100));
  const minimumPrice = Math.round(originalTablePrice * 0.85); // Piso padrão de 15% de desconto

  const returnRecord: ReturnRecord = {
    id: returnRecordId,
    unitId,
    speId,
    originalContractId,
    originalInvestorId,
    returnType: "Distrato Amigável",
    returnDate: new Date().toISOString().split("T")[0],
    originalContractAmount,
    amountRefundedToInvestor: Math.round(originalContractAmount * 0.75), // 75% devolvido
    retentionPercentage: 25, // 25% retido conforme Lei do Distrato (Lei 13.786/2018)
    penaltyClauseAmount: 0,
    legalStatus: "Concluído",
    notes: `Distrato formalizado em conformidade com a Lei 13.786/2018. Unidade redirecionada ao fluxo de Revenda com desconto estratégico.`,
  };

  const resaleListing: ResaleListing = {
    id: resaleListingId,
    unitId,
    returnRecordId,
    status: "Em Preparação",
    listingTitle: `Oportunidade — ${unitDetails?.unitNumber || "Unidade"} ${unitDetails?.speName || "Empreendimento ARV"}, condições especiais`,
    listingDescription: `Excelente oportunidade de aquisição com precificação abaixo da tabela para a unidade ${unitDetails?.unitNumber || ""} (${unitDetails?.areaM2 || ""}m² - ${unitDetails?.type || "Apartamento"}). Imóvel liberado para comercialização imediata com fluxo facilitado direto pela incorporadora.`,
    shortHeadline: `Oportunidade única: ${unitDetails?.unitNumber || "Unidade"} com ${defaultDiscountPercent}% OFF da tabela`,
    highlightTags: ["Oportunidade", "Abaixo da Tabela", "Distrato", "Condição Especial"],
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    ],
    floorPlanUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    viewsCount: 0,
    leadsGeneratedCount: 0,
  };

  const resalePricing: ResalePricing = {
    id: `prc-${Date.now()}`,
    unitId,
    resaleListingId,
    originalTablePrice,
    resalePrice,
    discountPercentageVsTable: defaultDiscountPercent,
    pricingReason: "Estímulo à Liquidez",
    minimumAcceptablePrice: minimumPrice,
    approvedBy: "Comitê Comercial ARV",
    approvedAt: new Date().toISOString(),
  };

  const defaultConditions: ResalePaymentCondition[] = [
    {
      id: `cnd-${Date.now()}-1`,
      resaleListingId,
      name: "À Vista com Desconto Especial",
      downPaymentPercentage: 100,
      numberOfInstallments: 1,
      indexer: "Sem Correção",
      specialDiscountPercentage: 3,
      allowsFinancing: false,
      description: "Quitação integral no ato da assinatura da escritura ou promessa de compra e venda com bonificação de 3% extra.",
    },
    {
      id: `cnd-${Date.now()}-2`,
      resaleListingId,
      name: "Entrada 20% + 24x Direto com a Incorporadora",
      downPaymentPercentage: 20,
      numberOfInstallments: 24,
      indexer: "CUB",
      allowsFinancing: true,
      description: "20% de entrada no ato + saldo em 24 parcelas mensais corrigidas pelo CUB/SC sem burocracia bancária.",
    },
  ];

  return { returnRecord, resaleListing, resalePricing, defaultConditions };
}

// ============================================================================
// DADOS MOCK INICIAIS
// ============================================================================

export const initialReturnRecords: ReturnRecord[] = [
  {
    id: "ret-t58-302",
    unitId: "unit-t58-3",
    speId: "spe-t58",
    originalContractId: "ctr-t58-03",
    originalInvestorId: "inv-t58-03",
    returnType: "Distrato Amigável",
    returnDate: "2026-06-10",
    originalContractAmount: 329981.6,
    amountRefundedToInvestor: 247486.2,
    retentionPercentage: 25,
    penaltyClauseAmount: 5000,
    legalStatus: "Concluído",
    notes: "Distrato consensual homologado. Investidora optou por realocação em fundo imobiliário de liquidez diária. Unidade 302 em andar alto sem débitos condominiais ou fiscais.",
    documentUrl: "https://arv.com.br/docs/distrato-ctr-t58-03.pdf",
  },
  {
    id: "ret-t58-408",
    unitId: "unit-t58-14",
    speId: "spe-t58",
    originalContractId: "ctr-t58-14",
    originalInvestorId: "inv-t58-14",
    returnType: "Rescisão por Inadimplência",
    returnDate: "2026-07-02",
    originalContractAmount: 315000.0,
    amountRefundedToInvestor: 220500.0,
    retentionPercentage: 30,
    penaltyClauseAmount: 12000,
    legalStatus: "Concluído",
    notes: "Rescisão contratual após 90 dias de inadimplência nas parcelas intermediárias. Notificação extrajudicial enviada e cumprida sem contestação.",
    documentUrl: "https://arv.com.br/docs/rescisao-ctr-t58-14.pdf",
  },
  {
    id: "ret-grid-101",
    unitId: "unit-grid-101",
    speId: "spe-grid",
    originalContractId: "ctr-grid-02",
    originalInvestorId: "inv-t58-05",
    returnType: "Distrato Amigável",
    returnDate: "2026-07-18",
    originalContractAmount: 685000.0,
    amountRefundedToInvestor: 548000.0,
    retentionPercentage: 20,
    penaltyClauseAmount: 0,
    legalStatus: "Concluído",
    notes: "Distrato com retenção de 20% decorrente de reestruturação societária do cotista. Unidade Garden diferenciada com 105m² totais.",
    documentUrl: "https://arv.com.br/docs/distrato-grid-101g.pdf",
  },
  {
    id: "ret-mer-204",
    unitId: "unit-mer-102",
    speId: "spe-meridiem",
    originalContractId: "ctr-mer-temp-01",
    originalInvestorId: "inv-t58-08",
    returnType: "Distrato Judicial",
    returnDate: "2026-05-15",
    originalContractAmount: 720000.0,
    amountRefundedToInvestor: 504000.0,
    retentionPercentage: 30,
    penaltyClauseAmount: 18000,
    legalStatus: "Em Negociação",
    notes: "Acordo em fase de homologação judicial para quitação em 3 parcelas. Unidade com vistoria realizada e aprovada pela engenharia.",
    documentUrl: "https://arv.com.br/docs/acordo-judicial-mer-204.pdf",
  },
];

export const initialResaleListings: ResaleListing[] = [
  {
    id: "rsl-t58-302",
    unitId: "unit-t58-3",
    returnRecordId: "ret-t58-302",
    status: "Publicado",
    listingTitle: "Oportunidade — Studio 302 T58 Spot, 32m², pronto p/ morar na Trindade",
    listingDescription:
      "Excelente oportunidade de repasse no T58 Spot Trindade. Studio com 32m² privativos no 3º pavimento, sol da manhã, sacada gourmet integrada e acabamentos de alto padrão. Localização estratégica a 350m da UFSC com alta demanda para locação estudantil e executiva. Condições exclusivas de parcelamento direto ou financiamento bancário imediato.",
    shortHeadline: "Studio 302 T58 Spot (32m²) — 10.6% OFF com parcelamento direto",
    highlightTags: [
      "Pronto para morar",
      "Condição Especial",
      "Abaixo da Tabela",
      "Distrato",
      "Alta Liquidez",
    ],
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    ],
    floorPlanUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    publishedAt: "2026-06-15T10:00:00Z",
    publishedBy: "Jean Carlos Estipe (Gerência Comercial)",
    expiresAt: "2026-12-31T23:59:59Z",
    viewsCount: 142,
    leadsGeneratedCount: 8,
  },
  {
    id: "rsl-t58-408",
    unitId: "unit-t58-14",
    returnRecordId: "ret-t58-408",
    status: "Reservado",
    listingTitle: "Studio 408 T58 Spot — Andar Alto c/ Vista Livre e Vaga Privativa",
    listingDescription:
      "Unidade de revenda em estágio avançado no T58 Spot. Studio de 30m² no 4º andar com vista perene, piso em porcelanato retificado, espera para ar condicionado split e vaga de garagem privativa. Excelente relação custo x benefício com valor 8.8% abaixo da tabela vigente.",
    shortHeadline: "Studio 408 T58 Spot com Vaga — R$ 342.000 (De R$ 375.000)",
    highlightTags: [
      "Andar Alto",
      "Vaga Coberta",
      "Abaixo da Tabela",
      "Estágio Final de Obras",
    ],
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    ],
    floorPlanUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    publishedAt: "2026-07-05T14:30:00Z",
    publishedBy: "Evelyn Dayane Rodrigues",
    expiresAt: "2026-11-30T23:59:59Z",
    viewsCount: 98,
    leadsGeneratedCount: 5,
  },
  {
    id: "rsl-grid-101",
    unitId: "unit-grid-101",
    returnRecordId: "ret-grid-101",
    status: "Publicado",
    listingTitle: "Studio Garden 101 ARV GRID — 62m² Privativos + Terraço Gourmet",
    listingDescription:
      "Raridade no ARV GRID Trindade: Studio Garden com 42m² internos e 20m² de terraço privativo aberto com espera para spa/ofurô. Fachada contemporânea, infraestrutura completa de lazer no rooftop e automação predial integrada. Valor de oportunidade originado de distrato amigável.",
    shortHeadline: "Garden 101 ARV GRID — 62m² com Terraço Gourmet (-12.5% OFF)",
    highlightTags: [
      "Studio Garden",
      "Terraço Privativo",
      "Lazer Rooftop",
      "Condição Especial",
      "Distrato",
    ],
    photos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ],
    floorPlanUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    publishedAt: "2026-07-20T09:15:00Z",
    publishedBy: "Diretoria Comercial ARV",
    expiresAt: "2026-12-31T23:59:59Z",
    viewsCount: 215,
    leadsGeneratedCount: 12,
  },
  {
    id: "rsl-mer-204",
    unitId: "unit-mer-102",
    returnRecordId: "ret-mer-204",
    status: "Em Preparação",
    listingTitle: "Apto 204 ARV MERIDIEM — 1 Suíte + 1 Quarto c/ Sol da Tarde",
    listingDescription:
      "Unidade residencial no Meridiem (Saco dos Limões). Planta com 62m² privativos, 1 suíte, 1 dormitório, churrasqueira a carvão e 1 vaga coberta. Anúncio em preparação com precificação de liquidez rápida.",
    shortHeadline: "Meridiem 204 (62m²) — 1 Suíte + 1 Quarto em preparação",
    highlightTags: ["Em Preparação", "1 Suíte + 1 Quarto", "Recuperação de Caixa"],
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    ],
    viewsCount: 12,
    leadsGeneratedCount: 0,
  },
];

export const initialResalePricing: ResalePricing[] = [
  {
    id: "prc-t58-302",
    unitId: "unit-t58-3",
    resaleListingId: "rsl-t58-302",
    originalTablePrice: 380000,
    resalePrice: 339500,
    discountPercentageVsTable: 10.66,
    pricingReason: "Estímulo à Liquidez",
    minimumAcceptablePrice: 320000,
    approvedBy: "Jean Carlos Estipe",
    approvedAt: "2026-06-12T15:00:00Z",
  },
  {
    id: "prc-t58-408",
    unitId: "unit-t58-14",
    resaleListingId: "rsl-t58-408",
    originalTablePrice: 375000,
    resalePrice: 342000,
    discountPercentageVsTable: 8.8,
    pricingReason: "Recuperação Rápida de Caixa",
    minimumAcceptablePrice: 330000,
    approvedBy: "Diretoria Comercial ARV",
    approvedAt: "2026-07-04T11:20:00Z",
  },
  {
    id: "prc-grid-101",
    unitId: "unit-grid-101",
    resaleListingId: "rsl-grid-101",
    originalTablePrice: 760000,
    resalePrice: 665000,
    discountPercentageVsTable: 12.5,
    pricingReason: "Alinhamento a Mercado",
    minimumAcceptablePrice: 640000,
    approvedBy: "Comitê de Investimentos ARV",
    approvedAt: "2026-07-19T16:45:00Z",
  },
  {
    id: "prc-mer-204",
    unitId: "unit-mer-102",
    resaleListingId: "rsl-mer-204",
    originalTablePrice: 720000,
    resalePrice: 648000,
    discountPercentageVsTable: 10.0,
    pricingReason: "Recuperação Rápida de Caixa",
    minimumAcceptablePrice: 620000,
    approvedBy: "Comitê Comercial ARV",
    approvedAt: "2026-05-18T10:00:00Z",
  },
];

export const initialResalePaymentConditions: ResalePaymentCondition[] = [
  // Condições para T58 Spot - Studio 302
  {
    id: "cnd-t58-302-1",
    resaleListingId: "rsl-t58-302",
    name: "À Vista com 12% de Desconto Total",
    downPaymentPercentage: 100,
    numberOfInstallments: 1,
    indexer: "Sem Correção",
    specialDiscountPercentage: 3.5,
    allowsFinancing: false,
    description: "Pagamento em parcela única com desconto comercial acumulado máximo de 14.16% frente à tabela original.",
  },
  {
    id: "cnd-t58-302-2",
    resaleListingId: "rsl-t58-302",
    name: "Entrada Facilitada 20% + Saldo em 24x Direto",
    downPaymentPercentage: 20,
    numberOfInstallments: 24,
    indexer: "CUB",
    allowsFinancing: true,
    description: "Sinal de R$ 67.900 + 24 parcelas mensais corrigidas pelo CUB/SC Sinduscon sem comprovação bancária complexa.",
  },
  {
    id: "cnd-t58-302-3",
    resaleListingId: "rsl-t58-302",
    name: "Repasse com Financiamento Bancário (30% Entrada + 70% SFH)",
    downPaymentPercentage: 30,
    numberOfInstallments: 1,
    indexer: "IPCA",
    allowsFinancing: true,
    description: "Entrada no ato com financiamento bancário imediato pela Caixa / Itaú / Santander pós-habite-se.",
  },

  // Condições para T58 Spot - Studio 408
  {
    id: "cnd-t58-408-1",
    resaleListingId: "rsl-t58-408",
    name: "Entrada 25% + 18x Fixas Sem Juros",
    downPaymentPercentage: 25,
    numberOfInstallments: 18,
    indexer: "Sem Correção",
    specialDiscountPercentage: 0,
    allowsFinancing: false,
    description: "25% de sinal e saldo parcelado em 18 meses com parcelas fixas pré-fixadas.",
  },
  {
    id: "cnd-t58-408-2",
    resaleListingId: "rsl-t58-408",
    name: "Plano Investidor: 50% Entrada + Saldo na Entrega de Chaves",
    downPaymentPercentage: 50,
    numberOfInstallments: 2,
    indexer: "CUB",
    allowsFinancing: true,
    description: "50% de aporte inicial e saldo de 50% na quitação / entrega das chaves da SPE T58 Spot.",
  },

  // Condições para ARV GRID - Studio Garden 101
  {
    id: "cnd-grid-101-1",
    resaleListingId: "rsl-grid-101",
    name: "Quitação À Vista Especial Investidor Seed",
    downPaymentPercentage: 100,
    numberOfInstallments: 1,
    indexer: "Sem Correção",
    specialDiscountPercentage: 4.0,
    allowsFinancing: false,
    description: "Desconto especial para pagamento à vista: valor final de R$ 638.400.",
  },
  {
    id: "cnd-grid-101-2",
    resaleListingId: "rsl-grid-101",
    name: "Entrada 15% + 36x Mensais + 3 Balões Anuais",
    downPaymentPercentage: 15,
    numberOfInstallments: 36,
    indexer: "CUB",
    allowsFinancing: true,
    description: "Fluxo sob medida com 15% de entrada, 36 mensais e 3 reforços anuais corrigidos pelo CUB/SC.",
  },
];

export const initialResaleLeads: ResaleLead[] = [
  {
    id: "rsl-lead-01",
    resaleListingId: "rsl-t58-302",
    name: "Dr. Gustavo Ramos Silveira",
    email: "dr.gustavoramos@cardiofloripa.med.br",
    phone: "(48) 99182-3344",
    message: "Tenho interesse no Studio 302 do T58 Spot. Gostaria de saber se aceitam proposta com 30% de entrada e o restante financiado direto.",
    source: "Vitrine Interna",
    createdAt: "2026-07-25T14:20:00Z",
    status: "Proposta Enviada",
  },
  {
    id: "rsl-lead-02",
    resaleListingId: "rsl-t58-302",
    name: "Patrícia Helena Valgas",
    email: "patricia.valgas@techsc.com.br",
    phone: "(48) 99876-1122",
    message: "Olá! Trabalho no centro e procuro studio na Trindade para investimento em Airbnb. Podem me enviar a lâmina comercial?",
    source: "Site Público",
    createdAt: "2026-07-28T09:40:00Z",
    status: "Em Atendimento",
  },
  {
    id: "rsl-lead-03",
    resaleListingId: "rsl-grid-101",
    name: "Eng. Renato Alencar Furtado",
    email: "renato.furtado@alencarconstrucoes.com.br",
    phone: "(48) 99911-5500",
    message: "Vi o Garden 101 no ARV GRID com desconto. Qual o valor mínimo para pagamento 100% à vista via transferência imediata?",
    source: "Indicação",
    createdAt: "2026-07-26T16:15:00Z",
    status: "Novo",
  },
  {
    id: "rsl-lead-04",
    resaleListingId: "rsl-t58-408",
    name: "Marcos Vinicius de Souza",
    email: "mvinicius@investimentosbr.com",
    phone: "(48) 99122-8899",
    message: "Estou fechando a reserva do Studio 408 com a corretora Evelyn. Documentos enviados.",
    source: "Vitrine Interna",
    createdAt: "2026-07-20T11:00:00Z",
    status: "Convertido",
  },
];
