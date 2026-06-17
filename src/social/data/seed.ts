import { Community, Friend, NalogPost } from './types';

export const seedFriends: Friend[] = [
  {
    id: 'f-mira',
    name: 'Mira',
    initials: 'MR',
    bio: 'First-year, taking the long way to everywhere.',
  },
  {
    id: 'f-jules',
    name: 'Jules',
    initials: 'JL',
    bio: 'Cafe shifts, soccer captain, late-night reader.',
  },
  {
    id: 'f-omar',
    name: 'Omar',
    initials: 'OM',
    bio: 'Documenting building Nalog and becoming the Ironman.',
  },
  {
    id: 'f-iris',
    name: 'Iris',
    initials: 'IR',
    bio: 'Slow mornings, new roommate, learning the dorm.',
  },
];

const HOUR = 60 * 60 * 1000;
const SEED_NOW = Date.now();

function seedPost(
  partial: Omit<NalogPost, 'kind' | 'status' | 'createdAt' | 'publishedAt'>,
  hoursAgo: number,
): NalogPost {
  const t = SEED_NOW - hoursAgo * HOUR;
  return {
    ...partial,
    kind: 'nalog',
    status: 'published',
    createdAt: t,
    publishedAt: t,
  };
}

export const seedFriendNalogs: NalogPost[] = [
  seedPost(
    {
      id: 'n-mira-1',
      authorId: 'f-mira',
      authorName: 'Mira',
      authorInitials: 'MR',
      week: 24,
      day: 2,
      subtitle: 'A long walk between classes.',
      body:
        'Took the path behind the science building instead of the usual one. There was a man teaching his daughter to ride a bike — they kept laughing every time she wobbled. I think I needed that more than I knew.',
    },
    6,
  ),
  seedPost(
    {
      id: 'n-mira-2',
      authorId: 'f-mira',
      authorName: 'Mira',
      authorInitials: 'MR',
      week: 24,
      day: 3,
      subtitle: 'Library at the wrong hour.',
      body:
        'Only one in the periodicals section. Pulled a journal from 1983 and a pressed leaf fell out — someone’s bookmark, still here forty years later. Put it back in a different page so the next person finds it too.',
    },
    3,
  ),
  seedPost(
    {
      id: 'n-mira-3',
      authorId: 'f-mira',
      authorName: 'Mira',
      authorInitials: 'MR',
      week: 23,
      day: 5,
      subtitle: 'Phone call with mom.',
      body:
        'She asked if I was eating. I said yes too fast and the line went quiet for a beat. We talked about the weather after that. I’ll call her again tomorrow with a real answer.',
    },
    50,
  ),
  seedPost(
    {
      id: 'n-jules-1',
      authorId: 'f-jules',
      authorName: 'Jules',
      authorInitials: 'JL',
      week: 24,
      day: 1,
      subtitle: 'First shift back at the cafe.',
      body:
        'Three months away and everything was still where I left it. Made an oat latte for a regular who said “welcome back” without looking up from her book. That felt like home in the smallest way.',
    },
    13,
  ),
  seedPost(
    {
      id: 'n-omar-1',
      authorId: 'f-omar',
      authorName: 'Omar',
      authorInitials: 'OM',
      week: 24,
      day: 2,
      subtitle: 'Lifting alone, finally.',
      body:
        'Coach wasn’t there today. Did the full warm-up by myself and didn’t skip a single set. Small thing. Felt like a big thing.',
    },
    20,
  ),
  seedPost(
    {
      id: 'n-iris-1',
      authorId: 'f-iris',
      authorName: 'Iris',
      authorInitials: 'IR',
      week: 24,
      day: 1,
      subtitle: 'Move-in day. Box fort vibes.',
      body:
        'My roommate and I built a wall of moving boxes between our beds and called it our embassy. She lent me her fan without me asking. I think we’re going to be okay.',
    },
    30,
  ),
];

export const seedCommunities: Community[] = [
  {
    id: 'c-d3-soccer',
    name: 'D3 College Soccer',
    tag: 'soccer',
    memberCount: 1284,
    blurb: 'For everyone playing, coaching, or quietly watching their kid sister play.',
  },
  {
    id: 'c-quiet-mornings',
    name: 'Quiet Mornings',
    tag: 'mornings',
    memberCount: 542,
    blurb: 'Anyone up before 6. The cup-of-coffee crowd.',
  },
  {
    id: 'c-first-year',
    name: 'First Year',
    tag: 'college',
    memberCount: 3110,
    blurb: 'The first 12 weeks of college, written down.',
  },
  {
    id: 'c-runners',
    name: 'Slow Runners',
    tag: 'running',
    memberCount: 870,
    blurb: 'Pace doesn’t matter. Showing up does.',
  },
];

export const seedCommunityPosts: Record<string, NalogPost[]> = {
  'c-d3-soccer': [
    seedPost(
      {
        id: 'p-soccer-1',
        authorId: 'f-omar',
        authorName: 'Omar',
        authorInitials: 'OM',
        week: 24,
        day: 1,
        subtitle: 'Two-a-days started.',
        body:
          'Sprints at six, film at noon, scrimmage at four. Came home and my mom had cut up watermelon. Didn’t cry but it was close.',
      },
      40,
    ),
    seedPost(
      {
        id: 'p-soccer-2',
        authorId: 'f-jules',
        authorName: 'Jules',
        authorInitials: 'JL',
        week: 24,
        day: 2,
        subtitle: 'Captain meeting.',
        body:
          'Got asked to be a captain. Said yes before I had time to talk myself out of it. Writing it down so I can’t pretend it didn’t happen.',
      },
      26,
    ),
  ],
  'c-quiet-mornings': [
    seedPost(
      {
        id: 'p-morn-1',
        authorId: 'f-iris',
        authorName: 'Iris',
        authorInitials: 'IR',
        week: 24,
        day: 1,
        subtitle: 'Walked instead of scrolling.',
        body:
          'Phone stayed in the drawer until eight. Made tea, watched the parking lot turn from grey to gold. Nothing happened and it was the best part of my week.',
      },
      35,
    ),
    seedPost(
      {
        id: 'p-morn-mira-1',
        authorId: 'f-mira',
        authorName: 'Mira',
        authorInitials: 'MR',
        week: 24,
        day: 2,
        subtitle: 'Five-thirty fog.',
        body:
          'Out before the cafeteria opened. Geese on the quad already awake, walking like they owned the place. Maybe they do at that hour. I just nodded and kept moving.',
      },
      28,
    ),
  ],
  'c-first-year': [
    seedPost(
      {
        id: 'p-fy-1',
        authorId: 'f-mira',
        authorName: 'Mira',
        authorInitials: 'MR',
        week: 24,
        day: 1,
        subtitle: 'Dining hall is a maze.',
        body:
          'Walked in circles three times before finding the salad bar. A junior saw me and just gestured — “left, then left again.” I’m going to do that for someone next year.',
      },
      42,
    ),
  ],
  'c-runners': [
    seedPost(
      {
        id: 'p-run-1',
        authorId: 'f-omar',
        authorName: 'Omar',
        authorInitials: 'OM',
        week: 24,
        day: 2,
        subtitle: 'Two miles, no music.',
        body:
          'Heard birds I didn’t know we had. The hill at the end still beat me but I’m closer to the top.',
      },
      18,
    ),
  ],
};
