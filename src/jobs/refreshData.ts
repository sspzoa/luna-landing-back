import { fetchAwards, fetchInformation, fetchMembers, fetchProjects, fetchQnA } from '../services/notion';
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';

export async function refreshAllData(): Promise<void> {
  logger.info('Starting data refresh job');

  try {
    cache.clear();

    await Promise.allSettled([
      fetchAwards()
        .then((data) => {
          logger.info(`Refreshed ${data.length} awards`);
        })
        .catch((err) => {
          logger.error('Failed to refresh awards:', err);
        }),

      fetchQnA()
        .then((data) => {
          logger.info(`Refreshed ${data.length} QnAs`);
        })
        .catch((err) => {
          logger.error('Failed to refresh QnAs:', err);
        }),

      fetchMembers()
        .then((data) => {
          logger.info(`Refreshed ${data.length} members`);
        })
        .catch((err) => {
          logger.error('Failed to refresh members:', err);
        }),

      fetchProjects()
        .then((data) => {
          logger.info(`Refreshed ${data.length} projects`);
        })
        .catch((err) => {
          logger.error('Failed to refresh projects:', err);
        }),

      fetchInformation()
        .then((data) => {
          logger.info('Refreshed information data');
        })
        .catch((err) => {
          logger.error('Failed to refresh information:', err);
        }),
    ]);

    logger.info('Data refresh job completed successfully');
  } catch (error) {
    logger.error('Data refresh job failed:', error);
    throw error;
  }
}

export function setupRefreshJob(intervalMs: number): NodeJS.Timeout {
  logger.info(`Setting up data refresh job to run every ${intervalMs / 60000} minutes`);

  refreshAllData().catch((error) => {
    logger.error('Initial data refresh failed:', error);
  });

  return <NodeJS.Timeout>setInterval(refreshAllData, intervalMs);
}
