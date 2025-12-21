import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type Platform = 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'X';

export interface LinkedAccountEntity {
  id: string;
  userId: string;
  platform: Platform;
  platformUserId: string;
  accessToken: string;
  refreshToken?: string;
  scopes: string;
  tokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
