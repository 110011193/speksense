type Props = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="flow-progress" aria-label={`Question ${current} of ${total}`}>
      <span className="flow-progress-label">
        Question {current} of {total}
      </span>
      <div className="flow-progress-track">
        <div className="flow-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
