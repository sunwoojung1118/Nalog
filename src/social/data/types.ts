import { DayIndex } from '@/lib/date';

export type Friend = {
  id: string;
  name: string;
  initials: string;
  bio?: string;
};

export type PostStatus = 'draft' | 'published';
export type PublishMode = 'auto' | 'manual';

export type PostBase = {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  status: PostStatus;
  createdAt: number;
  publishedAt?: number;
};

export type NalogPost = PostBase & {
  kind: 'nalog';
  week: number;
  day: DayIndex;
  subtitle: string;
  body: string;
};

export type LogPost = PostBase & {
  kind: 'log';
  title: string;
  body: string;
};

export type Post = NalogPost | LogPost;

// Back-compat alias for callers still importing `Nalog`.
export type Nalog = NalogPost;

export type Community = {
  id: string;
  name: string;
  tag: string;
  memberCount: number;
  blurb: string;
};
