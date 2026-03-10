import { GoogleGenAI } from '@google/genai';
import { Repository, UserProfile } from '../types';

export async function generateAIInsights(user: UserProfile, repos: Repository[]): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const langMap: Record<string, number> = {};
    repos.forEach(r => {
      if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
    });
    const topLanguages = Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang, count]) => `${lang} (${count} repos)`);

    const topRepos = [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 15)
      .map(r => ({
        name: r.name,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
        created: r.created_at.slice(0, 10),
        description: r.description?.slice(0, 80),
      }));

    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

    const prompt = `
You are an expert developer profile analyst for GitSubway, a metro-themed GitHub visualizer.
Analyze the following GitHub developer profile and provide a rich, structured Markdown analysis.

## Developer Profile
- **Username**: ${user.login}
- **Name**: ${user.name || 'N/A'}
- **Bio**: ${user.bio || 'None provided'}
- **Public Repos**: ${user.public_repos}
- **Followers**: ${user.followers} | **Following**: ${user.following}
- **Total Stars**: ${totalStars} | **Total Forks**: ${totalForks}
- **Top Languages**: ${topLanguages.join(', ')}

## Top Repositories (by stars)
${JSON.stringify(topRepos, null, 2)}

## Instructions
Write a developer analysis with these exact sections using Markdown:

### 🚉 Developer Specialization
(2-3 sentences on what they primarily build and their expertise area)

### 💻 Technology Stack
(Bullet list of primary languages/frameworks based on actual repo data)

### 📈 Career Journey
(Brief timeline of their development progression based on repo creation dates)

### ⭐ Most Impactful Work
(Highlight 2-3 standout repositories with brief commentary)

### 🏆 Strengths
(3-4 key coding strengths identified from the data)

### 🚀 Recommendations
(2-3 actionable, specific suggestions for growth based on their stack)

Keep each section concise. Be encouraging, specific, and data-driven. No generic greetings.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return response.text || 'No insights generated.';
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return `## Analysis Unavailable\n\nCould not generate AI insights. Please ensure your \`GEMINI_API_KEY\` is configured correctly in the environment.\n\n**Error**: ${String(error)}`;
  }
}
