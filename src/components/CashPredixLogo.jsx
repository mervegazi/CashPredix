export default function CashPredixLogo({ className = 'w-6 h-6', glow = false }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none transition-transform shrink-0 ${glow ? 'drop-shadow-[0_0_12px_rgba(168,85,247,0.55)]' : ''}`}
      aria-label="CashPredix Logo"
      role="img"
    >
      <defs>
        {/* Futuristic Cyber Violet & Magenta Gradient */}
        <linearGradient id="cp-grad-violet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="35%" stopColor="#818CF8" />
          <stop offset="75%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>

        {/* Electric Liquidity Flow Gradient (Cyan to Indigo) */}
        <linearGradient id="cp-grad-cyan" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="55%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        {/* Predictive Horizon Gold Accent */}
        <linearGradient id="cp-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Dynamic drop shadow */}
        <filter id="cp-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="#7C3AED" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#cp-glow-filter)">
        {/* Base Cashflow Wave Arc ('C' shape for Cash Flow) */}
        <path
          d="M16 13 C9.5 17 7.5 25 9.5 32 C11.5 39 18.5 42 25 41 C30.5 40 34.5 36.5 36.5 32.5"
          stroke="url(#cp-grad-cyan)"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Upward AI Predictive Spine & 'P' Loop (for Prediction) */}
        <path
          d="M19.5 37.5 V14 C19.5 14 25 9 31.5 13 C36.5 16.5 35 24 28 25.5 H19.5"
          stroke="url(#cp-grad-violet)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Predictive Growth Vector Arrow */}
        <path
          d="M33 9.5 L40.5 8 L38.5 15.5"
          stroke="url(#cp-grad-violet)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Predictive AI Horizon Golden Star */}
        <path
          d="M38.5 18 L39.6 21 L42.5 22 L39.6 23 L38.5 26 L37.4 23 L34.5 22 L37.4 21 Z"
          fill="url(#cp-grad-gold)"
        />
      </g>
    </svg>
  );
}
