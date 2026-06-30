import type { TeamMember } from '../types/team';

export const teamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Alex Rivera', role: 'Product Manager', avatarUrl: '/images/avatar1.png' },
  { id: 'tm-2', name: 'Jordan Lee', role: 'Engineering Lead', avatarUrl: '/images/avatar2.png' },
  { id: 'tm-3', name: 'Sam Chen', role: 'UX Designer', avatarUrl: '/images/avatar3.png' },
  { id: 'tm-4', name: 'Taylor Brooks', role: 'Data Analyst', avatarUrl: '/images/avatar4.png' },
  { id: 'tm-5', name: 'Morgan Patel', role: 'HR Partner', avatarUrl: '/images/avatar5.png' },
  { id: 'tm-6', name: 'Casey Nguyen', role: 'Software Engineer', avatarUrl: '/images/avatar6.png' },
];

export function getTeamMember(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id);
}

export function getTeamMembersByIds(ids: string[]): TeamMember[] {
  const set = new Set(ids);
  return teamMembers.filter((m) => set.has(m.id));
}
