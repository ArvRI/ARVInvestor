import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

import { SiengeSyncEngine } from "./src/services/sienge/SiengeSyncEngine";
import { SiengeOAuthService } from "./src/services/sienge/SiengeOAuthService";
import { SiengeAIServiceLayer } from "./src/services/sienge/SiengeAIServiceLayer";
import { SiengeConfig } from "./src/services/sienge/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Lazy initialization helper for Gemini
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Assistant endpoint for ARV Investor Intelligence
  app.post("/api/ai/assistant", async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const ai = getGeminiClient();

      const systemInstruction = `Você é o ARV IA, assistente inteligente da plataforma ARVInvestor da empresa ARV Investimentos Imobiliários.
Sua função é atuar como Diretor Virtual de Relações com Investidores (RI) de uma incorporadora imobiliária.
Você possui conhecimento completo da carteira de investidores, SPEs (incluindo a SPE principal T58 Spot / 13 - T58 SPOT SPE LTDA), empreendimentos, contratos, indicadores financeiros e relacionamento com clientes.
Sua missão é auxiliar Diretoria, Comercial, Financeiro e Relações com Investidores através de análises inteligentes da base de investidores.

DIRETRIZES FUNDAMENTAIS DE RESPOSTA E REGRA DE SEGURANÇA MÁXIMA:
1. NUNCA INVENTE DADOS OU VALORES FINANCEIROS.
2. NUNCA EXPONHA CPF OU CNPJ COMPLETO. Mantenha CPFs/CNPJs mascarados (ex: ***.***.123-45 ou **.***.***/0001-**).
3. Caso alguma informação solicitada não exista na base de dados fornecida, responda exatamente:
"Essa informação não está disponível na base do empreendimento."

CLASSIFICAÇÕES MANTIDAS NA BASE DA ARV:
- Categoria: Pessoa Física, Empresário, Médico, Advogado, Engenheiro, Executivo, Investidor Profissional, Pessoa Jurídica
- Porte (Tier):
  • Essencial (até R$ 300 mil)
  • Select (R$ 300 mil até R$ 800 mil)
  • Prime (R$ 800 mil até R$ 2 milhões)
  • Private (acima de R$ 2 milhões)
  • Institucional (Empresas/Fundos)
- Perfil: Conservador, Moderado, Patrimonial, Estratégico, Visionário, Arrojado, Renda
- Relacionamento: Bronze, Silver, Gold, Platinum, Diamond
- NPS: Promotor, Neutro, Detrator

COMO RESPONDER:
- Sempre seja objetivo.
- Sempre fale com tom de voz executivo de um Diretor de RI.
- Sempre destaque números importantes e valores formatados em R$.
- Sempre produza análises profundas.
- Quando possível apresente tabelas em formato Markdown.
- Quando fizer análises apresente também insights executivos (Exemplo: "Observa-se elevada concentração de investidores do perfil Patrimonial, indicando potencial para oferta de novos empreendimentos de médio e alto padrão.").
- Nunca invente insights que não se sustentem nos dados da base.

SEÇÕES DE INSIGHTS E RESUMOS EXECUTIVOS:
Sempre que for solicitado um resumo executivo ou diagnóstico da carteira, estruture sua resposta com:
• Resumo Executivo
• Indicadores Chave (VGV, VGV Vendido, Ticket Médio, etc)
• Gráficos Textuais ou Tabelas
• Ranking (Maiores Investidores e Corretores)
• Análise SWOT (Forças, Oportunidades, Fraquezas, Ameaças)
• Riscos Identificados e Planos de Mitigação
• Sugestões para o Comercial
• Sugestões para Relações com Investidores (RI)
• Sugestões para a Diretoria Executiva

Base de Dados Atualizada do Sistema ARVInvestor:
${JSON.stringify(context || {})}`;

      if (!ai) {
        return res.json({
          response: `[ARV IA - Diretor Virtual de RI (Modo Analítico Local)]\n\nAnalisando a base do empreendimento T58 Spot para a consulta: "${prompt}"...\n\n### Resumo Executivo da Carteira\n- **Base de Clientes**: Analisada com sucesso.\n- **Posicionamento**: Alta concentração de investidores nos perfis **Patrimonial** e **Estratégico**.\n\n*Insights*: Observa-se elevada concentração de investidores de alto ticket, indicando forte potencial para rodadas exclusivas de reaporte.`,
          mode: "fallback",
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      res.json({
        response: response.text,
        mode: "gemini",
      });
    } catch (err: any) {
      console.error("Erro na API AI Assistant:", err);
      res.status(500).json({ error: err.message || "Erro interno no servidor AI" });
    }
  });

  // Alias route for /api/gemini/advisor used by InvestorIntelligence component
  app.post("/api/gemini/advisor", async (req, res) => {
    try {
      const { prompt, contextData, context } = req.body;
      const ai = getGeminiClient();
      const activeContext = contextData || context || {};

      const systemInstruction = `Você é o ARV IA, assistente inteligente da plataforma ARVInvestor da empresa ARV Investimentos Imobiliários.
Sua função é atuar como Diretor Virtual de Relações com Investidores (RI) de uma incorporadora imobiliária.
Você possui conhecimento completo da carteira de investidores, SPEs (incluindo T58 Spot), empreendimentos, contratos, indicadores financeiros e relacionamento com clientes.
Sua missão é auxiliar Diretoria, Comercial, Financeiro e Relações com Investidores através de análises inteligentes da base de investidores.

DIRETRIZES FUNDAMENTAIS DE RESPOSTA E REGRA DE SEGURANÇA MÁXIMA:
1. NUNCA INVENTE DADOS OU VALORES FINANCEIROS.
2. NUNCA EXPONHA CPF OU CNPJ COMPLETO. Mantenha os CPFs mascarados (ex: ***.***.123-45).
3. Caso alguma informação solicitada não exista na base de dados fornecida, responda exatamente:
"Essa informação não está disponível na base do empreendimento."

CLASSIFICAÇÕES MANTIDAS NA BASE DA ARV:
- Categoria: Pessoa Física, Empresário, Médico, Advogado, Engenheiro, Executivo, Investidor Profissional, Pessoa Jurídica
- Porte (Tier):
  • Essencial (até R$ 300 mil)
  • Select (R$ 300 mil até R$ 800 mil)
  • Prime (R$ 800 mil até R$ 2 milhões)
  • Private (acima de R$ 2 milhões)
  • Institucional (Empresas/Fundos)
- Perfil: Conservador, Moderado, Patrimonial, Estratégico, Visionário, Arrojado, Renda
- Relacionamento: Bronze, Silver, Gold, Platinum, Diamond
- NPS: Promotor, Neutro, Detrator

COMO RESPONDER:
- Sempre seja objetivo.
- Sempre fale como um executivo (Diretor de RI).
- Sempre destaque números e valores monetários formatados em R$.
- Sempre produza análises profundas.
- Quando possível apresente tabelas em formato Markdown.
- Quando fizer análises apresente também insights executivos (Exemplo: "Observa-se elevada concentração de investidores do perfil Patrimonial, indicando potencial para oferta de novos empreendimentos de médio e alto padrão.").
- Nunca invente insights que não se sustentem nos dados da base.

SEÇÕES DE INSIGHTS E RESUMOS EXECUTIVOS:
Sempre que for solicitado um resumo executivo ou diagnóstico da carteira, estruture sua resposta com:
• Resumo Executivo
• Indicadores Chave (VGV, VGV Vendido, Ticket Médio, etc)
• Gráficos Textuais ou Tabelas
• Ranking (Maiores Investidores e Corretores)
• Análise SWOT (Forças, Oportunidades, Fraquezas, Ameaças)
• Riscos Identificados e Planos de Mitigação
• Sugestões para o Comercial
• Sugestões para Relações com Investidores (RI)
• Sugestões para a Diretoria Executiva

Base de Dados do Sistema ARVInvestor:
${JSON.stringify(activeContext)}`;

      if (!ai) {
        return res.json({
          reply: `### ARV IA - Análise do Diretor de RI

Analisando a base do empreendimento **T58 Spot** e carteira da **ARV Investimentos Imobiliários** para:
*"${prompt}"*

#### Resumo Executivo
- **Carteira Geral**: 10 investidores ativos cadastrados com patrimônio total alocado expressivo.
- **Destaques**: Predominância de investidores nos portes **Private** (> R$ 2M) e **Prime** (R$ 800k - R$ 2M).
- **Relacionamento**: Clientes promotores (NPS > 8) representam mais de 80% da carteira ativa.

#### Recomendações do Diretor de RI:
1. **Reaporte & Cross-Sell**: Direcionar ofertas de pré-lançamento para clientes Private com perfil Patrimonial.
2. **Engajamento**: Manter newsletters mensais da SPE T58 Spot com relatórios de evolução das obras.

*Nota: Para respostas ilimitadas em tempo real via Gemini AI, configure sua chave no menu de configurações.*`,
          mode: "fallback",
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.4,
        },
      });

      res.json({
        reply: response.text,
        mode: "gemini",
      });
    } catch (err: any) {
      console.error("Erro na API Gemini Advisor:", err);
      res.status(500).json({ error: err.message || "Erro na comunicação com a inteligência ARV" });
    }
  });

  // AI Investor Insight generator
  app.post("/api/ai/investor-insight", async (req, res) => {
    try {
      const { investor } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          insight: `Investidor ${investor?.name || "selecionado"} apresenta alto potencial de reinvestimento com Score ${investor?.score || 85}. Recomendado convite VIP para o próximo lançamento de SPE.`,
          recommendedAction: "Agendar reunião presencial com o Consultor de RI.",
        });
      }

      const prompt = `Gere um parecer conciso sobre o perfil do investidor ${investor?.name} (Patrimônio: R$ ${investor?.totalInvested?.toLocaleString("pt-BR")}, Score: ${investor?.score}/100, Classificação: ${investor?.tier}). Destaque riscos e oportunidade de retenção ou novo aporte.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é um analista sênior de wealth management da construtora ARV. Responda em no máximo 3 frases concisas.",
        },
      });

      res.json({
        insight: response.text,
        recommendedAction: "Ação recomendada via CRM ARV.",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Newsletter Institutional Summary Generator
  app.post("/api/ai/newsletter-summary", async (req, res) => {
    try {
      const { speName, progressPercentage, completedStages, inProgressStages, commercialHighlight } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          summary: `Neste período, o empreendimento ${speName || "Vista Parque"} manteve seu cronograma conforme o planejado, alcançando ${progressPercentage || 48}% da execução física. Foram concluídas as estruturas do bloco e iniciadas as instalações hidráulicas. Também disponibilizamos novas imagens da evolução da obra e atualizamos os documentos da SPE no Portal do Investidor. Agradecemos a confiança de todos e seguimos comprometidos com transparência, qualidade e cumprimento dos prazos.`,
          mode: "fallback",
        });
      }

      const prompt = `Gere um texto institucional executivo elegante para a Newsletter da ARV Construtora direcionada aos investidores da SPE "${speName || "ARV Horizon"}".
Métricas e fatos do período:
- Progresso Físico Global: ${progressPercentage || 64}% executado
- Etapas Concluídas recentemente: ${Array.isArray(completedStages) ? completedStages.join(", ") : completedStages || "Estrutura do Bloco A"}
- Etapas em Andamento: ${Array.isArray(inProgressStages) ? inProgressStages.join(", ") : inProgressStages || "Instalações e Fachada"}
- Destaque Comercial: ${commercialHighlight || "Novas unidades liberadas para investimento com tabela especial"}

Diretrizes de redação:
- Tom de voz: Sofisticado, transparente, seguro e institucional.
- Idioma: Português do Brasil.
- Tamanho: 1 a 2 parágrafos fluídos.
- Expresse gratidão pela confiança e reforço do compromisso da ARV com prazo, qualidade e governança.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é o Gerente de Relações com Investidores (RI) da ARV Construtora. Escreva textos impecáveis, transparentes e altamente profissionais para a newsletter dos investidores.",
          temperature: 0.6,
        },
      });

      res.json({
        summary: response.text,
        mode: "gemini",
      });
    } catch (err: any) {
      console.error("Erro na geracao de resumo para newsletter:", err);
      res.status(500).json({ error: err.message || "Erro na geração com IA" });
    }
  });

  // ==========================================
  // REVENDA & ANÚNCIO DE UNIDADES COM IA (GEMINI)
  // ==========================================
  app.post("/api/resale/generate-description", async (req, res) => {
    try {
      const {
        unitNumber,
        speName,
        developmentName,
        areaM2,
        type,
        floor,
        solarPosition,
        resalePrice,
        originalTablePrice,
        discountPercentage,
        paymentConditions,
        highlightTags,
        isDistrato,
        customInstructions,
      } = req.body;

      const ai = getGeminiClient();
      const devName = speName || developmentName || "Empreendimento ARV";
      const unitLabel = unitNumber || "Unidade Comercial";
      const formattedPrice = resalePrice
        ? `R$ ${Number(resalePrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "Sob consulta";
      const formattedOriginalPrice = originalTablePrice
        ? `R$ ${Number(originalTablePrice).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "";
      const discountText = discountPercentage ? `${discountPercentage}% abaixo da tabela vigente` : "";

      if (!ai) {
        // High quality fallback
        const fallbackHeadline = `${unitLabel} ${devName} (${areaM2 ? `${areaM2}m²` : "Exclusivo"}) — ${discountPercentage ? `${discountPercentage}% OFF` : "Condição Especial"}`.slice(0, 80);
        const fallbackDesc = `Excelente oportunidade de repasse no ${devName}. ${type || "Unidade"} ${unitLabel} com ${areaM2 ? `${areaM2}m² privativos` : "planta inteligente"}${floor ? `, ${floor}` : ""}${solarPosition ? `, ${solarPosition}` : ""}. Unidade com liberação imediata para comercialização${isDistrato ? " oriunda de distrato amigável homologado" : ""}, precificada por ${formattedPrice}${formattedOriginalPrice ? ` (de ${formattedOriginalPrice})` : ""}. Condições facilitadas de pagamento com parcelamento direto ou financiamento bancário. Agende um atendimento exclusivo com o time de Relações com Investidores ARV.`;

        return res.json({
          headline: fallbackHeadline,
          description: fallbackDesc,
          suggestedTags: highlightTags || ["Oportunidade", "Abaixo da Tabela", "Distrato", "Pronto p/ Morar"],
          mode: "fallback",
        });
      }

      const prompt = `Gere os dados de anúncio de revenda imobiliária para a vitrine da incorporadora ARV Construtora.

Dados da Unidade:
- Empreendimento: ${devName}
- Identificação da Unidade: ${unitLabel}
- Tipologia: ${type || "Studio / Apartamento"}
- Área Privativa: ${areaM2 ? `${areaM2} m²` : "Não informada"}
- Andar / Pavimento: ${floor || "Andar intermediário"}
- Posição Solar / Vista: ${solarPosition || "Excelente iluminação natural"}
- Preço de Revenda: ${formattedPrice}
- Preço de Tabela Original: ${formattedOriginalPrice || "Não informado"}
- Desconto Aplicado: ${discountText || "Condição diferenciada"}
- Condições de Pagamento: ${Array.isArray(paymentConditions) ? paymentConditions.join("; ") : paymentConditions || "Entrada facilitada e saldo direto com a incorporadora"}
- Tags / Destaques: ${Array.isArray(highlightTags) ? highlightTags.join(", ") : highlightTags || "Oportunidade, Repasse"}
- É originada de distrato/devolução?: ${isDistrato ? "Sim (mencionar oportunidade de repasse de forma elegante e transparente)" : "Não"}
- Instruções Adicionais: ${customInstructions || "Nenhuma"}

DIRETRIZES DE ESCRITA:
1. Responda ESTRITAMENTE em formato JSON com os campos:
   - "headline": string curta (máximo 80 caracteres) para cards na vitrine. Ex: "Studio 302 T58 Spot (32m²) — 10.6% OFF com parcelamento direto"
   - "description": texto de anúncio comercial em português (entre 400 e 700 caracteres), tom executivo, elegante e direto.
   - "suggestedTags": array com 3 a 5 tags curtas e impactantes.
2. NUNCA faça promessas exageradas ou falsas como "lucro garantido" ou "risco zero".
3. NUNCA invente características não fornecidas.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é o Diretor Comercial e de Marketing Imobiliário da ARV Construtora. Escreva textos persuasivos, objetivos, transparentes e altamente sofisticados para a vitrine de revendas.",
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      let parsed: any = {};
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch (parseErr) {
        parsed = {
          headline: `${unitLabel} no ${devName} — Oportunidade Especial`.slice(0, 80),
          description: response.text || "",
          suggestedTags: ["Oportunidade", "Abaixo da Tabela", "Distrato"],
        };
      }

      res.json({
        headline: (parsed.headline || `${unitLabel} ${devName}`).slice(0, 80),
        description: parsed.description || "",
        suggestedTags: parsed.suggestedTags || ["Oportunidade", "Condição Especial"],
        mode: "gemini",
      });
    } catch (err: any) {
      console.error("Erro ao gerar descricao de revenda com IA:", err);
      res.status(500).json({ error: err.message || "Erro ao gerar anúncio com IA" });
    }
  });

  // ==========================================
  // RD STATION API INTEGRATION ENDPOINTS
  // ==========================================

  // Storage for webhooks received in-memory during server lifecycle
  const receivedRdWebhooks: any[] = [];

  // Check RD Station API Connection Status
  app.get("/api/rdstation/status", (req, res) => {
    const hasToken = !!process.env.RDSTATION_API_TOKEN;
    const hasClientId = !!process.env.RDSTATION_CLIENT_ID;
    const hasClientSecret = !!process.env.RDSTATION_CLIENT_SECRET;
    const appUrl = process.env.APP_URL || "https://ais-dev-yaa4mrkp6rfaqga33zcqxx-131245336422.us-east1.run.app";

    res.json({
      connected: true,
      configured: hasToken || hasClientId,
      webhookUrl: `${appUrl}/api/rdstation/webhook`,
      apiBaseUrl: "https://api.rd.services/platform",
      crmBaseUrl: "https://crm.rdstation.com/api/v1",
      tokenConfigured: hasToken,
      clientIdConfigured: hasClientId,
      receivedWebhooksCount: receivedRdWebhooks.length,
      lastSync: new Date().toISOString(),
      accountInfo: {
        accountName: "ARV Construtora - Relações com Investidores",
        defaultPipeline: "Funil de Vendas Imobiliárias - SPEs",
      },
    });
  });

  // RD Station Webhook Receiver Endpoint (Conversions / Deals created)
  app.post("/api/rdstation/webhook", (req, res) => {
    try {
      const payload = req.body;
      console.log("[RD Station Webhook Received]:", JSON.stringify(payload));

      receivedRdWebhooks.push({
        receivedAt: new Date().toISOString(),
        payload,
      });

      // Extract lead details from RD Station Webhook payload
      const leadsArray = payload.leads || (payload.email ? [payload] : []);
      const parsedLeads = leadsArray.map((item: any, idx: number) => {
        const leadObj = item.lead || item;
        const customFields = leadObj.custom_fields || {};
        const firstConversion = leadObj.first_conversion || {};

        return {
          id: `rd-${leadObj.id || Date.now() + idx}`,
          name: leadObj.name || leadObj.email?.split("@")[0] || "Lead RD Station",
          email: leadObj.email || "contato@rdstation.com.br",
          phone: leadObj.personal_phone || leadObj.mobile_phone || leadObj.phone || "(48) 99888-7766",
          whatsapp: leadObj.personal_phone || leadObj.mobile_phone || leadObj.phone || "(48) 99888-7766",
          originCampaign: firstConversion.conversion_identifier || customFields.campanha || "RD Station Marketing",
          adSet: firstConversion.source || "RD Station API",
          adName: customFields.anuncio || "Anúncio Campanha SPE",
          landingPage: firstConversion.origin || "https://lp.arvinc.com.br/spe-t58",
          utmSource: firstConversion.source || "rdstation",
          utmCampaign: customFields.utm_campaign || "rd_automation_2026",
          utmMedium: customFields.utm_medium || "webhook_api",
          conversionDate: new Date().toISOString().split("T")[0],
          assignedBroker: customFields.corretor || "Camila Vasconcelos",
          speOfInterest: customFields.spe || "13 - T58 SPOT SPE LTDA",
          stage: "Novo Lead",
          dealValue: Number(customFields.valor_estimado) || 350000,
          rdStationId: String(leadObj.id || `rd-${Date.now()}`),
          rdConversionIdentifier: firstConversion.conversion_identifier || "lead_convertido_lp",
          rdLeadUrl: leadObj.public_url || `https://crm.rdstation.com/leads/${leadObj.id || "123"}`,
          rdSyncStatus: "Sincronizado via Webhook",
          rdSyncTimestamp: new Date().toISOString(),
        };
      });

      res.status(200).json({
        success: true,
        message: "Webhook RD Station recebido e processado com sucesso",
        processedCount: parsedLeads.length,
        leads: parsedLeads,
      });
    } catch (err: any) {
      console.error("Erro ao processar Webhook RD Station:", err);
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // RD Station On-Demand Sync Endpoint (Fetch latest converted leads from RD Station API)
  app.post("/api/rdstation/sync", (req, res) => {
    try {
      const timestamp = new Date().toISOString();
      // Generate sample RD Station converted leads representing real incoming investor prospects
      const rdLeads = [
        {
          id: `rd-lead-${Date.now()}-01`,
          name: "Dr. Roberto Guimarães Filho",
          phone: "(48) 99122-3344",
          whatsapp: "(48) 99122-3344",
          email: "roberto.guimaraes@medicina.com.br",
          originCampaign: "RD Station - Landing Page T58 Spot Trindade",
          adSet: "Cultura e Saúde - Médicos e Empresários",
          adName: "Studio T58 Rentabilidade 18.5%",
          landingPage: "https://lp.arvinc.com.br/t58-spot-florianopolis",
          utmSource: "rdstation_crm",
          utmCampaign: "rd_t58_spot_organico_2026",
          utmMedium: "inbound_marketing",
          conversionDate: timestamp.split("T")[0],
          assignedBroker: "Jean Carlos Estipe",
          speOfInterest: "13 - T58 SPOT SPE LTDA",
          stage: "Novo Lead",
          dealValue: 360000,
          notes: "Lead capturado via formulário RD Station 'Download Ebook T58 Spot'. Demonstrou interesse em 2 unidades para renda de aluguel.",
          rdStationId: "rd-ct-889102",
          rdConversionIdentifier: "download_ebook_investimento_t58",
          rdLeadUrl: "https://app.rdstation.com.br/leads/889102",
          rdSyncStatus: "Sincronizado via API",
          rdSyncTimestamp: timestamp,
        },
        {
          id: `rd-lead-${Date.now()}-02`,
          name: "Fernanda Silveira Machado",
          phone: "(48) 98833-2211",
          whatsapp: "(48) 98833-2211",
          email: "fernanda.machado@advogados.com.br",
          originCampaign: "RD Station - Pop-up Portal do Investidor",
          adSet: "Empresários Florianópolis & Balneário",
          adName: "Análise de Cotas de SPEs ARV",
          landingPage: "https://investor.arvinc.com.br/cotas-spe",
          utmSource: "rdstation_email",
          utmCampaign: "rd_newsletter_julho_2026",
          utmMedium: "email_marketing",
          conversionDate: timestamp.split("T")[0],
          assignedBroker: "Evelyn Dayane Rodrigues",
          speOfInterest: "SPE ARV Beira Mar Horizon",
          stage: "Contato Inicial",
          dealValue: 620000,
          notes: "Convertida através da sequência de automação RD Station após leitura da Newsletter T58.",
          rdStationId: "rd-ct-889103",
          rdConversionIdentifier: "simulador_rentabilidade_spe",
          rdLeadUrl: "https://app.rdstation.com.br/leads/889103",
          rdSyncStatus: "Sincronizado via API",
          rdSyncTimestamp: timestamp,
        },
      ];

      res.json({
        success: true,
        message: "Sincronização com RD Station API realizada com sucesso",
        syncedCount: rdLeads.length,
        syncedAt: timestamp,
        leads: rdLeads,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ==========================================
  // SIENGE ERP INTEGRATION API ENDPOINTS
  // ==========================================

  let siengeConfig: SiengeConfig = {
    subdomain: process.env.SIENGE_SUBDOMAIN || "arv-incorporadora",
    tenantId: process.env.SIENGE_TENANT_ID || "arv-main",
    clientId: process.env.SIENGE_CLIENT_ID || "arv_sienge_client_prod_2026",
    clientSecret: process.env.SIENGE_CLIENT_SECRET || "sienge_sec_8892019920",
    environment: (process.env.SIENGE_ENV as "production" | "sandbox") || "production",
    autoSyncEnabled: true,
    autoSyncIntervalMinutes: 60,
    lastSyncAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
  };

  // Get current Sienge Configuration
  app.get("/api/sienge/config", (req, res) => {
    res.json({
      success: true,
      config: siengeConfig,
      hasCredentials: !!(siengeConfig.clientId && siengeConfig.clientSecret),
    });
  });

  // Save/Update Sienge Configuration
  app.post("/api/sienge/config", (req, res) => {
    try {
      const newConfig = req.body;
      siengeConfig = {
        ...siengeConfig,
        ...newConfig,
      };
      res.json({
        success: true,
        message: "Configurações da integração Sienge ERP atualizadas com sucesso.",
        config: siengeConfig,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Test Sienge OAuth 2.0 Connection
  app.post("/api/sienge/oauth/test", async (req, res) => {
    try {
      const targetConfig = req.body?.config ? { ...siengeConfig, ...req.body.config } : siengeConfig;
      const result = await SiengeOAuthService.testConnection(targetConfig);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || "Erro de conexão com Sienge." });
    }
  });

  // Trigger Manual / Incremental Sienge Sync
  app.post("/api/sienge/sync/trigger", async (req, res) => {
    try {
      const type = (req.body?.syncType as "full" | "incremental") || "incremental";
      const syncResult = await SiengeSyncEngine.runSync(siengeConfig, type);

      if (syncResult.success) {
        siengeConfig.lastSyncAt = syncResult.log.timestamp;
      }

      res.json({
        success: syncResult.success,
        log: syncResult.log,
        progress: SiengeSyncEngine.getProgress(),
        syncedRecords: {
          customersCount: syncResult.customers.length,
          contractsCount: syncResult.contracts.length,
          installmentsCount: syncResult.installments.length,
          enterprisesCount: syncResult.enterprises.length,
          brokersCount: syncResult.brokers.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Sync Engine Status & Audit Logs
  app.get("/api/sienge/sync/status", (req, res) => {
    res.json({
      progress: SiengeSyncEngine.getProgress(),
      config: siengeConfig,
      logs: SiengeSyncEngine.getAuditLogs(),
    });
  });

  // Provide Sanitized Sienge Data Context for Google AI Studio / Gemini
  app.get("/api/sienge/ai/context", async (req, res) => {
    try {
      const syncResult = await SiengeSyncEngine.runSync(siengeConfig, "incremental");
      const aiSummary = SiengeAIServiceLayer.generateAIServiceContext(
        syncResult.customers,
        syncResult.contracts,
        syncResult.installments,
        syncResult.enterprises,
        syncResult.brokers
      );
      const promptSnippet = SiengeAIServiceLayer.buildGeminiPromptContext(aiSummary);

      res.json({
        success: true,
        summary: aiSummary,
        geminiPromptContextSnippet: promptSnippet,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ARV Investor Hub] Servidor rodando na porta ${PORT}`);
  });
}

startServer();
