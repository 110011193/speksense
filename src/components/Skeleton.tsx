/** Loading placeholder using the .sk-shimmer utility (defined in polish.css). */
export function Skeleton({
  width = '100%',
  height = 14,
  radius,
  className = '',
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`sk-shimmer ${className}`}
      aria-hidden="true"
      style={{ display: 'block', width, height, borderRadius: radius, ...style }}
    />
  );
}

/** A card-shaped skeleton block, optionally repeated, for list/grid loading states. */
export function SkeletonCard({ lines = 3, count = 1 }: { lines?: number; count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="sk-card" aria-hidden="true">
          <Skeleton width="40%" height={16} />
          {Array.from({ length: lines }).map((_, j) => (
            <Skeleton key={j} width={j === lines - 1 ? '60%' : '100%'} height={12} />
          ))}
        </div>
      ))}
    </>
  );
}
