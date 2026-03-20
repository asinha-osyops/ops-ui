interface LogoExpandedProps {
  className?: string
}

export function LogoExpanded({ className }: LogoExpandedProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1350 400"
      fill="none"
    >
      {/* Curved lines */}

      {/* Top rect (right midpoint 248,100) to right circle (top 310,158) */}
      <path
        d="M 248 100 Q 350 60 310 158"
        stroke="currentColor"
        strokeWidth="10"
      />

      {/* Right circle (bottom 310,242) to bottom pentagon */}
      <path
        d="M 310 242 Q 350 340 248 300"
        stroke="currentColor"
        strokeWidth="10"
      />

      {/* Bottom pentagon to left diamond (bottom corner 90,246) */}
      <path
        d="M 152 300 Q 50 340 90 246"
        stroke="currentColor"
        strokeWidth="10"
      />

      {/* Left diamond (top corner 90,154) to top rect (left midpoint 152,100) */}
      <path
        d="M 90 154 Q 50 60 152 100"
        stroke="currentColor"
        strokeWidth="10"
      />

      {/* Rectangle (top) */}
      <rect
        x="152"
        y="65"
        width="96"
        height="70"
        rx="6"
        stroke="currentColor"
        strokeWidth="12"
      />

      {/* Circle (right) - filled orange */}
      <circle
        cx="310"
        cy="200"
        r="42"
        fill="#E96443"
        stroke="currentColor"
        strokeWidth="12"
      />

      {/* Pentagon (bottom) */}
      <polygon
        points="200,245 254,284 233,348 167,348 146,284"
        stroke="currentColor"
        strokeWidth="12"
      />

      {/* Diamond (left) */}
      <polygon
        points="90,154 136,200 90,246 44,200"
        stroke="currentColor"
        strokeWidth="12"
      />

      {/* Text */}
      <text
        x="386"
        y="185"
        fill="currentColor"
        fontFamily="var(--font-saira), Saira, sans-serif"
        fontWeight="700"
        fontSize="112"
        textLength="925"
        lengthAdjust="spacing"
      >
        OSY OPERATIONS
      </text>
      <text
        x="386"
        y="270"
        fill="currentColor"
        fontFamily="var(--font-saira), Saira, sans-serif"
        fontWeight="400"
        fontSize="75"
        textLength="925"
        lengthAdjust="spacing"
      >
        KNOW YOUR WORK
      </text>
    </svg>
  )
}
