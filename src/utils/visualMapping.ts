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
  if (!language) return '#888888';
  return LANGUAGE_COLORS[language] || '#ffffff';
}

export function generateMetroSystem(repos: Repository[]): MetroStationData[] {
  const stations: MetroStationData[] = [];
  
  let currentX = 0;
  let currentZ = 0;
  
  let direction = [1, 0]; // x, z
  
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    
    // Size based on stars (min 0.5, max 3)
    const size = Math.max(0.5, Math.min(3, 0.5 + Math.log10(repo.stargazers_count + 1) * 0.5));
    
    // Glow based on size
    const glow = size * 1.5;
    
    stations.push({
      repo,
      position: [currentX, 0, currentZ],
      color: getLanguageColor(repo.language),
      size,
      glow,
      transfers: repo.forks_count
    });

    // Change direction occasionally to make it look like a metro map
    if (i > 0 && i % 5 === 0) {
      if (direction[0] !== 0) {
        direction = [0, Math.random() > 0.5 ? 1 : -1];
      } else {
        direction = [Math.random() > 0.5 ? 1 : -1, 0];
      }
    }
    
    const distance = 5 + size; // distance between stations
    currentX += direction[0] * distance;
    currentZ += direction[1] * distance;
  }
  
  return stations;
}
