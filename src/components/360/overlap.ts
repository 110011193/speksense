const CHIP_DIAMETER_PX = 44;

function circleIntersectionArea(r: number, distance: number): number {
  if (distance >= 2 * r) return 0;
  if (distance <= 0) return Math.PI * r * r;
  const part = 2 * r * r * Math.acos(distance / (2 * r)) - (distance / 2) * Math.sqrt(4 * r * r - distance * distance);
  return part;
}

export function overlapRatioSameRadius(r: number, distance: number): number {
  const area = Math.PI * r * r;
  if (area <= 0) return 0;
  return circleIntersectionArea(r, distance) / area;
}

export function chipRadiusPx(): number {
  return CHIP_DIAMETER_PX / 2;
}

export type ChipPosition = {
  peerId: string;
  centerX: number;
};

export function getOverlapGroups(positions: ChipPosition[], threshold = 0.5): string[][] {
  const r = chipRadiusPx();
  const n = positions.length;
  const parent = positions.map((_, i) => i);

  function find(i: number): number {
    if (parent[i] !== i) parent[i] = find(parent[i]);
    return parent[i];
  }

  function union(a: number, b: number) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = Math.abs(positions[i].centerX - positions[j].centerX);
      if (overlapRatioSameRadius(r, d) > threshold) {
        union(i, j);
      }
    }
  }

  const map = new Map<number, string[]>();
  for (let i = 0; i < n; i++) {
    const root = find(i);
    const list = map.get(root) ?? [];
    list.push(positions[i].peerId);
    map.set(root, list);
  }

  return [...map.values()];
}

export function groupForPeer(groups: string[][], peerId: string): string[] {
  const g = groups.find((grp) => grp.includes(peerId));
  return g ?? [peerId];
}

export function positionsFromRatings(
  peerIds: string[],
  ratings: Record<string, number>,
  trackRect: DOMRect,
  max = 5,
): ChipPosition[] {
  return peerIds.map((peerId) => {
    const value = ratings[peerId] ?? 0;
    const centerX = trackRect.left + (value / max) * trackRect.width;
    return { peerId, centerX };
  });
}
