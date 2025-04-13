import { Context as ContextTelegraf } from 'telegraf';
export interface Context extends ContextTelegraf {
  session: {
    type?: 'VK' | 'TG';
    vkUserId?: number;
    vkAccessToken?: string;
    vkRefreshToken?: string;
    vkExpiresIn?: number;
    vkCreatedAt?: number;
  };
}
