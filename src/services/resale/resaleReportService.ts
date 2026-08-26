import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  ResaleListing,
  ResalePricing,
  ResalePaymentCondition,
  ResaleLead,
  ReturnRecord,
  SPE,
  Investor,
} from "../../types";
import { ResalePdfChartRenderer } from "./resalePdfChartRenderer";

export interface ResaleReportOptions {
  reportType: "executive" | "returns_compliance" | "showcase_pricing" | "leads_funnel";
  speId?: string;
  authorName?: string;
  executiveNotes?: string;
  includeStatsSummary?: boolean;
  includeDetailedTables?: boolean;
  includePaymentConditions?: boolean;
  includeCharts?: boolean;
  includePricingChart?: boolean;
  includeReturnsChart?: boolean;
  includeStatusFunnelChart?: boolean;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const ResaleReportService = {
  /**
   * Generates a professional, multi-page PDF report for Resale & Unit Returns
   */
  generatePDF(
    listings: ResaleListing[],
    pricingList: ResalePricing[],
    conditionsList: ResalePaymentCondition[],
    leads: ResaleLead[],
    returns: ReturnRecord[],
    spes: SPE[],
    investors: Investor[],
    options: ResaleReportOptions
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

    const speFilterName = options.speId
      ? spes.find((s) => s.id === options.speId)?.name || "SPE Selecionada"
      : "Consolidado Geral (Todas as SPEs)";

    // Filter datasets if speId is specified
    const filteredReturns = options.speId
      ? returns.filter((r) => r.speId === options.speId)
      : returns;

    const filteredListings = options.speId
      ? listings.filter((l) => {
          const ret = returns.find((r) => r.id === l.returnRecordId);
          return ret ? ret.speId === options.speId : true;
        })
      : listings;

    const filteredPricing = pricingList.filter((p) =>
      filteredListings.some((l) => l.id === p.resaleListingId)
    );

    const filteredLeads = options.speId
      ? leads.filter((lead) => {
          const listing = listings.find((l) => l.id === lead.resaleListingId);
          const ret = returns.find((r) => r.id === listing?.returnRecordId);
          return ret ? ret.speId === options.speId : true;
        })
      : leads;

    // Calculate aggregated metrics
    const totalListings = filteredListings.length;
    const publishedCount = filteredListings.filter((l) => l.status === "Publicado").length;
    const soldCount = filteredListings.filter((l) => l.status === "Vendido").length;
    const inPrepCount = filteredListings.filter((l) => l.status === "Em Preparação").length;

    const totalVgvResale = filteredPricing.reduce((acc, p) => acc + (p.resalePrice || 0), 0);
    const totalVgvTable = filteredPricing.reduce((acc, p) => acc + (p.originalTablePrice || 0), 0);
    const totalVgvSold = filteredListings
      .filter((l) => l.status === "Vendido")
      .reduce((acc, l) => {
        const p = filteredPricing.find((pr) => pr.resaleListingId === l.id);
        return acc + (p?.resalePrice || 0);
      }, 0);

    const totalContractReturns = filteredReturns.reduce(
      (acc, r) => acc + (r.originalContractAmount || 0),
      0
    );
    const totalRetentionRetained = filteredReturns.reduce(
      (acc, r) =>
        acc +
        ((r.originalContractAmount || 0) * (r.retentionPercentage || 0)) / 100,
      0
    );
    const totalRefundedToInvestors = filteredReturns.reduce(
      (acc, r) => acc + (r.amountRefundedToInvestor || 0),
      0
    );

    const avgDiscount =
      filteredPricing.length > 0
        ? filteredPricing.reduce((acc, p) => acc + (p.discountPercentageVsTable || 0), 0) /
          filteredPricing.length
        : 0;

    // Header & Footer helper
    const applyHeaderAndFooter = (reportTitle: string) => {
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
        doc.setFontSize(9.5);
        doc.text("ARV INVESTOR • GESTÃO DE ATIVOS IMOBILIÁRIOS", margin, 9);

        // Subtitle (Truncated safely if very long)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.2);
        doc.setTextColor(96, 165, 250); // blue-400
        const displayTitle =
          reportTitle.length > 58 ? reportTitle.slice(0, 55) + "..." : reportTitle;
        doc.text(displayTitle.toUpperCase(), margin, 15);

        // Right side info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.8);
        doc.setTextColor(203, 213, 225); // slate-300
        doc.text(`Emissão: ${dateStr}`, pageWidth - margin, 9, { align: "right" });
        const scopeShort =
          speFilterName.length > 30 ? speFilterName.slice(0, 28) + "..." : speFilterName;
        doc.text(`Escopo: ${scopeShort}`, pageWidth - margin, 15, { align: "right" });

        // Footer Background
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(0, pageHeight - 11, pageWidth, 11, "F");

        // Footer Divider
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.3);
        doc.line(0, pageHeight - 11, pageWidth, pageHeight - 11);

        // Footer Text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.2);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(
          "ARV Inc. • Relatório de Governança de Revendas e Distratos (Lei 13.786/2018) • Confidencial",
          margin,
          pageHeight - 4.5
        );
        doc.text(
          `Página ${i} de ${pageCount}`,
          pageWidth - margin,
          pageHeight - 4.5,
          { align: "right" }
        );
      }
    };

    let startY = 26;

    // Report Titles
    const reportTitles = {
      executive: "Relatório Executivo Consolidado de Revenda & Distratos",
      returns_compliance: "Relatório Jurídico-Financeiro de Distratos & Lei nº 13.786/2018",
      showcase_pricing: "Relatório Comercial de Vitrine, Preços & Descontos de Revenda",
      leads_funnel: "Relatório de Leads, Funil Comercial & Propostas de Revenda",
    };

    const currentTitle = reportTitles[options.reportType];

    // Document Title Banner (Multi-line aware with splitTextToSize)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    const titleLines = doc.splitTextToSize(currentTitle, contentWidth);
    doc.text(titleLines, margin, startY);
    startY += titleLines.length * 5.5 + 1.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const subtitleText = `Empreendimento: ${speFilterName} | Responsável: ${
      options.authorName || "Equipe ARV Investor"
    } | Emissão: ${dateStr}`;
    const subtitleLines = doc.splitTextToSize(subtitleText, contentWidth);
    doc.text(subtitleLines, margin, startY);
    startY += subtitleLines.length * 4 + 4;

    // Executive Summary Notes Box if provided (dynamically sized to prevent text overflow)
    if (options.executiveNotes && options.executiveNotes.trim().length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      const splitNotes = doc.splitTextToSize(options.executiveNotes.trim(), contentWidth - 8);
      const lineH = 3.5;
      const noteBoxHeight = 7.5 + splitNotes.length * lineH + 3;

      if (startY + noteBoxHeight > pageHeight - 20) {
        doc.addPage();
        startY = 26;
      }

      doc.setFillColor(241, 245, 249); // slate-100
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.roundedRect(margin, startY, contentWidth, noteBoxHeight, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.8);
      doc.setTextColor(30, 41, 59);
      doc.text("Parecer & Síntese Executiva:", margin + 4, startY + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(51, 65, 85);
      doc.text(splitNotes, margin + 4, startY + 9.5);

      startY += noteBoxHeight + 4;
    }

    // Top Summary Metric Cards Box (4 distinct rounded cards to prevent text bleed)
    if (options.includeStatsSummary !== false) {
      const cardGap = 2.5;
      const totalGaps = cardGap * 3;
      const cardW = (contentWidth - totalGaps) / 4;
      const cardH = 21;

      if (startY + cardH > pageHeight - 20) {
        doc.addPage();
        startY = 26;
      }

      const summaryCards = [
        {
          label: "VGV EM REVENDA",
          val: formatCurrency(totalVgvResale),
          valColor: [15, 23, 42] as [number, number, number],
          sub: `${totalListings} unid. (${publishedCount} ativas)`,
        },
        {
          label: "VGV RECOLOCADO",
          val: formatCurrency(totalVgvSold),
          valColor: [37, 99, 235] as [number, number, number],
          sub: `${soldCount} unidades concluídas`,
        },
        {
          label: "RETENÇÃO SPE (LEI)",
          val: formatCurrency(totalRetentionRetained),
          valColor: [16, 185, 129] as [number, number, number],
          sub: `${filteredReturns.length} distratos processados`,
        },
        {
          label: "DESCONTO MÉDIO",
          val: `${avgDiscount.toFixed(1)}% OFF`,
          valColor: [225, 29, 72] as [number, number, number],
          sub: `Piso de segurança ativo`,
        },
      ];

      summaryCards.forEach((c, idx) => {
        const cardX = margin + idx * (cardW + cardGap);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(cardX, startY, cardW, cardH, 2, 2, "FD");

        // Top accent line
        doc.setFillColor(...c.valColor);
        doc.rect(cardX + 2, startY + 2, cardW - 4, 0.6, "F");

        // Title Label
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.2);
        doc.setTextColor(100, 116, 139);
        doc.text(c.label, cardX + 3, startY + 6.5);

        // Value
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.2);
        doc.setTextColor(...c.valColor);
        doc.text(c.val, cardX + 3, startY + 12.5);

        // Subtitle
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.setTextColor(71, 85, 105);
        doc.text(c.sub, cardX + 3, startY + 17.5);
      });

      startY += cardH + 5;
    }

    const includeCharts = options.includeCharts !== false;

    // ==========================================
    // Visual Charts for Executive Report
    // ==========================================
    if (options.reportType === "executive" && includeCharts) {
      // 1. Status Donut & Lead Funnel Chart
      if (options.includeStatusFunnelChart !== false && filteredListings.length > 0) {
        try {
          if (startY + 62 > pageHeight - 16) {
            doc.addPage();
            startY = 26;
          }
          const funnelChartImg = ResalePdfChartRenderer.renderStatusAndFunnelSummaryChart(
            filteredListings,
            filteredLeads,
            680,
            230
          );
          if (funnelChartImg) {
            doc.addImage(funnelChartImg, "PNG", margin, startY, contentWidth, 58);
            startY += 62;
          }
        } catch (err) {
          console.warn("Could not render status funnel chart:", err);
        }
      }

      // 2. Pricing Comparison Chart
      if (options.includePricingChart !== false && filteredPricing.length > 0) {
        try {
          if (startY + 66 > pageHeight - 16) {
            doc.addPage();
            startY = 26;
          }
          const pricingChartImg = ResalePdfChartRenderer.renderPricingComparisonChart(
            filteredPricing,
            filteredListings,
            680,
            250
          );
          if (pricingChartImg) {
            doc.addImage(pricingChartImg, "PNG", margin, startY, contentWidth, 62);
            startY += 66;
          }
        } catch (err) {
          console.warn("Could not render pricing chart:", err);
        }
      }

      // 3. Returns & Distratos Financial Chart
      if (options.includeReturnsChart !== false && filteredReturns.length > 0) {
        try {
          if (startY + 66 > pageHeight - 16) {
            doc.addPage();
            startY = 26;
          }
          const returnsChartImg = ResalePdfChartRenderer.renderReturnsFinancialChart(
            filteredReturns,
            680,
            250
          );
          if (returnsChartImg) {
            doc.addImage(returnsChartImg, "PNG", margin, startY, contentWidth, 62);
            startY += 66;
          }
        } catch (err) {
          console.warn("Could not render returns chart:", err);
        }
      }
    }

    // ==========================================
    // Table 1: Distratos & Devoluções (if applicable)
    // ==========================================
    if (
      options.reportType === "executive" ||
      options.reportType === "returns_compliance"
    ) {
      // Visual chart specifically for returns compliance report
      if (
        options.reportType === "returns_compliance" &&
        includeCharts &&
        options.includeReturnsChart !== false &&
        filteredReturns.length > 0
      ) {
        try {
          if (startY + 66 > pageHeight - 16) {
            doc.addPage();
            startY = 26;
          }
          const returnsChartImg = ResalePdfChartRenderer.renderReturnsFinancialChart(
            filteredReturns,
            680,
            250
          );
          if (returnsChartImg) {
            doc.addImage(returnsChartImg, "PNG", margin, startY, contentWidth, 62);
            startY += 66;
          }
        } catch (err) {
          console.warn("Could not render returns chart:", err);
        }
      }

      if (startY > pageHeight - 45) {
        doc.addPage();
        startY = 26;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("1. Demonstrativo de Distratos e Devoluções de Unidades (Lei nº 13.786/2018)", margin, startY);
      startY += 3;

      const returnsTableData = filteredReturns.map((r) => {
        const inv = investors.find((i) => i.id === r.originalInvestorId);
        const spe = spes.find((s) => s.id === r.speId);
        const retentionVal = ((r.originalContractAmount || 0) * (r.retentionPercentage || 0)) / 100;

        return [
          r.unitId,
          spe?.name || r.speId,
          inv?.name || "Investidor Original",
          r.returnType,
          new Date(r.returnDate).toLocaleDateString("pt-BR"),
          formatCurrency(r.originalContractAmount),
          `${r.retentionPercentage}% (${formatCurrency(retentionVal)})`,
          formatCurrency(r.amountRefundedToInvestor),
          r.legalStatus,
        ];
      });

      autoTable(doc, {
        startY: startY + 2,
        head: [
          [
            "Unidade",
            "Empreendimento (SPE)",
            "Investidor Original",
            "Modalidade",
            "Data",
            "Vlr. Contrato",
            "Retenção Legal",
            "Restituição",
            "Status",
          ],
        ],
        body: returnsTableData,
        theme: "grid",
        styles: {
          fontSize: 6.5,
          cellPadding: 1.8,
          overflow: "linebreak",
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
        },
        columnStyles: {
          0: { cellWidth: 15, fontStyle: "bold" },
          1: { cellWidth: 26 },
          2: { cellWidth: 26 },
          3: { cellWidth: 18 },
          4: { cellWidth: 14 },
          5: { cellWidth: 22, halign: "right" },
          6: { cellWidth: 26, halign: "right" },
          7: { cellWidth: 20, halign: "right" },
          8: { cellWidth: 15, halign: "center" },
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 6.8,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: margin, right: margin },
      });

      startY = (doc as any).lastAutoTable.finalY + 8;
    }

    // ==========================================
    // Table 2: Precificação e Vitrine de Revenda
    // ==========================================
    if (
      options.reportType === "executive" ||
      options.reportType === "showcase_pricing"
    ) {
      // Visual chart specifically for showcase pricing report
      if (
        options.reportType === "showcase_pricing" &&
        includeCharts &&
        options.includePricingChart !== false &&
        filteredPricing.length > 0
      ) {
        try {
          if (startY + 66 > pageHeight - 16) {
            doc.addPage();
            startY = 26;
          }
          const pricingChartImg = ResalePdfChartRenderer.renderPricingComparisonChart(
            filteredPricing,
            filteredListings,
            680,
            250
          );
          if (pricingChartImg) {
            doc.addImage(pricingChartImg, "PNG", margin, startY, contentWidth, 62);
            startY += 66;
          }
        } catch (err) {
          console.warn("Could not render pricing chart:", err);
        }
      }

      if (startY > pageHeight - 45) {
        doc.addPage();
        startY = 26;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("2. Tabela de Precificação Estratégica & Descontos de Revenda", margin, startY);
      startY += 3;

      const pricingTableData = filteredListings.map((l) => {
        const pricing = filteredPricing.find((p) => p.resaleListingId === l.id);
        const ret = returns.find((r) => r.id === l.returnRecordId);
        const spe = spes.find((s) => s.id === (ret?.speId || "spe-t58"));

        const tablePrice = pricing?.originalTablePrice || 0;
        const resalePrice = pricing?.resalePrice || 0;
        const floorPrice = pricing?.minimumAcceptablePrice || 0;
        const discountPct = pricing?.discountPercentageVsTable || 0;

        return [
          l.unitId,
          spe?.name || "T58",
          l.listingTitle || "Oportunidade de Revenda",
          formatCurrency(tablePrice),
          formatCurrency(resalePrice),
          `${discountPct.toFixed(1)}% OFF`,
          formatCurrency(floorPrice),
          pricing?.pricingReason || "Estímulo à Liquidez",
          l.status,
        ];
      });

      autoTable(doc, {
        startY: startY + 2,
        head: [
          [
            "Unidade",
            "SPE",
            "Título do Anúncio",
            "Preço Tabela",
            "Preço Revenda",
            "Desconto",
            "Piso Mínimo",
            "Motivação",
            "Status",
          ],
        ],
        body: pricingTableData,
        theme: "grid",
        styles: {
          fontSize: 6.5,
          cellPadding: 1.8,
          overflow: "linebreak",
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
        },
        columnStyles: {
          0: { cellWidth: 15, fontStyle: "bold" },
          1: { cellWidth: 18 },
          2: { cellWidth: 32 },
          3: { cellWidth: 22, halign: "right" },
          4: { cellWidth: 22, halign: "right" },
          5: { cellWidth: 16, halign: "center" },
          6: { cellWidth: 22, halign: "right" },
          7: { cellWidth: 21 },
          8: { cellWidth: 14, halign: "center" },
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 6.8,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: margin, right: margin },
      });

      startY = (doc as any).lastAutoTable.finalY + 8;
    }

    // ==========================================
    // Table 3: Leads, Propostas & Funil Comercial
    // ==========================================
    if (
      options.reportType === "executive" ||
      options.reportType === "leads_funnel"
    ) {
      // Visual chart specifically for leads funnel report
      if (
        options.reportType === "leads_funnel" &&
        includeCharts &&
        options.includeStatusFunnelChart !== false &&
        filteredListings.length > 0
      ) {
        try {
          if (startY + 62 > pageHeight - 16) {
            doc.addPage();
            startY = 26;
          }
          const funnelChartImg = ResalePdfChartRenderer.renderStatusAndFunnelSummaryChart(
            filteredListings,
            filteredLeads,
            680,
            230
          );
          if (funnelChartImg) {
            doc.addImage(funnelChartImg, "PNG", margin, startY, contentWidth, 58);
            startY += 62;
          }
        } catch (err) {
          console.warn("Could not render status funnel chart:", err);
        }
      }

      if (startY > pageHeight - 45) {
        doc.addPage();
        startY = 26;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("3. Pipeline Comercial de Leads & Propostas de Revenda", margin, startY);
      startY += 3;

      const leadsTableData = leads.map((lead) => {
        const listing = listings.find((l) => l.id === lead.resaleListingId);

        return [
          listing?.unitId || "Geral",
          lead.name || "Interessado",
          lead.email,
          lead.phone,
          lead.source,
          lead.message || "Interesse na unidade",
          new Date(lead.createdAt).toLocaleDateString("pt-BR"),
          lead.status,
        ];
      });

      autoTable(doc, {
        startY: startY + 2,
        head: [
          [
            "Unidade",
            "Comprador / Lead",
            "E-mail",
            "Telefone",
            "Canal",
            "Mensagem / Demanda",
            "Data Cadastro",
            "Status",
          ],
        ],
        body: leadsTableData,
        theme: "grid",
        styles: {
          fontSize: 6.5,
          cellPadding: 1.8,
          overflow: "linebreak",
          textColor: [30, 41, 59],
          lineColor: [226, 232, 240],
        },
        columnStyles: {
          0: { cellWidth: 15, fontStyle: "bold" },
          1: { cellWidth: 24 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 18 },
          5: { cellWidth: 42 },
          6: { cellWidth: 16 },
          7: { cellWidth: 17, halign: "center" },
        },
        headStyles: {
          fillColor: [124, 58, 237],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 6.8,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: margin, right: margin },
      });

      startY = (doc as any).lastAutoTable.finalY + 8;
    }

    // Apply corporate header and footers to all pages
    applyHeaderAndFooter(currentTitle);

    // Save PDF
    const fileSuffix = options.reportType.replace("_", "-");
    doc.save(`relatorio-revenda-distratos-${fileSuffix}-${new Date().toISOString().split("T")[0]}.pdf`);
  },

  /**
   * Generates a rich Excel Workbook (.xlsx) with multiple structured sheets
   */
  exportToExcel(
    listings: ResaleListing[],
    pricingList: ResalePricing[],
    conditionsList: ResalePaymentCondition[],
    leads: ResaleLead[],
    returns: ReturnRecord[],
    spes: SPE[],
    investors: Investor[],
    speId?: string
  ): void {
    const wb = XLSX.utils.book_new();

    // 1. Resumo Executivo
    const totalVgvResale = pricingList.reduce((acc, p) => acc + (p.resalePrice || 0), 0);
    const totalVgvSold = listings
      .filter((l) => l.status === "Vendido")
      .reduce((acc, l) => {
        const p = pricingList.find((pr) => pr.resaleListingId === l.id);
        return acc + (p?.resalePrice || 0);
      }, 0);

    const totalRetentions = returns.reduce(
      (acc, r) => acc + ((r.originalContractAmount * r.retentionPercentage) / 100),
      0
    );

    const summaryData = [
      ["ARV INVESTOR - RELATÓRIO CONSOLIDADO DE REVENDA E DISTRATOS"],
      ["Data de Exportação", new Date().toLocaleString("pt-BR")],
      ["Empreendimento / SPE", speId ? spes.find((s) => s.id === speId)?.name || speId : "Todas as SPEs"],
      [],
      ["MÉTRICAS CONSOLIDADAS", "VALOR"],
      ["Total de Unidades na Esteira", listings.length],
      ["Unidades Ativas em Vitrine", listings.filter((l) => l.status === "Publicado").length],
      ["Unidades Vendidas / Recolocadas", listings.filter((l) => l.status === "Vendido").length],
      ["VGV Total em Revenda (R$)", totalVgvResale],
      ["VGV Recolocado / Vendido (R$)", totalVgvSold],
      ["Retenção Financeira Retida da Incorporadora (R$)", totalRetentions],
      ["Total de Leads Captados", leads.length],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo Executivo");

    // 2. Distratos & Devoluções
    const returnsData = returns.map((r) => {
      const inv = investors.find((i) => i.id === r.originalInvestorId);
      const spe = spes.find((s) => s.id === r.speId);
      const retentionVal = (r.originalContractAmount * r.retentionPercentage) / 100;

      return {
        "ID Registro": r.id,
        "Unidade": r.unitId,
        "Empreendimento (SPE)": spe?.name || r.speId,
        "Investidor Original": inv?.name || "Investidor Original",
        "Modalidade de Devolução": r.returnType,
        "Status Jurídico": r.legalStatus,
        "Data do Distrato": r.returnDate,
        "Valor Original Contrato (R$)": r.originalContractAmount,
        "Retenção Aplicada (%)": r.retentionPercentage,
        "Valor Retido pela SPE (R$)": retentionVal,
        "Restituição ao Investidor (R$)": r.amountRefundedToInvestor,
        "Observações": r.notes || "",
      };
    });
    const wsReturns = XLSX.utils.json_to_sheet(returnsData);
    XLSX.utils.book_append_sheet(wb, wsReturns, "Distratos e Devoluções");

    // 3. Precificação e Anúncios de Revenda
    const listingsData = listings.map((l) => {
      const pricing = pricingList.find((p) => p.resaleListingId === l.id);
      const ret = returns.find((r) => r.id === l.returnRecordId);
      const spe = spes.find((s) => s.id === (ret?.speId || "spe-t58"));

      return {
        "ID Anúncio": l.id,
        "Unidade": l.unitId,
        "SPE": spe?.name || "SPE T58",
        "Título": l.listingTitle,
        "Status Esteira": l.status,
        "Preço Tabela Oficial (R$)": pricing?.originalTablePrice || 0,
        "Preço Revenda (R$)": pricing?.resalePrice || 0,
        "Desconto s/ Tabela (%)": pricing?.discountPercentageVsTable || 0,
        "Piso Mínimo Aceitável (R$)": pricing?.minimumAcceptablePrice || 0,
        "Motivação de Preço": pricing?.pricingReason || "",
        "Visualizações": l.viewsCount,
        "Leads Gerados": l.leadsGeneratedCount,
      };
    });
    const wsListings = XLSX.utils.json_to_sheet(listingsData);
    XLSX.utils.book_append_sheet(wb, wsListings, "Precificação e Vitrine");

    // 4. Condições de Pagamento
    const conditionsData = conditionsList.map((c) => {
      const listing = listings.find((l) => l.id === c.resaleListingId);
      return {
        "ID Condição": c.id,
        "Unidade": listing?.unitId || "Geral",
        "Nome da Condição": c.name,
        "Entrada (%)": c.downPaymentPercentage,
        "Nº Parcelas": c.numberOfInstallments,
        "Indexador": c.indexer,
        "Desconto Especial (%)": c.specialDiscountPercentage || 0,
        "Aceita Financiamento": c.allowsFinancing ? "Sim" : "Não",
      };
    });
    const wsConditions = XLSX.utils.json_to_sheet(conditionsData);
    XLSX.utils.book_append_sheet(wb, wsConditions, "Condições de Pagamento");

    // 5. Leads e Funil de Vendas
    const leadsData = leads.map((lead) => {
      const listing = listings.find((l) => l.id === lead.resaleListingId);
      return {
        "ID Lead": lead.id,
        "Unidade": listing?.unitId || "Geral",
        "Nome": lead.name,
        "Email": lead.email,
        "Telefone": lead.phone,
        "Canal de Origem": lead.source,
        "Status Funil": lead.status,
        "Data Cadastro": lead.createdAt,
        "Mensagem / Observação": lead.message || "",
      };
    });
    const wsLeads = XLSX.utils.json_to_sheet(leadsData);
    XLSX.utils.book_append_sheet(wb, wsLeads, "Pipeline de Leads");

    // Download XLSX file
    XLSX.writeFile(
      wb,
      `arv-relatorio-revenda-distratos-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  },

  /**
   * Generates a clean CSV file for quick exports
   */
  exportToCSV(data: any[], filename: string): void {
    const ws = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob(["\ufeff" + csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Generates an Executive AI Assessment Brief based on current metrics
   */
  generateExecutiveAIBrief(
    listings: ResaleListing[],
    pricingList: ResalePricing[],
    returns: ReturnRecord[],
    leads: ResaleLead[]
  ): string {
    const totalListings = listings.length;
    const sold = listings.filter((l) => l.status === "Vendido").length;
    const published = listings.filter((l) => l.status === "Publicado").length;
    const avgDiscount =
      pricingList.length > 0
        ? pricingList.reduce((acc, p) => acc + (p.discountPercentageVsTable || 0), 0) /
          pricingList.length
        : 0;

    const totalVgvResale = pricingList.reduce((acc, p) => acc + (p.resalePrice || 0), 0);
    const totalRetention = returns.reduce(
      (acc, r) => acc + ((r.originalContractAmount * r.retentionPercentage) / 100),
      0
    );

    const conversionRate = totalListings > 0 ? ((sold / totalListings) * 100).toFixed(1) : "0.0";

    return `A carteira de Revenda e Distratos conta atualmente com ${totalListings} unidades monitoradas, das quais ${published} encontram-se ativas na vitrine comercial e ${sold} já foram recolocadas com sucesso (taxa de conversão de ${conversionRate}%). O VGV em negociação soma R$ ${(totalVgvResale / 1000000).toFixed(2)}M, praticando um desconto médio ponderado de ${avgDiscount.toFixed(1)}% em relação à tabela oficial, resguardando integralmente o piso mínimo aprovado. A retenção jurídica acumulada em favor das SPEs sob a Lei 13.786/2018 totaliza R$ ${(totalRetention / 1000).toFixed(0)}k, amortizando despesas contratuais e garantindo a solidez do fluxo de caixa.`;
  },
};
