import type { Assignment } from '../types/assessment';
import { BEHAVIORAL_SCENARIOS } from './behavioralScenarios';

/** Demo assignments seeded into the org catalog on first load. */
export const SEED_ASSIGNMENTS: Omit<Assignment, 'status'>[] = [
  {
    id: '360-feedback',
    kind: 'survey360',
    title: '360 Feedback',
    subtitle: 'Rate peers on leadership behaviors',
    dueLabel: 'Due Dec 20',
    estimatedMinutes: 25,
    instructions: [
      'Select the peers you work with most closely.',
      'Drag each person along the Effectiveness scale (0.0 to 5.0) for every behavior.',
      'You must rate all selected peers on the current behavior before continuing.',
      'Responses are confidential and used for development only.',
    ],
    competencies: [
      {
        id: 'comp-collaboration',
        title: 'Collaboration',
        behaviors: [
          {
            id: 'collab-1',
            statement: 'Shares information openly and keeps others informed.',
          },
          {
            id: 'collab-2',
            statement: 'Works effectively across teams to deliver outcomes.',
          },
        ],
      },
      {
        id: 'comp-communication',
        title: 'Communication',
        behaviors: [
          {
            id: 'comm-1',
            statement: 'Listens actively and seeks to understand different views.',
          },
          {
            id: 'comm-2',
            statement: 'Communicates clearly and adapts style to the audience.',
          },
        ],
      },
      {
        id: 'comp-accountability',
        title: 'Accountability',
        behaviors: [
          {
            id: 'acct-1',
            statement: 'Takes ownership of commitments and follows through.',
          },
          {
            id: 'acct-2',
            statement: 'Holds self and others accountable to team standards.',
          },
        ],
      },
      {
        id: 'comp-growth',
        title: 'Growth mindset',
        behaviors: [
          {
            id: 'growth-1',
            statement: 'Seeks feedback and applies it to improve performance.',
          },
          {
            id: 'growth-2',
            statement: 'Supports others’ development and celebrates learning.',
          },
        ],
      },
    ],
  },
  {
    id: 'onboarding-experience',
    kind: 'standard',
    title: 'Onboarding Experience',
    subtitle: 'New hire feedback',
    dueLabel: 'Due Dec 15',
    estimatedMinutes: 8,
    instructions: [
      'Reflect on your first 90 days (or your onboarding period).',
      'Complete all questions before submitting.',
    ],
    questions: [
      {
        id: 'o1',
        type: 'single',
        prompt: 'The onboarding materials were easy to follow.',
        options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree'],
      },
      {
        id: 'o2',
        type: 'single',
        prompt: 'I had the tools I needed on day one.',
        options: ['Yes', 'Mostly', 'Partially', 'No'],
      },
      {
        id: 'o3',
        type: 'text',
        prompt: 'What would have made onboarding smoother?',
        placeholder: 'Optional',
      },
    ],
  },
  {
    id: 'behavioral-assessment',
    kind: 'behavioral',
    title: 'Behavioral Assessment',
    subtitle: 'Situational judgment — workplace scenarios',
    dueLabel: 'Due Jan 15',
    estimatedMinutes: 40,
    instructions: [
      'Each item describes a realistic workplace scenario with four possible actions.',
      'There is no single “correct” answer — choose the option that best reflects how you would typically respond.',
      'Progress is saved in this browser; you can pause and return anytime.',
      'Plan for about 40 minutes to complete all 25 scenarios.',
    ],
    scenarios: BEHAVIORAL_SCENARIOS,
  },
  {
    id: 'wellness-check',
    kind: 'standard',
    title: 'Wellness Check-in',
    subtitle: 'Anonymous pulse',
    dueLabel: 'Due Dec 28',
    estimatedMinutes: 5,
    instructions: [
      'This survey is confidential and used only in aggregate.',
      'It should take about five minutes.',
    ],
    questions: [
      {
        id: 'w1',
        type: 'single',
        prompt: 'How is your workload this month?',
        options: ['Manageable', 'Busy but OK', 'Overwhelming', 'Prefer not to say'],
      },
      {
        id: 'w2',
        type: 'single',
        prompt: 'Do you feel supported by your team?',
        options: ['Always', 'Often', 'Sometimes', 'Rarely'],
      },
    ],
  },
  {
    id: 'q4-culture',
    kind: 'standard',
    title: 'Q4 Culture Pulse',
    subtitle: 'Team alignment and values',
    dueLabel: 'Due Dec 20',
    estimatedMinutes: 12,
    instructions: [
      'Answer honestly based on your experience this quarter.',
      'You can pause and return; progress is saved in this browser.',
      'There are no right or wrong answers for open-ended items.',
    ],
    questions: [
      {
        id: 'q1',
        type: 'single',
        prompt: 'How well do you understand our team goals for Q4?',
        options: ['Very well', 'Somewhat', 'A little', 'Not at all'],
      },
      {
        id: 'q2',
        type: 'single',
        prompt: 'How often do you collaborate with other departments?',
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
      },
      {
        id: 'q3',
        type: 'text',
        prompt: 'What is one thing we should start doing as a team?',
        placeholder: 'Your thoughts…',
      },
      {
        id: 'q4',
        type: 'single',
        prompt: 'I feel comfortable sharing feedback with my manager.',
        options: ['Strongly agree', 'Agree', 'Neutral', 'Disagree'],
      },
    ],
  },
  {
    id: 'security-awareness',
    kind: 'standard',
    title: 'Security Awareness',
    subtitle: 'Annual compliance',
    dueLabel: 'Completed',
    estimatedMinutes: 10,
    instructions: ['You have already submitted this assessment.'],
    questions: [
      {
        id: 's1',
        type: 'single',
        prompt: 'I report suspicious emails to IT.',
        options: ['Yes', 'No'],
      },
    ],
  },
];
