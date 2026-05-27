interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number; // 0-1
  label: string;
  sublabel?: string;
}

export default function ProgressRing({
  radius,
  stroke,
  progress,
  label,
  sublabel,
}: ProgressRingProps) {
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const clamped = Math.min(1, Math.max(0, progress));
  const offset = circumference - clamped * circumference;

  const color =
    clamped >= 1
      ? "var(--success)"
      : clamped >= 0.8
        ? "var(--warning)"
        : "var(--error)";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={radius * 2} height={radius * 2}>
        <circle
          stroke="var(--line)"
          fill="none"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="progress-ring-circle"
          stroke={color}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
        <text
          x={radius}
          y={radius - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--ink)"
          fontSize="20"
          fontWeight="700"
          fontFamily="Manrope, system-ui, sans-serif"
        >
          {label}
        </text>
        {sublabel && (
          <text
            x={radius}
            y={radius + 16}
            textAnchor="middle"
            dominantBaseline="central"
            fill="var(--muted)"
            fontSize="11"
            fontFamily="Manrope, system-ui, sans-serif"
          >
            {sublabel}
          </text>
        )}
      </svg>
    </div>
  );
}
