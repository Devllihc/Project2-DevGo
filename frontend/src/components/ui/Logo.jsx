import React from "react";

// Inline SVG (not <img>) so Tailwind's class-based `dark:` mode can recolor it.
// Colors match src/assets/devgo-logo.svg: ring #0B1B2B / #F4F6F8, plane #F97316 / #FB923C.
const Logo = ({ iconClassName = "w-9 h-9", textClassName = "text-xl", className = "" }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <svg
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="DevGo"
      className={`shrink-0 ${iconClassName}`}
    >
      <path
        d="M52.55 25.79 A24 24 0 1 1 38.21 11.45"
        strokeWidth="4.5"
        strokeLinecap="round"
        className="stroke-[#0B1B2B] dark:stroke-[#F4F6F8]"
      />
      <path d="M56 8 L30 22 L41 27 Z" className="fill-[#F97316] dark:fill-[#FB923C]" />
      <path d="M56 8 L41 27 L45 40 Z" fillOpacity="0.55" className="fill-[#F97316] dark:fill-[#FB923C]" />
    </svg>
    <span className={`font-bold tracking-tight text-stone-900 dark:text-white ${textClassName}`}>
      DevGo
    </span>
  </span>
);

export default Logo;
