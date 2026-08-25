/**
 * Chart rendering engine for PDF reports.
 * Uses High-DPI HTML5 Canvas rendering to generate crisp, print-ready vector-style graphics
 * that embed seamlessly into jsPDF documents.
 */

import {
  ProfitabilitySimulation,
  BenchmarkComparisonResult,
  UnitPriceComparison,
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

const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatPercent = (val: number, showSign = false): string => {
  const formatted = (val || 0).toFixed(1).replace(".", ",") + "%";
  if (showSign && val > 0) return `+${formatted}`;
  return formatted;
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

export const ProfitabilityPdfChartRenderer = {
  /**
   * Generates a high-resolution temporal evolution chart (ARV Asset vs CDI vs IPCA)
   */
  renderTemporalEvolutionChart(
    comparison: BenchmarkComparisonResult,
    simulation: ProfitabilitySimulation,
    width = 680,
    height = 290
  ): string {
    const { canvas, ctx } = createHiDpiCanvas(width, height, 3);
    const factor = (simulation.purchasePrice || 100000) / 1000;
    const evolution = comparison.monthlyEvolution || [];

    if (evolution.length === 0) {
      return "";
    }

    // Background Card
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Subtle container border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    // Header Title & Legend
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 13px Helvetica, Arial, sans-serif";
    ctx.fillText("TRAJETÓRIA TEMPORAL DO PATRIMÔNIO • IMÓVEL ARV vs CDI vs IPCA", 16, 22);

    ctx.fillStyle = "#64748b";
    ctx.font = "normal 9.5px Helvetica, Arial, sans-serif";
    ctx.fillText(
      `Aporte Inicial: ${formatCurrency(simulation.purchasePrice)} | Prazo: ${simulation.horizonMonths} meses | Cenário: ${simulation.appreciationScenario}`,
      16,
      37
    );

    // Legend items on top-right
    const legendX = width - 330;
    const legendY = 22;

    // ARV Legend
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(legendX, legendY - 3.5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 9px Helvetica, Arial, sans-serif";
    ctx.fillText("Imóvel ARV", legendX + 8, legendY);

    // CDI Legend
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.arc(legendX + 90, legendY - 3.5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.fillText("CDI Líquido", legendX + 98, legendY);

    // IPCA Legend
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(legendX + 175, legendY - 3.5, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.fillText("IPCA (Inflação)", legendX + 183, legendY);

    // Chart Dimensions
    const padLeft = 68;
    const padRight = 36;
    const padTop = 56;
    const padBottom = 38;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Determine scale bounds
    let maxVal = 0;
    let minVal = simulation.purchasePrice;

    evolution.forEach((pt) => {
      const imovel = pt.realEstateValue * factor;
      const cdi = pt.cdiValue * factor;
      const ipca = pt.ipcaValue * factor;
      if (imovel > maxVal) maxVal = imovel;
      if (cdi > maxVal) maxVal = cdi;
      if (ipca > maxVal) maxVal = ipca;
      if (imovel < minVal) minVal = imovel;
      if (cdi < minVal) minVal = cdi;
      if (ipca < minVal) minVal = ipca;
    });

    // Add headroom
    const buffer = (maxVal - minVal) * 0.12 || maxVal * 0.1;
    const yTop = maxVal + buffer;
    const yBottom = Math.max(0, minVal - buffer * 0.5);

    // Grid lines (5 horizontal lines)
    const gridSteps = 4;
    ctx.lineWidth = 0.8;
    ctx.font = "normal 8.5px Helvetica, Arial, sans-serif";
    ctx.textAlign = "right";

    for (let i = 0; i <= gridSteps; i++) {
      const val = yBottom + (i / gridSteps) * (yTop - yBottom);
      const y = padTop + chartH - (i / gridSteps) * chartH;

      ctx.strokeStyle = "#f1f5f9";
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.fillText(formatCurrencyShort(val), padLeft - 8, y + 3);
    }
    ctx.textAlign = "left";

    // X Coordinates mapping
    const getX = (index: number) => {
      return padLeft + (index / (evolution.length - 1 || 1)) * chartW;
    };
    const getY = (val: number) => {
      return padTop + chartH - ((val - yBottom) / (yTop - yBottom)) * chartH;
    };

    // 1. Draw Area Gradient for ARV Imóvel
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, "rgba(37, 99, 235, 0.22)");
    gradient.addColorStop(1, "rgba(37, 99, 235, 0.01)");

    ctx.beginPath();
    ctx.moveTo(getX(0), padTop + chartH);
    evolution.forEach((pt, idx) => {
      ctx.lineTo(getX(idx), getY(pt.realEstateValue * factor));
    });
    ctx.lineTo(getX(evolution.length - 1), padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 2. Draw Line: IPCA (Inflação)
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 2;
    ctx.beginPath();
    evolution.forEach((pt, idx) => {
      const x = getX(idx);
      const y = getY(pt.ipcaValue * factor);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 3. Draw Line: CDI
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2.2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    evolution.forEach((pt, idx) => {
      const x = getX(idx);
      const y = getY(pt.cdiValue * factor);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]); // reset dash

    // 4. Draw Line: Imóvel ARV
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 3;
    ctx.beginPath();
    evolution.forEach((pt, idx) => {
      const x = getX(idx);
      const y = getY(pt.realEstateValue * factor);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 5. Draw End Badges / Dots on the final month
    const lastIdx = evolution.length - 1;
    const lastPt = evolution[lastIdx];
    const lastX = getX(lastIdx);

    const finalImovelVal = lastPt.realEstateValue * factor;
    const finalCdiVal = lastPt.cdiValue * factor;
    const finalIpcaVal = lastPt.ipcaValue * factor;

    // IPCA End Dot
    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(lastX, getY(finalIpcaVal), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(lastX, getY(finalIpcaVal), 2, 0, Math.PI * 2);
    ctx.fill();

    // CDI End Dot
    ctx.fillStyle = "#d97706";
    ctx.beginPath();
    ctx.arc(lastX, getY(finalCdiVal), 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(lastX, getY(finalCdiVal), 2, 0, Math.PI * 2);
    ctx.fill();

    // ARV End Dot (Larger)
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(lastX, getY(finalImovelVal), 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(lastX, getY(finalImovelVal), 3, 0, Math.PI * 2);
    ctx.fill();

    // X Axis Labels (Every ~6 months or key points)
    ctx.fillStyle = "#64748b";
    ctx.font = "normal 8.5px Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";

    const stepMonths = evolution.length > 24 ? 6 : evolution.length > 12 ? 3 : 2;
    evolution.forEach((pt, idx) => {
      if (idx === 0 || (idx + 1) % stepMonths === 0 || idx === lastIdx) {
        const x = getX(idx);
        ctx.fillText(pt.monthLabel, x, padTop + chartH + 16);
      }
    });

    // Callout badge with final numbers on the bottom right
    const badgeW = 200;
    const badgeH = 22;
    const badgeX = width - badgeW - 16;
    const badgeY = height - badgeH - 8;

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

    ctx.textAlign = "left";
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
    ctx.fillText("Vantagem ARV vs CDI:", badgeX + 8, badgeY + 14);

    const spreadVal = finalImovelVal - finalCdiVal;
    ctx.fillStyle = spreadVal >= 0 ? "#16a34a" : "#dc2626";
    ctx.font = "bold 9px Helvetica, Arial, sans-serif";
    ctx.fillText(
      `${spreadVal >= 0 ? "+" : ""}${formatCurrency(spreadVal)} (${formatPercent(comparison.realEstateVsCdiPercentagePoints, true)} p.p.)`,
      badgeX + 102,
      badgeY + 14
    );

    return canvas.toDataURL("image/png");
  },

  /**
   * Generates a comparison bar chart (Accumulated Returns & Net Profit)
   */
  renderReturnComparisonBarChart(
    comparison: BenchmarkComparisonResult,
    simulation: ProfitabilitySimulation,
    width = 330,
    height = 200
  ): string {
    const { canvas, ctx } = createHiDpiCanvas(width, height, 3);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    // Title
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 10px Helvetica, Arial, sans-serif";
    ctx.fillText("RETORNO COMPARATIVO ACUMULADO (%)", 12, 18);

    const bars = [
      {
        label: "Imóvel ARV (Líq.)",
        percent: comparison.realEstateReturnPercentage,
        color: "#2563eb",
        bgColor: "#dbeafe",
      },
      {
        label: "CDI Acumulado",
        percent: comparison.cdiReturnPercentageSamePeriod,
        color: "#d97706",
        bgColor: "#fef3c7",
      },
      {
        label: "IPCA Inflação",
        percent: comparison.ipcaReturnPercentageSamePeriod,
        color: "#e11d48",
        bgColor: "#ffe4e6",
      },
      {
        label: "Ganho Real Acima IPCA",
        percent: comparison.realGainAboveInflationPercentage,
        color: "#10b981",
        bgColor: "#d1fae5",
      },
    ];

    const maxPercent = Math.max(...bars.map((b) => b.percent), 20) * 1.15;
    const startY = 32;
    const barHeight = 22;
    const barSpacing = 13;
    const maxBarWidth = width - 145;

    bars.forEach((bar, idx) => {
      const y = startY + idx * (barHeight + barSpacing);

      // Label
      ctx.fillStyle = "#334155";
      ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
      ctx.fillText(bar.label, 12, y + 14);

      // Background Bar Track
      const trackX = 118;
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(trackX, y, maxBarWidth, barHeight);

      // Active Colored Bar
      const fillW = Math.max(4, (bar.percent / maxPercent) * maxBarWidth);
      ctx.fillStyle = bar.color;
      ctx.fillRect(trackX, y, fillW, barHeight);

      // Value Text
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
      ctx.fillText(formatPercent(bar.percent, true), trackX + fillW + 6, y + 14);
    });

    return canvas.toDataURL("image/png");
  },

  /**
   * Generates a Cost & Profit Waterfall/Decomposition Chart
   */
  renderCostBreakdownChart(
    simulation: ProfitabilitySimulation,
    width = 330,
    height = 200
  ): string {
    const { canvas, ctx } = createHiDpiCanvas(width, height, 3);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 10px Helvetica, Arial, sans-serif";
    ctx.fillText("DECOMPOSIÇÃO DE VALORES & RESULTADO", 12, 18);

    const corretagemVal = (simulation.costsConsidered.corretagemPercentage / 100) * simulation.projectedSalePrice;
    const itbiVal = (simulation.costsConsidered.itbiPercentage / 100) * simulation.purchasePrice;
    const cartorioVal = simulation.costsConsidered.registroAmount;
    const irVal = Math.max(
      0,
      simulation.projectedSalePrice - simulation.purchasePrice - simulation.netProfitAmount - (corretagemVal + itbiVal + cartorioVal)
    );
    const totalCosts = corretagemVal + itbiVal + cartorioVal + irVal;

    const items = [
      { label: "Aporte Inicial", val: simulation.purchasePrice, color: "#64748b" },
      { label: "Valorização Bruta", val: simulation.projectedSalePrice - simulation.purchasePrice, color: "#3b82f6" },
      { label: "Custos & Tributos", val: -totalCosts, color: "#f43f5e" },
      { label: "Lucro Líquido Real", val: simulation.netProfitAmount, color: "#10b981" },
    ];

    const maxVal = Math.max(simulation.projectedSalePrice, simulation.purchasePrice * 1.5);
    const startY = 32;
    const barHeight = 22;
    const barSpacing = 13;
    const maxBarW = width - 150;

    items.forEach((item, idx) => {
      const y = startY + idx * (barHeight + barSpacing);

      ctx.fillStyle = "#334155";
      ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
      ctx.fillText(item.label, 12, y + 14);

      const trackX = 118;
      ctx.fillStyle = "#f1f5f9";
      ctx.fillRect(trackX, y, maxBarW, barHeight);

      const barW = Math.max(4, (Math.abs(item.val) / maxVal) * maxBarW);
      ctx.fillStyle = item.color;
      ctx.fillRect(trackX, y, barW, barHeight);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 8px Helvetica, Arial, sans-serif";
      ctx.fillText(formatCurrency(item.val), trackX + barW + 5, y + 14);
    });

    return canvas.toDataURL("image/png");
  },

  /**
   * Generates a Portfolio SPE ROI Comparison Chart
   */
  renderSpeRoiChart(spes: SPE[], width = 680, height = 180): string {
    const { canvas, ctx } = createHiDpiCanvas(width, height, 3);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px Helvetica, Arial, sans-serif";
    ctx.fillText("COMPARATIVO DE RENTABILIDADE ANUALIZADA POR SPE vs BENCHMARKS", 16, 20);

    const speData = [
      { name: "ARV GRID (Trindade)", roi: 19.2, color: "#2563eb" },
      { name: "SPE 13 - T58 SPOT", roi: 18.5, color: "#3b82f6" },
      { name: "SPE ARV MERIDIEM", roi: 17.8, color: "#60a5fa" },
      { name: "SPE 01 - HORIZON", roi: 16.5, color: "#93c5fd" },
      { name: "CDI Ref. Mercado", roi: 11.5, color: "#d97706" },
      { name: "IPCA Inflação Ref.", roi: 4.3, color: "#e11d48" },
    ];

    const chartW = width - 40;
    const startX = 20;
    const barW = (chartW - (speData.length - 1) * 16) / speData.length;
    const chartH = 95;
    const baseY = 145;
    const maxRoi = 24;

    // Reference dashed line for CDI
    const cdiY = baseY - (11.5 / maxRoi) * chartH;
    ctx.strokeStyle = "#cbd5e1";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(startX, cdiY);
    ctx.lineTo(startX + chartW, cdiY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "normal 8px Helvetica, Arial, sans-serif";
    ctx.fillText("Linha CDI: 11,5% a.a.", startX + 4, cdiY - 3);

    speData.forEach((item, idx) => {
      const x = startX + idx * (barW + 16);
      const h = (item.roi / maxRoi) * chartH;
      const y = baseY - h;

      // Bar
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barW, h);

      // Value label on top
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 9px Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${item.roi.toFixed(1)}%`, x + barW / 2, y - 4);

      // Category Name below
      ctx.fillStyle = "#475569";
      ctx.font = "bold 8px Helvetica, Arial, sans-serif";
      ctx.fillText(item.name.substring(0, 14), x + barW / 2, baseY + 14);
    });
    ctx.textAlign = "left";

    return canvas.toDataURL("image/png");
  },

  /**
   * Generates a Regional Price per m² Benchmark Chart
   */
  renderPricePerM2Chart(
    comparisons: UnitPriceComparison[],
    width = 720,
    height = 200
  ): string {
    const { canvas, ctx } = createHiDpiCanvas(width, height, 3);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px Helvetica, Arial, sans-serif";
    ctx.fillText("PREÇO MÉDIO POR M² PRIVATIVO: ATIVOS ARV vs BENCHMARK DO BAIRRO", 16, 20);

    const regions = [
      { name: "Trindade (GRID)", arvM2: 15480, benchmarkM2: 13800 },
      { name: "Agronômica (T58)", arvM2: 13850, benchmarkM2: 12500 },
      { name: "Campeche (Meridiem)", arvM2: 14200, benchmarkM2: 12800 },
      { name: "Centro (Horizon)", arvM2: 16500, benchmarkM2: 14800 },
    ];

    const chartW = width - 40;
    const startX = 20;
    const groupW = (chartW - (regions.length - 1) * 20) / regions.length;
    const barW = (groupW - 8) / 2;
    const chartH = 110;
    const baseY = 160;
    const maxPrice = 19000;

    regions.forEach((reg, idx) => {
      const gX = startX + idx * (groupW + 20);

      // ARV Bar
      const arvH = (reg.arvM2 / maxPrice) * chartH;
      const arvY = baseY - arvH;
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(gX, arvY, barW, arvH);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 8px Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(formatCurrencyShort(reg.arvM2), gX + barW / 2, arvY - 4);

      // Benchmark Bar
      const benchH = (reg.benchmarkM2 / maxPrice) * chartH;
      const benchY = baseY - benchH;
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(gX + barW + 8, benchY, barW, benchH);

      ctx.fillStyle = "#64748b";
      ctx.fillText(formatCurrencyShort(reg.benchmarkM2), gX + barW + 8 + barW / 2, benchY - 4);

      // Region Label
      ctx.fillStyle = "#334155";
      ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
      ctx.fillText(reg.name, gX + groupW / 2, baseY + 14);

      // Spread badge
      const spread = ((reg.arvM2 - reg.benchmarkM2) / reg.benchmarkM2) * 100;
      ctx.fillStyle = "#16a34a";
      ctx.font = "bold 7.5px Helvetica, Arial, sans-serif";
      ctx.fillText(`+${spread.toFixed(1)}% spread`, gX + groupW / 2, baseY + 24);
    });
    ctx.textAlign = "left";

    // Legend on top-right
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(width - 220, 12, 10, 10);
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 8.5px Helvetica, Arial, sans-serif";
    ctx.fillText("Preço m² ARV", width - 205, 20);

    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(width - 125, 12, 10, 10);
    ctx.fillStyle = "#1e293b";
    ctx.fillText("Benchmark Região", width - 110, 20);

    return canvas.toDataURL("image/png");
  },
};
