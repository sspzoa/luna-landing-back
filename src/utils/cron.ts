// src/utils/cron.ts
import { fetchAwards, fetchInformation, fetchMembers, fetchProjects, fetchQnA } from '../api/notion';
import { sqliteCache } from './sqlite-cache';
import {
  clearStaticDir,
  downloadAwardImages,
  downloadMemberImages,
  downloadProjectImages,
  ensureStaticDir,
} from './image-downloader';

async function refreshAllData() {
  console.log('Cron job: Refreshing all cached data...');

  try {
    sqliteCache.clear();
    clearStaticDir();

    const [awardsOriginal, membersOriginal, projectsOriginal, qna, information] = await Promise.all([
      fetchAwards(),
      fetchMembers(),
      fetchProjects(),
      fetchQnA(),
      fetchInformation(),
    ]);

    console.log('Cron job: Downloading images...');
    const [awards, members, projects] = await Promise.all([
      downloadAwardImages(awardsOriginal),
      downloadMemberImages(membersOriginal),
      downloadProjectImages(projectsOriginal),
    ]);

    sqliteCache.set('transformed_awards', awards);
    sqliteCache.set('transformed_members', members);
    sqliteCache.set('transformed_projects', projects);

    console.log('Cron job: All data successfully refreshed');
  } catch (error) {
    console.error('Cron job: Error refreshing data:', error);
  }
}

export function setupCronJob(intervalMs = 30 * 60 * 1000) {
  console.log(`Setting up cron job to refresh data every ${intervalMs / 60000} minutes`);

  ensureStaticDir();
  refreshAllData().catch((err) => console.error('Initial data refresh failed:', err));

  return setInterval(refreshAllData, intervalMs);
}
