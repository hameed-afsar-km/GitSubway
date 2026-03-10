import { Repository, MetroStationData } from '../types';

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Shell: '#89e051',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
};

export function getLanguageColor(language: string | null): string {
  if (!language) return '#94a3b8';
  return LANGUAGE_COLORS[language] || '#ffffff';
}

const STATION_GAP = 18;   // units between stations (longer than before)
const PLATFORM_OFFSET = 6;    // units perpendicular to track (platform is to the side)
const TURN_EVERY = 6;    // change direction every N stations

export function generateMetroSystem(repos: Repository[]): MetroStationData[] {
  const stations: MetroStationData[] = [];

  // Star-ratio: size relative to the most-starred repo (0.6 → 3.0)
  const maxStars = Math.max(...repos.map(r => r.stargazers_count), 1);

  let trackX = 0;
  let trackZ = 0;
  // direction as [dx, dz]
  let dir: [number, number] = [1, 0];

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];

    // Change direction every TURN_EVERY stations (but not at index 0)
    if (i > 0 && i % TURN_EVERY === 0) {
      // Rotate 90° — alternate CW and CCW for variety
      if (dir[0] !== 0) {
        // Currently going in X → turn to Z
        dir = [0, (i / TURN_EVERY) % 2 === 1 ? 1 : -1];
      } else {
        // Currently going in Z → turn to X
        dir = [(i / TURN_EVERY) % 2 === 1 ? 1 : -1, 0];
      }
    }

    // The train travels along this exact point
    const tp: [number, number, number] = [trackX, 0, trackZ];

    // Perpendicular direction (rotate dir 90° CW): (dx,dz) → (dz, -dx)
    const perpX = dir[1];
    const perpZ = -dir[0];

    // Alternate which side the platform is on every other station
    const side = i % 2 === 0 ? 1 : -1;

    const px: [number, number, number] = [
      trackX + perpX * PLATFORM_OFFSET * side,
      0,
      trackZ + perpZ * PLATFORM_OFFSET * side,
    ];

    const ratio = repo.stargazers_count / maxStars;
    const size = 0.6 + ratio * 2.4; // 0.6 → 3.0

    stations.push({
      repo,
      trackPosition: tp,
      position: px,
      color: getLanguageColor(repo.language),
      size,
      glow: size * 1.1,
      transfers: repo.forks_count,
    });

    // Advance along track
    trackX += dir[0] * STATION_GAP;
    trackZ += dir[1] * STATION_GAP;
  }

  return stations;
}
