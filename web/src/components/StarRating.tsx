interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({
  value,
  onChange,
  size = 28,
  readonly = false,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="star-btn"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          style={{
            fontSize: size,
            color: star <= value ? "#fbbf24" : "var(--line-strong)",
            background: "none",
            border: "none",
            padding: 0,
            cursor: readonly ? "default" : "pointer",
          }}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
