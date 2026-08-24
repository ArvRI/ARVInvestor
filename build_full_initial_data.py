import os

t58_clients = [
  {"name": "HGLM Administração Patrimonial LTDA", "code": "685", "isCnpj": True, "prof": "Holding Patrimonial", "cons": "Jean Carlos Estipe"},
  {"name": "Alfredo Gilberto Lima de Magalhaes", "code": "656", "isCnpj": False, "prof": "Investidor Imobiliário", "cons": "Evelyn Dayane Rodrigues"},
  {"name": "Joycy Joana Alves Batista", "code": "514", "isCnpj": False, "prof": "Médica Anestesiologista", "cons": "Isabela Fernanda de Lucca"},
  {"name": "Mência Zanato Administração de Bens L", "code": "666", "isCnpj": True, "prof": "Gestão Patrimonial", "cons": "Anderson Rodrigo Vieira"},
  {"name": "Marcelo Moreira Ferraz", "code": "131", "isCnpj": False, "prof": "Empresário de Tecnologia", "cons": "Leticia Aparecida Conrado"},
  {"name": "Cesar Augusto Colaço", "code": "566", "isCnpj": False, "prof": "Engenheiro", "cons": "Jean Carlos Estipe"},
  {"name": "Margarida Rocha Eggenstein", "code": "596", "isCnpj": False, "prof": "Advogada Societária", "cons": "Evelyn Dayane Rodrigues"},
  {"name": "Kern Administração De Bens e Serviços", "code": "662", "isCnpj": True, "prof": "Administração de Ativos", "cons": "Jean Carlos Estipe"},
  {"name": "Elizete Almeida Felippe", "code": "132", "isCnpj": False, "prof": "Empresária", "cons": "Leticia Aparecida Conrado"},
  {"name": "Guilherme Maurilio de Oliveira", "code": "684", "isCnpj": False, "prof": "Arquiteto e Urbanista", "cons": "Jean Carlos Estipe"},
  {"name": "Vilmar Reck", "code": "591", "isCnpj": False, "prof": "Empresário Agrícola", "cons": "Jean Carlos Estipe"},
  {"name": "Jorge Augusto Rosso dos Santos", "code": "621", "isCnpj": False, "prof": "Médico Cirurgião", "cons": "Evelyn Dayane Rodrigues"},
  {"name": "José Osmar Pesalacia Junior", "code": "057", "isCnpj": False, "prof": "Economista", "cons": "ARV Investimentos"},
  {"name": "Luana König Bieger", "code": "673", "isCnpj": False, "prof": "Odontóloga", "cons": "Jean Carlos Estipe"},
  {"name": "Janice Messias Pesalacia", "code": "224", "isCnpj": False, "prof": "Administradora", "cons": "ARV Investimentos"},
  {"name": "Pietra Marchese Rela", "code": "690", "isCnpj": False, "prof": "Designer de Interiores", "cons": "Evelyn Dayane Rodrigues"},
  {"name": "Amilton Bento", "code": "704", "isCnpj": False, "prof": "Empresário", "cons": "Jean Carlos Estipe"},
  {"name": "Y e Y Serviços de Consultoria", "code": "669", "isCnpj": True, "prof": "Consultoria Empresarial", "cons": "Jean Carlos Estipe"},
  {"name": "Marcos Fuchs Costa", "code": "598", "isCnpj": False, "prof": "Engenheiro de Software", "cons": "Evelyn Dayane Rodrigues"},
  {"name": "Nicolas Pacheco dos Santos", "code": "343", "isCnpj": False, "prof": "Analista Financeiro", "cons": "Leonardo Ceccon"},
  {"name": "Giovani Bonetti", "code": "142", "isCnpj": False, "prof": "Arquiteto", "cons": "A1 Serviços"},
  {"name": "Felipe Vieira Alves", "code": "398", "isCnpj": False, "prof": "Advogado", "cons": "Leandro Basseto Knoll"},
  {"name": "Gustavo Ferro Dal Pont", "code": "468", "isCnpj": False, "prof": "Empresário", "cons": "Rafael Law"},
  {"name": "Daniel Homem da Luz", "code": "556", "isCnpj": False, "prof": "Consultor de TI", "cons": "A1 Serviços"},
  {"name": "Silvio Luis Fernandes", "code": "380", "isCnpj": False, "prof": "Empresário", "cons": "Basseto Ingleses"},
  {"name": "Duarli Participações LTDA", "code": "819", "isCnpj": True, "prof": "Holding Familiar", "cons": "Pense Investimentos"},
  {"name": "Juan Carlos Corrales", "code": "344", "isCnpj": False, "prof": "Engenheiro", "cons": "A1 Serviços"},
  {"name": "Luis Eduardo Silva de Barros", "code": "409", "isCnpj": False, "prof": "Médico", "cons": "Pense Imóveis"},
  {"name": "Edson Roberto De Pieri", "code": "403", "isCnpj": False, "prof": "Engenheiro Civil", "cons": "Leandro Basseto Knoll"},
  {"name": "Leonardo Jorge Mendes", "code": "208", "isCnpj": False, "prof": "Empresário", "cons": "Jean Carlos Estipe"},
  {"name": "Maria Eduarda Zimath Zanella", "code": "427", "isCnpj": False, "prof": "Arquiteta", "cons": "ARV Investimentos"},
  {"name": "Larissa Zomer Loli", "code": "336", "isCnpj": False, "prof": "Médica Dermatologista", "cons": "Pense Investimentos"},
  {"name": "Rui Carlos Kolb Schiefler", "code": "376", "isCnpj": False, "prof": "Professor Universitário", "cons": "Gabriel Porto Freire"},
  {"name": "Harmonia Participações S/A", "code": "636", "isCnpj": True, "prof": "Participações Societárias", "cons": "Basseto Ingleses"},
  {"name": "Daniel Carlos Andrade de Araujo", "code": "379", "isCnpj": False, "prof": "Empresário", "cons": "Basseto Ingleses"},
  {"name": "Rejane Mayer de Figueiredo e Silva", "code": "395", "isCnpj": False, "prof": "Juíza de Direito", "cons": "Leandro Basseto Knoll"},
  {"name": "Rubi Administradora de Imóveis LTDA", "code": "770", "isCnpj": True, "prof": "Administradora de Imóveis", "cons": "GDUARTE Serviços"},
  {"name": "Cibele Cristiane Schuelter", "code": "407", "isCnpj": False, "prof": "Empresária", "cons": "Rafael Law"},
  {"name": "Eduardo Soares Maia Vieira de Souza", "code": "411", "isCnpj": False, "prof": "Advogado", "cons": "Gustavo Neves"},
  {"name": "Rodrigo Manoel Pires", "code": "413", "isCnpj": False, "prof": "Empresário", "cons": "L E Assessoria"},
  {"name": "Bruna Vanessa Medeiros", "code": "400", "isCnpj": False, "prof": "Engenheira", "cons": "Rafael Law"},
  {"name": "Bruno Simões Angotti", "code": "331", "isCnpj": False, "prof": "Investidor", "cons": "ARV Investimentos"},
  {"name": "Pedro Zorat Neto", "code": "402", "isCnpj": False, "prof": "Cirurgião Dentista", "cons": "Rafael Law"},
  {"name": "Claudiney Veloso", "code": "425", "isCnpj": False, "prof": "Empresário", "cons": "Pense Investimentos"},
  {"name": "Juliano de Albuquerque Mazzuco", "code": "790", "isCnpj": False, "prof": "Empresário", "cons": "Jean Carlos Estipe"},
  {"name": "Cesar Cassius Mocker", "code": "808", "isCnpj": False, "prof": "Empresário", "cons": "Invista Negócios"}
]

t58_raw_contracts = [
  {"num": "CV763897", "date": "2025-04-01", "val": 361104.80, "client": "HGLM Administração Patrimonial LTDA", "unit": "708", "area": 36.19, "cons": "Jean Carlos Estipe"},
  {"num": "CV779820", "date": "2025-01-20", "val": 307904.00, "client": "Alfredo Gilberto Lima de Magalhaes", "unit": "201/104", "area": 30.98, "cons": "Evelyn Dayane Rodrigues"},
  {"num": "CV782525", "date": "2024-01-24", "val": 329981.60, "client": "Joycy Joana Alves Batista", "unit": "204/103", "area": 33.12, "cons": "Isabela Fernanda de Lucca"},
  {"num": "CV783825", "date": "2025-02-07", "val": 125088.97, "client": "Mência Zanato Administração de Bens L", "unit": "205/105", "area": 30.50, "cons": "Anderson Rodrigo Vieira"},
  {"num": "CV804809", "date": "2024-11-14", "val": 365065.24, "client": "Marcelo Moreira Ferraz", "unit": "501/404", "area": 33.59, "cons": "Leticia Aparecida Conrado"},
  {"num": "CV805655", "date": "2024-06-21", "val": 386755.04, "client": "Cesar Augusto Colaço", "unit": "502/402", "area": 33.33, "cons": "Jean Carlos Estipe"},
  {"num": "CV806703", "date": "2024-08-08", "val": 389815.46, "client": "Margarida Rocha Eggenstein", "unit": "503/401", "area": 32.91, "cons": "Evelyn Dayane Rodrigues"},
  {"num": "CV807831", "date": "2025-02-04", "val": 350000.00, "client": "Kern Administração De Bens e Serviços", "unit": "504/403", "area": 34.33, "cons": "Jean Carlos Estipe"},
  {"num": "CV811810", "date": "2024-11-14", "val": 346921.48, "client": "Elizete Almeida Felippe", "unit": "508/406", "area": 34.04, "cons": "Leticia Aparecida Conrado"},
  {"num": "CV812895", "date": "2025-03-27", "val": 360000.00, "client": "Guilherme Maurilio de Oliveira", "unit": "601/504", "area": 34.40, "cons": "Jean Carlos Estipe"},
  {"num": "CV813702", "date": "2024-08-08", "val": 400000.00, "client": "Vilmar Reck", "unit": "602/502", "area": 33.24, "cons": "Jean Carlos Estipe"},
  {"num": "CV814768", "date": "2024-10-17", "val": 411085.72, "client": "Jorge Augusto Rosso dos Santos", "unit": "603/501", "area": 33.69, "cons": "Evelyn Dayane Rodrigues"},
  {"num": "CV815651", "date": "2024-06-18", "val": 445243.43, "client": "José Osmar Pesalacia Junior", "unit": "604/503", "area": 33.90, "cons": "ARV Investimentos"},
  {"num": "CV816844", "date": "2025-03-05", "val": 315000.00, "client": "Luana König Bieger", "unit": "605/505", "area": 31.22, "cons": "Jean Carlos Estipe"},
  {"num": "CV819652", "date": "2024-06-18", "val": 445917.11, "client": "Janice Messias Pesalacia", "unit": "608/506", "area": 33.56, "cons": "ARV Investimentos"},
  {"num": "CV821811", "date": "2024-11-14", "val": 227208.00, "client": "Marcelo Moreira Ferraz", "unit": "703", "area": 32.81, "cons": "Leticia Aparecida Conrado"},
  {"num": "CV822914", "date": "2025-04-29", "val": 400000.00, "client": "Pietra Marchese Rela", "unit": "704", "area": 33.19, "cons": "Evelyn Dayane Rodrigues"},
  {"num": "CV823930", "date": "2025-06-23", "val": 355000.00, "client": "Amilton Bento", "unit": "705", "area": 31.14, "cons": "Jean Carlos Estipe"},
  {"num": "CV824845", "date": "2025-02-17", "val": 340000.00, "client": "Y e Y Serviços de Consultoria", "unit": "706", "area": 31.31, "cons": "Jean Carlos Estipe"},
  {"num": "CV825710", "date": "2024-08-28", "val": 447761.70, "client": "Marcos Fuchs Costa", "unit": "707", "area": 31.41, "cons": "Evelyn Dayane Rodrigues"},
  {"num": "T58-LOJA01", "date": "2025-12-09", "val": 268882.91, "client": "Alfredo Gilberto Lima de Magalhaes", "unit": "Loja 01", "area": 33.00, "cons": "Jean Carlos Estipe"},
  {"num": "T58101", "date": "2022-12-28", "val": 271835.27, "client": "Nicolas Pacheco dos Santos", "unit": "203/101", "area": 32.24, "cons": "Leonardo Ceccon"},
  {"num": "T58102", "date": "2023-01-31", "val": 253049.44, "client": "Giovani Bonetti", "unit": "202/102", "area": 32.76, "cons": "A1 Serviços"},
  {"num": "T58106", "date": "2023-03-29", "val": 289793.26, "client": "Felipe Vieira Alves", "unit": "208/106", "area": 34.07, "cons": "Leandro Basseto Knoll"},
  {"num": "T58108", "date": "2023-07-19", "val": 312846.56, "client": "Gustavo Ferro Dal Pont", "unit": "207/108", "area": 31.18, "cons": "Rafael Law"},
  {"num": "T58201", "date": "2023-02-15", "val": 137063.45, "client": "Mência Zanato Administração de Bens L", "unit": "303/201", "area": 33.20, "cons": "A1 Serviços"},
  {"num": "T58202", "date": "2023-01-25", "val": 300659.07, "client": "Daniel Homem da Luz", "unit": "302/202", "area": 33.20, "cons": "A1 Serviços"},
  {"num": "T58203", "date": "2023-03-06", "val": 323577.60, "client": "Silvio Luis Fernandes", "unit": "304/203", "area": 34.07, "cons": "Basseto Ingleses"},
  {"num": "T58204", "date": "2022-12-15", "val": 294553.48, "client": "Duarli Participações LTDA", "unit": "301/204", "area": 34.96, "cons": "Pense Investimentos"},
  {"num": "T58205", "date": "2022-12-23", "val": 262037.75, "client": "Juan Carlos Corrales", "unit": "305/205", "area": 27.50, "cons": "A1 Serviços"},
  {"num": "T58206", "date": "2023-03-13", "val": 256550.18, "client": "Luis Eduardo Silva de Barros", "unit": "308/206", "area": 33.79, "cons": "Pense Imóveis"},
  {"num": "T58207", "date": "2023-03-30", "val": 296445.46, "client": "Edson Roberto De Pieri", "unit": "306/207", "area": 27.54, "cons": "Leandro Basseto Knoll"},
  {"num": "T58208", "date": "2023-01-31", "val": 256370.00, "client": "Leonardo Jorge Mendes", "unit": "307/208", "area": 27.77, "cons": "Jean Carlos Estipe"},
  {"num": "T58301", "date": "2023-05-12", "val": 300000.00, "client": "Maria Eduarda Zimath Zanella", "unit": "403/301", "area": 29.79, "cons": "ARV Investimentos"},
  {"num": "T58302", "date": "2022-12-15", "val": 348380.18, "client": "Larissa Zomer Loli", "unit": "402/302", "area": 35.20, "cons": "Pense Investimentos"},
  {"num": "T58303", "date": "2023-02-28", "val": 274140.10, "client": "Rui Carlos Kolb Schiefler", "unit": "404/303", "area": 32.28, "cons": "Basseto Ingleses"},
  {"num": "T58304", "date": "2023-03-07", "val": 286230.41, "client": "Harmonia Participações S/A", "unit": "401/304", "area": 34.28, "cons": "Basseto Ingleses"},
  {"num": "T58305", "date": "2023-03-07", "val": 250646.06, "client": "Daniel Carlos Andrade de Araujo", "unit": "405/305", "area": 27.50, "cons": "Basseto Ingleses"},
  {"num": "T58306", "date": "2023-03-21", "val": 280549.13, "client": "Rejane Mayer de Figueiredo e Silva", "unit": "408/306", "area": 33.21, "cons": "Leandro Basseto Knoll"},
  {"num": "T58307", "date": "2023-03-11", "val": 250000.00, "client": "Rubi Administradora de Imóveis LTDA", "unit": "406/307", "area": 31.46, "cons": "GDUARTE Serviços"},
  {"num": "T58308", "date": "2023-03-24", "val": 275767.08, "client": "Cibele Cristiane Schuelter", "unit": "407/308", "area": 31.77, "cons": "Jean Carlos Estipe"},
  {"num": "T58405", "date": "2023-03-30", "val": 335000.00, "client": "Eduardo Soares Maia Vieira de Souza", "unit": "505/405", "area": 31.00, "cons": "Gustavo Neves"},
  {"num": "T58407", "date": "2023-04-02", "val": 344827.52, "client": "Rodrigo Manoel Pires", "unit": "506/407", "area": 30.62, "cons": "L E Assessoria"},
  {"num": "T58408", "date": "2023-03-20", "val": 276590.13, "client": "Bruna Vanessa Medeiros", "unit": "507/408", "area": 30.22, "cons": "Rafael Law"},
  {"num": "T58507", "date": "2023-03-14", "val": 11402.63, "client": "Bruno Simões Angotti", "unit": "606/507", "area": 31.06, "cons": "ARV Investimentos"},
  {"num": "T58508", "date": "2023-03-31", "val": 343601.88, "client": "Pedro Zorat Neto", "unit": "607/508", "area": 31.25, "cons": "Rafael Law"},
  {"num": "T58602", "date": "2023-04-27", "val": 455474.72, "client": "Claudiney Veloso", "unit": "702/602", "area": 32.81, "cons": "Pense Investimentos"},
  {"num": "T58701", "date": "2025-05-22", "val": 370000.00, "client": "Kern Administração De Bens e Serviços", "unit": "701", "area": 34.37, "cons": "Jean Carlos Estipe"},
  {"num": "TS- LOJA02", "date": "2026-04-01", "val": 340000.00, "client": "Juliano de Albuquerque Mazzuco", "unit": "Loja 02", "area": 33.03, "cons": "Jean Carlos Estipe"},
  {"num": "TS-206", "date": "2026-05-08", "val": 380000.00, "client": "Cesar Cassius Mocker", "unit": "206/107", "area": 30.79, "cons": "Invista Negócios"}
]

client_map = {}
investor_entries = []

for idx, c in enumerate(t58_clients):
    inv_id = f"inv-t58-{idx+1:02d}"
    client_map[c["name"]] = inv_id
    doc_num = f"{c['code']}.{idx*12+100:03d}.{idx*5+200:03d}-77" if not c["isCnpj"] else f"{c['code']}.{idx*10+100:03d}.0001-{idx*2+10:02d}"
    
    score = 85 + (idx % 12)
    tier = "Platinum" if idx % 3 == 0 else "Gold"
    clean_email_prefix = ''.join(e for e in c['name'].lower().replace(' ', '').replace('ltda', '').replace('s/a', '') if e.isalnum())[:15]
    
    entry = f"""  {{
    id: "{inv_id}",
    name: "{c['name']}",
    cpfCnpj: "{doc_num}",
    phone: "(48) 99{1000000 + (idx*123456) % 8999999}",
    whatsapp: "(48) 99{1000000 + (idx*123456) % 8999999}",
    email: "{clean_email_prefix}@investidort58.com.br",
    address: "Rua Lauro Linhares, {100 + idx*15}",
    city: "Florianópolis - SC",
    state: "SC",
    profession: "{c['prof']}",
    createdAt: "2023-01-15",
    consultant: "{c['cons']}",
    notes: "Cotista investidor da SPE 13 - T58 SPOT SPE LTDA. Acompanha atualizações mensais de obra via Newsletter e Portal.",
    score: {score},
    tier: "{tier}",
    scoreBreakdown: {{
      volume: 18, numInvestments: 2, assemblyAttendance: 14, portalAccess: 9, clientTenure: 8, satisfaction: 9, reinvestments: 6, referrals: 7, totalScore: {score}, tier: "{tier}"
    }},
    satisfactionScore: 9,
    npsCategory: "Promotor",
    active: true,
    avatarUrl: "https://i.pravatar.cc/150?u={inv_id}",
  }}"""
    investor_entries.append(entry)

contract_entries = []
for idx, ctr in enumerate(t58_raw_contracts):
    inv_id = client_map.get(ctr["client"], "inv-t58-01")
    share = round((ctr["val"] / 16845321) * 100, 2)
    entry = f"""  {{
    id: "ctr-t58-{idx+1:02d}",
    investorId: "{inv_id}",
    speId: "spe-t58",
    developmentId: "dev-t58",
    unitId: "unit-t58-{idx+1}",
    contractNumber: "{ctr['num']}",
    purchaseDate: "{ctr['date']}",
    investedAmount: {ctr['val']},
    speSharePercentage: {share},
    expectedRoiPercentage: 18.5,
    status: "Ativo",
    documentUrl: "#",
  }}"""
    contract_entries.append(entry)

inv_joined = ",\n".join(investor_entries)
ctr_joined = ",\n".join(contract_entries)

full_ts_code = """import {
  SPE,
  Development,
  Investor,
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
  SmartNewsletter,
} from "../types";

export const initialSPEs: SPE[] = [
  {
    id: "spe-t58",
    name: "13 - T58 SPOT SPE LTDA",
    cnpj: "38.512.980/0001-13",
    address: "Av. Professora Maria Flora Paes Barreto, 15 - Trindade",
    city: "Florianópolis - SC",
    manager: "Eng. Jean Carlos Estipe",
    status: "Em Obras",
    deadline: "2026-12-30",
    totalVgv: 22500000,
    totalCaptação: 16845321,
    percentSold: 94,
    progressPercentage: 78,
    description: "Empreendimento 15 - T58 Spot - Custos Totais. Studios e apartamentos residenciais integrados à Trindade em Florianópolis/SC.",
    bannerImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    mapCoordinates: "-27.5850,-48.5180",
  },
  {
    id: "spe-01",
    name: "SPE ARV Beira Mar Horizon",
    cnpj: "34.128.940/0001-88",
    address: "Av. Beira Mar, 1050 - Meireles",
    city: "Fortaleza - CE",
    manager: "Eng. Carlos Eduardo Viana",
    status: "Em Obras",
    deadline: "2026-12-15",
    totalVgv: 85000000,
    totalCaptação: 62000000,
    percentSold: 88,
    progressPercentage: 65,
    description: "Empreendimento residencial de altíssimo padrão com vista mar permanente e conceitos de biofilia avançada.",
    bannerImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    mapCoordinates: "-3.7250,-38.4980",
  },
  {
    id: "spe-02",
    name: "SPE ARV Parque Cocó Vista",
    cnpj: "38.902.112/0001-05",
    address: "Rua Dep. Moreira da Rocha, 440 - Cocó",
    city: "Fortaleza - CE",
    manager: "Eng. Roberto Andrade",
    status: "Em Obras",
    deadline: "2027-06-30",
    totalVgv: 48000000,
    totalCaptação: 35000000,
    percentSold: 92,
    progressPercentage: 40,
    description: "Complexo de apartamentos com integração total à área verde do Parque do Cocó e rooftop wellness.",
    bannerImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    mapCoordinates: "-3.7480,-38.4810",
  },
  {
    id: "spe-03",
    name: "SPE ARV Corporate Santos Dumont",
    cnpj: "41.839.021/0001-44",
    address: "Av. Santos Dumont, 2800 - Aldeota",
    city: "Fortaleza - CE",
    manager: "Eng. Marcos Sampaio",
    status: "Em Obras",
    deadline: "2026-03-31",
    totalVgv: 110000000,
    totalCaptação: 90000000,
    percentSold: 75,
    progressPercentage: 82,
    description: "Torre corporativa AAA com selo LEED Gold e hub de inovação no coração financeiro da capital.",
    bannerImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    mapCoordinates: "-3.7380,-38.5020",
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

export const initialDevelopments: Development[] = [
  { id: "dev-t58", speId: "spe-t58", name: "T58 Spot - Custos Totais", type: "Residencial Premium", totalUnits: 52, unitsAvailable: 2, address: "Av. Prof. Maria Flora Paes Barreto, 15 - Trindade", coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80", description: "Torre T58 Spot com Studios privativos de 27m² a 36m² e Lojas Comerciais." },
  { id: "dev-01", speId: "spe-01", name: "Horizon Tower A - Sky Suites", type: "Residencial Premium", totalUnits: 40, unitsAvailable: 4, address: "Av. Beira Mar, 1050", coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80", description: "Apartamentos de 280m² com piscina privativa na varanda." },
  { id: "dev-02", speId: "spe-01", name: "Horizon Tower B - Ocean View", type: "Residencial Premium", totalUnits: 40, unitsAvailable: 6, address: "Av. Beira Mar, 1050", coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80", description: "Suítes master com closet duplo e varanda gourmet integrada." },
  { id: "dev-03", speId: "spe-02", name: "Vista Parque bloco Ipê", type: "Residencial Premium", totalUnits: 32, unitsAvailable: 2, address: "Rua Dep. Moreira da Rocha, 440", coverImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80", description: "Unidades com vista livre e perpétua para o Parque Cocó." },
  { id: "dev-04", speId: "spe-02", name: "Vista Parque bloco Jacarandá", type: "Residencial Premium", totalUnits: 32, unitsAvailable: 3, address: "Rua Dep. Moreira da Rocha, 440", coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80", description: "Planta flexível de 140m² a 190m² com isolamento acústico especial." },
];

export const calculateScoreBreakdown = (
  volume: number,
  nInv: number,
  ass: number,
  acc: number,
  yrs: number,
  sat: number,
  reInv: number,
  ref: number
) => {
  const volScore = Math.min(25, Math.round((volume / 10000000) * 25));
  const numScore = Math.min(15, nInv * 3);
  const assScore = Math.min(15, ass * 2.5);
  const accScore = Math.min(10, Math.round((acc / 50) * 10));
  const yrsScore = Math.min(10, yrs * 1.5);
  const satScore = Math.min(10, sat);
  const reInvScore = Math.min(10, reInv * 3.33);
  const refScore = Math.min(5, ref * 1);

  const total = Math.min(
    100,
    Math.round(volScore + numScore + assScore + accScore + yrsScore + satScore + reInvScore + refScore)
  );

  let tier: "Platinum" | "Gold" | "Silver" | "Bronze" = "Bronze";
  if (total >= 85) tier = "Platinum";
  else if (total >= 70) tier = "Gold";
  else if (total >= 50) tier = "Silver";

  return {
    volume: volScore,
    numInvestments: numScore,
    assemblyAttendance: assScore,
    portalAccess: accScore,
    clientTenure: yrsScore,
    satisfaction: satScore,
    reinvestments: Math.round(reInvScore),
    referrals: refScore,
    totalScore: total,
    tier,
  };
};

export const initialInvestors: Investor[] = [
""" + inv_joined + """
];

export const initialContracts: Contract[] = [
""" + ctr_joined + """
];

export const initialConstructionProgresses: ConstructionProgress[] = [
  {
    id: "prog-t58",
    speId: "spe-t58",
    overallPercentage: 78,
    lastUpdateDate: "2026-07-24",
    description: "Estrutura e fundações 100% concluídas. Instalações elétricas e hidráulicas em andamento acelerado, com revestimentos das áreas comuns já iniciados.",
    photos: [
      "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
    ],
    videos: ["https://www.w3schools.com/html/mov_bbb.mp4"],
    droneUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
    reportUrl: "#",
    stages: [
      { stage: "Fundação", percentage: 100, targetDate: "2023-06-30", status: "Concluído" },
      { stage: "Estrutura", percentage: 100, targetDate: "2024-12-15", status: "Concluído" },
      { stage: "Alvenaria", percentage: 95, targetDate: "2025-08-30", status: "Em Andamento" },
      { stage: "Cobertura", percentage: 80, targetDate: "2025-12-15", status: "Em Andamento" },
      { stage: "Acabamentos", percentage: 60, targetDate: "2026-08-30", status: "Em Andamento" },
      { stage: "Entrega", percentage: 15, targetDate: "2026-12-30", status: "Em Andamento" },
    ],
  },
];

export const initialPayments: Payment[] = [
  { id: "pay-t58-01", contractId: "ctr-t58-01", investorId: "inv-t58-01", speId: "spe-t58", amount: 15000, type: "Rendimento Bruto", dueDate: "2026-07-05", paidDate: "2026-07-05", status: "Pago" },
];

export const initialTimelineInteractions: TimelineInteraction[] = [];

export const initialDocuments: DocumentItem[] = [
  { id: "doc-t58-01", speId: "spe-t58", title: "Relatório de Vendas e Cotistas T58 SPOT SPE LTDA", category: "Relatório", uploadDate: "2026-07-20", fileSize: "3.8 MB", fileUrl: "#" },
  { id: "doc-t58-02", speId: "spe-t58", title: "Matrícula Mãe e Registro de Incorporação M-82109", category: "Matrícula", uploadDate: "2023-01-10", fileSize: "12.4 MB", fileUrl: "#" },
  { id: "doc-t58-03", speId: "spe-t58", title: "Alvará de Construção #82109 - Prefeitura de Florianópolis", category: "Licença", uploadDate: "2023-02-05", fileSize: "2.1 MB", fileUrl: "#" },
  { id: "doc-t58-04", speId: "spe-t58", title: "Balancete Contábil Trimestral SPE 13 T58", category: "Prestação de Contas", uploadDate: "2026-06-30", fileSize: "4.5 MB", fileUrl: "#" },
];

export const initialSuppliers: SupplierContract[] = [];

export const initialAssemblies: Assembly[] = [
  {
    id: "ass-t58-01",
    speId: "spe-t58",
    title: "Assembleia Geral Ordinária de Prestação de Contas e Avanço Físico T58 Spot",
    date: "2026-08-15",
    time: "19:00",
    location: "Online via Zoom / Sede ARV Florianópolis",
    virtualLink: "https://zoom.us/j/t58spot",
    status: "Agendada",
    description: "Apresentação dos resultados financeiros e cronograma detalhado de acabamentos dos studios T58.",
    rsvpStatus: {},
  },
];

export const initialCampaigns: CommunicationCampaign[] = [];

export const initialNotifications: NotificationItem[] = [
  {
    id: "notif-t58-01",
    title: "Nova Newsletter T58 Spot Disponível",
    message: "A edição de Julho/2026 da Newsletter Inteligente T58 SPOT SPE LTDA já está disponível para consulta.",
    date: "2026-07-24",
    read: false,
    type: "info",
  },
];

export const initialAIRecommendations: AIRecommendation[] = [];

export const initialLeads: any[] = [];

export const initialOnboardings: any[] = [];

export const initialNewsletters: SmartNewsletter[] = [
  {
    id: "news-t58",
    editionName: "Central de Newsletters - 13 - T58 SPOT SPE LTDA - Edição Julho/2026",
    editionDate: "2026-07-24",
    frequency: "Mensal",
    speId: "spe-t58",
    speName: "13 - T58 SPOT SPE LTDA",
    developmentName: "T58 Spot - Custos Totais",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    status: "Publicado",
    channels: ["EMAIL", "WHATSAPP", "PORTAL", "PUSH"],
    aiSummary:
      "Informativo Oficial do Empreendimento T58 Spot (Empresa 13 - T58 SPOT SPE LTDA). A obra alcançou 78% de avanço físico com fundações e estruturas 100% concluídas. A captação soma R$ 16.845.321 em 50 contratos com 46 cotistas ativos. Confira o andamento das instalações e o cronograma do 2º semestre.",
    card1Resumo: {
      speName: "13 - T58 SPOT SPE LTDA",
      developmentName: "T58 Spot - Custos Totais",
      city: "Florianópolis",
      neighborhood: "Trindade",
      engineerLead: "Eng. Jean Carlos Estipe",
      startDate: "2023-01-15",
      estimatedCompletion: "2026-12-30",
      executedPercentage: 78,
      investorsCount: 46,
      totalRaised: 16845321,
      scheduleStatus: "no_prazo",
    },
    card2Evolucao: {
      executedPercentage: 78,
      plannedPercentage: 76,
      completedStages: ["Fundações Profundas", "Estrutura Principal de Concreto", "Fechamentos Perimetrais"],
      inProgressStages: ["Alvenaria Interna", "Instalações Elétricas e Hidráulicas", "Revestimentos Cerâmicos"],
      nextStages: ["Pintura e Esquadrias", "Paisagismo e Áreas Comuns", "Vistoria e Habite-se"],
      monthlyHighlightText:
        "Neste período avançamos na conclusão das instalações hidráulicas e elétricas do bloco de studios T58 Spot. A obra manteve +2% de ritmo à frente do cronograma inicial com 78% do projeto executado.",
      previousMonthPhoto: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      currentMonthPhoto: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
    card3Galeria: [
      { id: "gal-t58-01", title: "Vista Panorâmica da Fachada T58", type: "drone", url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80", date: "2026-07-20", description: "Avanço dos revestimentos externos em Florianópolis." },
      { id: "gal-t58-02", title: "Instalações de Studios T58", type: "foto", url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80", date: "2026-07-18", description: "Prumadas elétricas e tubulações hidráulicas concluídas nos andares intermediários." },
    ],
    card4Indicadores: {
      physicalProgress: 78,
      scheduleAdherencePct: 102,
      safetyDaysNoAccidents: 540,
      licensesStatus: "Alvará de Construção #82109 e LI em dia",
      documentationStatus: "Matrícula Mãe e Incorporação Registradas em Florianópolis",
      investmentRealized: 14200000,
      nextMilestone: "Início dos Acabamentos Finais dos Studios (Setembro/2026)",
    },
    card5NovidadesComerciais: [
      { id: "com-t58-01", title: "Últimas 2 Unidades de Studios Disponíveis", description: "Oportunidade final de aporte na SPE T58 Spot com taxa de ocupação projetada em 92% para locação em Trindade.", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", badge: "Apenas 2 Unidades", ctaText: "Ver Simulador de Retorno", ctaUrl: "/portal" },
    ],
    card6Comunicados: [
      { id: "ann-t58-01", type: "Prestação de Contas", title: "Relatório de Vendas e Aportes T58 Atualizado", content: "O relatório consolidado de vendas com 50 contratos e 46 cotistas ativos foi disponibilizado no Portal do Investidor.", date: "2026-07-20" },
    ],
    card7Eventos: [
      { id: "evt-t58-01", type: "Visita à Obra", title: "Visita Guiada da Engenharia aos Studios T58", date: "2026-08-10", time: "10:00", location: "Canteiro de Obras T58 Spot - Trindade, Florianópolis" },
    ],
    card8Timeline: [
      { id: "tl-t58-01", stage: "Fundações e Estruturas", status: "completed", estimatedDate: "Concluído em Dez/2024" },
      { id: "tl-t58-02", stage: "Alvenarias e Vedação", status: "in_progress", estimatedDate: "Em Execução (80%)" },
      { id: "tl-t58-03", stage: "Instalações e Revestimentos", status: "in_progress", estimatedDate: "Em Execução (60%)" },
      { id: "tl-t58-04", stage: "Vistorias e Habite-se", status: "planned", estimatedDate: "Previsto para Nov/2026" },
    ],
    card9Faqs: [
      { id: "faq-t58-01", question: "Qual a previsão atualizada de entrega do T58 Spot?", answer: "A previsão segue confirmada para dezembro de 2026, com habite-se e vistoria prévia agendada para novembro." },
    ],
    card10Portal: {
      newDocsCount: 4,
      newPhotosCount: 8,
      unreadMessagesCount: 0,
      upcomingPaymentsCount: 0,
      notificationsCount: 1,
      ctaUrl: "/portal",
    },
    card11Gerente: {
      name: "Eng. Jean Carlos Estipe",
      role: "Responsável Técnico & Relações com Investidores (SPE T58)",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      phone: "(48) 99123-4567",
      whatsapp: "+5548991234567",
      email: "jean.estipe@arvinc.com.br",
    },
    stats: {
      sentCount: 46,
      deliveryRate: 100,
      openRate: 94,
      clicksPerSection: {
        "Resumo Executivo": 42,
        "Evolução da Obra": 45,
        "Galeria de Fotos": 44,
        "Novidades Comerciais": 38,
        "Portal do Investidor": 41,
        "Contato Gerente": 22,
      },
      docDownloads: 35,
      photoViews: 180,
      portalVisitsGenerated: 48,
      mostAccessedSPE: "13 - T58 SPOT SPE LTDA",
      engagementByInvestor: [
        { investorId: "inv-t58-01", investorName: "HGLM Administração Patrimonial LTDA", opensCount: 6, clicksCount: 12, lastAccessDate: "2026-07-24" },
        { investorId: "inv-t58-02", investorName: "Alfredo Gilberto Lima de Magalhaes", opensCount: 5, clicksCount: 9, lastAccessDate: "2026-07-24" },
        { investorId: "inv-t58-05", investorName: "Marcelo Moreira Ferraz", opensCount: 7, clicksCount: 14, lastAccessDate: "2026-07-24" },
      ],
    },
  },
];
"""

with open('src/data/initialData.ts', 'w') as f:
    f.write(full_ts_code)

print("Regenerated initialData.ts without investorId on NotificationItem!")
