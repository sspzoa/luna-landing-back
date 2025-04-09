export const CONFIG = {
  SERVER: {
    PORT: Number.parseInt(process.env.PORT || '3000', 10),
    HOST: process.env.HOST || 'localhost',
  },
  NOTION: {
    API_VERSION: '2022-02-22',
    API_URL: 'https://api.notion.com/v1',
    DATABASE_IDS: {
      AWARDS: '5c6c5d4aa4e24a1ba18aee280fcfc39a',
      QNA: '5153a7c657844eebaa62b737c726447d',
      MEMBERS: '3d3cae4b3b50481497a6c52f61413921',
      INFORMATION: '564bbb8126ca46a69e44288548d99fa2',
      PROJECTS: 'f73e99abb9ea4817b2d6c6333d152242',
    },
  },
  CACHE: {
    TTL: 24 * 60 * 60 * 1000,
    DB_PATH: './cache.db',
    CLEANUP_INTERVAL: 60 * 60 * 1000,
  },
  CRON: {
    REFRESH_INTERVAL: 30 * 60 * 1000,
  },
} as const;
