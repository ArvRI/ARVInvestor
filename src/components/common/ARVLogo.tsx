import React from "react";

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
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-14",
  };

  const primaryColor = lightMode ? "#FFFFFF" : "#2B88C4";
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
        <g fill={primaryColor}>
          {/* A */}
          <path d="M 118 120 L 78 120 L 61 74 L 23 74 L 10 120 L 0 120 L 44 0 L 75 0 Z M 56 61 L 42 19 L 27 61 Z" />
          {/* R */}
          <path d="M 126 0 L 182 0 C 208 0 224 13 224 33 C 224 50 211 60 193 64 L 230 120 L 195 120 L 162 68 L 151 68 L 151 120 L 126 120 Z M 151 21 L 151 48 L 178 48 C 191 48 198 42 198 34 C 198 25 190 21 177 21 Z" />
          {/* V */}
          <path d="M 232 0 L 263 0 L 299 87 L 334 0 L 366 0 L 314 120 L 282 120 Z" />
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
