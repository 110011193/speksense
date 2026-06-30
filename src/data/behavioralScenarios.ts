import type { BehavioralScenario } from '../types/assessment';

export const BEHAVIORAL_SCENARIOS: BehavioralScenario[] = [
  {
    id: 'behavioral-01',
    section: 'Execution & Ownership',
    prompt:
      'A critical project deadline is 48 hours away, and you realize an unexpected technical bottleneck will delay delivery by a day. What do you do first?',
    choices: [
      {
        key: 'A',
        text: 'Work through the night to try and clear the bottleneck yourself without alarming anyone.',
      },
      {
        key: 'B',
        text: 'Immediately alert stakeholders, explain the bottleneck, and present a realistic, revised timeline.',
      },
      {
        key: 'C',
        text: 'Ask a peer to drop their current tasks to help you push your project over the finish line.',
      },
      {
        key: 'D',
        text: 'Deliver what you have on time, even if it’s incomplete, and patch the rest post-launch.',
      },
    ],
  },
  {
    id: 'behavioral-02',
    section: 'Execution & Ownership',
    prompt:
      'Your manager assigns you a high-priority task, but the requirements are incredibly vague and your manager is out of pocket for the rest of the day. How do you proceed?',
    choices: [
      {
        key: 'A',
        text: 'Wait until your manager returns tomorrow to get explicit clarification before starting.',
      },
      {
        key: 'B',
        text: 'Document your own assumptions, outline a clear execution plan based on those assumptions, and start building.',
      },
      {
        key: 'C',
        text: 'Ask your team members what they think your manager wants and follow the consensus.',
      },
      {
        key: 'D',
        text: 'Postpone the task and work on lower-priority items where the requirements are clear.',
      },
    ],
  },
  {
    id: 'behavioral-03',
    section: 'Execution & Ownership',
    prompt:
      'You disagree strongly with a strategic pivot leadership has decided to take on your project. The decision is final. What is your stance?',
    choices: [
      {
        key: 'A',
        text: 'Execute the new plan, but make sure to document your original objections in writing just in case it fails.',
      },
      {
        key: 'B',
        text: 'Disagree openly, but commit 100% to making the new direction successful without dragging your feet.',
      },
      {
        key: 'C',
        text: 'Politely ask to be reassigned to a different project that aligns better with your strategic vision.',
      },
      {
        key: 'D',
        text: 'Comply with the minimum requirements of the new direction while trying to quietly steer it back to the original plan.',
      },
    ],
  },
  {
    id: 'behavioral-04',
    section: 'Execution & Ownership',
    prompt:
      'You have four competing tasks on your plate, all marked "Urgent" by different stakeholders. You only have time to finish two today. How do you handle it?',
    choices: [
      {
        key: 'A',
        text: 'Work on the two tasks assigned by the most senior stakeholders.',
      },
      {
        key: 'B',
        text: 'Spend the first hour of your day negotiating with all four stakeholders to establish a clear, shared priority list.',
      },
      {
        key: 'C',
        text: 'Focus on the two tasks that will take the least amount of time so you can clear them off the board.',
      },
      {
        key: 'D',
        text: 'Work on whichever two tasks you feel add the most long-term value to the business.',
      },
    ],
  },
  {
    id: 'behavioral-05',
    section: 'Execution & Ownership',
    prompt:
      'A feature you recently shipped causes an unexpected performance dip in production. What is your immediate response?',
    choices: [
      {
        key: 'A',
        text: 'Revert the changes immediately to restore performance, then dig into the logs to find the root cause.',
      },
      {
        key: 'B',
        text: 'Leave the feature live while you actively debug in production to avoid disrupting users who are already using it.',
      },
      {
        key: 'C',
        text: 'Check if someone else can look into it while you finish the sprint work you’re currently in the middle of.',
      },
      {
        key: 'D',
        text: 'Wait to see if the system self-stabilizes or if user complaints start coming in before taking action.',
      },
    ],
  },
  {
    id: 'behavioral-06',
    section: 'Collaboration & Influence',
    prompt:
      'A cross-functional partner is pushing hard for a feature that will significantly delay your team’s timeline. They insist it’s vital for their goals. How do you approach them?',
    choices: [
      {
        key: 'A',
        text: 'Tell them firmly that your team’s timeline cannot change and they will have to wait for the next cycle.',
      },
      {
        key: 'B',
        text: 'Escalate the conflict to your direct manager to let leadership resolve the priority clash.',
      },
      {
        key: 'C',
        text: 'Sit down with them to understand the underlying business impact of their request and try to find a scaled-back "MVP" version.',
      },
      {
        key: 'D',
        text: 'Agree to their request to keep the peace, then explain the delay to your team later.',
      },
    ],
  },
  {
    id: 'behavioral-07',
    section: 'Collaboration & Influence',
    prompt:
      'A peer on your team consistently misses their commitments, which forces you to pick up the slack to meet team goals. What do you do?',
    choices: [
      {
        key: 'A',
        text: 'Talk to your manager privately about your peer’s performance and how it’s impacting your workload.',
      },
      {
        key: 'B',
        text: 'Talk directly to your peer in a 1-on-1 setting, share how the delays affect you, and ask how you can support them.',
      },
      {
        key: 'C',
        text: 'Stop picking up their slack so that the missed deadlines become visible to leadership.',
      },
      {
        key: 'D',
        text: 'Adjust your own timelines to accommodate their delays without making an issue out of it.',
      },
    ],
  },
  {
    id: 'behavioral-08',
    section: 'Collaboration & Influence',
    prompt:
      'You are facilitating a technical discussion, and the team is completely split down the middle between two architectural paths. The deadline to decide is today. How do you close the loop?',
    choices: [
      {
        key: 'A',
        text: 'Step in, make the final decision yourself based on your expertise, and move the team forward.',
      },
      {
        key: 'B',
        text: 'Put it to a quick majority vote and go with whichever option gets the most hands raised.',
      },
      {
        key: 'C',
        text: 'Choose the path that is easiest to revert later, letting everyone know we will iterate if it fails.',
      },
      {
        key: 'D',
        text: 'Extend the meeting or schedule a follow-up, keeping the discussion going until a true consensus is reached.',
      },
    ],
  },
  {
    id: 'behavioral-09',
    section: 'Collaboration & Influence',
    prompt:
      'A stakeholder sends an aggressive email criticizing your team’s recent deliverable, copying your manager and several executives. How do you respond?',
    choices: [
      {
        key: 'A',
        text: 'Reply all immediately with a detailed, defensive point-by-point refutation of their criticisms.',
      },
      {
        key: 'B',
        text: 'Ignore the email and set up an in-person meeting or call with the stakeholder to address their concerns calmly.',
      },
      {
        key: 'C',
        text: 'Send a brief, professional reply-all acknowledging the feedback and stating you are investigating, then move the conversation to a private thread.',
      },
      {
        key: 'D',
        text: 'Let your manager handle the response entirely since executives were copied.',
      },
    ],
  },
  {
    id: 'behavioral-10',
    section: 'Collaboration & Influence',
    prompt:
      'You need to implement a new workflow tool that your team is highly resistant to adopting because they are comfortable with the old way. How do you drive adoption?',
    choices: [
      {
        key: 'A',
        text: 'Mandate the change by setting a strict cut-off date after which the old tool will be turned off.',
      },
      {
        key: 'B',
        text: 'Run a pilot with one or two team members, show the positive results to the rest of the team, and phase it in gradually.',
      },
      {
        key: 'C',
        text: 'Hold a long training session explaining the executive vision behind why the tool was purchased.',
      },
      {
        key: 'D',
        text: 'Make the tool optional and hope people switch over naturally once they see its benefits.',
      },
    ],
  },
  {
    id: 'behavioral-11',
    section: 'Adaptability & Growth',
    prompt:
      'Mid-sprint, corporate priorities shift radically, and the project you’ve been working on for the last month is completely shelved. How do you react?',
    choices: [
      {
        key: 'A',
        text: 'Take a day or two to process your frustration, as it feels like a massive waste of your hard work.',
      },
      {
        key: 'B',
        text: 'Ensure the shelved code is well-documented and archived, then immediately lean into the context of the new priority.',
      },
      {
        key: 'C',
        text: 'Ask leadership for a detailed justification of the pivot before committing to the new direction.',
      },
      {
        key: 'D',
        text: 'Keep working on the old project quietly in the background because you know the business will eventually need it.',
      },
    ],
  },
  {
    id: 'behavioral-12',
    section: 'Adaptability & Growth',
    prompt:
      'You are assigned to build a service using a stack you have zero experience with. The timeline is tight. What is your learning strategy?',
    choices: [
      {
        key: 'A',
        text: 'Ask a senior engineer who knows the stack to pair-program the entire thing with you so you don’t make mistakes.',
      },
      {
        key: 'B',
        text: 'Spend the first week reading documentation and taking online courses before writing a single line of code.',
      },
      {
        key: 'C',
        text: 'Build a quick, throwaway proof-of-concept to break things early, learning the nuances through hands-on failure.',
      },
      {
        key: 'D',
        text: 'Request that the project be delayed until you can be formally trained on the new technology.',
      },
    ],
  },
  {
    id: 'behavioral-13',
    section: 'Adaptability & Growth',
    prompt:
      'In a performance review, your manager gives you feedback that your communication style is too abrupt and it’s rubbing cross-functional partners the wrong way. What do you do?',
    choices: [
      {
        key: 'A',
        text: 'Explain to your manager that your style is just efficient and that changing it would slow down delivery.',
      },
      {
        key: 'B',
        text: 'Accept the feedback, analyze your recent messages, and actively ask a trusted peer to review your high-stakes emails before sending them.',
      },
      {
        key: 'C',
        text: 'Avoid communicating directly with those cross-functional partners moving forward, routing messages through your manager instead.',
      },
      {
        key: 'D',
        text: 'Apologize to the partners directly, but change nothing, assuming they will eventually get used to your style.',
      },
    ],
  },
  {
    id: 'behavioral-14',
    section: 'Adaptability & Growth',
    prompt:
      'A process that worked perfectly when your team was 5 people is now completely breaking down now that the team has grown to 20. What is your move?',
    choices: [
      {
        key: 'A',
        text: 'Push through the friction and work harder to make the old process work, assuming this is just a temporary scaling pain.',
      },
      {
        key: 'B',
        text: 'Propose a new, more structured process to leadership, complete with an implementation plan for the larger team.',
      },
      {
        key: 'C',
        text: 'Wait for management to notice the breakdown and issue new guidelines.',
      },
      {
        key: 'D',
        text: 'Complain to your peers about how much better things were when the team was smaller.',
      },
    ],
  },
  {
    id: 'behavioral-15',
    section: 'Adaptability & Growth',
    prompt:
      'You realize a major industry trend or tool is changing the way your engineering role operates. How do you stay ahead?',
    choices: [
      {
        key: 'A',
        text: 'Wait for your company to organize training sessions or buy licenses for the new tools.',
      },
      {
        key: 'B',
        text: 'Dedicate a small portion of your personal or hackathon time to experiment with the trend and see how it can apply to your current systems.',
      },
      {
        key: 'C',
        text: 'Focus entirely on your current workload, believing that core engineering fundamentals matter more than passing trends.',
      },
      {
        key: 'D',
        text: 'Advise your team to immediately stop what they are doing and pivot everything toward this new trend.',
      },
    ],
  },
  {
    id: 'behavioral-16',
    section: 'Problem Solving & Critical Thinking',
    prompt:
      'You uncover a systemic bug that has been quietly corrupting a minor, non-critical data field for months. Fixing it properly will require a week of downtime for that minor feature. What do you do?',
    choices: [
      {
        key: 'A',
        text: 'Write a quick patch that stops future corruption, ignoring the historical data for now to avoid downtime.',
      },
      {
        key: 'B',
        text: 'Scope out the full fix and the downtime impact, then present it to product leadership to schedule the maintenance window.',
      },
      {
        key: 'C',
        text: 'Fix it silently overnight without telling anyone, hoping the downtime goes unnoticed.',
      },
      {
        key: 'D',
        text: 'Leave it alone since it’s non-critical and hasn’t caused any major user complaints yet.',
      },
    ],
  },
  {
    id: 'behavioral-17',
    section: 'Problem Solving & Critical Thinking',
    prompt:
      'You need to make an urgent architectural decision to keep a project moving, but you only have about 60% of the data you’d ideally want. What is your framework?',
    choices: [
      {
        key: 'A',
        text: 'Delay the decision until you can run more tests and gather at least 90% of the data, regardless of timeline impact.',
      },
      {
        key: 'B',
        text: 'Choose the path that is most easily reversible if the remaining 40% of the data proves your choice wrong.',
      },
      {
        key: 'C',
        text: 'Guess based on intuition alone and commit to that path permanently to show confidence.',
      },
      {
        key: 'D',
        text: 'Delegate the decision to a junior team member to see how they handle decision-making under pressure.',
      },
    ],
  },
  {
    id: 'behavioral-18',
    section: 'Problem Solving & Critical Thinking',
    prompt:
      'You notice a recurring manual task is taking up 4 hours of your team’s time every single week. Automating it will take 16 hours of dedicated work. How do you handle this?',
    choices: [
      {
        key: 'A',
        text: 'Keep doing it manually because 4 hours a week is manageable and doesn’t disrupt your sprint cadence.',
      },
      {
        key: 'B',
        text: 'Spend 16 hours of your own personal time over the weekend to automate it so it doesn’t impact your sprint velocity.',
      },
      {
        key: 'C',
        text: 'Propose the automation as a technical debt item in the next sprint planning, showing that it pays for itself in just 4 weeks.',
      },
      {
        key: 'D',
        text: 'Ask a junior engineer or intern to handle the manual task moving forward so your core team doesn’t have to look at it.',
      },
    ],
  },
  {
    id: 'behavioral-19',
    section: 'Problem Solving & Critical Thinking',
    prompt:
      'Your team is about to sign off on a massive system migration. At the last minute, you spot a subtle edge-case flaw in the design that could cause issues for 1% of users. What do you do?',
    choices: [
      {
        key: 'A',
        text: 'Halt the sign-off immediately, raise the edge case to the team, and insist on resolving it before proceeding.',
      },
      {
        key: 'B',
        text: 'Let the migration proceed on schedule, planning to fix the 1% edge case reactively if those users complain.',
      },
      {
        key: 'C',
        text: 'Mention it casually in a chat channel, but don’t block the sign-off since 99% of users will be fine.',
      },
      {
        key: 'D',
        text: 'Document the edge case in the system wiki as a known limitation and move on.',
      },
    ],
  },
  {
    id: 'behavioral-20',
    section: 'Problem Solving & Critical Thinking',
    prompt:
      'You have a choice between building a fast, custom "hack" that solves a customer problem today or a robust microservice that will take 3 weeks. The customer is furious right now. What do you choose?',
    choices: [
      {
        key: 'A',
        text: 'Build the robust service; the customer will appreciate the stability three weeks from now, even if they are angry today.',
      },
      {
        key: 'B',
        text: 'Deploy the quick hack immediately to appease the customer, but explicitly track it as tech debt and schedule the permanent fix in the very next sprint.',
      },
      {
        key: 'C',
        text: 'Build the quick hack and leave it permanently, moving on to the next customer feature as soon as they stop complaining.',
      },
      {
        key: 'D',
        text: 'Tell the customer it’s impossible to fix quickly and offer them a partial refund instead.',
      },
    ],
  },
  {
    id: 'behavioral-21',
    section: 'Leadership & Mentorship',
    prompt:
      'A junior engineer on your team pushes code that breaks a staging environment because they skipped the pre-deployment checklist. How do you handle it?',
    choices: [
      {
        key: 'A',
        text: 'Fix the staging environment yourself immediately, then send them a stern message reminding them to read the docs.',
      },
      {
        key: 'B',
        text: 'Roll back the code, then hop on a quick call with them to walk through the environment recovery together, using it as a teaching moment about why the checklist exists.',
      },
      {
        key: 'C',
        text: 'Reprimand them publicly in the team channel so everyone else learns from their mistake.',
      },
      {
        key: 'D',
        text: 'Take over their deployment privileges until you are confident they won’t break things again.',
      },
    ],
  },
  {
    id: 'behavioral-22',
    section: 'Leadership & Mentorship',
    prompt:
      'Shifting goals from executives are causing a lot of confusion and anxiety among your team members, slowing down velocity. What do you do?',
    choices: [
      {
        key: 'A',
        text: 'Pass down all information from executives raw and unfiltered so the team sees exactly what you are dealing with.',
      },
      {
        key: 'B',
        text: 'Filter out the noise, translate the high-level shifts into stable, actionable goals for the next two weeks, and absorb the executive pressure yourself.',
      },
      {
        key: 'C',
        text: 'Tell the team to ignore leadership entirely and just keep working on what they were doing before.',
      },
      {
        key: 'D',
        text: 'Organize a meeting between your team and executives so they can debate the strategy directly.',
      },
    ],
  },
  {
    id: 'behavioral-23',
    section: 'Leadership & Mentorship',
    prompt:
      'You need to delegate a highly critical component of a new architecture. You know a senior engineer could do it flawlessly in 2 days, but a mid-level engineer needs a growth opportunity. What do you do?',
    choices: [
      {
        key: 'A',
        text: 'Give it to the senior engineer to guarantee a flawless delivery; risk mitigation comes first.',
      },
      {
        key: 'B',
        text: 'Assign it to the mid-level engineer, but check their code every hour to make sure they aren’t making mistakes.',
      },
      {
        key: 'C',
        text: 'Assign it to the mid-level engineer, schedule daily milestone check-ins, and pair them with the senior engineer as an advisor.',
      },
      {
        key: 'D',
        text: 'Tell the mid-level engineer to handle it completely on their own to see if they sink or swim.',
      },
    ],
  },
  {
    id: 'behavioral-24',
    section: 'Leadership & Mentorship',
    prompt:
      'You are leading a project where team morale has hit an all-time low due to consecutive long weeks and challenging technical hurdles. How do you rally them?',
    choices: [
      {
        key: 'A',
        text: 'Tell them that the crunch is almost over and promise them a team dinner once the project goes live.',
      },
      {
        key: 'B',
        text: 'Call a temporary "timeout," hold a retrospective to let them vent safely, ruthlessly trim non-essential features from the scope, and celebrate the wins they’ve already achieved.',
      },
      {
        key: 'C',
        text: 'Increase the frequency of your status updates to keep everyone accountable and moving fast.',
      },
      {
        key: 'D',
        text: 'Pretend everything is fine and maintain an aggressively positive attitude to avoid feeding into the negative energy.',
      },
    ],
  },
  {
    id: 'behavioral-25',
    section: 'Leadership & Mentorship',
    prompt:
      'You made a miscalculation in an integration plan that resulted in your team losing three days of development work. How do you handle this with your team?',
    choices: [
      {
        key: 'A',
        text: 'Frame the issue as an unpredictable system limitation rather than a personal oversight to maintain your team’s confidence in your leadership.',
      },
      {
        key: 'B',
        text: 'Own the mistake completely during the next standup, walk through where your logic failed, layout the recovery plan, and ask the team how to prevent similar gaps in future plans.',
      },
      {
        key: 'C',
        text: 'Quietly adjust the project timeline without calling attention to the lost three days.',
      },
      {
        key: 'D',
        text: 'Focus on finding who approved your original plan and discuss why they didn’t catch the error with you.',
      },
    ],
  },
];
