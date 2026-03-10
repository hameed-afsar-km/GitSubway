import { Repository, UserProfile } from '../types';

const BASE_URL = 'https://api.github.com';

export async function fetchUserProfile(username: string): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}/users/${username}`);
  if (!res.ok) throw new Error('User not found');
  return res.json();
}

export async function fetchUserRepositories(username: string): Promise<Repository[]> {
  let repos: Repository[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(`${BASE_URL}/users/${username}/repos?per_page=100&page=${page}&sort=created&direction=asc`);
    if (!res.ok) throw new Error('Failed to fetch repositories');
    const data = await res.json();
    repos = repos.concat(data);
    if (data.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
    // Limit to 300 repos to prevent rate limiting / performance issues for huge accounts
    if (repos.length >= 300) break;
  }

  return repos.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}
