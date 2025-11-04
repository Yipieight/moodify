import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectPrisma } from "@/lib/prisma"

// Initialize Prisma connection when the handler is loaded
let prismaInitialized = false;
if (typeof window === 'undefined' && !prismaInitialized) {
  connectPrisma().then(() => {
    prismaInitialized = true;
    console.log('Prisma initialized for NextAuth');
  }).catch((error) => {
    console.error('Failed to initialize Prisma for NextAuth:', error);
  });
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }