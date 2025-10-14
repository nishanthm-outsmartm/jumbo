// Client-side config - uses import.meta.env in dev, process.env in production
export const clientConfig = {
  env: {
    frontendUrl:
      import.meta.env.VITE_FRONTEND_URL || process.env.VITE_FRONTEND_URL,
    apiBaseUrl:
      import.meta.env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL,
    firebase: {
      apiKey:
        import.meta.env.VITE_FIREBASE_API_KEY ||
        process.env.VITE_FIREBASE_API_KEY,
      appId:
        import.meta.env.VITE_FIREBASE_APP_ID ||
        process.env.VITE_FIREBASE_APP_ID,
      projectId:
        import.meta.env.VITE_FIREBASE_PROJECT_ID ||
        process.env.VITE_FIREBASE_PROJECT_ID,
    },
  },
  loadingScreenTimeout: 100,
} as const;
