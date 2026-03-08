export type SessionStatus = 'ready' | 'open-source' | 'upcoming';
export type SessionGroup = 'ready-and-tested' | 'upcoming';

export interface Session {
  id: string;
  title: string;
  status: SessionStatus;
  group: SessionGroup;
  problemStatement: string;
  whatStudentsDo?: string;
  why?: string;
  openSourceLink?: string;
  isOpenSource: boolean;
  upcomingTeaser?: string;
  order: number;
}

export const sessions: Session[] = [
  {
    id: 'shitty-first-drafts',
    title: 'Shitty First Drafts',
    status: 'open-source',
    group: 'ready-and-tested',
    problemStatement: 'Attendees fear imperfection and cannot start.',
    whatStudentsDo:
      'Draft something real, messy, and fast. Practice iterating on their own first draft. Experience that momentum beats perfection.',
    why: 'Getting started is the hardest part, and most programs skip it.',
    openSourceLink: '/open-source/shitty-first-draft',
    isOpenSource: true,
    order: 1,
  },
  {
    id: 'understanding-agency',
    title: 'Understanding Agency',
    status: 'open-source',
    group: 'ready-and-tested',
    problemStatement: 'Attendees passively wait for opportunities instead of creating them.',
    whatStudentsDo:
      'Identify their biggest ambitions and fears. Map first concrete steps they can take. Practice the do-feedback-iterate loop.',
    why: 'Agency is a skill, not a personality trait. This session makes that visible.',
    openSourceLink: '/open-source/understanding-agency',
    isOpenSource: true,
    order: 2,
  },
  {
    id: 'agency-in-action',
    title: 'Agency in Action',
    status: 'ready',
    group: 'ready-and-tested',
    problemStatement: "Attendees don't know how to intentionally shape their career path.",
    whatStudentsDo:
      'Apply agency thinking to career decisions. Design experiments to test career hypotheses. Build a personal action roadmap.',
    why: 'Career design is a system, not a lottery. Attendees practice treating it that way.',
    isOpenSource: false,
    order: 3,
  },
  {
    id: 'navigating-your-future',
    title: 'Navigating Your Future',
    status: 'ready',
    group: 'ready-and-tested',
    problemStatement: 'Attendees face paralysis when thinking about life after college.',
    whatStudentsDo:
      'Confront uncertainty head-on. Map options as experiments, not commitments. Articulate what they want to try next.',
    why: "The future isn't something that happens to you. This session makes planning feel actionable, not abstract.",
    isOpenSource: false,
    order: 4,
  },
  {
    id: 'understanding-system-design',
    title: 'Understanding System Design',
    status: 'ready',
    group: 'ready-and-tested',
    problemStatement: 'Attendees see career and life as random events, not interconnected systems.',
    whatStudentsDo:
      'Break down how systems work in real contexts. Apply systems thinking to their own decisions and projects.',
    why: 'Seeing patterns changes how attendees make choices.',
    isOpenSource: false,
    order: 5,
  },
  {
    id: 'how-to-prioritise',
    title: 'How to Prioritise',
    status: 'upcoming',
    group: 'upcoming',
    problemStatement: 'Attendees struggle with too many options and no framework for choosing.',
    upcomingTeaser:
      "We're building this because attendees struggle with deciding what matters most when everything feels urgent.",
    isOpenSource: false,
    order: 1,
  },
];

export const plannedSessionsSummary =
  '9+ more sessions in the pipeline across career design, communication, systems thinking, and more.';

export function getSessionsByGroup(group: SessionGroup): Session[] {
  return sessions.filter((s) => s.group === group).sort((a, b) => a.order - b.order);
}
