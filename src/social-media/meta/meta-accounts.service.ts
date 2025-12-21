import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class MetaAccountsService {
  private prisma = new PrismaClient();

  async listAccounts(userId: string) {
    return this.prisma.linkedAccount.findMany({
      where: { userId },
    });
  }

async linkAccount(userId: string, code: string) {
  try {
    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;
    const redirectUri = process.env.META_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Meta environment variables');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code
    });

    const tokenResponse = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`);

    if (!tokenResponse.data.access_token) {
      throw new Error('No access token returned');
    }

    const accessToken = tokenResponse.data.access_token;

    const debugResponse = await axios.get('https://graph.facebook.com/me', {
      params: { access_token: accessToken, fields: 'id,name' },
    });

    const platformUserId = debugResponse.data.id;

    return this.prisma.linkedAccount.create({
      data: {
        userId,
        platform: 'FACEBOOK',
        platformUserId,
        accessToken,
        scopes: process.env.META_SCOPES || 'pages_show_list,pages_manage_posts',
        tokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  } catch (error: any) {
    console.error('Facebook linkAccount error:', error.response?.data || error.message);
    throw new Error(`Failed to link Facebook account: ${error.response?.data?.error?.message || error.message}`);
  }
}


  async refreshToken(accountId: string) {
    const account = await this.prisma.linkedAccount.findUnique({ where: { id: accountId } });
    if (!account) throw new Error('Account not found');

    const refreshResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_CLIENT_ID,
        client_secret: process.env.META_CLIENT_SECRET,
        fb_exchange_token: account.accessToken,
      },
    });

    return this.prisma.linkedAccount.update({
      where: { id: accountId },
      data: {
        accessToken: refreshResponse.data.access_token,
        tokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  }
}
