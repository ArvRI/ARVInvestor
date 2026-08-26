/**
 * High-DPI HTML5 Canvas Chart Renderer for Resale & Returns PDF Reports.
 * Produces crisp, vector-grade PNG base64 images ready for embedding directly into jsPDF documents.
 */

import {
  ResaleListing,
  ResalePricing,
  ResaleLead,
  ReturnRecord,
  SPE,
} from "../../types";

const formatCurrencyShort = (val: number): string => {
  if (val >= 1000000) {
    return `R$ ${(val / 1000000).toFixed(2).replace(".", ",")}M`;
  }
  if (val >= 1000) {
    return `R$ ${Math.round(val / 1000)}k`;
  }
  return `R$ ${Math.round(val)}`;
};

/**
 * Creates an in-memory high-DPI canvas
 */
function createHiDpiCanvas(
  width: number,
  height: number,
  scale = 2.5
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

export const ResalePdfChartRenderer = {
  /**
   * 1. Pricing Comparison Chart: Tabela vs. Revenda vs. Piso Mínimo
   */
  renderPricingComparisonChart(
    pricingList: ResalePricing[],
    listings: ResaleListing[],
    width = 680,
    height = 250
  ): string {
    if (!pricingList || pricingList.length === 0) return "";

    const { canvas, ctx } = createHiDpiCanvas(width, height, 2.5);

    // Background Card
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Subtle container border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    // Header Title
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px Helvetica, Arial, sans-serif";
    ctx.fillText(
      "COMPARATIVO DE PRECIFICAÇÃO: TABELA OFICIAL vs REVENDA vs PISO MÍNIMO",
      16,
      20
    );

    // Subtitle on line 2 (left)
    ctx.fillStyle = "#64748b";
    ctx.font = "normal 8.5px Helvetica, Arial, sans-serif";
    ctx.fillText("Valores expressos em R$ mil por unidade na esteira", 16, 34);

    // Legend on line 2 (right) - guarantees zero overlap with title on line 1
    const legendY = 34;
    const legendX = width - 330;

    // Tabela Legend (Gray)
    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(legendX, legendY - 7, 10, 8);
    ctx.fillStyle = "#334155";
    ctx.font = "bold 8px Helvetica, Arial, sans-serif";
    ctx.fillText("Tabela Oficial", legendX + 13, legendY);

    // Revenda Legend (Blue)
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(legendX + 95, legendY - 7, 10, 8);
    ctx.fillStyle = "#334155";
    ctx.fillText("Preço Revenda", legendX + 108, legendY);

    // Piso Legend (Red)
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(legendX + 195, legendY - 7, 10, 8);
    ctx.fillStyle = "#334155";
    ctx.fillText("Piso Mínimo", legendX + 208, legendY);

    // Chart Dimensions
    const padLeft = 60;
    const padRight = 24;
    const padTop = 50;
    const padBottom = 34;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Data items to plot (up to 8 units to keep clean)
    const items = pricingList.slice(0, 8);
    const maxVal = Math.max(
      ...items.map((p) =>
        Math.max(p.originalTablePrice, p.resalePrice, p.minimumAcceptablePrice)
      ),
      100000
    );

    // Y Axis Grid lines
    const ySteps = 4;
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "normal 8px Helvetica, Arial, sans-serif";
    ctx.textAlign = "right";

    for (let i = 0; i <= ySteps; i++) {
      const yVal = (maxVal / ySteps) * i;
      const yPos = padTop + chartH - (i / ySteps) * chartH;

      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(padLeft + chartW, yPos);
      ctx.stroke();

      ctx.fillText(`R$ ${Math.round(yVal / 1000)}k`, padLeft - 6, yPos + 3);
    }

    ctx.textAlign = "left";

    // Draw Bar Groups
    const groupWidth = chartW / items.length;
    const barWidth = Math.min(Math.max((groupWidth - 20) / 3, 8), 24);

    items.forEach((p, idx) => {
      const listing = listings.find((l) => l.id === p.resaleListingId);
      const groupX = padLeft + idx * groupWidth + (groupWidth - barWidth * 3 - 6) / 2;

      const hTabela = (p.originalTablePrice / maxVal) * chartH;
      const hRevenda = (p.resalePrice / maxVal) * chartH;
      const hPiso = (p.minimumAcceptablePrice / maxVal) * chartH;

      const baseY = padTop + chartH;

      // Bar 1: Tabela
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(groupX, baseY - hTabela, barWidth, hTabela);

      // Bar 2: Revenda
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(groupX + barWidth + 2, baseY - hRevenda, barWidth, hRevenda);

      // Bar 3: Piso
      ctx.fillStyle = "#f87171";
      ctx.fillRect(groupX + (barWidth + 2) * 2, baseY - hPiso, barWidth, hPiso);

      // Discount Badge on top of revenda
      if (p.discountPercentageVsTable > 0) {
        ctx.fillStyle = "#1e40af";
        ctx.font = "bold 7.5px Helvetica, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          `-${p.discountPercentageVsTable.toFixed(0)}%`,
          groupX + barWidth + 2 + barWidth / 2,
          baseY - hRevenda - 4
        );
      }

      // X Label (Unit ID)
      ctx.fillStyle = "#334155";
      ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        p.unitId || `Unid ${idx + 1}`,
        groupX + barWidth * 1.5 + 2,
        baseY + 14
      );

      // Sublabel (Status)
      if (listing) {
        ctx.fillStyle = "#64748b";
        ctx.font = "normal 7px Helvetica, Arial, sans-serif";
        ctx.fillText(
          listing.status.slice(0, 10),
          groupX + barWidth * 1.5 + 2,
          baseY + 23
        );
      }
    });

    ctx.textAlign = "left";
    return canvas.toDataURL("image/png");
  },

  /**
   * 2. Returns & Retention Financial Breakdown (Lei 13.786/2018)
   */
  renderReturnsFinancialChart(
    returns: ReturnRecord[],
    width = 680,
    height = 250
  ): string {
    if (!returns || returns.length === 0) return "";

    const { canvas, ctx } = createHiDpiCanvas(width, height, 2.5);

    // Background Card
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Subtle container border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    // Header Title
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px Helvetica, Arial, sans-serif";
    ctx.fillText(
      "COMPOSIÇÃO FINANCEIRA DOS DISTRATOS (LEI Nº 13.786/2018)",
      16,
      20
    );

    // Subtitle on line 2 (left)
    ctx.fillStyle = "#64748b";
    ctx.font = "normal 8.5px Helvetica, Arial, sans-serif";
    ctx.fillText(
      "Demonstrativo de Valor Original, Retenção SPE e Restituição aos Investidores",
      16,
      34
    );

    // Legend on line 2 (right) - guarantees zero overlap with title
    const legendY = 34;
    const legendX = width - 360;

    // Contrato Original Legend (Slate)
    ctx.fillStyle = "#64748b";
    ctx.fillRect(legendX, legendY - 7, 10, 8);
    ctx.fillStyle = "#334155";
    ctx.font = "bold 8px Helvetica, Arial, sans-serif";
    ctx.fillText("Contrato Original", legendX + 13, legendY);

    // Retenção SPE Legend (Emerald)
    ctx.fillStyle = "#10b981";
    ctx.fillRect(legendX + 105, legendY - 7, 10, 8);
    ctx.fillStyle = "#334155";
    ctx.fillText("Retenção SPE (Lei)", legendX + 118, legendY);

    // Restituição Legend (Rose)
    ctx.fillStyle = "#f43f5e";
    ctx.fillRect(legendX + 220, legendY - 7, 10, 8);
    ctx.fillStyle = "#334155";
    ctx.fillText("Restituição Devolvida", legendX + 233, legendY);

    // Chart Dimensions
    const padLeft = 60;
    const padRight = 24;
    const padTop = 50;
    const padBottom = 34;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    const items = returns.slice(0, 8);
    const maxVal = Math.max(
      ...items.map((r) => r.originalContractAmount),
      100000
    );

    // Y Axis Grid lines
    const ySteps = 4;
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "normal 8px Helvetica, Arial, sans-serif";
    ctx.textAlign = "right";

    for (let i = 0; i <= ySteps; i++) {
      const yVal = (maxVal / ySteps) * i;
      const yPos = padTop + chartH - (i / ySteps) * chartH;

      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(padLeft + chartW, yPos);
      ctx.stroke();

      ctx.fillText(`R$ ${Math.round(yVal / 1000)}k`, padLeft - 6, yPos + 3);
    }

    ctx.textAlign = "left";

    // Draw Bar Groups
    const groupWidth = chartW / items.length;
    const barWidth = Math.min(Math.max((groupWidth - 20) / 3, 8), 24);

    items.forEach((r, idx) => {
      const groupX = padLeft + idx * groupWidth + (groupWidth - barWidth * 3 - 6) / 2;
      const retentionAmount = (r.originalContractAmount * r.retentionPercentage) / 100;

      const hContrato = (r.originalContractAmount / maxVal) * chartH;
      const hRetencao = (retentionAmount / maxVal) * chartH;
      const hRestituicao = (r.amountRefundedToInvestor / maxVal) * chartH;

      const baseY = padTop + chartH;

      // Bar 1: Contrato Original
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(groupX, baseY - hContrato, barWidth, hContrato);

      // Bar 2: Retenção SPE
      ctx.fillStyle = "#10b981";
      ctx.fillRect(groupX + barWidth + 2, baseY - hRetencao, barWidth, hRetencao);

      // Bar 3: Restituição
      ctx.fillStyle = "#f43f5e";
      ctx.fillRect(groupX + (barWidth + 2) * 2, baseY - hRestituicao, barWidth, hRestituicao);

      // Retention % Tag
      ctx.fillStyle = "#047857";
      ctx.font = "bold 7.5px Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `${r.retentionPercentage}%`,
        groupX + barWidth + 2 + barWidth / 2,
        baseY - hRetencao - 4
      );

      // Unit Label
      ctx.fillStyle = "#334155";
      ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        r.unitId || `Distrato ${idx + 1}`,
        groupX + barWidth * 1.5 + 2,
        baseY + 14
      );

      // Legal status
      ctx.fillStyle = "#64748b";
      ctx.font = "normal 7px Helvetica, Arial, sans-serif";
      ctx.fillText(
        r.legalStatus.slice(0, 10),
        groupX + barWidth * 1.5 + 2,
        baseY + 23
      );
    });

    ctx.textAlign = "left";
    return canvas.toDataURL("image/png");
  },

  /**
   * 3. Dual Chart: Status Donut + Funil Comercial de Leads
   */
  renderStatusAndFunnelSummaryChart(
    listings: ResaleListing[],
    leads: ResaleLead[],
    width = 680,
    height = 230
  ): string {
    const { canvas, ctx } = createHiDpiCanvas(width, height, 2.5);

    // Background Card
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    // Mid divider
    ctx.strokeStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.moveTo(width / 2, 12);
    ctx.lineTo(width / 2, height - 12);
    ctx.stroke();

    // ------------------------------------------------
    // LEFT SIDE: Status Distribution Donut Chart
    // ------------------------------------------------
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px Helvetica, Arial, sans-serif";
    ctx.fillText("DISTRIBUIÇÃO DE UNIDADES NA ESTEIRA", 16, 22);

    const publishedCount = listings.filter((l) => l.status === "Publicado").length;
    const inPrepCount = listings.filter((l) => l.status === "Em Preparação").length;
    const reservedCount = listings.filter((l) => l.status === "Reservado").length;
    const soldCount = listings.filter((l) => l.status === "Vendido").length;
    const pausedCount = listings.filter((l) => l.status === "Pausado").length;
    const total = listings.length || 1;

    const statusData = [
      { label: "Publicado", count: publishedCount, color: "#3b82f6" },
      { label: "Em Preparação", count: inPrepCount, color: "#f59e0b" },
      { label: "Reservado", count: reservedCount, color: "#8b5cf6" },
      { label: "Vendido", count: soldCount, color: "#10b981" },
      { label: "Pausado", count: pausedCount, color: "#64748b" },
    ].filter((s) => s.count > 0);

    const donutCenterX = 85;
    const donutCenterY = 120;
    const outerRadius = 55;
    const innerRadius = 32;

    let currentAngle = -Math.PI / 2;

    statusData.forEach((slice) => {
      const sliceAngle = (slice.count / total) * (Math.PI * 2);

      ctx.fillStyle = slice.color;
      ctx.beginPath();
      ctx.arc(donutCenterX, donutCenterY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(donutCenterX, donutCenterY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // Donut Center Text
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 14px Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${listings.length}`, donutCenterX, donutCenterY + 2);
    ctx.font = "normal 7px Helvetica, Arial, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("UNIDADES", donutCenterX, donutCenterY + 12);
    ctx.textAlign = "left";

    // Legend on the right of donut
    const legendX = 160;
    let legendY = 55;

    statusData.forEach((slice) => {
      ctx.fillStyle = slice.color;
      ctx.beginPath();
      ctx.arc(legendX + 4, legendY + 4, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
      const pct = ((slice.count / total) * 100).toFixed(0);
      ctx.fillText(`${slice.label}: ${slice.count} (${pct}%)`, legendX + 14, legendY + 7);

      legendY += 24;
    });

    // ------------------------------------------------
    // RIGHT SIDE: Funil Comercial de Leads
    // ------------------------------------------------
    const rightX = width / 2 + 16;
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px Helvetica, Arial, sans-serif";
    ctx.fillText("FUNIL COMERCIAL DE LEADS & COMPRADORES", rightX, 22);

    const funnelStages = [
      {
        stage: "Novos Leads",
        count: leads.filter((l) => l.status === "Novo").length,
        color: "#3b82f6",
      },
      {
        stage: "Em Atendimento",
        count: leads.filter((l) => l.status === "Em Atendimento").length,
        color: "#f59e0b",
      },
      {
        stage: "Proposta Enviada",
        count: leads.filter((l) => l.status === "Proposta Enviada").length,
        color: "#8b5cf6",
      },
      {
        stage: "Convertido (Vendido)",
        count: leads.filter((l) => l.status === "Convertido").length,
        color: "#10b981",
      },
      {
        stage: "Perdido",
        count: leads.filter((l) => l.status === "Perdido").length,
        color: "#94a3b8",
      },
    ];

    const maxLeadCount = Math.max(...funnelStages.map((s) => s.count), 1);
    const funnelBarMaxW = width - rightX - 85;
    let funnelY = 48;

    funnelStages.forEach((st) => {
      // Stage Name
      ctx.fillStyle = "#334155";
      ctx.font = "bold 8px Helvetica, Arial, sans-serif";
      ctx.fillText(st.stage, rightX, funnelY + 9);

      // Bar Background
      const barX = rightX + 90;
      const barW = Math.max((st.count / maxLeadCount) * funnelBarMaxW, 10);
      const barH = 13;

      ctx.fillStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.roundRect(barX, funnelY, funnelBarMaxW, barH, 3);
      ctx.fill();

      // Active Bar
      ctx.fillStyle = st.color;
      ctx.beginPath();
      ctx.roundRect(barX, funnelY, barW, barH, 3);
      ctx.fill();

      // Count on right
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
      ctx.fillText(`${st.count}`, barX + funnelBarMaxW + 6, funnelY + 10);

      funnelY += 28;
    });

    return canvas.toDataURL("image/png");
  },
};
