declare namespace NodeJS {
  interface ProcessEnv {
    // NextAuth Configuration
    NEXTAUTH_URL: string;
    NEXTAUTH_SECRET: string;

    // Spotify API Configuration
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    NEXT_PUBLIC_SPOTIFY_REDIRECT_URI: string;

    // Database Configuration
    DATABASE_URL: string;

    // AWS Configuration
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;

    // Application URLs
    NEXT_PUBLIC_APP_URL: string;

    // Redis Configuration
    REDIS_URL: string;
  }
}