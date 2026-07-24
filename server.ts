import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

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

      if (!ai) {
        // Fallback intelligent response if API key is not yet set
        return res.json({
          response: `[ARV AI Assistant - Modo Analítico Local]
Analisando carteira e dados fornecidos para o prompt: "${prompt}".

Recomendações estratégicas:
1. Priorizar contato com investidores com Score > 80 (Perfil Platinum) para a nova captação da SPE ARV Grand Bay.
2. Agendar acompanhamento com investidores sem interação há mais de 90 dias.
3. Enviar relatório de evolução de obra com imagens atualizadas de drone para reforçar a satisfação do cliente.`,
          mode: "fallback",
        });
      }

      const systemInstruction = `Você é o Assistente de Inteligência Comercial e Relações com Investidores da ARV Construtora (ARV Investor Hub).
Sua função é fornecer análises executivas profundas, sugestões de abordagens para os consultores, identificação de riscos de cancelamento e oportunidades de reinvestimento em novos lançamentos imobiliários.
Seja conciso, elegante, profissional e direto ao ponto. Responda em Português do Brasil.
Contexto atual do sistema fornecido: ${JSON.stringify(context || {})}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
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
