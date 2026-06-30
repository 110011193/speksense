// AUTO-GENERATED from "Trait Assessment.xlsx" — SpekSense General Trait Assessment content.
// Each item is a statement the participant rates on its section's scale. Used as the preset
// content when an admin creates a "General Trait Assessment"; admins can still edit it.

import { newId } from '../api/mock/store';
import type { BehavioralScenario } from '../types/assessment';

export interface GeneralTraitItem {
  section: string;
  statement: string;
  options: string[];
}

const OPTION_KEYS = 'ABCDEFGHIJ';

/** Build editable trait statements (scenario model) from the SpekSense General preset. */
export function buildGeneralTraitScenarios(): BehavioralScenario[] {
  return GENERAL_TRAIT_ITEMS.map((it) => ({
    id: newId('scenario'),
    section: it.section,
    prompt: it.statement,
    choices: it.options.map((text, i) => ({ key: OPTION_KEYS[i] ?? String(i + 1), text })),
  }));
}

export const GENERAL_TRAIT_ITEMS: GeneralTraitItem[] = [
  {
    "section": "Social Desirability",
    "statement": "Most people would say I am considerate in my interactions",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "Social Desirability",
    "statement": "Sometimes I find myself wishing things had gone differently.",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "Social Desirability",
    "statement": "I have never said anything that accidentally hurt someone's feelings.",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "Social Desirability",
    "statement": "There have been times when I felt someone deserved a negative outcome.",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "Social Desirability",
    "statement": "I genuinely enjoy listening when others share their perspective.",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "Social Desirability",
    "statement": "I have always acted in ways that benefit others, even when it cost me.",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "Social Desirability",
    "statement": "Looking back, there is nothing I would change about my work behavior.",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "Social Desirability",
    "statement": "I have always supported every decision made by those above me.",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "Social Desirability",
    "statement": "I cannot remember ever feeling irritated with someone at work.",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "Social Desirability",
    "statement": "Every workplace rule I have encountered has made perfect sense to me.",
    "options": [
      "True",
      "False"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I find it easy to get along with different types of people.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I feel frustrated when others don't meet my expectations.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "When someone makes an honest mistake, I prefer to move on rather than dwell on it.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I tend to wait and see whether someone has earned my trust.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "When a project goes well, I make sure everyone's contribution is recognized.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I enjoy friendly competition with my coworkers.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I usually share my thoughts when the team is discussing ideas.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I am most productive when I can focus on my own tasks.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "When the team's energy is low, I try to help bring it back up.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I sometimes hold back suggestions even when I have them.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I enjoy helping new people feel welcome.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "Group brainstorming sessions tend to wear me out.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "When someone offers constructive criticism, I try not to take it personally.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "Feedback sometimes feels like an attack on me.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "After a setback, I am usually ready to try again quickly.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I think a lot about what others might be saying about me.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "I can stay focused even when there is tension on the team.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "How You Typically Approach Situations",
    "statement": "Tight deadlines tend to make me nervous.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I usually finish my tasks by the time they are due.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I have a tendency to put off tasks until later.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I take an extra moment to review my work before sending it out.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I work best when someone checks in on my progress regularly.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "Being on time is something I prioritize.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "Sometimes I do things quickly even if they aren't perfect.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I notice when something isn't working and try to address it.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I prefer to wait for clear instructions before taking action.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "When the team has extra work, I am usually willing to help.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I tend to focus on what my role requires and nothing more.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I often think about how processes could work better.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I generally avoid taking on extra responsibility.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "People can count on me to follow through without reminding me.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "There have been times when I missed something important.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "If I am falling behind, I let others know before it becomes an issue.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "When things go wrong, there is usually a good explanation.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "I deliver on what I promise.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Your Preferred Work Style (Performance)",
    "statement": "Sometimes circumstances make it hard to meet expectations.",
    "options": [
      "Not like me at all",
      "Not really like me",
      "Neutral",
      "Somewhat like me",
      "Very much like me"
    ]
  },
  {
    "section": "Recent Experiences (Behavioral Index)",
    "statement": "I had to rush to complete something before a deadline.",
    "options": [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Very often"
    ]
  },
  {
    "section": "Recent Experiences (Behavioral Index)",
    "statement": "I offered to help a coworker who seemed overloaded.",
    "options": [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Very often"
    ]
  },
  {
    "section": "Recent Experiences (Behavioral Index)",
    "statement": "I noticed an error in my work after submitting it.",
    "options": [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Very often"
    ]
  },
  {
    "section": "Recent Experiences (Behavioral Index)",
    "statement": "I had a disagreement with a coworker and we found a way forward.",
    "options": [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Very often"
    ]
  },
  {
    "section": "Recent Experiences (Behavioral Index)",
    "statement": "I stayed later or started earlier than usual to help the team.",
    "options": [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Very often"
    ]
  },
  {
    "section": "Recent Experiences (Behavioral Index)",
    "statement": "I vented about a coworker to someone outside the team.",
    "options": [
      "Never",
      "Rarely",
      "Sometimes",
      "Often",
      "Very often"
    ]
  }
];
