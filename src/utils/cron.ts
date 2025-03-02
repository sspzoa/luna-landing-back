// src/utils/cron.ts
import { fetchAwards, fetchInformation, fetchMembers, fetchProjects, fetchQnA } from '../api/notion';
import { memoryCache } from './cache-utils';

async function refreshAllData() {
  console.log('Cron job: Refreshing all cached data...');

  try {
    await Promise.all([fetchAwards(), fetchQnA(), fetchMembers(), fetchInformation(), fetchProjects()]);

    console.log('Cron job: All data successfully refreshed');
  } catch (error) {
    console.error('Cron job: Error refreshing data:', error);
  }
}

export function setupCronJob(intervalMs: number = 30 * 60 * 1000) {
  console.log(`Setting up cron job to refresh data every ${intervalMs / 60000} minutes`);

  refreshAllData().catch((err) => console.error('Initial data refresh failed:', err));

  return setInterval(refreshAllData, intervalMs);
}
