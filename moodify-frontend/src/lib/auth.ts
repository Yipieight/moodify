import NextAuth, { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import SpotifyProvider from "next-auth/providers/spotify"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma, connectPrisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// Create the Prisma adapter with error handling to ensure prisma client is available
const createPrismaAdapter = () => {
  try {
    console.log('Creating Prisma adapter...');
    const baseAdapter = PrismaAdapter(prisma);
    
    // Override the adapter methods to add additional error handling
    const enhancedAdapter = {
      ...baseAdapter,
      getUserByAccount: async (account) => {
        try {
          console.log('getUserByAccount called with:', account);
          // Verify prisma connection before executing query
          if (!prisma || typeof prisma.accounts === 'undefined') {
            console.error('Prisma client or accounts model is undefined');
            console.log('Available Prisma models:', Object.keys(prisma));
            throw new Error('Prisma client not properly initialized');
          }
          
          const result = await prisma.accounts.findUnique({
            where: {
              provider_provider_account_id: {
                provider: account.provider,
                provider_account_id: account.providerAccountId,
              },
            },
            include: { users: true },
          });
          
          console.log('getUserByAccount result:', result ? 'User found' : 'No user found');
          return result?.users || null;
        } catch (error) {
          console.error('Error in custom getUserByAccount:', error);
          throw error;
        }
      },
      getUserByEmail: async (email) => {
        try {
          console.log('getUserByEmail called with:', email);
          // Verify prisma connection before executing query
          if (!prisma || typeof prisma.users === 'undefined') {
            console.error('Prisma client or users model is undefined');
            console.log('Available Prisma models:', Object.keys(prisma));
            throw new Error('Prisma client not properly initialized');
          }
          
          const result = await prisma.users.findUnique({
            where: { email },
          });
          
          console.log('getUserByEmail result:', result ? 'User found' : 'No user found');
          return result;
        } catch (error) {
          console.error('Error in custom getUserByEmail:', error);
          throw error;
        }
      },
    };
    
    console.log('Prisma adapter created successfully with custom getUserByAccount');
    return enhancedAdapter;
  } catch (error) {
    console.error('Failed to create Prisma adapter:', error);
    throw error;
  }
};

const prismaAdapter = createPrismaAdapter();

const authOptions: NextAuthOptions = {
  adapter: prismaAdapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.users.findUnique({
            where: {
              email: credentials.email,
            },
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("Credentials auth error:", error)
          return null
        }
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-email user-read-private playlist-read-private playlist-read-collaborative user-modify-playback-state user-read-playback-state user-top-read",
        },
      },
    }),
  ],
  // Add global error handling for NextAuth
  events: {
    error: (error) => {
      console.error("NextAuth error:", error);
    },
    signIn: (message) => {
      console.log("NextAuth sign in event:", message);
    },
    createUser: (message) => {
      console.log("NextAuth create user event:", message);
    }
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Debug logging for Spotify authentication
      console.log("Sign in callback triggered:", { user, account, profile });
      
      try {
        // For OAuth accounts (like Spotify), link or create accounts
        if (account?.provider && profile) {
          // For Spotify, we need to make sure we have the essential info
          if (account.provider === "spotify") {
            // Check if we have the required profile information
            if (!profile.email) {
              console.error("Spotify profile missing email:", profile);
              return false; // Deny sign-in
            }
            
            // Find existing user based on email
            const existingUser = await prisma.users.findUnique({
              where: { email: profile.email as string },
            });
            
            if (!existingUser) {
              // Create new user from Spotify profile
              const newUser = await prisma.users.create({
                data: {
                  email: profile.email as string,
                  name: profile.name || profile.display_name || `Spotify User ${profile.id}`,
                  image: (profile.images as any[])?.[0]?.url || null,
                  email_verified: new Date(),
                },
              });
              console.log("Created new user from Spotify:", newUser.id);
            } else {
              console.log("Found existing user:", existingUser.id);
              
              // Check if an account record already exists for this provider and provider account ID
              const existingAccount = await prisma.accounts.findUnique({
                where: {
                  provider_provider_account_id: {
                    provider: account.provider,
                    provider_account_id: account.providerAccountId,
                  }
                }
              });
              
              if (!existingAccount) {
                // Link the existing user to the Spotify account
                await prisma.accounts.create({
                  data: {
                    user_id: existingUser.id,
                    type: account.type,
                    provider: account.provider,
                    provider_account_id: account.providerAccountId,
                    access_token: account.access_token,
                    refresh_token: account.refresh_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                  },
                });
                console.log("Linked existing user to Spotify account:", existingUser.id);
              }
            }
          }
        }
        return true; // Allow sign-in
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false; // Deny sign-in on error
      }
    },
    async jwt({ token, account, user, profile }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider; // Add provider info
        
        // For Spotify, also store profile information if available
        if (account.provider === "spotify" && account.providerAccountId) {
          token.spotifyId = account.providerAccountId;
        }
      }
      
      // If no user exists yet, but we have profile info from the signIn callback
      if (!token.sub && profile?.email) {
        const existingUser = await prisma.users.findUnique({
          where: { email: profile.email as string },
        });
        if (existingUser) {
          token.sub = existingUser.id;
          token.id = existingUser.id;
          token.name = existingUser.name;
          token.email = existingUser.email;
          token.image = existingUser.image;
        }
      }
      
      if (user) {
        token.sub = user.id; // Use sub instead of id for consistency
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.sub as string || token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.provider = token.provider as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs starting with /
      if (url.startsWith("/")) {
        // Only allow dashboard and other safe routes to prevent open redirect vulnerabilities
        if (url.includes("/dashboard") || url === "/" || url.startsWith("/api")) {
          return `${baseUrl}${url}`;
        }
        // Default to home if the redirect URL is not allowed
        return baseUrl;
      }
      // Allow redirect to the same origin
      else if (new URL(url).origin === baseUrl) {
        // Only allow redirects to the same origin for security
        return url;
      }
      // Default to base URL
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Add more debugging in development
  debug: process.env.NODE_ENV === "development",
}

export { authOptions }
export default NextAuth(authOptions)