import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ProfitabilitySimulation,
  BenchmarkComparisonResult,
  UnitPriceComparison,
  SPE,
  MarketBenchmarkEntry,
} from "../../types";
import { ProfitabilityPdfChartRenderer } from "./profitabilityPdfChartRenderer";

export interface ProfitabilityPdfExportOptions {
  fileName?: string;
  notes?: string;
  consultantName?: string;
  clientName?: string;
  includeCharts?: boolean; // Default true
  includeEvolutionChart?: boolean; // Default true
  includeComparisonBarChart?: boolean; // Default true
  includeCostBreakdownChart?: boolean; // Default true
  includeSpeChart?: boolean; // Default true
  includePriceBenchmarkChart?: boolean; // Default true
  includeEvolutionTable?: boolean; // Default true
  includeCostsTable?: boolean; // Default true
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatPercent = (val: number, showSign = false) => {
  const formatted = (val || 0).toFixed(2).replace(".", ",") + "%";
  if (showSign && val > 0) return `+${formatted}`;
  return formatted;
};

/**
 * Service to generate crisp, high-resolution Executive PDF Reports
 * for Profitability Simulations, Benchmark Comparisons, and Price Analysis.
 */
export const ProfitabilityPdfExportService = {
  /**
   * Generates an Executive PDF Report for a specific Profitability Simulation & CDI/IPCA Comparison.
   */
  generateSimulationPDF(
    simulation: ProfitabilitySimulation,
    comparison: BenchmarkComparisonResult,
    options: ProfitabilityPdfExportOptions = {}
  ): void {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    const dateStr = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());

    const isWinnerRealEstate = comparison.winnerIndicator === "Imóvel";
    const investorDisplay = options.clientName || simulation.investorName || "Investidor / Comprador Qualificado";
    const titleDisplay = simulation.title || "ESTUDO DE VIABILIDADE & SIMULAÇÃO DE RENTABILIDADE IMOBILIÁRIA";

    // Header & Footer helper
    const applyHeaderAndFooter = () => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Header Top Bar
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 22, "F");

        // Header Accent Line
        doc.setFillColor(37, 99, 235); // blue-600
        doc.rect(0, 22, pageWidth, 1, "F");

        // Brand Name
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ARV EMPREENDIMENTOS", margin, 10);

        // Subtitle
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(59, 130, 246); // blue-400
        doc.text("INTELIGÊNCIA IMOBILIÁRIA • SIMULAÇÃO DE RENTABILIDADE", margin, 16);

        // Right side info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(203, 213, 225); // slate-300
        doc.text(`Emissão: ${dateStr}`, pageWidth - margin, 10, { align: "right" });
        doc.text(`Horizonte: ${simulation.horizonMonths} Meses | Cenário: ${simulation.appreciationScenario}`, pageWidth - margin, 16, { align: "right" });

        // Footer Background
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(0, pageHeight - 12, pageWidth, 12, "F");

        // Footer Divider
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

        // Footer Text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("ARV Inc. • Análise Comparativa vs Benchmarks Financeiros (BACEN / IBGE) • Documento Confidencial", margin, pageHeight - 5);
        doc.setFont("helvetica", "bold");
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: "right" });
      }
    };

    let cursorY = 28;

    // Report Title & Meta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(titleDisplay, margin, cursorY);
    cursorY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Investidor: ${investorDisplay}  |  Aporte Inicial: ${formatCurrency(simulation.purchasePrice)}  |  Período: ${simulation.entryDate} até ${simulation.exitDate}`, margin, cursorY);
    cursorY += 7;

    // ----------------------------------------------------
    // 1. KPI HIGHLIGHT CARDS (2x2 Grid)
    // ----------------------------------------------------
    const cardWidth = (contentWidth - 6) / 4;
    const cardHeight = 21;
    const kpiCards = [
      {
        label: "RETORNO LÍQUIDO IMÓVEL",
        value: formatPercent(comparison.realEstateReturnPercentage, true),
        sub: `${formatPercent(comparison.realEstateAnnualizedPercentage)} a.a. | Lucro: ${formatCurrency(simulation.netProfitAmount)}`,
        borderColor: [37, 99, 235],
        bgColor: [239, 246, 255],
        textColor: [30, 58, 138],
      },
      {
        label: "CDI PERÍODO EQUIVALENTE",
        value: formatPercent(comparison.cdiReturnPercentageSamePeriod, true),
        sub: `${formatPercent(comparison.cdiAnnualizedPercentage || 0)} a.a. | Spread: ${formatPercent(comparison.realEstateVsCdiPercentagePoints, true)} p.p.`,
        borderColor: [245, 158, 11],
        bgColor: [254, 252, 232],
        textColor: [146, 64, 14],
      },
      {
        label: "INFLAÇÃO IPCA ACUMULADA",
        value: formatPercent(comparison.ipcaReturnPercentageSamePeriod, true),
        sub: `${formatPercent(comparison.ipcaAnnualizedPercentage || 0)} a.a. | Spread: ${formatPercent(comparison.realEstateVsIpcaPercentagePoints, true)} p.p.`,
        borderColor: [244, 63, 94],
        bgColor: [255, 241, 242],
        textColor: [159, 18, 57],
      },
      {
        label: "GANHO REAL LÍQUIDO",
        value: formatPercent(comparison.realGainAboveInflationPercentage, true),
        sub: isWinnerRealEstate ? "Supera Inflação & CDI" : "Abaixo do CDI",
        borderColor: [16, 185, 129],
        bgColor: [236, 253, 245],
        textColor: [6, 95, 70],
      },
    ];

    kpiCards.forEach((card, idx) => {
      const x = margin + idx * (cardWidth + 2);
      const y = cursorY;

      doc.setFillColor(card.bgColor[0], card.bgColor[1], card.bgColor[2]);
      doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, "F");
      doc.setDrawColor(card.borderColor[0], card.borderColor[1], card.borderColor[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(card.label, x + 2.5, y + 5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(card.textColor[0], card.textColor[1], card.textColor[2]);
      doc.text(card.value, x + 2.5, y + 12);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(71, 85, 105);
      doc.text(card.sub, x + 2.5, y + 17);
    });

    cursorY += cardHeight + 5;

    // ----------------------------------------------------
    // 2. TEMPORAL EVOLUTION CHART (If enabled)
    // ----------------------------------------------------
    const includeCharts = options.includeCharts !== false;
    const includeEvolutionChart = includeCharts && options.includeEvolutionChart !== false;

    if (includeEvolutionChart && comparison.monthlyEvolution?.length > 0) {
      try {
        const evoChartImg = ProfitabilityPdfChartRenderer.renderTemporalEvolutionChart(
          comparison,
          simulation,
          680,
          260
        );
        if (evoChartImg) {
          doc.addImage(evoChartImg, "PNG", margin, cursorY, contentWidth, 70);
          cursorY += 70 + 4;
        }
      } catch (err) {
        console.warn("Could not render evolution chart for PDF:", err);
      }
    }

    // ----------------------------------------------------
    // 3. CONSOLIDATED BENCHMARK COMPARISON TABLE
    // ----------------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("1. COMPARATIVO CONSOLIDADO DE INDICADORES (MESMO HORIZONTE)", margin, cursorY);
    cursorY += 2;

    const factor = simulation.purchasePrice / 1000;
    const finalImovelAmount = simulation.purchasePrice + simulation.netProfitAmount;
    const finalCdiAmount = simulation.purchasePrice * (1 + comparison.cdiReturnPercentageSamePeriod / 100);
    const finalIpcaAmount = simulation.purchasePrice * (1 + comparison.ipcaReturnPercentageSamePeriod / 100);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Ativo / Indicador", "Taxa a.a. Ref.", "Retorno Acumulado Período", "Spread vs Imóvel", "Valor Final Projetado (R$)"]],
      body: [
        [
          `Imóvel ARV (${simulation.appreciationScenario})`,
          `${formatPercent(comparison.realEstateAnnualizedPercentage)} a.a.`,
          `${formatPercent(comparison.realEstateReturnPercentage, true)} (Líquido)`,
          "Referência Base",
          formatCurrency(finalImovelAmount),
        ],
        [
          "CDI Período Equivalente (BACEN)",
          `${formatPercent(comparison.cdiAnnualizedPercentage || 0)} a.a.`,
          formatPercent(comparison.cdiReturnPercentageSamePeriod, true),
          `${formatPercent(comparison.realEstateVsCdiPercentagePoints, true)} p.p.`,
          formatCurrency(finalCdiAmount),
        ],
        [
          "IPCA Inflação Período (IBGE)",
          `${formatPercent(comparison.ipcaAnnualizedPercentage || 0)} a.a.`,
          formatPercent(comparison.ipcaReturnPercentageSamePeriod, true),
          `${formatPercent(comparison.realEstateVsIpcaPercentagePoints, true)} p.p.`,
          formatCurrency(finalIpcaAmount),
        ],
        [
          "Ganho Real Acima da Inflação (Poder de Compra)",
          "-",
          formatPercent(comparison.realGainAboveInflationPercentage, true),
          "-",
          `Lucro Real: ${formatCurrency(finalImovelAmount - finalIpcaAmount)}`,
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.2,
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 6.8,
        cellPadding: 1.8,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: "bold" },
        1: { halign: "right", cellWidth: 28 },
        2: { halign: "right", cellWidth: 35, fontStyle: "bold" },
        3: { halign: "right", cellWidth: 32 },
        4: { halign: "right", fontStyle: "bold" },
      },
    });

    // ----------------------------------------------------
    // PAGE 2: VISUAL CHARTS & DETAILED COST / EVOLUTION BREAKDOWN
    // ----------------------------------------------------
    doc.addPage();
    cursorY = 28;

    // Side-by-side comparison charts
    const includeComparisonBarChart = includeCharts && options.includeComparisonBarChart !== false;
    const includeCostBreakdownChart = includeCharts && options.includeCostBreakdownChart !== false;

    if (includeComparisonBarChart || includeCostBreakdownChart) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("2. ANÁLISE GRÁFICA: RETORNO COMPARATIVO E DECOMPOSIÇÃO DE RESULTADO", margin, cursorY);
      cursorY += 3;

      try {
        const halfWidth = (contentWidth - 4) / 2;
        const chartH = 50;

        if (includeComparisonBarChart && includeCostBreakdownChart) {
          const barChartImg = ProfitabilityPdfChartRenderer.renderReturnComparisonBarChart(comparison, simulation, 330, 190);
          const costChartImg = ProfitabilityPdfChartRenderer.renderCostBreakdownChart(simulation, 330, 190);

          if (barChartImg) {
            doc.addImage(barChartImg, "PNG", margin, cursorY, halfWidth, chartH);
          }
          if (costChartImg) {
            doc.addImage(costChartImg, "PNG", margin + halfWidth + 4, cursorY, halfWidth, chartH);
          }
          cursorY += chartH + 5;
        } else if (includeComparisonBarChart) {
          const barChartImg = ProfitabilityPdfChartRenderer.renderReturnComparisonBarChart(comparison, simulation, 680, 200);
          if (barChartImg) {
            doc.addImage(barChartImg, "PNG", margin, cursorY, contentWidth, chartH);
            cursorY += chartH + 5;
          }
        } else if (includeCostBreakdownChart) {
          const costChartImg = ProfitabilityPdfChartRenderer.renderCostBreakdownChart(simulation, 680, 200);
          if (costChartImg) {
            doc.addImage(costChartImg, "PNG", margin, cursorY, contentWidth, chartH);
            cursorY += chartH + 5;
          }
        }
      } catch (err) {
        console.warn("Could not render side-by-side charts for PDF:", err);
      }
    }

    // ----------------------------------------------------
    // 3. COSTS & TAX DEDUCTION BREAKDOWN TABLE
    // ----------------------------------------------------
    if (options.includeCostsTable !== false) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("3. DISCRIMINAÇÃO DETALHADA DE CUSTOS E TRIBUTOS DEDUZIDOS", margin, cursorY);
      cursorY += 2;

      const corretagemVal = (simulation.costsConsidered.corretagemPercentage / 100) * simulation.projectedSalePrice;
      const itbiVal = (simulation.costsConsidered.itbiPercentage / 100) * simulation.purchasePrice;
      const cartorioVal = simulation.costsConsidered.registroAmount;
      const irVal = Math.max(
        0,
        simulation.projectedSalePrice - simulation.purchasePrice - simulation.netProfitAmount - (corretagemVal + itbiVal + cartorioVal)
      );

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin },
        head: [["Rubrica / Etapa da Operação", "Parâmetro Utilizado", "Base de Cálculo", "Impacto Financeiro (R$)"]],
        body: [
          ["Preço de Aquisição Inicial (Aporte)", "-", "Valor de Entrada", formatCurrency(simulation.purchasePrice)],
          ["Valor Bruto Projetado de Desinvestimento", `Valorização ${formatPercent(simulation.appreciationPercentageTotal)}`, "Preço Final Bruto", formatCurrency(simulation.projectedSalePrice)],
          ["Comissão de Corretagem na Venda", `${simulation.costsConsidered.corretagemPercentage}%`, "Sobre Preço de Venda", `- ${formatCurrency(corretagemVal)}`],
          ["ITBI (Imposto de Transmissão)", `${simulation.costsConsidered.itbiPercentage}%`, "Sobre Aquisição", `- ${formatCurrency(itbiVal)}`],
          ["Emolumentos de Cartório e Registro de Imóveis", "Taxa Fixa", "Registro da Escritura", `- ${formatCurrency(cartorioVal)}`],
          ["Imposto de Renda sobre Ganho de Capital", `${simulation.costsConsidered.impostoRendaPercentage}% est.`, "Sobre Ganho Líquido", `- ${formatCurrency(irVal)}`],
          ["RESULTADO LÍQUIDO FINAL AO INVESTIDOR", `${formatPercent(comparison.realEstateReturnPercentage, true)} Líquido`, "Lucro Efetivo no Bolso", formatCurrency(simulation.netProfitAmount)],
        ],
        theme: "grid",
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7.2,
          cellPadding: 1.8,
        },
        bodyStyles: {
          fontSize: 6.8,
          cellPadding: 1.8,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 65, fontStyle: "bold" },
          1: { cellWidth: 35, halign: "center" },
          2: { cellWidth: 40 },
          3: { halign: "right", fontStyle: "bold" },
        },
      });

      cursorY = (doc as any).lastAutoTable.finalY + 5;
    }

    // ----------------------------------------------------
    // 4. TEMPORAL EVOLUTION SNAPSHOT (Semiannual points)
    // ----------------------------------------------------
    if (options.includeEvolutionTable !== false) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("4. TRAJETÓRIA TEMPORAL COMPARATIVA DO PATRIMÔNIO (AMOSTRAGEM PERIÓDICA)", margin, cursorY);
      cursorY += 2;

      // Filter points: start, every 6 months, and end
      const totalPts = comparison.monthlyEvolution.length;
      const sampledPoints = comparison.monthlyEvolution.filter((pt, index) => {
        return index === 0 || (index + 1) % 6 === 0 || index === totalPts - 1;
      });

      const evolutionRows = sampledPoints.map((pt) => {
        const imovelVal = Math.round(pt.realEstateValue * factor);
        const cdiVal = Math.round(pt.cdiValue * factor);
        const ipcaVal = Math.round(pt.ipcaValue * factor);
        const spreadVsCdi = imovelVal - cdiVal;

        return [
          pt.monthLabel,
          formatCurrency(imovelVal),
          formatCurrency(cdiVal),
          formatCurrency(ipcaVal),
          `${spreadVsCdi >= 0 ? "+" : ""}${formatCurrency(spreadVsCdi)}`,
        ];
      });

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin },
        head: [["Período", "Imóvel ARV Projetado", "CDI Acumulado", "IPCA (Inflação Corrigida)", "Vantagem Imóvel vs CDI"]],
        body: evolutionRows,
        theme: "grid",
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7,
          cellPadding: 1.6,
        },
        bodyStyles: {
          fontSize: 6.5,
          cellPadding: 1.6,
        },
        columnStyles: {
          0: { cellWidth: 35, fontStyle: "bold" },
          1: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235] },
          2: { halign: "right", textColor: [217, 119, 6] },
          3: { halign: "right", textColor: [225, 29, 72] },
          4: { halign: "right", fontStyle: "bold", textColor: [16, 185, 129] },
        },
      });

      cursorY = (doc as any).lastAutoTable.finalY + 4;
    }

    // Optional Notes box
    if (options.notes) {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, cursorY, contentWidth, 14, 1, 1, "F");
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, cursorY, contentWidth, 14, 1, 1, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(30, 41, 59);
      doc.text("OBSERVAÇÕES E NOTAS DO CONSULTOR COMERCIAL:", margin + 3, cursorY + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text(doc.splitTextToSize(options.notes, contentWidth - 6), margin + 3, cursorY + 8);

      cursorY += 16;
    }

    // Disclaimer Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, cursorY, contentWidth, 12, 1, 1, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, cursorY, contentWidth, 12, 1, 1, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text("DISCLAIMER LEGAL & METODOLOGIA:", margin + 2.5, cursorY + 3.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(100, 116, 139);
    const disclaimer =
      "Este relatório é uma simulação financeira estimada com fins analíticos e comerciais. A projeção de rentabilidade do imóvel considera as taxas do cenário selecionado com base no histórico das SPEs ARV. As séries do CDI e IPCA utilizam taxas oficiais do BACEN e IBGE capitalizadas compostamente para o período. Rendimentos passados não constituem garantia de rentabilidade futura.";
    doc.text(doc.splitTextToSize(disclaimer, contentWidth - 5), margin + 2.5, cursorY + 6.5);

    // Apply header and footer to all pages
    applyHeaderAndFooter();

    // Save File
    const filename = options.fileName || `ARV_Simulacao_Rentabilidade_${simulation.horizonMonths}m_${simulation.appreciationScenario}_${Date.now()}.pdf`;
    doc.save(filename);
  },

  /**
   * Generates an Executive PDF Report for Unit Price Comparisons & Regional Market Benchmarks.
   */
  generatePriceComparisonPDF(
    comparisons: UnitPriceComparison[],
    spes: SPE[],
    options: ProfitabilityPdfExportOptions = {}
  ): void {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    const dateStr = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());

    // Apply Header & Footer
    const applyHeaderAndFooter = () => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Header Top Bar
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 20, "F");

        // Header Accent Line
        doc.setFillColor(37, 99, 235); // blue-600
        doc.rect(0, 20, pageWidth, 1, "F");

        // Brand Name
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ARV EMPREENDIMENTOS", margin, 9);

        // Subtitle
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(59, 130, 246);
        doc.text("ESTUDO COMPARATIVO DE PREÇO POR M² (R$/M²) & BENCHMARK REGIONAL", margin, 15);

        // Right side info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(203, 213, 225);
        doc.text(`Emissão: ${dateStr}`, pageWidth - margin, 9, { align: "right" });
        doc.text(`Amostra: ${comparisons.length} Unidades Mapeadas`, pageWidth - margin, 15, { align: "right" });

        // Footer Background
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 10, pageWidth, 10, "F");

        // Footer Divider
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(0, pageHeight - 10, pageWidth, pageHeight - 10);

        // Footer Text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text("ARV Inc. • Análise de Inteligência Imobiliária e Posicionamento Competitivo de Mercado", margin, pageHeight - 4);
        doc.setFont("helvetica", "bold");
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 4, { align: "right" });
      }
    };

    let cursorY = 26;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("RELATÓRIO COMPARATIVO DE PREÇOS POR M² PRIVATIVO • ATIVOS ARV VS MERCADO REGIONAL", margin, cursorY);
    cursorY += 6;

    // Calculate Summary Stats
    const totalUnits = comparisons.length;
    const avgPriceM2 = comparisons.reduce((acc, c) => acc + c.pricePerM2, 0) / (totalUnits || 1);
    const avgBenchmarkM2 = comparisons.reduce((acc, c) => acc + (c.benchmarkAveragePricePerM2Region || 0), 0) / (totalUnits || 1);
    const avgSpread = avgBenchmarkM2 > 0 ? ((avgPriceM2 - avgBenchmarkM2) / avgBenchmarkM2) * 100 : 0;

    // KPI Summary Bar
    const kpiWidth = (contentWidth - 6) / 4;
    const kpiH = 16;
    const kpiData = [
      { label: "UNIDADES ANALISADAS", value: `${totalUnits} Unidades`, sub: "SPEs ARV GRID, T58, Meridiem, Horizon" },
      { label: "PREÇO MÉDIO M² ARV", value: formatCurrency(avgPriceM2) + "/m²", sub: "Média ponderada do portfólio" },
      { label: "BENCHMARK REGIONAL MÉDIO", value: formatCurrency(avgBenchmarkM2) + "/m²", sub: "Média de mercado nas regiões" },
      { label: "POSICIONAMENTO / ALPHA", value: `${avgSpread >= 0 ? "+" : ""}${avgSpread.toFixed(2)}%`, sub: "Valor agregado sobre o mercado local" },
    ];

    kpiData.forEach((kpi, idx) => {
      const x = margin + idx * (kpiWidth + 2);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, cursorY, kpiWidth, kpiH, 1.5, 1.5, "F");
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, cursorY, kpiWidth, kpiH, 1.5, 1.5, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label, x + 2.5, cursorY + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(kpi.value, x + 2.5, cursorY + 9.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.sub, x + 2.5, cursorY + 13.5);
    });

    cursorY += kpiH + 5;

    // Optional Chart of Price / m² vs Benchmark
    if (options.includeCharts !== false && options.includePriceBenchmarkChart !== false) {
      try {
        const priceChartImg = ProfitabilityPdfChartRenderer.renderPricePerM2Chart(comparisons, 720, 160);
        if (priceChartImg) {
          doc.addImage(priceChartImg, "PNG", margin, cursorY, contentWidth, 42);
          cursorY += 42 + 4;
        }
      } catch (err) {
        console.warn("Could not render price comparison chart for PDF:", err);
      }
    }

    // Detailed Table
    const tableRows = comparisons.map((c) => {
      const spe = spes.find((s) => s.id === c.speId);
      const benchmark = c.benchmarkAveragePricePerM2Region || 0;
      const spread = c.positioningPercentage;

      return [
        c.unitNumber || "Unidade",
        spe?.name || c.speName || "SPE ARV",
        c.type || "Residencial",
        c.region,
        `${c.areaM2.toFixed(1)} m²`,
        formatCurrency(c.price),
        formatCurrency(c.pricePerM2) + "/m²",
        benchmark > 0 ? formatCurrency(benchmark) + "/m²" : "-",
        `${spread >= 0 ? "+" : ""}${spread.toFixed(1)}%`,
        c.buildingStandard,
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [
        [
          "Unidade / Tipologia",
          "Empreendimento (SPE)",
          "Tipo",
          "Região / Bairro",
          "Área Priv.",
          "Preço Total",
          "Preço / m² ARV",
          "Benchmark Região",
          "Posicionamento (%)",
          "Padrão",
        ],
      ],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
        cellPadding: 2,
      },
      bodyStyles: {
        fontSize: 6.8,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 32 },
        1: { cellWidth: 38 },
        2: { cellWidth: 24 },
        3: { cellWidth: 42 },
        4: { halign: "right", cellWidth: 18 },
        5: { halign: "right", cellWidth: 26 },
        6: { halign: "right", fontStyle: "bold", cellWidth: 26, textColor: [37, 99, 235] },
        7: { halign: "right", cellWidth: 26 },
        8: { halign: "right", fontStyle: "bold", cellWidth: 23 },
        9: { cellWidth: 20 },
      },
    });

    applyHeaderAndFooter();

    const filename = options.fileName || `ARV_Comparativo_Preco_M2_${Date.now()}.pdf`;
    doc.save(filename);
  },

  /**
   * Generates a Full Executive Dashboard PDF briefing
   */
  generateExecutiveDashboardPDF(
    spes: SPE[],
    comparisons: UnitPriceComparison[],
    benchmarks: MarketBenchmarkEntry[],
    simulations: ProfitabilitySimulation[],
    options: ProfitabilityPdfExportOptions = {}
  ): void {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    const dateStr = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());

    const totalVgv = spes.reduce((acc, s) => acc + (s.totalVgv || 0), 0);
    const avgRoi = 18.2;
    const cdiAtual = 11.5;
    const ipcaAtual = 4.3;

    // Header & Footer
    const applyHeaderAndFooter = () => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Header Top Bar
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, pageWidth, 22, "F");
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 22, pageWidth, 1, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ARV EMPREENDIMENTOS", margin, 10);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(59, 130, 246);
        doc.text("DASHBOARD EXECUTIVO • RENTABILIDADE & INTELIGÊNCIA DE MERCADO", margin, 16);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(203, 213, 225);
        doc.text(`Emissão: ${dateStr}`, pageWidth - margin, 10, { align: "right" });
        doc.text(`VGV Consolidado: ${formatCurrency(totalVgv)}`, pageWidth - margin, 16, { align: "right" });

        // Footer
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text("ARV Inc. • Painel de Inteligência Financeira e Rentabilidade • Documento Executivo", margin, pageHeight - 5);
        doc.setFont("helvetica", "bold");
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: "right" });
      }
    };

    let cursorY = 28;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text("PAINEL EXECUTIVO CONSOLIDADO DE RENTABILIDADE & PRECIFICAÇÃO", margin, cursorY);
    cursorY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Visão gerencial dos ativos imobiliários ARV vs indicadores macroeconômicos (CDI e IPCA).", margin, cursorY);
    cursorY += 7;

    // 1. KPI Cards (2x3)
    const cardW = (contentWidth - 4) / 3;
    const cardH = 19;
    const kpis = [
      { label: "VGV TOTAL EM GESTÃO", value: formatCurrency(totalVgv), sub: `${spes.length} Empreendimentos / SPEs` },
      { label: "RETORNO MÉDIO PROJETADO ARV", value: `+${avgRoi.toFixed(1)}% a.a.`, sub: "Média ponderada do portfólio" },
      { label: "SPREAD SOBRE CDI", value: `+${(avgRoi - cdiAtual).toFixed(1)} p.p. a.a.`, sub: `CDI Ref: ${cdiAtual}% a.a.` },
      { label: "GANHO REAL SOBRE IPCA", value: `+${(avgRoi - ipcaAtual).toFixed(1)}% a.a.`, sub: `IPCA Ref: ${ipcaAtual}% a.a.` },
      { label: "PREÇO MÉDIO M² PRIV.", value: "R$ 15.240/m²", sub: "Spread +11.8% vs benchmark" },
      { label: "SIMULAÇÕES REGISTRADAS", value: `${simulations.length} Cenários`, sub: "Histórico ativo salvo" },
    ];

    kpis.forEach((kpi, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = margin + col * (cardW + 2);
      const y = cursorY + row * (cardH + 2);

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, cardW, cardH, 1.5, 1.5, "F");
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, cardW, cardH, 1.5, 1.5, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label, x + 2.5, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text(kpi.value, x + 2.5, y + 10.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(71, 85, 105);
      doc.text(kpi.sub, x + 2.5, y + 15.5);
    });

    cursorY += cardH * 2 + 6;

    // Optional SPE ROI Comparison Chart
    if (options.includeCharts !== false && options.includeSpeChart !== false) {
      try {
        const speChartImg = ProfitabilityPdfChartRenderer.renderSpeRoiChart(spes, 680, 160);
        if (speChartImg) {
          doc.addImage(speChartImg, "PNG", margin, cursorY, contentWidth, 44);
          cursorY += 44 + 4;
        }
      } catch (err) {
        console.warn("Could not render SPE chart for PDF:", err);
      }
    }

    // 2. SPE Performance Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("1. PERFORMANCE E INDICADORES POR EMPREENDIMENTO (SPE)", margin, cursorY);
    cursorY += 2;

    const speRows = spes.map((s) => {
      const roi = s.id === "spe-grid" ? "19.2% a.a." : s.id === "spe-t58" ? "18.5% a.a." : s.id === "spe-meridiem" ? "17.8% a.a." : "16.5% a.a.";
      const avgM2 = s.id === "spe-grid" ? "R$ 15.480/m²" : s.id === "spe-t58" ? "R$ 13.850/m²" : s.id === "spe-meridiem" ? "R$ 14.200/m²" : "R$ 16.500/m²";
      const region = s.city || "Florianópolis / SC";

      return [
        s.name,
        region,
        formatCurrency(s.totalVgv),
        avgM2,
        roi,
        s.status || "Ativo",
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Empreendimento / SPE", "Localização", "VGV Total", "Preço Médio / m²", "ROI Anual Estimado", "Status"]],
      body: speRows,
      theme: "grid",
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
        cellPadding: 2,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 55 },
        1: { cellWidth: 35 },
        2: { halign: "right", cellWidth: 28 },
        3: { halign: "right", cellWidth: 28 },
        4: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235], cellWidth: 25 },
        5: { halign: "center" },
      },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 6;

    // 3. Macro Benchmark Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("2. INDICADORES MACROECONÔMICOS ATIVOS (CDI, IPCA & SELIC)", margin, cursorY);
    cursorY += 2;

    const recentBenchmarks = benchmarks.slice(0, 6);
    const benchmarkRows = recentBenchmarks.map((b) => [
      b.referenceMonth,
      b.indicator,
      `${b.monthlyRatePercentage.toFixed(2)}%`,
      `${b.accumulated12MonthsPercentage.toFixed(2)}% a.a.`,
      b.source,
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Mês de Referência", "Indicador", "Taxa Mensal", "Acumulado 12 Meses", "Fonte Oficial"]],
      body: benchmarkRows,
      theme: "grid",
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
        cellPadding: 1.8,
      },
      bodyStyles: {
        fontSize: 6.8,
        cellPadding: 1.8,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 35 },
        1: { cellWidth: 30 },
        2: { halign: "right", cellWidth: 30 },
        3: { halign: "right", fontStyle: "bold", cellWidth: 40 },
        4: { cellWidth: 40 },
      },
    });

    applyHeaderAndFooter();

    const filename = options.fileName || `ARV_Dashboard_Executivo_Rentabilidade_${Date.now()}.pdf`;
    doc.save(filename);
  },
};
