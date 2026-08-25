import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { PriceTable, PricingUnit, CommercialProposal } from "../../types/pricing";

export interface CommercialReportData {
  isConsolidated: boolean;
  activeTable: PriceTable | null;
  tables: PriceTable[];
  units: PricingUnit[];
  proposals?: CommercialProposal[];
  simulatedCub: number;
  cubSimVariation: number;
  kpis: {
    totalUnits: number;
    soldCount: number;
    availableCount: number;
    reservedCount: number;
    blockedCount: number;
    totalVgv: number;
    soldVgv: number;
    availableVgv: number;
    reservedVgv: number;
    vsoUnitsPercent: number;
    vsoVgvPercent: number;
    totalArea: number;
    soldArea: number;
    availableArea: number;
    avgPriceM2: number;
    avgSoldPriceM2: number;
    avgAvailablePriceM2: number;
    avgCubM2: number;
    ticketMedio: number;
    ticketMedioVendido: number;
    ticketMedioDisponivel: number;
    atoReceivables: number;
    monthlyReceivables: number;
    balloonReceivables: number;
    finalInstallmentReceivables: number;
    financingReceivables: number;
    obraReceivables: number;
  };
  tipologySummary: Array<{
    type: string;
    totalUnits: number;
    soldUnits: number;
    availableUnits: number;
    reservedUnits: number;
    totalVgv: number;
    soldVgv: number;
    availableVgv: number;
    totalArea: number;
    soldArea: number;
    availableArea: number;
    vsoPercent: number;
    avgPriceM2: number;
    avgTicket: number;
    avgArea: number;
    avgCubM2: number;
  }>;
  floorSummary: Array<{
    floorName: string;
    floorNum: number;
    totalUnits: number;
    soldUnits: number;
    availableUnits: number;
    totalVgv: number;
    soldVgv: number;
    availableVgv: number;
  }>;
  speComparisonData: Array<{
    tableId: string;
    speId: string;
    speName: string;
    tableName: string;
    totalUnits: number;
    soldUnits: number;
    availableUnits: number;
    reservedUnits: number;
    totalVgv: number;
    soldVgv: number;
    availableVgv: number;
    vsoPercent: number;
    avgPriceM2: number;
    ticketMedio: number;
    cubReference: number;
    validUntil?: string;
    status: string;
  }>;
}

export interface PDFExportOptions {
  fileName?: string;
  title?: string;
  speName?: string;
  orientation?: "portrait" | "landscape";
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatShortCurrency = (val: number) => {
  if (val >= 1000000) {
    return `R$ ${(val / 1000000).toFixed(2)}M`;
  }
  if (val >= 1000) {
    return `R$ ${(val / 1000).toFixed(0)}k`;
  }
  return formatCurrency(val);
};

/**
 * Service to generate crisp, high-resolution Executive PDF Reports
 */
export const CommercialPdfExportService = {
  /**
   * Generates a 100% native vector Executive PDF report with typography, tables, and KPIs.
   * This is fast, crisp, completely selectable, and never fails due to canvas/DOM quirks.
   */
  generateStructuredExecutivePDF(data: CommercialReportData, options: PDFExportOptions = {}): void {
    const { isConsolidated, activeTable, kpis, tipologySummary, speComparisonData, simulatedCub, cubSimVariation, units } = data;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;

    const title = isConsolidated
      ? "RELATÓRIO COMERCIAL CONSOLIDADO • PORTFÓLIO ARV"
      : `RELATÓRIO COMERCIAL • ${activeTable?.name || "EMPREENDIMENTO"}`;
    const subtitle = isConsolidated
      ? "Visão Multi-Empreendimento • Todas as SPEs e Tabelas Ativas"
      : `SPE: ${activeTable?.speName || "ARV Inc."} | Vigência da Tabela: ${activeTable?.validUntil || "30/09/2026"}`;

    const dateStr = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());

    // Helper: Draw Header & Footer on each page
    const applyHeaderAndFooter = () => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Header Background
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 22, "F");

        // Header Accent Line
        doc.setFillColor(79, 70, 229); // indigo-600
        doc.rect(0, 22, pageWidth, 1, "F");

        // Brand Name
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ARV EMPREENDIMENTOS", margin, 10);

        // Document Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(245, 158, 11); // amber-400
        doc.text("INTEGRAÇÃO COMERCIAL & PRECIFICAÇÃO", margin, 16);

        // Right side info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(203, 213, 225); // slate-300
        doc.text(`Emissão: ${dateStr}`, pageWidth - margin, 10, { align: "right" });
        doc.text(`CUB/SC Ref.: ${formatCurrency(simulatedCub)}${cubSimVariation !== 0 ? ` (${cubSimVariation > 0 ? `+${cubSimVariation}%` : `${cubSimVariation}%`})` : ""}`, pageWidth - margin, 16, { align: "right" });

        // Footer Background
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(0, pageHeight - 12, pageWidth, 12, "F");

        // Footer Accent Line
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.line(0, pageHeight - 12, pageWidth, pageHeight - 12);

        // Footer Text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("ARV Inc. • Sistema de Inteligência Comercial e Vendas • Documento Executivo Confidencial", margin, pageHeight - 5);
        doc.setFont("helvetica", "bold");
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: "right" });
      }
    };

    // ==========================================
    // PAGE 1: COVER & EXECUTIVE DASHBOARD
    // ==========================================
    let cursorY = 28;

    // Title Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(title, margin, cursorY);
    cursorY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitle, margin, cursorY);
    cursorY += 8;

    // ------------------------------------------
    // 1. KPI HIGHLIGHT CARDS (2x3 Grid)
    // ------------------------------------------
    const cardWidth = (contentWidth - 6) / 3;
    const cardHeight = 19;
    const kpiCards = [
      { label: "VGV TOTAL DA TABELA", value: formatCurrency(kpis.totalVgv), sub: `${kpis.totalUnits} un. | ${formatCurrency(kpis.ticketMedio)} méd.`, color: [30, 41, 59] },
      { label: "VGV VENDIDO (REALIZADO)", value: formatCurrency(kpis.soldVgv), sub: `${kpis.soldCount} un. (${kpis.vsoUnitsPercent.toFixed(1)}% VSO)`, color: [79, 70, 229] },
      { label: "VGV DISPONÍVEL (ESTOQUE)", value: formatCurrency(kpis.availableVgv), sub: `${kpis.availableCount} un. disponíveis`, color: [16, 185, 129] },
      { label: "VELOCIDADE DE VENDAS (VSO)", value: `${kpis.vsoUnitsPercent.toFixed(1)}%`, sub: `${kpis.vsoVgvPercent.toFixed(1)}% do VGV total`, color: [217, 119, 6] },
      { label: "PREÇO MÉDIO / M² PRIV.", value: formatCurrency(kpis.avgPriceM2), sub: `${kpis.avgCubM2.toFixed(2)} CUBs/m²`, color: [2, 132, 199] },
      { label: "RECEBÍVEIS FLUXO OBRA", value: formatShortCurrency(kpis.obraReceivables), sub: `Financ.: ${formatShortCurrency(kpis.financingReceivables)} (60%)`, color: [147, 51, 234] },
    ];

    kpiCards.forEach((c, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = margin + col * (cardWidth + 3);
      const y = cursorY + row * (cardHeight + 3);

      // Card Box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, "F");
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, "S");

      // Card Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, x + 3, y + 4.5);

      // Card Main Value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.text(c.value, x + 3, y + 11.5);

      // Card Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.sub, x + 3, y + 16.5);
    });

    cursorY += 2 * (cardHeight + 3) + 6;

    // ------------------------------------------
    // 2. STATUS BREAKDOWN SUMMARY TABLE
    // ------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Composição e Status da Carteira de Unidades", margin, cursorY);
    cursorY += 3;

    const statusRows = [
      ["Disponível (Estoque)", `${kpis.availableCount} un.`, `${kpis.totalUnits > 0 ? ((kpis.availableCount / kpis.totalUnits) * 100).toFixed(1) : 0}%`, formatCurrency(kpis.availableVgv), `${kpis.totalVgv > 0 ? ((kpis.availableVgv / kpis.totalVgv) * 100).toFixed(1) : 0}%`, formatCurrency(kpis.ticketMedioDisponivel)],
      ["Vendida (Realizado)", `${kpis.soldCount} un.`, `${kpis.vsoUnitsPercent.toFixed(1)}%`, formatCurrency(kpis.soldVgv), `${kpis.vsoVgvPercent.toFixed(1)}%`, formatCurrency(kpis.ticketMedioVendido)],
      ["Reservada (Propostas)", `${kpis.reservedCount} un.`, `${kpis.totalUnits > 0 ? ((kpis.reservedCount / kpis.totalUnits) * 100).toFixed(1) : 0}%`, formatCurrency(kpis.reservedVgv), `${kpis.totalVgv > 0 ? ((kpis.reservedVgv / kpis.totalVgv) * 100).toFixed(1) : 0}%`, "-"],
      ["Bloqueada / Permuta", `${kpis.blockedCount} un.`, `${kpis.totalUnits > 0 ? ((kpis.blockedCount / kpis.totalUnits) * 100).toFixed(1) : 0}%`, formatCurrency(0), "0.0%", "-"],
    ];

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Status", "Quantidade", "% Unid.", "VGV Correspondente", "% VGV", "Ticket Médio"]],
      body: statusRows,
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 40 },
        1: { halign: "center", cellWidth: 24 },
        2: { halign: "center", cellWidth: 20 },
        3: { halign: "right", fontStyle: "bold", cellWidth: 38 },
        4: { halign: "center", cellWidth: 20 },
        5: { halign: "right", cellWidth: 38 },
      },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 7;

    // ------------------------------------------
    // 3. FLUXO DE RECEBÍVEIS (PAGAMENTO PADRÃO)
    // ------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Estrutura Padrão de Recebíveis (Fluxo Comercial)", margin, cursorY);
    cursorY += 3;

    const paymentRows = [
      ["1. Sinal / Entrada (Ato)", "12,0%", "Agosto/2026", formatCurrency(kpis.atoReceivables), "Recurso Direto na Assinatura"],
      ["2. Parcelas Mensais (40x)", "15,0%", "Set/2026 a Dez/2029", formatCurrency(kpis.monthlyReceivables), "Financiamento Direto SPE durante Obras"],
      ["3. Reforços Semestrais (6x)", "8,0%", "Semestral (2027 a 2029)", formatCurrency(kpis.balloonReceivables), "Balões Intermediários"],
      ["4. Parcela Final de Chaves", "5,0%", "Entrega de Chaves (Jan/2030)", formatCurrency(kpis.finalInstallmentReceivables), "Conclusão das Obras / Habite-se"],
      ["5. Saldo Financiamento Bancário", "60,0%", "Pós-Chaves / Repasse", formatCurrency(kpis.financingReceivables), "Quitação Bancária (SFH / SFI / Recursos Próprios)"],
    ];

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Etapa de Pagamento", "% Tabela", "Cronograma Estimado", "Valor Projetado (R$)", "Condição Comercial"]],
      body: paymentRows,
      theme: "grid",
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50 },
        1: { halign: "center", cellWidth: 20 },
        2: { halign: "center", cellWidth: 38 },
        3: { halign: "right", fontStyle: "bold", cellWidth: 35 },
        4: { fontStyle: "normal" },
      },
    });

    // ==========================================
    // PAGE 2: TIPOLOGY MATRIX & SPE COMPARATIVE
    // ==========================================
    doc.addPage();
    cursorY = 28;

    // ------------------------------------------
    // 4. TIPOLOGY PERFORMANCE TABLE
    // ------------------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Desempenho e Absorção por Tipologia", margin, cursorY);
    cursorY += 3;

    const tipRows = tipologySummary.map((t) => [
      t.type,
      `${t.totalUnits} un.`,
      `${t.soldUnits} un.`,
      `${t.availableUnits} un.`,
      `${t.vsoPercent.toFixed(0)}%`,
      `${t.avgArea.toFixed(1)} m²`,
      formatCurrency(t.avgPriceM2),
      `${t.avgCubM2.toFixed(2)} CUB`,
      formatShortCurrency(t.avgTicket),
      formatCurrency(t.totalVgv),
      formatCurrency(t.soldVgv),
      formatCurrency(t.availableVgv),
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [["Tipologia", "Total", "Vend.", "Estoque", "VSO", "Área Méd.", "Preço/m²", "CUB/m²", "Ticket", "VGV Total", "VGV Vend.", "VGV Disp."]],
      body: tipRows,
      theme: "grid",
      styles: {
        fontSize: 6.8,
        cellPadding: 1.8,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 6.8,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 26 },
        1: { halign: "center", cellWidth: 11 },
        2: { halign: "center", cellWidth: 11 },
        3: { halign: "center", cellWidth: 12 },
        4: { halign: "center", cellWidth: 11, fontStyle: "bold" },
        5: { halign: "center", cellWidth: 14 },
        6: { halign: "right", cellWidth: 18 },
        7: { halign: "center", cellWidth: 14 },
        8: { halign: "right", cellWidth: 17 },
        9: { halign: "right", fontStyle: "bold", cellWidth: 22 },
        10: { halign: "right", cellWidth: 20 },
        11: { halign: "right", cellWidth: 20 },
      },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 8;

    // ------------------------------------------
    // 5. COMPARATIVO DE EMPREENDIMENTOS (SPEs)
    // ------------------------------------------
    if (isConsolidated || speComparisonData.length > 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text("4. Comparativo Executivo Multi-Empreendimentos (Portfólio ARV)", margin, cursorY);
      cursorY += 3;

      const speRows = speComparisonData.map((s) => [
        s.tableName,
        s.speName,
        `${s.totalUnits} un.`,
        `${s.soldUnits} un.`,
        `${s.availableUnits} un.`,
        `${s.vsoPercent.toFixed(0)}%`,
        formatCurrency(s.avgPriceM2),
        formatShortCurrency(s.ticketMedio),
        formatCurrency(s.totalVgv),
        formatCurrency(s.soldVgv),
        formatCurrency(s.availableVgv),
      ]);

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin },
        head: [["Empreendimento", "SPE Responsável", "Unid.", "Vend.", "Estoque", "VSO", "Preço Méd./m²", "Ticket Méd.", "VGV Total", "VGV Vendido", "VGV Disponível"]],
        body: speRows,
        theme: "grid",
        styles: {
          fontSize: 6.8,
          cellPadding: 1.8,
          textColor: [51, 65, 85],
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 6.8,
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 26 },
          1: { cellWidth: 26 },
          2: { halign: "center", cellWidth: 10 },
          3: { halign: "center", cellWidth: 10 },
          4: { halign: "center", cellWidth: 11 },
          5: { halign: "center", fontStyle: "bold", cellWidth: 11 },
          6: { halign: "right", cellWidth: 18 },
          7: { halign: "right", cellWidth: 16 },
          8: { halign: "right", fontStyle: "bold", cellWidth: 22 },
          9: { halign: "right", cellWidth: 20 },
          10: { halign: "right", cellWidth: 20 },
        },
      });

      cursorY = (doc as any).lastAutoTable.finalY + 8;
    }

    // ------------------------------------------
    // 6. DETALHE DAS UNIDADES DISPONÍVEIS (ESTOQUE)
    // ------------------------------------------
    const availableUnitsList = units.filter((u) => u.status === "Disponível");
    if (!isConsolidated && availableUnitsList.length > 0) {
      if (cursorY > pageHeight - 60) {
        doc.addPage();
        cursorY = 28;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`5. Espelho de Estoque Disponível (${availableUnitsList.length} unidades)`, margin, cursorY);
      cursorY += 3;

      const unitRows = availableUnitsList.slice(0, 40).map((u) => [
        u.unitNumber,
        u.floorName || `${u.floor}° Pav.`,
        u.type || "-",
        `${(u.privateAreaM2 || 0).toFixed(2)} m²`,
        u.garageType || "Padrão",
        u.solarOrientation || u.position || "-",
        formatCurrency(u.basePrice),
        formatCurrency(u.privateAreaM2 > 0 ? u.basePrice / u.privateAreaM2 : 0),
        `${(simulatedCub > 0 && u.privateAreaM2 > 0 ? u.basePrice / (u.privateAreaM2 * simulatedCub) : 0).toFixed(2)} CUB`,
      ]);

      autoTable(doc, {
        startY: cursorY,
        margin: { left: margin, right: margin },
        head: [["Unidade", "Pavimento", "Tipologia", "Área Priv.", "Vaga de Garagem", "Posição / Sol", "Preço Tabela", "Preço / m²", "CUB / m²"]],
        body: unitRows,
        theme: "grid",
        styles: {
          fontSize: 6.5,
          cellPadding: 1.5,
          textColor: [51, 65, 85],
        },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 6.5,
        },
        columnStyles: {
          0: { fontStyle: "bold", cellWidth: 16 },
          1: { cellWidth: 18 },
          2: { cellWidth: 26 },
          3: { halign: "center", cellWidth: 16 },
          4: { halign: "center", cellWidth: 16 },
          5: { halign: "center", cellWidth: 12 },
          6: { halign: "center", cellWidth: 18 },
          7: { halign: "right", fontStyle: "bold", cellWidth: 24 },
          8: { halign: "right", cellWidth: 20 },
          9: { halign: "center", cellWidth: 16 },
        },
      });
    }

    // Apply header & footer across all pages
    applyHeaderAndFooter();

    // Export & Download
    const fileName = options.fileName || `RELATORIO_COMERCIAL_ARV_${isConsolidated ? "CONSOLIDADO" : (activeTable?.speName || "EMPREENDIMENTO").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  },

  /**
   * Generates a dedicated Broker Availability Mirror & Sales Table PDF (Espelho de Estoque para Corretores).
   * Includes detailed unit-by-unit payment breakdown (Ato, Mensais 40x, Balões 6x, Chaves, Financiamento 60%).
   */
  generateBrokerAvailabilityMirrorPDF(data: CommercialReportData, options: PDFExportOptions = {}): void {
    const { isConsolidated, activeTable, simulatedCub, cubSimVariation, units } = data;

    const availableUnits = units.filter((u) => u.status === "Disponível");
    const totalAvailVgv = availableUnits.reduce((acc, u) => acc + u.basePrice, 0);
    const minPrice = availableUnits.length > 0
      ? Math.min(...availableUnits.map((u) => u.basePrice))
      : 0;
    const minAto = availableUnits.length > 0
      ? Math.min(...availableUnits.map((u) => u.downPaymentAto || u.basePrice * 0.12))
      : 0;
    const minMonthly = availableUnits.length > 0
      ? Math.min(...availableUnits.map((u) => u.monthlyInstallment40x || (u.basePrice * 0.15) / 40))
      : 0;

    // Landscape orientation gives plenty of width for commercial payment columns
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    const title = isConsolidated
      ? "ESPELHO DE ESTOQUE DISPONÍVEL • PORTFÓLIO GERAL ARV"
      : `ESPELHO DE ESTOQUE & TABELA DE VENDAS • ${activeTable?.name || "EMPREENDIMENTO"}`;
    const subtitle = isConsolidated
      ? `Material de Apoio Comercial para Corretores e Imobiliárias • ${availableUnits.length} Unidades Disponíveis`
      : `SPE: ${activeTable?.speName || "ARV Empreendimentos"} • Validade da Tabela: ${activeTable?.validUntil || "Vigente"} • ${availableUnits.length} Unidades Disponíveis`;

    const dateStr = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());

    const applyBrokerHeaderAndFooter = () => {
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Header Background
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 20, "F");

        // Accent Line (Emerald for availability)
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.rect(0, 20, pageWidth, 1.2, "F");

        // Header Brand & Badge
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("ARV EMPREENDIMENTOS", margin, 9);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(52, 211, 153); // emerald-400
        doc.text("ESPELHO DE ESTOQUE & APOIO COMERCIAL • CORRETORES & IMOBILIÁRIAS", margin, 15);

        // Right side info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(203, 213, 225);
        doc.text(`Atualização: ${dateStr}`, pageWidth - margin, 9, { align: "right" });
        doc.text(`CUB/SC Ref.: ${formatCurrency(simulatedCub)}${cubSimVariation !== 0 ? ` (${cubSimVariation > 0 ? `+${cubSimVariation}%` : `${cubSimVariation}%`})` : ""}`, pageWidth - margin, 15, { align: "right" });

        // Footer Background
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(0, pageHeight - 10, pageWidth, pageHeight - 10);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.8);
        doc.setTextColor(100, 116, 139);
        doc.text("ARV Inc. • Condições sujeitas a alteração sem aviso prévio. Correção monetária pela variação positiva do CUB/SC durante a obra.", margin, pageHeight - 4);
        doc.setFont("helvetica", "bold");
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 4, { align: "right" });
      }
    };

    let cursorY = 26;

    // Title Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(title, margin, cursorY);
    cursorY += 4.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, margin, cursorY);
    cursorY += 6;

    // 4 KPI Summary Cards for Brokers
    const brokerCardWidth = (contentWidth - 9) / 4;
    const brokerCardHeight = 15;
    const brokerCards = [
      { label: "UNIDADES DISPONÍVEIS", value: `${availableUnits.length} un.`, sub: `VGV Estoque: ${formatShortCurrency(totalAvailVgv)}`, color: [16, 185, 129] },
      { label: "VALOR A PARTIR DE", value: formatCurrency(minPrice), sub: "Menor ticket disponível", color: [79, 70, 229] },
      { label: "ENTRADA / ATO (12%) A PARTIR DE", value: formatCurrency(minAto), sub: "Facilidade de entrada", color: [217, 119, 6] },
      { label: "40x MENSAIS A PARTIR DE", value: formatCurrency(minMonthly), sub: "Parcelamento direto na obra", color: [147, 51, 234] },
    ];

    brokerCards.forEach((c, idx) => {
      const x = margin + idx * (brokerCardWidth + 3);
      const y = cursorY;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, brokerCardWidth, brokerCardHeight, 1.5, 1.5, "F");
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, y, brokerCardWidth, brokerCardHeight, 1.5, 1.5, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, x + 3, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      doc.text(c.value, x + 3, y + 9.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(c.sub, x + 3, y + 13.5);
    });

    cursorY += brokerCardHeight + 5;

    // =========================================================================
    // 2. VISUAL CHART & BREAKDOWN: DISPONIBILIDADE POR TIPOLOGIA
    // =========================================================================
    // Calculate Typology statistics
    const typologyMap: Record<
      string,
      {
        type: string;
        count: number;
        vgv: number;
        minPrice: number;
        maxPrice: number;
        minAto: number;
        minMonthly: number;
        totalArea: number;
        avgArea: number;
        avgPriceM2: number;
      }
    > = {};

    availableUnits.forEach((u) => {
      const t = u.type || "Padrão";
      const price = u.basePrice;
      const ato = u.downPaymentAto || price * 0.12;
      const monthly = u.monthlyInstallment40x || (price * 0.15) / 40;
      const area = u.privateAreaM2 || 0;

      if (!typologyMap[t]) {
        typologyMap[t] = {
          type: t,
          count: 0,
          vgv: 0,
          minPrice: price,
          maxPrice: price,
          minAto: ato,
          minMonthly: monthly,
          totalArea: 0,
          avgArea: 0,
          avgPriceM2: 0,
        };
      }

      const item = typologyMap[t];
      item.count += 1;
      item.vgv += price;
      item.minPrice = Math.min(item.minPrice, price);
      item.maxPrice = Math.max(item.maxPrice, price);
      item.minAto = Math.min(item.minAto, ato);
      item.minMonthly = Math.min(item.minMonthly, monthly);
      item.totalArea += area;
    });

    const typologyList = Object.values(typologyMap)
      .map((item) => ({
        ...item,
        avgArea: item.count > 0 ? item.totalArea / item.count : 0,
        avgPriceM2: item.totalArea > 0 ? item.vgv / item.totalArea : 0,
        percentCount: availableUnits.length > 0 ? (item.count / availableUnits.length) * 100 : 0,
        percentVgv: totalAvailVgv > 0 ? (item.vgv / totalAvailVgv) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const maxCount = Math.max(...typologyList.map((t) => t.count), 1);

    // Palettes for typology bars
    const barPalette = [
      { fill: [16, 185, 129], text: [5, 150, 105] }, // Emerald
      { fill: [99, 102, 241], text: [79, 70, 229] }, // Indigo
      { fill: [245, 158, 11], text: [217, 119, 6] }, // Amber
      { fill: [139, 92, 246], text: [124, 58, 237] }, // Purple
      { fill: [14, 165, 233], text: [2, 132, 199] }, // Sky
      { fill: [244, 63, 94], text: [225, 29, 72] }, // Rose
    ];

    // Left container: Graphical Bar Chart
    const chartBoxWidth = 135;
    const rightBoxWidth = contentWidth - chartBoxWidth - 4;
    const chartBoxHeight = Math.max(38, Math.min(typologyList.length * 11 + 14, 55));

    // Draw Chart Container
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, cursorY, chartBoxWidth, chartBoxHeight, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cursorY, chartBoxWidth, chartBoxHeight, 2, 2, "S");

    // Header inside Chart Container
    doc.setFillColor(241, 245, 249);
    doc.rect(margin + 0.3, cursorY + 0.3, chartBoxWidth - 0.6, 6.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text("GRÁFICO: DISTRIBUIÇÃO DO ESTOQUE POR TIPOLOGIA", margin + 3, cursorY + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total: ${availableUnits.length} un.`, margin + chartBoxWidth - 3, cursorY + 4.5, { align: "right" });

    // Render horizontal bars for each typology
    let barY = cursorY + 9.5;
    const maxTypologiesToRender = Math.min(typologyList.length, 4);

    for (let idx = 0; idx < maxTypologiesToRender; idx++) {
      const item = typologyList[idx];
      const colors = barPalette[idx % barPalette.length];
      const barTrackWidth = 65;
      const filledWidth = Math.max(4, (item.count / maxCount) * barTrackWidth);

      // Typology Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(30, 41, 59);
      doc.text(item.type, margin + 3, barY + 3);

      // Track Bar
      const barStartX = margin + 34;
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(barStartX, barY, barTrackWidth, 4, 1, 1, "F");

      // Filled Bar
      doc.setFillColor(colors.fill[0], colors.fill[1], colors.fill[2]);
      doc.roundedRect(barStartX, barY, filledWidth, 4, 1, 1, "F");

      // Count & Percentage Badge
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(`${item.count} un. (${item.percentCount.toFixed(0)}%)`, barStartX + barTrackWidth + 2.5, barY + 3);

      // Commercial Details Line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.setTextColor(100, 116, 139);
      doc.text(`A partir de ${formatCurrency(item.minPrice)} • Entrada 12%: ${formatCurrency(item.minAto)} • 40x de ${formatCurrency(item.minMonthly)}`, margin + 3, barY + 7.5);

      barY += 9.5;
    }

    // Right Container: Typology Summary Table
    const rightBoxX = margin + chartBoxWidth + 4;
    const typologyTableRows = typologyList.map((t) => [
      t.type,
      `${t.count} un.`,
      `${t.percentCount.toFixed(1)}%`,
      formatCurrency(t.minPrice),
      formatCurrency(t.minAto),
      formatCurrency(t.minMonthly),
      `${t.avgArea.toFixed(1)} m²`,
      formatShortCurrency(t.vgv),
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: rightBoxX, right: margin },
      head: [
        [
          "Tipologia",
          "Qtd",
          "% Est.",
          "Valor Mínimo",
          "Ato Mín. (12%)",
          "40x Mensal Mín.",
          "Área Méd.",
          "VGV Total",
        ],
      ],
      body: typologyTableRows,
      theme: "grid",
      styles: {
        fontSize: 6.2,
        cellPadding: 1.2,
        textColor: [30, 41, 59],
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 6.2,
        halign: "center",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 26 },
        1: { halign: "center", fontStyle: "bold", cellWidth: 12 },
        2: { halign: "center", cellWidth: 12 },
        3: { halign: "right", fontStyle: "bold", cellWidth: 20 },
        4: { halign: "right", cellWidth: 19 },
        5: { halign: "right", cellWidth: 19 },
        6: { halign: "center", cellWidth: 14 },
        7: { halign: "right", fontStyle: "bold", cellWidth: 16 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    const finalRightY = (doc as any).lastAutoTable.finalY || cursorY + chartBoxHeight;
    cursorY = Math.max(cursorY + chartBoxHeight, finalRightY) + 5;

    // Section title for detailed units
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text("TABELA COMPLETA DE UNIDADES DISPONÍVEIS & FLUXO DE PAGAMENTO", margin, cursorY);
    cursorY += 2.5;

    // Available Units Table with Full Payment Flow Columns
    const unitTableRows = availableUnits.map((u) => {
      const price = u.basePrice;
      const ato = u.downPaymentAto || price * 0.12;
      const monthly = u.monthlyInstallment40x || (price * 0.15) / 40;
      const balloon = u.balloonInstallment6x || (price * 0.08) / 6;
      const keys = u.finalInstallment || price * 0.05;
      const financing = u.financingBalance || price * 0.60;
      const priceM2 = u.privateAreaM2 > 0 ? price / u.privateAreaM2 : 0;

      return [
        u.unitNumber,
        u.floorName || `${u.floor}° Pav.`,
        u.type || "-",
        `${(u.privateAreaM2 || 0).toFixed(1)} m²`,
        u.garageType || "1 Vaga",
        u.solarOrientation || u.position || "-",
        formatCurrency(price),
        formatCurrency(priceM2),
        formatCurrency(ato),
        formatCurrency(monthly),
        formatCurrency(balloon),
        formatCurrency(keys),
        formatCurrency(financing),
      ];
    });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [
        [
          "Unid.",
          "Pavimento",
          "Tipologia",
          "Área",
          "Garagem",
          "Sol / Vista",
          "Preço Total",
          "R$ / m²",
          "Ato (12%)",
          "40x Mensais",
          "6x Balões",
          "Chaves (5%)",
          "Financ. (60%)",
        ],
      ],
      body: unitTableRows,
      theme: "grid",
      styles: {
        fontSize: 6.8,
        cellPadding: 1.6,
        textColor: [30, 41, 59],
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 6.8,
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", fontStyle: "bold", cellWidth: 16 },
        1: { cellWidth: 20 },
        2: { cellWidth: 28 },
        3: { halign: "center", cellWidth: 16 },
        4: { halign: "center", cellWidth: 16 },
        5: { halign: "center", cellWidth: 18 },
        6: { halign: "right", fontStyle: "bold", cellWidth: 26 },
        7: { halign: "right", cellWidth: 22 },
        8: { halign: "right", cellWidth: 22 },
        9: { halign: "right", cellWidth: 22 },
        10: { halign: "right", cellWidth: 22 },
        11: { halign: "right", cellWidth: 22 },
        12: { halign: "right", fontStyle: "bold", cellWidth: 27 },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Apply header & footer across all pages
    applyBrokerHeaderAndFooter();

    const fileName = options.fileName || `ESPELHO_ESTOQUE_CORRETORES_ARV_${isConsolidated ? "CONSOLIDADO" : (activeTable?.speName || "EMPREENDIMENTO").replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  },

  /**
   * Generates and downloads a multi-page PDF from a target DOM element with automatic fallback.
   */
  async exportElementToPDF(
    element: HTMLElement,
    options: PDFExportOptions = {},
    fallbackData?: CommercialReportData
  ): Promise<boolean> {
    const {
      fileName = `RELATORIO_COMERCIAL_ARV_${new Date().toISOString().slice(0, 10)}.pdf`,
    } = options;

    try {
      // Setup options for html2canvas to ensure highest rendering quality
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#0f172a",
        scrollY: 0,
        scrollX: 0,
        onclone: (clonedDoc) => {
          const noPrintElements = clonedDoc.querySelectorAll(
            ".no-pdf-export, button, select, #btn-toggle-cub-simulator, #btn-export-commercial-excel, #btn-export-commercial-pdf, #btn-print-commercial-dashboard"
          );
          noPrintElements.forEach((el) => {
            (el as HTMLElement).style.display = "none";
          });
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const isLandscape = options.orientation === "landscape";
      const pdf = new jsPDF({
        orientation: isLandscape ? "l" : "p",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = isLandscape ? 297 : 210;
      const pageHeight = isLandscape ? 210 : 297;
      const margin = 8;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.addImage(imgData, "JPEG", margin, margin, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= contentHeight;

      while (heightLeft > 0) {
        position = contentHeight * pageNumber;
        pageNumber++;

        pdf.addPage();
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidth, pageHeight, "F");

        pdf.addImage(imgData, "JPEG", margin, margin - position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= contentHeight;
      }

      pdf.save(fileName);
      return true;
    } catch (error) {
      console.warn("Canvas capture error, falling back to structured vector PDF generator:", error);
      if (fallbackData) {
        CommercialPdfExportService.generateStructuredExecutivePDF(fallbackData, options);
        return true;
      }
      throw error;
    }
  },

  /**
   * Browser native print trigger
   */
  printDashboard() {
    window.print();
  },
};
