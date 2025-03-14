// src/utils/cron.ts
import { fetchAwards, fetchInformation, fetchMembers, fetchProjects, fetchQnA } from '../api/notion';
import { memoryCache } from './cache-utils';

async function refreshAllData() {
  console.log('Cron job: Refreshing all cached data...');

  try {
    memoryCache.delete('transformed_awards');
    memoryCache.delete('transformed_qna');
    memoryCache.delete('transformed_members');
    memoryCache.delete('transformed_information');
    memoryCache.delete('transformed_projects');

    memoryCache.delete('notion_db_5c6c5d4aa4e24a1ba18aee280fcfc39a_[{"property":"date","direction":"descending"}]');
    memoryCache.delete('notion_db_5153a7c657844eebaa62b737c726447d_[]');
    memoryCache.delete('notion_db_3d3cae4b3b50481497a6c52f61413921_[]');
    memoryCache.delete('notion_db_564bbb8126ca46a69e44288548d99fa2_[]');
    memoryCache.delete('notion_db_f73e99abb9ea4817b2d6c6333d152242_[]');

    await Promise.all([fetchAwards(), fetchQnA(), fetchMembers(), fetchInformation(), fetchProjects()]);

    console.log('Cron job: All data successfully refreshed');
  } catch (error) {
    console.error('Cron job: Error refreshing data:', error);
  }
}

export function setupCronJob(intervalMs: number = 10 * 60 * 1000) {
  console.log(`Setting up cron job to refresh data every ${intervalMs / 60000} minutes`);

  refreshAllData().catch((err) => console.error('Initial data refresh failed:', err));

  return setInterval(refreshAllData, intervalMs);
}
