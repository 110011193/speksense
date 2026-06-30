export type ProgramCompletion = {
  id: string;
  title: string;
  completionPercent: number;
};

export type ProgramStatusSegment = {
  label: string;
  percent: number;
  variant: 'yellow' | 'dark' | 'light';
};

export type CulturePulse = {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  trendLabel: string;
};

export type ActiveSurveyProgram = {
  id: string;
  title: string;
  audience: string;
  dueLabel: string;
  invited: number;
  completed: number;
  inProgress: number;
  status: 'on_track' | 'needs_attention' | 'closed';
};

export type SurveyActivityItem = {
  id: string;
  label: string;
  detail: string;
  timeLabel: string;
};

export type DepartmentParticipation = {
  id: string;
  name: string;
  invited: number;
  completed: number;
  percent: number;
};

export type UpcomingDeadline = {
  id: string;
  programTitle: string;
  dueLabel: string;
  daysLeft: number;
  completionPercent: number;
};

export type ThemeInsight = {
  id: string;
  theme: string;
  score: number;
  direction: 'up' | 'down' | 'flat';
  changeLabel: string;
};

export type AtRiskSegment = {
  id: string;
  segment: string;
  program: string;
  pending: number;
  reason: string;
};

export type QuarterSnapshot = {
  label: string;
  completionPercent: number;
  responses: number;
};

export type QuarterlyCompletionBar = {
  id: string;
  label: string;
  completionPercent: number;
  highlight?: boolean;
};

export type ProgramHealthMetric = {
  id: string;
  label: string;
  value: string;
  tone: 'ok' | 'warn' | 'neutral';
};

export type MonthlyResponseBar = {
  id: string;
  label: string;
  responses: number;
};

export type SurveyMixSlice = {
  id: string;
  label: string;
  percent: number;
  variant: 'yellow' | 'dark' | 'light';
};

export type EnpsSegment = {
  id: string;
  label: string;
  percent: number;
  variant: 'promoter' | 'passive' | 'detractor';
};

export type WeekdayVolume = {
  label: string;
  heightPercent: number;
};

export type ResponseTimeBucket = {
  id: string;
  label: string;
  percent: number;
};

export type ParticipationFunnelStage = {
  id: string;
  label: string;
  count: number;
  percent: number;
};

export type DepartmentStacked = {
  id: string;
  name: string;
  completed: number;
  inProgress: number;
  notStarted: number;
};

export type OrgSurveyAnalytics = {
  statPills: { label: string; value: string; variant: 'dark' | 'yellow' | 'hatched' | 'outline' }[];
  metrics: { value: string; label: string }[];
  weeklyHighlights: { value: string; label: string; note?: string }[];
  completionByProgram: ProgramCompletion[];
  programStatus: ProgramStatusSegment[];
  culturePulses: CulturePulse[];
  responseTrend: { label: string; heightPercent: number; highlight?: boolean }[];
  activePrograms: ActiveSurveyProgram[];
  recentActivity: SurveyActivityItem[];
  departmentParticipation: DepartmentParticipation[];
  upcomingDeadlines: UpcomingDeadline[];
  themeInsights: ThemeInsight[];
  atRiskSegments: AtRiskSegment[];
  quarterComparison: { current: QuarterSnapshot; previous: QuarterSnapshot };
  quarterlyCompletionTrend: QuarterlyCompletionBar[];
  programHealth: ProgramHealthMetric[];
  monthlyResponses: MonthlyResponseBar[];
  surveyTypeMix: SurveyMixSlice[];
  enpsBreakdown: EnpsSegment[];
  weekdaySubmissionVolume: WeekdayVolume[];
  responseTimeDistribution: ResponseTimeBucket[];
  participationFunnel: ParticipationFunnelStage[];
  departmentStacked: DepartmentStacked[];
  completionSparkline: number[];
  hrFocusToday: { id: string; title: string; detail: string }[];
  recommendedActions: { id: string; title: string; detail: string; tag: string }[];
  reminderChannels: { id: string; channel: string; openRate: number; completionLift: number }[];
  locationParticipation: { id: string; label: string; percent: number }[];
  verbatimThemes: { id: string; theme: string; mentionCount: number; sample: string }[];
  benchmarks: { id: string; label: string; value: string; note: string }[];
  chartInsights: Record<string, string>;
};

export const orgSurveyAnalytics: OrgSurveyAnalytics = {
  statPills: [
    { label: 'Org completion', value: '72%', variant: 'dark' },
    { label: 'Live programs', value: '5', variant: 'yellow' },
    { label: 'Response rate', value: '68%', variant: 'hatched' },
    { label: 'Participation', value: '84%', variant: 'outline' },
  ],
  metrics: [
    { value: '5', label: 'Active surveys' },
    { value: '312', label: 'Responses this quarter' },
    { value: '78', label: 'People invited' },
    { value: '4.2d', label: 'Avg. time to complete' },
    { value: '26', label: 'Overdue invites' },
    { value: '+12', label: 'eNPS vs last pulse' },
  ],
  weeklyHighlights: [
    { value: '47', label: 'New responses', note: 'This week' },
    { value: '91%', label: 'Reminder open rate', note: 'Last nudge' },
    { value: '3', label: 'Programs closing soon', note: 'Next 14 days' },
    { value: '64%', label: 'Manager participation', note: '360 cohort' },
  ],
  completionByProgram: [
    { id: '360-feedback', title: '360 Feedback', completionPercent: 58 },
    { id: 'onboarding-experience', title: 'Onboarding Experience', completionPercent: 81 },
    { id: 'wellness-check', title: 'Wellness Check-in', completionPercent: 64 },
    { id: 'q4-culture', title: 'Q4 Culture Pulse', completionPercent: 49 },
    { id: 'security-awareness', title: 'Security Awareness', completionPercent: 94 },
  ],
  programStatus: [
    { label: 'Completed', percent: 42, variant: 'yellow' },
    { label: 'In progress', percent: 28, variant: 'dark' },
    { label: 'Not started', percent: 30, variant: 'light' },
  ],
  culturePulses: [
    { id: 'wellness', title: 'Wellness Check-in', score: 3.8, maxScore: 5, trendLabel: '+0.2 vs last pulse' },
    { id: 'culture', title: 'Q4 Culture Pulse', score: 4.1, maxScore: 5, trendLabel: 'Stable' },
    { id: '360', title: '360 Feedback', score: 3.6, maxScore: 5, trendLabel: 'Early responses' },
  ],
  responseTrend: [
    { label: 'W1', heightPercent: 35 },
    { label: 'W2', heightPercent: 48 },
    { label: 'W3', heightPercent: 55 },
    { label: 'W4', heightPercent: 62 },
    { label: 'W5', heightPercent: 70 },
    { label: 'W6', heightPercent: 85, highlight: true },
    { label: 'W7', heightPercent: 58 },
  ],
  activePrograms: [
    {
      id: '360-feedback',
      title: '360 Feedback',
      audience: 'All people managers',
      dueLabel: 'Due Dec 20',
      invited: 24,
      completed: 14,
      inProgress: 6,
      status: 'on_track',
    },
    {
      id: 'q4-culture',
      title: 'Q4 Culture Pulse',
      audience: 'Company-wide',
      dueLabel: 'Due Dec 20',
      invited: 78,
      completed: 38,
      inProgress: 19,
      status: 'needs_attention',
    },
    {
      id: 'wellness-check',
      title: 'Wellness Check-in',
      audience: 'Engineering',
      dueLabel: 'Due Dec 28',
      invited: 32,
      completed: 21,
      inProgress: 4,
      status: 'on_track',
    },
    {
      id: 'onboarding-experience',
      title: 'Onboarding Experience',
      audience: 'New hires (90 days)',
      dueLabel: 'Due Dec 15',
      invited: 12,
      completed: 10,
      inProgress: 1,
      status: 'on_track',
    },
    {
      id: 'security-awareness',
      title: 'Security Awareness',
      audience: 'Company-wide',
      dueLabel: 'Closed',
      invited: 78,
      completed: 73,
      inProgress: 0,
      status: 'closed',
    },
  ],
  recentActivity: [
    {
      id: 'a1',
      label: '12 new submissions',
      detail: 'Q4 Culture Pulse',
      timeLabel: 'Today',
    },
    {
      id: 'a2',
      label: '360 Feedback',
      detail: '6 managers completed peer selection',
      timeLabel: 'Yesterday',
    },
    {
      id: 'a3',
      label: 'Wellness Check-in',
      detail: 'Response rate crossed 60% for Engineering',
      timeLabel: 'Dec 10',
    },
    {
      id: 'a4',
      label: 'Reminder sent',
      detail: '38 people nudged on open Culture Pulse invites',
      timeLabel: 'Dec 9',
    },
    {
      id: 'a5',
      label: 'Export generated',
      detail: 'Q4 Culture Pulse — department breakdown CSV',
      timeLabel: 'Dec 8',
    },
  ],
  departmentParticipation: [
    { id: 'eng', name: 'Engineering', invited: 28, completed: 22, percent: 79 },
    { id: 'prod', name: 'Product', invited: 14, completed: 11, percent: 79 },
    { id: 'gtm', name: 'Sales & Marketing', invited: 18, completed: 10, percent: 56 },
    { id: 'ops', name: 'Operations', invited: 10, completed: 8, percent: 80 },
    { id: 'ga', name: 'People & Finance', invited: 8, completed: 7, percent: 88 },
  ],
  upcomingDeadlines: [
    {
      id: 'd1',
      programTitle: 'Onboarding Experience',
      dueLabel: 'Dec 15',
      daysLeft: 4,
      completionPercent: 83,
    },
    {
      id: 'd2',
      programTitle: '360 Feedback',
      dueLabel: 'Dec 20',
      daysLeft: 9,
      completionPercent: 58,
    },
    {
      id: 'd3',
      programTitle: 'Q4 Culture Pulse',
      dueLabel: 'Dec 20',
      daysLeft: 9,
      completionPercent: 49,
    },
    {
      id: 'd4',
      programTitle: 'Wellness Check-in',
      dueLabel: 'Dec 28',
      daysLeft: 17,
      completionPercent: 66,
    },
  ],
  themeInsights: [
    { id: 't1', theme: 'Manager support', score: 4.2, direction: 'up', changeLabel: '+0.3 vs Q3' },
    { id: 't2', theme: 'Workload & balance', score: 3.4, direction: 'down', changeLabel: '−0.2 vs Q3' },
    { id: 't3', theme: 'Team collaboration', score: 4.0, direction: 'flat', changeLabel: 'Unchanged' },
    { id: 't4', theme: 'Growth & learning', score: 3.9, direction: 'up', changeLabel: '+0.1 vs Q3' },
    { id: 't5', theme: 'Belonging & inclusion', score: 4.1, direction: 'up', changeLabel: '+0.4 vs Q3' },
  ],
  atRiskSegments: [
    {
      id: 'r1',
      segment: 'Sales & Marketing',
      program: 'Q4 Culture Pulse',
      pending: 8,
      reason: 'Below 60% participation',
    },
    {
      id: 'r2',
      segment: 'People managers',
      program: '360 Feedback',
      pending: 4,
      reason: 'Peer selection not started',
    },
    {
      id: 'r3',
      segment: 'New hires (Oct cohort)',
      program: 'Onboarding Experience',
      pending: 2,
      reason: 'Due in 4 days',
    },
    {
      id: 'r4',
      segment: 'Remote — APAC',
      program: 'Wellness Check-in',
      pending: 5,
      reason: 'Low reminder engagement',
    },
  ],
  quarterComparison: {
    current: { label: 'Q4 2024', completionPercent: 72, responses: 312 },
    previous: { label: 'Q3 2024', completionPercent: 65, responses: 284 },
  },
  quarterlyCompletionTrend: [
    { id: 'q1', label: 'Q1', completionPercent: 58 },
    { id: 'q2', label: 'Q2', completionPercent: 61 },
    { id: 'q3', label: 'Q3', completionPercent: 65, highlight: true },
    { id: 'q4', label: 'Q4', completionPercent: 72, highlight: true },
  ],
  programHealth: [
    { id: 'on-track', label: 'On track', value: '3 programs', tone: 'ok' },
    { id: 'attention', label: 'Needs attention', value: '1 program', tone: 'warn' },
    { id: 'closed', label: 'Closed this quarter', value: '1 program', tone: 'neutral' },
    { id: 'velocity', label: 'Median time to complete', value: '4.2 days', tone: 'neutral' },
  ],
  monthlyResponses: [
    { id: 'oct', label: 'Oct', responses: 68 },
    { id: 'nov', label: 'Nov', responses: 94 },
    { id: 'dec', label: 'Dec', responses: 112 },
    { id: 'jan', label: 'Jan', responses: 38 },
  ],
  surveyTypeMix: [
    { id: 'pulse', label: 'Pulse & culture', percent: 38, variant: 'yellow' },
    { id: '360', label: '360 & effectiveness', percent: 22, variant: 'dark' },
    { id: 'onboard', label: 'Onboarding', percent: 14, variant: 'light' },
    { id: 'compliance', label: 'Compliance', percent: 26, variant: 'dark' },
  ],
  enpsBreakdown: [
    { id: 'promoter', label: 'Promoters', percent: 52, variant: 'promoter' },
    { id: 'passive', label: 'Passives', percent: 31, variant: 'passive' },
    { id: 'detractor', label: 'Detractors', percent: 17, variant: 'detractor' },
  ],
  weekdaySubmissionVolume: [
    { label: 'Mon', heightPercent: 72 },
    { label: 'Tue', heightPercent: 88 },
    { label: 'Wed', heightPercent: 95 },
    { label: 'Thu', heightPercent: 78 },
    { label: 'Fri', heightPercent: 65 },
    { label: 'Sat', heightPercent: 22 },
    { label: 'Sun', heightPercent: 18 },
  ],
  responseTimeDistribution: [
    { id: 'd1', label: 'Under 24h', percent: 34 },
    { id: 'd2', label: '1–3 days', percent: 41 },
    { id: 'd3', label: '4–7 days', percent: 18 },
    { id: 'd4', label: 'Over 7 days', percent: 7 },
  ],
  participationFunnel: [
    { id: 'invited', label: 'Invited', count: 312, percent: 100 },
    { id: 'opened', label: 'Opened link', count: 248, percent: 79 },
    { id: 'started', label: 'Started survey', count: 221, percent: 71 },
    { id: 'submitted', label: 'Submitted', count: 198, percent: 63 },
  ],
  departmentStacked: [
    { id: 'eng', name: 'Engineering', completed: 22, inProgress: 4, notStarted: 2 },
    { id: 'prod', name: 'Product', completed: 11, inProgress: 2, notStarted: 1 },
    { id: 'gtm', name: 'Sales & Marketing', completed: 10, inProgress: 5, notStarted: 3 },
    { id: 'ops', name: 'Operations', completed: 8, inProgress: 1, notStarted: 1 },
    { id: 'ga', name: 'People & Finance', completed: 7, inProgress: 1, notStarted: 0 },
  ],
  completionSparkline: [48, 52, 55, 58, 61, 64, 68, 72],
  hrFocusToday: [
    { id: 'f1', title: 'Culture Pulse follow-up', detail: 'Send reminder to Sales & Marketing (8 pending)' },
    { id: 'f2', title: '360 peer selection', detail: '4 managers have not chosen peers' },
    { id: 'f3', title: 'Onboarding closes Dec 15', detail: '2 responses still outstanding' },
  ],
  recommendedActions: [
    {
      id: 'ra1',
      title: 'Schedule manager nudge',
      detail: '360 cohort responds 2× faster after manager reminders.',
      tag: 'High impact',
    },
    {
      id: 'ra2',
      title: 'Export GTM breakdown',
      detail: 'Share participation report with department leads.',
      tag: 'Share',
    },
    {
      id: 'ra3',
      title: 'Extend Wellness deadline',
      detail: 'Engineering at 66% — optional 3-day extension.',
      tag: 'Optional',
    },
    {
      id: 'ra4',
      title: 'Review open comments',
      detail: '12 new themes flagged in Culture Pulse this week.',
      tag: 'Qualitative',
    },
  ],
  reminderChannels: [
    { id: 'email', channel: 'Email', openRate: 91, completionLift: 18 },
    { id: 'slack', channel: 'Slack', openRate: 76, completionLift: 12 },
    { id: 'teams', channel: 'Teams', openRate: 68, completionLift: 9 },
  ],
  locationParticipation: [
    { id: 'hq', label: 'HQ — Austin', percent: 86 },
    { id: 'remote-us', label: 'Remote US', percent: 74 },
    { id: 'remote-emea', label: 'Remote EMEA', percent: 69 },
    { id: 'remote-apac', label: 'Remote APAC', percent: 61 },
  ],
  verbatimThemes: [
    {
      id: 'v1',
      theme: 'Clearer team goals',
      mentionCount: 24,
      sample: '“I want more clarity on Q1 priorities.”',
    },
    {
      id: 'v2',
      theme: 'Manager check-ins',
      mentionCount: 18,
      sample: '“Weekly 1:1s help me stay aligned.”',
    },
    {
      id: 'v3',
      theme: 'Workload sustainability',
      mentionCount: 15,
      sample: '“Peak weeks need better staffing.”',
    },
  ],
  benchmarks: [
    { id: 'b1', label: 'Org completion', value: '72%', note: 'vs 68% SaaS median' },
    { id: 'b2', label: 'Response rate', value: '68%', note: 'Top quartile for 50–100 FTE' },
    { id: 'b3', label: 'Time to complete', value: '4.2 days', note: 'Faster than Q3 by 0.6d' },
  ],
  chartInsights: {
    monthly: 'December is pacing 19% above November.',
    mix: 'Pulse surveys drive most of your active volume.',
    enps: 'Promoter share improved 4pt since Q3.',
    weekday: 'Wednesdays peak — schedule reminders Tue PM.',
    responseTime: '75% of responses arrive within 3 days of invite.',
    funnel: 'Open rate is strong; focus nudges on started-not-submitted.',
    stacked: 'GTM has the largest not-started segment.',
    sparkline: 'Completion rate up 24pt over 8 weeks.',
  },
};

export function getOrgSurveyAnalytics(): OrgSurveyAnalytics {
  return orgSurveyAnalytics;
}

export function programStatusLabel(status: ActiveSurveyProgram['status']): string {
  switch (status) {
    case 'on_track':
      return 'On track';
    case 'needs_attention':
      return 'Needs attention';
    case 'closed':
      return 'Closed';
    default:
      return status;
  }
}
