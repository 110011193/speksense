export type SummaryKpi = {
  id: string;
  label: string;
  value: string;
  subtext: string;
  subtextVariant?: 'up' | 'warn' | 'neutral';
};

export type ActiveAssessmentStatus = 'due' | 'in_progress' | 'completed';

export type ActiveAssessment = {
  id: string;
  title: string;
  assignedBy: string;
  status: ActiveAssessmentStatus;
  statusLabel: string;
};

export type ParticipationRow = {
  id: string;
  title: string;
  percent: number;
};

export type ActivityItem = {
  id: string;
  label: string;
  timeLabel: string;
};

export type DeadlineItem = {
  id: string;
  dateShort: string;
  title: string;
  meta: string;
};

export type QuickAction = {
  id: string;
  label: string;
};

export type HrAdminDashboard = {
  summaryKpis: SummaryKpi[];
  activeAssessments: ActiveAssessment[];
  participation: ParticipationRow[];
  orgWideAvg: string;
  recentActivity: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
  quickActions: QuickAction[];
};

const hrAdminDashboard: HrAdminDashboard = {
  summaryKpis: [
    {
      id: 'participants',
      label: 'Total participants',
      value: '142',
      subtext: '↑ 12 this month',
      subtextVariant: 'up',
    },
    {
      id: 'completion',
      label: 'Completion rate',
      value: '68%',
      subtext: '↑ 4% vs last cycle',
      subtextVariant: 'up',
    },
    {
      id: 'active',
      label: 'Active assessments',
      value: '5',
      subtext: '2 closing this week',
      subtextVariant: 'neutral',
    },
    {
      id: 'pending',
      label: 'Pending responses',
      value: '18',
      subtext: 'Reminder due',
      subtextVariant: 'warn',
    },
  ],
  activeAssessments: [
    {
      id: 'cbp',
      title: 'Cognitive Behavioural Profile',
      assignedBy: 'Nexus Corp',
      status: 'due',
      statusLabel: 'Due in 2d',
    },
    {
      id: 'td360',
      title: 'Team Dynamics 360',
      assignedBy: 'Nexus Corp',
      status: 'in_progress',
      statusLabel: 'In progress',
    },
    {
      id: 'lri',
      title: 'Leadership Readiness Index',
      assignedBy: 'Orion Ltd',
      status: 'completed',
      statusLabel: 'Completed',
    },
  ],
  participation: [
    { id: 'cbp', title: 'Cognitive Behavioural Profile', percent: 74 },
    { id: 'td360', title: 'Team Dynamics 360', percent: 51 },
    { id: 'lri', title: 'Leadership Readiness Index', percent: 91 },
  ],
  orgWideAvg: '68.7%',
  recentActivity: [
    {
      id: 'a1',
      label: 'Sara Malik completed Cognitive Behavioural Profile',
      timeLabel: 'Today at 9:14 am',
    },
    {
      id: 'a2',
      label: 'New assessment Leadership Readiness Index assigned to 34 participants',
      timeLabel: 'Yesterday at 3:40 pm',
    },
    {
      id: 'a3',
      label: 'Report generated for Team Dynamics 360 – Q2',
      timeLabel: '2 Jun at 11:00 am',
    },
    {
      id: 'a4',
      label: 'Reminder sent to 18 pending participants',
      timeLabel: '2 Jun at 9:00 am',
    },
  ],
  upcomingDeadlines: [
    {
      id: 'd1',
      dateShort: '05 JUN',
      title: 'Cognitive Profile closes',
      meta: 'Nexus Corp · 38 pending',
    },
    {
      id: 'd2',
      dateShort: '12 JUN',
      title: 'Team Dynamics 360 closes',
      meta: 'Nexus Corp · 20 pending',
    },
    {
      id: 'd3',
      dateShort: '20 JUN',
      title: 'Q2 Report deadline',
      meta: 'All orgs · Final PDF export',
    },
  ],
  quickActions: [
    { id: 'reminder', label: 'Send reminder' },
    { id: 'export', label: 'Export report' },
    { id: 'new', label: 'New assessment' },
    { id: 'participant', label: 'Add participant' },
  ],
};

export function getHrAdminDashboard(): HrAdminDashboard {
  return hrAdminDashboard;
}

export function getHrGreetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getHrHeaderDateLine(): string {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
  return `${formatted} · HR Admin View`;
}
