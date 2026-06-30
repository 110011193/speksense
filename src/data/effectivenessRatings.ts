export type EffectivenessBand = {
  min: number;
  max: number;
  rangeLabel: string;
  meaning: string;
};

export const EFFECTIVENESS_BANDS: EffectivenessBand[] = [
  {
    min: 0,
    max: 0.9,
    rangeLabel: '0.0 – 0.9',
    meaning: 'Rarely demonstrates this behavior; significant opportunity to improve.',
  },
  {
    min: 1,
    max: 1.9,
    rangeLabel: '1.0 – 1.9',
    meaning: 'Shows this behavior inconsistently; below expectations for the role.',
  },
  {
    min: 2,
    max: 2.9,
    rangeLabel: '2.0 – 2.9',
    meaning: 'Sometimes demonstrates this behavior; meets minimum expectations.',
  },
  {
    min: 3,
    max: 3.9,
    rangeLabel: '3.0 – 3.9',
    meaning: 'Regularly demonstrates this behavior; solid and reliable performance.',
  },
  {
    min: 4,
    max: 4.9,
    rangeLabel: '4.0 – 4.9',
    meaning: 'Consistently strong; frequently exceeds expectations on this behavior.',
  },
  {
    min: 5,
    max: 5,
    rangeLabel: '5.0',
    meaning: 'Exceptional role model; among the best examples of this behavior.',
  },
];

export function getEffectivenessBand(value: number): EffectivenessBand {
  const v = Math.min(5, Math.max(0, value));
  if (v >= 5) return EFFECTIVENESS_BANDS[EFFECTIVENESS_BANDS.length - 1]!;
  const band = EFFECTIVENESS_BANDS.find((b) => v >= b.min && v <= b.max);
  return band ?? EFFECTIVENESS_BANDS[0]!;
}
