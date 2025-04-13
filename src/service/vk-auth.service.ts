import { Injectable } from '@nestjs/common';
import { VKAuth } from '../interface/vk-auth.interface';
import { Context } from 'src/interface/context.interface';

@Injectable()
export class VKAuthService {
  getAuthUrl(): string {
    return 'https://eventa-smm.netlify.app/';
  }

  setTokens(authData: VKAuth, ctx: Context) {
    ctx.session.vkUserId = authData.user_id;
    ctx.session.vkAccessToken = authData.access_token;
    ctx.session.vkRefreshToken = authData.refresh_token;
    ctx.session.vkExpiresIn = authData.expires_in;

    return ctx;
  }
}
