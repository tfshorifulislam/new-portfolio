export type ProfileStats = {
  years: number;
  repos: number;
  stars: number;
  followers: number;
};

export type ContributionDay = {
  date: string;
  contributionCount: number;
  weekday: number;
  color: string;
};

export type ContributionWeek = {
  contributionDays: ContributionDay[];
};

export type ContributionCalendar = {
  totalContributions: number;
  weeks: ContributionWeek[];
};

export type Profile = {
  name: string;
  bio: string;
  roles: string[];
  avatarUrl: string;
  heroTagline: string | null;
  stats: ProfileStats;
};

export type Project = {
  id: string;
  repo: string;
  title: string;
  customBlurb: string | null;
  tags: string[];
  featured: boolean;
  order: number;
  coverImage: string | null;
  screenshots: string[];
  githubUrl?: string;
  liveUrl?: string;
};

export type Experience = {
  id: string;
  role: string;
  org: string;
  period: string;
  location: string | null;
  isCurrent: boolean;
  description: string[];
  order: number;
};

export type Skill = {
  name: string;
  iconPath: string;
  category: string;
  order: number;
};

export type Service = {
  title: string;
  shortDescription: string | null;
  description: string;
  icon: string | null;
  order: number;
};

export type SocialLink = {
  platform: string;
  url: string;
  username: string;
  order: number;
};

export type FundingLink = {
  label: string;
  url: string;
  primary: boolean;
  order: number;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  order: number;
};
