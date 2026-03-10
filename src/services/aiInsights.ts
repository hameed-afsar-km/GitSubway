import { GoogleGenAI } from '@google/genai';
import { Repository, UserProfile } from '../types';

export async function generateAIInsights(user: UserProfile, repos: Repository[]): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Create a summarized version of repos to avoid token limits
    const repoSummary = repos.map(r => ({
      name: r.name,
      language: r.language,
      stars: r.stargazers_count,
      created: r.created_at,
      updated: r.updated_at,
      description: r.description
    })).slice(0, 50); // Limit to top 50 oldest repos for timeline context, or maybe sort by stars?
    
    // Actually let's sort by stars for the AI to know the most impactful ones
    const topRepos = [...repoSummary].sort((a, b) => b.stars - a.stars).slice(0, 20);
    
    const prompt = `
      Analyze this GitHub developer profile and their top repositories.
      Provide insights on:
      - Developer specialization
      - Primary programming languages
      - Most active development period
      - Most impactful repositories
      - Recommended improvements or next steps
      
      User: ${user.login}
      Bio: ${user.bio || 'None'}
      Public Repos: ${user.public_repos}
      Followers: ${user.followers}
      
      Top Repositories:
      ${JSON.stringify(topRepos, null, 2)}
      
      Keep the response concise, encouraging, and formatted in Markdown. Do not use generic greetings.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || 'No insights generated.';
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return 'Failed to generate AI insights. Please check your API key or try again later.';
  }
}
