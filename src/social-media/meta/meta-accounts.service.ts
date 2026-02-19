import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Platform } from '@prisma/client';
import axios, { AxiosError } from 'axios';

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookUserResponse {
  id: string;
  name: string;
}

@Injectable()
export class MetaAccountsService {
  constructor(private readonly prisma: PrismaClient) {}

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
        throw new InternalServerErrorException('Missing Meta environment variables');
      }

      const tokenResponse = await axios.get<FacebookTokenResponse>(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        {
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            code,
          },
        },
      );

      if (!tokenResponse.data.access_token) {
        throw new InternalServerErrorException('No access token returned from Facebook');
      }

      const accessToken = tokenResponse.data.access_token;

      const userResponse = await axios.get<FacebookUserResponse>(
        'https://graph.facebook.com/me',
        {
          params: {
            access_token: accessToken,
            fields: 'id,name',
          },
        },
      );

      const platformUserId = userResponse.data.id;

      return this.prisma.linkedAccount.create({
        data: {
          userId,
          platform: Platform.FACEBOOK,
          platformUserId,
          accessToken,
          scopes: process.env.META_SCOPES ?? 'pages_show_list,pages_manage_posts',
          tokenExpiry: new Date(Date.now() + tokenResponse.data.expires_in * 1000),
        },
      });
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      const message =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'Unknown Facebook error';

      throw new InternalServerErrorException(
        `Failed to link Facebook account: ${message}`,
      );
    }
  }

  async refreshToken(accountId: string) {
    const account = await this.prisma.linkedAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    try {
      const refreshResponse = await axios.get<FacebookTokenResponse>(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: process.env.META_CLIENT_ID,
            client_secret: process.env.META_CLIENT_SECRET,
            fb_exchange_token: account.accessToken,
          },
        },
      );

      return this.prisma.linkedAccount.update({
        where: { id: accountId },
        data: {
          accessToken: refreshResponse.data.access_token,
          tokenExpiry: new Date(
            Date.now() + refreshResponse.data.expires_in * 1000,
          ),
        },
      });
    } catch (error) {
      const axiosError = error as AxiosError<any>;

      const message =
        axiosError.response?.data?.error?.message ||
        axiosError.message ||
        'Unknown refresh error';

      throw new InternalServerErrorException(
        `Failed to refresh Facebook token: ${message}`,
      );
    }
  }
}
