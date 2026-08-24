import React, { useId } from "react";

interface ARVLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  lightMode?: boolean;
}

export const ARVLogo: React.FC<ARVLogoProps> = ({
  className = "",
  size = "md",
  showTagline = false,
  lightMode = false,
}) => {
  const uniqueId = useId().replace(/:/g, "");
  const maskId = `arv-v-mask-${uniqueId}`;

  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-14",
  };

  const primaryColor = lightMode ? "#FFFFFF" : "#3182CE";
  const taglineColor = lightMode ? "#94A3B8" : "#64748B";

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${sizeClasses[size]} ${className}`}>
      {/* Official ARV Vector Logo */}
      <svg
        viewBox="0 0 380 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto block shrink-0 drop-shadow-2xs"
        preserveAspectRatio="xMinYMid meet"
      >
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="380" height="120" fill="white" />
            {/* Signature white crescent arc gap separating R loop from V left arm */}
            <path
              d="M 224 -8 C 268 14 268 58 224 78"
              stroke="black"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          </mask>
        </defs>

        <g fill={primaryColor}>
          {/* A */}
          <path d="M 0 120 L 39 120 L 53 78 L 88 78 L 102 120 L 140 120 L 89 0 L 51 0 Z M 70 24 L 81 58 L 60 58 Z" />

          {/* R */}
          <path d="M 132 0 H 202 C 238 0 258 14 258 35 C 258 54 240 64 212 66 L 250 120 H 208 L 175 66 H 164 V 120 H 132 V 0 Z M 164 20 V 46 H 198 C 210 46 222 41 222 33 C 222 25 210 20 198 20 H 164 Z" />

          {/* V with signature crescent cut */}
          <path
            mask={`url(#${maskId})`}
            d="M 228 0 L 266 0 L 302 88 L 338 0 L 378 0 L 322 120 L 282 120 Z"
          />
        </g>
      </svg>

      {showTagline && (
        <div className="flex flex-col justify-center border-l border-slate-200 dark:border-slate-800 pl-2.5 py-0.5 leading-none">
          <span className="font-extrabold text-xs tracking-tight uppercase" style={{ color: primaryColor }}>
            HUB
          </span>
          <span className="text-[9px] font-bold tracking-wider uppercase mt-0.5" style={{ color: taglineColor }}>
            CONSTRUTORA
          </span>
        </div>
      )}
    </div>
  );
};

