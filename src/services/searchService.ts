// PayWorth Global Enterprise Search Engine
import { SCREEN_REGISTRY, ScreenDefinition } from '../config/screenRegistry';
import { Task, Campaign, CatalogGame } from '../types';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'screen' | 'task' | 'campaign' | 'game' | 'help';
  path: string;
}

export class SearchService {
  /**
   * Search across screens, tasks, campaigns, games, and help articles
   */
  public static query(
    term: string,
    tasks: Task[] = [],
    campaigns: Campaign[] = [],
    games: CatalogGame[] = []
  ): SearchResultItem[] {
    const q = term.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // 1. Search Navigation Screens
    SCREEN_REGISTRY.forEach(screen => {
      if (
        screen.label.toLowerCase().includes(q) ||
        screen.seo.description.toLowerCase().includes(q) ||
        screen.id.toLowerCase().includes(q)
      ) {
        results.push({
          id: `screen_${screen.id}`,
          title: screen.label,
          subtitle: screen.seo.description,
          category: 'screen',
          path: screen.path
        });
      }
    });

    // 2. Search Micro Tasks
    tasks.forEach(task => {
      if (
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: `task_${task.id}`,
          title: task.title,
          subtitle: `${task.reward} PWC • ${task.difficulty} • ${task.category}`,
          category: 'task',
          path: '/tasks'
        });
      }
    });

    // 3. Search Marketplace Campaigns
    campaigns.forEach(camp => {
      if (
        camp.title.toLowerCase().includes(q) ||
        camp.description.toLowerCase().includes(q) ||
        camp.creatorName.toLowerCase().includes(q)
      ) {
        results.push({
          id: `campaign_${camp.id}`,
          title: camp.title,
          subtitle: `${camp.reward} PWC • Created by ${camp.creatorName}`,
          category: 'campaign',
          path: '/marketplace'
        });
      }
    });

    // 4. Search Games
    games.forEach(game => {
      if (
        game.title.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q) ||
        game.category.toLowerCase().includes(q)
      ) {
        results.push({
          id: `game_${game.id}`,
          title: game.title,
          subtitle: `${game.category} • Reward: ${game.baseRewardPwc} PWC`,
          category: 'game',
          path: '/games'
        });
      }
    });

    return results.slice(0, 15); // Return top 15 results
  }
}
