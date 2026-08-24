import React from "react";
import { InvestorTier, ScoreBreakdown } from "../../types";

interface ScoreGaugeProps {
  score: number; // 0-100
  tier: InvestorTier;
  breakdown?: ScoreBreakdown;
  size?: "sm" | "md" | "lg";
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  tier,
  breakdown,
  size = "md",
}) => {
  // Arc angle calculation (180 degrees total)
  const clampedScore = Math.max(0, Math.min(100, score));
  const angle = (clampedScore / 100) * 180 - 90; // -90 to +90 deg

  const tierColors: Record<InvestorTier, { stroke: string; bg: string; text: string; label: string }> = {
    Private: { stroke: "#8B5CF6", bg: "bg-purple-100 dark:bg-purple-950/60", text: "text-purple-700 dark:text-purple-300", label: "Private (> R$ 2M)" },
    Prime: { stroke: "#10B981", bg: "bg-emerald-100 dark:bg-emerald-950/60", text: "text-emerald-700 dark:text-emerald-300", label: "Prime (R$ 800k - 2M)" },
    Select: { stroke: "#EAB308", bg: "bg-amber-100 dark:bg-amber-950/60", text: "text-amber-700 dark:text-amber-300", label: "Select (R$ 300k - 800k)" },
    Essencial: { stroke: "#3B82F6", bg: "bg-blue-100 dark:bg-blue-950/60", text: "text-blue-700 dark:text-blue-300", label: "Essencial (Até R$ 300k)" },
    Institucional: { stroke: "#6366F1", bg: "bg-indigo-100 dark:bg-indigo-950/60", text: "text-indigo-700 dark:text-indigo-300", label: "Institucional (Empresas/Fundos)" },
  };

  const currentConfig = tierColors[tier] || tierColors.Essencial;

  const dimensions = {
    sm: { width: 120, height: 75, r: 42, sw: 10, fontSize: "text-xl" },
    md: { width: 180, height: 110, r: 65, sw: 14, fontSize: "text-3xl" },
    lg: { width: 240, height: 140, r: 88, sw: 18, fontSize: "text-4xl" },
  }[size];

  return {
    id: "score-gauge-wrapper",
    component: (
      <div className="flex flex-col items-center justify-center p-2">
        <div className="relative flex flex-col items-center">
          <svg
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height + 10}`}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="25%" stopColor="#D97706" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="75%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>

            {/* Background Track Arc */}
            <path
              d={`M ${dimensions.width / 2 - dimensions.r} ${dimensions.height} A ${dimensions.r} ${dimensions.r} 0 0 1 ${dimensions.width / 2 + dimensions.r} ${dimensions.height}`}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth={dimensions.sw}
              strokeLinecap="round"
              className="dark:stroke-slate-800"
            />

            {/* Colored Score Arc */}
            <path
              d={`M ${dimensions.width / 2 - dimensions.r} ${dimensions.height} A ${dimensions.r} ${dimensions.r} 0 0 1 ${dimensions.width / 2 + dimensions.r} ${dimensions.height}`}
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth={dimensions.sw}
              strokeLinecap="round"
              strokeDasharray={`${(clampedScore / 100) * Math.PI * dimensions.r} ${Math.PI * dimensions.r}`}
            />

            {/* Needle indicator */}
            <g transform={`translate(${dimensions.width / 2}, ${dimensions.height}) rotate(${angle})`}>
              <line
                x1="0"
                y1="0"
                x2="0"
                y2={-dimensions.r + 6}
                stroke="#1E293B"
                strokeWidth="3"
                strokeLinecap="round"
                className="dark:stroke-slate-100"
              />
              <circle r="6" fill="#1E293B" className="dark:fill-slate-100" />
            </g>
          </svg>

          {/* Central Score Text */}
          <div className="mt-[-18px] text-center">
            <span className={`font-bold ${dimensions.fontSize} tracking-tight text-slate-900 dark:text-slate-100`}>
              {clampedScore}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">/ 100</span>
          </div>
        </div>

        {/* Tier Badge */}
        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${currentConfig.bg} ${currentConfig.text} border border-current/20 flex items-center gap-1.5`}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentConfig.stroke }} />
          {currentConfig.label}
        </div>

        {/* Optional Component Breakdown Breakdown list */}
        {breakdown && size !== "sm" && (
          <div className="w-full mt-4 text-xs space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Volume Investido:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.volume}/20 pts</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span># Investimentos / Reinvestimento:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.numInvestments + breakdown.reinvestments}/25 pts</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Presença em Assembleias:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.assemblyAttendance}/15 pts</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Acesso ao Portal & Engajamento:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.portalAccess}/10 pts</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>NPS & Satisfação:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">{breakdown.satisfaction}/10 pts</span>
            </div>
          </div>
        )}
      </div>
    ),
  }.component;
};
