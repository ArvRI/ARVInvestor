import {
  Investor,
  SPE,
  Development,
  Unit,
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
  ScoreBreakdown,
  InvestorTier,
  MarketingLead,
  CustomerOnboardingProgress,
  SmartNewsletter,
} from "../types";

// Helper to compute score breakdown dynamically
export function calculateScoreBreakdown(
  totalInvested: number,
  numInvestments: number,
  assembliesAttended: number,
  portalAccessCount: number,
  yearsAsClient: number,
  satisfaction: number,
  reinvestments: number,
  referrals: number
): ScoreBreakdown {
  // Volume (max 20)
  const volume = Math.min(20, Math.round((totalInvested / 5000000) * 20));
  // Num Investments (max 15)
  const numInv = Math.min(15, numInvestments * 3);
  // Assembly Attendance (max 15)
  const assAtt = Math.min(15, assembliesAttended * 3);
  // Portal Access (max 10)
  const pAcc = Math.min(10, Math.round((portalAccessCount / 20) * 10));
  // Client Tenure (max 10)
  const cTen = Math.min(10, yearsAsClient * 2);
  // Satisfaction (max 10)
  const sat = Math.min(10, Math.round((satisfaction / 10) * 10));
  // Reinvestments (max 10)
  const reInv = Math.min(10, reinvestments * 5);
  // Referrals (max 10)
  const ref = Math.min(10, referrals * 2.5);

  const totalScore = Math.min(
    100,
    volume + numInv + assAtt + pAcc + cTen + sat + reInv + ref
  );

  let tier: InvestorTier = "Bronze";
  if (totalScore >= 88) tier = "Platinum";
  else if (totalScore >= 75) tier = "Gold";
  else if (totalScore >= 60) tier = "Silver";
  else if (totalScore >= 45) tier = "Bronze";
  else tier = "Risco";

  return {
    volume,
    numInvestments: numInv,
    assemblyAttendance: assAtt,
    portalAccess: pAcc,
    clientTenure: cTen,
    satisfaction: sat,
    reinvestments: reInv,
    referrals: ref,
    totalScore,
    tier,
  };
}

// 5 SPEs (Empreendimentos)
export const initialSPEs: SPE[] = [
  {
    id: "spe-01",
    name: "SPE ARV Horizon Residence",
    cnpj: "42.189.302/0001-81",
    address: "Av. Beira Mar, 1050 - Meireles",
    city: "Fortaleza - CE",
    manager: "Eng. Ricardo Alencar",
    status: "Em Obras",
    deadline: "2027-06-30",
    totalVgv: 85000000,
    totalCaptação: 62000000,
    percentSold: 88,
    progressPercentage: 64,
    description: "Torre residencial de altíssimo padrão com vista mar de 360°, heliponto e automação total.",
    bannerImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    mapCoordinates: "-3.7275,-38.4981",
  },
  {
    id: "spe-02",
    name: "SPE ARV Vista Parque",
    cnpj: "43.981.112/0001-09",
    address: "Rua Dep. Moreira da Rocha, 440 - Aldeota",
    city: "Fortaleza - CE",
    manager: "Eng. Mariana Siqueira",
    status: "Em Obras",
    deadline: "2026-12-15",
    totalVgv: 58000000,
    totalCaptação: 48000000,
    percentSold: 92,
    progressPercentage: 82,
    description: "Complexo residencial urbano integrado ao Parque Cocó, focado em sustentabilidade e energia solar.",
    bannerImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    mapCoordinates: "-3.7380,-38.5020",
  },
  {
    id: "spe-03",
    name: "SPE ARV Corporate Tower",
    cnpj: "44.512.980/0001-44",
    address: "Av. Santos Dumont, 2800 - Dionísio Torres",
    city: "Fortaleza - CE",
    manager: "Eng. Fernando Rocha",
    status: "Em Captação",
    deadline: "2028-03-31",
    totalVgv: 120000000,
    totalCaptação: 45000000,
    percentSold: 45,
    progressPercentage: 22,
    description: "Hub corporativo triple A certificado LEED Gold com centro de convenções e heliponto.",
    bannerImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    mapCoordinates: "-3.7420,-38.5080",
  },
  {
    id: "spe-04",
    name: "SPE ARV Grand Bay Resort",
    cnpj: "45.109.823/0001-12",
    address: "Av. Caminho do Sol, s/n - Porto das Dunas",
    city: "Aquiraz - CE",
    manager: "Eng. Juliana Mendes",
    status: "Planejamento",
    deadline: "2028-11-30",
    totalVgv: 140000000,
    totalCaptação: 32000000,
    percentSold: 30,
    progressPercentage: 10,
    description: "Resort residencial pé na areia com parque aquático privativo e operadora hoteleira internacional.",
    bannerImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    mapCoordinates: "-3.8340,-38.3900",
  },
  {
    id: "spe-05",
    name: "SPE ARV Eco Residence",
    cnpj: "46.220.198/0001-77",
    address: "Rua Professor Dias da Rocha, 1200 - Meireles",
    city: "Fortaleza - CE",
    manager: "Eng. Paulo Varejão",
    status: "Concluído",
    deadline: "2025-08-30",
    totalVgv: 42000000,
    totalCaptação: 42000000,
    percentSold: 100,
    progressPercentage: 100,
    description: "Empreendimento eco-friendly entregue antes do prazo com 100% dos dividendos distribuídos aos cotistas.",
    bannerImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    mapCoordinates: "-3.7310,-38.4950",
  },
];

// 12 Developments (Empreendimentos)
export const initialDevelopments: Development[] = [
  { id: "dev-01", speId: "spe-01", name: "Horizon Tower A - Sky Suites", type: "Residencial Premium", totalUnits: 40, unitsAvailable: 4, address: "Av. Beira Mar, 1050", coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80", description: "Apartamentos de 280m² com piscina privativa na varanda." },
  { id: "dev-02", speId: "spe-01", name: "Horizon Tower B - Ocean View", type: "Residencial Premium", totalUnits: 40, unitsAvailable: 6, address: "Av. Beira Mar, 1050", coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80", description: "Suítes master com closet duplo e varanda gourmet integrada." },
  { id: "dev-03", speId: "spe-02", name: "Vista Parque bloco Ipê", type: "Residencial Premium", totalUnits: 32, unitsAvailable: 2, address: "Rua Dep. Moreira da Rocha, 440", coverImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80", description: "Unidades com vista livre e perpétua para o Parque Cocó." },
  { id: "dev-04", speId: "spe-02", name: "Vista Parque bloco Jacarandá", type: "Residencial Premium", totalUnits: 32, unitsAvailable: 3, address: "Rua Dep. Moreira da Rocha, 440", coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80", description: "Planta flexível de 140m² a 190m² com isolamento acústico especial." },
  { id: "dev-05", speId: "spe-03", name: "Corporate Tower - Salas Executive", type: "Comercial Corporate", totalUnits: 120, unitsAvailable: 60, address: "Av. Santos Dumont, 2800", coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80", description: "Salas de 45m² a 500m² com certificação ambiental internacional." },
  { id: "dev-06", speId: "spe-03", name: "Corporate Tower - Lajes Corporativas", type: "Comercial Corporate", totalUnits: 15, unitsAvailable: 8, address: "Av. Santos Dumont, 2800", coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80", description: "Lajes inteiras de 900m² privativos com gerador 100% de emergência." },
  { id: "dev-07", speId: "spe-04", name: "Grand Bay Villas - Pé na Areia", type: "Residencial Premium", totalUnits: 20, unitsAvailable: 14, address: "Porto das Dunas", coverImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80", description: "Casas duplex com rooftop panorâmico e serviço de conciergerie." },
  { id: "dev-08", speId: "spe-04", name: "Grand Bay Suites - Pool Houses", type: "Residencial Premium", totalUnits: 60, unitsAvailable: 42, address: "Porto das Dunas", coverImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80", description: "Apartamentos com piscina privativa na varanda e rentabilidade em pool." },
  { id: "dev-09", speId: "spe-05", name: "Eco Residence Bloco A", type: "Residencial Premium", totalUnits: 24, unitsAvailable: 0, address: "Rua Prof. Dias da Rocha, 1200", coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80", description: "Entregue e habitado com usina solar de geração própria." },
  { id: "dev-10", speId: "spe-05", name: "Eco Residence Bloco B", type: "Residencial Premium", totalUnits: 24, unitsAvailable: 0, address: "Rua Prof. Dias da Rocha, 1200", coverImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80", description: "100% quitado e distribuindo dividendos contínuos aos investidores." },
  { id: "dev-11", speId: "spe-01", name: "Horizon Penthouses Duplex", type: "Residencial Premium", totalUnits: 4, unitsAvailable: 1, address: "Av. Beira Mar, 1050", coverImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80", description: "Penthouses cinematográficas de 560m² com adega subterrânea privativa." },
  { id: "dev-12", speId: "spe-03", name: "Corporate Hub Gastronômico", type: "Misto Multi-Family", totalUnits: 10, unitsAvailable: 3, address: "Av. Santos Dumont, 2800", coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80", description: "Lojas comerciais térreas destinadas a restaurantes de alta gastronomia." },
];

// Generate 30 realistic investors
const investorRawData = [
  { name: "Dr. Roberto Silveira", cpf: "189.402.118-09", city: "Fortaleza - CE", prof: "Médico Cirurgião", cons: "Camila Vasconcelos", inv: 4500000, nInv: 4, ass: 5, acc: 32, yrs: 6, sat: 10, reInv: 2, ref: 4 },
  { name: "Dra. Patrícia Alencar", cpf: "290.119.488-22", city: "Fortaleza - CE", prof: "Advogada Tributarista", cons: "Camila Vasconcelos", inv: 3200000, nInv: 3, ass: 4, acc: 28, yrs: 4, sat: 9, reInv: 1, ref: 3 },
  { name: "Eng. Carlos Eduardo Prado", cpf: "091.229.301-44", city: "São Paulo - SP", prof: "Empresário de Tecnologia", cons: "Gabriel Fontes", inv: 6800000, nInv: 5, ass: 6, acc: 45, yrs: 7, sat: 10, reInv: 3, ref: 5 },
  { name: "Fernanda Gondim Matos", cpf: "389.201.882-10", city: "Fortaleza - CE", prof: "Arquiteta e Urbanista", cons: "Mariana Barreto", inv: 1800000, nInv: 2, ass: 2, acc: 18, yrs: 3, sat: 8, reInv: 1, ref: 2 },
  { name: "Marcelo Henrique Bastos", cpf: "482.109.301-99", city: "Recife - PE", prof: "Investidor de Capital de Risco", cons: "Gabriel Fontes", inv: 8500000, nInv: 6, ass: 8, acc: 50, yrs: 8, sat: 10, reInv: 4, ref: 6 },
  { name: "Juliana Benevides Lins", cpf: "109.823.109-00", city: "Fortaleza - CE", prof: "Dermatologista", cons: "Camila Vasconcelos", inv: 2400000, nInv: 2, ass: 3, acc: 22, yrs: 3, sat: 9, reInv: 1, ref: 1 },
  { name: "Dr. Paulo Vítor Holanda", cpf: "582.109.482-33", city: "Brasília - DF", prof: "Juiz Federal", cons: "Gabriel Fontes", inv: 3900000, nInv: 3, ass: 4, acc: 30, yrs: 5, sat: 9, reInv: 2, ref: 2 },
  { name: "Renata Bezerra de Menezes", cpf: "291.002.812-77", city: "Fortaleza - CE", prof: "Empresária Têxtil", cons: "Mariana Barreto", inv: 1200000, nInv: 1, ass: 1, acc: 10, yrs: 2, sat: 7, reInv: 0, ref: 1 },
  { name: "Geraldo Majela Nogueira", cpf: "019.283.491-55", city: "Sobral - CE", prof: "Produtor Agrícola", cons: "Gabriel Fontes", inv: 5200000, nInv: 4, ass: 5, acc: 25, yrs: 5, sat: 9, reInv: 2, ref: 3 },
  { name: "Beatriz Queiroz Fontenele", cpf: "391.029.182-88", city: "Fortaleza - CE", prof: "Odontologista", cons: "Camila Vasconcelos", inv: 1500000, nInv: 1, ass: 2, acc: 14, yrs: 2, sat: 8, reInv: 0, ref: 1 },
  { name: "Thiago Sampaio Diniz", cpf: "820.192.381-11", city: "Rio de Janeiro - RJ", prof: "Fund Manager", cons: "Gabriel Fontes", inv: 9200000, nInv: 7, ass: 7, acc: 60, yrs: 6, sat: 10, reInv: 4, ref: 8 },
  { name: "Aline Linhares Aguiar", cpf: "192.839.102-44", city: "Fortaleza - CE", prof: "Economista", cons: "Mariana Barreto", inv: 2100000, nInv: 2, ass: 3, acc: 19, yrs: 3, sat: 8, reInv: 1, ref: 1 },
  { name: "Dr. Fernando Burlamaqui", cpf: "482.910.283-00", city: "Fortaleza - CE", prof: "Cardiologista", cons: "Camila Vasconcelos", inv: 4100000, nInv: 3, ass: 4, acc: 29, yrs: 4, sat: 9, reInv: 2, ref: 3 },
  { name: "Isabela Magalhães Pessoa", cpf: "391.028.391-22", city: "Salvador - BA", prof: "Empresária de Varejo", cons: "Mariana Barreto", inv: 2900000, nInv: 2, ass: 2, acc: 16, yrs: 3, sat: 8, reInv: 1, ref: 2 },
  { name: "Luciano Camelo Maia", cpf: "019.283.019-33", city: "Fortaleza - CE", prof: "Engenheiro Civil", cons: "Gabriel Fontes", inv: 1100000, nInv: 1, ass: 0, acc: 5, yrs: 1, sat: 6, reInv: 0, ref: 0 },
  { name: "Monique Furtado Chaves", cpf: "829.102.938-55", city: "Fortaleza - CE", prof: "Notária e Registradora", cons: "Camila Vasconcelos", inv: 3700000, nInv: 3, ass: 3, acc: 24, yrs: 4, sat: 9, reInv: 1, ref: 2 },
  { name: "Sérgio Murilo Pinheiro", cpf: "291.029.381-66", city: "Manaus - AM", prof: "Comerciante Atacadista", cons: "Gabriel Fontes", inv: 4800000, nInv: 4, ass: 4, acc: 22, yrs: 5, sat: 8, reInv: 2, ref: 2 },
  { name: "Cláudia Valéria Rios", cpf: "102.938.401-77", city: "Fortaleza - CE", prof: "Professora Universitária", cons: "Mariana Barreto", inv: 950000, nInv: 1, ass: 1, acc: 8, yrs: 1, sat: 7, reInv: 0, ref: 0 },
  { name: "Eduardo Farias Nogueira", cpf: "492.019.283-88", city: "Belo Horizonte - MG", prof: "Consultor de Negócios", cons: "Gabriel Fontes", inv: 3100000, nInv: 2, ass: 3, acc: 21, yrs: 3, sat: 9, reInv: 1, ref: 2 },
  { name: "Karla Simone Targino", cpf: "391.029.382-99", city: "Fortaleza - CE", prof: "Farmacêutica Industrial", cons: "Mariana Barreto", inv: 1600000, nInv: 1, ass: 2, acc: 15, yrs: 2, sat: 8, reInv: 0, ref: 1 },
  { name: "Gustavo Henrique Prado", cpf: "019.283.910-11", city: "Campinas - SP", prof: "Engenheiro de Software", cons: "Gabriel Fontes", inv: 2300000, nInv: 2, ass: 2, acc: 35, yrs: 2, sat: 9, reInv: 1, ref: 2 },
  { name: "Fabiana Parente Salles", cpf: "291.029.381-22", city: "Fortaleza - CE", prof: "Psiquiatra", cons: "Camila Vasconcelos", inv: 2800000, nInv: 2, ass: 3, acc: 20, yrs: 3, sat: 9, reInv: 1, ref: 1 },
  { name: "Alexandre Viana Barreto", cpf: "391.029.481-33", city: "Natal - RN", prof: "Hoteleiro", cons: "Gabriel Fontes", inv: 5900000, nInv: 4, ass: 5, acc: 31, yrs: 6, sat: 10, reInv: 2, ref: 4 },
  { name: "Vanessa Lemos Cordeiro", cpf: "491.029.381-44", city: "Fortaleza - CE", prof: "Contadora Sênior", cons: "Mariana Barreto", inv: 1300000, nInv: 1, ass: 1, acc: 12, yrs: 2, sat: 8, reInv: 0, ref: 1 },
  { name: "Breno Maciel de Oliveira", cpf: "019.283.918-55", city: "Fortaleza - CE", prof: "Empresário Logístico", cons: "Camila Vasconcelos", inv: 3400000, nInv: 3, ass: 3, acc: 26, yrs: 4, sat: 9, reInv: 1, ref: 2 },
  { name: "Débora Maria Castelo", cpf: "291.029.381-66", city: "Teresina - PI", prof: "Oftalmologista", cons: "Gabriel Fontes", inv: 2600000, nInv: 2, ass: 2, acc: 17, yrs: 3, sat: 8, reInv: 1, ref: 1 },
  { name: "Leonardo Albuquerque Silva", cpf: "391.029.481-77", city: "Fortaleza - CE", prof: "Piloto Comercial", cons: "Mariana Barreto", inv: 1700000, nInv: 1, ass: 1, acc: 11, yrs: 2, sat: 7, reInv: 0, ref: 0 },
  { name: "Raquel Dantas Guimarães", cpf: "491.029.381-88", city: "Curitiba - PR", prof: "Designer de Interiores", cons: "Gabriel Fontes", inv: 2000000, nInv: 2, ass: 2, acc: 23, yrs: 2, sat: 9, reInv: 1, ref: 1 },
  { name: "Vicente de Paulo Sobrinho", cpf: "019.283.918-99", city: "Juazeiro do Norte - CE", prof: "Industrial", cons: "Gabriel Fontes", inv: 7100000, nInv: 5, ass: 6, acc: 42, yrs: 7, sat: 10, reInv: 3, ref: 5 },
  { name: "Giselle Cavalcante Ramos", cpf: "291.029.381-00", city: "Fortaleza - CE", prof: "Publicitária", cons: "Camila Vasconcelos", inv: 800000, nInv: 1, ass: 0, acc: 4, yrs: 1, sat: 5, reInv: 0, ref: 0 },
];

export const initialInvestors: Investor[] = investorRawData.map((raw, idx) => {
  const id = `inv-${(idx + 1).toString().padStart(2, "0")}`;
  const breakdown = calculateScoreBreakdown(
    raw.inv,
    raw.nInv,
    raw.ass,
    raw.acc,
    raw.yrs,
    raw.sat,
    raw.reInv,
    raw.ref
  );

  let npsCategory: "Promotor" | "Neutro" | "Detrator" = "Promotor";
  if (raw.sat <= 6) npsCategory = "Detrator";
  else if (raw.sat <= 8) npsCategory = "Neutro";

  return {
    id,
    name: raw.name,
    cpfCnpj: raw.cpf,
    phone: `(85) 99${Math.floor(1000000 + Math.random() * 8999999)}`,
    whatsapp: `(85) 99${Math.floor(1000000 + Math.random() * 8999999)}`,
    email: raw.name.toLowerCase().replace(/[^a-z]/g, "") + "@investidorarv.com.br",
    address: `Rua das Orquídeas, ${100 + idx * 12}`,
    city: raw.city,
    state: raw.city.includes("-") ? raw.city.split("-")[1].trim() : "CE",
    profession: raw.prof,
    createdAt: `202${Math.max(0, 6 - raw.yrs)}-03-15`,
    consultant: raw.cons,
    notes: `Investidor com perfil conservador-moderado. Prefere recebimento trimestral de dividendos com foco no VGV das SPEs de Meireles e Aldeota.`,
    score: breakdown.totalScore,
    tier: breakdown.tier,
    scoreBreakdown: breakdown,
    satisfactionScore: raw.sat,
    npsCategory,
    active: true,
    avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
  };
});

// Generate 120 Contracts linking Investors to SPEs & Developments
export const initialContracts: Contract[] = [];
let contractCount = 0;

initialInvestors.forEach((inv, invIdx) => {
  const numContractsForThisInv = Math.min(
    4,
    Math.max(1, Math.floor(inv.scoreBreakdown.numInvestments / 3) + 1)
  );

  for (let c = 0; c < numContractsForThisInv; c++) {
    contractCount++;
    const speIndex = (invIdx + c) % initialSPEs.length;
    const spe = initialSPEs[speIndex];
    const dev = initialDevelopments.find((d) => d.speId === spe.id) || initialDevelopments[0];
    const contractNum = `CTR-202${4 + (c % 3)}-${contractCount.toString().padStart(3, "0")}`;
    const amount = Math.round((inv.scoreBreakdown.volume * 200000 + (c + 1) * 350000) / 10000) * 10000;

    initialContracts.push({
      id: `ctr-${contractCount}`,
      investorId: inv.id,
      speId: spe.id,
      developmentId: dev.id,
      unitId: `unit-${dev.id}-${c + 1}`,
      contractNumber: contractNum,
      purchaseDate: `202${3 + (c % 3)}-0${1 + (c % 8)}-10`,
      investedAmount: amount,
      speSharePercentage: Number(((amount / spe.totalCaptação) * 100).toFixed(2)),
      expectedRoiPercentage: 18.5 + (c % 4) * 2.1,
      status: spe.status === "Concluído" ? "Concluído" : "Ativo",
      documentUrl: `#`,
    });
  }
});

// Construction Timelines with stages
export const initialConstructionProgresses: ConstructionProgress[] = [
  {
    id: "prog-01",
    speId: "spe-01",
    overallPercentage: 64,
    lastUpdateDate: "2026-07-20",
    description: "Concretagem da laje do 22º pavimento concluída com sucesso. Instalação de tubulações elétricas e hidráulicas nos andares inferiores em ritmo acelerado.",
    photos: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    ],
    videos: [
      "https://www.w3schools.com/html/mov_bbb.mp4",
    ],
    droneUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
    reportUrl: "#",
    stages: [
      { stage: "Fundação", percentage: 100, targetDate: "2025-01-15", status: "Concluído" },
      { stage: "Estrutura", percentage: 85, targetDate: "2026-09-30", status: "Em Andamento" },
      { stage: "Alvenaria", percentage: 60, targetDate: "2026-12-15", status: "Em Andamento" },
      { stage: "Cobertura", percentage: 30, targetDate: "2027-02-28", status: "Em Andamento" },
      { stage: "Acabamentos", percentage: 15, targetDate: "2027-04-30", status: "Em Andamento" },
      { stage: "Entrega", percentage: 0, targetDate: "2027-06-30", status: "A Iniciar" },
    ],
  },
  {
    id: "prog-02",
    speId: "spe-02",
    overallPercentage: 82,
    lastUpdateDate: "2026-07-18",
    description: "Fase final de revestimentos cerâmicos externos e instalação de caixilharia de alumínio importada.",
    photos: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    ],
    videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    droneUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
    reportUrl: "#",
    stages: [
      { stage: "Fundação", percentage: 100, targetDate: "2024-11-10", status: "Concluído" },
      { stage: "Estrutura", percentage: 100, targetDate: "2025-08-20", status: "Concluído" },
      { stage: "Alvenaria", percentage: 100, targetDate: "2026-01-15", status: "Concluído" },
      { stage: "Cobertura", percentage: 95, targetDate: "2026-08-30", status: "Em Andamento" },
      { stage: "Acabamentos", percentage: 60, targetDate: "2026-10-31", status: "Em Andamento" },
      { stage: "Entrega", percentage: 0, targetDate: "2026-12-15", status: "A Iniciar" },
    ],
  },
];

// Payments / Dividends
export const initialPayments: Payment[] = [
  { id: "pay-01", investorId: "inv-01", contractId: "ctr-1", speId: "spe-01", type: "Aporte Inicial", amount: 1500000, dueDate: "2024-03-10", paidDate: "2024-03-08", status: "Pago" },
  { id: "pay-02", investorId: "inv-01", contractId: "ctr-1", speId: "spe-01", type: "Dividendo Trimestral", amount: 124500, dueDate: "2026-06-30", paidDate: "2026-06-30", status: "Pago" },
  { id: "pay-03", investorId: "inv-01", contractId: "ctr-1", speId: "spe-01", type: "Dividendo Trimestral", amount: 138000, dueDate: "2026-09-30", status: "Pendente" },
  { id: "pay-04", investorId: "inv-03", contractId: "ctr-3", speId: "spe-03", type: "Aporte Inicial", amount: 2500000, dueDate: "2025-02-15", paidDate: "2025-02-12", status: "Pago" },
  { id: "pay-05", investorId: "inv-05", contractId: "ctr-5", speId: "spe-02", type: "Dividendo Trimestral", amount: 195000, dueDate: "2026-06-30", paidDate: "2026-06-29", status: "Pago" },
];

// Timeline interactions (Emails, WhatsApp, Meetings, Calls)
export const initialTimelineInteractions: TimelineInteraction[] = [
  { id: "int-01", investorId: "inv-01", type: "Reunião", date: "2026-07-15", author: "Camila Vasconcelos", title: "Apresentação do Relatório de Obra T2-2026", notes: "Investidor externou grande satisfação com o avanço da estrutura do Horizon Tower A. Demonstrou interesse em aportar R$ 2M no novo lançamento SPE Grand Bay.", status: "Concluído" },
  { id: "int-02", investorId: "inv-01", type: "WhatsApp", date: "2026-07-02", author: "Camila Vasconcelos", title: "Envio de comprovante de distribuição de dividendos", notes: "Comprovante enviado com sucesso. Cliente respondeu confirmando o recebimento.", status: "Concluído" },
  { id: "int-03", investorId: "inv-03", type: "Visita", date: "2026-06-28", author: "Gabriel Fontes", title: "Visita técnica guiada ao canteiro de obras com Engenheiro Chefe", notes: "Visita realizada com uso de EPIs. Cliente registrou fotos e parabenizou a organização da obra.", status: "Concluído" },
  { id: "int-04", investorId: "inv-08", type: "Telefone", date: "2026-05-10", author: "Mariana Barreto", title: "Contato de alinhamento pós-assembleia", notes: "Cliente não pode comparecer à última assembleia, mas aprovou a ata via portal.", status: "Concluído" },
];

// 100 Documents generated across SPEs and Investors
export const initialDocuments: DocumentItem[] = Array.from({ length: 100 }).map((_, i) => {
  const spe = initialSPEs[i % initialSPEs.length];
  const categories: DocumentItem["category"][] = [
    "Contrato", "Aditivo", "Prestação de Contas", "Ata", "Licença", "Relatório", "Boletim", "Projeto", "Matrícula"
  ];
  const category = categories[i % categories.length];

  return {
    id: `doc-${i + 1}`,
    title: `${category} - ${spe.name} - Q${(i % 4) + 1}/202${5 + (i % 2)}`,
    category,
    speId: spe.id,
    investorId: initialInvestors[i % initialInvestors.length].id,
    uploadDate: `202${5 + (i % 2)}-0${(i % 9) + 1}-15`,
    fileSize: `${(2.4 + (i % 8) * 1.1).toFixed(1)} MB`,
    fileUrl: "#",
  };
});

// 30 Supplier Contracts (Fornecedores)
export const initialSuppliers: SupplierContract[] = Array.from({ length: 30 }).map((_, i) => {
  const spe = initialSPEs[i % initialSPEs.length];
  const supplierNames = [
    "Gerdau Aços do Brasil S.A.", "Votorantim Cimentos", "Schindler Elevadores", "Deca Metais & Louças",
    "Atlas Schindler", "Alcoa Alumínios", "Tigre Tubos e Conexões", "Saint-Gobain Weber",
    "Suvinil Tintas Industriais", "Enel Distribuição Ceará", "Cagece Engenharia", "Fundações Teixeira Ltda"
  ];
  const categories = ["Aço & Estruturas", "Cimento & Concreto", "Elevadores", "Esquadrias de Alumínio", "Hidráulica & Elétrica", "Fundações Profundas"];

  return {
    id: `sup-${i + 1}`,
    speId: spe.id,
    supplierName: supplierNames[i % supplierNames.length],
    serviceCategory: categories[i % categories.length],
    amount: (150 + i * 45) * 10000,
    startDate: `2024-0${(i % 8) + 1}-01`,
    endDate: `2027-0${(i % 8) + 1}-01`,
    status: i % 10 === 0 ? "Em Homologação" : "Ativo",
    contractUrl: "#",
  };
});

// Assemblies (Assembleias de Investidores)
export const initialAssemblies: Assembly[] = [
  {
    id: "ass-01",
    speId: "spe-01",
    title: "Assembleia Geral Ordinária T2-2026 - SPE ARV Horizon",
    date: "2026-08-15",
    time: "19:00",
    location: "Auditório ARV Corporate - Av. Santos Dumont, 2800 - 15º Andar",
    virtualLink: "https://meet.google.com/arv-horizon-2026",
    status: "Agendada",
    description: "Apresentação da prestação de contas do primeiro semestre de 2026, deliberação sobre o fluxo de caixa suplementar e cronograma de acabamentos.",
    rsvpStatus: {
      "inv-01": "Confirmado",
      "inv-02": "Confirmado",
      "inv-03": "Pendente",
    },
    minutesDocumentUrl: "#",
  },
  {
    id: "ass-02",
    speId: "spe-02",
    title: "Assembleia Extraordinária de Prestação de Contas - SPE Vista Parque",
    date: "2026-05-20",
    time: "18:30",
    location: "Online via Google Meet",
    virtualLink: "https://meet.google.com/arv-vistaparque",
    status: "Realizada",
    description: "Aprovação unânime do relatório financeiro anual e homologação da fornecedora de fachadas aeradas.",
    rsvpStatus: {
      "inv-01": "Confirmado",
      "inv-05": "Confirmado",
    },
    minutesDocumentUrl: "#",
  },
];

// Communication Campaigns (Mailchimp style)
export const initialCampaigns: CommunicationCampaign[] = [
  {
    id: "camp-01",
    title: "Informativo Mensal de Obras - Julho 2026",
    type: "Newsletter",
    speId: "spe-01",
    targetSegment: "Investidores Platinum & Gold",
    subject: "Avanço da Laje 22 - SPE Horizon Residence",
    bodyHtml: `<h2>Avanço Excepcional nas Obras do Horizon Residence</h2><p>Prezado Investidor,</p><p>É com grande satisfação que compartilhamos as imagens exclusivas de drone capturadas esta semana no canteiro de obras...</p>`,
    sentAt: "2026-07-20 10:30",
    status: "Enviado",
    stats: { sent: 28, opened: 26, clicked: 21 },
  },
  {
    id: "camp-02",
    title: "Convite Pré-Lançamento VIP - SPE Grand Bay Resort",
    type: "Convite",
    targetSegment: "Score > 80 (Platinum)",
    subject: "Oportunidade Exclusiva: Pré-Lançamento Pé na Areia Aquiraz",
    bodyHtml: `<h2>Seja um dos primeiros a adquirir cotas do Grand Bay Resort</h2><p>Como investidor do nosso círculo Platinum, você tem prioridade absoluta na escolha das primeiras unidades...</p>`,
    status: "Rascunho",
  },
];

// Notifications
export const initialNotifications: NotificationItem[] = [
  { id: "notif-01", title: "Dividendos Creditados", message: "A distribuição referente ao 2º Trimestre de 2026 foi transferida para sua conta bancária cadastrada.", date: "2026-07-01", read: false, type: "success" },
  { id: "notif-02", title: "Novo Relatório de Drone Disponível", message: "O vídeo panorâmico da SPE Horizon Residence referente ao mês de Julho/2026 já está disponível na galeria.", date: "2026-07-20", read: false, type: "info" },
  { id: "notif-03", title: "Convocação de Assembleia", message: "Confirme sua presença na próxima AGO da SPE ARV Horizon agendada para 15/08/2026.", date: "2026-07-22", read: true, type: "warning" },
];

// AI Recommendations for Commercial Intelligence
export const initialAIRecommendations: AIRecommendation[] = [
  {
    id: "rec-01",
    investorId: "inv-01",
    investorName: "Dr. Roberto Silveira",
    category: "Reinvestimento",
    confidenceScore: 96,
    title: "Alta Probabilidade para Lançamento Pé na Areia",
    reasoning: "Score 92 (Platinum), liquidity de dividendos recente e histórico positivo na SPE Horizon. Acessou o portal 32 vezes nos últimos 30 dias.",
    suggestedAction: "Convidar para almoço VIP com o Diretor Comercial e apresentar o espelho da SPE Grand Bay.",
  },
  {
    id: "rec-02",
    investorId: "inv-15",
    investorName: "Luciano Camelo Maia",
    category: "Risco de Churn",
    confidenceScore: 88,
    title: "Investidor sem Interação Há 120 Dias",
    reasoning: "Score 42 (Risco). Não acessa o portal desde março e não respondeu aos comunicados da SPE Vista Parque.",
    suggestedAction: "Engenheiro Responsável deve ligar diretamente com atualização sobre o término da alvenaria.",
  },
  {
    id: "rec-03",
    investorId: "inv-03",
    investorName: "Eng. Carlos Eduardo Prado",
    category: "Upgrade VIP",
    confidenceScore: 94,
    title: "Candidato a Conselho Consultivo de Investidores",
    reasoning: "Maior patrimônio investido (R$ 6,8M), presencial em todas as assembleias e trouxe 5 indicações qualificadas.",
    suggestedAction: "Oferecer assento no Conselho Consultivo de Relações com Investidores da ARV.",
  },
];

// Initial Marketing Leads (Meta Ads, RD Station, Landing Pages)
export const initialLeads: MarketingLead[] = [
  {
    id: "lead-01",
    name: "Dr. Marcelo Fagundes Fontes",
    phone: "(85) 99821-4411",
    whatsapp: "(85) 99821-4411",
    email: "marcelo.fontes@medicina.com.br",
    originCampaign: "Meta Ads - Lançamento Beira Mar",
    adSet: "Médicos & Especialistas - Fortaleza",
    adName: "Vídeo Heliponto & Rentabilidade SPE",
    landingPage: "https://arvinc.com.br/horizon-residence",
    utmSource: "facebook",
    utmCampaign: "meta_horizon_2026",
    utmMedium: "cpc",
    conversionDate: "2026-07-20",
    assignedBroker: "Camila Vasconcelos",
    speOfInterest: "SPE ARV Horizon Residence",
    stage: "Proposta",
    dealValue: 1250000,
    notes: "Interessado na cobertura duplex. Já possui portfólio em imóveis corporativos.",
    cpfCnpj: "382.910.420-11",
    rg: "2008019281-CE",
    birthDate: "1982-04-14",
    civilStatus: "Casado(a)",
    nationality: "Brasileiro(a)",
    profession: "Médico Neurocirurgião",
    address: "Rua Osvaldo Cruz, 1200, Ap 1401 - Meireles",
    zipCode: "60165-010",
    city: "Fortaleza",
    state: "CE",
    bankInfo: {
      bank: "Banco Itaú (341)",
      agency: "0412",
      account: "88120-4",
      pix: "382.910.420-11",
      income: 85000,
    },
    uploadedDocs: {
      rg: "rg_marcelo_fontes.pdf",
      cpf: "cpf_marcelo_fontes.pdf",
      residence: "comprovante_residencia.pdf",
      marriageCert: "certidao_casamento.pdf",
    },
    validationStatus: {
      mandatoryFieldsValid: true,
      cpfValid: true,
      emailValid: true,
      docsComplete: true,
      duplicatesCheck: true,
    },
    electronicSignatureStatus: "Enviado",
    electronicSignatureProvider: "Clicksign",
    electronicSignatureUrl: "https://clicksign.com/docs/arv-marcelo-horizon-2026",
  },
  {
    id: "lead-02",
    name: "Beatriz Nogueira Sampaio",
    phone: "(85) 98711-9002",
    whatsapp: "(85) 98711-9002",
    email: "beatriz.sampaio@arquitetura.com.br",
    originCampaign: "RD Station - Ebook Investimentos Imobiliários",
    adSet: "Inbound Marketing Organico",
    adName: "Ebook Comparativo SPE vs FIIs 2026",
    landingPage: "https://arvinc.com.br/ebook-investimentos",
    utmSource: "rdstation",
    utmCampaign: "inbound_nutricao_gold",
    utmMedium: "email",
    conversionDate: "2026-07-22",
    assignedBroker: "Lucas Andrade",
    speOfInterest: "SPE ARV Vista Parque",
    stage: "Primeiro Contato",
    dealValue: 850000,
    notes: "Baixou o ebook e interagiu via WhatsApp pedindo apresentação de rendimento bruto.",
  },
  {
    id: "lead-03",
    name: "Guilherme Albuquerque Lima",
    phone: "(85) 99100-3388",
    whatsapp: "(85) 99100-3388",
    email: "guilherme@albuquerque.com.br",
    originCampaign: "Google Ads - Pesquisa Direta ARV",
    adSet: "Investimento Imobiliário Fortaleza",
    adName: "Anúncio Busca - SPE Construtora ARV",
    landingPage: "https://arvinc.com.br/spe-porto-belo",
    utmSource: "google",
    utmCampaign: "gads_search_spe",
    utmMedium: "search",
    conversionDate: "2026-07-23",
    assignedBroker: "Renata Bezerra",
    speOfInterest: "SPE Porto Belo Corporate",
    stage: "Visita Agendada",
    dealValue: 1800000,
    notes: "Visita agendada para sexta-feira no stand com a engenharia.",
  },
  {
    id: "lead-04",
    name: "Juliana Peixoto de Hollanda",
    phone: "(85) 99402-1199",
    whatsapp: "(85) 99402-1199",
    email: "juliana.hollanda@law.com.br",
    originCampaign: "Meta Ads - Grand Bay Resort Pé na Areia",
    adSet: "Público VIP High Net Worth",
    adName: "Carrossel Unidades Pé na Areia",
    landingPage: "https://arvinc.com.br/grand-bay-aquiraz",
    utmSource: "instagram",
    utmCampaign: "meta_grandbay_aquiraz",
    utmMedium: "feed",
    conversionDate: "2026-07-18",
    assignedBroker: "Camila Vasconcelos",
    speOfInterest: "SPE Grand Bay Resort Aquiraz",
    stage: "Contrato",
    dealValue: 2100000,
    cpfCnpj: "492.012.390-88",
    rg: "2007019882-CE",
    birthDate: "1987-11-20",
    civilStatus: "Solteiro(a)",
    nationality: "Brasileiro(a)",
    profession: "Advogada Societária",
    address: "Av. Virgílio Távora, 800 - Aldeota",
    zipCode: "60170-250",
    city: "Fortaleza",
    state: "CE",
    bankInfo: {
      bank: "Banco Bradesco (237)",
      agency: "1280",
      account: "45910-2",
      pix: "juliana.hollanda@law.com.br",
      income: 62000,
    },
    uploadedDocs: {
      rg: "rg_juliana.pdf",
      cpf: "cpf_juliana.pdf",
      residence: "comprovante_juliana.pdf",
    },
    validationStatus: {
      mandatoryFieldsValid: true,
      cpfValid: true,
      emailValid: true,
      docsComplete: true,
      duplicatesCheck: true,
    },
    electronicSignatureStatus: "Pendente",
    electronicSignatureProvider: "DocuSign",
    electronicSignatureUrl: "https://docusign.net/Member/PowerFormSigning.aspx?PowerFormId=arv-juliana-2026",
  },
  {
    id: "lead-05",
    name: "Thiago Medeiros Cavalcanti",
    phone: "(85) 99650-8811",
    whatsapp: "(85) 99650-8811",
    email: "thiago@medeirosholding.com.br",
    originCampaign: "Indicação de Cliente Platinum",
    adSet: "Network Privado",
    adName: "Indicação Direta Dr. Roberto Silveira",
    landingPage: "https://arvinc.com.br/vip",
    utmSource: "referral",
    utmCampaign: "indicacao_dr_roberto",
    utmMedium: "direct",
    conversionDate: "2026-07-15",
    assignedBroker: "Camila Vasconcelos",
    speOfInterest: "SPE ARV Horizon Residence",
    stage: "Venda Concluída",
    dealValue: 3400000,
    cpfCnpj: "109.821.309-44",
    rg: "2002019912-CE",
    birthDate: "1978-09-02",
    civilStatus: "Casado(a)",
    nationality: "Brasileiro(a)",
    profession: "Empresário Agronegócio",
    address: "Rua Maria Tomásia, 500, Ap 2000 - Aldeota",
    zipCode: "60150-160",
    city: "Fortaleza",
    state: "CE",
    bankInfo: {
      bank: "BTG Pactual (208)",
      agency: "0001",
      account: "991204-1",
      pix: "thiago@medeirosholding.com.br",
      income: 120000,
    },
    uploadedDocs: {
      rg: "rg_thiago.pdf",
      cpf: "cpf_thiago.pdf",
      residence: "comprovante_thiago.pdf",
      marriageCert: "certidao_thiago.pdf",
    },
    validationStatus: {
      mandatoryFieldsValid: true,
      cpfValid: true,
      emailValid: true,
      docsComplete: true,
      duplicatesCheck: true,
    },
    electronicSignatureStatus: "Assinado",
    electronicSignatureProvider: "ZapSign",
    electronicSignatureUrl: "https://zapsign.com.br/doc/arv-thiago-cavalcanti-2026",
  },
];

// Customer Onboarding Progress Records
export const initialOnboardings: CustomerOnboardingProgress[] = [
  {
    id: "onb-01",
    investorId: "inv-01",
    investorName: "Dr. Roberto Silveira",
    contractId: "ctr-01",
    speId: "spe-01",
    speName: "SPE ARV Horizon Residence",
    unitNumber: "Unidade 1801",
    currentStep: 6,
    startDate: "2026-01-10",
    welcomeSent: true,
    specsDelivered: true,
    portalAccessCreated: true,
    docsAvailable: true,
    teamIntroduced: true,
    checklist: {
      contractSigned: true,
      docsUploaded: true,
      registrationApproved: true,
      portalReleased: true,
      firstAccessDone: true,
      paymentConfigured: true,
    },
  },
  {
    id: "onb-02",
    investorId: "inv-02",
    investorName: "Dra. Mariana Costa Mello",
    contractId: "ctr-02",
    speId: "spe-02",
    speName: "SPE ARV Vista Parque",
    unitNumber: "Unidade 904",
    currentStep: 4,
    startDate: "2026-07-12",
    welcomeSent: true,
    specsDelivered: true,
    portalAccessCreated: true,
    docsAvailable: true,
    teamIntroduced: true,
    checklist: {
      contractSigned: true,
      docsUploaded: true,
      registrationApproved: true,
      portalReleased: true,
      firstAccessDone: false,
      paymentConfigured: true,
    },
  },
  {
    id: "onb-03",
    investorId: "inv-05",
    investorName: "Thiago Medeiros Cavalcanti",
    contractId: "ctr-05",
    speId: "spe-01",
    speName: "SPE ARV Horizon Residence",
    unitNumber: "Unidade 2202",
    currentStep: 2,
    startDate: "2026-07-22",
    welcomeSent: true,
    specsDelivered: true,
    portalAccessCreated: true,
    docsAvailable: false,
    teamIntroduced: true,
    checklist: {
      contractSigned: true,
      docsUploaded: true,
      registrationApproved: true,
      portalReleased: true,
      firstAccessDone: false,
      paymentConfigured: false,
    },
  },
];

export const initialNewsletters: SmartNewsletter[] = [
  {
    id: "news-01",
    editionName: "Informativo Oficial aos Investidores ARV - Edição #14",
    editionDate: "2026-07-24",
    frequency: "Mensal",
    speId: "spe-01",
    speName: "SPE ARV Horizon Residence",
    developmentName: "ARV Horizon Residence",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    status: "Publicado",
    channels: ["EMAIL", "WHATSAPP", "PORTAL", "PUSH"],
    aiSummary:
      "Neste período, o empreendimento ARV Horizon Residence manteve seu cronograma rigorosamente conforme o planejado, alcançando 64% de execução física global. Foram concluídas as estruturas do Bloco A e iniciadas as instalações hidráulicas e elétricas. Disponibilizamos novas fotos e imagens de drone atualizadas no Portal do Investidor. Agradecemos a confiança e seguimos com total transparência e foco no cumprimento dos prazos.",

    card1Resumo: {
      speName: "SPE ARV Horizon Residence",
      developmentName: "ARV Horizon Residence",
      city: "Fortaleza",
      neighborhood: "Meireles",
      engineerLead: "Eng. Ricardo Alencar",
      startDate: "2024-03-15",
      estimatedCompletion: "2027-06-30",
      executedPercentage: 64,
      investorsCount: 32,
      totalRaised: 62000000,
      scheduleStatus: "no_prazo",
    },

    card2Evolucao: {
      executedPercentage: 64,
      plannedPercentage: 62,
      completedStages: ["Fundação Profunda", "Estrutura dos 20 Pavimentos", "Alvenaria Externa"],
      inProgressStages: ["Instalações Elétricas e Hidráulicas", "Revestimento de Fachada", "Chapeamento"],
      nextStages: ["Instalação de Esquadrias e Vidros", "Gesso e Piso", "Acabamentos das Áreas Comuns"],
      monthlyHighlightText:
        "Neste mês foram finalizadas as etapas de alvenaria de vedação nos andares superiores do Bloco A e iniciada a passagem de tubulações hidráulicas no hall principal. A obra atingiu 64% de execução física, mantendo avanço positivo de +2% em relação ao cronograma previsto.",
      previousMonthPhoto: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      currentMonthPhoto: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },

    card3Galeria: [
      {
        id: "gal-01",
        title: "Evolução da Fachada Leste",
        type: "drone",
        url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
        date: "2026-07-20",
        description: "Captura de drone mostrando a estrutura do 20º pavimento finalizada.",
      },
      {
        id: "gal-02",
        title: "Instalações Hidráulicas no Hall",
        type: "foto",
        url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
        date: "2026-07-18",
        description: "Equipe de engenharia executando a prumada técnica.",
      },
      {
        id: "gal-03",
        title: "Comparativo Mês Anterior x Mês Atual",
        type: "comparativo",
        url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
        date: "2026-07-01",
        description: "Evolução do fechamento em alvenaria e instalações elétricas.",
      },
    ],

    card4Indicadores: {
      physicalProgress: 64,
      scheduleAdherencePct: 102,
      safetyDaysNoAccidents: 420,
      licensesStatus: "Alvará de Construção e LI Válidos (SEMACE #4092)",
      documentationStatus: "Matrícula Individualizada & RI em Dia",
      investmentRealized: 41500000,
      nextMilestone: "Início do Revestimento Cerâmico (Agosto/2026)",
    },

    card5NovidadesComerciais: [
      {
        id: "com-01",
        title: "Últimas 3 Unidades com Vista Mar Total",
        description: "Lançamos condições especiais para os investidores da base adquirirem as últimas metragens do 18º e 19º andar.",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
        badge: "Últimas Unidades",
        ctaText: "Ver Tabela & Plantas",
        ctaUrl: "/portal",
      },
      {
        id: "com-02",
        title: "Agendamento de Visita Técnica ao Decorado",
        description: "Abriremos a estrutura do apartamento modelo para visitação exclusiva dos investidores nos sábados de agosto.",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        badge: "Exclusivo Investidores",
        ctaText: "Agendar com o Gerente",
        ctaUrl: "/portal",
      },
    ],

    card6Comunicados: [
      {
        id: "ann-01",
        type: "Prestação de Contas",
        title: "Relatório de Prestação de Contas 2º Trimestre Disparado",
        content: "O relatório financeiro detalhado com balancetes e notas fiscais de fornecedores já foi auditado e está anexado no Portal.",
        date: "2026-07-15",
      },
      {
        id: "ann-02",
        type: "Assembleia",
        title: "Convocação de Assembleia de Acompanhamento Presencial & Live",
        content: "Nossa próxima assembleia ordinária será realizada no dia 15/08 às 19h no auditório da ARV com transmissão ao vivo.",
        date: "2026-07-10",
      },
    ],

    card7Eventos: [
      {
        id: "evt-01",
        type: "Assembleia",
        title: "Assembleia Geral Ordinária de Investidores SPE Horizon",
        date: "2026-08-15",
        time: "19:00",
        location: "Auditório ARV / Transmissão Zoom",
      },
      {
        id: "evt-02",
        type: "Visita à Obra",
        title: "Visita Guiada da Engenharia aos Apartamentos do 10º andar",
        date: "2026-08-22",
        time: "09:00",
        location: "Canteiro de Obras ARV Horizon",
      },
    ],

    card8Timeline: [
      { id: "tl-01", stage: "Fundação e Subsolos", status: "completed", estimatedDate: "Concluído em Jun/2024" },
      { id: "tl-02", stage: "Estrutura de Concreto Armado", status: "completed", estimatedDate: "Concluído em Maio/2026" },
      { id: "tl-03", stage: "Instalações e Fachada", status: "in_progress", estimatedDate: "Em Execução (Prev. Out/2026)" },
      { id: "tl-04", stage: "Pisos, Louças e Acabamentos", status: "planned", estimatedDate: "Prev. Fev/2027" },
      { id: "tl-05", stage: "Entrega de Chaves & Habite-se", status: "future", estimatedDate: "Junho de 2027" },
    ],

    card9Faqs: [
      {
        id: "faq-01",
        question: "Quando ocorrerá a próxima assembleia de prestação de contas?",
        answer: "A próxima assembleia está agendada para o dia 15 de Agosto de 2026, com formato híbrido (presencial na sede e transmissão online).",
      },
      {
        id: "faq-02",
        question: "Como acompanho a medição de avanço da minha unidade?",
        answer: "No Portal do Investidor, acesse a aba 'Obras & SPEs' para visualizar os boletins fotográficos mensais e o relatório da engenharia.",
      },
      {
        id: "faq-03",
        question: "Onde baixo o informe de rendimentos para o Imposto de Renda?",
        answer: "Todos os informes de rendimentos e comprovantes de aportes ficam permanentemente salvos na seção 'Documentos do Investidor'.",
      },
    ],

    card10Portal: {
      newDocsCount: 3,
      newPhotosCount: 12,
      unreadMessagesCount: 1,
      upcomingPaymentsCount: 0,
      notificationsCount: 2,
      ctaUrl: "/portal",
    },

    card11Gerente: {
      name: "Eng. Ricardo Alencar",
      role: "Gerente de Relações com Investidores (RI)",
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80",
      phone: "(85) 99876-5432",
      whatsapp: "+5585998765432",
      email: "ricardo.alencar@arvinc.com.br",
    },

    stats: {
      sentCount: 32,
      deliveryRate: 100,
      openRate: 91,
      clicksPerSection: {
        "Resumo Executivo": 28,
        "Evolução da Obra": 31,
        "Galeria de Fotos": 30,
        "Novidades Comerciais": 22,
        "Portal do Investidor": 29,
        "Contato Gerente": 14,
      },
      docDownloads: 24,
      photoViews: 142,
      portalVisitsGenerated: 38,
      mostAccessedSPE: "SPE ARV Horizon Residence",
      engagementByInvestor: [
        { investorId: "inv-01", investorName: "Dr. Roberto de Andrade Siqueira", opensCount: 5, clicksCount: 8, lastAccessDate: "2026-07-24" },
        { investorId: "inv-02", investorName: "Dra. Mariana Costa Mello", opensCount: 4, clicksCount: 6, lastAccessDate: "2026-07-23" },
        { investorId: "inv-03", investorName: "Eng. Carlos Eduardo Fontes", opensCount: 6, clicksCount: 10, lastAccessDate: "2026-07-24" },
        { investorId: "inv-04", investorName: "Beatriz Lins Guimarães", opensCount: 3, clicksCount: 4, lastAccessDate: "2026-07-21" },
      ],
    },
  },
];


