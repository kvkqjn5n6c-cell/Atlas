import type { UserRole } from "@/types/business";

export type AppSession = {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    role: UserRole;
  };
};

export async function getCurrentSession(): Promise<AppSession | null> {
  // Placeholder V1: NextAuth/Credentials will be wired after the project skeleton.
  return null;
}
