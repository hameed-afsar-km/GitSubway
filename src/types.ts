export interface Repository {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  topics: string[];
  open_issues_count: number;
  size: number;
}

export interface UserProfile {
  login: string;
  avatar_url: string;
  name: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  bio: string | null;
  created_at: string;
}
export type VisualEnvironment = 'day' | 'night' | 'summer' | 'winter' | 'autumn' | 'spring' | 'blossom';

export interface MetroStationData {
  repo: Repository;
  /** Platform position — offset to the side of the track */
  position: [number, number, number];
  /** On-rail position — the train follows these */
  trackPosition: [number, number, number];
  color: string;
  size: number;
  glow: number;
  transfers: number;
}
